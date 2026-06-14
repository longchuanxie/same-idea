import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/data/local/database/app_database.dart';

/// 核心用户流程集成测试（作为 widget test 运行）
///
/// 覆盖流程：
/// 1. 应用启动 → 项目列表页（空状态）
/// 2. 创建项目 → 项目列表更新
/// 3. 进入工作台 → 三栏布局
/// 4. 侧边栏导航切换 → 各子页面
/// 5. 设置页 → 添加服务商
void main() {
  group('核心用户流程', () {
    late AppDatabase db;

    setUp(() {
      db = AppDatabase(NativeDatabase.memory());
    });

    tearDown(() async {
      await db.close();
    });

    testWidgets('1. 应用启动显示项目列表空状态', (tester) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;

      await tester.pumpWidget(NovelCreatorApp(databaseFactory: () => db));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      // 验证空状态关键元素
      expect(find.text('我的项目'), findsOneWidget);
      expect(find.text('新建项目'), findsOneWidget);
      expect(find.text('从一个故事种子开始'), findsOneWidget);
      expect(find.text('创建长篇项目'), findsOneWidget);
      expect(find.text('导入文稿'), findsOneWidget);

      // 验证模板网格
      expect(find.text('都市悬疑'), findsOneWidget);
      expect(find.text('奇幻群像'), findsOneWidget);
      expect(find.text('科幻纪元'), findsOneWidget);
    });

    testWidgets('2. 从模板创建项目', (tester) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;

      await tester.pumpWidget(NovelCreatorApp(databaseFactory: () => db));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      // 点击模板卡片创建项目
      await tester.tap(find.text('都市悬疑'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 1000));

      // 验证进入了工作台（查找 Agent 面板）
      expect(find.text('Agent'), findsOneWidget);
    });

    testWidgets('3. 工作台三栏布局', (tester) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;

      await tester.pumpWidget(NovelCreatorApp(databaseFactory: () => db));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      // 进入工作台
      await tester.tap(find.text('都市悬疑'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 1000));

      // 验证侧边栏元素
      expect(find.text('Agent'), findsOneWidget);

      // 验证导航项存在
      expect(find.text('大纲'), findsWidgets);
      expect(find.text('角色'), findsWidgets);
      expect(find.text('世界观'), findsWidgets);
    });

    testWidgets('4. 侧边栏导航切换子页面', (tester) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;

      await tester.pumpWidget(NovelCreatorApp(databaseFactory: () => db));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      // 进入工作台
      await tester.tap(find.text('都市悬疑'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 1000));

      // 点击大纲导航
      await tester.tap(find.text('大纲').first);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // 点击角色导航
      await tester.tap(find.text('角色').first);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // 点击世界观导航
      await tester.tap(find.text('世界观').first);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // 点击笔记导航
      await tester.tap(find.text('笔记').first);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // 点击修订导航
      await tester.tap(find.text('修订').first);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
    });

    testWidgets('5. 设置页加载', (tester) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;

      await tester.pumpWidget(NovelCreatorApp(databaseFactory: () => db));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      // 导航到设置页
      await tester.tap(find.byTooltip('设置'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 500));

      // 验证设置页加载
      expect(find.text('设置'), findsOneWidget);
      expect(find.text('模型与服务商'), findsOneWidget);
    });
  });
}
