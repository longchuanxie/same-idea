import 'package:flutter/material.dart';
import 'package:novel_creator/features/projects/pages/create_project_page.dart';
import 'package:novel_creator/features/projects/pages/project_list_page.dart';
import 'package:novel_creator/features/workspace/pages/workspace_page.dart';

class AppRoutes {
  AppRoutes._();

  static const String projectList = '/';
  static const String newProject = '/new-project';
  static const String workspace = '/workspace';

  static Route<dynamic> onGenerateRoute(RouteSettings settings) =>
      switch (settings.name) {
        projectList => MaterialPageRoute(
            builder: (_) => const ProjectListPage(),
            settings: settings,
          ),
        newProject => MaterialPageRoute(
            builder: (_) => const CreateProjectPage(),
            settings: settings,
          ),
        workspace => MaterialPageRoute(
            builder: (_) => WorkspacePage(
              projectId: settings.arguments as String? ?? '',
            ),
            settings: settings,
          ),
        _ => MaterialPageRoute(
            builder: (_) => const _NotFoundPage(),
          ),
      };
}

class _NotFoundPage extends StatelessWidget {
  const _NotFoundPage();

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Not Found')),
        body: const Center(child: Text('Page not found')),
      );
}
