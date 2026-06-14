import 'package:novel_creator/core/text_metrics.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';
import 'package:novel_creator/domain/repositories/chapter_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemoryChapterRepository implements ChapterRepository {
  final Map<String, Chapter> _chapters = <String, Chapter>{};

  @override
  Future<AppResult<Chapter>> create(Chapter chapter) async {
    _chapters[chapter.id] = chapter;
    return AppResult<Chapter>.success(chapter);
  }

  @override
  Future<AppResult<Chapter?>> get(String id) async =>
      AppResult<Chapter?>.success(_chapters[id]);

  @override
  Future<AppResult<List<Chapter>>> list(String projectId) async {
    final chapters = _chapters.values
        .where((chapter) => chapter.projectId == projectId)
        .toList(growable: false);
    return AppResult<List<Chapter>>.success(
      List<Chapter>.unmodifiable(chapters),
    );
  }

  @override
  Future<AppResult<Chapter>> saveContent({
    required String id,
    required String markdownContent,
    required String plainTextCache,
  }) async {
    final chapter = _chapters[id];
    if (chapter == null) {
      return const AppResult<Chapter>.failure(
        AppError(
          code: 'chapter.not_found',
          message: 'Chapter was not found.',
          userMessage: '未找到章节，无法保存正文。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新章节列表后重试。',
        ),
      );
    }

    final saved = chapter.copyWith(
      markdownContent: markdownContent,
      plainTextCache: plainTextCache,
      wordCount: TextMetrics.countCharacters(plainTextCache),
      updatedAt: DateTime.now().toUtc(),
    );
    _chapters[id] = saved;
    return AppResult<Chapter>.success(saved);
  }

  @override
  Future<AppResult<Chapter>> updateStatus({
    required String id,
    required ChapterStatus status,
  }) async {
    final chapter = _chapters[id];
    if (chapter == null) {
      return const AppResult<Chapter>.failure(
        AppError(
          code: 'chapter.not_found',
          message: 'Chapter was not found.',
          userMessage: '未找到章节，无法更新状态。',
          source: AppErrorSource.storage,
          recoverable: true,
          suggestedAction: '请刷新章节列表后重试。',
        ),
      );
    }

    final validationError = chapter.validateTransition(status);
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

    final updated = chapter.copyWith(
      status: status,
      updatedAt: DateTime.now().toUtc(),
    );
    _chapters[id] = updated;
    return AppResult<Chapter>.success(updated);
  }
}
