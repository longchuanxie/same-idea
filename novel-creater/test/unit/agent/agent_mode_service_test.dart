import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/agent/agent_mode.dart';
import 'package:novel_creator/agent/agent_mode_service.dart';

void main() {
  group('AgentModeService', () {
    const service = AgentModeService();

    test('empty context infers brainstorm mode', () {
      final mode = service.infer(const AgentContext());

      expect(mode, AgentMode.brainstorm);
    });

    test('open chapter infers writing mode', () {
      final mode = service.infer(
        const AgentContext(
          projectId: 'project-1',
          chapterId: 'chapter-1',
        ),
      );

      expect(mode, AgentMode.writing);
    });

    test('selected text infers revision mode', () {
      final mode = service.infer(
        const AgentContext(
          projectId: 'project-1',
          chapterId: 'chapter-1',
          selectedText: 'revise this',
        ),
      );

      expect(mode, AgentMode.revision);
    });

    test('blank selected text does not infer revision mode', () {
      final mode = service.infer(
        const AgentContext(
          chapterId: 'chapter-1',
          selectedText: '   ',
        ),
      );

      expect(mode, AgentMode.writing);
    });

    test('manual mode overrides inferred mode', () {
      final mode = service.infer(
        const AgentContext(
          chapterId: 'chapter-1',
          selectedText: 'revise this',
          manualMode: AgentMode.knowledge,
        ),
      );

      expect(mode, AgentMode.knowledge);
    });
  });
}
