import 'package:novel_creator/domain/entities/chapter.dart';
import 'package:novel_creator/domain/entities/character.dart';
import 'package:novel_creator/domain/entities/note.dart';
import 'package:novel_creator/domain/entities/setting_entry.dart';
import 'package:novel_creator/domain/enums/consistency_check_type.dart';
import 'package:novel_creator/domain/services/consistency_check_result.dart';

/// Domain service for consistency checking across 6 categories.
/// Performs rule-based analysis on project data.
/// LLM-enhanced checks can be layered on top later.
abstract interface class ConsistencyCheckService {
  Future<ConsistencyCheckResult> check({
    required String projectId,
    required List<Chapter> chapters,
    required List<Character> characters,
    required List<SettingEntry> settingEntries,
    required List<Note> notes,
    List<ConsistencyCheckType>? types,
  });
}
