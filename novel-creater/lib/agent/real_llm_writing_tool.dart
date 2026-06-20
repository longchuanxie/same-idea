import 'package:novel_creator/agent/agent_writing_tool.dart';
import 'package:novel_creator/agent/cancellation_token.dart';
import 'package:novel_creator/agent/provider_resolver.dart';
import 'package:novel_creator/domain/results/app_error.dart';
import 'package:novel_creator/domain/results/app_result.dart';
import 'package:novel_creator/infra/llm/llm_client.dart';
import 'package:novel_creator/infra/llm/models/llm_message.dart';
import 'package:novel_creator/infra/llm/models/llm_request.dart';
import 'package:novel_creator/infra/llm/models/llm_stream_chunk.dart';

class RealLlmWritingTool implements AgentWritingTool {
  const RealLlmWritingTool({
    required LlmClient client,
    required ProviderResolver resolver,
  })  : _client = client,
        _resolver = resolver;

  final LlmClient _client;
  final ProviderResolver _resolver;

  static const _modelNotSelectedError = AppError(
    code: 'llm.model_id_empty',
    message: 'No model id available for resolved provider.',
    userMessage: '当前服务商未指定模型，请在设置页选择。',
    source: AppErrorSource.llm,
    recoverable: true,
  );

  static const _cancelledError = AppError(
    code: 'agent.cancelled',
    message: 'Operation was cancelled by user.',
    userMessage: '操作已取消。',
    source: AppErrorSource.llm,
    recoverable: true,
  );

  bool _isCancelled(CancellationToken? token) => token?.isCancelled ?? false;

  // --- Input validation helpers ---

  AppError _invalidTargetLengthError() => const AppError(
        code: 'agent.invalid_target_length',
        message: 'targetLength must be a positive integer.',
        userMessage: '目标字数必须为正整数，请重新输入。',
        source: AppErrorSource.llm,
        recoverable: true,
        suggestedAction: '请输入大于 0 的目标字数。',
      );

  AppError _emptySelectedTextError() => const AppError(
        code: 'agent.empty_selected_text',
        message: 'selectedText must not be empty.',
        userMessage: '请先选择需要处理的文本。',
        source: AppErrorSource.llm,
        recoverable: true,
        suggestedAction: '在编辑器中选中需要处理的文本后重试。',
      );

  AppError _emptyInstructionError() => const AppError(
        code: 'agent.empty_instruction',
        message: 'instruction must not be empty.',
        userMessage: '请输入创作指令。',
        source: AppErrorSource.llm,
        recoverable: true,
        suggestedAction: '输入具体的创作指令后重试。',
      );

  AppError _invalidStrictnessError() => const AppError(
        code: 'agent.invalid_strictness',
        message: 'strictness must be between 0.0 and 1.0.',
        userMessage: '严格程度必须在 0 到 1 之间。',
        source: AppErrorSource.llm,
        recoverable: true,
        suggestedAction: '请使用 0.0（宽松）到 1.0（严格）之间的值。',
      );

  // --- continueWrite ---

  @override
  Future<AppResult<AgentContinueWriteResult>> continueWrite({
    required String chapterId,
    required String cursorContext,
    required int targetLength,
    CancellationToken? cancellationToken,
  }) async {
    if (targetLength <= 0) {
      return AppResult<AgentContinueWriteResult>.failure(_invalidTargetLengthError());
    }
    if (_isCancelled(cancellationToken)) {
      return const AppResult<AgentContinueWriteResult>.failure(_cancelledError);
    }
    final resolveResult = await _resolver.resolveWritingProvider();
    switch (resolveResult) {
      case AppFailure(:final error):
        return AppResult<AgentContinueWriteResult>.failure(error);
      case AppSuccess(:final value):
        return _runContinueWrite(
          resolved: value,
          cursorContext: cursorContext,
          targetLength: targetLength,
          cancellationToken: cancellationToken,
        );
    }
  }

  Future<AppResult<AgentContinueWriteResult>> _runContinueWrite({
    required ResolvedProvider resolved,
    required String cursorContext,
    required int targetLength,
    CancellationToken? cancellationToken,
  }) async {
    final modelId = _resolveModelId(resolved);
    if (modelId == null) {
      return const AppResult<AgentContinueWriteResult>.failure(_modelNotSelectedError);
    }

    final messages = <LlmMessage>[
      const LlmMessage(
        role: 'system',
        content: '你是一位中文小说创作助手，根据已有正文延续故事，保持文风一致。',
      ),
      LlmMessage(
        role: 'user',
        content: '已有内容：\n$cursorContext\n请继续写作约 $targetLength 字。',
      ),
    ];

    final request = _buildRequest(resolved, modelId, messages);
    final rawResult = await _executeRaw(request, resolved, cancellationToken: cancellationToken);
    switch (rawResult) {
      case AppFailure(:final error):
        return AppResult<AgentContinueWriteResult>.failure(error);
      case AppSuccess(:final value):
        return AppResult<AgentContinueWriteResult>.success(
          AgentContinueWriteResult(
            continuedText: value.text,
            stopReason: value.stopReason,
            temperature: resolved.temperature,
            usedProvider: resolved.provider.name,
            usedModel: modelId,
          ),
        );
    }
  }

  // --- write ---

  @override
  Future<AppResult<AgentGenerateResult>> write({
    required String projectId,
    required String chapterId,
    required String instruction,
    required int targetLength,
    ContextScope contextScope = ContextScope.chapterOnly,
    CancellationToken? cancellationToken,
  }) async {
    if (instruction.trim().isEmpty) {
      return AppResult<AgentGenerateResult>.failure(_emptyInstructionError());
    }
    if (targetLength <= 0) {
      return AppResult<AgentGenerateResult>.failure(_invalidTargetLengthError());
    }
    if (_isCancelled(cancellationToken)) {
      return const AppResult<AgentGenerateResult>.failure(_cancelledError);
    }
    final resolveResult = await _resolver.resolveWritingProvider();
    switch (resolveResult) {
      case AppFailure(:final error):
        return AppResult<AgentGenerateResult>.failure(error);
      case AppSuccess(:final value):
        return _runWrite(
          resolved: value,
          chapterId: chapterId,
          instruction: instruction,
          targetLength: targetLength,
          contextScope: contextScope,
          cancellationToken: cancellationToken,
        );
    }
  }

  Future<AppResult<AgentGenerateResult>> _runWrite({
    required ResolvedProvider resolved,
    required String chapterId,
    required String instruction,
    required int targetLength,
    required ContextScope contextScope,
    CancellationToken? cancellationToken,
  }) async {
    final modelId = _resolveModelId(resolved);
    if (modelId == null) {
      return const AppResult<AgentGenerateResult>.failure(
          _modelNotSelectedError);
    }

    final scopeHint = switch (contextScope) {
      ContextScope.chapterOnly => '仅参考当前章节内容',
      ContextScope.chapterAndOutline => '参考当前章节和大纲',
      ContextScope.fullProject => '参考整个项目的角色、设定和章节',
    };

    final messages = <LlmMessage>[
      const LlmMessage(
        role: 'system',
        content: '你是一位中文小说创作助手，根据用户指令生成小说正文。'
            '输出格式：第一段为生成的正文，然后空一行，'
            '用【摘要】开头写一段生成摘要，'
            '如有需要注意的问题用【警告】开头列出。',
      ),
      LlmMessage(
        role: 'user',
        content: '章节ID：$chapterId\n'
            '创作指令：$instruction\n'
            '目标字数：约 $targetLength 字\n'
            '上下文范围：$scopeHint\n'
            '请生成正文。',
      ),
    ];

    final request = _buildRequest(resolved, modelId, messages);
    final rawResult = await _executeRaw(request, resolved, cancellationToken: cancellationToken);
    switch (rawResult) {
      case AppFailure(:final error):
        return AppResult<AgentGenerateResult>.failure(error);
      case AppSuccess(:final value):
        return AppResult<AgentGenerateResult>.success(
          _parseGenerateResult(value.text, resolved, modelId),
        );
    }
  }

  // --- rewrite ---

  @override
  Future<AppResult<AgentRewriteResult>> rewrite({
    required String selectedText,
    required String instruction,
    String? styleProfile,
    CancellationToken? cancellationToken,
  }) async {
    if (selectedText.trim().isEmpty) {
      return AppResult<AgentRewriteResult>.failure(_emptySelectedTextError());
    }
    if (instruction.trim().isEmpty) {
      return AppResult<AgentRewriteResult>.failure(_emptyInstructionError());
    }
    if (_isCancelled(cancellationToken)) {
      return const AppResult<AgentRewriteResult>.failure(_cancelledError);
    }
    final resolveResult = await _resolver.resolveWritingProvider();
    switch (resolveResult) {
      case AppFailure(:final error):
        return AppResult<AgentRewriteResult>.failure(error);
      case AppSuccess(:final value):
        return _runRewrite(
          resolved: value,
          selectedText: selectedText,
          instruction: instruction,
          styleProfile: styleProfile,
          cancellationToken: cancellationToken,
        );
    }
  }

  Future<AppResult<AgentRewriteResult>> _runRewrite({
    required ResolvedProvider resolved,
    required String selectedText,
    required String instruction,
    String? styleProfile,
    CancellationToken? cancellationToken,
  }) async {
    final modelId = _resolveModelId(resolved);
    if (modelId == null) {
      return const AppResult<AgentRewriteResult>.failure(
          _modelNotSelectedError);
    }

    final styleHint = styleProfile != null ? '风格要求：$styleProfile\n' : '';
    final messages = <LlmMessage>[
      const LlmMessage(
        role: 'system',
        content: '你是一位中文小说创作助手，根据用户指令改写选中的文本。'
            '输出格式：第一段为改写后的正文，然后空一行，'
            '用【改动说明】开头写一段改动摘要。',
      ),
      LlmMessage(
        role: 'user',
        content: '原文：\n$selectedText\n'
            '${styleHint}改写指令：$instruction\n'
            '请改写以上文本。',
      ),
    ];

    final request = _buildRequest(resolved, modelId, messages);
    final rawResult = await _executeRaw(request, resolved, cancellationToken: cancellationToken);
    switch (rawResult) {
      case AppFailure(:final error):
        return AppResult<AgentRewriteResult>.failure(error);
      case AppSuccess(:final value):
        return AppResult<AgentRewriteResult>.success(
          _parseRewriteResult(value.text, resolved, modelId),
        );
    }
  }

  // --- expand ---

  @override
  Future<AppResult<AgentExpandResult>> expand({
    required String selectedText,
    required int targetLength,
    String? focus,
    CancellationToken? cancellationToken,
  }) async {
    if (selectedText.trim().isEmpty) {
      return AppResult<AgentExpandResult>.failure(_emptySelectedTextError());
    }
    if (targetLength <= 0) {
      return AppResult<AgentExpandResult>.failure(_invalidTargetLengthError());
    }
    if (_isCancelled(cancellationToken)) {
      return const AppResult<AgentExpandResult>.failure(_cancelledError);
    }
    final resolveResult = await _resolver.resolveWritingProvider();
    switch (resolveResult) {
      case AppFailure(:final error):
        return AppResult<AgentExpandResult>.failure(error);
      case AppSuccess(:final value):
        return _runExpand(
          resolved: value,
          selectedText: selectedText,
          targetLength: targetLength,
          focus: focus,
          cancellationToken: cancellationToken,
        );
    }
  }

  Future<AppResult<AgentExpandResult>> _runExpand({
    required ResolvedProvider resolved,
    required String selectedText,
    required int targetLength,
    String? focus,
    CancellationToken? cancellationToken,
  }) async {
    final modelId = _resolveModelId(resolved);
    if (modelId == null) {
      return const AppResult<AgentExpandResult>.failure(
          _modelNotSelectedError);
    }

    final focusHint = focus != null ? '扩写重点：$focus\n' : '';
    final messages = <LlmMessage>[
      const LlmMessage(
        role: 'system',
        content: '你是一位中文小说创作助手，根据用户要求扩写选中的文本。'
            '输出格式：第一段为扩写后的正文，然后空一行，'
            '用【新增说明】开头写一段新增内容摘要。',
      ),
      LlmMessage(
        role: 'user',
        content: '原文：\n$selectedText\n'
            '${focusHint}目标字数：约 $targetLength 字\n'
            '请扩写以上文本。',
      ),
    ];

    final request = _buildRequest(resolved, modelId, messages);
    final rawResult = await _executeRaw(request, resolved, cancellationToken: cancellationToken);
    switch (rawResult) {
      case AppFailure(:final error):
        return AppResult<AgentExpandResult>.failure(error);
      case AppSuccess(:final value):
        return AppResult<AgentExpandResult>.success(
          _parseExpandResult(value.text, resolved, modelId),
        );
    }
  }

  // --- condense ---

  @override
  Future<AppResult<AgentCondenseResult>> condense({
    required String selectedText,
    required int targetLength,
    List<String>? keepPoints,
    CancellationToken? cancellationToken,
  }) async {
    if (selectedText.trim().isEmpty) {
      return AppResult<AgentCondenseResult>.failure(_emptySelectedTextError());
    }
    if (targetLength <= 0) {
      return AppResult<AgentCondenseResult>.failure(_invalidTargetLengthError());
    }
    if (_isCancelled(cancellationToken)) {
      return const AppResult<AgentCondenseResult>.failure(_cancelledError);
    }
    final resolveResult = await _resolver.resolveWritingProvider();
    switch (resolveResult) {
      case AppFailure(:final error):
        return AppResult<AgentCondenseResult>.failure(error);
      case AppSuccess(:final value):
        return _runCondense(
          resolved: value,
          selectedText: selectedText,
          targetLength: targetLength,
          keepPoints: keepPoints,
          cancellationToken: cancellationToken,
        );
    }
  }

  Future<AppResult<AgentCondenseResult>> _runCondense({
    required ResolvedProvider resolved,
    required String selectedText,
    required int targetLength,
    List<String>? keepPoints,
    CancellationToken? cancellationToken,
  }) async {
    final modelId = _resolveModelId(resolved);
    if (modelId == null) {
      return const AppResult<AgentCondenseResult>.failure(
          _modelNotSelectedError);
    }

    final keepHint = keepPoints != null && keepPoints.isNotEmpty
        ? '必须保留的要点：\n${keepPoints.map((p) => '- $p').join('\n')}\n'
        : '';
    final messages = <LlmMessage>[
      const LlmMessage(
        role: 'system',
        content: '你是一位中文小说创作助手，根据用户要求精简选中的文本。'
            '输出格式：第一段为精简后的正文，然后空一行，'
            '用【删除要点】开头列出被删除的内容要点，每条一行。',
      ),
      LlmMessage(
        role: 'user',
        content: '原文：\n$selectedText\n'
            '${keepHint}目标字数：约 $targetLength 字\n'
            '请精简以上文本。',
      ),
    ];

    final request = _buildRequest(resolved, modelId, messages);
    final rawResult = await _executeRaw(request, resolved, cancellationToken: cancellationToken);
    switch (rawResult) {
      case AppFailure(:final error):
        return AppResult<AgentCondenseResult>.failure(error);
      case AppSuccess(:final value):
        return AppResult<AgentCondenseResult>.success(
          _parseCondenseResult(value.text, resolved, modelId),
        );
    }
  }

  // --- polish ---

  @override
  Future<AppResult<AgentPolishResult>> polish({
    required String selectedText,
    required String styleGoal,
    double strictness = 0.7,
    CancellationToken? cancellationToken,
  }) async {
    if (selectedText.trim().isEmpty) {
      return AppResult<AgentPolishResult>.failure(_emptySelectedTextError());
    }
    if (strictness < 0 || strictness > 1) {
      return AppResult<AgentPolishResult>.failure(_invalidStrictnessError());
    }
    if (_isCancelled(cancellationToken)) {
      return const AppResult<AgentPolishResult>.failure(_cancelledError);
    }
    final resolveResult = await _resolver.resolveWritingProvider();
    switch (resolveResult) {
      case AppFailure(:final error):
        return AppResult<AgentPolishResult>.failure(error);
      case AppSuccess(:final value):
        return _runPolish(
          resolved: value,
          selectedText: selectedText,
          styleGoal: styleGoal,
          strictness: strictness,
          cancellationToken: cancellationToken,
        );
    }
  }

  Future<AppResult<AgentPolishResult>> _runPolish({
    required ResolvedProvider resolved,
    required String selectedText,
    required String styleGoal,
    required double strictness,
    CancellationToken? cancellationToken,
  }) async {
    final modelId = _resolveModelId(resolved);
    if (modelId == null) {
      return const AppResult<AgentPolishResult>.failure(
          _modelNotSelectedError);
    }

    final strictnessDesc = strictness >= 0.8
        ? '严格模式：尽量保持原文结构和用词，仅做细微调整'
        : strictness >= 0.5
            ? '适度模式：在保持原意的基础上优化表达'
            : '宽松模式：可以较大幅度地调整以达成风格目标';
    final messages = <LlmMessage>[
      const LlmMessage(
        role: 'system',
        content: '你是一位中文小说创作助手，根据用户要求润色选中的文本。'
            '输出格式：第一段为润色后的正文，然后空一行，'
            '用【风格说明】开头写一段润色说明。',
      ),
      LlmMessage(
        role: 'user',
        content: '原文：\n$selectedText\n'
            '风格目标：$styleGoal\n'
            '严格程度：$strictnessDesc\n'
            '请润色以上文本。',
      ),
    ];

    final request = _buildRequest(resolved, modelId, messages);
    final rawResult = await _executeRaw(request, resolved, cancellationToken: cancellationToken);
    switch (rawResult) {
      case AppFailure(:final error):
        return AppResult<AgentPolishResult>.failure(error);
      case AppSuccess(:final value):
        return AppResult<AgentPolishResult>.success(
          _parsePolishResult(value.text, resolved, modelId),
        );
    }
  }

  // --- Shared infrastructure ---

  String? _resolveModelId(ResolvedProvider resolved) {
    final modelId =
        resolved.model?.modelId ?? resolved.provider.selectedModelId;
    if (modelId == null || modelId.isEmpty) return null;
    return modelId;
  }

  LlmRequest _buildRequest(
    ResolvedProvider resolved,
    String modelId,
    List<LlmMessage> messages,
  ) =>
      LlmRequest(
        baseUrl: resolved.provider.baseUrl,
        apiKey: resolved.apiKey,
        model: modelId,
        messages: messages,
        temperature: resolved.temperature,
        topP: resolved.topP,
        stream: resolved.streamingEnabled,
      );

  Future<AppResult<({String text, String stopReason})>> _executeRaw(
    LlmRequest request,
    ResolvedProvider resolved, {
    CancellationToken? cancellationToken,
  }) async {
    try {
      if (resolved.streamingEnabled) {
        return AppResult<({String text, String stopReason})>.success(
          await _runStreamingRaw(request, cancellationToken: cancellationToken),
        );
      }
      return AppResult<({String text, String stopReason})>.success(
        await _runNonStreamingRaw(request),
      );
    } on _LlmExecutionException catch (e) {
      return AppResult<({String text, String stopReason})>.failure(e.error);
    } catch (e) {
      return AppResult<({String text, String stopReason})>.failure(
        AppError(
          code: 'llm.unexpected_error',
          message: e.toString(),
          userMessage: 'AI 服务出现意外错误，请重试。',
          technicalDetail: e.runtimeType.toString(),
          source: AppErrorSource.llm,
          recoverable: true,
          suggestedAction: '如果问题持续，请检查网络连接或更换模型。',
        ),
      );
    }
  }

  Future<({String text, String stopReason})> _runStreamingRaw(
    LlmRequest request, {
    CancellationToken? cancellationToken,
  }) async {
    final buffer = StringBuffer();
    String? finishReason;
    await for (final chunk in _client.chatCompletionStream(request)) {
      if (_isCancelled(cancellationToken)) {
        return (text: buffer.toString(), stopReason: 'cancelled');
      }
      switch (chunk) {
        case TextDelta(:final text):
          buffer.write(text);
        case StreamDone(finishReason: final reason):
          finishReason = reason;
        case StreamErrorChunk(:final error):
          throw _LlmExecutionException(error);
      }
    }
    return (text: buffer.toString(), stopReason: finishReason ?? 'unknown');
  }

  Future<({String text, String stopReason})> _runNonStreamingRaw(
    LlmRequest request,
  ) async {
    final response = await _client.chatCompletion(request);
    switch (response) {
      case AppFailure(:final error):
        throw _LlmExecutionException(error);
      case AppSuccess(:final value):
        return (
          text: value.content,
          stopReason: value.finishReason ?? 'unknown',
        );
    }
  }

  // --- Result parsing helpers ---

  AgentGenerateResult _parseGenerateResult(
    String raw,
    ResolvedProvider resolved,
    String modelId,
  ) {
    final sections = _splitSections(raw);
    return AgentGenerateResult(
      generatedText: sections.body,
      summary: sections.tagged['摘要'] ?? '',
      warnings: _parseListSection(sections.tagged['警告']),
      temperature: resolved.temperature,
      usedProvider: resolved.provider.name,
      usedModel: modelId,
    );
  }

  AgentRewriteResult _parseRewriteResult(
    String raw,
    ResolvedProvider resolved,
    String modelId,
  ) {
    final sections = _splitSections(raw);
    return AgentRewriteResult(
      revisedText: sections.body,
      changeSummary: sections.tagged['改动说明'] ?? '',
      temperature: resolved.temperature,
      usedProvider: resolved.provider.name,
      usedModel: modelId,
    );
  }

  AgentExpandResult _parseExpandResult(
    String raw,
    ResolvedProvider resolved,
    String modelId,
  ) {
    final sections = _splitSections(raw);
    return AgentExpandResult(
      expandedText: sections.body,
      additionsSummary: sections.tagged['新增说明'] ?? '',
      temperature: resolved.temperature,
      usedProvider: resolved.provider.name,
      usedModel: modelId,
    );
  }

  AgentCondenseResult _parseCondenseResult(
    String raw,
    ResolvedProvider resolved,
    String modelId,
  ) {
    final sections = _splitSections(raw);
    return AgentCondenseResult(
      condensedText: sections.body,
      removedPoints: _parseListSection(sections.tagged['删除要点']),
      temperature: resolved.temperature,
      usedProvider: resolved.provider.name,
      usedModel: modelId,
    );
  }

  AgentPolishResult _parsePolishResult(
    String raw,
    ResolvedProvider resolved,
    String modelId,
  ) {
    final sections = _splitSections(raw);
    return AgentPolishResult(
      polishedText: sections.body,
      styleNotes: sections.tagged['风格说明'] ?? '',
      temperature: resolved.temperature,
      usedProvider: resolved.provider.name,
      usedModel: modelId,
    );
  }

  _ParsedSections _splitSections(String raw) {
    final lines = raw.split('\n');
    final bodyLines = <String>[];
    final tagged = <String, String>{};
    String? currentTag;
    final currentContent = StringBuffer();

    for (final line in lines) {
      final tagMatch = _tagPattern.firstMatch(line);
      if (tagMatch != null) {
        if (currentTag != null) {
          tagged[currentTag] = currentContent.toString().trim();
          currentContent.clear();
        }
        currentTag = tagMatch.group(1);
        final rest = line.substring(tagMatch.end);
        if (rest.isNotEmpty) {
          currentContent.write(rest);
        }
      } else if (currentTag != null) {
        currentContent.writeln(line);
      } else {
        bodyLines.add(line);
      }
    }
    if (currentTag != null) {
      tagged[currentTag] = currentContent.toString().trim();
    }

    return _ParsedSections(body: bodyLines.join('\n').trim(), tagged: tagged);
  }

  List<String> _parseListSection(String? content) {
    if (content == null || content.isEmpty) return <String>[];
    return content
        .split('\n')
        .map((line) => line.replaceFirst(RegExp(r'^-\s*'), '').trim())
        .where((line) => line.isNotEmpty)
        .toList(growable: false);
  }

  static final _tagPattern = RegExp(r'^【(.+?)】');
}

class _LlmExecutionException implements Exception {
  const _LlmExecutionException(this.error);
  final AppError error;
}

class _ParsedSections {
  const _ParsedSections({required this.body, required this.tagged});

  final String body;
  final Map<String, String> tagged;
}
