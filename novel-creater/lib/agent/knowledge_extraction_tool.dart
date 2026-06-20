import 'package:novel_creator/agent/knowledge_extraction_result.dart';
import 'package:novel_creator/domain/results/app_result.dart';

/// Agent tool for extracting knowledge from chapter text.
/// Returns structured suggestions without writing to the knowledge base.
abstract interface class KnowledgeExtractionTool {
  Future<AppResult<KnowledgeExtractionResult>> extract({
    required String projectId,
    required String chapterId,
    required String chapterContent,
    required List<String> existingCharacterNames,
    List<String>? focusAreas,
  });
}
