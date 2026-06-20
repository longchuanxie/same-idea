import 'package:novel_creator/domain/entities/timeline_event.dart';
import 'package:novel_creator/domain/results/app_result.dart';

abstract interface class TimelineEventRepository {
  Future<AppResult<TimelineEvent>> create(TimelineEvent event);
  Future<AppResult<List<TimelineEvent>>> listByCharacter(String characterId);
  Future<AppResult<List<TimelineEvent>>> listByChapter(String chapterId);
  Future<AppResult<List<TimelineEvent>>> listByProject(String projectId);
  Future<AppResult<TimelineEvent>> update(TimelineEvent event);
  Future<AppResult<void>> delete(String id);
}
