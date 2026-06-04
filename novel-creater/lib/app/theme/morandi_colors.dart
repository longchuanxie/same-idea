import 'package:flutter/material.dart';

@immutable
class MorandiColors extends ThemeExtension<MorandiColors> {
  const MorandiColors({
    this.bg = const Color(0xFFF6F3ED),
    this.bg2 = const Color(0xFFEFEAE2),
    this.canvas = const Color(0xFFFFFDF9),
    this.paper = const Color(0xFFFBFAF6),
    this.surface = const Color(0xCCFFFFFF),
    this.surface2 = const Color(0xFFF4F1EB),
    this.surface3 = const Color(0xFFEBE7DF),
    this.line = const Color(0xFFE4DED3),
    this.line2 = const Color(0xFFD6CEC1),
    this.ink = const Color(0xFF242721),
    this.text = const Color(0xFF3E423B),
    this.muted = const Color(0xFF77786F),
    this.soft = const Color(0xFF9B9B90),
    this.green = const Color(0xFF5F7B61),
    this.greenDark = const Color(0xFF49674D),
    this.greenLight = const Color(0xFFE9F0E5),
    this.greenTint = const Color(0xFFF2F6EF),
    this.orange = const Color(0xFFC78A42),
    this.orangeLight = const Color(0xFFFFF2DC),
    this.red = const Color(0xFFB96D65),
    this.redLight = const Color(0xFFF8E5E2),
    this.blue = const Color(0xFF6D8A94),
    this.shadow = const Color(0x1A3E362D),
    this.softShadow = const Color(0x143E362D),
  });

  final Color bg;
  final Color bg2;
  final Color canvas;
  final Color paper;
  final Color surface;
  final Color surface2;
  final Color surface3;
  final Color line;
  final Color line2;
  final Color ink;
  final Color text;
  final Color muted;
  final Color soft;
  final Color green;
  final Color greenDark;
  final Color greenLight;
  final Color greenTint;
  final Color orange;
  final Color orangeLight;
  final Color red;
  final Color redLight;
  final Color blue;
  final Color shadow;
  final Color softShadow;

  @override
  MorandiColors copyWith({
    Color? bg,
    Color? bg2,
    Color? canvas,
    Color? paper,
    Color? surface,
    Color? surface2,
    Color? surface3,
    Color? line,
    Color? line2,
    Color? ink,
    Color? text,
    Color? muted,
    Color? soft,
    Color? green,
    Color? greenDark,
    Color? greenLight,
    Color? greenTint,
    Color? orange,
    Color? orangeLight,
    Color? red,
    Color? redLight,
    Color? blue,
    Color? shadow,
    Color? softShadow,
  }) {
    return MorandiColors(
      bg: bg ?? this.bg,
      bg2: bg2 ?? this.bg2,
      canvas: canvas ?? this.canvas,
      paper: paper ?? this.paper,
      surface: surface ?? this.surface,
      surface2: surface2 ?? this.surface2,
      surface3: surface3 ?? this.surface3,
      line: line ?? this.line,
      line2: line2 ?? this.line2,
      ink: ink ?? this.ink,
      text: text ?? this.text,
      muted: muted ?? this.muted,
      soft: soft ?? this.soft,
      green: green ?? this.green,
      greenDark: greenDark ?? this.greenDark,
      greenLight: greenLight ?? this.greenLight,
      greenTint: greenTint ?? this.greenTint,
      orange: orange ?? this.orange,
      orangeLight: orangeLight ?? this.orangeLight,
      red: red ?? this.red,
      redLight: redLight ?? this.redLight,
      blue: blue ?? this.blue,
      shadow: shadow ?? this.shadow,
      softShadow: softShadow ?? this.softShadow,
    );
  }

  @override
  MorandiColors lerp(MorandiColors? other, double t) {
    if (other is! MorandiColors) return this;
    return MorandiColors(
      bg: Color.lerp(bg, other.bg, t)!,
      bg2: Color.lerp(bg2, other.bg2, t)!,
      canvas: Color.lerp(canvas, other.canvas, t)!,
      paper: Color.lerp(paper, other.paper, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surface2: Color.lerp(surface2, other.surface2, t)!,
      surface3: Color.lerp(surface3, other.surface3, t)!,
      line: Color.lerp(line, other.line, t)!,
      line2: Color.lerp(line2, other.line2, t)!,
      ink: Color.lerp(ink, other.ink, t)!,
      text: Color.lerp(text, other.text, t)!,
      muted: Color.lerp(muted, other.muted, t)!,
      soft: Color.lerp(soft, other.soft, t)!,
      green: Color.lerp(green, other.green, t)!,
      greenDark: Color.lerp(greenDark, other.greenDark, t)!,
      greenLight: Color.lerp(greenLight, other.greenLight, t)!,
      greenTint: Color.lerp(greenTint, other.greenTint, t)!,
      orange: Color.lerp(orange, other.orange, t)!,
      orangeLight: Color.lerp(orangeLight, other.orangeLight, t)!,
      red: Color.lerp(red, other.red, t)!,
      redLight: Color.lerp(redLight, other.redLight, t)!,
      blue: Color.lerp(blue, other.blue, t)!,
      shadow: Color.lerp(shadow, other.shadow, t)!,
      softShadow: Color.lerp(softShadow, other.softShadow, t)!,
    );
  }
}
