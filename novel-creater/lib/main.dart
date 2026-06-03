import 'package:flutter/material.dart';

void main() {
  runApp(const NovelCreatorApp());
}

class NovelCreatorApp extends StatelessWidget {
  const NovelCreatorApp({super.key});

  @override
  Widget build(BuildContext context) => const MaterialApp(
        title: 'Novel Creator',
        home: Scaffold(
          body: Center(
            child: Text('Novel Creator'),
          ),
        ),
      );
}
