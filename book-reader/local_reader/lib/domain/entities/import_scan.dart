import '../../domain/entities/book.dart';

/// 扫描事件类型
enum ScanEventType {
  started,
  fileDiscovered,
  fileParsed,
  fileSkipped,
  fileFailed,
  progress,
  completed,
  cancelled,
}

/// 扫描事件
class ScanEvent {
  const ScanEvent({
    required this.type,
    this.fileName,
    this.format,
    this.reason,
    this.current,
    this.total,
    this.addedCount,
    this.skippedCount,
    this.failedCount,
  });

  final ScanEventType type;
  final String? fileName;
  final BookFormat? format;
  final String? reason;
  final int? current;
  final int? total;
  final int? addedCount;
  final int? skippedCount;
  final int? failedCount;
}

/// 导入结果项
class ImportResultItem {
  const ImportResultItem({
    required this.filePath,
    required this.status,
    this.bookId,
    this.format,
    this.error,
  });

  final String filePath;
  final ImportItemStatus status;
  final int? bookId;
  final BookFormat? format;
  final String? error;
}

/// 导入项状态
enum ImportItemStatus {
  added,
  skipped,
  failed,
}

/// 导入扫描视图状态
class ImportScanViewState {
  const ImportScanViewState({
    this.isScanning = false,
    this.progress = 0,
    this.addedCount = 0,
    this.skippedCount = 0,
    this.failedCount = 0,
    this.items = const [],
  });

  final bool isScanning;
  final double progress;
  final int addedCount;
  final int skippedCount;
  final int failedCount;
  final List<ImportResultItem> items;

  ImportScanViewState copyWith({
    bool? isScanning,
    double? progress,
    int? addedCount,
    int? skippedCount,
    int? failedCount,
    List<ImportResultItem>? items,
  }) {
    return ImportScanViewState(
      isScanning: isScanning ?? this.isScanning,
      progress: progress ?? this.progress,
      addedCount: addedCount ?? this.addedCount,
      skippedCount: skippedCount ?? this.skippedCount,
      failedCount: failedCount ?? this.failedCount,
      items: items ?? this.items,
    );
  }
}
