import 'package:novel_creator/core/content_hash.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';

final class RevisionService {
  const RevisionService();

  AppResult<String> preview({
    required String baseContent,
    required RevisionPatch patch,
  }) =>
      _buildContent(baseContent: baseContent, patch: patch);

  AppResult<String> apply({
    required String baseContent,
    required RevisionPatch patch,
  }) =>
      _buildContent(baseContent: baseContent, patch: patch);

  AppResult<String> _buildContent({
    required String baseContent,
    required RevisionPatch patch,
  }) {
    if (contentHash(baseContent).toString() != patch.baseContentHash) {
      return const AppResult<String>.failure(
        AppError(
          code: 'revision.conflict',
          message: 'Revision base content hash does not match.',
          userMessage: '正文已发生变化，无法直接应用该修订。',
          source: AppErrorSource.editor,
          recoverable: true,
          suggestedAction: '请重新生成修订或进入冲突处理。',
        ),
      );
    }

    final startOffset = patch.anchor.startOffset;
    final endOffset = patch.anchor.endOffset;
    if (startOffset < 0 ||
        endOffset < startOffset ||
        endOffset > baseContent.length) {
      return const AppResult<String>.failure(
        AppError(
          code: 'revision.invalid_anchor',
          message: 'Revision anchor is outside the base content range.',
          userMessage: '修订位置无效，无法应用该修订。',
          source: AppErrorSource.editor,
          recoverable: true,
          suggestedAction: '请刷新正文后重试。',
        ),
      );
    }

    if (patch.operation == RevisionOperation.insert &&
        startOffset != endOffset) {
      return const AppResult<String>.failure(
        AppError(
          code: 'revision.invalid_anchor',
          message: 'Insert revision anchor range must be collapsed.',
          userMessage: '插入修订位置无效，无法应用该修订。',
          source: AppErrorSource.editor,
          recoverable: true,
          suggestedAction: '请刷新正文后重试。',
        ),
      );
    }

    if (patch.operation == RevisionOperation.insert && patch.beforeText != '') {
      return const AppResult<String>.failure(
        AppError(
          code: 'revision.before_text_mismatch',
          message: 'Insert revision beforeText must be empty.',
          userMessage: '插入修订原文必须为空，无法应用该修订。',
          source: AppErrorSource.editor,
          recoverable: true,
          suggestedAction: '请重新生成修订。',
        ),
      );
    }

    final before = baseContent.substring(startOffset, endOffset);
    if (patch.operation != RevisionOperation.insert &&
        before != patch.beforeText) {
      return const AppResult<String>.failure(
        AppError(
          code: 'revision.before_text_mismatch',
          message: 'Revision beforeText does not match base content.',
          userMessage: '修订原文与当前正文不一致，无法应用该修订。',
          source: AppErrorSource.editor,
          recoverable: true,
          suggestedAction: '请重新生成修订或进入冲突处理。',
        ),
      );
    }

    final nextContent = switch (patch.operation) {
      RevisionOperation.insert =>
        baseContent.replaceRange(startOffset, startOffset, patch.afterText),
      RevisionOperation.replace =>
        baseContent.replaceRange(startOffset, endOffset, patch.afterText),
      RevisionOperation.delete =>
        baseContent.replaceRange(startOffset, endOffset, ''),
    };

    return AppResult<String>.success(nextContent);
  }
}
