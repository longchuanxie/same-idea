import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;

import '../../domain/entities/entities.dart';
import '../../domain/repositories/repositories.dart';
import '../../infrastructure/parsers/file_format_detector.dart';
import 'database_providers.dart';

/// 元数据提取结果
class MetadataResult {
  const MetadataResult({
    this.title,
    this.author,
    this.seriesName,
    this.volumeIndex,
  });

  final String? title;
  final String? author;
  final String? seriesName;
  final int? volumeIndex;
}

/// 元数据服务
/// 负责从文件中提取元数据，以及更新书籍元数据
class MetadataService {
  const MetadataService({
    required BookRepository bookRepository,
  }) : _bookRepository = bookRepository;

  final BookRepository _bookRepository;

  /// 从文件提取元数据
  /// 当前阶段仅支持基于文件名的基础提取，后续阶段将添加 EPUB/PDF 元数据解析
  Future<MetadataResult> extractMetadata(String filePath) async {
    final format = FileFormatDetector.detectFromPath(filePath);
    if (format == null) {
      return const MetadataResult();
    }

    // 基于文件名提取基础元数据
    final fileName = p.basenameWithoutExtension(filePath);
    final result = _parseFileName(fileName);

    // 根据格式尝试提取更多元数据
    switch (format) {
      case BookFormat.epub:
        // TODO: Phase 7 实现 EPUB 元数据解析
        break;
      case BookFormat.pdf:
        // TODO: Phase 9 实现 PDF 元数据解析
        break;
      default:
        break;
    }

    return result;
  }

  /// 更新书籍元数据
  /// 仅当用户未手动编辑过元数据时才允许自动更新
  Future<void> updateBookMetadata(
    int bookId,
    MetadataResult metadata, {
    bool forceOverride = false,
  }) async {
    final book = await _bookRepository.getBookById(bookId);
    if (book == null) return;

    final updated = book.copyWith(
      title: metadata.title ?? book.title,
      author: metadata.author ?? book.author,
    );

    await _bookRepository.updateBook(updated);
  }

  /// 从文件名解析基础元数据
  /// 支持常见命名模式：
  /// - "书名"
  /// - "作者 - 书名"
  /// - "系列名 第N卷 书名"
  /// - "系列名 Vol.N 书名"
  MetadataResult _parseFileName(String fileName) {
    var title = fileName;
    String? author;
    String? seriesName;
    int? volumeIndex;

    // 尝试匹配 "作者 - 书名" 模式
    final authorPattern = RegExp(r'^(.+?)\s*[-–—]\s*(.+)$');
    final authorMatch = authorPattern.firstMatch(fileName);
    if (authorMatch != null) {
      author = authorMatch.group(1)?.trim();
      title = authorMatch.group(2)?.trim() ?? fileName;
    }

    // 尝试匹配系列模式 "系列名 第N卷" 或 "系列名 Vol.N"
    final seriesPatterns = [
      RegExp(r'^(.+?)\s*第(\d+)卷'),
      RegExp(r'^(.+?)\s*Vol\.?\s*(\d+)'),
      RegExp(r'^(.+?)\s*卷(\d+)'),
    ];

    for (final pattern in seriesPatterns) {
      final match = pattern.firstMatch(title);
      if (match != null) {
        seriesName = match.group(1)?.trim();
        volumeIndex = int.tryParse(match.group(2) ?? '');
        break;
      }
    }

    // 清理标题
    title = _cleanTitle(title);

    return MetadataResult(
      title: title,
      author: author,
      seriesName: seriesName,
      volumeIndex: volumeIndex,
    );
  }

  /// 清理标题中的常见噪音
  String _cleanTitle(String title) {
    var cleaned = title;
    // 移除方括号内容（如 [作者] 或 [翻译]）
    cleaned = cleaned.replaceAll(RegExp(r'\[.*?\]'), '');
    // 移除圆括号内容（如 (译林版)）
    cleaned = cleaned.replaceAll(RegExp(r'\(.*?\)'), '');
    // 替换下划线和多余空格
    cleaned = cleaned.replaceAll(RegExp(r'[_\-]+'), ' ').trim();
    cleaned = cleaned.replaceAll(RegExp(r'\s+'), ' ');
    return cleaned.isNotEmpty ? cleaned : title;
  }

  /// 检测丢失的文件
  Future<List<Book>> detectMissingFiles() async {
    final allBooks = await _bookRepository.getAllBooks();
    final missing = <Book>[];
    for (final book in allBooks) {
      final file = File(book.filePath);
      if (!await file.exists()) {
        missing.add(book);
      }
    }
    return missing;
  }
}

/// 元数据服务 Provider
final metadataServiceProvider = Provider<MetadataService>((ref) {
  return MetadataService(
    bookRepository: ref.watch(bookRepositoryProvider),
  );
});
