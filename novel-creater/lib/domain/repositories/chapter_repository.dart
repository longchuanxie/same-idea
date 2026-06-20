import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class ChapterRepository {
  Future<AppResult<Chapter>> create(Chapter chapter);

  Future<AppResult<List<Chapter>>> list(String projectId);

  Future<AppResult<Chapter?>> get(String id);

  Future<AppResult<Chapter>> saveContent({
    required String id,
    required String markdownContent,
    required String plainTextCache,
  });

  Future<AppResult<Chapter>> updateStatus({
    required String id,
    required ChapterStatus status,
  });
}
