import 'package:novel_creator/agent/agent_writing_tool.dart';
import 'package:novel_creator/agent/cancellation_token.dart';
import 'package:novel_creator/domain/value_objects/revision_patch.dart';
import 'package:novel_creator/features/workspace/widgets/sidebar/navigation_menu.dart';

sealed class WorkspaceEvent {
  const WorkspaceEvent();
}

final class WorkspaceStarted extends WorkspaceEvent {
  const WorkspaceStarted();
}

final class WorkspaceProjectLoaded extends WorkspaceEvent {
  const WorkspaceProjectLoaded(this.projectId);

  final String projectId;
}

final class ChapterSelected extends WorkspaceEvent {
  const ChapterSelected(this.chapterId);

  final String chapterId;
}

final class ChapterCreated extends WorkspaceEvent {
  const ChapterCreated();
}

final class ChapterContentChanged extends WorkspaceEvent {
  const ChapterContentChanged(this.markdownContent);

  final String markdownContent;
}

final class ChapterSaveDebounced extends WorkspaceEvent {
  const ChapterSaveDebounced({
    required this.chapterId,
    required this.markdownContent,
  });

  final String chapterId;
  final String markdownContent;
}

final class AgentSuggestionRequested extends WorkspaceEvent {
  const AgentSuggestionRequested({this.targetLength = 800});

  final int targetLength;
}

final class AgentWriteRequested extends WorkspaceEvent {
  const AgentWriteRequested({
    required this.instruction,
    this.targetLength = 800,
    this.contextScope = ContextScope.chapterOnly,
  });

  final String instruction;
  final int targetLength;
  final ContextScope contextScope;
}

final class AgentRewriteRequested extends WorkspaceEvent {
  const AgentRewriteRequested({
    required this.selectedText,
    required this.instruction,
    this.styleProfile,
  });

  final String selectedText;
  final String instruction;
  final String? styleProfile;
}

final class AgentExpandRequested extends WorkspaceEvent {
  const AgentExpandRequested({
    required this.selectedText,
    this.targetLength = 1200,
    this.focus,
  });

  final String selectedText;
  final int targetLength;
  final String? focus;
}

final class AgentCondenseRequested extends WorkspaceEvent {
  const AgentCondenseRequested({
    required this.selectedText,
    this.targetLength = 400,
    this.keepPoints,
  });

  final String selectedText;
  final int targetLength;
  final List<String>? keepPoints;
}

final class AgentPolishRequested extends WorkspaceEvent {
  const AgentPolishRequested({
    required this.selectedText,
    required this.styleGoal,
    this.strictness = 0.7,
  });

  final String selectedText;
  final String styleGoal;
  final double strictness;
}

final class AgentCancelled extends WorkspaceEvent {
  const AgentCancelled();
}

final class PendingRevisionCreated extends WorkspaceEvent {
  const PendingRevisionCreated({this.patch, this.afterText});

  final RevisionPatch? patch;
  final String? afterText;
}

final class RevisionAccepted extends WorkspaceEvent {
  const RevisionAccepted(this.revisionId);

  final String revisionId;
}

final class RevisionRejected extends WorkspaceEvent {
  const RevisionRejected(this.revisionId);

  final String revisionId;
}

final class NavItemSelected extends WorkspaceEvent {
  const NavItemSelected(this.item);

  final SidebarNavItem item;
}

final class ChapterTreeToggled extends WorkspaceEvent {
  const ChapterTreeToggled();
}
