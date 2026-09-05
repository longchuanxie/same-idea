import 'package:flutter/material.dart';

import 'breakpoints.dart';

/// 根据屏幕宽度判断当前布局类型
LayoutType getLayoutType(double width) {
  if (width >= Breakpoints.medium) return LayoutType.expanded;
  if (width >= Breakpoints.compact) return LayoutType.medium;
  return LayoutType.compact;
}

/// 响应式布局构建器
/// 根据屏幕宽度自动选择 compact / medium / expanded 布局
class AdaptiveLayout extends StatelessWidget {
  const AdaptiveLayout({
    super.key,
    required this.compact,
    required this.medium,
    required this.expanded,
  });

  final WidgetBuilder compact;
  final WidgetBuilder medium;
  final WidgetBuilder expanded;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final layoutType = getLayoutType(constraints.maxWidth);
        switch (layoutType) {
          case LayoutType.compact:
            return compact(context);
          case LayoutType.medium:
            return medium(context);
          case LayoutType.expanded:
            return expanded(context);
        }
      },
    );
  }
}
