import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/core/clock.dart';
import 'package:novel_creator/core/id_generator.dart';
import 'package:novel_creator/data/di/injection.dart';
import 'package:novel_creator/domain/domain.dart';
import 'package:novel_creator/features/projects/bloc/create_project_bloc.dart';

const _languages = [
  ('zh', 'Chinese'),
  ('en', 'English'),
  ('ja', 'Japanese'),
  ('ko', 'Korean'),
];

const _genres = [
  'Fantasy',
  'Sci-Fi',
  'Romance',
  'Mystery',
  'Thriller',
  'Horror',
  'Literary Fiction',
  'Historical Fiction',
  'Adventure',
  'Comedy',
  'Other',
];

class CreateProjectPage extends StatelessWidget {
  const CreateProjectPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => CreateProjectBloc(
        projectRepository: locator<ProjectRepository>(),
        chapterRepository: locator<ChapterRepository>(),
        outlineNodeRepository: locator<OutlineNodeRepository>(),
        idGenerator: locator<IdGenerator>(),
        clock: locator<AppClock>(),
      ),
      child: const _CreateProjectForm(),
    );
  }
}

class _CreateProjectForm extends StatefulWidget {
  const _CreateProjectForm();

  @override
  State<_CreateProjectForm> createState() => _CreateProjectFormState();
}

class _CreateProjectFormState extends State<_CreateProjectForm> {
  final _titleController = TextEditingController();
  final _authorController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _titleController.dispose();
    _authorController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final morandi = Theme.of(context).extension<MorandiColors>()!;
    return BlocListener<CreateProjectBloc, CreateProjectState>(
      listener: (context, state) {
        if (state.error != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.error!),
              backgroundColor: morandi.dustyRose,
            ),
          );
        }
        if (state.createdProjectId != null) {
          Navigator.of(context).pushReplacementNamed(
            AppRoutes.workspace,
            arguments: state.createdProjectId,
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('New Project'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ),
        body: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(32),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Start a New Novel',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Set up your project details to begin writing.',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: morandi.inkLight,
                          ),
                    ),
                    const SizedBox(height: 32),
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(
                        labelText: 'Title',
                        hintText: 'Enter your novel title',
                        prefixIcon: Icon(Icons.title),
                      ),
                      validator: (value) =>
                          value == null || value.trim().isEmpty
                              ? 'Title is required'
                              : null,
                      onChanged: (value) => context
                          .read<CreateProjectBloc>()
                          .add(CreateProjectTitleChanged(title: value)),
                    ),
                    const SizedBox(height: 20),
                    TextFormField(
                      controller: _authorController,
                      decoration: const InputDecoration(
                        labelText: 'Author',
                        hintText: 'Your pen name or real name',
                        prefixIcon: Icon(Icons.person_outline),
                      ),
                      onChanged: (value) => context
                          .read<CreateProjectBloc>()
                          .add(CreateProjectAuthorChanged(author: value)),
                    ),
                    const SizedBox(height: 20),
                    BlocBuilder<CreateProjectBloc, CreateProjectState>(
                      buildWhen: (prev, curr) => prev.language != curr.language,
                      builder: (context, state) {
                        return DropdownButtonFormField<String>(
                          value: state.language,
                          decoration: const InputDecoration(
                            labelText: 'Language',
                            prefixIcon: Icon(Icons.language),
                          ),
                          items: _languages
                              .map((lang) => DropdownMenuItem(
                                    value: lang.$1,
                                    child: Text(lang.$2),
                                  ))
                              .toList(),
                          onChanged: (value) {
                            if (value != null) {
                              context.read<CreateProjectBloc>().add(
                                    CreateProjectLanguageChanged(
                                        language: value),
                                  );
                            }
                          },
                        );
                      },
                    ),
                    const SizedBox(height: 20),
                    BlocBuilder<CreateProjectBloc, CreateProjectState>(
                      buildWhen: (prev, curr) => prev.genre != curr.genre,
                      builder: (context, state) {
                        return DropdownButtonFormField<String>(
                          value: state.genre.isEmpty ? null : state.genre,
                          decoration: const InputDecoration(
                            labelText: 'Genre',
                            prefixIcon: Icon(Icons.category_outlined),
                          ),
                          hint: const Text('Select a genre'),
                          items: _genres
                              .map((genre) => DropdownMenuItem(
                                    value: genre,
                                    child: Text(genre),
                                  ))
                              .toList(),
                          onChanged: (value) {
                            context.read<CreateProjectBloc>().add(
                                  CreateProjectGenreChanged(genre: value ?? ''),
                                );
                          },
                        );
                      },
                    ),
                    const SizedBox(height: 40),
                    BlocBuilder<CreateProjectBloc, CreateProjectState>(
                      buildWhen: (prev, curr) =>
                          prev.isSubmitting != curr.isSubmitting,
                      builder: (context, state) {
                        return ElevatedButton(
                          onPressed: state.isSubmitting
                              ? null
                              : () {
                                  if (_formKey.currentState!.validate()) {
                                    context
                                        .read<CreateProjectBloc>()
                                        .add(CreateProjectSubmitted());
                                  }
                                },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: state.isSubmitting
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Create Project'),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
