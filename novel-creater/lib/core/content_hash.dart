String stableContentHash(String content) {
  const fnvOffset = 0x811c9dc5;
  const fnvPrime = 0x01000193;
  const mask32 = 0xffffffff;

  var hash = fnvOffset;
  for (final unit in content.codeUnits) {
    hash ^= unit;
    hash = (hash * fnvPrime) & mask32;
  }
  return hash.toRadixString(16).padLeft(8, '0');
}
