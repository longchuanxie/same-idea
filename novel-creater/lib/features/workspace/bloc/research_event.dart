part of 'research_bloc.dart';

sealed class ResearchEvent extends Equatable {
  const ResearchEvent();

  @override
  List<Object?> get props => [];
}

final class ResearchStarted extends ResearchEvent {
  const ResearchStarted({required this.projectId});

  final String projectId;

  @override
  List<Object?> get props => [projectId];
}

final class ResearchRiskConfirmed extends ResearchEvent {
  const ResearchRiskConfirmed();
}

final class ResearchQueryChanged extends ResearchEvent {
  const ResearchQueryChanged({required this.query});

  final String query;

  @override
  List<Object?> get props => [query];
}

final class ResearchSearchRequested extends ResearchEvent {
  const ResearchSearchRequested({
    this.query = '',
    this.maxResults = 5,
  });

  final String query;
  final int maxResults;

  @override
  List<Object?> get props => [query, maxResults];
}

final class ResearchSourceSaved extends ResearchEvent {
  const ResearchSourceSaved({required this.source});

  final SourceCard source;

  @override
  List<Object?> get props => [source];
}
