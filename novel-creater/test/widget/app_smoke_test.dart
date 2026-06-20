import 'package:drift/native.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:novel_creator/app/app.dart';
import 'package:novel_creator/data/local/database/app_database.dart';

void main() {
  testWidgets('starts on project list page', (tester) async {
    await tester.pumpWidget(
      NovelCreatorApp(
        databaseFactory: () => AppDatabase(NativeDatabase.memory()),
      ),
    );
    // 使用 pump 替代 pumpAndSettle，因为 SkeletonCard 有无限循环动画
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // App now starts on project list page
    expect(find.text('我的项目'), findsOneWidget);
    expect(find.text('新建项目'), findsOneWidget);
  });
}
