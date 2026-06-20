import 'package:freezed_annotation/freezed_annotation.dart';

part 'timeline_event.freezed.dart';
part 'timeline_event.g.dart';

/// An event on a character's timeline, representing an appearance
/// or significant moment in the story.
@freezed
class TimelineEvent with _$TimelineEvent {
  const factory TimelineEvent({
    required String id,
    required String projectId,
    required String characterId,
    required String chapterId,
    required String description,
    @Default(0) int chapterOrder,
    @Default('') String eventType,
    @Default([]) List<String> relatedCharacterIds,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _TimelineEvent;

  const TimelineEvent._();

  factory TimelineEvent.fromJson(Map<String, dynamic> json) =>
      _$TimelineEventFromJson(json);
}
