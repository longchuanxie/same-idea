import 'package:novel_creator/domain/entities/timeline_event.dart';
import 'package:novel_creator/domain/repositories/timeline_event_repository.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';

final class InMemoryTimelineEventRepository implements TimelineEventRepository {
  final Map<String, TimelineEvent> _events = <String, TimelineEvent>{};

  @override
  Future<AppResult<TimelineEvent>> create(TimelineEvent event) async {
    _events[event.id] = event;
    return AppResult<TimelineEvent>.success(event);
  }

  @override
  Future<AppResult<List<TimelineEvent>>> listByCharacter(
      String characterId) async {
    final events = _events.values
        .where((e) => e.characterId == characterId)
        .toList()
      ..sort((a, b) => a.chapterOrder.compareTo(b.chapterOrder));
    return AppResult<List<TimelineEvent>>.success(
      List<TimelineEvent>.unmodifiable(events),
    );
  }

  @override
  Future<AppResult<List<TimelineEvent>>> listByChapter(String chapterId) async {
    final events = _events.values
        .where((e) => e.chapterId == chapterId)
        .toList()
      ..sort((a, b) => a.chapterOrder.compareTo(b.chapterOrder));
    return AppResult<List<TimelineEvent>>.success(
      List<TimelineEvent>.unmodifiable(events),
    );
  }

  @override
  Future<AppResult<List<TimelineEvent>>> listByProject(String projectId) async {
    final events = _events.values
        .where((e) => e.projectId == projectId)
        .toList()
      ..sort((a, b) => a.chapterOrder.compareTo(b.chapterOrder));
    return AppResult<List<TimelineEvent>>.success(
      List<TimelineEvent>.unmodifiable(events),
    );
  }

  @override
  Future<AppResult<TimelineEvent>> update(TimelineEvent event) async {
    final existing = _events[event.id];
    if (existing == null) {
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
    final updated = event.copyWith(updatedAt: DateTime.now().toUtc());
    _events[event.id] = updated;
    return AppResult<TimelineEvent>.success(updated);
  }

  @override
  Future<AppResult<void>> delete(String id) async {
    _events.remove(id);
    return const AppResult<void>.success(null);
  }
}
