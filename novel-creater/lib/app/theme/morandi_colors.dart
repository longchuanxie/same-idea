import 'package:flutter/material.dart';

@immutable
class MorandiColors extends ThemeExtension<MorandiColors> {
  const MorandiColors({
    this.sage = const Color(0xFF8B9D83),
    this.dustyRose = const Color(0xFFC4A882),
    this.warmGray = const Color(0xFF9E9689),
    this.softBlue = const Color(0xFF7B9EA8),
    this.mutedPlum = const Color(0xFF8E7B93),
    this.sand = const Color(0xFFC8B8A4),
    this.stone = const Color(0xFFA39E93),
    this.lichen = const Color(0xFF9BAF91),
    this.clay = const Color(0xFFB5A08E),
    this.fog = const Color(0xFFD4CEC6),
    this.parchment = const Color(0xFFF0EBE3),
    this.inkLight = const Color(0xFF5C574F),
    this.inkDark = const Color(0xFF3A3631),
  });

  final Color sage;
  final Color dustyRose;
  final Color warmGray;
  final Color softBlue;
  final Color mutedPlum;
  final Color sand;
  final Color stone;
  final Color lichen;
  final Color clay;
  final Color fog;
  final Color parchment;
  final Color inkLight;
  final Color inkDark;

  @override
  MorandiColors copyWith({
    Color? sage,
    Color? dustyRose,
    Color? warmGray,
    Color? softBlue,
    Color? mutedPlum,
    Color? sand,
    Color? stone,
    Color? lichen,
    Color? clay,
    Color? fog,
    Color? parchment,
    Color? inkLight,
    Color? inkDark,
  }) => MorandiColors(
      sage: sage ?? this.sage,
      dustyRose: dustyRose ?? this.dustyRose,
      warmGray: warmGray ?? this.warmGray,
      softBlue: softBlue ?? this.softBlue,
      mutedPlum: mutedPlum ?? this.mutedPlum,
      sand: sand ?? this.sand,
      stone: stone ?? this.stone,
      lichen: lichen ?? this.lichen,
      clay: clay ?? this.clay,
      fog: fog ?? this.fog,
      parchment: parchment ?? this.parchment,
      inkLight: inkLight ?? this.inkLight,
      inkDark: inkDark ?? this.inkDark,
    );

  @override
  MorandiColors lerp(MorandiColors? other, double t) {
    if (other is! MorandiColors) return this;
    return MorandiColors(
      sage: Color.lerp(sage, other.sage, t)!,
      dustyRose: Color.lerp(dustyRose, other.dustyRose, t)!,
      warmGray: Color.lerp(warmGray, other.warmGray, t)!,
      softBlue: Color.lerp(softBlue, other.softBlue, t)!,
      mutedPlum: Color.lerp(mutedPlum, other.mutedPlum, t)!,
      sand: Color.lerp(sand, other.sand, t)!,
      stone: Color.lerp(stone, other.stone, t)!,
      lichen: Color.lerp(lichen, other.lichen, t)!,
      clay: Color.lerp(clay, other.clay, t)!,
      fog: Color.lerp(fog, other.fog, t)!,
      parchment: Color.lerp(parchment, other.parchment, t)!,
      inkLight: Color.lerp(inkLight, other.inkLight, t)!,
      inkDark: Color.lerp(inkDark, other.inkDark, t)!,
    );
  }
}
