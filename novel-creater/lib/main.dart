import 'package:flutter/material.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/data/di/injection.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await configureDependencies();
  runApp(const NovelCreatorApp());
}

class NovelCreatorApp extends StatelessWidget {
  const NovelCreatorApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
      title: 'Novel Creator',
      theme: AppTheme.lightTheme(),
      initialRoute: AppRoutes.projectList,
      onGenerateRoute: AppRoutes.onGenerateRoute,
      debugShowCheckedModeBanner: false,
    );
}
