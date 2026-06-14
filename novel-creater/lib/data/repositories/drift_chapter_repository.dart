import 'package:drift/drift.dart';
import 'package:novel_creator/core/text_metrics.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/errors/drift_error_mapper.dart';
import 'package:novel_creator/data/local/mappers/chapter_mapper.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';
import 'package:novel_creator/domain/repositories/chapter_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class DriftChapterRepository implements ChapterRepository {
  DriftChapterRepository(
    this._db, {
    DriftErrorMapper? errorMapper,
    ChapterMapper? mapper,
  })  : _errorMapper = errorMapper ?? const DriftErrorMapper(),
        _mapper = mapper ?? const ChapterMapper();

  final AppDatabase _db;
  final DriftErrorMapper _errorMapper;
  final ChapterMapper _mapper;

  @override
  Future<AppResult<Chapter>> create(Chapter chapter) =>
      _errorMapper.wrapAsync(() async {
        await _db.into(_db.chapters).insert(_mapper.toRow(chapter));
        return AppResult<Chapter>.success(chapter);
      });

  @override
  Future<AppResult<List<Chapter>>> list(String projectId) =>
      _errorMapper.wrapAsync(() async {
        final rows = await (_db.select(_db.chapters)
              ..where((t) => t.projectId.equals(projectId))
              ..orderBy([(t) => OrderingTerm.asc(t.createdAt)]))
            .get();
        return AppResult<List<Chapter>>.success(
          rows.map(_mapper.fromRow).toList(),
        );
      });

  @override
  Future<AppResult<Chapter?>> get(String id) =>
      _errorMapper.wrapAsync(() async {
        final row = await (_db.select(_db.chapters)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        return AppResult<Chapter?>.success(
          row == null ? null : _mapper.fromRow(row),
        );
      });

  @override
  Future<AppResult<Chapter>> saveContent({
    required String id,
    required String markdownContent,
    required String plainTextCache,
  }) =>
      _errorMapper.wrapAsync(() async {
        final now = DateTime.now().toUtc();
        final wordCount = TextMetrics.countCharacters(plainTextCache);
        final count = await (_db.update(_db.chapters)
              ..where((t) => t.id.equals(id)))
            .write(
          ChaptersCompanion(
            markdownContent: Value(markdownContent),
            plainTextCache: Value(plainTextCache),
            wordCount: Value(wordCount),
            updatedAt: Value(now.millisecondsSinceEpoch),
          ),
        );
        if (count == 0) {
          return const AppResult<Chapter>.failure(
            AppError(
              code: 'database.not_found',
              message: 'Chapter not found.',
              userMessage: '未找到章节。',
              source: AppErrorSource.storage,
              recoverable: true,
            ),
          );
        }
        final row = await (_db.select(_db.chapters)
              ..where((t) => t.id.equals(id)))
            .getSingle();
        return AppResult<Chapter>.success(_mapper.fromRow(row));
      });

  @override
  Future<AppResult<Chapter>> updateStatus({
    required String id,
    required ChapterStatus status,
  }) =>
      _errorMapper.wrapAsync(() async {
        final currentRow = await (_db.select(_db.chapters)
              ..where((t) => t.id.equals(id)))
            .getSingleOrNull();
        if (currentRow == null) {
          return const AppResult<Chapter>.failure(
            AppError(
              code: 'chapter.not_found',
              message: 'Chapter not found.',
              userMessage: '未找到章节，无法更新状态。',
              source: AppErrorSource.storage,
              recoverable: true,
            ),
          );
        }

        final currentChapter = _mapper.fromRow(currentRow);
        final validationError = currentChapter.validateTransition(status);
        if (validationError != null) {
          return AppResult<Chapter>.failure(
            AppError(
              code: 'chapter.invalid_transition',
              message: validationError,
              userMessage: '章节状态转换无效：$validationError',
              source: AppErrorSource.storage,
              recoverable: false,
            ),
          );
        }

        final now = DateTime.now().toUtc();
        await (_db.update(_db.chapters)..where((t) => t.id.equals(id))).write(
          ChaptersCompanion(
            status: Value(status.name),
            updatedAt: Value(now.millisecondsSinceEpoch),
          ),
        );

        final updatedRow = await (_db.select(_db.chapters)
              ..where((t) => t.id.equals(id)))
            .getSingle();
        return AppResult<Chapter>.success(_mapper.fromRow(updatedRow));
      });
}
