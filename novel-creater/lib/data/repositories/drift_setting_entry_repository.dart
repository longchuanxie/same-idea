import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/setting_entry_mapper.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/repositories/setting_entry_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftSettingEntryRepository implements SettingEntryRepository {
  DriftSettingEntryRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    SettingEntryMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const SettingEntryMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final SettingEntryMapper _mapper;

  @override
  Future<AppResult<SettingEntry>> create(SettingEntry entry) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.settingEntries).insert(_mapper.toRow(entry));
        return AppResult<SettingEntry>.success(entry);
      });

  @override
  Future<AppResult<List<SettingEntry>>> list(String projectId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.settingEntries)
              ..where((t) => t.projectId.equals(projectId))
              ..orderBy([(t) => OrderingTerm.asc(t.title)]))
            .get();
        return AppResult<List<SettingEntry>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<SettingEntry?>> get(String id) =>
      _errorMapper.wrapAsync(() async {
        final row = await (_db.select(_db.settingEntries)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        return AppResult<SettingEntry?>.success(
          row == null ? null : _mapper.fromRow(row),
        );
      });

  @override
  Future<AppResult<SettingEntry>> update(SettingEntry entry) =>
      _errorMapper.wrapAsync(() async {
        final updated = entry.copyWith(
          updatedAt: DateTime.now().toUtc(),
        );
        final count = await (_db.update(_db.settingEntries)
              ..where((t) => t.id.equals(entry.id)))
            .write(
          SettingEntriesCompanion(
            title: Value(updated.title),
            content: Value(updated.content),
            category: Value(updated.category.name),
            tagsJson: Value(jsonEncode(updated.tags)),
            updatedAt: Value(updated.updatedAt.millisecondsSinceEpoch),
          ),
        );
        if (count == 0) {
          return const AppResult<SettingEntry>.failure(
            AppError(
              code: 'database.not_found',
              message: 'SettingEntry not found.',
              userMessage: '未找到设定条目。',
              source: AppErrorSource.storage,
            ),
          );
        }
        return AppResult<SettingEntry>.success(updated);
      });

  @override
  Future<AppResult<void>> delete(String id) => _errorMapper.wrapAsync(() async {
        final count = await (_db.delete(_db.settingEntries)
              ..where((t) => t.id.equals(id)))
            .go();
        if (count == 0) {
          return const AppResult<void>.failure(
            AppError(
              code: 'database.not_found',
              message: 'SettingEntry not found.',
              userMessage: '未找到设定条目。',
              source: AppErrorSource.storage,
            ),
          );
        }
        return const AppResult<void>.success(null);
      });
}
