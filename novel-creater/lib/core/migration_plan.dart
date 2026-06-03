class MigrationPlan {
  const MigrationPlan({
    required this.fromVersion,
    required this.toVersion,
    required this.description,
    required this.apply,
    this.dryRun,
    this.rollbackHint,
  });

  final int fromVersion;
  final int toVersion;
  final String description;
  final Future<void> Function() apply;
  final Future<String> Function()? dryRun;
  final String? rollbackHint;
}
