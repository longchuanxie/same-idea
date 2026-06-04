import 'package:novel_creator/agent/tools/tools.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/content_hash.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/core/text_metrics.dart';
import 'package:novel_creator/domain/domain.dart';

class RevisionService {
  const RevisionService({
    required ChapterRepository chapterRepository,
    required RevisionRepository revisionRepository,
    required IdGenerator idGenerator,
    required AppClock clock,
  })  : _chapterRepository = chapterRepository,
        _revisionRepository = revisionRepository,
        _idGenerator = idGenerator,
        _clock = clock;

  final ChapterRepository _chapterRepository;
  final RevisionRepository _revisionRepository;
  final IdGenerator _idGenerator;
  final AppClock _clock;

  Future<AppResult<Revision>> createPendingFromSuggestion(
    WritingRevisionSuggestion suggestion, {
    RevisionSource source = RevisionSource.agent,
  }) async {
    final chapterResult =
        await _chapterRepository.getById(suggestion.chapterId);
    if (chapterResult.isFailure) {
      return AppResult.failure(chapterResult.maybeFailure!);
    }

    final chapter = chapterResult.maybeSuccess!;
    final now = _clock.now();
    final metadata = suggestion.metadata.copyWith(
      baseContentHash: stableContentHash(chapter.content),
    );
    final revision = Revision(
      id: _idGenerator.generate(),
      projectId: chapter.projectId,
      chapterId: chapter.id,
      operation: suggestion.operation,
      anchor: suggestion.anchor,
      beforeText: suggestion.beforeText,
      afterText: suggestion.afterText,
      source: source,
      metadata: metadata,
      createdAt: now,
      updatedAt: now,
    );
    return _revisionRepository.create(revision);
  }

  Future<AppResult<Revision>> accept(String revisionId) async {
    final revisionResult = await _revisionRepository.getById(revisionId);
    if (revisionResult.isFailure) {
      return AppResult.failure(revisionResult.maybeFailure!);
    }

    final revision = revisionResult.maybeSuccess!;
    final pendingError = _ensurePending(revision);
    if (pendingError != null) {
      return AppResult.failure(pendingError);
    }

    final chapterResult = await _chapterRepository.getById(revision.chapterId);
    if (chapterResult.isFailure) {
      return AppResult.failure(chapterResult.maybeFailure!);
    }

    final chapter = chapterResult.maybeSuccess!;
    final conflict = detectConflict(revision, chapter.content);
    if (conflict != null) {
      return AppResult.failure(conflict);
    }

    final applyResult = _applyRevision(revision, chapter.content);
    if (applyResult.isFailure) {
      return AppResult.failure(applyResult.maybeFailure!);
    }

    final now = _clock.now();
    final content = applyResult.maybeSuccess!;
    final plainText = plainTextFromMarkdown(content);
    final updatedChapter = chapter.copyWith(
      content: content,
      plainTextCache: plainText,
      wordCount: countWritingUnits(content),
      updatedAt: now,
    );
    final chapterUpdate = await _chapterRepository.update(updatedChapter);
    if (chapterUpdate.isFailure) {
      return AppResult.failure(chapterUpdate.maybeFailure!);
    }

    final accepted = revision.copyWith(
      status: RevisionStatus.accepted,
      resolvedAt: now,
      updatedAt: now,
    );
    return _revisionRepository.update(accepted);
  }

  Future<AppResult<Revision>> reject(String revisionId) async {
    final revisionResult = await _revisionRepository.getById(revisionId);
    if (revisionResult.isFailure) {
      return AppResult.failure(revisionResult.maybeFailure!);
    }

    final revision = revisionResult.maybeSuccess!;
    final pendingError = _ensurePending(revision);
    if (pendingError != null) {
      return AppResult.failure(pendingError);
    }

    final now = _clock.now();
    return _revisionRepository.update(
      revision.copyWith(
        status: RevisionStatus.rejected,
        resolvedAt: now,
        updatedAt: now,
      ),
    );
  }

  Future<AppResult<Revision>> supersede(String revisionId) async {
    final revisionResult = await _revisionRepository.getById(revisionId);
    if (revisionResult.isFailure) {
      return AppResult.failure(revisionResult.maybeFailure!);
    }

    final revision = revisionResult.maybeSuccess!;
    final pendingError = _ensurePending(revision);
    if (pendingError != null) {
      return AppResult.failure(pendingError);
    }

    final now = _clock.now();
    return _revisionRepository.update(
      revision.copyWith(
        status: RevisionStatus.superseded,
        resolvedAt: now,
        updatedAt: now,
      ),
    );
  }

  AppError? detectConflict(Revision revision, String currentContent) {
    final baseHash = revision.metadata?.baseContentHash;
    if (baseHash == null || baseHash.isEmpty) {
      return null;
    }
    final currentHash = stableContentHash(currentContent);
    if (baseHash == currentHash) {
      return null;
    }
    return const AppError(
      code: 'REVISION_CONFLICT',
      message: 'Chapter content changed after revision was created',
      userMessage: '正文已在修订生成后发生变化，请重新生成或手动处理该修订。',
      source: AppErrorSource.editor,
    );
  }

  AppResult<String> _applyRevision(Revision revision, String content) {
    final offset = revision.anchor.offset;
    if (offset < 0 || offset > content.length) {
      return const AppResult.failure(
        AppError(
          code: 'REVISION_ANCHOR_OUT_OF_RANGE',
          message: 'Revision anchor is outside chapter content',
          userMessage: '修订位置已失效，请重新生成该修订。',
          source: AppErrorSource.editor,
        ),
      );
    }

    return switch (revision.operation) {
      RevisionOperation.insert => AppResult.success(
          content.replaceRange(offset, offset, revision.afterText),
        ),
      RevisionOperation.delete => _applyDelete(revision, content),
      RevisionOperation.replace => _applyReplace(revision, content),
    };
  }

  AppResult<String> _applyDelete(Revision revision, String content) {
    final beforeText = revision.beforeText;
    final length =
        beforeText.isNotEmpty ? beforeText.length : revision.anchor.length;
    final rangeError = _validateRange(revision.anchor.offset, length, content);
    if (rangeError != null) {
      return AppResult.failure(rangeError);
    }

    final current = content.substring(
      revision.anchor.offset,
      revision.anchor.offset + length,
    );
    if (beforeText.isNotEmpty && current != beforeText) {
      return const AppResult.failure(_textMismatchError);
    }
    return AppResult.success(
      content.replaceRange(
        revision.anchor.offset,
        revision.anchor.offset + length,
        '',
      ),
    );
  }

  AppResult<String> _applyReplace(Revision revision, String content) {
    final beforeText = revision.beforeText;
    final length =
        beforeText.isNotEmpty ? beforeText.length : revision.anchor.length;
    final rangeError = _validateRange(revision.anchor.offset, length, content);
    if (rangeError != null) {
      return AppResult.failure(rangeError);
    }

    final current = content.substring(
      revision.anchor.offset,
      revision.anchor.offset + length,
    );
    if (beforeText.isNotEmpty && current != beforeText) {
      return const AppResult.failure(_textMismatchError);
    }
    return AppResult.success(
      content.replaceRange(
        revision.anchor.offset,
        revision.anchor.offset + length,
        revision.afterText,
      ),
    );
  }

  AppError? _validateRange(int offset, int length, String content) {
    if (length < 0 || offset + length > content.length) {
      return const AppError(
        code: 'REVISION_ANCHOR_OUT_OF_RANGE',
        message: 'Revision anchor range is outside chapter content',
        userMessage: '修订范围已失效，请重新生成该修订。',
        source: AppErrorSource.editor,
      );
    }
    return null;
  }

  AppError? _ensurePending(Revision revision) {
    if (revision.status == RevisionStatus.pending) {
      return null;
    }
    return const AppError(
      code: 'REVISION_NOT_PENDING',
      message: 'Only pending revisions can be resolved',
      userMessage: '该修订已处理，不能重复操作。',
      recoverable: false,
      source: AppErrorSource.editor,
    );
  }

  static const _textMismatchError = AppError(
    code: 'REVISION_TEXT_MISMATCH',
    message: 'Text at revision anchor does not match beforeText',
    userMessage: '修订位置的原文已变化，请重新生成或手动处理该修订。',
    source: AppErrorSource.editor,
  );
}
