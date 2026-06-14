final class IdGenerator {
  IdGenerator._();

  static int _counter = 0;

  static String create(String prefix) {
    final normalizedPrefix = prefix.trim();
    final value = '${DateTime.now().microsecondsSinceEpoch}-${_counter++}';

    if (normalizedPrefix.isEmpty) {
      return value;
    }

    return '$normalizedPrefix-$value';
  }
}
