import 'dart:collection';

import 'package:drift/backends.dart';
import 'package:drift/drift.dart';

/// In-memory [QueryExecutor] for Web platform.
///
/// Provides basic SQL execution using Dart Maps.
/// Data is NOT persisted across page reloads.
class WebMemoryExecutor implements TransactionExecutor {
  WebMemoryExecutor();

  final HashMap<String, List<HashMap<String, Object?>>> _tables =
      HashMap<String, List<HashMap<String, Object?>>>();
  bool _isOpen = false;

  @override
  SqlDialect get dialect => SqlDialect.sqlite;

  @override
  bool get supportsNestedTransactions => false;

  @override
  Future<bool> ensureOpen(QueryExecutorUser user) async {
    if (!_isOpen) {
      _isOpen = true;
      await user.beforeOpen(this, const OpeningDetails(null, 0));
    }
    return true;
  }

  @override
  Future<void> runCustom(
    String statement, [
    List<Object?>? args,
  ]) async {
    final trimmed = statement.trim();
    if (trimmed.toUpperCase().startsWith('PRAGMA')) return;
    if (trimmed.toUpperCase().startsWith('CREATE TABLE') ||
        trimmed.toUpperCase().startsWith('CREATE INDEX') ||
        trimmed.toUpperCase().startsWith('CREATE UNIQUE')) {
      _handleCreateTable(trimmed);
    }
  }

  @override
  Future<List<Map<String, Object?>>> runSelect(
    String statement,
    List<Object?> args,
  ) async {
    final tableName = _extractTableName(statement, 'FROM');
    if (tableName == null) return [];

    var rows = _tables[tableName] ?? <HashMap<String, Object?>>[];

    // Apply WHERE clause filtering (basic LIKE / equality)
    final whereClause = _extractWhereClause(statement);
    if (whereClause != null && args.isNotEmpty) {
      rows = rows.where((row) => _matchWhere(row, whereClause, args)).toList();
    }

    // Apply ORDER BY
    final orderBy = _extractOrderByCol(statement);
    if (orderBy != null) {
      final isAsc = !statement.toUpperCase().contains(RegExp(r'ORDER\s+BY\s+\w+\s+DESC'));
      rows.sort((a, b) {
        final aVal = a[orderBy]?.toString() ?? '';
        final bVal = b[orderBy]?.toString() ?? '';
        return isAsc ? aVal.compareTo(bVal) : bVal.compareTo(aVal);
      });
    }

    return rows.map((row) => Map<String, Object?>.from(row)).toList();
  }

  @override
  Future<int> runInsert(
    String statement,
    List<Object?> args,
  ) async {
    final tableName = _extractTableName(statement, 'INTO');
    if (tableName == null) return 0;

    _tables.putIfAbsent(tableName, () => <HashMap<String, Object?>>[]);

    final columns = _extractColumnNames(statement);
    final row = HashMap<String, Object?>();

    for (var i = 0; i < columns.length; i++) {
      row[columns[i]] = args.length > i ? args[i] : null;
    }

    _tables[tableName]!.add(row);
    return 1;
  }

  @override
  Future<int> runUpdate(
    String statement,
    List<Object?> args,
  ) async {
    final upper = statement.toUpperCase();
    final idx = upper.indexOf('UPDATE ');
    if (idx < 0) return 0;

    final afterUpdate = statement.substring(idx + 7).trim();
    final tableEnd = afterUpdate.indexOf(' ');
    final actualTable = tableEnd > 0 ? afterUpdate.substring(0, tableEnd) : afterUpdate;

    final rows = _tables[actualTable];
    if (rows == null || rows.isEmpty) return 0;

    final setStart = upper.indexOf('SET ') + 4;
    final whereStart = upper.indexOf(' WHERE ');
    final setClause = whereStart > 0
        ? statement.substring(setStart, whereStart)
        : statement.substring(setStart);

    final setParts = setClause.split(',');
    final updates = <String, Object?>{};
    int argIndex = 0;

    for (final part in setParts) {
      final eqIdx = part.indexOf('=');
      if (eqIdx > 0) {
        final col = part.substring(0, eqIdx).trim();
        updates[col] = argIndex < args.length ? args[argIndex++] : null;
      }
    }

    for (final row in rows) {
      row.addAll(updates);
    }
    return rows.length;
  }

  @override
  Future<int> runDelete(
    String statement,
    List<Object?> args,
  ) async {
    final tableName = _extractTableName(statement, 'FROM');
    if (tableName == null) return 0;

    final rows = _tables[tableName];
    if (rows == null || rows.isEmpty) return 0;

    final count = rows.length;
    rows.clear();
    return count;
  }

  @override
  Future<void> runBatched(BatchedStatements batched) async {
    for (var i = 0; i < batched.statements.length; i++) {
      final sql = batched.statements[i];
      for (final argSet in batched.arguments.where((a) => a.statementIndex == i)) {
        await _executeByType(sql, argSet.arguments);
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
  Future<void> close() async {
    _isOpen = false;
    _tables.clear();
  }

  Future<void> _executeByType(String sql, List<Object?> args) async {
    final upper = sql.trim().toUpperCase();
    if (upper.startsWith('SELECT')) {
      await runSelect(sql, args);
    } else if (upper.startsWith('INSERT')) {
      await runInsert(sql, args);
    } else if (upper.startsWith('UPDATE')) {
      await runUpdate(sql, args);
    } else if (upper.startsWith('DELETE')) {
      await runDelete(sql, args);
    } else {
      await runCustom(sql, args);
    }
  }

  void _handleCreateTable(String statement) {
    final match = RegExp(
      r'CREATE\s+(?:UNIQUE\s+)?(?:INDEX\s|TABLE\s)(?:IF\s+NOT\s+EXISTS\s+)?(\w+)',
      caseSensitive: false,
    ).firstMatch(statement);
    if (match != null) {
      final tableName = match.group(1)!;
      _tables.putIfAbsent(tableName, () => <HashMap<String, Object?>>[]);
    }
  }

  bool _matchWhere(
    HashMap<String, Object?> row,
    String whereClause,
    List<Object?> args,
  ) {
    // Simple LIKE or equality matching
    final conditions = whereClause.split(RegExp(r'\bAND\b', caseSensitive: false));
    var argIdx = 0;

    for (final cond in conditions) {
      final trimmed = cond.trim();
      if (argIdx >= args.length) break;

      final colMatch = RegExp(r'(\w+)\s*(?:LIKE|=)\s*\?', caseSensitive: false).firstMatch(trimmed);
      if (colMatch != null) {
        final colName = colMatch.group(1)!;
        final val = row[colName]?.toString() ?? '';
        final pattern = args[argIdx++]?.toString() ?? '';

        if (trimmed.toUpperCase().contains('LIKE')) {
          // Simple LIKE support: %abc% matches anything containing abc
          final regexPattern = pattern.replaceAll('%', '.*').replaceAll('_', '.');
          if (!RegExp(regexPattern, caseSensitive: false).hasMatch(val)) {
            return false;
          }
        } else {
          if (val != pattern) return false;
        }
      }
    }
    return true;
  }

  static String? _extractTableName(String statement, String keyword) {
    final upper = statement.toUpperCase();
    final idx = upper.indexOf(keyword);
    if (idx < 0) return null;

    final afterKeyword = statement.substring(idx + keyword.length).trim();
    final spaceIdx = afterKeyword.indexOf(RegExp(r'[\s,(]'));
    if (spaceIdx <= 0) return afterKeyword;
    return afterKeyword.substring(0, spaceIdx);
  }

  static String? _extractWhereClause(String statement) {
    final upper = statement.toUpperCase();
    final idx = upper.indexOf('WHERE ');
    if (idx < 0) return null;
    return statement.substring(idx + 6);
  }

  static String? _extractOrderByCol(String statement) {
    final upper = statement.toUpperCase();
    final idx = upper.lastIndexOf('ORDER BY ');
    if (idx < 0) return null;
    final rest = statement.substring(idx + 9).trim();
    final spaceIdx = rest.indexOf(RegExp(r'\s'));
    return spaceIdx > 0 ? rest.substring(0, spaceIdx) : rest;
  }

  static List<String> _extractColumnNames(String statement) {
    final valuesIdx = statement.toUpperCase().indexOf('VALUES');
    if (valuesIdx < 0) return [];

    final parenStart = statement.indexOf('(');
    if (parenStart < 0) return [];

    final parenEnd = statement.indexOf(')', parenStart);
    if (parenEnd < 0) return [];

    return statement
        .substring(parenStart + 1, parenEnd)
        .split(',')
        .map((s) => s.trim())
        .toList();
  }
}
