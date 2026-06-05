# Milestone 2: LLM Provider & Settings 设计文档

## 背景

Milestone 1 完成了核心写作闭环（Project → Chapter → Agent 建议 → RevisionPatch → 保存）。
当前写作工具 `MockWritingTool` 返回固定文本。里程碑 2 的目标是用真实 LLM 替换 Mock，同时还原原型 `settings.html` 的"模型与服务商"设置页。

## 总体策略

架构方案 A：分层接口 + 服务编排，保留 Mock fallback。

```
WorkspaceBloc → AgentWritingTool (interface)
                    ├── RealLlmWritingTool → ProviderResolver → LlmClient → OpenAI HTTP + SSE
                    └── MockWritingTool (fallback, 无 provider 时)
                          ↑
                    可通过设置页切换
```

## Scope

全量实现：Provider/Model 领域实体 + LlmProviderRepository + SecretStorage + OpenAI 兼容 HTTP 客户端（SSE 流式） + Settings UI（模型 Tab 完整，其余占位） + 用真实 LlmClient 替换 MockWritingTool。

## 新增依赖

- `http: ^1.2.2`（HTTP 调用 + streamed response）
- `flutter_secure_storage: ^9.2.2`（API Key 加密存储）

## Domain 层

### 实体：LlmProvider

```dart
@freezed
class LlmProvider with _$LlmProvider {
  const factory LlmProvider({
    required String id,
    required String projectId,
    required String name,            // 显示名：如 "我的 OpenAI"
    required String baseUrl,         // https://api.openai.com/v1
    required String secretKeyRef,    // SecretStorage 中的 key 引用
    required String? selectedModelId,
    @Default([]) List<LlmModel> cachedModels,  // API 获取缓存的模型列表
    @Default(0.7) double temperature,
    @Default(0.9) double topP,
    @Default(true) bool streamingEnabled,
    required ProviderStatus status,
    required DateTime createdAt,
    required DateTime updatedAt,
    @Default(1) int schemaVersion,
  }) = _LlmProvider;

  factory LlmProvider.fromJson(Map<String, dynamic> json) =>
      _$LlmProviderFromJson(json);
}
```

### 实体：LlmModel

```dart
@freezed
class LlmModel with _$LlmModel {
  const factory LlmModel({
    required String id,                  // 内部 id
    required String modelId,             // 提供商模型 id，如 gpt-4o
    required String name,                // 显示名
    int? contextLength,
    int? maxOutput,
    @Default(true) bool supportsStreaming,
    double? temperature,                 // 每模型独立温度；null 表示沿用 Provider/Default 设置
  }) = _LlmModel;

  factory LlmModel.fromJson(Map<String, dynamic> json) =>
      _$LlmModelFromJson(json);
}
```

**温度优先级解析**（构造 LlmRequest 时）：

```
LlmModel.temperature (per-model override)
  ↓ null 时回退
LlmProvider.temperature (per-provider default)
  ↓ null 时回退
LlmDefaultSettings.defaultTemperature (全局默认 0.7)
```

`ProviderResolver` 负责按上述优先级解析最终 temperature 后构造 LlmRequest。

### 值对象：LlmDefaultSettings

```dart
@freezed
class LlmDefaultSettings with _$LlmDefaultSettings {
  const factory LlmDefaultSettings({
    required String? writingProviderId,   // 默认写作服务商
    required String? writingModelId,
    required String? reasoningProviderId, // 推理服务商（可选）
    required String? reasoningModelId,
    required String? embeddingProviderId, // 嵌入服务商（可选）
    required String? embeddingModelId,
    @Default(0.7) double defaultTemperature,
    @Default(0.9) double defaultTopP,
    @Default(true) bool streamingEnabled,
  }) = _LlmDefaultSettings;

  factory LlmDefaultSettings.fromJson(Map<String, dynamic> json) =>
      _$LlmDefaultSettingsFromJson(json);

  static const empty = LlmDefaultSettings(
    writingProviderId: null,
    writingModelId: null,
    reasoningProviderId: null,
    reasoningModelId: null,
    embeddingProviderId: null,
    embeddingModelId: null,
  );
}
```

### 枚举：ProviderStatus

- `connected` — 连接测试通过
- `error` — 上次连接失败
- `pendingConfig` — 刚添加未测试
- `local` — 本地模型（Ollama 等，无需 API Key）

### Repository 接口：LlmProviderRepository

```dart
abstract class LlmProviderRepository {
  Future<AppResult<List<LlmProvider>>> getAll();
  Future<AppResult<LlmProvider?>> getById(String id);
  Future<AppResult<LlmProvider>> add(LlmProvider provider);
  Future<AppResult<LlmProvider>> update(LlmProvider provider);
  Future<AppResult<void>> remove(String id);
  Future<AppResult<void>> setDefaultSettings(LlmDefaultSettings settings);
  Future<AppResult<LlmDefaultSettings>> getDefaultSettings();
}
```

### SecretStorage 接口

```dart
abstract class SecretStorage {
  Future<AppResult<void>> saveSecret(String key, String value);
  Future<AppResult<String?>> readSecret(String key);
  Future<AppResult<void>> deleteSecret(String key);
  Future<AppResult<void>> clear();
}
```

## Infra/LLM 层

### LlmClient 接口

```dart
abstract class LlmClient {
  Future<AppResult<void>> testConnection({
    required String baseUrl,
    required String apiKey,
    required String modelId,
  });
  Future<AppResult<List<LlmModel>>> listModels({
    required String baseUrl,
    required String apiKey,
  });
  Stream<AppResult<LlmStreamChunk>> chatCompletionStream(LlmRequest request);
  Future<AppResult<LlmResponse>> chatCompletion(LlmRequest request);
}
```

### LlmRequest / LlmResponse / LlmStreamChunk

```dart
@freezed
class LlmRequest with _$LlmRequest {
  const factory LlmRequest({
    required String baseUrl,
    required String apiKey,
    required String model,
    required List<LlmMessage> messages,
    @Default(0.7) double temperature,
    @Default(0.9) double topP,
    @Default(2048) int maxTokens,
    @Default(true) bool stream,
  }) = _LlmRequest;
}

@freezed
class LlmMessage with _$LlmMessage {
  const factory LlmMessage({
    required String role,   // system | user | assistant
    required String content,
  }) = _LlmMessage;
}

@freezed
class LlmResponse with _$LlmResponse {
  const factory LlmResponse({
    required String content,
    String? finishReason,
    int? promptTokens,
    int? completionTokens,
  }) = _LlmResponse;
}

@freezed
sealed class LlmStreamChunk with _$LlmStreamChunk {
  const factory LlmStreamChunk.textDelta(String text) = TextDelta;
  const factory LlmStreamChunk.done(String? finishReason) = Done;
  const factory LlmStreamChunk.error(AppError error) = StreamError;
}
```

### OpenAI 兼容客户端（核心实现）

`OpenAiCompatibleClient` 实现 `LlmClient`：
- `chatCompletionStream`：POST `{baseUrl}/chat/completions` → 解析 `data: {...}` 行 → yield `TextDelta` → `[DONE]` 时 yield `Done`
- `listModels`：GET `{baseUrl}/models` → 解析 id/object/owned_by → 返回 `List<LlmModel>`
- `testConnection`：发送单条 "ping" user message，期望非 error 响应
- API Key 通过 `Authorization: Bearer {apiKey}` header

### SSE 解析器（独立纯函数）

```dart
Stream<SseEvent> parseSseStream(Stream<List<int>> byteStream);
class SseEvent { final String? event; final String data; final String? id; }
```

### SecretStorage 集成

- `FlutterSecureStorageSecretStorage` 包装 `FlutterSecureStorage`
- key 前缀 `novel_creator_secret_` + providerId 避免冲突
- `InMemorySecretStorage` 用于测试

## Data 层

### InMemoryLlmProviderRepository

遵循现有 `InMemoryProjectRepository` 模式：
- `_providers` 内存 list
- `_defaultSettings = LlmDefaultSettings.empty`
- 支持 CRUD 正常/异常/边界测试
- 不持久化到磁盘（里程碑 2 暂不具备 Isar）

## Agent 集成

### AgentWritingTool 接口

```dart
abstract class AgentWritingTool {
  Future<AppResult<AgentWriteResult>> continueWrite({
    required String chapterId,
    required String cursorContext,
    required int targetLength,
  });
}
```

### RealLlmWritingTool（实现）

```dart
class RealLlmWritingTool implements AgentWritingTool {
  final LlmClient client;
  final LlmProviderRepository providerRepo;
  final SecretStorage secretStorage;
  // 从 providerRepo + secretStorage 读取配置
  // → 构造 LlmRequest → client.chatCompletionStream()
  // → 收集 chunks → AgentWriteResult
}
```

### MockWritingTool 演变

- 改造为 `MockWritingTool implements AgentWritingTool`
- 保持固定文本响应作为无 LLM 时的降级路径
- WorkspaceBloc 接受 `AgentWritingTool` 类型，由上层注入 RealLlmWritingTool 或 MockWritingTool

### ProviderResolver

```dart
class ResolvedProvider {
  final LlmProvider provider;
  final LlmModel? model;        // 选中的模型（可能为 null）
  final String apiKey;
  final double temperature;     // 已按优先级解析的温度
  final double topP;
  final bool streamingEnabled;
}

class ProviderResolver {
  final LlmProviderRepository providerRepo;
  final SecretStorage secretStorage;

  Future<AppResult<ResolvedProvider>> resolveWritingProvider();
  // 流程：
  //   1. getDefaultSettings → writingProviderId / writingModelId
  //   2. providerRepo.getById(writingProviderId) → LlmProvider
  //   3. model = provider.cachedModels.firstWhereOrNull(modelId == writingModelId)
  //   4. apiKey = secretStorage.read(provider.secretKeyRef)
  //   5. temperature = model?.temperature ?? provider.temperature ?? settings.defaultTemperature
  //   6. 返回 ResolvedProvider
  // 任一步失败返回 AppError(source: llm, code: ...)
}
```

## Settings UI

### 路由

侧栏 footer settings 图标 → `Navigator.push(MaterialPageRoute(builder: → SettingsPage))`

### SettingsBloc

| Event | State 变化 |
|---|---|
| `LoadProviders` | loaded: providers, settings |
| `AddProvider(name, baseUrl, apiKey)` | loaded + new provider, secret saved |
| `UpdateProvider(id, name, baseUrl)` | loaded + updated |
| `DeleteProvider(id)` | loaded - removed (secret also deleted) |
| `TestConnection(providerId)` | testing → loaded(withStatus) / failure(error) |
| `RefreshModels(providerId)` | loaded + models updated |
| `SelectDefaultModel(providerId, modelId)` | loaded + provider.selectedModelId set |
| `SetModelTemperature(providerId, modelId, temperature?)` | loaded + model.temperature 更新（null 表示清除覆盖） |
| `UpdateParameters(temp, topP, stream)` | loaded + settings updated |
| `SetDefaultSettings(settings)` | loaded + default settings saved |

### SettingsPage 布局

```
[左侧 7 Tab 导航]
  模型与服务商 ─ 完整实现
  通用设置     ─ placeholder
  写作设置     ─ placeholder
  编辑与校对   ─ placeholder
  快捷键       ─ placeholder
  数据与备份   ─ placeholder
  关于         ─ placeholder

[右侧内容区]
  模型 Tab:
    ┌─────────────────────────────────┐
    │ 服务商管理                       │
    │ [添加服务商]                     │
    │ ┌─────┬──────┬────────┬──┬──┐   │
    │ │名称 │BaseURL│API Key│状态│操作│  │
    │ ├─────┼──────┼────────┼──┼──┤   │
    │ │ ... │ ...  │ ...    │OK │ ✏🗑 │   │
    │ └─────┴──────┴────────┴──┴──┘   │
    │                                  │
    │ ┌── API 配置 ─────────────────┐  │
    │ │ 服务商 ▼ │ BaseURL │ APIKey │  │
    │ │ [测试连接] [保存]           │  │
    │ └────────────────────────────┘  │
    │                                  │
    │ 模型列表                         │
    │ [刷新模型] [手动添加]            │
    │ ┌───┬──────┬───────┬────┬───┬─────┐  │
    │ │ ● │GPT-4o│gpt-4o │128K│16K│0.70│  │
    │ └───┴──────┴───────┴────┴───┴─────┘  │
    │  ↑ 温度列：点击可编辑（滑块/输入），  │
    │    显示"默认"表示沿用 Provider 设置  │
    │                                  │
    │ ┌─ 默认模型 ─┐ ┌─ 参数 ────┐    │
    │ │写作模型 ▼  │ │Temp 0.70  │    │
    │ │推理模型 ▼  │ │Top P 0.90 │    │
    │ └───────────┘ │流式 ☑     │    │
    │               └──────────┘    │
    └─────────────────────────────────┘
```

### Agent Panel 扩展

- 模型状态行：显示当前默认 provider + model，点击跳转 Settings Page
- 流式生成中：显示 spinner/进度指示
- 未配置 provider：显示"未配置模型"引导链接

## 错误处理（继承 AGENTS 红线）

| 错误场景 | AppError.code | userMessage | suggestedAction |
|---|---|---|---|
| 网络错误 | llm_connection_failed | 无法连接模型服务 | 检查网络或 BaseURL |
| API Key 无效 | llm_auth_failed | API Key 认证失败 | 检查 API Key |
| API Key 未配置 | api_key_missing | 未配置 API Key | 前往设置页配置 |
| SSE 解析错误 | sse_parse_error | 模型响应格式异常 | 检查模型兼容性 |
| 速率限制 | llm_rate_limited | 请求过于频繁 | 稍后重试 |
| 未选择模型 | model_not_selected | 未选择默认模型 | 在设置页选择模型 |

## 测试矩阵

| 层级 | 文件 | 测试项 |
|---|---|---|
| Unit | sse_parser_test | 正常流、空行/注释行、`[DONE]`、`data: [DONE]`、格式错误行丢弃 |
| Unit | llm_request_test | JSON 序列化/反序列化 |
| Unit | llm_provider_test | 实体 JSON 序列化 |
| Unit | secret_storage_test | InMemorySecretStorage CRUD |
| Unit | provider_status_test | 枚举值 |
| Data | in_memory_llm_provider_repository_test | CRUD 正常/失败/边界 |
| Infra | openai_llm_client_test | mock HTTP 的流式/同步/testConnection |
| Infra | flutter_secure_storage_secret_test | 接口 mock 测试（不依赖真设备） |
| Agent | agent_writing_tool_test | continueWrite 含 mock LlmClient；fallback 到 mock |
| Agent | provider_resolver_test | 温度优先级：model 覆盖 provider 覆盖 default；缺失链路返回 AppError |
| Bloc | settings_bloc_test | 各 Event → 预期 State（含加载/失败/添加/删除/测试连接） |
| Widget | settings_page_test | smoke test：渲染、Tab 切换、占位面板 |
| Widget | agent_panel_extended_test | 模型状态行显示、未配置引导链接 |

## 文件改动清单

### 新增文件（约 25 个）

```
lib/domain/entities/llm_provider.dart (+ freezed .g)
lib/domain/entities/llm_default_settings.dart (+ freezed .g)
lib/domain/enums/provider_status.dart
lib/domain/repositories/llm_provider_repository.dart
lib/domain/secure/secret_storage.dart  # 接口在 domain，实现在 infra/secret/

lib/infra/llm/llm_client.dart
lib/infra/llm/models/llm_request.dart (+ freezed .g)
lib/infra/llm/models/llm_message.dart (+ freezed .g)
lib/infra/llm/models/llm_response.dart (+ freezed .g)
lib/infra/llm/models/llm_stream_chunk.dart (+ freezed .g)
lib/infra/llm/openai_compatible_client.dart
lib/infra/llm/sse_parser.dart
lib/infra/secret/flutter_secure_storage_secret.dart
lib/infra/secret/in_memory_secret_storage.dart

lib/data/repositories/in_memory_llm_provider_repository.dart

lib/agent/agent_writing_tool.dart
lib/agent/provider_resolver.dart
lib/agent/real_llm_writing_tool.dart

lib/features/settings/bloc/settings_bloc.dart
lib/features/settings/bloc/settings_event.dart
lib/features/settings/bloc/settings_state.dart
lib/features/settings/pages/settings_page.dart
lib/features/settings/widgets/provider_table.dart
lib/features/settings/widgets/provider_form_dialog.dart
lib/features/settings/widgets/model_table.dart
lib/features/settings/widgets/default_model_panel.dart
lib/features/settings/widgets/parameter_panel.dart
lib/features/settings/widgets/placeholder_pane.dart
```

### 修改文件（约 5 个）

```
lib/agent/mock_writing_tool.dart         # 实现 AgentWritingTool 接口
lib/features/workspace/bloc/workspace_bloc.dart  # 注入 AgentWritingTool
lib/features/workspace/widgets/agent_panel.dart  # 模型状态 + 流式指示
lib/app/app.dart                         # 设置 Router 入口
pubspec.yaml                             # 新增 http + flutter_secure_storage
```

## 非功能要求

- API Key 禁止日志输出、禁止 print
- flutter_secure_storage Web 端不支持，SettingsPage Web 显示警告
- 网络请求设置 30s 超时（testConnection 15s）
- 流式生成不阻塞 UI：Stream 在 bloc 中 yield 新 state
- LLM 请求失败不损坏正文（始终走 RevisionPatch）

## 风险与降级

| 风险 | 影响 | 降级策略 |
|---|---|---|
| flutter_secure_storage 在 CI 测试环境不可用 | 测试失败 | InMemorySecretStorage 用于测试；flutter_secure_storage 仅运行时使用 |
| SSE 解析在不同模型（DeepSeek/通义）格式差异 | 部分模型流式不完整 | SSE 解析器容错：忽略未知行，尝试提取 content delta |
| API Key 泄露（本地共享设备） | 安全风险 | flutter_secure_storage 利用系统 Keychain；Web 明确警告 |