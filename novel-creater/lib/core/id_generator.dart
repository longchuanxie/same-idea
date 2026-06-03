import 'package:uuid/uuid.dart';

class IdGenerator {
  const IdGenerator();

  String generate() => const Uuid().v7();
}
