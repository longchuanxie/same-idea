# Novel Creator 编码规范

> 参考业界标准：[Effective Dart](https://dart.dev/guides/language/effective-dart)、[Very Good Analysis](https://github.com/VeryGoodOpenSource/very_good_analysis)、[Flutter Clean Architecture](https://resocoder.com/flutter-clean-architecture-tutorial/)，结合项目特性定制。

---

## 1. 总则

### 1.1 核心原则

- **可读性优先**：代码被阅读的次数远多于被编写的次数
- **显式优于隐式**：避免魔法数字、魔法字符串、隐式依赖
- **不可变优先**：领域实体不可变，状态变更通过拷贝或 BLoC 事件驱动
- **最小权限**：变量、类、方法取最小可见性；默认 `final`，需变更时才用可变
- **失败快速**：错误尽早暴露，不静默吞掉异常
- **单一职责**：每个类/函数只做一件事

### 1.2 禁止事项

- 禁止提交密钥、Token、API Key 到代码仓库
- 禁止 Agent 静默覆盖用户正文
- 禁止绕过 Repository 直接操作数据库
- 禁止在 Domain 层引用 Flutter Widget
- 禁止 `print()` 代替日志系统
- 禁止空 `catch` 块
- 禁止硬编码颜色值、尺寸值（必须通过 Theme/常量定义）

---

## 2. 命名规范

### 2.1 基本规则

| 标识符类型 | 规则 | 示例 |
|---|---|---|
| 文件名 | snake_case | `chapter_repository.dart` |
| 目录名 | snake_case | `knowledge_base/` |
| 类名 / 枚举类型名 | PascalCase | `ChapterRepository`, `RevisionStatus` |
| 扩展类名以类型后缀 | PascalCase + 后缀 | `ChapterBloc`, `ProjectEvent`, `EditorState` |
| 变量 / 函数 / 方法 | camelCase | `wordCount`, `saveContent()` |
| 常量 | lowerCamelCase | `defaultDebounceMs` |
| 私有成员 | 前缀 `_` | `_pendingRevisions`, `_handleSave()` |
| 枚举值 | lowerCamelCase | `draft`, `reviewing`, `revised` |
| 回调参数 | 以 `on` 前缀 | `onAccepted`, `onRevisionCreated` |
| 布尔变量/方法 | `is`/`has`/`should`/`can` 前缀 | `isDraft`, `hasPendingRevision`, `shouldAutoSave` |

### 2.2 文件组织命名

```
类型                  命名模式                    示例
──────────────────────────────────────────────────────────
实体 (freezed)        {entity}.dart               chapter.dart
实体 + 生成文件       {entity}.freezed.dart        chapter.freezed.dart
                     {entity}.g.dart              chapter.g.dart
Repository 接口       {entity}_repository.dart     chapter_repository.dart
Repository 实现       {entity}_repository_impl.dart chapter_repository_impl.dart
BLoC                  {feature}_bloc.dart          workspace_bloc.dart
BLoC 事件             {feature}_event.dart         workspace_event.dart
BLoC 状态             {feature}_state.dart         workspace_state.dart
Widget                {description}_widget.dart     chapter_list_widget.dart
页面                  {description}_page.dart       project_overview_page.dart
```

### 2.3 导入顺序

文件内 import 按以下顺序排列，各组之间空一行：

```dart
// 1. Dart SDK
import 'dart:async';
import 'dart:convert';

// 2. Flutter 框架
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// 3. 第三方包
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:isar/isar.dart';

// 4. 项目内 domain 层
import 'package:novel_creator/domain/domain.dart';

// 5. 项目内其他层
import 'package:novel_creator/data/data.dart';
import 'package:novel_creator/editor/editor.dart';

// 6. 相对路径（仅在必要时）
import 'chapter_repository_impl.helper.dart';
```

禁止使用相对路径跨层引用。同目录内的辅助文件允许相对路径。

---

## 3. 类型系统

### 3.1 空安全

- 所有代码必须开启空安全（sound null safety）
- 优先使用非空类型，`?` 仅在逻辑上确实可空时使用
- 使用 `late` 仅表示"稍后初始化但使用前一定已赋值"，不用于逃避空检查
- 避免 `!` 强制解包，除非编译器无法推断但运行时保证非空

```dart
// Good
final String title;
final List<Revision>? pendingRevisions;

// Bad
late String title;        // 除非生命周期保证
final String name = null!; // 绝对禁止
```

### 3.2 类型注解

- 公共 API 必须显式声明返回类型
- 局部变量：类型可推断时省略，不可推断时显式声明
- 回调参数始终显式声明类型

```dart
// Good
String formatTitle(String title) => title.trim();
final chapters = repository.getAll(); // 类型可推断

// Bad
formatTitle(title) => title.trim(); // 缺少返回类型和参数类型
List<Chapter> chapters = repository.getAll(); // 冗余类型注解
```

### 3.3 集合类型

- 优先使用 `List`、`Map`、`Set` 字面量语法
- 不可变集合：实体字段用 `List`（freezed 保障不可变），需可变时用 `final list = <T>[...]` 再 copy
- 空集合用 `const []` 或 `const {}`

```dart
// Good
final List<String> tags = const [];
final chapters = <Chapter>[...];

// Bad
final tags = <String>[]; // 无 const
List<String>? tags = null; // 用可空集合代替空集合
```

---

## 4. 实体与数据模型

### 4.1 Freezed 实体

所有核心实体必须使用 `freezed` + `json_serializable`：

```dart
@freezed
class Chapter with _$Chapter {
  const Chapter._();

  const factory Chapter({
    required String id,
    required String projectId,
    String? outlineNodeId,
    required String title,
    required int order,
    @Default(ContentFormat.markdown) ContentFormat contentFormat,
    @Default('') String content,
    @Default('') String plainTextCache,
    @Default(0) int wordCount,
    @Default(ChapterStatus.draft) ChapterStatus status,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _Chapter;

  factory Chapter.fromJson(Map<String, dynamic> json) =>
      _$ChapterFromJson(json);

  int get effectiveWordCount => plainTextCache.isNotEmpty
      ? plainTextCache.length
      : wordCount;
}
```

规则：
- 每个实体必须包含 `id`、`projectId`、`createdAt`、`updatedAt`、`schemaVersion`
- 使用 `@Default()` 提供字段默认值
- 计算属性放在 `const ClassName._()` 私有构造函数下方
- 禁止在实体中注入 Repository 或 Service
- 禁止实体中包含 Stream / Future / ChangeNotifier

### 4.2 枚举

枚举必须定义在独立文件或与强关联实体同文件，使用 `freezed` 联合类型替代复杂枚举：

```dart
// 简单枚举
enum ChapterStatus {
  draft,
  reviewing,
  revised,
  locked,
  published;
}

// 复杂变体使用 freezed 联合类型
@freezed
sealed class RevisionOperation with _$RevisionOperation {
  const factory RevisionOperation.insert({
    required RevisionAnchor anchor,
    required String afterText,
  }) = InsertOperation;

  const factory RevisionOperation.replace({
    required RevisionAnchor anchor,
    required String beforeText,
    required String afterText,
  }) = ReplaceOperation;

  const factory RevisionOperation.delete({
    required RevisionAnchor anchor,
    required String beforeText,
  }) = DeleteOperation;
}
```

### 4.3 DTO 与实体转换

- `data/` 层可定义 DTO 用于存储映射，DTO 不泄漏到 `domain/`
- DTO 与实体转换方法定义在 DTO 类上：`toEntity()` / `fromEntity()`
- 永远不在 UI 层做 DTO 转换

---

## 5. 架构层次

### 5.1 依赖方向（强制）

```
UI (features/) ──> domain/ <-- data/
                  ^           ^
         agent/ ──           ── editor/

infrastructure (infra/) 被 domain 接口反向依赖（依赖倒置）
```

| 层 | 可依赖 | 禁止依赖 |
|---|---|---|
| `domain/` | `core/` | `data/`, `features/`, `flutter/widgets.dart` |
| `data/` | `domain/`, `core/` | `features/` |
| `agent/` | `domain/`, `core/` | `features/`, `data/` |
| `editor/` | `domain/`, `core/` | `features/`, `data/`, `agent/` |
| `features/` | 所有层 | — |
| `infra/` | `domain/`（接口）, `core/` | `features/` |

### 5.2 Repository 模式

接口定义在 `domain/`，实现在 `data/`：

```dart
// domain/repositories/chapter_repository.dart
abstract class ChapterRepository {
  Future<AppResult<Chapter>> getById(String id);
  Future<AppResult<List<Chapter>>> getByProjectId(String projectId);
  Future<AppResult<Chapter>> saveContent(String id, String content);
  Future<AppResult<void>> delete(String id);
  Stream<AppResult<Chapter>> watchById(String id);
}

// data/repositories/chapter_repository_impl.dart
class ChapterRepositoryImpl implements ChapterRepository {
  final Isar _isar;
  // ...
}
```

规则：
- Repository 方法必须返回 `AppResult<T>`，禁止抛出未捕获异常
- Repository 不做 UI 逻辑（如排序给列表展示）
- 批量操作提供事务语义
- Watch 方法返回 `Stream`，用于响应式 UI

### 5.3 依赖注入

使用 `get_it` + `injectable`：

```dart
// 服务注册在 main.dart 或独立模块
final locator = GetIt.instance;

// 通过构造函数注入，禁止在类内部直接 locate
class WorkspaceBloc extends Bloc<WorkspaceEvent, WorkspaceState> {
  final ChapterRepository _chapterRepository;
  final ProjectRepository _projectRepository;

  WorkspaceBloc(this._chapterRepository, this._projectRepository);
}
```

规则：
- 构造函数注入优先
- 禁止在 Domain/Repository 层使用 `locator<T>()`
- UI 层仅在无法通过构造函数传递时使用 `locator`

---

## 6. 状态管理

### 6.1 BLoC 模式

采用 `flutter_bloc`，每个功能模块对应一个 BLoC：

```
features/workspace/
  bloc/
    workspace_bloc.dart
    workspace_event.dart
    workspace_state.dart
  widgets/
    ...
  workspace_page.dart
```

### 6.2 Event 规范

```dart
@immutable
sealed class WorkspaceEvent {
  const WorkspaceEvent();
}

final class WorkspaceStarted extends WorkspaceEvent {
  const WorkspaceStarted({required this.projectId});
  final String projectId;
}

final class ChapterSelected extends WorkspaceEvent {
  const ChapterSelected({required this.chapterId});
  final String chapterId;
}

final class ContentChanged extends WorkspaceEvent {
  const ContentChanged({required this.content});
  final String content;
}
```

规则：
- Event 使用 `sealed class` + `final class`（freezed 可选）
- Event 是不可变的
- 命名使用过去式或名词短语：`ChapterSelected`、`ContentChanged`
- 每个 Event 只携带必要数据

### 6.3 State 规范

```dart
@immutable
sealed class WorkspaceState {
  const WorkspaceState();
}

final class WorkspaceInitial extends WorkspaceState {
  const WorkspaceInitial();
}

final class WorkspaceLoadInProgress extends WorkspaceState {
  const WorkspaceLoadInProgress();
}

final class WorkspaceLoadSuccess extends WorkspaceState {
  const WorkspaceLoadSuccess({
    required this.project,
    required this.chapters,
    this.activeChapterId,
    this.isSaving = false,
    this.saveError,
  });

  final Project project;
  final List<Chapter> chapters;
  final String? activeChapterId;
  final bool isSaving;
  final AppError? saveError;

  WorkspaceLoadSuccess copyWith({...}) => ...;
}
```

规则：
- State 使用 `sealed class`，确保穷举匹配
- State 必须不可变
- 加载状态不使用可空数据叠加，而用独立状态类
- 异步操作状态通过字段标记（`isSaving`、`saveError`），不用独立状态类（避免状态爆炸）
- 提供 `copyWith` 方法

### 6.4 BLoC 规范

```dart
class WorkspaceBloc extends Bloc<WorkspaceEvent, WorkspaceState> {
  WorkspaceBloc({
    required ChapterRepository chapterRepository,
    required ProjectRepository projectRepository,
  })  : _chapterRepository = chapterRepository,
        _projectRepository = projectRepository,
        super(const WorkspaceInitial()) {
    on<WorkspaceStarted>(_onStarted);
    on<ChapterSelected>(_onChapterSelected);
    on<ContentChanged>(_onContentChanged);
  }

  final ChapterRepository _chapterRepository;
  final ProjectRepository _projectRepository;

  Future<void> _onStarted(
    WorkspaceStarted event,
    Emitter<WorkspaceState> emit,
  ) async {
    emit(const WorkspaceLoadInProgress());
    final result = await _projectRepository.getById(event.projectId);
    // handle result...
  }
}
```

规则：
- 构造函数中注册事件处理器
- 事件处理器方法以 `_on` 前缀命名
- 每个 `emit` 调用都创建新 State 对象
- 不在 BLoC 中直接访问 UI 上下文（Navigator、Theme、Context）
- 长时间操作使用 `EventTransformer` 防抖

### 6.5 防抖与节流

```dart
EventTransformer<T> debounce<T>(Duration duration) {
  return (events, mapper) => events.debounceTime(duration).asyncExpand(mapper);
}

// 在 BLoC 构造函数中使用
on<ContentChanged>(
  _onContentChanged,
  transformer: debounce(const Duration(seconds: 1)),
);
```

---

## 7. Widget 规范

### 7.1 Widget 拆分原则

- 单个 Widget 的 `build` 方法不超过 80 行
- 超过时拆分为私有 `_buildXxx` 方法或独立 Widget
- 可复用的 UI 片段提取为独立 Widget 文件
- 状态展示与逻辑分离：Widget 只读 BLoC State，不持有业务数据

### 7.2 Widget 文件结构

```dart
class ChapterEditorPage extends StatelessWidget {
  const ChapterEditorPage({super.key, required this.projectId});

  final String projectId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          locator<EditorBloc>()..add(EditorStarted(projectId: projectId)),
      child: const _ChapterEditorView(),
    );
  }
}

class _ChapterEditorView extends StatelessWidget {
  const _ChapterEditorView();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<EditorBloc, EditorState>(
      builder: (context, state) {
        return switch (state) {
          EditorInitial() => const _EditorLoading(),
          EditorLoadInProgress() => const _EditorLoading(),
          EditorLoadSuccess() => _EditorContent(state: state),
          EditorLoadFailure() => _EditorError(state: state),
        };
      },
    );
  }
}
```

### 7.3 规则

- 页面级 Widget 用 `const` 构造函数 + `super.key`
- 页面只负责创建 BLoC 和布局骨架，具体内容用私有 Widget
- 使用 `switch` 表达式匹配 sealed State
- 每个可交互元素必须有语义标签（`Semantics` / `tooltip`）
- 桌面端必须支持键盘导航和焦点管理

### 7.4 Theme 使用

```dart
// Good 使用 Theme 扩展或常量
final color = context.colors.morandiSage;
final textStyle = context.textStyles.bodyLarge;

// Bad 硬编码
final color = Color(0xFF8B9D83);
final textStyle = TextStyle(fontSize: 16);
```

- 所有颜色通过 `ThemeExtension` 定义莫兰迪色系
- 间距使用 `SizedBox` + 8pt 网格倍数
- 圆角、阴影通过 Theme 统一

---

## 8. 异步与错误处理

### 8.1 AppResult 模式

```dart
@freezed
sealed class AppResult<T> with _$AppResult<T> {
  const factory AppResult.success(T data) = Success<T>;
  const factory AppResult.failure(AppError error) = Failure<T>;
}
```

使用方式：

```dart
final result = await _repository.saveContent(id, content);
result.when(
  success: (chapter) => emit(state.copyWith(isSaving: false)),
  failure: (error) => emit(state.copyWith(isSaving: false, saveError: error)),
);
```

规则：
- Repository / Service 层所有公共方法返回 `AppResult<T>`
- BLoC 内部处理 `AppResult`，将错误映射为 State 字段
- UI 层通过 BLoC State 获取错误信息，不直接处理 `AppResult`
- 禁止 BLoC 向 UI 层抛出异常

### 8.2 异步操作状态

每个异步操作在 State 中必须体现：

```dart
class EditorLoadSuccess extends EditorState {
  final Chapter chapter;
  final bool isSaving;
  final AppError? saveError;
  final bool isGenerating;
  final AppError? generateError;
}
```

### 8.3 Stream 处理

```dart
// Good 使用 BlocListener 或 StreamBuilder
BlocListener<EditorBloc, EditorState>(
  listenWhen: (previous, current) =>
      previous.saveError != current.saveError,
  listener: (context, state) {
    if (state.saveError != null) {
      _showErrorSnackBar(context, state.saveError!);
    }
  },
  child: ...,
)

// Bad 在 BlocBuilder 中处理副作用
BlocBuilder<EditorBloc, EditorState>(
  builder: (context, state) {
    if (state.saveError != null) {
      ScaffoldMessenger.of(context).showSnackBar(...); // 副作用在 builder 中
    }
    return ...;
  },
)
```

规则：
- 副作用（导航、弹窗、SnackBar）使用 `BlocListener`
- 数据展示使用 `BlocBuilder`
- 组合使用 `BlocConsumer` 或 `MultiBlocListener`
- Stream 订阅必须在 `dispose` 时取消

### 8.4 取消与超时

```dart
// Agent 任务必须支持取消
final cancelToken = CancelToken();
try {
  final result = await _llmClient.streamGenerate(
    prompt: prompt,
    cancelToken: cancelToken,
  );
} on CancelException {
  // 任务已取消，不视为错误
  emit(state.copyWith(isGenerating: false));
}

// 网络请求设置超时
final result = await _repository
    .saveContent(id, content)
    .timeout(const Duration(seconds: 10));
```

---

## 9. 日志与调试

### 9.1 日志分级

```dart
enum LogLevel { verbose, debug, info, warning, error, fatal }

class AppLogger {
  static void debug(String message, {String? tag, Object? error}) {...}
  static void info(String message, {String? tag, Object? error}) {...}
  static void warning(String message, {String? tag, Object? error}) {...}
  static void error(String message, {String? tag, Object? error, StackTrace? stackTrace}) {...}
}
```

规则：
- 使用 `AppLogger` 代替 `print()` / `debugPrint()`
- Release 构建不输出 debug/verbose 日志
- 错误日志必须包含 `StackTrace`
- 日志不得包含 API Key、Token、用户正文全文
- 每条日志附带 `tag`（模块名或类名）

### 9.2 日志标签约定

| 层 | tag 格式 | 示例 |
|---|---|---|
| Repository | `Repo:{Entity}` | `Repo:Chapter` |
| BLoC | `Bloc:{Feature}` | `Bloc:Workspace` |
| Agent | `Agent:{Tool}` | `Agent:Rewrite` |
| LLM | `LLM:{Provider}` | `LLM:OpenAI` |
| Editor | `Editor:{Action}` | `Editor:Save` |

---

## 10. 测试规范

### 10.1 测试结构

```
test/
  unit/
    domain/
      entities/
      enums/
    data/
      repositories/
    agent/
      tools/
    editor/
      commands/
  integration/
    storage/
    agent_flow/
    export/
  helpers/
    mocks/
    fakes/
    test_data.dart
```

### 10.2 命名

测试文件：`{被测文件}_test.dart`
测试组：`group('{ClassName}', () {...})`
测试用例：`test('should {期望行为} when {条件}', () {...})`

```dart
group('ChapterRepository', () {
  group('saveContent', () {
    test('should return success when content is valid', () async {
      // arrange
      final chapter = ChapterTestData.defaultChapter;
      when(() => mockIsar.put(any())).thenAnswer((_) async => chapter.id);

      // act
      final result = await repository.saveContent(chapter.id, 'new content');

      // assert
      expect(result, isA<Success<Chapter>>());
    });

    test('should return failure when storage write fails', () async {
      // arrange
      when(() => mockIsar.put(any())).thenThrow(IsarError('disk full'));

      // act
      final result = await repository.saveContent(chapter.id, 'content');

      // assert
      expect(result, isA<Failure<Chapter>>());
      expect((result as Failure).error.source, AppErrorSource.storage);
    });
  });
});
```

### 10.3 AAA 模式

所有测试遵循 Arrange-Act-Assert 模式，用注释标注三段。

### 10.4 Mock 与 Fake

- 使用 `mocktail` 生成 Mock
- 简单数据对象用 Fake（手写子类覆盖必要方法）
- Mock 定义集中在 `test/helpers/mocks/`
- 每个 Repository 接口对应一个 Mock 和一个 Fake

### 10.5 测试覆盖要求

| 类型 | 最低覆盖 |
|---|---|
| Domain 实体与枚举 | 100% |
| Repository 接口方法 | 每个方法正常+失败路径 |
| BLoC Event 处理 | 每个 Event 的每个 State 转换 |
| Agent 工具 | 每个工具的正常、失败、边界输入 |
| Widget | 关键交互路径（点击、输入、状态切换） |
| 导出 | 每种格式的正常输出和失败降级 |

### 10.6 金句

- 测试行为，不测试实现
- 每个测试只验证一件事
- 测试必须可独立运行，不依赖执行顺序
- 测试数据使用工厂方法，不内联构造

---

## 11. 安全规范

### 11.1 密钥管理

- API Key 使用 `flutter_secure_storage` 加密存储
- 内存中 API Key 不以明文日志输出
- Web 端必须提示"API Key 将存储在浏览器本地，存在暴露风险"
- `.gitignore` 必须排除 `*.env`、`credentials.*`、`secrets.*`

### 11.2 数据隐私

- 联网搜索前展示"以下内容将被发送"提示
- LLM 调用前展示"以下文本将发送到模型"提示（首次必显，后续可配置）
- 本地数据不自动上传
- 导出的 Project Package 不包含 API Key

### 11.3 输入校验

```dart
// Good 使用 form validation
final titleResult = TitleInput.dirty(title);
if (titleResult.isNotValid) {
  return; // 显示验证错误
}

// Good 使用 Repository 层断言
Future<AppResult<Chapter>> saveContent(String id, String content) async {
  if (id.isEmpty) {
    return AppResult.failure(AppError(
      code: 'INVALID_INPUT',
      message: 'Chapter ID must not be empty',
      userMessage: 'Invalid chapter',
      recoverable: true,
      source: AppErrorSource.storage,
    ));
  }
  // ...
}
```

规则：
- UI 层做格式校验（必填、长度、格式）
- Repository 层做数据完整性校验（ID 非空、关系存在）
- 禁止信任外部输入（搜索结果、LLM 输出、导入数据）

---

## 12. 性能规范

### 12.1 懒加载

- 章节列表只加载元数据（标题、字数、状态），不加载正文
- 正文在用户切换到该章节时加载
- 长列表使用 `ListView.builder`
- 知识库条目使用分页或虚拟滚动

### 12.2 防抖与缓存

- 编辑器保存：debounce 1-2 秒
- 搜索输入：debounce 300ms
- 字数统计：基于 `plainTextCache` 而非实时计算
- 模型调用结果缓存到 Session，避免重复请求

### 12.3 内存管理

```dart
// Good 及时取消订阅
class _ChapterEditorViewState extends State<_ChapterEditorView> {
  StreamSubscription<Chapter>? _chapterSubscription;

  @override
  void dispose() {
    _chapterSubscription?.cancel();
    super.dispose();
  }
}

// Good 使用 const 构造函数减少重建
return const _LoadingIndicator();

// Good 避免在 build 中创建对象
class _ChapterEditorView extends StatelessWidget {
  const _ChapterEditorView({required this.chapter});

  final Chapter chapter; // 从外部传入，不在 build 中创建
}
```

规则：
- StreamSubscription / TextEditingController / FocusNode 在 `dispose` 中释放
- Widget 尽可能 `const`
- 不在 `build` 方法中创建 BLoC / Repository 实例
- 大文本分段渲染，避免单次构建超长 Widget 树

### 12.4 流式输出

Agent 流式生成时：
- 使用 `StreamBuilder` 或 `BlocBuilder` 逐 token 更新
- 不阻塞编辑器主线程
- 提供取消按钮
- 已生成部分在取消后保留为草稿建议

---

## 13. 文档与注释

### 13.1 注释原则

- 代码自文档化优先，注释补充"为什么"而非"做什么"
- 公共 API 必须有 `///` 文档注释
- 复杂算法、业务规则、状态机转换必须注释说明
- TODO 使用格式：`// TODO(username): 描述`

### 13.2 文档注释

```dart
/// 保存章节正文内容。
///
/// 使用 debounce 策略，在用户停止输入 [debounceMs] 毫秒后触发保存。
/// 保存失败时保留内存态并设置 [saveError]，不丢失用户内容。
///
/// 返回 [AppResult.success] 包含更新后的 [Chapter]，
/// 或 [AppResult.failure] 包含存储错误信息。
Future<AppResult<Chapter>> saveContent(String id, String content);
```

### 13.3 禁止

- 禁止注释掉的代码提交（删除它，需要时从 git 恢复）
- 禁止无意义注释（`// init`、`// constructor`）
- 禁止以注释方式禁用 lint 规则（除非有充分理由并标注原因）

---

## 14. Git 规范

### 14.1 分支策略

```
main              稳定分支，可发布
  └── develop     开发集成分支
       └── feature/{阶段}-{描述}   功能分支
       └── fix/{描述}              修复分支
```

### 14.2 提交信息

格式：`<type>(<scope>): <description>`

| type | 用途 |
|---|---|
| feat | 新功能 |
| fix | 修复 bug |
| refactor | 重构（不改变功能） |
| test | 添加或修改测试 |
| docs | 文档变更 |
| chore | 构建、依赖、配置 |
| style | 格式调整（不影响逻辑） |

示例：
```
feat(domain): add Chapter entity with status machine
fix(editor): prevent content loss on save failure
test(repository): add failure path tests for ChapterRepository
```

### 14.3 提交粒度

- 每次提交是一个逻辑变更
- 不混合功能新增和 bug 修复
- 不提交无法编译或测试失败的代码
- 生成代码（`.freezed.dart`、`.g.dart`）必须提交

---

## 15. Lint 配置

项目使用 `very_good_analysis` 严格规则集，配置文件 `analysis_options.yaml` 放在项目根目录。

每次提交前必须通过：
```bash
flutter analyze
flutter test
```

零 warning 零 error 方可合并。
