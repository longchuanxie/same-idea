import 'package:flutter/material.dart';

@immutable
class MorandiColors extends ThemeExtension<MorandiColors> {
  const MorandiColors({
    this.bg = const Color(0xFFF5F1EA),
    this.canvas = const Color(0xFFFBFAF7),
    this.panel = const Color(0xFFF0EBE2),
    this.panel2 = const Color(0xFFE8E1D7),
    this.line = const Color(0xFFDED6CA),
    this.line2 = const Color(0xFFCFC6B9),
    this.ink = const Color(0xFF222620),
    this.text = const Color(0xFF3D413B),
    this.muted = const Color(0xFF77766E),
    this.muted2 = const Color(0xFF9B998F),
    this.green = const Color(0xFF637B61),
    this.green2 = const Color(0xFF7F9479),
    this.green3 = const Color(0xFFDFE8DB),
    this.sage = const Color(0xFFA8B5A2),
    this.sand = const Color(0xFFD8C5A6),
    this.clay = const Color(0xFFC7A99A),
    this.rose = const Color(0xFFD9B7AE),
    this.blue = const Color(0xFF7C8F95),
    this.orange = const Color(0xFFBA8D50),
    this.red = const Color(0xFFB56A60),
  });

  final Color bg;
  final Color canvas;
  final Color panel;
  final Color panel2;
  final Color line;
  final Color line2;
  final Color ink;
  final Color text;
  final Color muted;
  final Color muted2;
  final Color green;
  final Color green2;
  final Color green3;
  final Color sage;
  final Color sand;
  final Color clay;
  final Color rose;
  final Color blue;
  final Color orange;
  final Color red;

  @override
  MorandiColors copyWith({
    Color? bg, Color? canvas, Color? panel, Color? panel2,
    Color? line, Color? line2, Color? ink, Color? text,
    Color? muted, Color? muted2, Color? green, Color? green2, Color? green3,
    Color? sage, Color? sand, Color? clay, Color? rose,
    Color? blue, Color? orange, Color? red,
  }) {
    return MorandiColors(
      bg: bg ?? this.bg,
      canvas: canvas ?? this.canvas,
      panel: panel ?? this.panel,
      panel2: panel2 ?? this.panel2,
      line: line ?? this.line,
      line2: line2 ?? this.line2,
      ink: ink ?? this.ink,
      text: text ?? this.text,
      muted: muted ?? this.muted,
      muted2: muted2 ?? this.muted2,
      green: green ?? this.green,
      green2: green2 ?? this.green2,
      green3: green3 ?? this.green3,
      sage: sage ?? this.sage,
      sand: sand ?? this.sand,
      clay: clay ?? this.clay,
      rose: rose ?? this.rose,
      blue: blue ?? this.blue,
      orange: orange ?? this.orange,
      red: red ?? this.red,
    );
  }

  @override
  MorandiColors lerp(MorandiColors? other, double t) {
    if (other is! MorandiColors) return this;
    return MorandiColors(
      bg: Color.lerp(bg, other.bg, t)!,
      canvas: Color.lerp(canvas, other.canvas, t)!,
      panel: Color.lerp(panel, other.panel, t)!,
      panel2: Color.lerp(panel2, other.panel2, t)!,
      line: Color.lerp(line, other.line, t)!,
      line2: Color.lerp(line2, other.line2, t)!,
      ink: Color.lerp(ink, other.ink, t)!,
      text: Color.lerp(text, other.text, t)!,
      muted: Color.lerp(muted, other.muted, t)!,
      muted2: Color.lerp(muted2, other.muted2, t)!,
      green: Color.lerp(green, other.green, t)!,
      green2: Color.lerp(green2, other.green2, t)!,
      green3: Color.lerp(green3, other.green3, t)!,
      sage: Color.lerp(sage, other.sage, t)!,
      sand: Color.lerp(sand, other.sand, t)!,
      clay: Color.lerp(clay, other.clay, t)!,
      rose: Color.lerp(rose, other.rose, t)!,
      blue: Color.lerp(blue, other.blue, t)!,
      orange: Color.lerp(orange, other.orange, t)!,
      red: Color.lerp(red, other.red, t)!,
    );
  }
}
