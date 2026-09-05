import 'package:anniversary_app/src/app/anniversary_app.dart';
import 'package:anniversary_app/src/data/seed_anniversary_repository.dart';
import 'package:anniversary_app/src/data/windows_anniversary_repository.dart';
import 'package:anniversary_app/src/data/windows_settings_store.dart';
import 'package:anniversary_app/src/domain/anniversary_repository.dart';
import 'package:anniversary_app/src/features/detail/event_detail_screen.dart';
import 'package:anniversary_app/src/features/edit/event_edit_screen.dart';
import 'package:anniversary_app/src/features/home/home_screen.dart';
import 'package:anniversary_app/src/features/settings/settings_screen.dart';
import 'package:calendar_core/calendar_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'dart:io';

final _fixedToday = DateTime.utc(2026, 6, 19);

void main() {
  testWidgets('home renders seeded anniversary previews', (tester) async {
    await tester.pumpWidget(
      AnniversaryApp(repository: SeedAnniversaryRepository(today: _fixedToday)),
    );
    await tester.pumpAndSettle();

    expect(find.text('今念'), findsOneWidget);
    expect(find.text('妈妈生日'), findsWidgets);
    expect(find.textContaining('农历八月初三'), findsWidgets);
    expect(find.text('最近的纪念日'), findsOneWidget);
  });

  testWidgets('windows card keeps the nearest three events visible',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(460, 520));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      AnniversaryApp(repository: SeedAnniversaryRepository(today: _fixedToday)),
    );
    await tester.pumpAndSettle();

    expect(find.text('妈妈生日'), findsWidgets);
    expect(find.text('结婚纪念日'), findsOneWidget);
    expect(find.text('宝宝生日'), findsOneWidget);
    expect(find.byIcon(Icons.event_available_outlined), findsNWidgets(3));
  });

  testWidgets('windows card does not overflow in compact window',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(460, 480));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      AnniversaryApp(repository: SeedAnniversaryRepository(today: _fixedToday)),
    );
    await tester.pumpAndSettle();

    expect(tester.takeException(), isNull);
    expect(find.byIcon(Icons.add), findsWidgets);
  });

  testWidgets('main home can show and open all saved anniversaries',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(420, 620));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    final repository = SeedAnniversaryRepository(today: _fixedToday);
    await _addExtraEvents(repository, 5);

    await tester.pumpWidget(
      MaterialApp(
        routes: {
          HomeScreen.routeName: (_) => HomeScreen(repository: repository),
          EventDetailScreen.routeName: (_) => EventDetailScreen(
                repository: repository,
              ),
        },
      ),
    );
    await tester.pumpAndSettle();

    expect(await repository.listHomePreviews(), hasLength(8));
    await tester.scrollUntilVisible(
      find.text('Extra Event 5'),
      360,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Extra Event 5'), findsOneWidget);

    await tester.tap(find.text('Extra Event 5'));
    await tester.pumpAndSettle();

    expect(find.byType(EventDetailScreen), findsOneWidget);
    expect(find.text('Extra Event 5'), findsOneWidget);
  });

  testWidgets('windows card can scroll to every saved anniversary',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(460, 480));
    addTearDown(() => tester.binding.setSurfaceSize(null));
    final repository = SeedAnniversaryRepository(today: _fixedToday);
    await _addExtraEvents(repository, 5);

    await tester.pumpWidget(AnniversaryApp(repository: repository));
    await tester.pumpAndSettle();

    expect(find.text('全部小日子'), findsOneWidget);
    expect(find.text('8 个'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Extra Event 5'),
      360,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Extra Event 5'), findsOneWidget);

    await tester.tap(find.text('Extra Event 5'));
    await tester.pumpAndSettle();

    expect(find.byType(EventDetailScreen), findsOneWidget);
    expect(find.text('Extra Event 5'), findsOneWidget);
  });

  testWidgets('primary routes can be opened', (tester) async {
    final repository = SeedAnniversaryRepository(today: _fixedToday);
    await tester.pumpWidget(
      AnniversaryApp(repository: repository),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();
    expect(find.byType(EventEditScreen), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(3));

    Navigator.of(tester.element(find.byType(EventEditScreen))).pop();
    await tester.pumpAndSettle();

    await tester.tap(find.text('妈妈生日').last);
    await tester.pumpAndSettle();
    expect(find.byType(EventDetailScreen), findsOneWidget);
    expect(find.text('提前 7 天，当天 09:00'), findsOneWidget);
    expect(find.text('记得提前准备祝福。'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.edit_outlined));
    await tester.pumpAndSettle();
    expect(find.byType(EventEditScreen), findsOneWidget);
    final editTitleField =
        tester.widget<TextFormField>(find.byType(TextFormField).first);
    expect(
      editTitleField.controller?.text,
      (await repository.getEventDraft('mom-birthday'))?.title,
    );
    final editNoteField =
        tester.widget<TextFormField>(find.byType(TextFormField).last);
    expect(
      editNoteField.controller?.text,
      (await repository.getEventDraft('mom-birthday'))?.note,
    );
    expect(find.byType(TextFormField), findsNWidgets(3));

    Navigator.of(tester.element(find.byType(EventEditScreen))).pop();
    await tester.pumpAndSettle();

    Navigator.of(tester.element(find.byType(EventDetailScreen))).pop();
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.settings_outlined).first);
    await tester.pumpAndSettle();
    expect(find.byType(SettingsScreen), findsOneWidget);
    expect(find.text('本地数据目录'), findsOneWidget);
    expect(find.text('导入 Android 备份'), findsOneWidget);
    expect(find.text('刷新数据'), findsOneWidget);
    expect(find.text('通知提醒'), findsNothing);
    expect(find.text('小组件隐私模式'), findsNothing);
    expect(find.text('本地备份'), findsNothing);
    expect(find.text('恢复数据'), findsNothing);
    expect(find.text('外观模式'), findsNothing);
    expect(find.byIcon(Icons.chevron_right), findsNWidgets(3));
    expect(find.text('Windows 桌面组件'), findsOneWidget);
    expect(find.text('窗口置顶'), findsOneWidget);
    expect(find.text('关闭按钮'), findsOneWidget);
    expect(find.text('每次询问'), findsOneWidget);
  });

  testWidgets('settings actions show feedback when they run', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: SettingsScreen(
          windowsSettings: const WindowsWidgetSettings(),
          onWindowsSettingsChanged: (_) {},
          onRefreshWindowsData: () async => '已刷新本地数据',
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('刷新数据'));
    await tester.pumpAndSettle();

    expect(find.text('已刷新本地数据'), findsOneWidget);
  });

  testWidgets('android settings only exposes implemented entries',
      (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: SettingsScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('设置'), findsOneWidget);
    expect(find.text('外观模式'), findsOneWidget);
    expect(find.text('跟随系统'), findsOneWidget);
    expect(find.text('日期范围'), findsOneWidget);
    expect(find.text('农历 1901-2100'), findsOneWidget);
    expect(find.text('数据策略'), findsOneWidget);
    expect(find.text('本地优先'), findsOneWidget);
    expect(find.text('关于今念'), findsOneWidget);
    expect(find.text('本地优先与隐私'), findsOneWidget);
    expect(find.text('通知提醒'), findsNothing);
    expect(find.text('小组件隐私模式'), findsNothing);
    expect(find.text('本地备份'), findsNothing);
    expect(find.text('恢复数据'), findsNothing);
    expect(find.byIcon(Icons.chevron_right), findsNWidgets(2));

    await tester.tap(find.text('关于今念'));
    await tester.pumpAndSettle();

    expect(find.byType(AboutDialog), findsOneWidget);
    expect(find.text('今念'), findsWidgets);
    expect(find.text('1.0.0+1'), findsOneWidget);

    Navigator.of(tester.element(find.byType(AboutDialog))).pop();
    await tester.pumpAndSettle();

    await tester.tap(find.text('本地优先与隐私'));
    await tester.pumpAndSettle();

    expect(find.byType(AlertDialog), findsOneWidget);
    expect(
      find.textContaining('纪念日数据在本机运行环境中处理'),
      findsOneWidget,
    );
  });

  testWidgets('opening a preview card shows that event detail', (tester) async {
    await tester.pumpWidget(
      AnniversaryApp(repository: SeedAnniversaryRepository(today: _fixedToday)),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('宝宝生日'));
    await tester.pumpAndSettle();

    expect(find.byType(EventDetailScreen), findsOneWidget);
    expect(find.text('宝宝生日'), findsOneWidget);
    expect(find.text('妈妈生日'), findsNothing);
  });

  testWidgets('detail page can delete an existing event', (tester) async {
    final repository = SeedAnniversaryRepository(today: _fixedToday);
    await tester.pumpWidget(AnniversaryApp(repository: repository));
    await tester.pumpAndSettle();

    expect(
      (await repository.listHomePreviews()).map((event) => event.id),
      contains('baby-birthday'),
    );

    Navigator.of(tester.element(find.byType(Scaffold).first)).pushNamed(
      EventDetailScreen.routeName,
      arguments: 'baby-birthday',
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.delete_outline));
    await tester.pumpAndSettle();
    expect(find.byType(AlertDialog), findsOneWidget);

    await tester.tap(find.byType(FilledButton).last);
    await tester.pumpAndSettle();

    expect(
      (await repository.listHomePreviews()).map((event) => event.id),
      isNot(contains('baby-birthday')),
    );
    expect(find.byType(EventDetailScreen), findsNothing);
  });

  testWidgets('edit page allows calendar date selection modes', (tester) async {
    await tester.pumpWidget(
      AnniversaryApp(repository: SeedAnniversaryRepository(today: _fixedToday)),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();

    final titleField =
        tester.widget<TextFormField>(find.byType(TextFormField).first);
    expect(titleField.controller?.text, isEmpty);

    await tester.tap(find.text('公历'));
    await tester.pumpAndSettle();
    expect(find.text('公历日期'), findsOneWidget);
    expect(find.text('选择'), findsWidgets);

    await tester.tap(find.text('农历'));
    await tester.pumpAndSettle();
    expect(find.text('农历年'), findsOneWidget);
    expect(find.text('农历月'), findsOneWidget);
    expect(find.text('农历日'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('reminder time picker supports wheel and manual input modes',
      (tester) async {
    await tester.binding.setSurfaceSize(const Size(900, 900));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      AnniversaryApp(repository: SeedAnniversaryRepository(today: _fixedToday)),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.byIcon(Icons.access_time),
      240,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.byIcon(Icons.access_time));
    await tester.pumpAndSettle();

    expect(find.text('选择提醒时间'), findsOneWidget);
    expect(find.text('滚动选择'), findsOneWidget);
    expect(find.text('手动输入'), findsOneWidget);
    expect(find.byType(ListWheelScrollView), findsNWidgets(2));

    await tester.tap(find.text('手动输入'));
    await tester.pumpAndSettle();

    expect(
      find.descendant(
        of: find.byType(AlertDialog),
        matching: find.byType(TextField),
      ),
      findsNWidgets(2),
    );
    expect(find.text('小时'), findsOneWidget);
    expect(find.text('分钟'), findsOneWidget);
  });

  testWidgets('saving a new event returns to home and keeps the event',
      (tester) async {
    final repository = SeedAnniversaryRepository(today: _fixedToday);
    await tester.pumpWidget(AnniversaryApp(repository: repository));
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField).first, '真正保存的日子');
    await tester.enterText(find.byType(TextFormField).last, '这是一条备注');
    await tester.tap(
      find.descendant(
        of: find.byType(AppBar),
        matching: find.byIcon(Icons.check),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(EventEditScreen), findsNothing);
    expect(find.text('真正保存的日子'), findsWidgets);
    expect(
      (await repository.listHomePreviews()).map((event) => event.title),
      contains('真正保存的日子'),
    );
    final savedId = (await repository.listHomePreviews())
        .firstWhere((event) => event.title == '真正保存的日子')
        .id;
    final savedDraft = await repository.getEventDraft(savedId);
    expect(savedDraft?.note, '这是一条备注');
    expect(savedDraft?.reminderRule.enabled, isTrue);
    expect(savedDraft?.reminderRule.displayText, '提前 7 天，当天 09:00');
  });

  testWidgets('saving a duplicate event title stays on edit page',
      (tester) async {
    final repository = SeedAnniversaryRepository(today: _fixedToday);
    await tester.pumpWidget(AnniversaryApp(repository: repository));
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField).first, 'Unique Event');
    await tester.tap(
      find.descendant(
        of: find.byType(AppBar),
        matching: find.byIcon(Icons.check),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField).first, ' unique event ');
    await tester.tap(
      find.descendant(
        of: find.byType(AppBar),
        matching: find.byIcon(Icons.check),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.byType(EventEditScreen), findsOneWidget);
    expect(find.text('已存在同名纪念日，请换一个名称'), findsOneWidget);
    expect(
      (await repository.listHomePreviews())
          .where((event) => anniversaryTitleKey(event.title) == 'unique event'),
      hasLength(1),
    );
  });

  testWidgets('windows repository without cache renders an empty state',
      (tester) async {
    final cacheDir = Directory.systemTemp.createTempSync('days_empty_cache_');
    addTearDown(() => cacheDir.deleteSync(recursive: true));
    final repository = WindowsAnniversaryRepository(
      today: _fixedToday,
      cacheFile: File('${cacheDir.path}${Platform.pathSeparator}cache.json'),
    );

    await tester.pumpWidget(AnniversaryApp(repository: repository));
    await tester.pumpAndSettle();

    expect(find.text('还没有纪念日'), findsOneWidget);
    expect(find.text('妈妈生日'), findsNothing);
  });
}

Future<void> _addExtraEvents(SeedAnniversaryRepository repository, int count) async {
  for (var index = 1; index <= count; index++) {
    await repository.saveEvent(
      AnniversaryEventDraft(
        id: 'extra-event-$index',
        title: 'Extra Event $index',
        calendarType: CalendarType.gregorian,
        datePayload: GregorianDatePayload(
          year: 2026,
          month: 7,
          day: index,
          timezone: 'Asia/Shanghai',
        ),
        repeatRule: const RepeatRule(type: RepeatType.yearly),
      ),
    );
  }
}
