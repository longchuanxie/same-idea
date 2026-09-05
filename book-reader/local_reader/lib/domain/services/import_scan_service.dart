import 'dart:async';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path/path.dart' as p;

import '../../domain/entities/entities.dart';
import '../../domain/repositories/repositories.dart';
import '../../infrastructure/parsers/file_format_detector.dart';
import 'database_providers.dart';

/// 导入扫描服务
/// 负责文件选择、目录扫描、格式识别、重复检测、入库
class ImportScanService {
  const ImportScanService({
    required BookRepository bookRepository,
  }) : _bookRepository = bookRepository;

  final BookRepository _bookRepository;

  /// 通过文件选择器选取文件
  /// 使用 FileType.any 避免某些平台 allowedExtensions 兼容性问题
  Future<List<String>> pickFiles() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
    );
    if (result == null) return [];
    return result.files
        .where((f) => f.path != null)
        .map((f) => f.path!)
        .where((path) => FileFormatDetector.isSupportedExtension(path))
        .toList();
  }

  /// 通过文件选择器选取目录
  Future<String?> pickDirectory() async {
    final result = await FilePicker.platform.getDirectoryPath();
    return result;
  }

  /// 扫描目录下所有支持的文件
  Future<List<String>> scanDirectory(String directoryPath) async {
    final dir = Directory(directoryPath);
    if (!await dir.exists()) return [];

    final supportedFiles = <String>[];
    try {
      await for (final entity in dir.list(recursive: true)) {
        if (entity is File) {
          if (FileFormatDetector.isSupportedExtension(entity.path)) {
            supportedFiles.add(entity.path);
          }
        }
      }
    } catch (e) {
      debugPrint('扫描目录出错: $e');
    }
    return supportedFiles;
  }

  /// 导入文件列表，以 Stream 形式返回扫描事件
  Stream<ScanEvent> importFiles(List<String> filePaths) async* {
    if (filePaths.isEmpty) return;

    yield const ScanEvent(type: ScanEventType.started);

    final existingBooks = await _bookRepository.getAllBooks();
    final existingPaths = existingBooks.map((b) => b.filePath).toSet();

    var addedCount = 0;
    var skippedCount = 0;
    var failedCount = 0;
    final total = filePaths.length;

    for (var i = 0; i < filePaths.length; i++) {
      final filePath = filePaths[i];

      yield ScanEvent(
        type: ScanEventType.progress,
        current: i + 1,
        total: total,
      );

      // 检测格式
      final format = FileFormatDetector.detectFromPath(filePath);
      if (format == null) {
        failedCount++;
        yield ScanEvent(
          type: ScanEventType.fileSkipped,
          fileName: p.basename(filePath),
          reason: '不支持的文件格式',
        );
        continue;
      }

      // 检查文件是否存在
      final file = File(filePath);
      if (!await file.exists()) {
        failedCount++;
        yield ScanEvent(
          type: ScanEventType.fileFailed,
          fileName: p.basename(filePath),
          reason: '文件不存在',
        );
        continue;
      }

      // 重复检测
      if (existingPaths.contains(filePath)) {
        skippedCount++;
        yield ScanEvent(
          type: ScanEventType.fileSkipped,
          fileName: p.basename(filePath),
          reason: '文件已存在',
        );
        continue;
      }

      // 提取基本元数据并入库
      try {
        final fileName = p.basenameWithoutExtension(filePath);
        final fileSize = await file.length();

        final book = Book(
          id: 0,
          title: _cleanTitle(fileName),
          filePath: filePath,
          format: format,
          fileSizeBytes: fileSize,
          addedAt: DateTime.now(),
        );

        await _bookRepository.addBook(book);
        addedCount++;
        existingPaths.add(filePath);

        yield ScanEvent(
          type: ScanEventType.fileParsed,
          fileName: p.basename(filePath),
          format: format,
        );
      } catch (e) {
        failedCount++;
        yield ScanEvent(
          type: ScanEventType.fileFailed,
          fileName: p.basename(filePath),
          reason: e.toString(),
        );
      }
    }

    yield ScanEvent(
      type: ScanEventType.completed,
      addedCount: addedCount,
      skippedCount: skippedCount,
      failedCount: failedCount,
    );
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

  /// 清理文件名作为书名
  String _cleanTitle(String fileName) {
    var title = fileName.replaceAll(RegExp(r'[_\-]+'), ' ').trim();
    title = title.replaceAll(RegExp(r'\s+'), ' ');
    return title.isNotEmpty ? title : fileName;
  }
}

/// 导入扫描服务 Provider
final importScanServiceProvider = Provider<ImportScanService>((ref) {
  return ImportScanService(
    bookRepository: ref.watch(bookRepositoryProvider),
  );
});

/// 导入扫描状态 Provider
final importScanStateProvider =
    StateNotifierProvider<ImportScanNotifier, ImportScanViewState>((ref) {
  return ImportScanNotifier(
    importScanService: ref.watch(importScanServiceProvider),
  );
});

/// 导入扫描状态管理
class ImportScanNotifier extends StateNotifier<ImportScanViewState> {
  ImportScanNotifier({
    required ImportScanService importScanService,
  })  : _importScanService = importScanService,
        super(const ImportScanViewState());

  final ImportScanService _importScanService;
  StreamSubscription<ScanEvent>? _subscription;

  /// 选择文件并导入
  Future<void> pickAndImportFiles() async {
    try {
      final filePaths = await _importScanService.pickFiles();
      if (filePaths.isEmpty) {
        // 用户取消选择或没有支持的文件
        return;
      }
      _startImport(filePaths);
    } catch (e) {
      debugPrint('选择文件出错: $e');
      state = state.copyWith(
        isScanning: false,
        failedCount: state.failedCount + 1,
        items: [
          ...state.items,
          ImportResultItem(
            filePath: '选择文件',
            status: ImportItemStatus.failed,
            error: '选择文件失败: $e',
          ),
        ],
      );
    }
  }

  /// 选择目录并导入
  Future<void> pickAndImportDirectory() async {
    try {
      final dirPath = await _importScanService.pickDirectory();
      if (dirPath == null) return;
      final files = await _importScanService.scanDirectory(dirPath);
      if (files.isEmpty) {
        state = state.copyWith(
          items: [
            ...state.items,
            ImportResultItem(
              filePath: dirPath,
              status: ImportItemStatus.skipped,
              error: '目录中没有找到支持的文件',
            ),
          ],
        );
        return;
      }
      _startImport(files);
    } catch (e) {
      debugPrint('扫描目录出错: $e');
      state = state.copyWith(
        isScanning: false,
        failedCount: state.failedCount + 1,
        items: [
          ...state.items,
          ImportResultItem(
            filePath: '扫描目录',
            status: ImportItemStatus.failed,
            error: '扫描目录失败: $e',
          ),
        ],
      );
    }
  }

  /// 执行导入
  void _startImport(List<String> filePaths) {
    // 重置状态，避免累积上次导入的结果
    state = const ImportScanViewState(isScanning: true);

    _subscription?.cancel();
    _subscription = _importScanService.importFiles(filePaths).listen(
      (event) {
        switch (event.type) {
          case ScanEventType.progress:
            if (event.total != null && event.total! > 0) {
              state = state.copyWith(
                progress: (event.current ?? 0) / event.total!,
              );
            }
          case ScanEventType.fileParsed:
            state = state.copyWith(
              addedCount: state.addedCount + 1,
              items: [
                ...state.items,
                ImportResultItem(
                  filePath: event.fileName ?? '',
                  status: ImportItemStatus.added,
                  format: event.format,
                ),
              ],
            );
          case ScanEventType.fileSkipped:
            state = state.copyWith(
              skippedCount: state.skippedCount + 1,
              items: [
                ...state.items,
                ImportResultItem(
                  filePath: event.fileName ?? '',
                  status: ImportItemStatus.skipped,
                  error: event.reason,
                ),
              ],
            );
          case ScanEventType.fileFailed:
            state = state.copyWith(
              failedCount: state.failedCount + 1,
              items: [
                ...state.items,
                ImportResultItem(
                  filePath: event.fileName ?? '',
                  status: ImportItemStatus.failed,
                  error: event.reason,
                ),
              ],
            );
          case ScanEventType.completed:
            state = state.copyWith(isScanning: false, progress: 1);
          case ScanEventType.cancelled:
            state = state.copyWith(isScanning: false);
          case ScanEventType.started:
            break;
          case ScanEventType.fileDiscovered:
            break;
        }
      },
      onDone: () {
        if (state.isScanning) {
          state = state.copyWith(isScanning: false, progress: 1);
        }
      },
      onError: (error) {
        debugPrint('导入流错误: $error');
        state = state.copyWith(
          isScanning: false,
          failedCount: state.failedCount + 1,
          items: [
            ...state.items,
            ImportResultItem(
              filePath: '导入过程',
              status: ImportItemStatus.failed,
              error: '导入出错: $error',
            ),
          ],
        );
      },
    );
  }

  /// 取消扫描
  void cancelScan() {
    _subscription?.cancel();
    _subscription = null;
    state = state.copyWith(isScanning: false);
  }

  /// 重置状态
  void reset() {
    _subscription?.cancel();
    _subscription = null;
    state = const ImportScanViewState();
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}
