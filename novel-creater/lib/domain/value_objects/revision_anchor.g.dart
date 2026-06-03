// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'revision_anchor.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RevisionAnchorImpl _$$RevisionAnchorImplFromJson(Map<String, dynamic> json) =>
    _$RevisionAnchorImpl(
      type: $enumDecode(_$AnchorTypeEnumMap, json['type']),
      offset: (json['offset'] as num).toInt(),
      length: (json['length'] as num?)?.toInt() ?? 0,
      contextBefore: json['contextBefore'] as String? ?? '',
      contextAfter: json['contextAfter'] as String? ?? '',
    );

Map<String, dynamic> _$$RevisionAnchorImplToJson(
        _$RevisionAnchorImpl instance) =>
    <String, dynamic>{
      'type': _$AnchorTypeEnumMap[instance.type]!,
      'offset': instance.offset,
      'length': instance.length,
      'contextBefore': instance.contextBefore,
      'contextAfter': instance.contextAfter,
    };

const _$AnchorTypeEnumMap = {
  AnchorType.cursor: 'cursor',
  AnchorType.selection: 'selection',
  AnchorType.line: 'line',
  AnchorType.paragraph: 'paragraph',
};
