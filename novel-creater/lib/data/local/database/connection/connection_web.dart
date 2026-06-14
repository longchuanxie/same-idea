import 'dart:collection';

import 'package:drift/drift.dart';

/// In-memory [QueryExecutor] for Web platform.
///
/// Stores data in Dart [Map]s. Data is NOT persisted across page reloads.
/// All operations complete synchronously to avoid blocking the UI thread.
class WebMemoryExecutor implements TransactionExecutor {
  WebMemoryExecutor();

  /// Table name -> list of rows (each row is a column-name-to-value map).
  final HashMap<String, List<Map<String, Object?>>> _store = HashMap();
  int _lastInsertRowId = 0;
  int _schemaVersion = 0;
  bool _isOpen = false;

  @override
  SqlDialect get dialect => SqlDialect.sqlite;

  @override
  bool get supportsNestedTransactions => false;

  @override
  Future<bool> ensureOpen(QueryExecutorUser user) async {
    if (_isOpen) return true;
    // Set _isOpen BEFORE calling beforeOpen to prevent recursive calls.
    // During beforeOpen, Drift calls customStatement → doWhenOpened → ensureOpen.
    // Without this early flag, ensureOpen would re-enter beforeOpen infinitely.
    _isOpen = true;
    _schemaVersion = user.schemaVersion;
    try {
      await user.beforeOpen(
        this,
        OpeningDetails(null, user.schemaVersion),
      );
      return true;
    } catch (e) {
      _isOpen = false;
      _schemaVersion = 0;
      rethrow;
    }
  }

  @override
  Future<List<Map<String, Object?>>> runSelect(
    String statement,
    List<Object?> args,
  ) async {
    final upper = statement.toUpperCase().trim();

    // Handle PRAGMA statements that return data
    if (upper.startsWith('PRAGMA')) {
      if (upper.contains('USER_VERSION')) {
        return [{'user_version': _schemaVersion}];
      }
      if (upper.contains('FOREIGN_KEYS')) {
        return [{'foreign_keys': 1}];
      }
      if (upper.contains('TABLE_INFO')) {
        // Return empty table info — Drift uses this for schema introspection
        return [];
      }
      return [];
    }

    // Handle SQLite system functions
    if (upper.contains('LAST_INSERT_ROWID')) {
      return [{'last_insert_rowid': _lastInsertRowId}];
    }
    if (upper.contains('SQLITE_VERSION')) {
      return [{'sqlite_version': '3.39.0 (memory)'}];
    }
    if (upper.contains('CHANGES') || upper.contains('TOTAL_CHANGES')) {
      return [{'changes': 0, 'total_changes': 0}];
    }

    // Handle sqlite_master queries (table existence checks, schema info)
    if (upper.contains('SQLITE_MASTER') || upper.contains('SQLITE_SEQUENCE')) {
      final rows = <Map<String, Object?>>[];
      for (final tableName in _store.keys) {
        rows.add({
          'type': 'table',
          'name': tableName,
          'tbl_name': tableName,
          'rootpage': 1,
          'sql': 'CREATE TABLE $tableName (...)',
        });
      }
      return rows;
    }

    final table = _extractTable(statement);
    if (table == null || !_store.containsKey(table)) {
      return [];
    }

    var rows = _store[table]!;
    final where = _extractWhere(statement);

    if (where != null && args.isNotEmpty) {
      rows = rows.where((r) => _matchRow(r, where, args)).toList();
    }

    // Apply ORDER BY if present
    final orderCol = _extractOrderColumn(statement);
    if (orderCol != null) {
      final desc = statement.toUpperCase().contains(' $orderCol DESC') ||
          statement.toUpperCase().endsWith(' DESC');
      rows.sort((a, b) {
        final av = (a[orderCol] ?? '').toString();
        final bv = (b[orderCol] ?? '').toString();
        return desc ? bv.compareTo(av) : av.compareTo(bv);
      });
    }

    // Return copies to avoid mutation issues
    return rows.map((r) => Map<String, Object?>.from(r)).toList();
  }

  @override
  Future<int> runInsert(String statement, List<Object?> args) async {
    final table = _extractTable(statement, 'INTO');
    if (table == null) return 0;

    _store.putIfAbsent(table, () => <Map<String, Object?>>[]);

    final cols = _extractColumns(statement);
    final row = <String, Object?>{};
    for (var i = 0; i < cols.length; i++) {
      row[cols[i]] = i < args.length ? args[i] : null;
    }
    _store[table]!.add(row);
    _lastInsertRowId = _store[table]!.length;
    return _lastInsertRowId;
  }

  @override
  Future<int> runUpdate(String statement, List<Object?> args) async {
    final table = _extractTable(statement, '');
    if (table == null || !_store.containsKey(table)) return 0;
    final upper = statement.toUpperCase();
    final idx = upper.indexOf('UPDATE ') + 7;
    final rest = statement.substring(idx).trim();
    final spaceIdx = rest.indexOf(RegExp(r'[\s(]'));
    final actualTable = _unquote(spaceIdx > 0 ? rest.substring(0, spaceIdx) : rest);

    final rows = _store[actualTable];
    if (rows == null || rows.isEmpty) return 0;

    // Parse SET clause
    final setStart = upper.indexOf('SET ') + 4;
    final whereStart = upper.indexOf(' WHERE ');
    final setEndIdx = whereStart > 0 ? whereStart : statement.length;
    final setClause = statement.substring(setStart, setEndIdx);

    final updates = <String, Object?>{};
    int argIdx = 0;
    for (final part in setClause.split(',')) {
      final eq = part.indexOf('=');
      if (eq > 0) {
        updates[_unquote(part.substring(0, eq).trim())] =
            argIdx < args.length ? args[argIdx++] : null;
      }
    }

    // Apply WHERE filter if present
    final whereArgsStart = argIdx;
    if (whereStart > 0) {
      final where = _extractWhere(statement);
      var count = 0;
      for (final row in rows) {
        if (where != null && _matchRow(row, where, args.sublist(whereArgsStart))) {
          row.addAll(updates);
          count++;
        }
      }
      return count;
    }

    for (final row in rows) {
      row.addAll(updates);
    }
    return rows.length;
  }

  @override
  Future<int> runDelete(String statement, List<Object?> args) async {
    final table = _extractTable(statement, 'FROM');
    if (table == null || !_store.containsKey(table)) return 0;
    final where = _extractWhere(statement);
    if (where != null && args.isNotEmpty) {
      final original = _store[table]!;
      final toRemove = original
          .where((r) => _matchRow(r, where, args))
          .toList();
      for (final row in toRemove) {
        original.remove(row);
      }
      return toRemove.length;
    }
    final count = _store[table]!.length;
    _store[table]!.clear();
    return count;
  }

  @override
  Future<void> runCustom(String statement, [List<Object?>? args]) async {
    final upper = statement.trim().toUpperCase();
    if (upper.startsWith('PRAGMA')) {
      // Handle PRAGMA user_version = N to track schema version
      final versionMatch = RegExp(
        r'PRAGMA\s+user_version\s*=\s*(\d+)',
        caseSensitive: false,
      ).firstMatch(statement);
      if (versionMatch != null) {
        _schemaVersion = int.parse(versionMatch.group(1)!);
      }
      return;
    }
    if (upper.startsWith('CREATE TABLE') ||
        upper.startsWith('CREATE UNIQUE INDEX') ||
        upper.startsWith('CREATE INDEX')) {
      final match = RegExp(
        r'(?:TABLE|INDEX)\s+(?:IF\s+NOT\s+EXISTS\s+)?"?(\w+)"?',
        caseSensitive: false,
      ).firstMatch(statement);
      if (match != null) {
        _store.putIfAbsent(match.group(1)!, () => <Map<String, Object?>>[]);
      }
    }
  }

  @override
  Future<void> runBatched(BatchedStatements batched) async {
    for (var i = 0; i < batched.statements.length; i++) {
      final sql = batched.statements[i];
      for (final argSet
          in batched.arguments.where((a) => a.statementIndex == i)) {
        await _exec(sql, argSet.arguments);
      }
    }
  }

  @override
  TransactionExecutor beginTransaction() => this;

  @override
  QueryExecutor beginExclusive() => this;

  @override
  Future<void> send() async {}

  @override
  Future<void> rollback() async {}

  @override
  Future<void> close() async => _store.clear();

  Future<void> _exec(String sql, List<Object?> args) async {
    final u = sql.trim().toUpperCase();
    if (u.startsWith('SELECT')) {
      await runSelect(sql, args);
    } else if (u.startsWith('INSERT')) {
      await runInsert(sql, args);
    } else if (u.startsWith('UPDATE')) {
      await runUpdate(sql, args);
    } else if (u.startsWith('DELETE')) {
      await runDelete(sql, args);
    } else {
      await runCustom(sql, args);
    }
  }

  bool _matchRow(Map<String, Object?> row, String where, List<Object?> args) {
    final conds = where.split(RegExp(r'\bAND\b', caseSensitive: false));
    int ai = 0;
    for (final c in conds) {
      final trimmed = c.trim();
      if (trimmed.isEmpty) continue;

      // Handle IN operator: col IN (?, ?, ...)
      final inMatch = RegExp(r'"?(\w+)"?\s+IN\s*\(', caseSensitive: false)
          .firstMatch(trimmed);
      if (inMatch != null) {
        final col = inMatch.group(1)!;
        final val = (row[col] ?? '').toString();
        // Count placeholders in this IN clause
        final placeholderCount = '('.allMatches(trimmed).isEmpty
            ? 0
            : trimmed.split('?').length - 1;
        bool found = false;
        for (var j = 0; j < placeholderCount && ai < args.length; j++) {
          if (val == args[ai].toString()) found = true;
          ai++;
        }
        if (!found) return false;
        continue;
      }

      // Handle != operator: col != ?
      final neqMatch = RegExp(r'"?(\w+)"?\s*!=\s*\?', caseSensitive: false)
          .firstMatch(trimmed);
      if (neqMatch != null && ai < args.length) {
        final col = neqMatch.group(1)!;
        final val = (row[col] ?? '').toString();
        final pat = args[ai++].toString();
        if (val == pat) return false;
        continue;
      }

      // Handle IS NULL / IS NOT NULL
      if (trimmed.toUpperCase().contains('IS NULL')) {
        final m = RegExp(r'"?(\w+)"?\s+IS\s+NULL', caseSensitive: false)
            .firstMatch(trimmed);
        if (m != null) {
          final col = m.group(1)!;
          if (row[col] != null) return false;
        }
        continue;
      }
      if (trimmed.toUpperCase().contains('IS NOT NULL')) {
        final m = RegExp(r'"?(\w+)"?\s+IS\s+NOT\s+NULL', caseSensitive: false)
            .firstMatch(trimmed);
        if (m != null) {
          final col = m.group(1)!;
          if (row[col] == null) return false;
        }
        continue;
      }

      // Handle LIKE and = operators
      final m = RegExp(r'"?(\w+)"?\s*(?:LIKE|=)\s*\?', caseSensitive: false)
          .firstMatch(trimmed);
      if (m != null && ai < args.length) {
        final col = m.group(1)!;
        final val = (row[col] ?? '').toString();
        final pat = args[ai++].toString();
        if (trimmed.toUpperCase().contains('LIKE')) {
          final re = pat.replaceAll('%', '.*').replaceAll('_', '.');
          if (!RegExp(re, caseSensitive: false).hasMatch(val)) return false;
        } else {
          if (val != pat) return false;
        }
      }
    }
    return true;
  }

  static String? _extractTable(String sql, [String? keyword]) {
    final upper = sql.toUpperCase();
    final kw = keyword ?? 'FROM';
    final idx = upper.indexOf(kw);
    if (idx < 0) return null;
    final after = sql.substring(idx + kw.length).trim();
    final sp = after.indexOf(RegExp(r'[\s,(]'));
    final raw = sp > 0 ? after.substring(0, sp) : (after.isNotEmpty ? after : null);
    return raw != null ? _unquote(raw) : null;
  }

  static String? _extractWhere(String sql) {
    final idx = sql.toUpperCase().indexOf(' WHERE ');
    return idx < 0 ? null : sql.substring(idx + 7);
  }

  static String? _extractOrderColumn(String sql) {
    final idx = sql.toUpperCase().lastIndexOf('ORDER BY ');
    if (idx < 0) return null;
    final rest = sql.substring(idx + 9).trim();
    final sp = rest.indexOf(RegExp(r'\s'));
    return sp > 0 ? rest.substring(0, sp) : rest;
  }

  static List<String> _extractColumns(String sql) {
    final vi = sql.toUpperCase().indexOf('VALUES');
    if (vi < 0) return [];
    final ps = sql.indexOf('(');
    if (ps < 0) return [];
    const pe = ')';
    final end = sql.indexOf(pe, ps);
    if (end < 0) return [];
    return sql
        .substring(ps + 1, end)
        .split(',')
        .map((s) => s.trim())
        // Strip surrounding quotes (Drift uses "col" quoting)
        .map((s) => _unquote(s))
        .toList();
  }

  /// Remove surrounding double-quotes from SQL identifiers.
  static String _unquote(String s) {
    if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
      return s.substring(1, s.length - 1);
    }
    return s;
  }
}

/// Opens an in-memory database connection for Web platform.
QueryExecutor openConnection() => WebMemoryExecutor();
