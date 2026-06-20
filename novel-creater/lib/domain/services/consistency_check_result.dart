import 'package:novel_creator/domain/enums/consistency_check_type.dart';

/// A single consistency issue found during a check.
final class ConsistencyIssue {
  const ConsistencyIssue({
    required this.type,
    required this.severity,
    required this.description,
    required this.evidence,
    required this.characterIds,
    this.chapterId,
    this.suggestedFix,
  });

  final ConsistencyCheckType type;
  final ConsistencyIssueSeverity severity;
  final String description;
  final String evidence;
  final List<String> characterIds;
  final String? chapterId;
  final String? suggestedFix;
}

enum ConsistencyIssueSeverity { info, warning, error }

/// Result of running consistency checks.
final class ConsistencyCheckResult {
  const ConsistencyCheckResult({
    required this.projectId,
    required this.issues,
    required this.checkedAt,
    required this.typesChecked,
  });

  final String projectId;
  final List<ConsistencyIssue> issues;
  final DateTime checkedAt;
  final List<ConsistencyCheckType> typesChecked;

  bool get hasIssues => issues.isNotEmpty;
  bool get hasErrors =>
      issues.any((i) => i.severity == ConsistencyIssueSeverity.error);
  List<ConsistencyIssue> issuesByType(ConsistencyCheckType type) =>
      issues.where((i) => i.type == type).toList();
}
