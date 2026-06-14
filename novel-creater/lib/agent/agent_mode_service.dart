import 'package:novel_creator/agent/agent_mode.dart';

class AgentModeService {
  const AgentModeService();

  AgentMode infer(AgentContext context) {
    final manualMode = context.manualMode;
    if (manualMode != null) {
      return manualMode;
    }

    final selectedText = context.selectedText;
    if (selectedText != null && selectedText.trim().isNotEmpty) {
      return AgentMode.revision;
    }

    if (context.chapterId != null) {
      return AgentMode.writing;
    }

    final hasKnowledgeData = context.characters.isNotEmpty ||
        context.settingEntries.isNotEmpty ||
        context.notes.isNotEmpty;
    if (hasKnowledgeData) {
      return AgentMode.knowledge;
    }

    return AgentMode.brainstorm;
  }
}
