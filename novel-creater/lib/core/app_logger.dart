import 'package:logging/logging.dart';

class AppLogger {
  AppLogger._();

  static void setup({Level level = Level.INFO}) {
    Logger.root.level = level;
    Logger.root.onRecord.listen((record) {
      // ignore: avoid_print
      print('[${record.level.name}] ${record.time}: ${record.message}');
    });
  }

  static Logger get repo => Logger('Repo');
  static Logger get bloc => Logger('Bloc');
  static Logger get agent => Logger('Agent');
  static Logger get llm => Logger('LLM');
  static Logger get editor => Logger('Editor');
}
