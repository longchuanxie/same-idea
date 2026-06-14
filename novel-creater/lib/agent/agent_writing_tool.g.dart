// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'agent_writing_tool.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AgentContinueWriteResultImpl _$$AgentContinueWriteResultImplFromJson(
        Map<String, dynamic> json) =>
    _$AgentContinueWriteResultImpl(
      continuedText: json['continuedText'] as String,
      stopReason: json['stopReason'] as String,
      temperature: (json['temperature'] as num).toDouble(),
      usedProvider: json['usedProvider'] as String?,
      usedModel: json['usedModel'] as String?,
    );

Map<String, dynamic> _$$AgentContinueWriteResultImplToJson(
        _$AgentContinueWriteResultImpl instance) =>
    <String, dynamic>{
      'continuedText': instance.continuedText,
      'stopReason': instance.stopReason,
      'temperature': instance.temperature,
      'usedProvider': instance.usedProvider,
      'usedModel': instance.usedModel,
    };

_$AgentGenerateResultImpl _$$AgentGenerateResultImplFromJson(
        Map<String, dynamic> json) =>
    _$AgentGenerateResultImpl(
      generatedText: json['generatedText'] as String,
      summary: json['summary'] as String,
      warnings: (json['warnings'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const <String>[],
      temperature: (json['temperature'] as num).toDouble(),
      usedProvider: json['usedProvider'] as String?,
      usedModel: json['usedModel'] as String?,
    );

Map<String, dynamic> _$$AgentGenerateResultImplToJson(
        _$AgentGenerateResultImpl instance) =>
    <String, dynamic>{
      'generatedText': instance.generatedText,
      'summary': instance.summary,
      'warnings': instance.warnings,
      'temperature': instance.temperature,
      'usedProvider': instance.usedProvider,
      'usedModel': instance.usedModel,
    };

_$AgentRewriteResultImpl _$$AgentRewriteResultImplFromJson(
        Map<String, dynamic> json) =>
    _$AgentRewriteResultImpl(
      revisedText: json['revisedText'] as String,
      changeSummary: json['changeSummary'] as String,
      temperature: (json['temperature'] as num).toDouble(),
      usedProvider: json['usedProvider'] as String?,
      usedModel: json['usedModel'] as String?,
    );

Map<String, dynamic> _$$AgentRewriteResultImplToJson(
        _$AgentRewriteResultImpl instance) =>
    <String, dynamic>{
      'revisedText': instance.revisedText,
      'changeSummary': instance.changeSummary,
      'temperature': instance.temperature,
      'usedProvider': instance.usedProvider,
      'usedModel': instance.usedModel,
    };

_$AgentExpandResultImpl _$$AgentExpandResultImplFromJson(
        Map<String, dynamic> json) =>
    _$AgentExpandResultImpl(
      expandedText: json['expandedText'] as String,
      additionsSummary: json['additionsSummary'] as String,
      temperature: (json['temperature'] as num).toDouble(),
      usedProvider: json['usedProvider'] as String?,
      usedModel: json['usedModel'] as String?,
    );

Map<String, dynamic> _$$AgentExpandResultImplToJson(
        _$AgentExpandResultImpl instance) =>
    <String, dynamic>{
      'expandedText': instance.expandedText,
      'additionsSummary': instance.additionsSummary,
      'temperature': instance.temperature,
      'usedProvider': instance.usedProvider,
      'usedModel': instance.usedModel,
    };

_$AgentCondenseResultImpl _$$AgentCondenseResultImplFromJson(
        Map<String, dynamic> json) =>
    _$AgentCondenseResultImpl(
      condensedText: json['condensedText'] as String,
      removedPoints: (json['removedPoints'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const <String>[],
      temperature: (json['temperature'] as num).toDouble(),
      usedProvider: json['usedProvider'] as String?,
      usedModel: json['usedModel'] as String?,
    );

Map<String, dynamic> _$$AgentCondenseResultImplToJson(
        _$AgentCondenseResultImpl instance) =>
    <String, dynamic>{
      'condensedText': instance.condensedText,
      'removedPoints': instance.removedPoints,
      'temperature': instance.temperature,
      'usedProvider': instance.usedProvider,
      'usedModel': instance.usedModel,
    };

_$AgentPolishResultImpl _$$AgentPolishResultImplFromJson(
        Map<String, dynamic> json) =>
    _$AgentPolishResultImpl(
      polishedText: json['polishedText'] as String,
      styleNotes: json['styleNotes'] as String,
      temperature: (json['temperature'] as num).toDouble(),
      usedProvider: json['usedProvider'] as String?,
      usedModel: json['usedModel'] as String?,
    );

Map<String, dynamic> _$$AgentPolishResultImplToJson(
        _$AgentPolishResultImpl instance) =>
    <String, dynamic>{
      'polishedText': instance.polishedText,
      'styleNotes': instance.styleNotes,
      'temperature': instance.temperature,
      'usedProvider': instance.usedProvider,
      'usedModel': instance.usedModel,
    };
