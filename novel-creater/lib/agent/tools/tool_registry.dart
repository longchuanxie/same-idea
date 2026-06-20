import 'package:novel_creator/agent/tools/writing_tool_models.dart';

class ToolRegistry {
  ToolRegistry({List<WritingToolDescriptor>? descriptors})
      : _descriptors = {
          for (final descriptor in descriptors ?? defaultDescriptors)
            descriptor.id: descriptor,
        };

  static const defaultDescriptors = [
    WritingToolDescriptor(
      id: WritingToolId.write,
      displayName: 'Write',
      permission: WritingToolPermission.suggestionOnly,
    ),
    WritingToolDescriptor(
      id: WritingToolId.continueWrite,
      displayName: 'Continue Write',
      permission: WritingToolPermission.pendingRevision,
    ),
    WritingToolDescriptor(
      id: WritingToolId.rewrite,
      displayName: 'Rewrite',
      permission: WritingToolPermission.pendingRevision,
    ),
    WritingToolDescriptor(
      id: WritingToolId.expand,
      displayName: 'Expand',
      permission: WritingToolPermission.pendingRevision,
    ),
    WritingToolDescriptor(
      id: WritingToolId.condense,
      displayName: 'Condense',
      permission: WritingToolPermission.pendingRevision,
    ),
    WritingToolDescriptor(
      id: WritingToolId.polish,
      displayName: 'Polish',
      permission: WritingToolPermission.pendingRevision,
    ),
  ];

  final Map<WritingToolId, WritingToolDescriptor> _descriptors;

  List<WritingToolDescriptor> get all => _descriptors.values.toList();

  WritingToolDescriptor? descriptorFor(WritingToolId id) => _descriptors[id];

  bool requiresPendingRevision(WritingToolId id) =>
      _descriptors[id]?.permission == WritingToolPermission.pendingRevision;
}
