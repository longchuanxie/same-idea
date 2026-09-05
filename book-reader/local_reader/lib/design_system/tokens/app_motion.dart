import 'package:flutter/material.dart';

/// Design Token: 动效系统
/// 克制动效：淡入 + 轻微上移，避免夸张弹跳/3D 翻书/粒子效果
class AppMotion {
  AppMotion._();

  static const Duration fast = Duration(milliseconds: 180);
  static const Duration medium = Duration(milliseconds: 260);
  static const Duration slow = Duration(milliseconds: 380);

  static const Curve curve = Cubic(0.2, 0.8, 0.2, 1.0);

  /// 页面切换过渡时长
  static const Duration pageTransition = medium;

  /// 淡入 + 轻微上移动画的偏移量
  static const double slideUpOffset = 8.0;

  /// 列表项交错动画间隔
  static const Duration staggerInterval = Duration(milliseconds: 40);

  /// 折叠/展开动画时长
  static const Duration expandCollapse = medium;

  /// Toast 显示时长
  static const Duration toastDuration = Duration(seconds: 2);
}
