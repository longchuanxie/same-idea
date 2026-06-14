import 'package:drift/drift.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/timeline_event_mapper.dart';
import 'package:novel_creator/domain/entities/timeline_event.dart';
import 'package:novel_creator/domain/repositories/timeline_event_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftTimelineEventRepository implements TimelineEventRepository {
  DriftTimelineEventRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    TimelineEventMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const TimelineEventMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final TimelineEventMapper _mapper;

  @override
  Future<AppResult<TimelineEvent>> create(TimelineEvent event) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.timelineEvents).insert(_mapper.toRow(event));
        return AppResult<TimelineEvent>.success(event);
      });

  @override
  Future<AppResult<List<TimelineEvent>>> listByCharacter(String characterId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.timelineEvents)
              ..where((t) => t.characterId.equals(characterId))
              ..orderBy([
                (t) => OrderingTerm.asc(t.chapterOrder),
                (t) => OrderingTerm.asc(t.createdAt),
              ]))
            .get();
        return AppResult<List<TimelineEvent>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<List<TimelineEvent>>> listByChapter(String chapterId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.timelineEvents)
              ..where((t) => t.chapterId.equals(chapterId))
              ..orderBy([
                (t) => OrderingTerm.asc(t.chapterOrder),
                (t) => OrderingTerm.asc(t.createdAt),
              ]))
            .get();
        return AppResult<List<TimelineEvent>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<List<TimelineEvent>>> listByProject(String projectId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.timelineEvents)
              ..where((t) => t.projectId.equals(projectId))
              ..orderBy([
                (t) => OrderingTerm.asc(t.chapterOrder),
                (t) => OrderingTerm.asc(t.createdAt),
              ]))
            .get();
        return AppResult<List<TimelineEvent>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<TimelineEvent>> update(TimelineEvent event) =>
      _errorMapper.wrapAsync(() async {
        final now = DateTime.now().toUtc();
        final count = await (_db.update(_db.timelineEvents)
              ..where((t) => t.id.equals(event.id)))
            .write(
          TimelineEventsCompanion(
            characterId: Value(event.characterId),
            chapterId: Value(event.chapterId),
            description: Value(event.description),
            chapterOrder: Value(event.chapterOrder),
            eventType: Value(event.eventType),
            relatedCharacterIdsJson:
                Value(_mapper.toRow(event).relatedCharacterIdsJson),
            updatedAt: Value(now.millisecondsSinceEpoch),
          ),
        );
        if (count == 0) {
          return const AppResult<TimelineEvent>.failure(
            AppError(
              code: 'timeline_event.not_found',
              message: 'Timeline event not found.',
              userMessage: '未找到时间线事件。',
              source: AppErrorSource.storage,
              recoverable: true,
              suggestedAction: '请刷新时间线后重试。',
            ),
          );
        }
        final row = await (_db.select(_db.timelineEvents)
              ..where((t) => t.id.equals(event.id)))
            .getSingle();
        return AppResult<TimelineEvent>.success(_mapper.fromRow(row));
      });

  @override
  Future<AppResult<void>> delete(String id) =>
      _errorMapper.wrapAsync(() async {
        await (_db.delete(_db.timelineEvents)
              ..where((t) => t.id.equals(id)))
            .go();
        return const AppResult<void>.success(null);
      });
}
