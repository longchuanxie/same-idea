import 'dart:async';

import 'package:flutter/material.dart';
import 'package:novel_creator/data/local/database/app_database.dart';
import 'package:novel_creator/data/local/database/connection/connection.dart';

/// Signature for a function that creates an [AppDatabase].
/// Used to inject test databases without importing drift directly.
typedef DatabaseFactory = AppDatabase Function();

/// Wraps async [AppDatabase] initialization in a [FutureBuilder].
///
/// Shows a loading indicator until the database is ready, then builds
/// [builder] with the initialized [AppDatabase] instance.
///
/// Provide [databaseFactory] to override the default connection (useful for
/// testing with in-memory databases).
class DatabaseProvider extends StatelessWidget {
  const DatabaseProvider({
    super.key,
    required this.builder,
    DatabaseFactory? databaseFactory,
  }) : _databaseFactory = databaseFactory;

  final Widget Function(BuildContext context, AppDatabase database) builder;
  final DatabaseFactory? _databaseFactory;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<AppDatabase>(
      future: _initDatabase().timeout(
        const Duration(seconds: 10),
        onTimeout: () => throw TimeoutException('Database initialization timed out'),
      ),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return builder(context, snapshot.data!);
        }
        if (snapshot.hasError) {
          return _ErrorView(error: snapshot.error!);
        }
        return const _LoadingView();
      },
    );
  }

  Future<AppDatabase> _initDatabase() async {
    if (_databaseFactory != null) {
      return _databaseFactory!();
    }
    final executor = openConnection();
    return AppDatabase(executor);
  }
}

class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Initializing database...'),
            ],
          ),
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.error});

  final Object error;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                const Text(
                  'Failed to initialize database',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  error.toString(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
