import 'package:equatable/equatable.dart';
import 'package:novel_creator/domain/enums/export_format.dart';

sealed class ExportEvent extends Equatable {
  const ExportEvent();

  @override
  List<Object?> get props => [];
}

/// Load export data for a project (chapters, pending revision count).
final class ExportLoaded extends ExportEvent {
  const ExportLoaded({required this.projectId});

  final String projectId;

  @override
  List<Object?> get props => [projectId];
}

/// User selected an export format.
final class ExportFormatSelected extends ExportEvent {
  const ExportFormatSelected({required this.format});

  final ExportFormat format;

  @override
  List<Object?> get props => [format];
}

/// User toggled the "only accepted content" option.
final class ExportOnlyAcceptedToggled extends ExportEvent {
  const ExportOnlyAcceptedToggled({required this.onlyAccepted});

  final bool onlyAccepted;

  @override
  List<Object?> get props => [onlyAccepted];
}

/// User toggled the "include table of contents" option.
final class ExportIncludeTocToggled extends ExportEvent {
  const ExportIncludeTocToggled({required this.includeToc});

  final bool includeToc;

  @override
  List<Object?> get props => [includeToc];
}

/// User updated the author field.
final class ExportAuthorChanged extends ExportEvent {
  const ExportAuthorChanged({required this.author});

  final String author;

  @override
  List<Object?> get props => [author];
}

/// User requested a preview of the export content.
final class ExportPreviewRequested extends ExportEvent {
  const ExportPreviewRequested();
}

/// User confirmed the export (triggers file download/save).
final class ExportConfirmed extends ExportEvent {
  const ExportConfirmed();
}

/// User dismissed the pending revision warning.
final class ExportRevisionWarningDismissed extends ExportEvent {
  const ExportRevisionWarningDismissed();
}
