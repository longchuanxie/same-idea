import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/text_metrics.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/mappers/project_mapper.dart';
import 'package:novel_creator/data/repositories/drift_chapter_repository.dart';
import 'package:novel_creator/data/repositories/drift_project_repository.dart';
import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/project.dart';

void main() {
  late AppDatabase db;
  late DriftProjectRepository projectRepo;
  late DriftChapterRepository repo;

  setUp(() async {
    db = AppDatabase(NativeDatabase.memory());
    projectRepo = DriftProjectRepository(db);
    repo = DriftChapterRepository(db);
  });

  tearDown(() async => await db.close());

  Future<String> _seedProject() async {
    final now = DateTime.utc(2026, 6, 6);
    final project = Project(
      id: 'p1',
      name: 'Test Novel',
      createdAt: now,
      updatedAt: now,
    );
    await projectRepo.create(project);
    return 'p1';
  }

  group('DriftChapterRepository', () {
    test('create persists and returns chapter', () async {
      await _seedProject();
      final now = DateTime.utc(2026, 6, 6);
      final chapter = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter One',
        markdownContent: '# Hello\n\nWorld.',
        plainTextCache: '# Hello\n\nWorld.',
        createdAt: now,
        updatedAt: now,
      );

      final result = await repo.create(chapter);
      expect(result.isSuccess, true);
      expect(result.valueOrNull?.id, 'c1');
    });

    test('list returns only chapters for given project', () async {
      final pid = await _seedProject();
      // Seed another project
      final now = DateTime.utc(2026, 6, 6);
      await projectRepo.create(Project(
        id: 'p2',
        name: 'Other',
        createdAt: now,
        updatedAt: now,
      ));

      await repo.create(Chapter(
        id: 'c1',
        projectId: pid,
        title: 'Ch1',
        markdownContent: '',
        plainTextCache: '',
        createdAt: now,
        updatedAt: now,
      ));
      await repo.create(Chapter(
        id: 'c2',
        projectId: 'p2',
        title: 'Ch2',
        markdownContent: '',
        plainTextCache: '',
        createdAt: now,
        updatedAt: now,
      ));
      await repo.create(Chapter(
        id: 'c3',
        projectId: pid,
        title: 'Ch3',
        markdownContent: '',
        plainTextCache: '',
        createdAt: now,
        updatedAt: now,
      ));

      final result = await repo.list(pid);
      expect(result.valueOrNull, hasLength(2));
      expect(result.valueOrNull!.every((c) => c.projectId == pid), true);
    });

    test('get returns null for missing chapter', () async {
      final result = await repo.get('ghost');
      expect(result.isSuccess, true);
      expect(result.valueOrNull == null, true);
    });

    test('saveContent updates content and wordCount', () async {
      await _seedProject();
      final now = DateTime.utc(2026, 6, 6);
      final chapter = Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Ch1',
        markdownContent: '',
        plainTextCache: '',
        createdAt: now,
        updatedAt: now,
      );
      await repo.create(chapter);

      const newText = 'Hello world, this is a test of word counting.';
      final result = await repo.saveContent(
        id: 'c1',
        markdownContent: newText,
        plainTextCache: newText,
      );

      expect(result.isSuccess, true);
      expect(result.valueOrNull?.plainTextCache, newText);
      expect(result.valueOrNull?.wordCount,
          TextMetrics.countCharacters(newText));
    });

    test('saveContent returns failure for missing chapter', () async {
      final result = await repo.saveContent(
        id: 'ghost',
        markdownContent: 'x',
        plainTextCache: 'x',
      );
      expect(result.isFailure, true);
      expect(result.errorOrNull?.code, 'database.not_found');
    });
  });
}
