import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/app_typography.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';

class AddProviderResult {
  const AddProviderResult({
    required this.name,
    required this.baseUrl,
    required this.apiKey,
  });

  final String name;
  final String baseUrl;
  final String apiKey;
}

class AddProviderDialog extends StatefulWidget {
  const AddProviderDialog({super.key});

  @override
  State<AddProviderDialog> createState() => _AddProviderDialogState();
}

class _AddProviderDialogState extends State<AddProviderDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _baseUrlCtrl = TextEditingController();
  final _apiKeyCtrl = TextEditingController();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _baseUrlCtrl.dispose();
    _apiKeyCtrl.dispose();
    super.dispose();
  }

  String? _validateName(String? v) {
    final s = v?.trim() ?? '';
    if (s.isEmpty) return '请输入服务商名称';
    if (s.length > 64) return '名称过长 (最多 64 字符)';
    return null;
  }

  String? _validateBaseUrl(String? v) {
    final s = v?.trim() ?? '';
    if (s.isEmpty) return '请输入基础地址';
    final uri = Uri.tryParse(s);
    if (uri == null || !uri.isAbsolute) return '请输入完整 URL (含 http/https)';
    if (uri.scheme != 'http' && uri.scheme != 'https') {
      return 'URL 协议必须是 http 或 https';
    }
    return null;
  }

  String? _validateApiKey(String? v) {
    final s = v?.trim() ?? '';
    if (s.isEmpty) return '请输入 API Key';
    if (s.length < 8) return 'API Key 长度不足';
    return null;
  }

  String _normalizeBaseUrl(String raw) {
    final trimmed = raw.trim();
    return trimmed.endsWith('/')
        ? trimmed.substring(0, trimmed.length - 1)
        : trimmed;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? MorandiColors.darkBackground : MorandiColors.background;
    final text = isDark ? MorandiColors.darkText : MorandiColors.text;

    return AlertDialog(
      backgroundColor: bg,
      title: Text('添加服务商', style: AppTypography.title(color: text)),
      content: SizedBox(
        width: 400,
        child: Form(
          key: _formKey,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(
                  labelText: '名称',
                  hintText: '如 OpenAI Compatible',
                ),
                validator: _validateName,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _baseUrlCtrl,
                decoration: const InputDecoration(
                  labelText: '基础地址 (Base URL)',
                  hintText: 'https://api.openai.com/v1',
                ),
                validator: _validateBaseUrl,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _apiKeyCtrl,
                decoration: const InputDecoration(
                  labelText: 'API Key',
                  hintText: 'sk-...',
                ),
                obscureText: true,
                validator: _validateApiKey,
              ),
            ],
          ),
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('取消'),
        ),
        FilledButton(
          onPressed: _submit,
          child: const Text('添加'),
        ),
      ],
    );
  }

  void _submit() {
    final form = _formKey.currentState;
    if (form == null || !form.validate()) return;
    Navigator.of(context).pop(
      AddProviderResult(
        name: _nameCtrl.text.trim(),
        baseUrl: _normalizeBaseUrl(_baseUrlCtrl.text),
        apiKey: _apiKeyCtrl.text.trim(),
      ),
    );
  }
}
