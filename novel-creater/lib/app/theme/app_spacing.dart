/// 间距设计 Token，对齐原型 styles.css 中的尺寸值。
abstract final class AppSpacing {
  // ── 布局宽度 ──────────────────────────────────────────────

  /// --sidebar: 306px
  static const double sidebarWidth = 306;

  /// --agent: 356px
  static const double agentWidth = 356;

  /// Modal 内容区宽度
  static const double modalContentWidth = 360;

  /// 工作区最小宽度
  static const double workspaceMinWidth = 680;

  // ── 通用间距 ──────────────────────────────────────────────

  static const double xs = 4;
  static const double sm = 6;
  static const double md = 8;
  static const double lg = 10;
  static const double xl = 12;
  static const double xxl = 14;
  static const double xxxl = 16;
  static const double xxxx = 18;
  static const double xxxxl = 20;

  // ── 组件内边距 ────────────────────────────────────────────

  /// 侧边栏内边距
  static const double sidebarPadding = 16;

  /// Agent 面板内边距
  static const double agentPadding = 16;

  /// 工作区内边距
  static const double workspacePadding = 20;

  /// 卡片内边距
  static const double cardPadding = 18;

  /// 小卡片内边距
  static const double cardPaddingSmall = 12;

  // ── Mac-bar / Status-bar ─────────────────────────────────

  /// Mac-bar 高度
  static const double macBarHeight = 52;

  /// Status-bar 高度
  static const double statusBarHeight = 37;

  // ── 图标/按钮 ────────────────────────────────────────────

  /// 图标按钮尺寸
  static const double iconButtonSize = 32;

  /// 小图标尺寸
  static const double iconSmall = 16;

  /// 标准图标尺寸
  static const double iconMedium = 18;

  /// 大图标尺寸
  static const double iconLarge = 22;

  /// 头像尺寸
  static const double avatarSize = 30;

  // ── 搜索行 ───────────────────────────────────────────────

  /// 搜索框高度
  static const double searchBoxHeight = 34;

  /// 方形按钮尺寸
  static const double squareButtonSize = 34;
}
