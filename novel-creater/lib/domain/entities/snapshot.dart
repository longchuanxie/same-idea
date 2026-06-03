import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/snapshot_trigger.dart';

part 'snapshot.freezed.dart';
part 'snapshot.g.dart';

@Freezed(toJson: true, fromJson: true)
class Snapshot with _$Snapshot {
  const factory Snapshot({
    required String id,
    required String projectId,
    required String description,
    required DateTime createdAt,
    @Default(SnapshotTrigger.manual) SnapshotTrigger trigger,
    @Default('') String dataSnapshot,
    @Default(1) int schemaVersion,
  }) = _Snapshot;

  factory Snapshot.fromJson(Map<String, dynamic> json) =>
      _$SnapshotFromJson(json);
}
