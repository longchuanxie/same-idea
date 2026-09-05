DateTime currentLocalUtcDate() {
  final now = DateTime.now();
  return DateTime.utc(now.year, now.month, now.day);
}
