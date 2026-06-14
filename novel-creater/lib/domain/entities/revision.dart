import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';

part 'revision.freezed.dart';
part 'revision.g.dart';

// --- Revision state machine ---
// pending → accepted | rejected | superseded

const Map<RevisionStatus, Set<RevisionStatus>> _validRevisionTransitions =
    <RevisionStatus, Set<RevisionStatus>>{
  RevisionStatus.pending: <RevisionStatus>{
    RevisionStatus.accepted,
    RevisionStatus.rejected,
    RevisionStatus.superseded,
  },
  RevisionStatus.accepted: <RevisionStatus>{},
  RevisionStatus.rejected: <RevisionStatus>{},
  RevisionStatus.superseded: <RevisionStatus>{},
};

bool isValidRevisionTransition(RevisionStatus from, RevisionStatus to) {
  return _validRevisionTransitions[from]?.contains(to) ?? false;
}

@freezed
class Revision with _$Revision {
  const factory Revision({
    required String id,
    required String projectId,
    required String chapterId,
    required RevisionPatch patch,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(RevisionStatus.pending) RevisionStatus status,
    @Default(1) int schemaVersion,
  }) = _Revision;

  const Revision._();

  factory Revision.fromJson(Map<String, dynamic> json) =>
      _$RevisionFromJson(json);

  bool get isTerminal =>
      status == RevisionStatus.accepted ||
      status == RevisionStatus.rejected ||
      status == RevisionStatus.superseded;

  String? validateTransition(RevisionStatus newStatus) {
    if (status == newStatus) return null;
    if (isValidRevisionTransition(status, newStatus)) return null;
    return '不能从 ${status.name} 转换到 ${newStatus.name}';
  }
}
