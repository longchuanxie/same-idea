sealed class ProjectListEvent {
  const ProjectListEvent();
}

final class ProjectListStarted extends ProjectListEvent {
  const ProjectListStarted();
}

final class ProjectListRefreshed extends ProjectListEvent {
  const ProjectListRefreshed();
}

final class ProjectListCreated extends ProjectListEvent {
  const ProjectListCreated({required this.name, this.description = ''});

  final String name;
  final String description;
}

final class ProjectListDeleted extends ProjectListEvent {
  const ProjectListDeleted(this.projectId);

  final String projectId;
}
