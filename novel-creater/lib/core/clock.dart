// ignore: one_member_abstracts
abstract class AppClock {
  DateTime now();
}

class SystemClock implements AppClock {
  const SystemClock();

  @override
  DateTime now() => DateTime.now();
}

class FixedClock implements AppClock {
  const FixedClock(this._fixedTime);

  final DateTime _fixedTime;

  @override
  DateTime now() => _fixedTime;
}
