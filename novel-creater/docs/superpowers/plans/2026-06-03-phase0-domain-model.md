# Phase 0: Domain Model & State Protocol Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the domain layer — all 10 core entities, enums, state machines, AppResult/AppError, domain events, and serialization — as the shared foundation for all subsequent phases.

**Architecture:** Domain-driven design with freezed for immutable entities, json_serializable for serialization, and sealed classes for state machines. All types live under `lib/domain/` with zero Flutter UI dependencies.

**Tech Stack:** Flutter 3.24.5 / Dart 3.5.4, freezed, freezed_annotation, json_serializable, build_runner, uuid

---

## File Structure

```
lib/
  domain/
    entities/
      project.dart
      outline_node.dart
      chapter.dart
      revision.dart
      character.dart
      setting_entry.dart
      note.dart
      session.dart
      agent_task.dart
      snapshot.dart
    enums/
      chapter_status.dart
      content_format.dart
      revision_operation.dart
      revision_status.dart
      revision_source.dart
      agent_task_status.dart
      agent_task_type.dart
      outline_node_type.dart
      outline_node_status.dart
      character_role.dart
      note_type.dart
      session_stage.dart
      snapshot_trigger.dart
      app_error_source.dart
    events/
      domain_event.dart
    results/
      app_error.dart
      app_result.dart
    value_objects/
      revision_anchor.dart
      revision_patch_metadata.dart
    domain.dart
  core/
    core.dart
test/
  unit/
    domain/
      entities/
        project_test.dart
        chapter_test.dart
        revision_test.dart
        character_test.dart
        agent_task_test.dart
      enums/
        chapter_status_test.dart
        revision_status_test.dart
        agent_task_status_test.dart
      results/
        app_result_test.dart
        app_error_test.dart
      events/
        domain_event_test.dart
```

---

### Task 1: Create Flutter Project Scaffold

**Files:**
- Create: Full Flutter project structure via `flutter create`
- Modify: `pubspec.yaml`
- Verify: `analysis_options.yaml`

- [ ] **Step 1: Create Flutter project**

```bash
flutter create --project-name novel_creator --org com.novelcreator --platforms windows,macos,linux,web .
```

- [ ] **Step 2: Add dependencies to pubspec.yaml**

Replace dependencies section:

```yaml
dependencies:
  flutter:
    sdk: flutter
  freezed_annotation: ^2.4.4
  json_annotation: ^4.9.0
  uuid: ^4.5.1
  equatable: ^2.0.7

dev_dependencies:
  flutter_test:
    sdk: flutter
  very_good_analysis: ^6.0.0
  freezed: ^2.5.7
  json_serializable: ^6.8.0
  build_runner: ^2.4.13
```

- [ ] **Step 3: Create domain directory structure**

```bash
mkdir -p lib/domain/entities lib/domain/enums lib/domain/events lib/domain/results lib/domain/value_objects
mkdir -p lib/core
mkdir -p test/unit/domain/entities test/unit/domain/enums test/unit/domain/results test/unit/domain/events
```

- [ ] **Step 4: Install dependencies**

```bash
flutter pub get
```

Expected: All dependencies resolved

- [ ] **Step 5: Verify project compiles**

```bash
flutter analyze
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: initialize Flutter project with domain layer structure"
```

---

### Task 2: Define Core Enums

**Files:**
- Create: All 14 enum files under `lib/domain/enums/`
- Test: `test/unit/domain/enums/` — 3 test files for state machine enums

- [ ] **Step 1: Write failing tests for ChapterStatus transitions**

Create `test/unit/domain/enums/chapter_status_test.dart`:

```dart
import 'package:novel_creator/domain/enums/chapter_status.dart';
import 'package:test/test.dart';

void main() {
  group('ChapterStatus', () {
    test('draft can transition to reviewing', () {
      expect(ChapterStatus.draft.canTransitionTo(ChapterStatus.reviewing), isTrue);
    });

    test('draft can transition to locked', () {
      expect(ChapterStatus.draft.canTransitionTo(ChapterStatus.locked), isTrue);
    });

    test('reviewing can transition to revised', () {
      expect(ChapterStatus.reviewing.canTransitionTo(ChapterStatus.revised), isTrue);
    });

    test('reviewing can transition to locked', () {
      expect(ChapterStatus.reviewing.canTransitionTo(ChapterStatus.locked), isTrue);
    });

    test('revised can transition to published', () {
      expect(ChapterStatus.revised.canTransitionTo(ChapterStatus.published), isTrue);
    });

    test('revised can transition to locked', () {
      expect(ChapterStatus.revised.canTransitionTo(ChapterStatus.locked), isTrue);
    });

    test('published can transition to draft', () {
      expect(ChapterStatus.published.canTransitionTo(ChapterStatus.draft), isTrue);
    });

    test('draft cannot transition to published directly', () {
      expect(ChapterStatus.draft.canTransitionTo(ChapterStatus.published), isFalse);
    });

    test('locked cannot transition to published', () {
      expect(ChapterStatus.locked.canTransitionTo(ChapterStatus.published), isFalse);
    });
  });
}
```

- [ ] **Step 2: Write failing tests for AgentTaskStatus transitions**

Create `test/unit/domain/enums/agent_task_status_test.dart`:

```dart
import 'package:novel_creator/domain/enums/agent_task_status.dart';
import 'package:test/test.dart';

void main() {
  group('AgentTaskStatus', () {
    test('created can transition to queued', () {
      expect(AgentTaskStatus.created.canTransitionTo(AgentTaskStatus.queued), isTrue);
    });

    test('queued can transition to running', () {
      expect(AgentTaskStatus.queued.canTransitionTo(AgentTaskStatus.running), isTrue);
    });

    test('running can transition to succeeded', () {
      expect(AgentTaskStatus.running.canTransitionTo(AgentTaskStatus.succeeded), isTrue);
    });

    test('running can transition to failed', () {
      expect(AgentTaskStatus.running.canTransitionTo(AgentTaskStatus.failed), isTrue);
    });

    test('running can transition to cancelled', () {
      expect(AgentTaskStatus.running.canTransitionTo(AgentTaskStatus.cancelled), isTrue);
    });

    test('succeeded cannot transition to anything', () {
      for (final target in AgentTaskStatus.values) {
        if (target == AgentTaskStatus.succeeded) continue;
        expect(AgentTaskStatus.succeeded.canTransitionTo(target), isFalse);
      }
    });

    test('isTerminal is true for terminal states', () {
      expect(AgentTaskStatus.succeeded.isTerminal, isTrue);
      expect(AgentTaskStatus.failed.isTerminal, isTrue);
      expect(AgentTaskStatus.cancelled.isTerminal, isTrue);
      expect(AgentTaskStatus.created.isTerminal, isFalse);
    });
  });
}
```

- [ ] **Step 3: Write failing tests for RevisionStatus transitions**

Create `test/unit/domain/enums/revision_status_test.dart`:

```dart
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:test/test.dart';

void main() {
  group('RevisionStatus', () {
    test('pending can transition to accepted', () {
      expect(RevisionStatus.pending.canTransitionTo(RevisionStatus.accepted), isTrue);
    });

    test('pending can transition to rejected', () {
      expect(RevisionStatus.pending.canTransitionTo(RevisionStatus.rejected), isTrue);
    });

    test('pending can transition to superseded', () {
      expect(RevisionStatus.pending.canTransitionTo(RevisionStatus.superseded), isTrue);
    });

    test('accepted cannot transition to anything', () {
      for (final target in RevisionStatus.values) {
        if (target == RevisionStatus.accepted) continue;
        expect(RevisionStatus.accepted.canTransitionTo(target), isFalse);
      }
    });

    test('isTerminal is true for terminal states', () {
      expect(RevisionStatus.accepted.isTerminal, isTrue);
      expect(RevisionStatus.rejected.isTerminal, isTrue);
      expect(RevisionStatus.superseded.isTerminal, isTrue);
      expect(RevisionStatus.pending.isTerminal, isFalse);
    });
  });
}
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
flutter test test/unit/domain/enums/
```

Expected: FAIL — files do not exist yet

- [ ] **Step 5: Implement chapter_status enum**

Create `lib/domain/enums/chapter_status.dart`:

```dart
enum ChapterStatus {
  draft,
  reviewing,
  revised,
  locked,
  published;

  bool canTransitionTo(ChapterStatus target) {
    return switch (this) {
      ChapterStatus.draft =>
        target == ChapterStatus.reviewing || target == ChapterStatus.locked,
      ChapterStatus.reviewing =>
        target == ChapterStatus.revised || target == ChapterStatus.locked,
      ChapterStatus.revised =>
        target == ChapterStatus.published || target == ChapterStatus.locked,
      ChapterStatus.published => target == ChapterStatus.draft,
      ChapterStatus.locked => target == ChapterStatus.draft,
    };
  }
}
```

- [ ] **Step 6: Implement agent_task_status enum**

Create `lib/domain/enums/agent_task_status.dart`:

```dart
enum AgentTaskStatus {
  created,
  queued,
  running,
  succeeded,
  failed,
  cancelled;

  bool canTransitionTo(AgentTaskStatus target) {
    return switch (this) {
      AgentTaskStatus.created => target == AgentTaskStatus.queued,
      AgentTaskStatus.queued =>
        target == AgentTaskStatus.running ||
            target == AgentTaskStatus.cancelled,
      AgentTaskStatus.running =>
        target == AgentTaskStatus.succeeded ||
            target == AgentTaskStatus.failed ||
            target == AgentTaskStatus.cancelled,
      AgentTaskStatus.succeeded => false,
      AgentTaskStatus.failed => false,
      AgentTaskStatus.cancelled => false,
    };
  }

  bool get isTerminal =>
      this == AgentTaskStatus.succeeded ||
      this == AgentTaskStatus.failed ||
      this == AgentTaskStatus.cancelled;
}
```

- [ ] **Step 7: Implement revision_status enum**

Create `lib/domain/enums/revision_status.dart`:

```dart
enum RevisionStatus {
  pending,
  accepted,
  rejected,
  superseded;

  bool canTransitionTo(RevisionStatus target) {
    return switch (this) {
      RevisionStatus.pending =>
        target == RevisionStatus.accepted ||
            target == RevisionStatus.rejected ||
            target == RevisionStatus.superseded,
      RevisionStatus.accepted => false,
      RevisionStatus.rejected => false,
      RevisionStatus.superseded => false,
    };
  }

  bool get isTerminal =>
      this == RevisionStatus.accepted ||
      this == RevisionStatus.rejected ||
      this == RevisionStatus.superseded;
}
```

- [ ] **Step 8: Implement remaining simple enums**

Create `lib/domain/enums/content_format.dart`:
```dart
enum ContentFormat { markdown, delta, html }
```

Create `lib/domain/enums/revision_operation.dart`:
```dart
enum RevisionOperation { insert, delete, replace }
```

Create `lib/domain/enums/revision_source.dart`:
```dart
enum RevisionSource { agent, user }
```

Create `lib/domain/enums/agent_task_type.dart`:
```dart
enum AgentTaskType {
  write,
  continueWrite,
  rewrite,
  expand,
  condense,
  polish,
  consistencyCheck,
  search,
  brainstorm,
}
```

Create `lib/domain/enums/outline_node_type.dart`:
```dart
enum OutlineNodeType { volume, chapter, scene, beat, custom }
```

Create `lib/domain/enums/outline_node_status.dart`:
```dart
enum OutlineNodeStatus { planned, writing, done, archived }
```

Create `lib/domain/enums/character_role.dart`:
```dart
enum CharacterRole { protagonist, antagonist, supporting, minor, custom }
```

Create `lib/domain/enums/note_type.dart`:
```dart
enum NoteType { idea, research, decision, issue }
```

Create `lib/domain/enums/session_stage.dart`:
```dart
enum SessionStage { brainstorm, research, outline, writing, polish, custom }
```

Create `lib/domain/enums/snapshot_trigger.dart`:
```dart
enum SnapshotTrigger { manual, autoMigration, autoBatchRevision, autoImport }
```

Create `lib/domain/enums/app_error_source.dart`:
```dart
enum AppErrorSource { storage, llm, search, editor, export, unknown }
```

- [ ] **Step 9: Run enum tests**

```bash
flutter test test/unit/domain/enums/
```

Expected: All tests PASS

- [ ] **Step 10: Commit**

```bash
git add lib/domain/enums/ test/unit/domain/enums/
git commit -m "feat(domain): add core enums with state machine transitions"
```

---

### Task 3: Define AppError and AppResult

**Files:**
- Create: `lib/domain/results/app_error.dart`
- Create: `lib/domain/results/app_result.dart`
- Test: `test/unit/domain/results/app_error_test.dart`
- Test: `test/unit/domain/results/app_result_test.dart`

- [ ] **Step 1: Write failing tests for AppResult**

Create `test/unit/domain/results/app_result_test.dart`:

```dart
import 'package:novel_creator/domain/domain.dart';
import 'package:test/test.dart';

void main() {
  group('AppResult', () {
    test('success holds data', () {
      const result = AppResult<int>.success(42);
      expect(result.isSuccess, isTrue);
      expect(result.isFailure, isFalse);
    });

    test('failure holds error', () {
      final error = AppError(
        code: 'TEST_001',
        message: 'test error',
        userMessage: 'Something went wrong',
        recoverable: true,
        source: AppErrorSource.unknown,
      );
      final result = AppResult<int>.failure(error);
      expect(result.isSuccess, isFalse);
      expect(result.isFailure, isTrue);
    });

    test('when success calls success callback', () {
      const result = AppResult<int>.success(42);
      var called = false;
      result.when(
        success: (data) {
          called = true;
          expect(data, 42);
        },
        failure: (_) => fail('Should not be called'),
      );
      expect(called, isTrue);
    });

    test('when failure calls failure callback', () {
      final error = AppError(
        code: 'TEST_001',
        message: 'test error',
        userMessage: 'Something went wrong',
        recoverable: true,
        source: AppErrorSource.unknown,
      );
      final result = AppResult<int>.failure(error);
      result.when(
        success: (_) => fail('Should not be called'),
        failure: (e) => expect(e.code, 'TEST_001'),
      );
    });

    test('maybeSuccess returns data on success', () {
      const result = AppResult<int>.success(42);
      expect(result.maybeSuccess, 42);
      expect(result.maybeFailure, isNull);
    });

    test('maybeFailure returns error on failure', () {
      final error = AppError(
        code: 'TEST_001',
        message: 'test error',
        userMessage: 'Something went wrong',
        recoverable: true,
        source: AppErrorSource.unknown,
      );
      final result = AppResult<int>.failure(error);
      expect(result.maybeSuccess, isNull);
      expect(result.maybeFailure, isNotNull);
      expect(result.maybeFailure!.code, 'TEST_001');
    });
  });
}
```

- [ ] **Step 2: Write failing tests for AppError**

Create `test/unit/domain/results/app_error_test.dart`:

```dart
import 'package:novel_creator/domain/domain.dart';
import 'package:test/test.dart';

void main() {
  group('AppError', () {
    test('creates with required fields', () {
      final error = AppError(
        code: 'SAVE_001',
        message: 'Failed to save chapter',
        userMessage: 'Could not save your work',
        recoverable: true,
        source: AppErrorSource.storage,
      );
      expect(error.code, 'SAVE_001');
      expect(error.recoverable, isTrue);
      expect(error.source, AppErrorSource.storage);
      expect(error.technicalDetail, isNull);
      expect(error.suggestedAction, isNull);
    });

    test('creates with optional fields', () {
      final error = AppError(
        code: 'LLM_001',
        message: 'Auth failed',
        userMessage: 'API Key may be invalid',
        recoverable: true,
        source: AppErrorSource.llm,
        technicalDetail: 'HTTP 401 Unauthorized',
        suggestedAction: 'Check your API Key in Settings',
      );
      expect(error.technicalDetail, 'HTTP 401 Unauthorized');
      expect(error.suggestedAction, 'Check your API Key in Settings');
    });

    test('supports copyWith', () {
      final error = AppError(
        code: 'SAVE_001',
        message: 'Failed',
        userMessage: 'Could not save',
        recoverable: false,
        source: AppErrorSource.storage,
      );
      final updated = error.copyWith(recoverable: true);
      expect(updated.recoverable, isTrue);
      expect(updated.code, 'SAVE_001');
    });

    test('serializes to and from JSON', () {
      final error = AppError(
        code: 'SAVE_001',
        message: 'Failed',
        userMessage: 'Could not save',
        recoverable: true,
        source: AppErrorSource.storage,
        technicalDetail: 'disk full',
      );
      final json = error.toJson();
      final restored = AppError.fromJson(json);
      expect(restored.code, error.code);
      expect(restored.source, error.source);
      expect(restored.technicalDetail, error.technicalDetail);
    });
  });
}
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
flutter test test/unit/domain/results/
```

Expected: FAIL — files do not exist yet

- [ ] **Step 4: Implement AppError**

Create `lib/domain/results/app_error.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/app_error_source.dart';

part 'app_error.freezed.dart';
part 'app_error.g.dart';

@Freezed(toJson: true, fromJson: true)
class AppError with _$AppError {
  const factory AppError({
    required String code,
    required String message,
    required String userMessage,
    String? technicalDetail,
    @Default(true) bool recoverable,
    String? suggestedAction,
    @Default(AppErrorSource.unknown) AppErrorSource source,
  }) = _AppError;

  factory AppError.fromJson(Map<String, dynamic> json) =>
      _$AppErrorFromJson(json);
}
```

- [ ] **Step 5: Implement AppResult**

Create `lib/domain/results/app_result.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/results/app_error.dart';

part 'app_result.freezed.dart';

@Freezed(toJson: false, fromJson: false)
sealed class AppResult<T> with _$AppResult<T> {
  const factory AppResult.success(T data) = Success<T>;
  const factory AppResult.failure(AppError error) = Failure<T>;

  const AppResult._();

  bool get isSuccess => this is Success<T>;
  bool get isFailure => this is Failure<T>;

  T? get maybeSuccess => when(success: (d) => d, failure: (_) => null);
  AppError? get maybeFailure => when(success: (_) => null, failure: (e) => e);
}
```

- [ ] **Step 6: Run build_runner to generate code**

```bash
dart run build_runner build --delete-conflicting-outputs
```

Expected: All files generated successfully

- [ ] **Step 7: Run tests**

```bash
flutter test test/unit/domain/results/
```

Expected: All tests PASS

- [ ] **Step 8: Commit**

```bash
git add lib/domain/results/ test/unit/domain/results/
git commit -m "feat(domain): add AppError and AppResult with serialization"
```

---

### Task 4: Define Value Objects

**Files:**
- Create: `lib/domain/value_objects/revision_anchor.dart`
- Create: `lib/domain/value_objects/revision_patch_metadata.dart`

- [ ] **Step 1: Implement RevisionAnchor**

Create `lib/domain/value_objects/revision_anchor.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'revision_anchor.freezed.dart';
part 'revision_anchor.g.dart';

enum AnchorType { range, paragraphId, cursor }

@Freezed(toJson: true, fromJson: true)
class RevisionAnchor with _$RevisionAnchor {
  const factory RevisionAnchor({
    required AnchorType type,
    int? start,
    int? end,
    String? paragraphId,
    int? offset,
  }) = _RevisionAnchor;

  factory RevisionAnchor.fromJson(Map<String, dynamic> json) =>
      _$RevisionAnchorFromJson(json);
}
```

- [ ] **Step 2: Implement RevisionPatchMetadata**

Create `lib/domain/value_objects/revision_patch_metadata.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'revision_patch_metadata.freezed.dart';
part 'revision_patch_metadata.g.dart';

@Freezed(toJson: true, fromJson: true)
class RevisionPatchMetadata with _$RevisionPatchMetadata {
  const factory RevisionPatchMetadata({
    String? prompt,
    String? model,
    String? agentTaskId,
    String? summary,
  }) = _RevisionPatchMetadata;

  factory RevisionPatchMetadata.fromJson(Map<String, dynamic> json) =>
      _$RevisionPatchMetadataFromJson(json);
}
```

- [ ] **Step 3: Run build_runner**

```bash
dart run build_runner build --delete-conflicting-outputs
```

- [ ] **Step 4: Commit**

```bash
git add lib/domain/value_objects/
git commit -m "feat(domain): add RevisionAnchor and RevisionPatchMetadata value objects"
```

---

### Task 5: Define Core Entities (Part 1 — Project, Chapter, OutlineNode, Revision)

**Files:**
- Create: `lib/domain/entities/project.dart`
- Create: `lib/domain/entities/chapter.dart`
- Create: `lib/domain/entities/outline_node.dart`
- Create: `lib/domain/entities/revision.dart`

- [ ] **Step 1: Implement Project entity**

Create `lib/domain/entities/project.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'project.freezed.dart';
part 'project.g.dart';

@Freezed(toJson: true, fromJson: true)
class Project with _$Project {
  const Project._();

  const factory Project({
    required String id,
    required String title,
    @Default('') String author,
    @Default('') String description,
    @Default('zh') String language,
    @Default('') String genre,
    @Default([]) List<String> tags,
    String? defaultStyleProfileId,
    String? activeChapterId,
    @Default(false) bool localEncryptionEnabled,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _Project;

  factory Project.fromJson(Map<String, dynamic> json) =>
      _$ProjectFromJson(json);
}
```

- [ ] **Step 2: Implement Chapter entity**

Create `lib/domain/entities/chapter.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/chapter_status.dart';
import 'package:novel_creator/domain/enums/content_format.dart';

part 'chapter.freezed.dart';
part 'chapter.g.dart';

@Freezed(toJson: true, fromJson: true)
class Chapter with _$Chapter {
  const Chapter._();

  const factory Chapter({
    required String id,
    required String projectId,
    String? outlineNodeId,
    required String title,
    required int order,
    @Default(ContentFormat.markdown) ContentFormat contentFormat,
    @Default('') String content,
    @Default('') String plainTextCache,
    @Default(0) int wordCount,
    @Default(ChapterStatus.draft) ChapterStatus status,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _Chapter;

  factory Chapter.fromJson(Map<String, dynamic> json) =>
      _$ChapterFromJson(json);

  int get effectiveWordCount =>
      plainTextCache.isNotEmpty ? plainTextCache.length : wordCount;
}
```

- [ ] **Step 3: Implement OutlineNode entity**

Create `lib/domain/entities/outline_node.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/outline_node_type.dart';
import 'package:novel_creator/domain/enums/outline_node_status.dart';

part 'outline_node.freezed.dart';
part 'outline_node.g.dart';

@Freezed(toJson: true, fromJson: true)
class OutlineNode with _$OutlineNode {
  const factory OutlineNode({
    required String id,
    required String projectId,
    String? parentId,
    required int order,
    required String title,
    @Default(OutlineNodeType.chapter) OutlineNodeType nodeType,
    @Default('') String summary,
    String? linkedChapterId,
    @Default(OutlineNodeStatus.planned) OutlineNodeStatus status,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _OutlineNode;

  factory OutlineNode.fromJson(Map<String, dynamic> json) =>
      _$OutlineNodeFromJson(json);
}
```

- [ ] **Step 4: Implement Revision entity**

Create `lib/domain/entities/revision.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/revision_operation.dart';
import 'package:novel_creator/domain/enums/revision_source.dart';
import 'package:novel_creator/domain/enums/revision_status.dart';
import 'package:novel_creator/domain/value_objects/revision_anchor.dart';
import 'package:novel_creator/domain/value_objects/revision_patch_metadata.dart';

part 'revision.freezed.dart';
part 'revision.g.dart';

@Freezed(toJson: true, fromJson: true)
class Revision with _$Revision {
  const Revision._();

  const factory Revision({
    required String id,
    required String projectId,
    required String chapterId,
    required RevisionOperation operation,
    required RevisionAnchor anchor,
    required String beforeText,
    required String afterText,
    @Default(RevisionSource.agent) RevisionSource source,
    @Default(RevisionStatus.pending) RevisionStatus status,
    RevisionPatchMetadata? metadata,
    DateTime? resolvedAt,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _Revision;

  factory Revision.fromJson(Map<String, dynamic> json) =>
      _$RevisionFromJson(json);

  bool get isPending => status == RevisionStatus.pending;
  bool get isTerminal => status.isTerminal;
}
```

- [ ] **Step 5: Run build_runner**

```bash
dart run build_runner build --delete-conflicting-outputs
```

- [ ] **Step 6: Commit**

```bash
git add lib/domain/entities/
git commit -m "feat(domain): add Project, Chapter, OutlineNode, Revision entities"
```

---

### Task 6: Define Core Entities (Part 2 — Character, SettingEntry, Note, Session, AgentTask, Snapshot)

**Files:**
- Create: `lib/domain/entities/character.dart`
- Create: `lib/domain/entities/setting_entry.dart`
- Create: `lib/domain/entities/note.dart`
- Create: `lib/domain/entities/session.dart`
- Create: `lib/domain/entities/agent_task.dart`
- Create: `lib/domain/entities/snapshot.dart`

- [ ] **Step 1: Implement Character entity**

Create `lib/domain/entities/character.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/character_role.dart';

part 'character.freezed.dart';
part 'character.g.dart';

@Freezed(toJson: true, fromJson: true)
class CharacterRelationship with _$CharacterRelationship {
  const factory CharacterRelationship({
    required String targetCharacterId,
    required String relationType,
    @Default('') String description,
  }) = _CharacterRelationship;

  factory CharacterRelationship.fromJson(Map<String, dynamic> json) =>
      _$CharacterRelationshipFromJson(json);
}

@Freezed(toJson: true, fromJson: true)
class ConsistencyFact with _$ConsistencyFact {
  const factory ConsistencyFact({
    required String key,
    required String value,
    String? sourceChapterId,
  }) = _ConsistencyFact;

  factory ConsistencyFact.fromJson(Map<String, dynamic> json) =>
      _$ConsistencyFactFromJson(json);
}

@Freezed(toJson: true, fromJson: true)
class Character with _$Character {
  const factory Character({
    required String id,
    required String projectId,
    required String name,
    @Default([]) List<String> aliases,
    @Default(CharacterRole.supporting) CharacterRole role,
    @Default('') String description,
    @Default('') String appearance,
    @Default('') String personality,
    @Default('') String goals,
    @Default('') String conflicts,
    @Default('') String secrets,
    @Default([]) List<CharacterRelationship> relationships,
    String? firstAppearanceChapterId,
    @Default([]) List<String> tags,
    @Default([]) List<ConsistencyFact> consistencyFacts,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _Character;

  factory Character.fromJson(Map<String, dynamic> json) =>
      _$CharacterFromJson(json);
}
```

- [ ] **Step 2: Implement SettingEntry entity**

Create `lib/domain/entities/setting_entry.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'setting_entry.freezed.dart';
part 'setting_entry.g.dart';

@Freezed(toJson: true, fromJson: true)
class SettingEntry with _$SettingEntry {
  const factory SettingEntry({
    required String id,
    required String projectId,
    required String category,
    required String title,
    @Default('') String content,
    @Default([]) List<String> tags,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _SettingEntry;

  factory SettingEntry.fromJson(Map<String, dynamic> json) =>
      _$SettingEntryFromJson(json);
}
```

- [ ] **Step 3: Implement Note entity**

Create `lib/domain/entities/note.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/note_type.dart';

part 'note.freezed.dart';
part 'note.g.dart';

@Freezed(toJson: true, fromJson: true)
class Note with _$Note {
  const factory Note({
    required String id,
    required String projectId,
    required String title,
    @Default('') String content,
    @Default(NoteType.idea) NoteType type,
    String? sourceUrl,
    String? agentTaskId,
    @Default([]) List<String> tags,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _Note;

  factory Note.fromJson(Map<String, dynamic> json) =>
      _$NoteFromJson(json);
}
```

- [ ] **Step 4: Implement Session entity**

Create `lib/domain/entities/session.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/session_stage.dart';

part 'session.freezed.dart';
part 'session.g.dart';

@Freezed(toJson: true, fromJson: true)
class SessionMessage with _$SessionMessage {
  const factory SessionMessage({
    required String id,
    required String role,
    required String content,
    DateTime? createdAt,
    String? agentTaskId,
  }) = _SessionMessage;

  factory SessionMessage.fromJson(Map<String, dynamic> json) =>
      _$SessionMessageFromJson(json);
}

@Freezed(toJson: true, fromJson: true)
class Session with _$Session {
  const factory Session({
    required String id,
    required String projectId,
    required String title,
    @Default(SessionStage.writing) SessionStage stage,
    String? parentSessionId,
    String? branchName,
    @Default([]) List<SessionMessage> messages,
    String? contextSnapshotId,
    @Default(false) bool archived,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _Session;

  factory Session.fromJson(Map<String, dynamic> json) =>
      _$SessionFromJson(json);
}
```

- [ ] **Step 5: Implement AgentTask entity**

Create `lib/domain/entities/agent_task.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/agent_task_status.dart';
import 'package:novel_creator/domain/enums/agent_task_type.dart';

part 'agent_task.freezed.dart';
part 'agent_task.g.dart';

@Freezed(toJson: true, fromJson: true)
class TokenUsage with _$TokenUsage {
  const factory TokenUsage({
    @Default(0) int promptTokens,
    @Default(0) int completionTokens,
    @Default(false) bool isEstimated,
  }) = _TokenUsage;

  factory TokenUsage.fromJson(Map<String, dynamic> json) =>
      _$TokenUsageFromJson(json);
}

@Freezed(toJson: true, fromJson: true)
class AgentTask with _$AgentTask {
  const AgentTask._();

  const factory AgentTask({
    required String id,
    required String projectId,
    required AgentTaskType taskType,
    @Default(AgentTaskStatus.created) AgentTaskStatus status,
    @Default('') String inputJson,
    @Default('') String outputJson,
    String? model,
    TokenUsage? tokenUsage,
    String? error,
    @Default([]) List<String> sideEffects,
    DateTime? startedAt,
    DateTime? completedAt,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _AgentTask;

  factory AgentTask.fromJson(Map<String, dynamic> json) =>
      _$AgentTaskFromJson(json);

  bool get isTerminal => status.isTerminal;
}
```

- [ ] **Step 6: Implement Snapshot entity**

Create `lib/domain/entities/snapshot.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:novel_creator/domain/enums/snapshot_trigger.dart';

part 'snapshot.freezed.dart';
part 'snapshot.g.dart';

@Freezed(toJson: true, fromJson: true)
class Snapshot with _$Snapshot {
  const factory Snapshot({
    required String id,
    required String projectId,
    required String description,
    @Default(SnapshotTrigger.manual) SnapshotTrigger trigger,
    @Default('') String dataSnapshot,
    required DateTime createdAt,
    @Default(1) int schemaVersion,
  }) = _Snapshot;

  factory Snapshot.fromJson(Map<String, dynamic> json) =>
      _$SnapshotFromJson(json);
}
```

- [ ] **Step 7: Run build_runner**

```bash
dart run build_runner build --delete-conflicting-outputs
```

- [ ] **Step 8: Commit**

```bash
git add lib/domain/entities/
git commit -m "feat(domain): add Character, SettingEntry, Note, Session, AgentTask, Snapshot entities"
```

---

### Task 7: Define Domain Events, Barrel Exports, and Entity Tests

**Files:**
- Create: `lib/domain/events/domain_event.dart`
- Create: `lib/domain/domain.dart`
- Create: `lib/core/core.dart`
- Test: `test/unit/domain/events/domain_event_test.dart`
- Test: `test/unit/domain/entities/project_test.dart`
- Test: `test/unit/domain/entities/chapter_test.dart`

- [ ] **Step 1: Implement DomainEvent**

Create `lib/domain/events/domain_event.dart`:

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'domain_event.freezed.dart';

@Freezed(toJson: false, fromJson: false)
sealed class DomainEvent with _$DomainEvent {
  const factory DomainEvent.projectCreated({
    required String projectId,
    required DateTime occurredAt,
  }) = ProjectCreated;

  const factory DomainEvent.chapterContentChanged({
    required String chapterId,
    required String projectId,
    required DateTime occurredAt,
  }) = ChapterContentChanged;

  const factory DomainEvent.revisionCreated({
    required String revisionId,
    required String chapterId,
    required String projectId,
    required DateTime occurredAt,
  }) = RevisionCreated;

  const factory DomainEvent.revisionAccepted({
    required String revisionId,
    required String chapterId,
    required String projectId,
    required DateTime occurredAt,
  }) = RevisionAccepted;

  const factory DomainEvent.revisionRejected({
    required String revisionId,
    required String chapterId,
    required String projectId,
    required DateTime occurredAt,
  }) = RevisionRejected;

  const factory DomainEvent.characterUpdated({
    required String characterId,
    required String projectId,
    required DateTime occurredAt,
  }) = CharacterUpdated;

  const factory DomainEvent.noteCreated({
    required String noteId,
    required String projectId,
    required DateTime occurredAt,
  }) = NoteCreated;

  const factory DomainEvent.agentTaskStarted({
    required String agentTaskId,
    required String projectId,
    required DateTime occurredAt,
  }) = AgentTaskStarted;

  const factory DomainEvent.agentTaskCompleted({
    required String agentTaskId,
    required String projectId,
    required DateTime occurredAt,
  }) = AgentTaskCompleted;

  const factory DomainEvent.agentTaskFailed({
    required String agentTaskId,
    required String projectId,
    required DateTime occurredAt,
  }) = AgentTaskFailed;

  const factory DomainEvent.snapshotCreated({
    required String snapshotId,
    required String projectId,
    required DateTime occurredAt,
  }) = SnapshotCreated;

  const factory DomainEvent.exportCompleted({
    required String projectId,
    required String format,
    required DateTime occurredAt,
  }) = ExportCompleted;
}
```

- [ ] **Step 2: Create domain barrel export**

Create `lib/domain/domain.dart`:

```dart
export 'enums/app_error_source.dart';
export 'enums/agent_task_status.dart';
export 'enums/agent_task_type.dart';
export 'enums/chapter_status.dart';
export 'enums/character_role.dart';
export 'enums/content_format.dart';
export 'enums/note_type.dart';
export 'enums/outline_node_status.dart';
export 'enums/outline_node_type.dart';
export 'enums/revision_operation.dart';
export 'enums/revision_source.dart';
export 'enums/revision_status.dart';
export 'enums/session_stage.dart';
export 'enums/snapshot_trigger.dart';

export 'entities/agent_task.dart';
export 'entities/chapter.dart';
export 'entities/character.dart';
export 'entities/note.dart';
export 'entities/outline_node.dart';
export 'entities/project.dart';
export 'entities/revision.dart';
export 'entities/session.dart';
export 'entities/setting_entry.dart';
export 'entities/snapshot.dart';

export 'events/domain_event.dart';

export 'results/app_error.dart';
export 'results/app_result.dart';

export 'value_objects/revision_anchor.dart';
export 'value_objects/revision_patch_metadata.dart';
```

- [ ] **Step 3: Create core barrel export**

Create `lib/core/core.dart` (placeholder for future utilities):

```dart
// Core utilities will be added in Phase 1
```

- [ ] **Step 4: Run build_runner for DomainEvent**

```bash
dart run build_runner build --delete-conflicting-outputs
```

- [ ] **Step 5: Write entity tests**

Create `test/unit/domain/entities/project_test.dart`:

```dart
import 'package:novel_creator/domain/domain.dart';
import 'package:test/test.dart';

void main() {
  group('Project', () {
    test('creates with required fields', () {
      final now = DateTime.now();
      final project = Project(
        id: 'p1',
        title: 'Test Novel',
        createdAt: now,
        updatedAt: now,
      );
      expect(project.id, 'p1');
      expect(project.title, 'Test Novel');
      expect(project.language, 'zh');
      expect(project.schemaVersion, 1);
      expect(project.tags, isEmpty);
    });

    test('serializes to and from JSON', () {
      final now = DateTime.now();
      final project = Project(
        id: 'p1',
        title: 'Test Novel',
        author: 'Author',
        createdAt: now,
        updatedAt: now,
      );
      final json = project.toJson();
      final restored = Project.fromJson(json);
      expect(restored.id, project.id);
      expect(restored.title, project.title);
      expect(restored.author, project.author);
    });
  });
}
```

Create `test/unit/domain/entities/chapter_test.dart`:

```dart
import 'package:novel_creator/domain/domain.dart';
import 'package:test/test.dart';

void main() {
  group('Chapter', () {
    test('creates with default values', () {
      final now = DateTime.now();
      final chapter = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter 1',
        order: 0,
        createdAt: now,
        updatedAt: now,
      );
      expect(chapter.status, ChapterStatus.draft);
      expect(chapter.contentFormat, ContentFormat.markdown);
      expect(chapter.content, '');
      expect(chapter.wordCount, 0);
    });

    test('effectiveWordCount uses plainTextCache when available', () {
      final now = DateTime.now();
      final chapter = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter 1',
        order: 0,
        plainTextCache: 'Hello world',
        wordCount: 100,
        createdAt: now,
        updatedAt: now,
      );
      expect(chapter.effectiveWordCount, 11);
    });

    test('effectiveWordCount falls back to wordCount', () {
      final now = DateTime.now();
      final chapter = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter 1',
        order: 0,
        wordCount: 100,
        createdAt: now,
        updatedAt: now,
      );
      expect(chapter.effectiveWordCount, 100);
    });

    test('serializes to and from JSON', () {
      final now = DateTime.now();
      final chapter = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter 1',
        order: 0,
        createdAt: now,
        updatedAt: now,
      );
      final json = chapter.toJson();
      final restored = Chapter.fromJson(json);
      expect(restored.id, chapter.id);
      expect(restored.status, chapter.status);
    });
  });
}
```

- [ ] **Step 6: Run all tests**

```bash
flutter test
```

Expected: All tests PASS

- [ ] **Step 7: Run flutter analyze**

```bash
flutter analyze
```

Expected: Zero errors, zero warnings

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat(domain): add DomainEvent, barrel exports, and entity tests"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 10 entities defined (Project, Chapter, OutlineNode, Revision, Character, SettingEntry, Note, Session, AgentTask, Snapshot)
- [x] **Spec coverage:** All 3 state machines defined (ChapterStatus, AgentTaskStatus, RevisionStatus)
- [x] **Spec coverage:** AppError with all required fields per AGENTS.md
- [x] **Spec coverage:** AppResult with success/failure pattern
- [x] **Spec coverage:** 12 domain events per AGENTS.md
- [x] **Spec coverage:** Value objects (RevisionAnchor, RevisionPatchMetadata) per AGENTS.md
- [x] **No placeholders:** All code steps contain complete implementation
- [x] **Type consistency:** All entity field types and enum names are consistent across tasks
