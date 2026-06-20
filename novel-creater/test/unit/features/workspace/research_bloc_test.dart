import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/workspace/bloc/research_bloc.dart';
import 'package:novel_creator/infra/search/search.dart';

void main() {
  late _FakeNoteRepository noteRepository;
  late ResearchBloc bloc;

  setUp(() {
    noteRepository = _FakeNoteRepository();
    bloc = ResearchBloc(
      searchProvider: MockSearchProvider(
        idGenerator: const _FixedIdGenerator('source-1'),
        clock: FixedClock(DateTime(2026, 6, 4, 12)),
      ),
      noteRepository: noteRepository,
      idGenerator: const _FixedIdGenerator('note-1'),
      clock: FixedClock(DateTime(2026, 6, 4, 13)),
    );
  });

  tearDown(() async {
    await bloc.close();
  });

  group('ResearchBloc', () {
    test('requires risk confirmation before searching', () async {
      bloc
        ..add(const ResearchStarted(projectId: 'project-1'))
        ..add(const ResearchSearchRequested(query: '档案馆制度'));

      await bloc.stream.firstWhere((state) => state.error != null);

      expect(bloc.state.sources, isEmpty);
      expect(bloc.state.error, contains('确认'));
    });

    test('searches after confirmation and exposes source cards', () async {
      bloc
        ..add(const ResearchStarted(projectId: 'project-1'))
        ..add(const ResearchRiskConfirmed())
        ..add(const ResearchSearchRequested(query: '档案馆制度', maxResults: 2));

      await bloc.stream.firstWhere((state) => state.sources.length == 2);

      expect(bloc.state.error, isNull);
      expect(bloc.state.sources.first.query, '档案馆制度');
      expect(bloc.state.sources.first.retrievedAt, DateTime(2026, 6, 4, 12));
    });

    test('saves source as research note with citation metadata', () async {
      bloc
        ..add(const ResearchStarted(projectId: 'project-1'))
        ..add(const ResearchRiskConfirmed())
        ..add(const ResearchSearchRequested(query: '档案馆制度', maxResults: 1));

      await bloc.stream.firstWhere((state) => state.sources.isNotEmpty);
      final source = bloc.state.sources.first;

      bloc.add(ResearchSourceSaved(source: source));
      await bloc.stream.firstWhere((state) => state.savedNoteIds.isNotEmpty);

      final note = noteRepository.notes.single;
      expect(note.type, NoteType.research);
      expect(note.sourceUrl, source.url);
      expect(note.content, contains('RetrievedAt:'));
      expect(note.content, contains(source.url));
    });

    test('empty query returns boundary error before provider search', () async {
      bloc
        ..add(const ResearchStarted(projectId: 'project-1'))
        ..add(const ResearchRiskConfirmed())
        ..add(const ResearchSearchRequested(query: '   '));

      await bloc.stream.firstWhere((state) => state.error != null);

      expect(bloc.state.error, '搜索词不能为空');
      expect(bloc.state.sources, isEmpty);
    });
  });
}

class _FixedIdGenerator extends IdGenerator {
  const _FixedIdGenerator(this._id);

  final String _id;

  @override
  String generate() => _id;
}

class _FakeNoteRepository implements NoteRepository {
  final notes = <Note>[];

  @override
  Future<AppResult<Note>> create(Note note) async {
    notes.add(note);
    return AppResult.success(note);
  }

  @override
  Future<AppResult<void>> delete(String id) async =>
      const AppResult.success(null);

  @override
  Future<AppResult<Note>> getById(String id) async => AppResult.success(
        notes.firstWhere((note) => note.id == id),
      );

  @override
  Future<AppResult<List<Note>>> getByProjectId(String projectId) async =>
      AppResult.success(
        notes.where((note) => note.projectId == projectId).toList(),
      );

  @override
  Future<AppResult<List<Note>>> getByType(
    String projectId,
    NoteType type,
  ) async =>
      AppResult.success(
        notes
            .where((note) => note.projectId == projectId && note.type == type)
            .toList(),
      );

  @override
  Future<AppResult<Note>> update(Note note) async {
    final index = notes.indexWhere((item) => item.id == note.id);
    notes[index] = note;
    return AppResult.success(note);
  }
}
