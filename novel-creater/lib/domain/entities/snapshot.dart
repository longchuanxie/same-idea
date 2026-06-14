import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/snapshot_type.dart';

part 'snapshot.freezed.dart';
part 'snapshot.g.dart';

@freezed
class Snapshot with _$Snapshot {
  const factory Snapshot({
    required String id,
    required String projectId,
    required String name,
    required SnapshotType type,
    required String contentHash,
    required String contentSnapshot,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
    String? chapterId,
    String? description,
  }) = _Snapshot;

  factory Snapshot.fromJson(Map<String, dynamic> json) =>
      _$SnapshotFromJson(json);
}
