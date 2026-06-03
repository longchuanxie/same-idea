import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/export/services/export_service.dart';

class MockProjectRepository extends Mock implements ProjectRepository {}

class MockChapterRepository extends Mock implements ChapterRepository {}

void main() {
  late MockProjectRepository mockProjectRepo;
  late MockChapterRepository mockChapterRepo;
  late ExportService service;

  setUp(() {
    mockProjectRepo = MockProjectRepository();
    mockChapterRepo = MockChapterRepository();
    service = ExportService(
      projectRepository: mockProjectRepo,
      chapterRepository: mockChapterRepo,
    );

    final now = DateTime.now();
    final project = Project(
      id: 'p1',
      title: 'Test Novel',
      author: 'Author',
      createdAt: now,
      updatedAt: now,
    );
    final chapters = [
      Chapter(
        id: 'c1',
        projectId: 'p1',
        title: 'Chapter 1',
        order: 0,
        content: 'Hello world',
        createdAt: now,
        updatedAt: now,
      ),
      Chapter(
        id: 'c2',
        projectId: 'p1',
        title: 'Chapter 2',
        order: 1,
        content: 'Goodbye world',
        createdAt: now,
        updatedAt: now,
      ),
    ];

    when(() => mockProjectRepo.getById('p1')).thenAnswer(
      (_) async => AppResult.success(project),
    );
    when(() => mockChapterRepo.getByProjectId('p1')).thenAnswer(
      (_) async => AppResult.success(chapters),
    );
  });

  group('ExportService', () {
    test('exports TXT format', () async {
      final result = await service.exportProject(
        'p1',
        format: ExportFormat.txt,
      );
      expect(result.isSuccess, isTrue);
      result.when(
        success: (r) {
          expect(r.format, ExportFormat.txt);
          expect(r.fileName, endsWith('.txt'));
          expect(r.content, contains('Test Novel'));
          expect(r.content, contains('Chapter 1'));
          expect(r.content, contains('Hello world'));
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('exports Markdown format', () async {
      final result = await service.exportProject(
        'p1',
        format: ExportFormat.markdown,
      );
      expect(result.isSuccess, isTrue);
      result.when(
        success: (r) {
          expect(r.format, ExportFormat.markdown);
          expect(r.fileName, endsWith('.md'));
          expect(r.content, contains('# Test Novel'));
          expect(r.content, contains('## Chapter 1'));
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('exports Project Package JSON', () async {
      final result = await service.exportProject(
        'p1',
        format: ExportFormat.projectPackage,
      );
      expect(result.isSuccess, isTrue);
      result.when(
        success: (r) {
          expect(r.format, ExportFormat.projectPackage);
          expect(r.fileName, endsWith('.novel.json'));
          expect(r.content, contains('Test Novel'));
        },
        failure: (_) => fail('Should not fail'),
      );
    });

    test('returns failure when project not found', () async {
      when(() => mockProjectRepo.getById('missing')).thenAnswer(
        (_) async => AppResult.failure(
          AppError(
            code: 'NOT_FOUND',
            message: 'Not found',
            userMessage: 'Not found',
            recoverable: false,
            source: AppErrorSource.storage,
          ),
        ),
      );

      final result = await service.exportProject('missing');
      expect(result.isFailure, isTrue);
    });
  });
}
