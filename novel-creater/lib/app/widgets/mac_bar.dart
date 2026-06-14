import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:novel_creator/app/theme/app_radius.dart';
import 'package:novel_creator/app/theme/app_spacing.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

/// macOS 风格窗口栏，对齐原型 .mac-bar。
///
/// 结构：交通灯 + 标签页条 + 工具栏（保存状态/撤销重做/分栏/头像）
class MacBar extends StatelessWidget {
  const MacBar({
    required this.saveStatusLabel,
    required this.onBack,
    this.isDark = false,
    this.onToggleAgentPanel,
    this.showAgentPanel = true,
    super.key,
  });

  final String saveStatusLabel;
  final VoidCallback onBack;
  final bool isDark;
  final VoidCallback? onToggleAgentPanel;
  final bool showAgentPanel;

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;

    return Container(
      height: AppSpacing.macBarHeight,
      decoration: BoxDecoration(
        color: bg.withOpacity(0.86),
        border: Border(bottom: BorderSide(color: line)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxxx),
        child: Row(
          children: [
            _TrafficLights(isDark: isDark),
            const SizedBox(width: AppSpacing.xl),
            Expanded(child: _TabStrip(isDark: isDark)),
            _ChromeTools(
              saveStatusLabel: saveStatusLabel,
              onBack: onBack,
              isDark: isDark,
              onToggleAgentPanel: onToggleAgentPanel,
              showAgentPanel: showAgentPanel,
            ),
          ],
        ),
      ),
    );
  }
}

/// 交通灯（红/黄/绿圆点）
class _TrafficLights extends StatelessWidget {
  const _TrafficLights({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _TrafficDot(color: const Color(0xFFEC6A5E)),
        const SizedBox(width: 9),
        _TrafficDot(color: const Color(0xFFF5BD4F)),
        const SizedBox(width: 9),
        _TrafficDot(color: const Color(0xFF61C554)),
      ],
    );
  }
}

class _TrafficDot extends StatelessWidget {
  const _TrafficDot({required this.color});

  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            offset: const Offset(0, 0),
            blurRadius: 0,
            spreadRadius: 0.5,
          ),
        ],
      ),
    );
  }
}

/// 标签页条（简化版：显示当前项目名）
class _TabStrip extends StatelessWidget {
  const _TabStrip({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    // 简化实现：单标签显示当前项目
    return Row(
      children: [
        _TabButton(
          icon: LucideIcons.users,
          label: '当前项目',
          isActive: true,
          isDark: isDark,
        ),
        const SizedBox(width: 2),
        _TabAddButton(isDark: isDark),
      ],
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.isDark,
  });

  final IconData icon;
  final String label;
  final bool isActive;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final surface = isDark ? MorandiColors.darkSurface : MorandiColors.surface;
    final line = isDark ? MorandiColors.darkLine : MorandiColors.line;
    final textColor = isActive
        ? (isDark ? MorandiColors.darkText : MorandiColors.text)
        : (isDark ? MorandiColors.darkMuted : MorandiColors.muted);

    return Container(
      height: 43,
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
      decoration: isActive
          ? BoxDecoration(
              color: surface,
              border: Border(
                top: BorderSide(color: line),
                left: BorderSide(color: line),
                right: BorderSide(color: line),
              ),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(AppRadius.tabTop),
                topRight: Radius.circular(AppRadius.tabTop),
              ),
            )
          : null,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: AppSpacing.iconSmall, color: textColor),
          const SizedBox(width: 9),
          Text(
            label,
            style: AppTypography.small(color: textColor, weight: AppTypography.weightRegular),
            overflow: TextOverflow.ellipsis,
          ),
          if (isActive) ...[
            const SizedBox(width: 9),
            Icon(LucideIcons.x, size: 14, color: isDark ? MorandiColors.darkFaint : MorandiColors.faint),
          ],
        ],
      ),
    );
  }
}

class _TabAddButton extends StatelessWidget {
  const _TabAddButton({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    return SizedBox(
      width: 44,
      height: 43,
      child: Icon(LucideIcons.plus, size: AppSpacing.iconSmall, color: muted),
    );
  }
}

/// 右侧工具栏
class _ChromeTools extends StatelessWidget {
  const _ChromeTools({
    required this.saveStatusLabel,
    required this.onBack,
    required this.isDark,
    this.onToggleAgentPanel,
    this.showAgentPanel = true,
  });

  final String saveStatusLabel;
  final VoidCallback onBack;
  final bool isDark;
  final VoidCallback? onToggleAgentPanel;
  final bool showAgentPanel;

  @override
  Widget build(BuildContext context) {
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;
    final green = isDark ? MorandiColors.darkGreen : MorandiColors.green;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // 保存状态
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(LucideIcons.save, size: 17, color: green),
            const SizedBox(width: AppSpacing.xs),
            Text(
              saveStatusLabel,
              style: AppTypography.caption(color: muted),
            ),
          ],
        ),
        const SizedBox(width: AppSpacing.xl),
        // 撤销/重做
        _GhostIconButton(icon: LucideIcons.undo2, isDark: isDark),
        const SizedBox(width: AppSpacing.xs),
        _GhostIconButton(icon: LucideIcons.redo2, isDark: isDark),
        const SizedBox(width: AppSpacing.xl),
        // 分栏/面板
        _GhostIconButton(icon: LucideIcons.panelLeft, isDark: isDark),
        const SizedBox(width: AppSpacing.xs),
        _GhostIconButton(
          icon: showAgentPanel ? LucideIcons.panelRightClose : LucideIcons.panelRightOpen,
          isDark: isDark,
          onPressed: onToggleAgentPanel,
          tooltip: showAgentPanel ? '关闭 Agent 面板' : '打开 Agent 面板',
        ),
        const SizedBox(width: AppSpacing.xl),
        // 头像
        _Avatar(isDark: isDark),
      ],
    );
  }
}

class _GhostIconButton extends StatelessWidget {
  const _GhostIconButton({
    required this.icon,
    required this.isDark,
    this.onPressed,
    this.tooltip,
  });

  final IconData icon;
  final bool isDark;
  final VoidCallback? onPressed;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    final muted = isDark ? MorandiColors.darkMuted : MorandiColors.muted;

    return SizedBox(
      width: AppSpacing.iconButtonSize,
      height: AppSpacing.iconButtonSize,
      child: IconButton(
        icon: Icon(icon, size: AppSpacing.iconMedium),
        color: muted,
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(),
        onPressed: onPressed,
        tooltip: tooltip ?? '',
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  const _Avatar({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final green2 = isDark ? MorandiColors.darkGreen2 : MorandiColors.green2;

    return Container(
      width: AppSpacing.avatarSize,
      height: AppSpacing.avatarSize,
      decoration: BoxDecoration(
        color: green2,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            offset: Offset.zero,
            blurRadius: 0,
            spreadRadius: 0.5,
          ),
        ],
      ),
      alignment: Alignment.center,
      child: Text(
        'W',
        style: AppTypography.small(color: Colors.white, weight: AppTypography.weightBold),
      ),
    );
  }
}
