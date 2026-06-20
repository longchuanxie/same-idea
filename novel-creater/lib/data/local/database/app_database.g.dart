// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $ProjectsTable extends Projects
    with TableInfo<$ProjectsTable, ProjectRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ProjectsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns =>
      [id, name, description, createdAt, updatedAt, schemaVersion];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'projects';
  @override
  VerificationContext validateIntegrity(Insertable<ProjectRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ProjectRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ProjectRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $ProjectsTable createAlias(String alias) {
    return $ProjectsTable(attachedDatabase, alias);
  }
}

class ProjectRow extends DataClass implements Insertable<ProjectRow> {
  final String id;
  final String name;
  final String description;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  const ProjectRow(
      {required this.id,
      required this.name,
      required this.description,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    map['description'] = Variable<String>(description);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  ProjectsCompanion toCompanion(bool nullToAbsent) {
    return ProjectsCompanion(
      id: Value(id),
      name: Value(name),
      description: Value(description),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory ProjectRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ProjectRow(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      description: serializer.fromJson<String>(json['description']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'description': serializer.toJson<String>(description),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  ProjectRow copyWith(
          {String? id,
          String? name,
          String? description,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion}) =>
      ProjectRow(
        id: id ?? this.id,
        name: name ?? this.name,
        description: description ?? this.description,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  ProjectRow copyWithCompanion(ProjectsCompanion data) {
    return ProjectRow(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      description:
          data.description.present ? data.description.value : this.description,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ProjectRow(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('description: $description, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, name, description, createdAt, updatedAt, schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ProjectRow &&
          other.id == this.id &&
          other.name == this.name &&
          other.description == this.description &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class ProjectsCompanion extends UpdateCompanion<ProjectRow> {
  final Value<String> id;
  final Value<String> name;
  final Value<String> description;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const ProjectsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.description = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ProjectsCompanion.insert({
    required String id,
    required String name,
    this.description = const Value.absent(),
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<ProjectRow> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? description,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (description != null) 'description': description,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ProjectsCompanion copyWith(
      {Value<String>? id,
      Value<String>? name,
      Value<String>? description,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return ProjectsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ProjectsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('description: $description, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $ChaptersTable extends Chapters
    with TableInfo<$ChaptersTable, ChapterRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ChaptersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES projects (id) ON DELETE CASCADE'));
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _markdownContentMeta =
      const VerificationMeta('markdownContent');
  @override
  late final GeneratedColumn<String> markdownContent = GeneratedColumn<String>(
      'markdown_content', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _plainTextCacheMeta =
      const VerificationMeta('plainTextCache');
  @override
  late final GeneratedColumn<String> plainTextCache = GeneratedColumn<String>(
      'plain_text_cache', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _wordCountMeta =
      const VerificationMeta('wordCount');
  @override
  late final GeneratedColumn<int> wordCount = GeneratedColumn<int>(
      'word_count', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        title,
        markdownContent,
        plainTextCache,
        wordCount,
        status,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'chapters';
  @override
  VerificationContext validateIntegrity(Insertable<ChapterRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('markdown_content')) {
      context.handle(
          _markdownContentMeta,
          markdownContent.isAcceptableOrUnknown(
              data['markdown_content']!, _markdownContentMeta));
    }
    if (data.containsKey('plain_text_cache')) {
      context.handle(
          _plainTextCacheMeta,
          plainTextCache.isAcceptableOrUnknown(
              data['plain_text_cache']!, _plainTextCacheMeta));
    }
    if (data.containsKey('word_count')) {
      context.handle(_wordCountMeta,
          wordCount.isAcceptableOrUnknown(data['word_count']!, _wordCountMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ChapterRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ChapterRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      markdownContent: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}markdown_content'])!,
      plainTextCache: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}plain_text_cache'])!,
      wordCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}word_count'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $ChaptersTable createAlias(String alias) {
    return $ChaptersTable(attachedDatabase, alias);
  }
}

class ChapterRow extends DataClass implements Insertable<ChapterRow> {
  final String id;
  final String projectId;
  final String title;
  final String markdownContent;
  final String plainTextCache;
  final int wordCount;
  final String status;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  const ChapterRow(
      {required this.id,
      required this.projectId,
      required this.title,
      required this.markdownContent,
      required this.plainTextCache,
      required this.wordCount,
      required this.status,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['title'] = Variable<String>(title);
    map['markdown_content'] = Variable<String>(markdownContent);
    map['plain_text_cache'] = Variable<String>(plainTextCache);
    map['word_count'] = Variable<int>(wordCount);
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  ChaptersCompanion toCompanion(bool nullToAbsent) {
    return ChaptersCompanion(
      id: Value(id),
      projectId: Value(projectId),
      title: Value(title),
      markdownContent: Value(markdownContent),
      plainTextCache: Value(plainTextCache),
      wordCount: Value(wordCount),
      status: Value(status),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory ChapterRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ChapterRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      title: serializer.fromJson<String>(json['title']),
      markdownContent: serializer.fromJson<String>(json['markdownContent']),
      plainTextCache: serializer.fromJson<String>(json['plainTextCache']),
      wordCount: serializer.fromJson<int>(json['wordCount']),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'title': serializer.toJson<String>(title),
      'markdownContent': serializer.toJson<String>(markdownContent),
      'plainTextCache': serializer.toJson<String>(plainTextCache),
      'wordCount': serializer.toJson<int>(wordCount),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  ChapterRow copyWith(
          {String? id,
          String? projectId,
          String? title,
          String? markdownContent,
          String? plainTextCache,
          int? wordCount,
          String? status,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion}) =>
      ChapterRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        title: title ?? this.title,
        markdownContent: markdownContent ?? this.markdownContent,
        plainTextCache: plainTextCache ?? this.plainTextCache,
        wordCount: wordCount ?? this.wordCount,
        status: status ?? this.status,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  ChapterRow copyWithCompanion(ChaptersCompanion data) {
    return ChapterRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      title: data.title.present ? data.title.value : this.title,
      markdownContent: data.markdownContent.present
          ? data.markdownContent.value
          : this.markdownContent,
      plainTextCache: data.plainTextCache.present
          ? data.plainTextCache.value
          : this.plainTextCache,
      wordCount: data.wordCount.present ? data.wordCount.value : this.wordCount,
      status: data.status.present ? data.status.value : this.status,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ChapterRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('markdownContent: $markdownContent, ')
          ..write('plainTextCache: $plainTextCache, ')
          ..write('wordCount: $wordCount, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, projectId, title, markdownContent,
      plainTextCache, wordCount, status, createdAt, updatedAt, schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ChapterRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.title == this.title &&
          other.markdownContent == this.markdownContent &&
          other.plainTextCache == this.plainTextCache &&
          other.wordCount == this.wordCount &&
          other.status == this.status &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class ChaptersCompanion extends UpdateCompanion<ChapterRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> title;
  final Value<String> markdownContent;
  final Value<String> plainTextCache;
  final Value<int> wordCount;
  final Value<String> status;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const ChaptersCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.title = const Value.absent(),
    this.markdownContent = const Value.absent(),
    this.plainTextCache = const Value.absent(),
    this.wordCount = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ChaptersCompanion.insert({
    required String id,
    required String projectId,
    required String title,
    this.markdownContent = const Value.absent(),
    this.plainTextCache = const Value.absent(),
    this.wordCount = const Value.absent(),
    required String status,
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        title = Value(title),
        status = Value(status),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<ChapterRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? title,
    Expression<String>? markdownContent,
    Expression<String>? plainTextCache,
    Expression<int>? wordCount,
    Expression<String>? status,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (title != null) 'title': title,
      if (markdownContent != null) 'markdown_content': markdownContent,
      if (plainTextCache != null) 'plain_text_cache': plainTextCache,
      if (wordCount != null) 'word_count': wordCount,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ChaptersCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? title,
      Value<String>? markdownContent,
      Value<String>? plainTextCache,
      Value<int>? wordCount,
      Value<String>? status,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return ChaptersCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      title: title ?? this.title,
      markdownContent: markdownContent ?? this.markdownContent,
      plainTextCache: plainTextCache ?? this.plainTextCache,
      wordCount: wordCount ?? this.wordCount,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (markdownContent.present) {
      map['markdown_content'] = Variable<String>(markdownContent.value);
    }
    if (plainTextCache.present) {
      map['plain_text_cache'] = Variable<String>(plainTextCache.value);
    }
    if (wordCount.present) {
      map['word_count'] = Variable<int>(wordCount.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ChaptersCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('markdownContent: $markdownContent, ')
          ..write('plainTextCache: $plainTextCache, ')
          ..write('wordCount: $wordCount, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $RevisionsTable extends Revisions
    with TableInfo<$RevisionsTable, RevisionRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $RevisionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _chapterIdMeta =
      const VerificationMeta('chapterId');
  @override
  late final GeneratedColumn<String> chapterId = GeneratedColumn<String>(
      'chapter_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES chapters (id) ON DELETE CASCADE'));
  static const VerificationMeta _patchJsonMeta =
      const VerificationMeta('patchJson');
  @override
  late final GeneratedColumn<String> patchJson = GeneratedColumn<String>(
      'patch_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        chapterId,
        patchJson,
        status,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'revisions';
  @override
  VerificationContext validateIntegrity(Insertable<RevisionRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('chapter_id')) {
      context.handle(_chapterIdMeta,
          chapterId.isAcceptableOrUnknown(data['chapter_id']!, _chapterIdMeta));
    } else if (isInserting) {
      context.missing(_chapterIdMeta);
    }
    if (data.containsKey('patch_json')) {
      context.handle(_patchJsonMeta,
          patchJson.isAcceptableOrUnknown(data['patch_json']!, _patchJsonMeta));
    } else if (isInserting) {
      context.missing(_patchJsonMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  RevisionRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return RevisionRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      chapterId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}chapter_id'])!,
      patchJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}patch_json'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $RevisionsTable createAlias(String alias) {
    return $RevisionsTable(attachedDatabase, alias);
  }
}

class RevisionRow extends DataClass implements Insertable<RevisionRow> {
  final String id;
  final String projectId;
  final String chapterId;
  final String patchJson;
  final String status;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  const RevisionRow(
      {required this.id,
      required this.projectId,
      required this.chapterId,
      required this.patchJson,
      required this.status,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['chapter_id'] = Variable<String>(chapterId);
    map['patch_json'] = Variable<String>(patchJson);
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  RevisionsCompanion toCompanion(bool nullToAbsent) {
    return RevisionsCompanion(
      id: Value(id),
      projectId: Value(projectId),
      chapterId: Value(chapterId),
      patchJson: Value(patchJson),
      status: Value(status),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory RevisionRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return RevisionRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      chapterId: serializer.fromJson<String>(json['chapterId']),
      patchJson: serializer.fromJson<String>(json['patchJson']),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'chapterId': serializer.toJson<String>(chapterId),
      'patchJson': serializer.toJson<String>(patchJson),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  RevisionRow copyWith(
          {String? id,
          String? projectId,
          String? chapterId,
          String? patchJson,
          String? status,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion}) =>
      RevisionRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        chapterId: chapterId ?? this.chapterId,
        patchJson: patchJson ?? this.patchJson,
        status: status ?? this.status,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  RevisionRow copyWithCompanion(RevisionsCompanion data) {
    return RevisionRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      chapterId: data.chapterId.present ? data.chapterId.value : this.chapterId,
      patchJson: data.patchJson.present ? data.patchJson.value : this.patchJson,
      status: data.status.present ? data.status.value : this.status,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('RevisionRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('chapterId: $chapterId, ')
          ..write('patchJson: $patchJson, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, projectId, chapterId, patchJson, status,
      createdAt, updatedAt, schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is RevisionRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.chapterId == this.chapterId &&
          other.patchJson == this.patchJson &&
          other.status == this.status &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class RevisionsCompanion extends UpdateCompanion<RevisionRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> chapterId;
  final Value<String> patchJson;
  final Value<String> status;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const RevisionsCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.patchJson = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  RevisionsCompanion.insert({
    required String id,
    required String projectId,
    required String chapterId,
    required String patchJson,
    required String status,
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        chapterId = Value(chapterId),
        patchJson = Value(patchJson),
        status = Value(status),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<RevisionRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? chapterId,
    Expression<String>? patchJson,
    Expression<String>? status,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (chapterId != null) 'chapter_id': chapterId,
      if (patchJson != null) 'patch_json': patchJson,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  RevisionsCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? chapterId,
      Value<String>? patchJson,
      Value<String>? status,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return RevisionsCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      chapterId: chapterId ?? this.chapterId,
      patchJson: patchJson ?? this.patchJson,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (chapterId.present) {
      map['chapter_id'] = Variable<String>(chapterId.value);
    }
    if (patchJson.present) {
      map['patch_json'] = Variable<String>(patchJson.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('RevisionsCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('chapterId: $chapterId, ')
          ..write('patchJson: $patchJson, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $CharactersTable extends Characters
    with TableInfo<$CharactersTable, CharacterRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CharactersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _roleMeta = const VerificationMeta('role');
  @override
  late final GeneratedColumn<String> role = GeneratedColumn<String>(
      'role', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('supporting'));
  static const VerificationMeta _avatarUrlMeta =
      const VerificationMeta('avatarUrl');
  @override
  late final GeneratedColumn<String> avatarUrl = GeneratedColumn<String>(
      'avatar_url', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _traitsJsonMeta =
      const VerificationMeta('traitsJson');
  @override
  late final GeneratedColumn<String> traitsJson = GeneratedColumn<String>(
      'traits_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('{}'));
  static const VerificationMeta _backgroundMeta =
      const VerificationMeta('background');
  @override
  late final GeneratedColumn<String> background = GeneratedColumn<String>(
      'background', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _aliasesJsonMeta =
      const VerificationMeta('aliasesJson');
  @override
  late final GeneratedColumn<String> aliasesJson = GeneratedColumn<String>(
      'aliases_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _appearanceMeta =
      const VerificationMeta('appearance');
  @override
  late final GeneratedColumn<String> appearance = GeneratedColumn<String>(
      'appearance', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _personalityMeta =
      const VerificationMeta('personality');
  @override
  late final GeneratedColumn<String> personality = GeneratedColumn<String>(
      'personality', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _goalsMeta = const VerificationMeta('goals');
  @override
  late final GeneratedColumn<String> goals = GeneratedColumn<String>(
      'goals', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _conflictsMeta =
      const VerificationMeta('conflicts');
  @override
  late final GeneratedColumn<String> conflicts = GeneratedColumn<String>(
      'conflicts', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _secretsMeta =
      const VerificationMeta('secrets');
  @override
  late final GeneratedColumn<String> secrets = GeneratedColumn<String>(
      'secrets', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _relationshipsJsonMeta =
      const VerificationMeta('relationshipsJson');
  @override
  late final GeneratedColumn<String> relationshipsJson =
      GeneratedColumn<String>('relationships_json', aliasedName, false,
          type: DriftSqlType.string,
          requiredDuringInsert: false,
          defaultValue: const Constant('[]'));
  static const VerificationMeta _consistencyFactsJsonMeta =
      const VerificationMeta('consistencyFactsJson');
  @override
  late final GeneratedColumn<String> consistencyFactsJson =
      GeneratedColumn<String>('consistency_facts_json', aliasedName, false,
          type: DriftSqlType.string,
          requiredDuringInsert: false,
          defaultValue: const Constant('[]'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        name,
        description,
        role,
        avatarUrl,
        traitsJson,
        background,
        aliasesJson,
        appearance,
        personality,
        goals,
        conflicts,
        secrets,
        relationshipsJson,
        consistencyFactsJson,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'characters';
  @override
  VerificationContext validateIntegrity(Insertable<CharacterRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    if (data.containsKey('role')) {
      context.handle(
          _roleMeta, role.isAcceptableOrUnknown(data['role']!, _roleMeta));
    }
    if (data.containsKey('avatar_url')) {
      context.handle(_avatarUrlMeta,
          avatarUrl.isAcceptableOrUnknown(data['avatar_url']!, _avatarUrlMeta));
    }
    if (data.containsKey('traits_json')) {
      context.handle(
          _traitsJsonMeta,
          traitsJson.isAcceptableOrUnknown(
              data['traits_json']!, _traitsJsonMeta));
    }
    if (data.containsKey('background')) {
      context.handle(
          _backgroundMeta,
          background.isAcceptableOrUnknown(
              data['background']!, _backgroundMeta));
    }
    if (data.containsKey('aliases_json')) {
      context.handle(
          _aliasesJsonMeta,
          aliasesJson.isAcceptableOrUnknown(
              data['aliases_json']!, _aliasesJsonMeta));
    }
    if (data.containsKey('appearance')) {
      context.handle(
          _appearanceMeta,
          appearance.isAcceptableOrUnknown(
              data['appearance']!, _appearanceMeta));
    }
    if (data.containsKey('personality')) {
      context.handle(
          _personalityMeta,
          personality.isAcceptableOrUnknown(
              data['personality']!, _personalityMeta));
    }
    if (data.containsKey('goals')) {
      context.handle(
          _goalsMeta, goals.isAcceptableOrUnknown(data['goals']!, _goalsMeta));
    }
    if (data.containsKey('conflicts')) {
      context.handle(_conflictsMeta,
          conflicts.isAcceptableOrUnknown(data['conflicts']!, _conflictsMeta));
    }
    if (data.containsKey('secrets')) {
      context.handle(_secretsMeta,
          secrets.isAcceptableOrUnknown(data['secrets']!, _secretsMeta));
    }
    if (data.containsKey('relationships_json')) {
      context.handle(
          _relationshipsJsonMeta,
          relationshipsJson.isAcceptableOrUnknown(
              data['relationships_json']!, _relationshipsJsonMeta));
    }
    if (data.containsKey('consistency_facts_json')) {
      context.handle(
          _consistencyFactsJsonMeta,
          consistencyFactsJson.isAcceptableOrUnknown(
              data['consistency_facts_json']!, _consistencyFactsJsonMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CharacterRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CharacterRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description'])!,
      role: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}role'])!,
      avatarUrl: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}avatar_url'])!,
      traitsJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}traits_json'])!,
      background: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}background'])!,
      aliasesJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}aliases_json'])!,
      appearance: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}appearance'])!,
      personality: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}personality'])!,
      goals: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}goals'])!,
      conflicts: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}conflicts'])!,
      secrets: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}secrets'])!,
      relationshipsJson: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}relationships_json'])!,
      consistencyFactsJson: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}consistency_facts_json'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $CharactersTable createAlias(String alias) {
    return $CharactersTable(attachedDatabase, alias);
  }
}

class CharacterRow extends DataClass implements Insertable<CharacterRow> {
  final String id;
  final String projectId;
  final String name;
  final String description;
  final String role;
  final String avatarUrl;
  final String traitsJson;
  final String background;
  final String aliasesJson;
  final String appearance;
  final String personality;
  final String goals;
  final String conflicts;
  final String secrets;
  final String relationshipsJson;
  final String consistencyFactsJson;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  const CharacterRow(
      {required this.id,
      required this.projectId,
      required this.name,
      required this.description,
      required this.role,
      required this.avatarUrl,
      required this.traitsJson,
      required this.background,
      required this.aliasesJson,
      required this.appearance,
      required this.personality,
      required this.goals,
      required this.conflicts,
      required this.secrets,
      required this.relationshipsJson,
      required this.consistencyFactsJson,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['name'] = Variable<String>(name);
    map['description'] = Variable<String>(description);
    map['role'] = Variable<String>(role);
    map['avatar_url'] = Variable<String>(avatarUrl);
    map['traits_json'] = Variable<String>(traitsJson);
    map['background'] = Variable<String>(background);
    map['aliases_json'] = Variable<String>(aliasesJson);
    map['appearance'] = Variable<String>(appearance);
    map['personality'] = Variable<String>(personality);
    map['goals'] = Variable<String>(goals);
    map['conflicts'] = Variable<String>(conflicts);
    map['secrets'] = Variable<String>(secrets);
    map['relationships_json'] = Variable<String>(relationshipsJson);
    map['consistency_facts_json'] = Variable<String>(consistencyFactsJson);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  CharactersCompanion toCompanion(bool nullToAbsent) {
    return CharactersCompanion(
      id: Value(id),
      projectId: Value(projectId),
      name: Value(name),
      description: Value(description),
      role: Value(role),
      avatarUrl: Value(avatarUrl),
      traitsJson: Value(traitsJson),
      background: Value(background),
      aliasesJson: Value(aliasesJson),
      appearance: Value(appearance),
      personality: Value(personality),
      goals: Value(goals),
      conflicts: Value(conflicts),
      secrets: Value(secrets),
      relationshipsJson: Value(relationshipsJson),
      consistencyFactsJson: Value(consistencyFactsJson),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory CharacterRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CharacterRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      name: serializer.fromJson<String>(json['name']),
      description: serializer.fromJson<String>(json['description']),
      role: serializer.fromJson<String>(json['role']),
      avatarUrl: serializer.fromJson<String>(json['avatarUrl']),
      traitsJson: serializer.fromJson<String>(json['traitsJson']),
      background: serializer.fromJson<String>(json['background']),
      aliasesJson: serializer.fromJson<String>(json['aliasesJson']),
      appearance: serializer.fromJson<String>(json['appearance']),
      personality: serializer.fromJson<String>(json['personality']),
      goals: serializer.fromJson<String>(json['goals']),
      conflicts: serializer.fromJson<String>(json['conflicts']),
      secrets: serializer.fromJson<String>(json['secrets']),
      relationshipsJson: serializer.fromJson<String>(json['relationshipsJson']),
      consistencyFactsJson:
          serializer.fromJson<String>(json['consistencyFactsJson']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'name': serializer.toJson<String>(name),
      'description': serializer.toJson<String>(description),
      'role': serializer.toJson<String>(role),
      'avatarUrl': serializer.toJson<String>(avatarUrl),
      'traitsJson': serializer.toJson<String>(traitsJson),
      'background': serializer.toJson<String>(background),
      'aliasesJson': serializer.toJson<String>(aliasesJson),
      'appearance': serializer.toJson<String>(appearance),
      'personality': serializer.toJson<String>(personality),
      'goals': serializer.toJson<String>(goals),
      'conflicts': serializer.toJson<String>(conflicts),
      'secrets': serializer.toJson<String>(secrets),
      'relationshipsJson': serializer.toJson<String>(relationshipsJson),
      'consistencyFactsJson': serializer.toJson<String>(consistencyFactsJson),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  CharacterRow copyWith(
          {String? id,
          String? projectId,
          String? name,
          String? description,
          String? role,
          String? avatarUrl,
          String? traitsJson,
          String? background,
          String? aliasesJson,
          String? appearance,
          String? personality,
          String? goals,
          String? conflicts,
          String? secrets,
          String? relationshipsJson,
          String? consistencyFactsJson,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion}) =>
      CharacterRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        name: name ?? this.name,
        description: description ?? this.description,
        role: role ?? this.role,
        avatarUrl: avatarUrl ?? this.avatarUrl,
        traitsJson: traitsJson ?? this.traitsJson,
        background: background ?? this.background,
        aliasesJson: aliasesJson ?? this.aliasesJson,
        appearance: appearance ?? this.appearance,
        personality: personality ?? this.personality,
        goals: goals ?? this.goals,
        conflicts: conflicts ?? this.conflicts,
        secrets: secrets ?? this.secrets,
        relationshipsJson: relationshipsJson ?? this.relationshipsJson,
        consistencyFactsJson: consistencyFactsJson ?? this.consistencyFactsJson,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  CharacterRow copyWithCompanion(CharactersCompanion data) {
    return CharacterRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      name: data.name.present ? data.name.value : this.name,
      description:
          data.description.present ? data.description.value : this.description,
      role: data.role.present ? data.role.value : this.role,
      avatarUrl: data.avatarUrl.present ? data.avatarUrl.value : this.avatarUrl,
      traitsJson:
          data.traitsJson.present ? data.traitsJson.value : this.traitsJson,
      background:
          data.background.present ? data.background.value : this.background,
      aliasesJson:
          data.aliasesJson.present ? data.aliasesJson.value : this.aliasesJson,
      appearance:
          data.appearance.present ? data.appearance.value : this.appearance,
      personality:
          data.personality.present ? data.personality.value : this.personality,
      goals: data.goals.present ? data.goals.value : this.goals,
      conflicts: data.conflicts.present ? data.conflicts.value : this.conflicts,
      secrets: data.secrets.present ? data.secrets.value : this.secrets,
      relationshipsJson: data.relationshipsJson.present
          ? data.relationshipsJson.value
          : this.relationshipsJson,
      consistencyFactsJson: data.consistencyFactsJson.present
          ? data.consistencyFactsJson.value
          : this.consistencyFactsJson,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CharacterRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('name: $name, ')
          ..write('description: $description, ')
          ..write('role: $role, ')
          ..write('avatarUrl: $avatarUrl, ')
          ..write('traitsJson: $traitsJson, ')
          ..write('background: $background, ')
          ..write('aliasesJson: $aliasesJson, ')
          ..write('appearance: $appearance, ')
          ..write('personality: $personality, ')
          ..write('goals: $goals, ')
          ..write('conflicts: $conflicts, ')
          ..write('secrets: $secrets, ')
          ..write('relationshipsJson: $relationshipsJson, ')
          ..write('consistencyFactsJson: $consistencyFactsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      projectId,
      name,
      description,
      role,
      avatarUrl,
      traitsJson,
      background,
      aliasesJson,
      appearance,
      personality,
      goals,
      conflicts,
      secrets,
      relationshipsJson,
      consistencyFactsJson,
      createdAt,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CharacterRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.name == this.name &&
          other.description == this.description &&
          other.role == this.role &&
          other.avatarUrl == this.avatarUrl &&
          other.traitsJson == this.traitsJson &&
          other.background == this.background &&
          other.aliasesJson == this.aliasesJson &&
          other.appearance == this.appearance &&
          other.personality == this.personality &&
          other.goals == this.goals &&
          other.conflicts == this.conflicts &&
          other.secrets == this.secrets &&
          other.relationshipsJson == this.relationshipsJson &&
          other.consistencyFactsJson == this.consistencyFactsJson &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class CharactersCompanion extends UpdateCompanion<CharacterRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> name;
  final Value<String> description;
  final Value<String> role;
  final Value<String> avatarUrl;
  final Value<String> traitsJson;
  final Value<String> background;
  final Value<String> aliasesJson;
  final Value<String> appearance;
  final Value<String> personality;
  final Value<String> goals;
  final Value<String> conflicts;
  final Value<String> secrets;
  final Value<String> relationshipsJson;
  final Value<String> consistencyFactsJson;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const CharactersCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.name = const Value.absent(),
    this.description = const Value.absent(),
    this.role = const Value.absent(),
    this.avatarUrl = const Value.absent(),
    this.traitsJson = const Value.absent(),
    this.background = const Value.absent(),
    this.aliasesJson = const Value.absent(),
    this.appearance = const Value.absent(),
    this.personality = const Value.absent(),
    this.goals = const Value.absent(),
    this.conflicts = const Value.absent(),
    this.secrets = const Value.absent(),
    this.relationshipsJson = const Value.absent(),
    this.consistencyFactsJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CharactersCompanion.insert({
    required String id,
    required String projectId,
    required String name,
    this.description = const Value.absent(),
    this.role = const Value.absent(),
    this.avatarUrl = const Value.absent(),
    this.traitsJson = const Value.absent(),
    this.background = const Value.absent(),
    this.aliasesJson = const Value.absent(),
    this.appearance = const Value.absent(),
    this.personality = const Value.absent(),
    this.goals = const Value.absent(),
    this.conflicts = const Value.absent(),
    this.secrets = const Value.absent(),
    this.relationshipsJson = const Value.absent(),
    this.consistencyFactsJson = const Value.absent(),
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        name = Value(name),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<CharacterRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? name,
    Expression<String>? description,
    Expression<String>? role,
    Expression<String>? avatarUrl,
    Expression<String>? traitsJson,
    Expression<String>? background,
    Expression<String>? aliasesJson,
    Expression<String>? appearance,
    Expression<String>? personality,
    Expression<String>? goals,
    Expression<String>? conflicts,
    Expression<String>? secrets,
    Expression<String>? relationshipsJson,
    Expression<String>? consistencyFactsJson,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (name != null) 'name': name,
      if (description != null) 'description': description,
      if (role != null) 'role': role,
      if (avatarUrl != null) 'avatar_url': avatarUrl,
      if (traitsJson != null) 'traits_json': traitsJson,
      if (background != null) 'background': background,
      if (aliasesJson != null) 'aliases_json': aliasesJson,
      if (appearance != null) 'appearance': appearance,
      if (personality != null) 'personality': personality,
      if (goals != null) 'goals': goals,
      if (conflicts != null) 'conflicts': conflicts,
      if (secrets != null) 'secrets': secrets,
      if (relationshipsJson != null) 'relationships_json': relationshipsJson,
      if (consistencyFactsJson != null)
        'consistency_facts_json': consistencyFactsJson,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CharactersCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? name,
      Value<String>? description,
      Value<String>? role,
      Value<String>? avatarUrl,
      Value<String>? traitsJson,
      Value<String>? background,
      Value<String>? aliasesJson,
      Value<String>? appearance,
      Value<String>? personality,
      Value<String>? goals,
      Value<String>? conflicts,
      Value<String>? secrets,
      Value<String>? relationshipsJson,
      Value<String>? consistencyFactsJson,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return CharactersCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      name: name ?? this.name,
      description: description ?? this.description,
      role: role ?? this.role,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      traitsJson: traitsJson ?? this.traitsJson,
      background: background ?? this.background,
      aliasesJson: aliasesJson ?? this.aliasesJson,
      appearance: appearance ?? this.appearance,
      personality: personality ?? this.personality,
      goals: goals ?? this.goals,
      conflicts: conflicts ?? this.conflicts,
      secrets: secrets ?? this.secrets,
      relationshipsJson: relationshipsJson ?? this.relationshipsJson,
      consistencyFactsJson: consistencyFactsJson ?? this.consistencyFactsJson,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (role.present) {
      map['role'] = Variable<String>(role.value);
    }
    if (avatarUrl.present) {
      map['avatar_url'] = Variable<String>(avatarUrl.value);
    }
    if (traitsJson.present) {
      map['traits_json'] = Variable<String>(traitsJson.value);
    }
    if (background.present) {
      map['background'] = Variable<String>(background.value);
    }
    if (aliasesJson.present) {
      map['aliases_json'] = Variable<String>(aliasesJson.value);
    }
    if (appearance.present) {
      map['appearance'] = Variable<String>(appearance.value);
    }
    if (personality.present) {
      map['personality'] = Variable<String>(personality.value);
    }
    if (goals.present) {
      map['goals'] = Variable<String>(goals.value);
    }
    if (conflicts.present) {
      map['conflicts'] = Variable<String>(conflicts.value);
    }
    if (secrets.present) {
      map['secrets'] = Variable<String>(secrets.value);
    }
    if (relationshipsJson.present) {
      map['relationships_json'] = Variable<String>(relationshipsJson.value);
    }
    if (consistencyFactsJson.present) {
      map['consistency_facts_json'] =
          Variable<String>(consistencyFactsJson.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CharactersCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('name: $name, ')
          ..write('description: $description, ')
          ..write('role: $role, ')
          ..write('avatarUrl: $avatarUrl, ')
          ..write('traitsJson: $traitsJson, ')
          ..write('background: $background, ')
          ..write('aliasesJson: $aliasesJson, ')
          ..write('appearance: $appearance, ')
          ..write('personality: $personality, ')
          ..write('goals: $goals, ')
          ..write('conflicts: $conflicts, ')
          ..write('secrets: $secrets, ')
          ..write('relationshipsJson: $relationshipsJson, ')
          ..write('consistencyFactsJson: $consistencyFactsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SettingEntriesTable extends SettingEntries
    with TableInfo<$SettingEntriesTable, SettingEntryRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SettingEntriesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _contentMeta =
      const VerificationMeta('content');
  @override
  late final GeneratedColumn<String> content = GeneratedColumn<String>(
      'content', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _categoryMeta =
      const VerificationMeta('category');
  @override
  late final GeneratedColumn<String> category = GeneratedColumn<String>(
      'category', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('other'));
  static const VerificationMeta _tagsJsonMeta =
      const VerificationMeta('tagsJson');
  @override
  late final GeneratedColumn<String> tagsJson = GeneratedColumn<String>(
      'tags_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        title,
        content,
        category,
        tagsJson,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'setting_entries';
  @override
  VerificationContext validateIntegrity(Insertable<SettingEntryRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('content')) {
      context.handle(_contentMeta,
          content.isAcceptableOrUnknown(data['content']!, _contentMeta));
    } else if (isInserting) {
      context.missing(_contentMeta);
    }
    if (data.containsKey('category')) {
      context.handle(_categoryMeta,
          category.isAcceptableOrUnknown(data['category']!, _categoryMeta));
    }
    if (data.containsKey('tags_json')) {
      context.handle(_tagsJsonMeta,
          tagsJson.isAcceptableOrUnknown(data['tags_json']!, _tagsJsonMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SettingEntryRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SettingEntryRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      content: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}content'])!,
      category: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}category'])!,
      tagsJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}tags_json'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $SettingEntriesTable createAlias(String alias) {
    return $SettingEntriesTable(attachedDatabase, alias);
  }
}

class SettingEntryRow extends DataClass implements Insertable<SettingEntryRow> {
  final String id;
  final String projectId;
  final String title;
  final String content;
  final String category;
  final String tagsJson;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  const SettingEntryRow(
      {required this.id,
      required this.projectId,
      required this.title,
      required this.content,
      required this.category,
      required this.tagsJson,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['title'] = Variable<String>(title);
    map['content'] = Variable<String>(content);
    map['category'] = Variable<String>(category);
    map['tags_json'] = Variable<String>(tagsJson);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  SettingEntriesCompanion toCompanion(bool nullToAbsent) {
    return SettingEntriesCompanion(
      id: Value(id),
      projectId: Value(projectId),
      title: Value(title),
      content: Value(content),
      category: Value(category),
      tagsJson: Value(tagsJson),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory SettingEntryRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SettingEntryRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      title: serializer.fromJson<String>(json['title']),
      content: serializer.fromJson<String>(json['content']),
      category: serializer.fromJson<String>(json['category']),
      tagsJson: serializer.fromJson<String>(json['tagsJson']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'title': serializer.toJson<String>(title),
      'content': serializer.toJson<String>(content),
      'category': serializer.toJson<String>(category),
      'tagsJson': serializer.toJson<String>(tagsJson),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  SettingEntryRow copyWith(
          {String? id,
          String? projectId,
          String? title,
          String? content,
          String? category,
          String? tagsJson,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion}) =>
      SettingEntryRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        title: title ?? this.title,
        content: content ?? this.content,
        category: category ?? this.category,
        tagsJson: tagsJson ?? this.tagsJson,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  SettingEntryRow copyWithCompanion(SettingEntriesCompanion data) {
    return SettingEntryRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      title: data.title.present ? data.title.value : this.title,
      content: data.content.present ? data.content.value : this.content,
      category: data.category.present ? data.category.value : this.category,
      tagsJson: data.tagsJson.present ? data.tagsJson.value : this.tagsJson,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SettingEntryRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('content: $content, ')
          ..write('category: $category, ')
          ..write('tagsJson: $tagsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, projectId, title, content, category,
      tagsJson, createdAt, updatedAt, schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SettingEntryRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.title == this.title &&
          other.content == this.content &&
          other.category == this.category &&
          other.tagsJson == this.tagsJson &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class SettingEntriesCompanion extends UpdateCompanion<SettingEntryRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> title;
  final Value<String> content;
  final Value<String> category;
  final Value<String> tagsJson;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const SettingEntriesCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.title = const Value.absent(),
    this.content = const Value.absent(),
    this.category = const Value.absent(),
    this.tagsJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SettingEntriesCompanion.insert({
    required String id,
    required String projectId,
    required String title,
    required String content,
    this.category = const Value.absent(),
    this.tagsJson = const Value.absent(),
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        title = Value(title),
        content = Value(content),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<SettingEntryRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? title,
    Expression<String>? content,
    Expression<String>? category,
    Expression<String>? tagsJson,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (title != null) 'title': title,
      if (content != null) 'content': content,
      if (category != null) 'category': category,
      if (tagsJson != null) 'tags_json': tagsJson,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SettingEntriesCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? title,
      Value<String>? content,
      Value<String>? category,
      Value<String>? tagsJson,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return SettingEntriesCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      title: title ?? this.title,
      content: content ?? this.content,
      category: category ?? this.category,
      tagsJson: tagsJson ?? this.tagsJson,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (content.present) {
      map['content'] = Variable<String>(content.value);
    }
    if (category.present) {
      map['category'] = Variable<String>(category.value);
    }
    if (tagsJson.present) {
      map['tags_json'] = Variable<String>(tagsJson.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SettingEntriesCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('content: $content, ')
          ..write('category: $category, ')
          ..write('tagsJson: $tagsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $NotesTable extends Notes with TableInfo<$NotesTable, NoteRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $NotesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _contentMeta =
      const VerificationMeta('content');
  @override
  late final GeneratedColumn<String> content = GeneratedColumn<String>(
      'content', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _categoryMeta =
      const VerificationMeta('category');
  @override
  late final GeneratedColumn<String> category = GeneratedColumn<String>(
      'category', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('misc'));
  static const VerificationMeta _tagsJsonMeta =
      const VerificationMeta('tagsJson');
  @override
  late final GeneratedColumn<String> tagsJson = GeneratedColumn<String>(
      'tags_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        title,
        content,
        category,
        tagsJson,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'notes';
  @override
  VerificationContext validateIntegrity(Insertable<NoteRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('content')) {
      context.handle(_contentMeta,
          content.isAcceptableOrUnknown(data['content']!, _contentMeta));
    } else if (isInserting) {
      context.missing(_contentMeta);
    }
    if (data.containsKey('category')) {
      context.handle(_categoryMeta,
          category.isAcceptableOrUnknown(data['category']!, _categoryMeta));
    }
    if (data.containsKey('tags_json')) {
      context.handle(_tagsJsonMeta,
          tagsJson.isAcceptableOrUnknown(data['tags_json']!, _tagsJsonMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  NoteRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return NoteRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      content: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}content'])!,
      category: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}category'])!,
      tagsJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}tags_json'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $NotesTable createAlias(String alias) {
    return $NotesTable(attachedDatabase, alias);
  }
}

class NoteRow extends DataClass implements Insertable<NoteRow> {
  final String id;
  final String projectId;
  final String title;
  final String content;
  final String category;
  final String tagsJson;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  const NoteRow(
      {required this.id,
      required this.projectId,
      required this.title,
      required this.content,
      required this.category,
      required this.tagsJson,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['title'] = Variable<String>(title);
    map['content'] = Variable<String>(content);
    map['category'] = Variable<String>(category);
    map['tags_json'] = Variable<String>(tagsJson);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  NotesCompanion toCompanion(bool nullToAbsent) {
    return NotesCompanion(
      id: Value(id),
      projectId: Value(projectId),
      title: Value(title),
      content: Value(content),
      category: Value(category),
      tagsJson: Value(tagsJson),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory NoteRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return NoteRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      title: serializer.fromJson<String>(json['title']),
      content: serializer.fromJson<String>(json['content']),
      category: serializer.fromJson<String>(json['category']),
      tagsJson: serializer.fromJson<String>(json['tagsJson']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'title': serializer.toJson<String>(title),
      'content': serializer.toJson<String>(content),
      'category': serializer.toJson<String>(category),
      'tagsJson': serializer.toJson<String>(tagsJson),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  NoteRow copyWith(
          {String? id,
          String? projectId,
          String? title,
          String? content,
          String? category,
          String? tagsJson,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion}) =>
      NoteRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        title: title ?? this.title,
        content: content ?? this.content,
        category: category ?? this.category,
        tagsJson: tagsJson ?? this.tagsJson,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  NoteRow copyWithCompanion(NotesCompanion data) {
    return NoteRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      title: data.title.present ? data.title.value : this.title,
      content: data.content.present ? data.content.value : this.content,
      category: data.category.present ? data.category.value : this.category,
      tagsJson: data.tagsJson.present ? data.tagsJson.value : this.tagsJson,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('NoteRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('content: $content, ')
          ..write('category: $category, ')
          ..write('tagsJson: $tagsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, projectId, title, content, category,
      tagsJson, createdAt, updatedAt, schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is NoteRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.title == this.title &&
          other.content == this.content &&
          other.category == this.category &&
          other.tagsJson == this.tagsJson &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class NotesCompanion extends UpdateCompanion<NoteRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> title;
  final Value<String> content;
  final Value<String> category;
  final Value<String> tagsJson;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const NotesCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.title = const Value.absent(),
    this.content = const Value.absent(),
    this.category = const Value.absent(),
    this.tagsJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  NotesCompanion.insert({
    required String id,
    required String projectId,
    required String title,
    required String content,
    this.category = const Value.absent(),
    this.tagsJson = const Value.absent(),
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        title = Value(title),
        content = Value(content),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<NoteRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? title,
    Expression<String>? content,
    Expression<String>? category,
    Expression<String>? tagsJson,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (title != null) 'title': title,
      if (content != null) 'content': content,
      if (category != null) 'category': category,
      if (tagsJson != null) 'tags_json': tagsJson,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  NotesCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? title,
      Value<String>? content,
      Value<String>? category,
      Value<String>? tagsJson,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return NotesCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      title: title ?? this.title,
      content: content ?? this.content,
      category: category ?? this.category,
      tagsJson: tagsJson ?? this.tagsJson,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (content.present) {
      map['content'] = Variable<String>(content.value);
    }
    if (category.present) {
      map['category'] = Variable<String>(category.value);
    }
    if (tagsJson.present) {
      map['tags_json'] = Variable<String>(tagsJson.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('NotesCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('content: $content, ')
          ..write('category: $category, ')
          ..write('tagsJson: $tagsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LlmProvidersTable extends LlmProviders
    with TableInfo<$LlmProvidersTable, LlmProviderRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LlmProvidersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _baseUrlMeta =
      const VerificationMeta('baseUrl');
  @override
  late final GeneratedColumn<String> baseUrl = GeneratedColumn<String>(
      'base_url', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _secretKeyRefMeta =
      const VerificationMeta('secretKeyRef');
  @override
  late final GeneratedColumn<String> secretKeyRef = GeneratedColumn<String>(
      'secret_key_ref', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _cachedModelsJsonMeta =
      const VerificationMeta('cachedModelsJson');
  @override
  late final GeneratedColumn<String> cachedModelsJson = GeneratedColumn<String>(
      'cached_models_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _selectedModelIdMeta =
      const VerificationMeta('selectedModelId');
  @override
  late final GeneratedColumn<String> selectedModelId = GeneratedColumn<String>(
      'selected_model_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _temperatureMeta =
      const VerificationMeta('temperature');
  @override
  late final GeneratedColumn<double> temperature = GeneratedColumn<double>(
      'temperature', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(0.7));
  static const VerificationMeta _topPMeta = const VerificationMeta('topP');
  @override
  late final GeneratedColumn<double> topP = GeneratedColumn<double>(
      'top_p', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(0.9));
  static const VerificationMeta _streamingEnabledMeta =
      const VerificationMeta('streamingEnabled');
  @override
  late final GeneratedColumn<bool> streamingEnabled = GeneratedColumn<bool>(
      'streaming_enabled', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("streaming_enabled" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        name,
        baseUrl,
        secretKeyRef,
        cachedModelsJson,
        selectedModelId,
        status,
        temperature,
        topP,
        streamingEnabled,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'llm_providers';
  @override
  VerificationContext validateIntegrity(Insertable<LlmProviderRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('base_url')) {
      context.handle(_baseUrlMeta,
          baseUrl.isAcceptableOrUnknown(data['base_url']!, _baseUrlMeta));
    } else if (isInserting) {
      context.missing(_baseUrlMeta);
    }
    if (data.containsKey('secret_key_ref')) {
      context.handle(
          _secretKeyRefMeta,
          secretKeyRef.isAcceptableOrUnknown(
              data['secret_key_ref']!, _secretKeyRefMeta));
    } else if (isInserting) {
      context.missing(_secretKeyRefMeta);
    }
    if (data.containsKey('cached_models_json')) {
      context.handle(
          _cachedModelsJsonMeta,
          cachedModelsJson.isAcceptableOrUnknown(
              data['cached_models_json']!, _cachedModelsJsonMeta));
    }
    if (data.containsKey('selected_model_id')) {
      context.handle(
          _selectedModelIdMeta,
          selectedModelId.isAcceptableOrUnknown(
              data['selected_model_id']!, _selectedModelIdMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('temperature')) {
      context.handle(
          _temperatureMeta,
          temperature.isAcceptableOrUnknown(
              data['temperature']!, _temperatureMeta));
    }
    if (data.containsKey('top_p')) {
      context.handle(
          _topPMeta, topP.isAcceptableOrUnknown(data['top_p']!, _topPMeta));
    }
    if (data.containsKey('streaming_enabled')) {
      context.handle(
          _streamingEnabledMeta,
          streamingEnabled.isAcceptableOrUnknown(
              data['streaming_enabled']!, _streamingEnabledMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LlmProviderRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LlmProviderRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      baseUrl: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}base_url'])!,
      secretKeyRef: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}secret_key_ref'])!,
      cachedModelsJson: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}cached_models_json'])!,
      selectedModelId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}selected_model_id']),
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      temperature: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}temperature'])!,
      topP: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}top_p'])!,
      streamingEnabled: attachedDatabase.typeMapping.read(
          DriftSqlType.bool, data['${effectivePrefix}streaming_enabled'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $LlmProvidersTable createAlias(String alias) {
    return $LlmProvidersTable(attachedDatabase, alias);
  }
}

class LlmProviderRow extends DataClass implements Insertable<LlmProviderRow> {
  final String id;
  final String projectId;
  final String name;
  final String baseUrl;
  final String secretKeyRef;
  final String cachedModelsJson;
  final String? selectedModelId;
  final String status;
  final double temperature;
  final double topP;
  final bool streamingEnabled;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  const LlmProviderRow(
      {required this.id,
      required this.projectId,
      required this.name,
      required this.baseUrl,
      required this.secretKeyRef,
      required this.cachedModelsJson,
      this.selectedModelId,
      required this.status,
      required this.temperature,
      required this.topP,
      required this.streamingEnabled,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['name'] = Variable<String>(name);
    map['base_url'] = Variable<String>(baseUrl);
    map['secret_key_ref'] = Variable<String>(secretKeyRef);
    map['cached_models_json'] = Variable<String>(cachedModelsJson);
    if (!nullToAbsent || selectedModelId != null) {
      map['selected_model_id'] = Variable<String>(selectedModelId);
    }
    map['status'] = Variable<String>(status);
    map['temperature'] = Variable<double>(temperature);
    map['top_p'] = Variable<double>(topP);
    map['streaming_enabled'] = Variable<bool>(streamingEnabled);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  LlmProvidersCompanion toCompanion(bool nullToAbsent) {
    return LlmProvidersCompanion(
      id: Value(id),
      projectId: Value(projectId),
      name: Value(name),
      baseUrl: Value(baseUrl),
      secretKeyRef: Value(secretKeyRef),
      cachedModelsJson: Value(cachedModelsJson),
      selectedModelId: selectedModelId == null && nullToAbsent
          ? const Value.absent()
          : Value(selectedModelId),
      status: Value(status),
      temperature: Value(temperature),
      topP: Value(topP),
      streamingEnabled: Value(streamingEnabled),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory LlmProviderRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LlmProviderRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      name: serializer.fromJson<String>(json['name']),
      baseUrl: serializer.fromJson<String>(json['baseUrl']),
      secretKeyRef: serializer.fromJson<String>(json['secretKeyRef']),
      cachedModelsJson: serializer.fromJson<String>(json['cachedModelsJson']),
      selectedModelId: serializer.fromJson<String?>(json['selectedModelId']),
      status: serializer.fromJson<String>(json['status']),
      temperature: serializer.fromJson<double>(json['temperature']),
      topP: serializer.fromJson<double>(json['topP']),
      streamingEnabled: serializer.fromJson<bool>(json['streamingEnabled']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'name': serializer.toJson<String>(name),
      'baseUrl': serializer.toJson<String>(baseUrl),
      'secretKeyRef': serializer.toJson<String>(secretKeyRef),
      'cachedModelsJson': serializer.toJson<String>(cachedModelsJson),
      'selectedModelId': serializer.toJson<String?>(selectedModelId),
      'status': serializer.toJson<String>(status),
      'temperature': serializer.toJson<double>(temperature),
      'topP': serializer.toJson<double>(topP),
      'streamingEnabled': serializer.toJson<bool>(streamingEnabled),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  LlmProviderRow copyWith(
          {String? id,
          String? projectId,
          String? name,
          String? baseUrl,
          String? secretKeyRef,
          String? cachedModelsJson,
          Value<String?> selectedModelId = const Value.absent(),
          String? status,
          double? temperature,
          double? topP,
          bool? streamingEnabled,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion}) =>
      LlmProviderRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        name: name ?? this.name,
        baseUrl: baseUrl ?? this.baseUrl,
        secretKeyRef: secretKeyRef ?? this.secretKeyRef,
        cachedModelsJson: cachedModelsJson ?? this.cachedModelsJson,
        selectedModelId: selectedModelId.present
            ? selectedModelId.value
            : this.selectedModelId,
        status: status ?? this.status,
        temperature: temperature ?? this.temperature,
        topP: topP ?? this.topP,
        streamingEnabled: streamingEnabled ?? this.streamingEnabled,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  LlmProviderRow copyWithCompanion(LlmProvidersCompanion data) {
    return LlmProviderRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      name: data.name.present ? data.name.value : this.name,
      baseUrl: data.baseUrl.present ? data.baseUrl.value : this.baseUrl,
      secretKeyRef: data.secretKeyRef.present
          ? data.secretKeyRef.value
          : this.secretKeyRef,
      cachedModelsJson: data.cachedModelsJson.present
          ? data.cachedModelsJson.value
          : this.cachedModelsJson,
      selectedModelId: data.selectedModelId.present
          ? data.selectedModelId.value
          : this.selectedModelId,
      status: data.status.present ? data.status.value : this.status,
      temperature:
          data.temperature.present ? data.temperature.value : this.temperature,
      topP: data.topP.present ? data.topP.value : this.topP,
      streamingEnabled: data.streamingEnabled.present
          ? data.streamingEnabled.value
          : this.streamingEnabled,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LlmProviderRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('name: $name, ')
          ..write('baseUrl: $baseUrl, ')
          ..write('secretKeyRef: $secretKeyRef, ')
          ..write('cachedModelsJson: $cachedModelsJson, ')
          ..write('selectedModelId: $selectedModelId, ')
          ..write('status: $status, ')
          ..write('temperature: $temperature, ')
          ..write('topP: $topP, ')
          ..write('streamingEnabled: $streamingEnabled, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      projectId,
      name,
      baseUrl,
      secretKeyRef,
      cachedModelsJson,
      selectedModelId,
      status,
      temperature,
      topP,
      streamingEnabled,
      createdAt,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LlmProviderRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.name == this.name &&
          other.baseUrl == this.baseUrl &&
          other.secretKeyRef == this.secretKeyRef &&
          other.cachedModelsJson == this.cachedModelsJson &&
          other.selectedModelId == this.selectedModelId &&
          other.status == this.status &&
          other.temperature == this.temperature &&
          other.topP == this.topP &&
          other.streamingEnabled == this.streamingEnabled &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class LlmProvidersCompanion extends UpdateCompanion<LlmProviderRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> name;
  final Value<String> baseUrl;
  final Value<String> secretKeyRef;
  final Value<String> cachedModelsJson;
  final Value<String?> selectedModelId;
  final Value<String> status;
  final Value<double> temperature;
  final Value<double> topP;
  final Value<bool> streamingEnabled;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const LlmProvidersCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.name = const Value.absent(),
    this.baseUrl = const Value.absent(),
    this.secretKeyRef = const Value.absent(),
    this.cachedModelsJson = const Value.absent(),
    this.selectedModelId = const Value.absent(),
    this.status = const Value.absent(),
    this.temperature = const Value.absent(),
    this.topP = const Value.absent(),
    this.streamingEnabled = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LlmProvidersCompanion.insert({
    required String id,
    required String projectId,
    required String name,
    required String baseUrl,
    required String secretKeyRef,
    this.cachedModelsJson = const Value.absent(),
    this.selectedModelId = const Value.absent(),
    required String status,
    this.temperature = const Value.absent(),
    this.topP = const Value.absent(),
    this.streamingEnabled = const Value.absent(),
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        name = Value(name),
        baseUrl = Value(baseUrl),
        secretKeyRef = Value(secretKeyRef),
        status = Value(status),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<LlmProviderRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? name,
    Expression<String>? baseUrl,
    Expression<String>? secretKeyRef,
    Expression<String>? cachedModelsJson,
    Expression<String>? selectedModelId,
    Expression<String>? status,
    Expression<double>? temperature,
    Expression<double>? topP,
    Expression<bool>? streamingEnabled,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (name != null) 'name': name,
      if (baseUrl != null) 'base_url': baseUrl,
      if (secretKeyRef != null) 'secret_key_ref': secretKeyRef,
      if (cachedModelsJson != null) 'cached_models_json': cachedModelsJson,
      if (selectedModelId != null) 'selected_model_id': selectedModelId,
      if (status != null) 'status': status,
      if (temperature != null) 'temperature': temperature,
      if (topP != null) 'top_p': topP,
      if (streamingEnabled != null) 'streaming_enabled': streamingEnabled,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LlmProvidersCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? name,
      Value<String>? baseUrl,
      Value<String>? secretKeyRef,
      Value<String>? cachedModelsJson,
      Value<String?>? selectedModelId,
      Value<String>? status,
      Value<double>? temperature,
      Value<double>? topP,
      Value<bool>? streamingEnabled,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return LlmProvidersCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      name: name ?? this.name,
      baseUrl: baseUrl ?? this.baseUrl,
      secretKeyRef: secretKeyRef ?? this.secretKeyRef,
      cachedModelsJson: cachedModelsJson ?? this.cachedModelsJson,
      selectedModelId: selectedModelId ?? this.selectedModelId,
      status: status ?? this.status,
      temperature: temperature ?? this.temperature,
      topP: topP ?? this.topP,
      streamingEnabled: streamingEnabled ?? this.streamingEnabled,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (baseUrl.present) {
      map['base_url'] = Variable<String>(baseUrl.value);
    }
    if (secretKeyRef.present) {
      map['secret_key_ref'] = Variable<String>(secretKeyRef.value);
    }
    if (cachedModelsJson.present) {
      map['cached_models_json'] = Variable<String>(cachedModelsJson.value);
    }
    if (selectedModelId.present) {
      map['selected_model_id'] = Variable<String>(selectedModelId.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (temperature.present) {
      map['temperature'] = Variable<double>(temperature.value);
    }
    if (topP.present) {
      map['top_p'] = Variable<double>(topP.value);
    }
    if (streamingEnabled.present) {
      map['streaming_enabled'] = Variable<bool>(streamingEnabled.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LlmProvidersCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('name: $name, ')
          ..write('baseUrl: $baseUrl, ')
          ..write('secretKeyRef: $secretKeyRef, ')
          ..write('cachedModelsJson: $cachedModelsJson, ')
          ..write('selectedModelId: $selectedModelId, ')
          ..write('status: $status, ')
          ..write('temperature: $temperature, ')
          ..write('topP: $topP, ')
          ..write('streamingEnabled: $streamingEnabled, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LlmDefaultSettingsTableTable extends LlmDefaultSettingsTable
    with TableInfo<$LlmDefaultSettingsTableTable, LlmDefaultSettingsRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LlmDefaultSettingsTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      $customConstraints: 'NOT NULL CHECK (id = 1)');
  static const VerificationMeta _writingProviderIdMeta =
      const VerificationMeta('writingProviderId');
  @override
  late final GeneratedColumn<String> writingProviderId =
      GeneratedColumn<String>('writing_provider_id', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _writingModelIdMeta =
      const VerificationMeta('writingModelId');
  @override
  late final GeneratedColumn<String> writingModelId = GeneratedColumn<String>(
      'writing_model_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _reasoningProviderIdMeta =
      const VerificationMeta('reasoningProviderId');
  @override
  late final GeneratedColumn<String> reasoningProviderId =
      GeneratedColumn<String>('reasoning_provider_id', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _reasoningModelIdMeta =
      const VerificationMeta('reasoningModelId');
  @override
  late final GeneratedColumn<String> reasoningModelId = GeneratedColumn<String>(
      'reasoning_model_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _embeddingProviderIdMeta =
      const VerificationMeta('embeddingProviderId');
  @override
  late final GeneratedColumn<String> embeddingProviderId =
      GeneratedColumn<String>('embedding_provider_id', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _embeddingModelIdMeta =
      const VerificationMeta('embeddingModelId');
  @override
  late final GeneratedColumn<String> embeddingModelId = GeneratedColumn<String>(
      'embedding_model_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _defaultTemperatureMeta =
      const VerificationMeta('defaultTemperature');
  @override
  late final GeneratedColumn<double> defaultTemperature =
      GeneratedColumn<double>('default_temperature', aliasedName, false,
          type: DriftSqlType.double,
          requiredDuringInsert: false,
          defaultValue: const Constant(0.7));
  static const VerificationMeta _defaultTopPMeta =
      const VerificationMeta('defaultTopP');
  @override
  late final GeneratedColumn<double> defaultTopP = GeneratedColumn<double>(
      'default_top_p', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(0.9));
  static const VerificationMeta _streamingEnabledMeta =
      const VerificationMeta('streamingEnabled');
  @override
  late final GeneratedColumn<bool> streamingEnabled = GeneratedColumn<bool>(
      'streaming_enabled', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("streaming_enabled" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        writingProviderId,
        writingModelId,
        reasoningProviderId,
        reasoningModelId,
        embeddingProviderId,
        embeddingModelId,
        defaultTemperature,
        defaultTopP,
        streamingEnabled,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'llm_default_settings';
  @override
  VerificationContext validateIntegrity(
      Insertable<LlmDefaultSettingsRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('writing_provider_id')) {
      context.handle(
          _writingProviderIdMeta,
          writingProviderId.isAcceptableOrUnknown(
              data['writing_provider_id']!, _writingProviderIdMeta));
    }
    if (data.containsKey('writing_model_id')) {
      context.handle(
          _writingModelIdMeta,
          writingModelId.isAcceptableOrUnknown(
              data['writing_model_id']!, _writingModelIdMeta));
    }
    if (data.containsKey('reasoning_provider_id')) {
      context.handle(
          _reasoningProviderIdMeta,
          reasoningProviderId.isAcceptableOrUnknown(
              data['reasoning_provider_id']!, _reasoningProviderIdMeta));
    }
    if (data.containsKey('reasoning_model_id')) {
      context.handle(
          _reasoningModelIdMeta,
          reasoningModelId.isAcceptableOrUnknown(
              data['reasoning_model_id']!, _reasoningModelIdMeta));
    }
    if (data.containsKey('embedding_provider_id')) {
      context.handle(
          _embeddingProviderIdMeta,
          embeddingProviderId.isAcceptableOrUnknown(
              data['embedding_provider_id']!, _embeddingProviderIdMeta));
    }
    if (data.containsKey('embedding_model_id')) {
      context.handle(
          _embeddingModelIdMeta,
          embeddingModelId.isAcceptableOrUnknown(
              data['embedding_model_id']!, _embeddingModelIdMeta));
    }
    if (data.containsKey('default_temperature')) {
      context.handle(
          _defaultTemperatureMeta,
          defaultTemperature.isAcceptableOrUnknown(
              data['default_temperature']!, _defaultTemperatureMeta));
    }
    if (data.containsKey('default_top_p')) {
      context.handle(
          _defaultTopPMeta,
          defaultTopP.isAcceptableOrUnknown(
              data['default_top_p']!, _defaultTopPMeta));
    }
    if (data.containsKey('streaming_enabled')) {
      context.handle(
          _streamingEnabledMeta,
          streamingEnabled.isAcceptableOrUnknown(
              data['streaming_enabled']!, _streamingEnabledMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LlmDefaultSettingsRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LlmDefaultSettingsRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      writingProviderId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}writing_provider_id']),
      writingModelId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}writing_model_id']),
      reasoningProviderId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}reasoning_provider_id']),
      reasoningModelId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}reasoning_model_id']),
      embeddingProviderId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}embedding_provider_id']),
      embeddingModelId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}embedding_model_id']),
      defaultTemperature: attachedDatabase.typeMapping.read(
          DriftSqlType.double, data['${effectivePrefix}default_temperature'])!,
      defaultTopP: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}default_top_p'])!,
      streamingEnabled: attachedDatabase.typeMapping.read(
          DriftSqlType.bool, data['${effectivePrefix}streaming_enabled'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $LlmDefaultSettingsTableTable createAlias(String alias) {
    return $LlmDefaultSettingsTableTable(attachedDatabase, alias);
  }
}

class LlmDefaultSettingsRow extends DataClass
    implements Insertable<LlmDefaultSettingsRow> {
  final int id;
  final String? writingProviderId;
  final String? writingModelId;
  final String? reasoningProviderId;
  final String? reasoningModelId;
  final String? embeddingProviderId;
  final String? embeddingModelId;
  final double defaultTemperature;
  final double defaultTopP;
  final bool streamingEnabled;
  final int updatedAt;
  final int schemaVersion;
  const LlmDefaultSettingsRow(
      {required this.id,
      this.writingProviderId,
      this.writingModelId,
      this.reasoningProviderId,
      this.reasoningModelId,
      this.embeddingProviderId,
      this.embeddingModelId,
      required this.defaultTemperature,
      required this.defaultTopP,
      required this.streamingEnabled,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || writingProviderId != null) {
      map['writing_provider_id'] = Variable<String>(writingProviderId);
    }
    if (!nullToAbsent || writingModelId != null) {
      map['writing_model_id'] = Variable<String>(writingModelId);
    }
    if (!nullToAbsent || reasoningProviderId != null) {
      map['reasoning_provider_id'] = Variable<String>(reasoningProviderId);
    }
    if (!nullToAbsent || reasoningModelId != null) {
      map['reasoning_model_id'] = Variable<String>(reasoningModelId);
    }
    if (!nullToAbsent || embeddingProviderId != null) {
      map['embedding_provider_id'] = Variable<String>(embeddingProviderId);
    }
    if (!nullToAbsent || embeddingModelId != null) {
      map['embedding_model_id'] = Variable<String>(embeddingModelId);
    }
    map['default_temperature'] = Variable<double>(defaultTemperature);
    map['default_top_p'] = Variable<double>(defaultTopP);
    map['streaming_enabled'] = Variable<bool>(streamingEnabled);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  LlmDefaultSettingsTableCompanion toCompanion(bool nullToAbsent) {
    return LlmDefaultSettingsTableCompanion(
      id: Value(id),
      writingProviderId: writingProviderId == null && nullToAbsent
          ? const Value.absent()
          : Value(writingProviderId),
      writingModelId: writingModelId == null && nullToAbsent
          ? const Value.absent()
          : Value(writingModelId),
      reasoningProviderId: reasoningProviderId == null && nullToAbsent
          ? const Value.absent()
          : Value(reasoningProviderId),
      reasoningModelId: reasoningModelId == null && nullToAbsent
          ? const Value.absent()
          : Value(reasoningModelId),
      embeddingProviderId: embeddingProviderId == null && nullToAbsent
          ? const Value.absent()
          : Value(embeddingProviderId),
      embeddingModelId: embeddingModelId == null && nullToAbsent
          ? const Value.absent()
          : Value(embeddingModelId),
      defaultTemperature: Value(defaultTemperature),
      defaultTopP: Value(defaultTopP),
      streamingEnabled: Value(streamingEnabled),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory LlmDefaultSettingsRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LlmDefaultSettingsRow(
      id: serializer.fromJson<int>(json['id']),
      writingProviderId:
          serializer.fromJson<String?>(json['writingProviderId']),
      writingModelId: serializer.fromJson<String?>(json['writingModelId']),
      reasoningProviderId:
          serializer.fromJson<String?>(json['reasoningProviderId']),
      reasoningModelId: serializer.fromJson<String?>(json['reasoningModelId']),
      embeddingProviderId:
          serializer.fromJson<String?>(json['embeddingProviderId']),
      embeddingModelId: serializer.fromJson<String?>(json['embeddingModelId']),
      defaultTemperature:
          serializer.fromJson<double>(json['defaultTemperature']),
      defaultTopP: serializer.fromJson<double>(json['defaultTopP']),
      streamingEnabled: serializer.fromJson<bool>(json['streamingEnabled']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'writingProviderId': serializer.toJson<String?>(writingProviderId),
      'writingModelId': serializer.toJson<String?>(writingModelId),
      'reasoningProviderId': serializer.toJson<String?>(reasoningProviderId),
      'reasoningModelId': serializer.toJson<String?>(reasoningModelId),
      'embeddingProviderId': serializer.toJson<String?>(embeddingProviderId),
      'embeddingModelId': serializer.toJson<String?>(embeddingModelId),
      'defaultTemperature': serializer.toJson<double>(defaultTemperature),
      'defaultTopP': serializer.toJson<double>(defaultTopP),
      'streamingEnabled': serializer.toJson<bool>(streamingEnabled),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  LlmDefaultSettingsRow copyWith(
          {int? id,
          Value<String?> writingProviderId = const Value.absent(),
          Value<String?> writingModelId = const Value.absent(),
          Value<String?> reasoningProviderId = const Value.absent(),
          Value<String?> reasoningModelId = const Value.absent(),
          Value<String?> embeddingProviderId = const Value.absent(),
          Value<String?> embeddingModelId = const Value.absent(),
          double? defaultTemperature,
          double? defaultTopP,
          bool? streamingEnabled,
          int? updatedAt,
          int? schemaVersion}) =>
      LlmDefaultSettingsRow(
        id: id ?? this.id,
        writingProviderId: writingProviderId.present
            ? writingProviderId.value
            : this.writingProviderId,
        writingModelId:
            writingModelId.present ? writingModelId.value : this.writingModelId,
        reasoningProviderId: reasoningProviderId.present
            ? reasoningProviderId.value
            : this.reasoningProviderId,
        reasoningModelId: reasoningModelId.present
            ? reasoningModelId.value
            : this.reasoningModelId,
        embeddingProviderId: embeddingProviderId.present
            ? embeddingProviderId.value
            : this.embeddingProviderId,
        embeddingModelId: embeddingModelId.present
            ? embeddingModelId.value
            : this.embeddingModelId,
        defaultTemperature: defaultTemperature ?? this.defaultTemperature,
        defaultTopP: defaultTopP ?? this.defaultTopP,
        streamingEnabled: streamingEnabled ?? this.streamingEnabled,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  LlmDefaultSettingsRow copyWithCompanion(
      LlmDefaultSettingsTableCompanion data) {
    return LlmDefaultSettingsRow(
      id: data.id.present ? data.id.value : this.id,
      writingProviderId: data.writingProviderId.present
          ? data.writingProviderId.value
          : this.writingProviderId,
      writingModelId: data.writingModelId.present
          ? data.writingModelId.value
          : this.writingModelId,
      reasoningProviderId: data.reasoningProviderId.present
          ? data.reasoningProviderId.value
          : this.reasoningProviderId,
      reasoningModelId: data.reasoningModelId.present
          ? data.reasoningModelId.value
          : this.reasoningModelId,
      embeddingProviderId: data.embeddingProviderId.present
          ? data.embeddingProviderId.value
          : this.embeddingProviderId,
      embeddingModelId: data.embeddingModelId.present
          ? data.embeddingModelId.value
          : this.embeddingModelId,
      defaultTemperature: data.defaultTemperature.present
          ? data.defaultTemperature.value
          : this.defaultTemperature,
      defaultTopP:
          data.defaultTopP.present ? data.defaultTopP.value : this.defaultTopP,
      streamingEnabled: data.streamingEnabled.present
          ? data.streamingEnabled.value
          : this.streamingEnabled,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LlmDefaultSettingsRow(')
          ..write('id: $id, ')
          ..write('writingProviderId: $writingProviderId, ')
          ..write('writingModelId: $writingModelId, ')
          ..write('reasoningProviderId: $reasoningProviderId, ')
          ..write('reasoningModelId: $reasoningModelId, ')
          ..write('embeddingProviderId: $embeddingProviderId, ')
          ..write('embeddingModelId: $embeddingModelId, ')
          ..write('defaultTemperature: $defaultTemperature, ')
          ..write('defaultTopP: $defaultTopP, ')
          ..write('streamingEnabled: $streamingEnabled, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      writingProviderId,
      writingModelId,
      reasoningProviderId,
      reasoningModelId,
      embeddingProviderId,
      embeddingModelId,
      defaultTemperature,
      defaultTopP,
      streamingEnabled,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LlmDefaultSettingsRow &&
          other.id == this.id &&
          other.writingProviderId == this.writingProviderId &&
          other.writingModelId == this.writingModelId &&
          other.reasoningProviderId == this.reasoningProviderId &&
          other.reasoningModelId == this.reasoningModelId &&
          other.embeddingProviderId == this.embeddingProviderId &&
          other.embeddingModelId == this.embeddingModelId &&
          other.defaultTemperature == this.defaultTemperature &&
          other.defaultTopP == this.defaultTopP &&
          other.streamingEnabled == this.streamingEnabled &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class LlmDefaultSettingsTableCompanion
    extends UpdateCompanion<LlmDefaultSettingsRow> {
  final Value<int> id;
  final Value<String?> writingProviderId;
  final Value<String?> writingModelId;
  final Value<String?> reasoningProviderId;
  final Value<String?> reasoningModelId;
  final Value<String?> embeddingProviderId;
  final Value<String?> embeddingModelId;
  final Value<double> defaultTemperature;
  final Value<double> defaultTopP;
  final Value<bool> streamingEnabled;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  const LlmDefaultSettingsTableCompanion({
    this.id = const Value.absent(),
    this.writingProviderId = const Value.absent(),
    this.writingModelId = const Value.absent(),
    this.reasoningProviderId = const Value.absent(),
    this.reasoningModelId = const Value.absent(),
    this.embeddingProviderId = const Value.absent(),
    this.embeddingModelId = const Value.absent(),
    this.defaultTemperature = const Value.absent(),
    this.defaultTopP = const Value.absent(),
    this.streamingEnabled = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
  });
  LlmDefaultSettingsTableCompanion.insert({
    this.id = const Value.absent(),
    this.writingProviderId = const Value.absent(),
    this.writingModelId = const Value.absent(),
    this.reasoningProviderId = const Value.absent(),
    this.reasoningModelId = const Value.absent(),
    this.embeddingProviderId = const Value.absent(),
    this.embeddingModelId = const Value.absent(),
    this.defaultTemperature = const Value.absent(),
    this.defaultTopP = const Value.absent(),
    this.streamingEnabled = const Value.absent(),
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
  }) : updatedAt = Value(updatedAt);
  static Insertable<LlmDefaultSettingsRow> custom({
    Expression<int>? id,
    Expression<String>? writingProviderId,
    Expression<String>? writingModelId,
    Expression<String>? reasoningProviderId,
    Expression<String>? reasoningModelId,
    Expression<String>? embeddingProviderId,
    Expression<String>? embeddingModelId,
    Expression<double>? defaultTemperature,
    Expression<double>? defaultTopP,
    Expression<bool>? streamingEnabled,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (writingProviderId != null) 'writing_provider_id': writingProviderId,
      if (writingModelId != null) 'writing_model_id': writingModelId,
      if (reasoningProviderId != null)
        'reasoning_provider_id': reasoningProviderId,
      if (reasoningModelId != null) 'reasoning_model_id': reasoningModelId,
      if (embeddingProviderId != null)
        'embedding_provider_id': embeddingProviderId,
      if (embeddingModelId != null) 'embedding_model_id': embeddingModelId,
      if (defaultTemperature != null) 'default_temperature': defaultTemperature,
      if (defaultTopP != null) 'default_top_p': defaultTopP,
      if (streamingEnabled != null) 'streaming_enabled': streamingEnabled,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
    });
  }

  LlmDefaultSettingsTableCompanion copyWith(
      {Value<int>? id,
      Value<String?>? writingProviderId,
      Value<String?>? writingModelId,
      Value<String?>? reasoningProviderId,
      Value<String?>? reasoningModelId,
      Value<String?>? embeddingProviderId,
      Value<String?>? embeddingModelId,
      Value<double>? defaultTemperature,
      Value<double>? defaultTopP,
      Value<bool>? streamingEnabled,
      Value<int>? updatedAt,
      Value<int>? schemaVersion}) {
    return LlmDefaultSettingsTableCompanion(
      id: id ?? this.id,
      writingProviderId: writingProviderId ?? this.writingProviderId,
      writingModelId: writingModelId ?? this.writingModelId,
      reasoningProviderId: reasoningProviderId ?? this.reasoningProviderId,
      reasoningModelId: reasoningModelId ?? this.reasoningModelId,
      embeddingProviderId: embeddingProviderId ?? this.embeddingProviderId,
      embeddingModelId: embeddingModelId ?? this.embeddingModelId,
      defaultTemperature: defaultTemperature ?? this.defaultTemperature,
      defaultTopP: defaultTopP ?? this.defaultTopP,
      streamingEnabled: streamingEnabled ?? this.streamingEnabled,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (writingProviderId.present) {
      map['writing_provider_id'] = Variable<String>(writingProviderId.value);
    }
    if (writingModelId.present) {
      map['writing_model_id'] = Variable<String>(writingModelId.value);
    }
    if (reasoningProviderId.present) {
      map['reasoning_provider_id'] =
          Variable<String>(reasoningProviderId.value);
    }
    if (reasoningModelId.present) {
      map['reasoning_model_id'] = Variable<String>(reasoningModelId.value);
    }
    if (embeddingProviderId.present) {
      map['embedding_provider_id'] =
          Variable<String>(embeddingProviderId.value);
    }
    if (embeddingModelId.present) {
      map['embedding_model_id'] = Variable<String>(embeddingModelId.value);
    }
    if (defaultTemperature.present) {
      map['default_temperature'] = Variable<double>(defaultTemperature.value);
    }
    if (defaultTopP.present) {
      map['default_top_p'] = Variable<double>(defaultTopP.value);
    }
    if (streamingEnabled.present) {
      map['streaming_enabled'] = Variable<bool>(streamingEnabled.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LlmDefaultSettingsTableCompanion(')
          ..write('id: $id, ')
          ..write('writingProviderId: $writingProviderId, ')
          ..write('writingModelId: $writingModelId, ')
          ..write('reasoningProviderId: $reasoningProviderId, ')
          ..write('reasoningModelId: $reasoningModelId, ')
          ..write('embeddingProviderId: $embeddingProviderId, ')
          ..write('embeddingModelId: $embeddingModelId, ')
          ..write('defaultTemperature: $defaultTemperature, ')
          ..write('defaultTopP: $defaultTopP, ')
          ..write('streamingEnabled: $streamingEnabled, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }
}

class $OutlineNodesTable extends OutlineNodes
    with TableInfo<$OutlineNodesTable, OutlineNodeRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $OutlineNodesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _summaryMeta =
      const VerificationMeta('summary');
  @override
  late final GeneratedColumn<String> summary = GeneratedColumn<String>(
      'summary', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _chapterIdMeta =
      const VerificationMeta('chapterId');
  @override
  late final GeneratedColumn<String> chapterId = GeneratedColumn<String>(
      'chapter_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _parentIdMeta =
      const VerificationMeta('parentId');
  @override
  late final GeneratedColumn<String> parentId = GeneratedColumn<String>(
      'parent_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _sortOrderMeta =
      const VerificationMeta('sortOrder');
  @override
  late final GeneratedColumn<int> sortOrder = GeneratedColumn<int>(
      'sort_order', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _tagsJsonMeta =
      const VerificationMeta('tagsJson');
  @override
  late final GeneratedColumn<String> tagsJson = GeneratedColumn<String>(
      'tags_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        title,
        summary,
        chapterId,
        parentId,
        sortOrder,
        tagsJson,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'outline_nodes';
  @override
  VerificationContext validateIntegrity(Insertable<OutlineNodeRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('summary')) {
      context.handle(_summaryMeta,
          summary.isAcceptableOrUnknown(data['summary']!, _summaryMeta));
    }
    if (data.containsKey('chapter_id')) {
      context.handle(_chapterIdMeta,
          chapterId.isAcceptableOrUnknown(data['chapter_id']!, _chapterIdMeta));
    }
    if (data.containsKey('parent_id')) {
      context.handle(_parentIdMeta,
          parentId.isAcceptableOrUnknown(data['parent_id']!, _parentIdMeta));
    }
    if (data.containsKey('sort_order')) {
      context.handle(_sortOrderMeta,
          sortOrder.isAcceptableOrUnknown(data['sort_order']!, _sortOrderMeta));
    }
    if (data.containsKey('tags_json')) {
      context.handle(_tagsJsonMeta,
          tagsJson.isAcceptableOrUnknown(data['tags_json']!, _tagsJsonMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  OutlineNodeRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return OutlineNodeRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      summary: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}summary'])!,
      chapterId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}chapter_id'])!,
      parentId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}parent_id'])!,
      sortOrder: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sort_order'])!,
      tagsJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}tags_json'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $OutlineNodesTable createAlias(String alias) {
    return $OutlineNodesTable(attachedDatabase, alias);
  }
}

class OutlineNodeRow extends DataClass implements Insertable<OutlineNodeRow> {
  final String id;
  final String projectId;
  final String title;
  final String summary;
  final String chapterId;
  final String parentId;
  final int sortOrder;
  final String tagsJson;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  const OutlineNodeRow(
      {required this.id,
      required this.projectId,
      required this.title,
      required this.summary,
      required this.chapterId,
      required this.parentId,
      required this.sortOrder,
      required this.tagsJson,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['title'] = Variable<String>(title);
    map['summary'] = Variable<String>(summary);
    map['chapter_id'] = Variable<String>(chapterId);
    map['parent_id'] = Variable<String>(parentId);
    map['sort_order'] = Variable<int>(sortOrder);
    map['tags_json'] = Variable<String>(tagsJson);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  OutlineNodesCompanion toCompanion(bool nullToAbsent) {
    return OutlineNodesCompanion(
      id: Value(id),
      projectId: Value(projectId),
      title: Value(title),
      summary: Value(summary),
      chapterId: Value(chapterId),
      parentId: Value(parentId),
      sortOrder: Value(sortOrder),
      tagsJson: Value(tagsJson),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory OutlineNodeRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return OutlineNodeRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      title: serializer.fromJson<String>(json['title']),
      summary: serializer.fromJson<String>(json['summary']),
      chapterId: serializer.fromJson<String>(json['chapterId']),
      parentId: serializer.fromJson<String>(json['parentId']),
      sortOrder: serializer.fromJson<int>(json['sortOrder']),
      tagsJson: serializer.fromJson<String>(json['tagsJson']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'title': serializer.toJson<String>(title),
      'summary': serializer.toJson<String>(summary),
      'chapterId': serializer.toJson<String>(chapterId),
      'parentId': serializer.toJson<String>(parentId),
      'sortOrder': serializer.toJson<int>(sortOrder),
      'tagsJson': serializer.toJson<String>(tagsJson),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  OutlineNodeRow copyWith(
          {String? id,
          String? projectId,
          String? title,
          String? summary,
          String? chapterId,
          String? parentId,
          int? sortOrder,
          String? tagsJson,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion}) =>
      OutlineNodeRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        title: title ?? this.title,
        summary: summary ?? this.summary,
        chapterId: chapterId ?? this.chapterId,
        parentId: parentId ?? this.parentId,
        sortOrder: sortOrder ?? this.sortOrder,
        tagsJson: tagsJson ?? this.tagsJson,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  OutlineNodeRow copyWithCompanion(OutlineNodesCompanion data) {
    return OutlineNodeRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      title: data.title.present ? data.title.value : this.title,
      summary: data.summary.present ? data.summary.value : this.summary,
      chapterId: data.chapterId.present ? data.chapterId.value : this.chapterId,
      parentId: data.parentId.present ? data.parentId.value : this.parentId,
      sortOrder: data.sortOrder.present ? data.sortOrder.value : this.sortOrder,
      tagsJson: data.tagsJson.present ? data.tagsJson.value : this.tagsJson,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('OutlineNodeRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('summary: $summary, ')
          ..write('chapterId: $chapterId, ')
          ..write('parentId: $parentId, ')
          ..write('sortOrder: $sortOrder, ')
          ..write('tagsJson: $tagsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, projectId, title, summary, chapterId,
      parentId, sortOrder, tagsJson, createdAt, updatedAt, schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is OutlineNodeRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.title == this.title &&
          other.summary == this.summary &&
          other.chapterId == this.chapterId &&
          other.parentId == this.parentId &&
          other.sortOrder == this.sortOrder &&
          other.tagsJson == this.tagsJson &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class OutlineNodesCompanion extends UpdateCompanion<OutlineNodeRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> title;
  final Value<String> summary;
  final Value<String> chapterId;
  final Value<String> parentId;
  final Value<int> sortOrder;
  final Value<String> tagsJson;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const OutlineNodesCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.title = const Value.absent(),
    this.summary = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.parentId = const Value.absent(),
    this.sortOrder = const Value.absent(),
    this.tagsJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  OutlineNodesCompanion.insert({
    required String id,
    required String projectId,
    required String title,
    this.summary = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.parentId = const Value.absent(),
    this.sortOrder = const Value.absent(),
    this.tagsJson = const Value.absent(),
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        title = Value(title),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<OutlineNodeRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? title,
    Expression<String>? summary,
    Expression<String>? chapterId,
    Expression<String>? parentId,
    Expression<int>? sortOrder,
    Expression<String>? tagsJson,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (title != null) 'title': title,
      if (summary != null) 'summary': summary,
      if (chapterId != null) 'chapter_id': chapterId,
      if (parentId != null) 'parent_id': parentId,
      if (sortOrder != null) 'sort_order': sortOrder,
      if (tagsJson != null) 'tags_json': tagsJson,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  OutlineNodesCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? title,
      Value<String>? summary,
      Value<String>? chapterId,
      Value<String>? parentId,
      Value<int>? sortOrder,
      Value<String>? tagsJson,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return OutlineNodesCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      title: title ?? this.title,
      summary: summary ?? this.summary,
      chapterId: chapterId ?? this.chapterId,
      parentId: parentId ?? this.parentId,
      sortOrder: sortOrder ?? this.sortOrder,
      tagsJson: tagsJson ?? this.tagsJson,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (summary.present) {
      map['summary'] = Variable<String>(summary.value);
    }
    if (chapterId.present) {
      map['chapter_id'] = Variable<String>(chapterId.value);
    }
    if (parentId.present) {
      map['parent_id'] = Variable<String>(parentId.value);
    }
    if (sortOrder.present) {
      map['sort_order'] = Variable<int>(sortOrder.value);
    }
    if (tagsJson.present) {
      map['tags_json'] = Variable<String>(tagsJson.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('OutlineNodesCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('summary: $summary, ')
          ..write('chapterId: $chapterId, ')
          ..write('parentId: $parentId, ')
          ..write('sortOrder: $sortOrder, ')
          ..write('tagsJson: $tagsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $AgentTasksTable extends AgentTasks
    with TableInfo<$AgentTasksTable, AgentTaskRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AgentTasksTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES projects (id) ON DELETE CASCADE'));
  static const VerificationMeta _taskTypeMeta =
      const VerificationMeta('taskType');
  @override
  late final GeneratedColumn<String> taskType = GeneratedColumn<String>(
      'task_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  static const VerificationMeta _chapterIdMeta =
      const VerificationMeta('chapterId');
  @override
  late final GeneratedColumn<String> chapterId = GeneratedColumn<String>(
      'chapter_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _instructionMeta =
      const VerificationMeta('instruction');
  @override
  late final GeneratedColumn<String> instruction = GeneratedColumn<String>(
      'instruction', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _resultMeta = const VerificationMeta('result');
  @override
  late final GeneratedColumn<String> result = GeneratedColumn<String>(
      'result', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _errorMessageMeta =
      const VerificationMeta('errorMessage');
  @override
  late final GeneratedColumn<String> errorMessage = GeneratedColumn<String>(
      'error_message', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        taskType,
        status,
        createdAt,
        updatedAt,
        schemaVersion,
        chapterId,
        instruction,
        result,
        errorMessage
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'agent_tasks';
  @override
  VerificationContext validateIntegrity(Insertable<AgentTaskRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('task_type')) {
      context.handle(_taskTypeMeta,
          taskType.isAcceptableOrUnknown(data['task_type']!, _taskTypeMeta));
    } else if (isInserting) {
      context.missing(_taskTypeMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    if (data.containsKey('chapter_id')) {
      context.handle(_chapterIdMeta,
          chapterId.isAcceptableOrUnknown(data['chapter_id']!, _chapterIdMeta));
    }
    if (data.containsKey('instruction')) {
      context.handle(
          _instructionMeta,
          instruction.isAcceptableOrUnknown(
              data['instruction']!, _instructionMeta));
    }
    if (data.containsKey('result')) {
      context.handle(_resultMeta,
          result.isAcceptableOrUnknown(data['result']!, _resultMeta));
    }
    if (data.containsKey('error_message')) {
      context.handle(
          _errorMessageMeta,
          errorMessage.isAcceptableOrUnknown(
              data['error_message']!, _errorMessageMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  AgentTaskRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AgentTaskRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      taskType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}task_type'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
      chapterId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}chapter_id']),
      instruction: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}instruction']),
      result: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}result']),
      errorMessage: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}error_message']),
    );
  }

  @override
  $AgentTasksTable createAlias(String alias) {
    return $AgentTasksTable(attachedDatabase, alias);
  }
}

class AgentTaskRow extends DataClass implements Insertable<AgentTaskRow> {
  final String id;
  final String projectId;
  final String taskType;
  final String status;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  final String? chapterId;
  final String? instruction;
  final String? result;
  final String? errorMessage;
  const AgentTaskRow(
      {required this.id,
      required this.projectId,
      required this.taskType,
      required this.status,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion,
      this.chapterId,
      this.instruction,
      this.result,
      this.errorMessage});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['task_type'] = Variable<String>(taskType);
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    if (!nullToAbsent || chapterId != null) {
      map['chapter_id'] = Variable<String>(chapterId);
    }
    if (!nullToAbsent || instruction != null) {
      map['instruction'] = Variable<String>(instruction);
    }
    if (!nullToAbsent || result != null) {
      map['result'] = Variable<String>(result);
    }
    if (!nullToAbsent || errorMessage != null) {
      map['error_message'] = Variable<String>(errorMessage);
    }
    return map;
  }

  AgentTasksCompanion toCompanion(bool nullToAbsent) {
    return AgentTasksCompanion(
      id: Value(id),
      projectId: Value(projectId),
      taskType: Value(taskType),
      status: Value(status),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
      chapterId: chapterId == null && nullToAbsent
          ? const Value.absent()
          : Value(chapterId),
      instruction: instruction == null && nullToAbsent
          ? const Value.absent()
          : Value(instruction),
      result:
          result == null && nullToAbsent ? const Value.absent() : Value(result),
      errorMessage: errorMessage == null && nullToAbsent
          ? const Value.absent()
          : Value(errorMessage),
    );
  }

  factory AgentTaskRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AgentTaskRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      taskType: serializer.fromJson<String>(json['taskType']),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
      chapterId: serializer.fromJson<String?>(json['chapterId']),
      instruction: serializer.fromJson<String?>(json['instruction']),
      result: serializer.fromJson<String?>(json['result']),
      errorMessage: serializer.fromJson<String?>(json['errorMessage']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'taskType': serializer.toJson<String>(taskType),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
      'chapterId': serializer.toJson<String?>(chapterId),
      'instruction': serializer.toJson<String?>(instruction),
      'result': serializer.toJson<String?>(result),
      'errorMessage': serializer.toJson<String?>(errorMessage),
    };
  }

  AgentTaskRow copyWith(
          {String? id,
          String? projectId,
          String? taskType,
          String? status,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion,
          Value<String?> chapterId = const Value.absent(),
          Value<String?> instruction = const Value.absent(),
          Value<String?> result = const Value.absent(),
          Value<String?> errorMessage = const Value.absent()}) =>
      AgentTaskRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        taskType: taskType ?? this.taskType,
        status: status ?? this.status,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
        chapterId: chapterId.present ? chapterId.value : this.chapterId,
        instruction: instruction.present ? instruction.value : this.instruction,
        result: result.present ? result.value : this.result,
        errorMessage:
            errorMessage.present ? errorMessage.value : this.errorMessage,
      );
  AgentTaskRow copyWithCompanion(AgentTasksCompanion data) {
    return AgentTaskRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      taskType: data.taskType.present ? data.taskType.value : this.taskType,
      status: data.status.present ? data.status.value : this.status,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
      chapterId: data.chapterId.present ? data.chapterId.value : this.chapterId,
      instruction:
          data.instruction.present ? data.instruction.value : this.instruction,
      result: data.result.present ? data.result.value : this.result,
      errorMessage: data.errorMessage.present
          ? data.errorMessage.value
          : this.errorMessage,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AgentTaskRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('taskType: $taskType, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('chapterId: $chapterId, ')
          ..write('instruction: $instruction, ')
          ..write('result: $result, ')
          ..write('errorMessage: $errorMessage')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, projectId, taskType, status, createdAt,
      updatedAt, schemaVersion, chapterId, instruction, result, errorMessage);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AgentTaskRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.taskType == this.taskType &&
          other.status == this.status &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion &&
          other.chapterId == this.chapterId &&
          other.instruction == this.instruction &&
          other.result == this.result &&
          other.errorMessage == this.errorMessage);
}

class AgentTasksCompanion extends UpdateCompanion<AgentTaskRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> taskType;
  final Value<String> status;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<String?> chapterId;
  final Value<String?> instruction;
  final Value<String?> result;
  final Value<String?> errorMessage;
  final Value<int> rowid;
  const AgentTasksCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.taskType = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.instruction = const Value.absent(),
    this.result = const Value.absent(),
    this.errorMessage = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  AgentTasksCompanion.insert({
    required String id,
    required String projectId,
    required String taskType,
    required String status,
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.instruction = const Value.absent(),
    this.result = const Value.absent(),
    this.errorMessage = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        taskType = Value(taskType),
        status = Value(status),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<AgentTaskRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? taskType,
    Expression<String>? status,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<String>? chapterId,
    Expression<String>? instruction,
    Expression<String>? result,
    Expression<String>? errorMessage,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (taskType != null) 'task_type': taskType,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (chapterId != null) 'chapter_id': chapterId,
      if (instruction != null) 'instruction': instruction,
      if (result != null) 'result': result,
      if (errorMessage != null) 'error_message': errorMessage,
      if (rowid != null) 'rowid': rowid,
    });
  }

  AgentTasksCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? taskType,
      Value<String>? status,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<String?>? chapterId,
      Value<String?>? instruction,
      Value<String?>? result,
      Value<String?>? errorMessage,
      Value<int>? rowid}) {
    return AgentTasksCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      taskType: taskType ?? this.taskType,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      chapterId: chapterId ?? this.chapterId,
      instruction: instruction ?? this.instruction,
      result: result ?? this.result,
      errorMessage: errorMessage ?? this.errorMessage,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (taskType.present) {
      map['task_type'] = Variable<String>(taskType.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (chapterId.present) {
      map['chapter_id'] = Variable<String>(chapterId.value);
    }
    if (instruction.present) {
      map['instruction'] = Variable<String>(instruction.value);
    }
    if (result.present) {
      map['result'] = Variable<String>(result.value);
    }
    if (errorMessage.present) {
      map['error_message'] = Variable<String>(errorMessage.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AgentTasksCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('taskType: $taskType, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('chapterId: $chapterId, ')
          ..write('instruction: $instruction, ')
          ..write('result: $result, ')
          ..write('errorMessage: $errorMessage, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $TimelineEventsTable extends TimelineEvents
    with TableInfo<$TimelineEventsTable, TimelineEventRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $TimelineEventsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _characterIdMeta =
      const VerificationMeta('characterId');
  @override
  late final GeneratedColumn<String> characterId = GeneratedColumn<String>(
      'character_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _chapterIdMeta =
      const VerificationMeta('chapterId');
  @override
  late final GeneratedColumn<String> chapterId = GeneratedColumn<String>(
      'chapter_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _chapterOrderMeta =
      const VerificationMeta('chapterOrder');
  @override
  late final GeneratedColumn<int> chapterOrder = GeneratedColumn<int>(
      'chapter_order', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _eventTypeMeta =
      const VerificationMeta('eventType');
  @override
  late final GeneratedColumn<String> eventType = GeneratedColumn<String>(
      'event_type', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _relatedCharacterIdsJsonMeta =
      const VerificationMeta('relatedCharacterIdsJson');
  @override
  late final GeneratedColumn<String> relatedCharacterIdsJson =
      GeneratedColumn<String>('related_character_ids_json', aliasedName, false,
          type: DriftSqlType.string,
          requiredDuringInsert: false,
          defaultValue: const Constant('[]'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        characterId,
        chapterId,
        description,
        chapterOrder,
        eventType,
        relatedCharacterIdsJson,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'timeline_events';
  @override
  VerificationContext validateIntegrity(Insertable<TimelineEventRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('character_id')) {
      context.handle(
          _characterIdMeta,
          characterId.isAcceptableOrUnknown(
              data['character_id']!, _characterIdMeta));
    } else if (isInserting) {
      context.missing(_characterIdMeta);
    }
    if (data.containsKey('chapter_id')) {
      context.handle(_chapterIdMeta,
          chapterId.isAcceptableOrUnknown(data['chapter_id']!, _chapterIdMeta));
    } else if (isInserting) {
      context.missing(_chapterIdMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    } else if (isInserting) {
      context.missing(_descriptionMeta);
    }
    if (data.containsKey('chapter_order')) {
      context.handle(
          _chapterOrderMeta,
          chapterOrder.isAcceptableOrUnknown(
              data['chapter_order']!, _chapterOrderMeta));
    }
    if (data.containsKey('event_type')) {
      context.handle(_eventTypeMeta,
          eventType.isAcceptableOrUnknown(data['event_type']!, _eventTypeMeta));
    }
    if (data.containsKey('related_character_ids_json')) {
      context.handle(
          _relatedCharacterIdsJsonMeta,
          relatedCharacterIdsJson.isAcceptableOrUnknown(
              data['related_character_ids_json']!,
              _relatedCharacterIdsJsonMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  TimelineEventRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return TimelineEventRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      characterId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}character_id'])!,
      chapterId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}chapter_id'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description'])!,
      chapterOrder: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}chapter_order'])!,
      eventType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}event_type'])!,
      relatedCharacterIdsJson: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}related_character_ids_json'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $TimelineEventsTable createAlias(String alias) {
    return $TimelineEventsTable(attachedDatabase, alias);
  }
}

class TimelineEventRow extends DataClass
    implements Insertable<TimelineEventRow> {
  final String id;
  final String projectId;
  final String characterId;
  final String chapterId;
  final String description;
  final int chapterOrder;
  final String eventType;
  final String relatedCharacterIdsJson;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  const TimelineEventRow(
      {required this.id,
      required this.projectId,
      required this.characterId,
      required this.chapterId,
      required this.description,
      required this.chapterOrder,
      required this.eventType,
      required this.relatedCharacterIdsJson,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['character_id'] = Variable<String>(characterId);
    map['chapter_id'] = Variable<String>(chapterId);
    map['description'] = Variable<String>(description);
    map['chapter_order'] = Variable<int>(chapterOrder);
    map['event_type'] = Variable<String>(eventType);
    map['related_character_ids_json'] =
        Variable<String>(relatedCharacterIdsJson);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  TimelineEventsCompanion toCompanion(bool nullToAbsent) {
    return TimelineEventsCompanion(
      id: Value(id),
      projectId: Value(projectId),
      characterId: Value(characterId),
      chapterId: Value(chapterId),
      description: Value(description),
      chapterOrder: Value(chapterOrder),
      eventType: Value(eventType),
      relatedCharacterIdsJson: Value(relatedCharacterIdsJson),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory TimelineEventRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return TimelineEventRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      characterId: serializer.fromJson<String>(json['characterId']),
      chapterId: serializer.fromJson<String>(json['chapterId']),
      description: serializer.fromJson<String>(json['description']),
      chapterOrder: serializer.fromJson<int>(json['chapterOrder']),
      eventType: serializer.fromJson<String>(json['eventType']),
      relatedCharacterIdsJson:
          serializer.fromJson<String>(json['relatedCharacterIdsJson']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'characterId': serializer.toJson<String>(characterId),
      'chapterId': serializer.toJson<String>(chapterId),
      'description': serializer.toJson<String>(description),
      'chapterOrder': serializer.toJson<int>(chapterOrder),
      'eventType': serializer.toJson<String>(eventType),
      'relatedCharacterIdsJson':
          serializer.toJson<String>(relatedCharacterIdsJson),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  TimelineEventRow copyWith(
          {String? id,
          String? projectId,
          String? characterId,
          String? chapterId,
          String? description,
          int? chapterOrder,
          String? eventType,
          String? relatedCharacterIdsJson,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion}) =>
      TimelineEventRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        characterId: characterId ?? this.characterId,
        chapterId: chapterId ?? this.chapterId,
        description: description ?? this.description,
        chapterOrder: chapterOrder ?? this.chapterOrder,
        eventType: eventType ?? this.eventType,
        relatedCharacterIdsJson:
            relatedCharacterIdsJson ?? this.relatedCharacterIdsJson,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  TimelineEventRow copyWithCompanion(TimelineEventsCompanion data) {
    return TimelineEventRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      characterId:
          data.characterId.present ? data.characterId.value : this.characterId,
      chapterId: data.chapterId.present ? data.chapterId.value : this.chapterId,
      description:
          data.description.present ? data.description.value : this.description,
      chapterOrder: data.chapterOrder.present
          ? data.chapterOrder.value
          : this.chapterOrder,
      eventType: data.eventType.present ? data.eventType.value : this.eventType,
      relatedCharacterIdsJson: data.relatedCharacterIdsJson.present
          ? data.relatedCharacterIdsJson.value
          : this.relatedCharacterIdsJson,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('TimelineEventRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('characterId: $characterId, ')
          ..write('chapterId: $chapterId, ')
          ..write('description: $description, ')
          ..write('chapterOrder: $chapterOrder, ')
          ..write('eventType: $eventType, ')
          ..write('relatedCharacterIdsJson: $relatedCharacterIdsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      projectId,
      characterId,
      chapterId,
      description,
      chapterOrder,
      eventType,
      relatedCharacterIdsJson,
      createdAt,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is TimelineEventRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.characterId == this.characterId &&
          other.chapterId == this.chapterId &&
          other.description == this.description &&
          other.chapterOrder == this.chapterOrder &&
          other.eventType == this.eventType &&
          other.relatedCharacterIdsJson == this.relatedCharacterIdsJson &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class TimelineEventsCompanion extends UpdateCompanion<TimelineEventRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> characterId;
  final Value<String> chapterId;
  final Value<String> description;
  final Value<int> chapterOrder;
  final Value<String> eventType;
  final Value<String> relatedCharacterIdsJson;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const TimelineEventsCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.characterId = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.description = const Value.absent(),
    this.chapterOrder = const Value.absent(),
    this.eventType = const Value.absent(),
    this.relatedCharacterIdsJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  TimelineEventsCompanion.insert({
    required String id,
    required String projectId,
    required String characterId,
    required String chapterId,
    required String description,
    this.chapterOrder = const Value.absent(),
    this.eventType = const Value.absent(),
    this.relatedCharacterIdsJson = const Value.absent(),
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        characterId = Value(characterId),
        chapterId = Value(chapterId),
        description = Value(description),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<TimelineEventRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? characterId,
    Expression<String>? chapterId,
    Expression<String>? description,
    Expression<int>? chapterOrder,
    Expression<String>? eventType,
    Expression<String>? relatedCharacterIdsJson,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (characterId != null) 'character_id': characterId,
      if (chapterId != null) 'chapter_id': chapterId,
      if (description != null) 'description': description,
      if (chapterOrder != null) 'chapter_order': chapterOrder,
      if (eventType != null) 'event_type': eventType,
      if (relatedCharacterIdsJson != null)
        'related_character_ids_json': relatedCharacterIdsJson,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  TimelineEventsCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? characterId,
      Value<String>? chapterId,
      Value<String>? description,
      Value<int>? chapterOrder,
      Value<String>? eventType,
      Value<String>? relatedCharacterIdsJson,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return TimelineEventsCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      characterId: characterId ?? this.characterId,
      chapterId: chapterId ?? this.chapterId,
      description: description ?? this.description,
      chapterOrder: chapterOrder ?? this.chapterOrder,
      eventType: eventType ?? this.eventType,
      relatedCharacterIdsJson:
          relatedCharacterIdsJson ?? this.relatedCharacterIdsJson,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (characterId.present) {
      map['character_id'] = Variable<String>(characterId.value);
    }
    if (chapterId.present) {
      map['chapter_id'] = Variable<String>(chapterId.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (chapterOrder.present) {
      map['chapter_order'] = Variable<int>(chapterOrder.value);
    }
    if (eventType.present) {
      map['event_type'] = Variable<String>(eventType.value);
    }
    if (relatedCharacterIdsJson.present) {
      map['related_character_ids_json'] =
          Variable<String>(relatedCharacterIdsJson.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('TimelineEventsCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('characterId: $characterId, ')
          ..write('chapterId: $chapterId, ')
          ..write('description: $description, ')
          ..write('chapterOrder: $chapterOrder, ')
          ..write('eventType: $eventType, ')
          ..write('relatedCharacterIdsJson: $relatedCharacterIdsJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SessionsTable extends Sessions
    with TableInfo<$SessionsTable, SessionRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SessionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES projects (id) ON DELETE CASCADE'));
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  static const VerificationMeta _chapterIdMeta =
      const VerificationMeta('chapterId');
  @override
  late final GeneratedColumn<String> chapterId = GeneratedColumn<String>(
      'chapter_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _agentModeMeta =
      const VerificationMeta('agentMode');
  @override
  late final GeneratedColumn<String> agentMode = GeneratedColumn<String>(
      'agent_mode', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _summaryMeta =
      const VerificationMeta('summary');
  @override
  late final GeneratedColumn<String> summary = GeneratedColumn<String>(
      'summary', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _startedAtMeta =
      const VerificationMeta('startedAt');
  @override
  late final GeneratedColumn<int> startedAt = GeneratedColumn<int>(
      'started_at', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _endedAtMeta =
      const VerificationMeta('endedAt');
  @override
  late final GeneratedColumn<int> endedAt = GeneratedColumn<int>(
      'ended_at', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        title,
        status,
        createdAt,
        updatedAt,
        schemaVersion,
        chapterId,
        agentMode,
        summary,
        startedAt,
        endedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sessions';
  @override
  VerificationContext validateIntegrity(Insertable<SessionRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    if (data.containsKey('chapter_id')) {
      context.handle(_chapterIdMeta,
          chapterId.isAcceptableOrUnknown(data['chapter_id']!, _chapterIdMeta));
    }
    if (data.containsKey('agent_mode')) {
      context.handle(_agentModeMeta,
          agentMode.isAcceptableOrUnknown(data['agent_mode']!, _agentModeMeta));
    }
    if (data.containsKey('summary')) {
      context.handle(_summaryMeta,
          summary.isAcceptableOrUnknown(data['summary']!, _summaryMeta));
    }
    if (data.containsKey('started_at')) {
      context.handle(_startedAtMeta,
          startedAt.isAcceptableOrUnknown(data['started_at']!, _startedAtMeta));
    }
    if (data.containsKey('ended_at')) {
      context.handle(_endedAtMeta,
          endedAt.isAcceptableOrUnknown(data['ended_at']!, _endedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SessionRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SessionRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
      chapterId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}chapter_id']),
      agentMode: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}agent_mode']),
      summary: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}summary']),
      startedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}started_at']),
      endedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}ended_at']),
    );
  }

  @override
  $SessionsTable createAlias(String alias) {
    return $SessionsTable(attachedDatabase, alias);
  }
}

class SessionRow extends DataClass implements Insertable<SessionRow> {
  final String id;
  final String projectId;
  final String title;
  final String status;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  final String? chapterId;
  final String? agentMode;
  final String? summary;
  final int? startedAt;
  final int? endedAt;
  const SessionRow(
      {required this.id,
      required this.projectId,
      required this.title,
      required this.status,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion,
      this.chapterId,
      this.agentMode,
      this.summary,
      this.startedAt,
      this.endedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['title'] = Variable<String>(title);
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    if (!nullToAbsent || chapterId != null) {
      map['chapter_id'] = Variable<String>(chapterId);
    }
    if (!nullToAbsent || agentMode != null) {
      map['agent_mode'] = Variable<String>(agentMode);
    }
    if (!nullToAbsent || summary != null) {
      map['summary'] = Variable<String>(summary);
    }
    if (!nullToAbsent || startedAt != null) {
      map['started_at'] = Variable<int>(startedAt);
    }
    if (!nullToAbsent || endedAt != null) {
      map['ended_at'] = Variable<int>(endedAt);
    }
    return map;
  }

  SessionsCompanion toCompanion(bool nullToAbsent) {
    return SessionsCompanion(
      id: Value(id),
      projectId: Value(projectId),
      title: Value(title),
      status: Value(status),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
      chapterId: chapterId == null && nullToAbsent
          ? const Value.absent()
          : Value(chapterId),
      agentMode: agentMode == null && nullToAbsent
          ? const Value.absent()
          : Value(agentMode),
      summary: summary == null && nullToAbsent
          ? const Value.absent()
          : Value(summary),
      startedAt: startedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(startedAt),
      endedAt: endedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(endedAt),
    );
  }

  factory SessionRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SessionRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      title: serializer.fromJson<String>(json['title']),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
      chapterId: serializer.fromJson<String?>(json['chapterId']),
      agentMode: serializer.fromJson<String?>(json['agentMode']),
      summary: serializer.fromJson<String?>(json['summary']),
      startedAt: serializer.fromJson<int?>(json['startedAt']),
      endedAt: serializer.fromJson<int?>(json['endedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'title': serializer.toJson<String>(title),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
      'chapterId': serializer.toJson<String?>(chapterId),
      'agentMode': serializer.toJson<String?>(agentMode),
      'summary': serializer.toJson<String?>(summary),
      'startedAt': serializer.toJson<int?>(startedAt),
      'endedAt': serializer.toJson<int?>(endedAt),
    };
  }

  SessionRow copyWith(
          {String? id,
          String? projectId,
          String? title,
          String? status,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion,
          Value<String?> chapterId = const Value.absent(),
          Value<String?> agentMode = const Value.absent(),
          Value<String?> summary = const Value.absent(),
          Value<int?> startedAt = const Value.absent(),
          Value<int?> endedAt = const Value.absent()}) =>
      SessionRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        title: title ?? this.title,
        status: status ?? this.status,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
        chapterId: chapterId.present ? chapterId.value : this.chapterId,
        agentMode: agentMode.present ? agentMode.value : this.agentMode,
        summary: summary.present ? summary.value : this.summary,
        startedAt: startedAt.present ? startedAt.value : this.startedAt,
        endedAt: endedAt.present ? endedAt.value : this.endedAt,
      );
  SessionRow copyWithCompanion(SessionsCompanion data) {
    return SessionRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      title: data.title.present ? data.title.value : this.title,
      status: data.status.present ? data.status.value : this.status,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
      chapterId: data.chapterId.present ? data.chapterId.value : this.chapterId,
      agentMode: data.agentMode.present ? data.agentMode.value : this.agentMode,
      summary: data.summary.present ? data.summary.value : this.summary,
      startedAt: data.startedAt.present ? data.startedAt.value : this.startedAt,
      endedAt: data.endedAt.present ? data.endedAt.value : this.endedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SessionRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('chapterId: $chapterId, ')
          ..write('agentMode: $agentMode, ')
          ..write('summary: $summary, ')
          ..write('startedAt: $startedAt, ')
          ..write('endedAt: $endedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      projectId,
      title,
      status,
      createdAt,
      updatedAt,
      schemaVersion,
      chapterId,
      agentMode,
      summary,
      startedAt,
      endedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SessionRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.title == this.title &&
          other.status == this.status &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion &&
          other.chapterId == this.chapterId &&
          other.agentMode == this.agentMode &&
          other.summary == this.summary &&
          other.startedAt == this.startedAt &&
          other.endedAt == this.endedAt);
}

class SessionsCompanion extends UpdateCompanion<SessionRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> title;
  final Value<String> status;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<String?> chapterId;
  final Value<String?> agentMode;
  final Value<String?> summary;
  final Value<int?> startedAt;
  final Value<int?> endedAt;
  final Value<int> rowid;
  const SessionsCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.title = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.agentMode = const Value.absent(),
    this.summary = const Value.absent(),
    this.startedAt = const Value.absent(),
    this.endedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SessionsCompanion.insert({
    required String id,
    required String projectId,
    required String title,
    required String status,
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.agentMode = const Value.absent(),
    this.summary = const Value.absent(),
    this.startedAt = const Value.absent(),
    this.endedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        title = Value(title),
        status = Value(status),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<SessionRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? title,
    Expression<String>? status,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<String>? chapterId,
    Expression<String>? agentMode,
    Expression<String>? summary,
    Expression<int>? startedAt,
    Expression<int>? endedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (title != null) 'title': title,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (chapterId != null) 'chapter_id': chapterId,
      if (agentMode != null) 'agent_mode': agentMode,
      if (summary != null) 'summary': summary,
      if (startedAt != null) 'started_at': startedAt,
      if (endedAt != null) 'ended_at': endedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SessionsCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? title,
      Value<String>? status,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<String?>? chapterId,
      Value<String?>? agentMode,
      Value<String?>? summary,
      Value<int?>? startedAt,
      Value<int?>? endedAt,
      Value<int>? rowid}) {
    return SessionsCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      title: title ?? this.title,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      chapterId: chapterId ?? this.chapterId,
      agentMode: agentMode ?? this.agentMode,
      summary: summary ?? this.summary,
      startedAt: startedAt ?? this.startedAt,
      endedAt: endedAt ?? this.endedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (chapterId.present) {
      map['chapter_id'] = Variable<String>(chapterId.value);
    }
    if (agentMode.present) {
      map['agent_mode'] = Variable<String>(agentMode.value);
    }
    if (summary.present) {
      map['summary'] = Variable<String>(summary.value);
    }
    if (startedAt.present) {
      map['started_at'] = Variable<int>(startedAt.value);
    }
    if (endedAt.present) {
      map['ended_at'] = Variable<int>(endedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SessionsCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('chapterId: $chapterId, ')
          ..write('agentMode: $agentMode, ')
          ..write('summary: $summary, ')
          ..write('startedAt: $startedAt, ')
          ..write('endedAt: $endedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SnapshotsTable extends Snapshots
    with TableInfo<$SnapshotsTable, SnapshotRow> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SnapshotsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _projectIdMeta =
      const VerificationMeta('projectId');
  @override
  late final GeneratedColumn<String> projectId = GeneratedColumn<String>(
      'project_id', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'REFERENCES projects (id) ON DELETE CASCADE'));
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _typeMeta = const VerificationMeta('type');
  @override
  late final GeneratedColumn<String> type = GeneratedColumn<String>(
      'type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _contentHashMeta =
      const VerificationMeta('contentHash');
  @override
  late final GeneratedColumn<String> contentHash = GeneratedColumn<String>(
      'content_hash', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _contentSnapshotMeta =
      const VerificationMeta('contentSnapshot');
  @override
  late final GeneratedColumn<String> contentSnapshot = GeneratedColumn<String>(
      'content_snapshot', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<int> createdAt = GeneratedColumn<int>(
      'created_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<int> updatedAt = GeneratedColumn<int>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _schemaVersionMeta =
      const VerificationMeta('schemaVersion');
  @override
  late final GeneratedColumn<int> schemaVersion = GeneratedColumn<int>(
      'schema_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  static const VerificationMeta _chapterIdMeta =
      const VerificationMeta('chapterId');
  @override
  late final GeneratedColumn<String> chapterId = GeneratedColumn<String>(
      'chapter_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        projectId,
        name,
        type,
        contentHash,
        contentSnapshot,
        createdAt,
        updatedAt,
        schemaVersion,
        chapterId,
        description
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'snapshots';
  @override
  VerificationContext validateIntegrity(Insertable<SnapshotRow> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('project_id')) {
      context.handle(_projectIdMeta,
          projectId.isAcceptableOrUnknown(data['project_id']!, _projectIdMeta));
    } else if (isInserting) {
      context.missing(_projectIdMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('type')) {
      context.handle(
          _typeMeta, type.isAcceptableOrUnknown(data['type']!, _typeMeta));
    } else if (isInserting) {
      context.missing(_typeMeta);
    }
    if (data.containsKey('content_hash')) {
      context.handle(
          _contentHashMeta,
          contentHash.isAcceptableOrUnknown(
              data['content_hash']!, _contentHashMeta));
    } else if (isInserting) {
      context.missing(_contentHashMeta);
    }
    if (data.containsKey('content_snapshot')) {
      context.handle(
          _contentSnapshotMeta,
          contentSnapshot.isAcceptableOrUnknown(
              data['content_snapshot']!, _contentSnapshotMeta));
    } else if (isInserting) {
      context.missing(_contentSnapshotMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('schema_version')) {
      context.handle(
          _schemaVersionMeta,
          schemaVersion.isAcceptableOrUnknown(
              data['schema_version']!, _schemaVersionMeta));
    }
    if (data.containsKey('chapter_id')) {
      context.handle(_chapterIdMeta,
          chapterId.isAcceptableOrUnknown(data['chapter_id']!, _chapterIdMeta));
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SnapshotRow map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SnapshotRow(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      type: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}type'])!,
      contentHash: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}content_hash'])!,
      contentSnapshot: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}content_snapshot'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
      chapterId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}chapter_id']),
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description']),
    );
  }

  @override
  $SnapshotsTable createAlias(String alias) {
    return $SnapshotsTable(attachedDatabase, alias);
  }
}

class SnapshotRow extends DataClass implements Insertable<SnapshotRow> {
  final String id;
  final String projectId;
  final String name;
  final String type;
  final String contentHash;
  final String contentSnapshot;
  final int createdAt;
  final int updatedAt;
  final int schemaVersion;
  final String? chapterId;
  final String? description;
  const SnapshotRow(
      {required this.id,
      required this.projectId,
      required this.name,
      required this.type,
      required this.contentHash,
      required this.contentSnapshot,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion,
      this.chapterId,
      this.description});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['name'] = Variable<String>(name);
    map['type'] = Variable<String>(type);
    map['content_hash'] = Variable<String>(contentHash);
    map['content_snapshot'] = Variable<String>(contentSnapshot);
    map['created_at'] = Variable<int>(createdAt);
    map['updated_at'] = Variable<int>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    if (!nullToAbsent || chapterId != null) {
      map['chapter_id'] = Variable<String>(chapterId);
    }
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    return map;
  }

  SnapshotsCompanion toCompanion(bool nullToAbsent) {
    return SnapshotsCompanion(
      id: Value(id),
      projectId: Value(projectId),
      name: Value(name),
      type: Value(type),
      contentHash: Value(contentHash),
      contentSnapshot: Value(contentSnapshot),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
      chapterId: chapterId == null && nullToAbsent
          ? const Value.absent()
          : Value(chapterId),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
    );
  }

  factory SnapshotRow.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SnapshotRow(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      name: serializer.fromJson<String>(json['name']),
      type: serializer.fromJson<String>(json['type']),
      contentHash: serializer.fromJson<String>(json['contentHash']),
      contentSnapshot: serializer.fromJson<String>(json['contentSnapshot']),
      createdAt: serializer.fromJson<int>(json['createdAt']),
      updatedAt: serializer.fromJson<int>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
      chapterId: serializer.fromJson<String?>(json['chapterId']),
      description: serializer.fromJson<String?>(json['description']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'name': serializer.toJson<String>(name),
      'type': serializer.toJson<String>(type),
      'contentHash': serializer.toJson<String>(contentHash),
      'contentSnapshot': serializer.toJson<String>(contentSnapshot),
      'createdAt': serializer.toJson<int>(createdAt),
      'updatedAt': serializer.toJson<int>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
      'chapterId': serializer.toJson<String?>(chapterId),
      'description': serializer.toJson<String?>(description),
    };
  }

  SnapshotRow copyWith(
          {String? id,
          String? projectId,
          String? name,
          String? type,
          String? contentHash,
          String? contentSnapshot,
          int? createdAt,
          int? updatedAt,
          int? schemaVersion,
          Value<String?> chapterId = const Value.absent(),
          Value<String?> description = const Value.absent()}) =>
      SnapshotRow(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        name: name ?? this.name,
        type: type ?? this.type,
        contentHash: contentHash ?? this.contentHash,
        contentSnapshot: contentSnapshot ?? this.contentSnapshot,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
        chapterId: chapterId.present ? chapterId.value : this.chapterId,
        description: description.present ? description.value : this.description,
      );
  SnapshotRow copyWithCompanion(SnapshotsCompanion data) {
    return SnapshotRow(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      name: data.name.present ? data.name.value : this.name,
      type: data.type.present ? data.type.value : this.type,
      contentHash:
          data.contentHash.present ? data.contentHash.value : this.contentHash,
      contentSnapshot: data.contentSnapshot.present
          ? data.contentSnapshot.value
          : this.contentSnapshot,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
      chapterId: data.chapterId.present ? data.chapterId.value : this.chapterId,
      description:
          data.description.present ? data.description.value : this.description,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SnapshotRow(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('name: $name, ')
          ..write('type: $type, ')
          ..write('contentHash: $contentHash, ')
          ..write('contentSnapshot: $contentSnapshot, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('chapterId: $chapterId, ')
          ..write('description: $description')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      projectId,
      name,
      type,
      contentHash,
      contentSnapshot,
      createdAt,
      updatedAt,
      schemaVersion,
      chapterId,
      description);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SnapshotRow &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.name == this.name &&
          other.type == this.type &&
          other.contentHash == this.contentHash &&
          other.contentSnapshot == this.contentSnapshot &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion &&
          other.chapterId == this.chapterId &&
          other.description == this.description);
}

class SnapshotsCompanion extends UpdateCompanion<SnapshotRow> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> name;
  final Value<String> type;
  final Value<String> contentHash;
  final Value<String> contentSnapshot;
  final Value<int> createdAt;
  final Value<int> updatedAt;
  final Value<int> schemaVersion;
  final Value<String?> chapterId;
  final Value<String?> description;
  final Value<int> rowid;
  const SnapshotsCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.name = const Value.absent(),
    this.type = const Value.absent(),
    this.contentHash = const Value.absent(),
    this.contentSnapshot = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.description = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SnapshotsCompanion.insert({
    required String id,
    required String projectId,
    required String name,
    required String type,
    required String contentHash,
    required String contentSnapshot,
    required int createdAt,
    required int updatedAt,
    this.schemaVersion = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.description = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        name = Value(name),
        type = Value(type),
        contentHash = Value(contentHash),
        contentSnapshot = Value(contentSnapshot),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<SnapshotRow> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? name,
    Expression<String>? type,
    Expression<String>? contentHash,
    Expression<String>? contentSnapshot,
    Expression<int>? createdAt,
    Expression<int>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<String>? chapterId,
    Expression<String>? description,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (name != null) 'name': name,
      if (type != null) 'type': type,
      if (contentHash != null) 'content_hash': contentHash,
      if (contentSnapshot != null) 'content_snapshot': contentSnapshot,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (chapterId != null) 'chapter_id': chapterId,
      if (description != null) 'description': description,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SnapshotsCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? name,
      Value<String>? type,
      Value<String>? contentHash,
      Value<String>? contentSnapshot,
      Value<int>? createdAt,
      Value<int>? updatedAt,
      Value<int>? schemaVersion,
      Value<String?>? chapterId,
      Value<String?>? description,
      Value<int>? rowid}) {
    return SnapshotsCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      name: name ?? this.name,
      type: type ?? this.type,
      contentHash: contentHash ?? this.contentHash,
      contentSnapshot: contentSnapshot ?? this.contentSnapshot,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      schemaVersion: schemaVersion ?? this.schemaVersion,
      chapterId: chapterId ?? this.chapterId,
      description: description ?? this.description,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (projectId.present) {
      map['project_id'] = Variable<String>(projectId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (type.present) {
      map['type'] = Variable<String>(type.value);
    }
    if (contentHash.present) {
      map['content_hash'] = Variable<String>(contentHash.value);
    }
    if (contentSnapshot.present) {
      map['content_snapshot'] = Variable<String>(contentSnapshot.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<int>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<int>(updatedAt.value);
    }
    if (schemaVersion.present) {
      map['schema_version'] = Variable<int>(schemaVersion.value);
    }
    if (chapterId.present) {
      map['chapter_id'] = Variable<String>(chapterId.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SnapshotsCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('name: $name, ')
          ..write('type: $type, ')
          ..write('contentHash: $contentHash, ')
          ..write('contentSnapshot: $contentSnapshot, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('chapterId: $chapterId, ')
          ..write('description: $description, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $ProjectsTable projects = $ProjectsTable(this);
  late final $ChaptersTable chapters = $ChaptersTable(this);
  late final $RevisionsTable revisions = $RevisionsTable(this);
  late final $CharactersTable characters = $CharactersTable(this);
  late final $SettingEntriesTable settingEntries = $SettingEntriesTable(this);
  late final $NotesTable notes = $NotesTable(this);
  late final $LlmProvidersTable llmProviders = $LlmProvidersTable(this);
  late final $LlmDefaultSettingsTableTable llmDefaultSettingsTable =
      $LlmDefaultSettingsTableTable(this);
  late final $OutlineNodesTable outlineNodes = $OutlineNodesTable(this);
  late final $AgentTasksTable agentTasks = $AgentTasksTable(this);
  late final $TimelineEventsTable timelineEvents = $TimelineEventsTable(this);
  late final $SessionsTable sessions = $SessionsTable(this);
  late final $SnapshotsTable snapshots = $SnapshotsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        projects,
        chapters,
        revisions,
        characters,
        settingEntries,
        notes,
        llmProviders,
        llmDefaultSettingsTable,
        outlineNodes,
        agentTasks,
        timelineEvents,
        sessions,
        snapshots
      ];
  @override
  StreamQueryUpdateRules get streamUpdateRules => const StreamQueryUpdateRules(
        [
          WritePropagation(
            on: TableUpdateQuery.onTableName('projects',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('chapters', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('chapters',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('revisions', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('projects',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('agent_tasks', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('projects',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('sessions', kind: UpdateKind.delete),
            ],
          ),
          WritePropagation(
            on: TableUpdateQuery.onTableName('projects',
                limitUpdateKind: UpdateKind.delete),
            result: [
              TableUpdate('snapshots', kind: UpdateKind.delete),
            ],
          ),
        ],
      );
}

typedef $$ProjectsTableCreateCompanionBuilder = ProjectsCompanion Function({
  required String id,
  required String name,
  Value<String> description,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$ProjectsTableUpdateCompanionBuilder = ProjectsCompanion Function({
  Value<String> id,
  Value<String> name,
  Value<String> description,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

final class $$ProjectsTableReferences
    extends BaseReferences<_$AppDatabase, $ProjectsTable, ProjectRow> {
  $$ProjectsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$ChaptersTable, List<ChapterRow>>
      _chaptersRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.chapters,
              aliasName:
                  $_aliasNameGenerator(db.projects.id, db.chapters.projectId));

  $$ChaptersTableProcessedTableManager get chaptersRefs {
    final manager = $$ChaptersTableTableManager($_db, $_db.chapters)
        .filter((f) => f.projectId.id($_item.id));

    final cache = $_typedResult.readTableOrNull(_chaptersRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$AgentTasksTable, List<AgentTaskRow>>
      _agentTasksRefsTable(_$AppDatabase db) => MultiTypedResultKey.fromTable(
          db.agentTasks,
          aliasName:
              $_aliasNameGenerator(db.projects.id, db.agentTasks.projectId));

  $$AgentTasksTableProcessedTableManager get agentTasksRefs {
    final manager = $$AgentTasksTableTableManager($_db, $_db.agentTasks)
        .filter((f) => f.projectId.id($_item.id));

    final cache = $_typedResult.readTableOrNull(_agentTasksRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$SessionsTable, List<SessionRow>>
      _sessionsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.sessions,
              aliasName:
                  $_aliasNameGenerator(db.projects.id, db.sessions.projectId));

  $$SessionsTableProcessedTableManager get sessionsRefs {
    final manager = $$SessionsTableTableManager($_db, $_db.sessions)
        .filter((f) => f.projectId.id($_item.id));

    final cache = $_typedResult.readTableOrNull(_sessionsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$SnapshotsTable, List<SnapshotRow>>
      _snapshotsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.snapshots,
              aliasName:
                  $_aliasNameGenerator(db.projects.id, db.snapshots.projectId));

  $$SnapshotsTableProcessedTableManager get snapshotsRefs {
    final manager = $$SnapshotsTableTableManager($_db, $_db.snapshots)
        .filter((f) => f.projectId.id($_item.id));

    final cache = $_typedResult.readTableOrNull(_snapshotsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$ProjectsTableFilterComposer
    extends Composer<_$AppDatabase, $ProjectsTable> {
  $$ProjectsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));

  Expression<bool> chaptersRefs(
      Expression<bool> Function($$ChaptersTableFilterComposer f) f) {
    final $$ChaptersTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.chapters,
        getReferencedColumn: (t) => t.projectId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ChaptersTableFilterComposer(
              $db: $db,
              $table: $db.chapters,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> agentTasksRefs(
      Expression<bool> Function($$AgentTasksTableFilterComposer f) f) {
    final $$AgentTasksTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.agentTasks,
        getReferencedColumn: (t) => t.projectId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$AgentTasksTableFilterComposer(
              $db: $db,
              $table: $db.agentTasks,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> sessionsRefs(
      Expression<bool> Function($$SessionsTableFilterComposer f) f) {
    final $$SessionsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sessions,
        getReferencedColumn: (t) => t.projectId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SessionsTableFilterComposer(
              $db: $db,
              $table: $db.sessions,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> snapshotsRefs(
      Expression<bool> Function($$SnapshotsTableFilterComposer f) f) {
    final $$SnapshotsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.snapshots,
        getReferencedColumn: (t) => t.projectId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SnapshotsTableFilterComposer(
              $db: $db,
              $table: $db.snapshots,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$ProjectsTableOrderingComposer
    extends Composer<_$AppDatabase, $ProjectsTable> {
  $$ProjectsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$ProjectsTableAnnotationComposer
    extends Composer<_$AppDatabase, $ProjectsTable> {
  $$ProjectsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);

  Expression<T> chaptersRefs<T extends Object>(
      Expression<T> Function($$ChaptersTableAnnotationComposer a) f) {
    final $$ChaptersTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.chapters,
        getReferencedColumn: (t) => t.projectId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ChaptersTableAnnotationComposer(
              $db: $db,
              $table: $db.chapters,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> agentTasksRefs<T extends Object>(
      Expression<T> Function($$AgentTasksTableAnnotationComposer a) f) {
    final $$AgentTasksTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.agentTasks,
        getReferencedColumn: (t) => t.projectId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$AgentTasksTableAnnotationComposer(
              $db: $db,
              $table: $db.agentTasks,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> sessionsRefs<T extends Object>(
      Expression<T> Function($$SessionsTableAnnotationComposer a) f) {
    final $$SessionsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.sessions,
        getReferencedColumn: (t) => t.projectId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SessionsTableAnnotationComposer(
              $db: $db,
              $table: $db.sessions,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> snapshotsRefs<T extends Object>(
      Expression<T> Function($$SnapshotsTableAnnotationComposer a) f) {
    final $$SnapshotsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.snapshots,
        getReferencedColumn: (t) => t.projectId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SnapshotsTableAnnotationComposer(
              $db: $db,
              $table: $db.snapshots,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$ProjectsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ProjectsTable,
    ProjectRow,
    $$ProjectsTableFilterComposer,
    $$ProjectsTableOrderingComposer,
    $$ProjectsTableAnnotationComposer,
    $$ProjectsTableCreateCompanionBuilder,
    $$ProjectsTableUpdateCompanionBuilder,
    (ProjectRow, $$ProjectsTableReferences),
    ProjectRow,
    PrefetchHooks Function(
        {bool chaptersRefs,
        bool agentTasksRefs,
        bool sessionsRefs,
        bool snapshotsRefs})> {
  $$ProjectsTableTableManager(_$AppDatabase db, $ProjectsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ProjectsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ProjectsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ProjectsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ProjectsCompanion(
            id: id,
            name: name,
            description: description,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String name,
            Value<String> description = const Value.absent(),
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ProjectsCompanion.insert(
            id: id,
            name: name,
            description: description,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$ProjectsTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: (
              {chaptersRefs = false,
              agentTasksRefs = false,
              sessionsRefs = false,
              snapshotsRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (chaptersRefs) db.chapters,
                if (agentTasksRefs) db.agentTasks,
                if (sessionsRefs) db.sessions,
                if (snapshotsRefs) db.snapshots
              ],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (chaptersRefs)
                    await $_getPrefetchedData(
                        currentTable: table,
                        referencedTable:
                            $$ProjectsTableReferences._chaptersRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$ProjectsTableReferences(db, table, p0)
                                .chaptersRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.projectId == item.id),
                        typedResults: items),
                  if (agentTasksRefs)
                    await $_getPrefetchedData(
                        currentTable: table,
                        referencedTable:
                            $$ProjectsTableReferences._agentTasksRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$ProjectsTableReferences(db, table, p0)
                                .agentTasksRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.projectId == item.id),
                        typedResults: items),
                  if (sessionsRefs)
                    await $_getPrefetchedData(
                        currentTable: table,
                        referencedTable:
                            $$ProjectsTableReferences._sessionsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$ProjectsTableReferences(db, table, p0)
                                .sessionsRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.projectId == item.id),
                        typedResults: items),
                  if (snapshotsRefs)
                    await $_getPrefetchedData(
                        currentTable: table,
                        referencedTable:
                            $$ProjectsTableReferences._snapshotsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$ProjectsTableReferences(db, table, p0)
                                .snapshotsRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.projectId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$ProjectsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $ProjectsTable,
    ProjectRow,
    $$ProjectsTableFilterComposer,
    $$ProjectsTableOrderingComposer,
    $$ProjectsTableAnnotationComposer,
    $$ProjectsTableCreateCompanionBuilder,
    $$ProjectsTableUpdateCompanionBuilder,
    (ProjectRow, $$ProjectsTableReferences),
    ProjectRow,
    PrefetchHooks Function(
        {bool chaptersRefs,
        bool agentTasksRefs,
        bool sessionsRefs,
        bool snapshotsRefs})>;
typedef $$ChaptersTableCreateCompanionBuilder = ChaptersCompanion Function({
  required String id,
  required String projectId,
  required String title,
  Value<String> markdownContent,
  Value<String> plainTextCache,
  Value<int> wordCount,
  required String status,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$ChaptersTableUpdateCompanionBuilder = ChaptersCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> title,
  Value<String> markdownContent,
  Value<String> plainTextCache,
  Value<int> wordCount,
  Value<String> status,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

final class $$ChaptersTableReferences
    extends BaseReferences<_$AppDatabase, $ChaptersTable, ChapterRow> {
  $$ChaptersTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $ProjectsTable _projectIdTable(_$AppDatabase db) => db.projects
      .createAlias($_aliasNameGenerator(db.chapters.projectId, db.projects.id));

  $$ProjectsTableProcessedTableManager get projectId {
    final manager = $$ProjectsTableTableManager($_db, $_db.projects)
        .filter((f) => f.id($_item.projectId));
    final item = $_typedResult.readTableOrNull(_projectIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static MultiTypedResultKey<$RevisionsTable, List<RevisionRow>>
      _revisionsRefsTable(_$AppDatabase db) =>
          MultiTypedResultKey.fromTable(db.revisions,
              aliasName:
                  $_aliasNameGenerator(db.chapters.id, db.revisions.chapterId));

  $$RevisionsTableProcessedTableManager get revisionsRefs {
    final manager = $$RevisionsTableTableManager($_db, $_db.revisions)
        .filter((f) => f.chapterId.id($_item.id));

    final cache = $_typedResult.readTableOrNull(_revisionsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$ChaptersTableFilterComposer
    extends Composer<_$AppDatabase, $ChaptersTable> {
  $$ChaptersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get markdownContent => $composableBuilder(
      column: $table.markdownContent,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get plainTextCache => $composableBuilder(
      column: $table.plainTextCache,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get wordCount => $composableBuilder(
      column: $table.wordCount, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));

  $$ProjectsTableFilterComposer get projectId {
    final $$ProjectsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableFilterComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<bool> revisionsRefs(
      Expression<bool> Function($$RevisionsTableFilterComposer f) f) {
    final $$RevisionsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.revisions,
        getReferencedColumn: (t) => t.chapterId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$RevisionsTableFilterComposer(
              $db: $db,
              $table: $db.revisions,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$ChaptersTableOrderingComposer
    extends Composer<_$AppDatabase, $ChaptersTable> {
  $$ChaptersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get markdownContent => $composableBuilder(
      column: $table.markdownContent,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get plainTextCache => $composableBuilder(
      column: $table.plainTextCache,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get wordCount => $composableBuilder(
      column: $table.wordCount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));

  $$ProjectsTableOrderingComposer get projectId {
    final $$ProjectsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableOrderingComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$ChaptersTableAnnotationComposer
    extends Composer<_$AppDatabase, $ChaptersTable> {
  $$ChaptersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get markdownContent => $composableBuilder(
      column: $table.markdownContent, builder: (column) => column);

  GeneratedColumn<String> get plainTextCache => $composableBuilder(
      column: $table.plainTextCache, builder: (column) => column);

  GeneratedColumn<int> get wordCount =>
      $composableBuilder(column: $table.wordCount, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);

  $$ProjectsTableAnnotationComposer get projectId {
    final $$ProjectsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableAnnotationComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<T> revisionsRefs<T extends Object>(
      Expression<T> Function($$RevisionsTableAnnotationComposer a) f) {
    final $$RevisionsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.revisions,
        getReferencedColumn: (t) => t.chapterId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$RevisionsTableAnnotationComposer(
              $db: $db,
              $table: $db.revisions,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$ChaptersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ChaptersTable,
    ChapterRow,
    $$ChaptersTableFilterComposer,
    $$ChaptersTableOrderingComposer,
    $$ChaptersTableAnnotationComposer,
    $$ChaptersTableCreateCompanionBuilder,
    $$ChaptersTableUpdateCompanionBuilder,
    (ChapterRow, $$ChaptersTableReferences),
    ChapterRow,
    PrefetchHooks Function({bool projectId, bool revisionsRefs})> {
  $$ChaptersTableTableManager(_$AppDatabase db, $ChaptersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ChaptersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ChaptersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ChaptersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> markdownContent = const Value.absent(),
            Value<String> plainTextCache = const Value.absent(),
            Value<int> wordCount = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ChaptersCompanion(
            id: id,
            projectId: projectId,
            title: title,
            markdownContent: markdownContent,
            plainTextCache: plainTextCache,
            wordCount: wordCount,
            status: status,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String title,
            Value<String> markdownContent = const Value.absent(),
            Value<String> plainTextCache = const Value.absent(),
            Value<int> wordCount = const Value.absent(),
            required String status,
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ChaptersCompanion.insert(
            id: id,
            projectId: projectId,
            title: title,
            markdownContent: markdownContent,
            plainTextCache: plainTextCache,
            wordCount: wordCount,
            status: status,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$ChaptersTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: ({projectId = false, revisionsRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (revisionsRefs) db.revisions],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (projectId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.projectId,
                    referencedTable:
                        $$ChaptersTableReferences._projectIdTable(db),
                    referencedColumn:
                        $$ChaptersTableReferences._projectIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [
                  if (revisionsRefs)
                    await $_getPrefetchedData(
                        currentTable: table,
                        referencedTable:
                            $$ChaptersTableReferences._revisionsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$ChaptersTableReferences(db, table, p0)
                                .revisionsRefs,
                        referencedItemsForCurrentItem:
                            (item, referencedItems) => referencedItems
                                .where((e) => e.chapterId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$ChaptersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $ChaptersTable,
    ChapterRow,
    $$ChaptersTableFilterComposer,
    $$ChaptersTableOrderingComposer,
    $$ChaptersTableAnnotationComposer,
    $$ChaptersTableCreateCompanionBuilder,
    $$ChaptersTableUpdateCompanionBuilder,
    (ChapterRow, $$ChaptersTableReferences),
    ChapterRow,
    PrefetchHooks Function({bool projectId, bool revisionsRefs})>;
typedef $$RevisionsTableCreateCompanionBuilder = RevisionsCompanion Function({
  required String id,
  required String projectId,
  required String chapterId,
  required String patchJson,
  required String status,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$RevisionsTableUpdateCompanionBuilder = RevisionsCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> chapterId,
  Value<String> patchJson,
  Value<String> status,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

final class $$RevisionsTableReferences
    extends BaseReferences<_$AppDatabase, $RevisionsTable, RevisionRow> {
  $$RevisionsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $ChaptersTable _chapterIdTable(_$AppDatabase db) =>
      db.chapters.createAlias(
          $_aliasNameGenerator(db.revisions.chapterId, db.chapters.id));

  $$ChaptersTableProcessedTableManager get chapterId {
    final manager = $$ChaptersTableTableManager($_db, $_db.chapters)
        .filter((f) => f.id($_item.chapterId));
    final item = $_typedResult.readTableOrNull(_chapterIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$RevisionsTableFilterComposer
    extends Composer<_$AppDatabase, $RevisionsTable> {
  $$RevisionsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get patchJson => $composableBuilder(
      column: $table.patchJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));

  $$ChaptersTableFilterComposer get chapterId {
    final $$ChaptersTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.chapterId,
        referencedTable: $db.chapters,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ChaptersTableFilterComposer(
              $db: $db,
              $table: $db.chapters,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$RevisionsTableOrderingComposer
    extends Composer<_$AppDatabase, $RevisionsTable> {
  $$RevisionsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get patchJson => $composableBuilder(
      column: $table.patchJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));

  $$ChaptersTableOrderingComposer get chapterId {
    final $$ChaptersTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.chapterId,
        referencedTable: $db.chapters,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ChaptersTableOrderingComposer(
              $db: $db,
              $table: $db.chapters,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$RevisionsTableAnnotationComposer
    extends Composer<_$AppDatabase, $RevisionsTable> {
  $$RevisionsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get projectId =>
      $composableBuilder(column: $table.projectId, builder: (column) => column);

  GeneratedColumn<String> get patchJson =>
      $composableBuilder(column: $table.patchJson, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);

  $$ChaptersTableAnnotationComposer get chapterId {
    final $$ChaptersTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.chapterId,
        referencedTable: $db.chapters,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ChaptersTableAnnotationComposer(
              $db: $db,
              $table: $db.chapters,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$RevisionsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $RevisionsTable,
    RevisionRow,
    $$RevisionsTableFilterComposer,
    $$RevisionsTableOrderingComposer,
    $$RevisionsTableAnnotationComposer,
    $$RevisionsTableCreateCompanionBuilder,
    $$RevisionsTableUpdateCompanionBuilder,
    (RevisionRow, $$RevisionsTableReferences),
    RevisionRow,
    PrefetchHooks Function({bool chapterId})> {
  $$RevisionsTableTableManager(_$AppDatabase db, $RevisionsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$RevisionsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$RevisionsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$RevisionsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> chapterId = const Value.absent(),
            Value<String> patchJson = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              RevisionsCompanion(
            id: id,
            projectId: projectId,
            chapterId: chapterId,
            patchJson: patchJson,
            status: status,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String chapterId,
            required String patchJson,
            required String status,
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              RevisionsCompanion.insert(
            id: id,
            projectId: projectId,
            chapterId: chapterId,
            patchJson: patchJson,
            status: status,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$RevisionsTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({chapterId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (chapterId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.chapterId,
                    referencedTable:
                        $$RevisionsTableReferences._chapterIdTable(db),
                    referencedColumn:
                        $$RevisionsTableReferences._chapterIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$RevisionsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $RevisionsTable,
    RevisionRow,
    $$RevisionsTableFilterComposer,
    $$RevisionsTableOrderingComposer,
    $$RevisionsTableAnnotationComposer,
    $$RevisionsTableCreateCompanionBuilder,
    $$RevisionsTableUpdateCompanionBuilder,
    (RevisionRow, $$RevisionsTableReferences),
    RevisionRow,
    PrefetchHooks Function({bool chapterId})>;
typedef $$CharactersTableCreateCompanionBuilder = CharactersCompanion Function({
  required String id,
  required String projectId,
  required String name,
  Value<String> description,
  Value<String> role,
  Value<String> avatarUrl,
  Value<String> traitsJson,
  Value<String> background,
  Value<String> aliasesJson,
  Value<String> appearance,
  Value<String> personality,
  Value<String> goals,
  Value<String> conflicts,
  Value<String> secrets,
  Value<String> relationshipsJson,
  Value<String> consistencyFactsJson,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$CharactersTableUpdateCompanionBuilder = CharactersCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> name,
  Value<String> description,
  Value<String> role,
  Value<String> avatarUrl,
  Value<String> traitsJson,
  Value<String> background,
  Value<String> aliasesJson,
  Value<String> appearance,
  Value<String> personality,
  Value<String> goals,
  Value<String> conflicts,
  Value<String> secrets,
  Value<String> relationshipsJson,
  Value<String> consistencyFactsJson,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$CharactersTableFilterComposer
    extends Composer<_$AppDatabase, $CharactersTable> {
  $$CharactersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get role => $composableBuilder(
      column: $table.role, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get avatarUrl => $composableBuilder(
      column: $table.avatarUrl, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get traitsJson => $composableBuilder(
      column: $table.traitsJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get background => $composableBuilder(
      column: $table.background, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get aliasesJson => $composableBuilder(
      column: $table.aliasesJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get appearance => $composableBuilder(
      column: $table.appearance, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get personality => $composableBuilder(
      column: $table.personality, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get goals => $composableBuilder(
      column: $table.goals, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get conflicts => $composableBuilder(
      column: $table.conflicts, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get secrets => $composableBuilder(
      column: $table.secrets, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get relationshipsJson => $composableBuilder(
      column: $table.relationshipsJson,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get consistencyFactsJson => $composableBuilder(
      column: $table.consistencyFactsJson,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$CharactersTableOrderingComposer
    extends Composer<_$AppDatabase, $CharactersTable> {
  $$CharactersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get role => $composableBuilder(
      column: $table.role, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get avatarUrl => $composableBuilder(
      column: $table.avatarUrl, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get traitsJson => $composableBuilder(
      column: $table.traitsJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get background => $composableBuilder(
      column: $table.background, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get aliasesJson => $composableBuilder(
      column: $table.aliasesJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get appearance => $composableBuilder(
      column: $table.appearance, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get personality => $composableBuilder(
      column: $table.personality, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get goals => $composableBuilder(
      column: $table.goals, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get conflicts => $composableBuilder(
      column: $table.conflicts, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get secrets => $composableBuilder(
      column: $table.secrets, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get relationshipsJson => $composableBuilder(
      column: $table.relationshipsJson,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get consistencyFactsJson => $composableBuilder(
      column: $table.consistencyFactsJson,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$CharactersTableAnnotationComposer
    extends Composer<_$AppDatabase, $CharactersTable> {
  $$CharactersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get projectId =>
      $composableBuilder(column: $table.projectId, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  GeneratedColumn<String> get role =>
      $composableBuilder(column: $table.role, builder: (column) => column);

  GeneratedColumn<String> get avatarUrl =>
      $composableBuilder(column: $table.avatarUrl, builder: (column) => column);

  GeneratedColumn<String> get traitsJson => $composableBuilder(
      column: $table.traitsJson, builder: (column) => column);

  GeneratedColumn<String> get background => $composableBuilder(
      column: $table.background, builder: (column) => column);

  GeneratedColumn<String> get aliasesJson => $composableBuilder(
      column: $table.aliasesJson, builder: (column) => column);

  GeneratedColumn<String> get appearance => $composableBuilder(
      column: $table.appearance, builder: (column) => column);

  GeneratedColumn<String> get personality => $composableBuilder(
      column: $table.personality, builder: (column) => column);

  GeneratedColumn<String> get goals =>
      $composableBuilder(column: $table.goals, builder: (column) => column);

  GeneratedColumn<String> get conflicts =>
      $composableBuilder(column: $table.conflicts, builder: (column) => column);

  GeneratedColumn<String> get secrets =>
      $composableBuilder(column: $table.secrets, builder: (column) => column);

  GeneratedColumn<String> get relationshipsJson => $composableBuilder(
      column: $table.relationshipsJson, builder: (column) => column);

  GeneratedColumn<String> get consistencyFactsJson => $composableBuilder(
      column: $table.consistencyFactsJson, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$CharactersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $CharactersTable,
    CharacterRow,
    $$CharactersTableFilterComposer,
    $$CharactersTableOrderingComposer,
    $$CharactersTableAnnotationComposer,
    $$CharactersTableCreateCompanionBuilder,
    $$CharactersTableUpdateCompanionBuilder,
    (
      CharacterRow,
      BaseReferences<_$AppDatabase, $CharactersTable, CharacterRow>
    ),
    CharacterRow,
    PrefetchHooks Function()> {
  $$CharactersTableTableManager(_$AppDatabase db, $CharactersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CharactersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CharactersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CharactersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<String> role = const Value.absent(),
            Value<String> avatarUrl = const Value.absent(),
            Value<String> traitsJson = const Value.absent(),
            Value<String> background = const Value.absent(),
            Value<String> aliasesJson = const Value.absent(),
            Value<String> appearance = const Value.absent(),
            Value<String> personality = const Value.absent(),
            Value<String> goals = const Value.absent(),
            Value<String> conflicts = const Value.absent(),
            Value<String> secrets = const Value.absent(),
            Value<String> relationshipsJson = const Value.absent(),
            Value<String> consistencyFactsJson = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              CharactersCompanion(
            id: id,
            projectId: projectId,
            name: name,
            description: description,
            role: role,
            avatarUrl: avatarUrl,
            traitsJson: traitsJson,
            background: background,
            aliasesJson: aliasesJson,
            appearance: appearance,
            personality: personality,
            goals: goals,
            conflicts: conflicts,
            secrets: secrets,
            relationshipsJson: relationshipsJson,
            consistencyFactsJson: consistencyFactsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String name,
            Value<String> description = const Value.absent(),
            Value<String> role = const Value.absent(),
            Value<String> avatarUrl = const Value.absent(),
            Value<String> traitsJson = const Value.absent(),
            Value<String> background = const Value.absent(),
            Value<String> aliasesJson = const Value.absent(),
            Value<String> appearance = const Value.absent(),
            Value<String> personality = const Value.absent(),
            Value<String> goals = const Value.absent(),
            Value<String> conflicts = const Value.absent(),
            Value<String> secrets = const Value.absent(),
            Value<String> relationshipsJson = const Value.absent(),
            Value<String> consistencyFactsJson = const Value.absent(),
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              CharactersCompanion.insert(
            id: id,
            projectId: projectId,
            name: name,
            description: description,
            role: role,
            avatarUrl: avatarUrl,
            traitsJson: traitsJson,
            background: background,
            aliasesJson: aliasesJson,
            appearance: appearance,
            personality: personality,
            goals: goals,
            conflicts: conflicts,
            secrets: secrets,
            relationshipsJson: relationshipsJson,
            consistencyFactsJson: consistencyFactsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$CharactersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $CharactersTable,
    CharacterRow,
    $$CharactersTableFilterComposer,
    $$CharactersTableOrderingComposer,
    $$CharactersTableAnnotationComposer,
    $$CharactersTableCreateCompanionBuilder,
    $$CharactersTableUpdateCompanionBuilder,
    (
      CharacterRow,
      BaseReferences<_$AppDatabase, $CharactersTable, CharacterRow>
    ),
    CharacterRow,
    PrefetchHooks Function()>;
typedef $$SettingEntriesTableCreateCompanionBuilder = SettingEntriesCompanion
    Function({
  required String id,
  required String projectId,
  required String title,
  required String content,
  Value<String> category,
  Value<String> tagsJson,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$SettingEntriesTableUpdateCompanionBuilder = SettingEntriesCompanion
    Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> title,
  Value<String> content,
  Value<String> category,
  Value<String> tagsJson,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$SettingEntriesTableFilterComposer
    extends Composer<_$AppDatabase, $SettingEntriesTable> {
  $$SettingEntriesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get content => $composableBuilder(
      column: $table.content, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get category => $composableBuilder(
      column: $table.category, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tagsJson => $composableBuilder(
      column: $table.tagsJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$SettingEntriesTableOrderingComposer
    extends Composer<_$AppDatabase, $SettingEntriesTable> {
  $$SettingEntriesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get content => $composableBuilder(
      column: $table.content, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get category => $composableBuilder(
      column: $table.category, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tagsJson => $composableBuilder(
      column: $table.tagsJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$SettingEntriesTableAnnotationComposer
    extends Composer<_$AppDatabase, $SettingEntriesTable> {
  $$SettingEntriesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get projectId =>
      $composableBuilder(column: $table.projectId, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get content =>
      $composableBuilder(column: $table.content, builder: (column) => column);

  GeneratedColumn<String> get category =>
      $composableBuilder(column: $table.category, builder: (column) => column);

  GeneratedColumn<String> get tagsJson =>
      $composableBuilder(column: $table.tagsJson, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$SettingEntriesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SettingEntriesTable,
    SettingEntryRow,
    $$SettingEntriesTableFilterComposer,
    $$SettingEntriesTableOrderingComposer,
    $$SettingEntriesTableAnnotationComposer,
    $$SettingEntriesTableCreateCompanionBuilder,
    $$SettingEntriesTableUpdateCompanionBuilder,
    (
      SettingEntryRow,
      BaseReferences<_$AppDatabase, $SettingEntriesTable, SettingEntryRow>
    ),
    SettingEntryRow,
    PrefetchHooks Function()> {
  $$SettingEntriesTableTableManager(
      _$AppDatabase db, $SettingEntriesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SettingEntriesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SettingEntriesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SettingEntriesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> content = const Value.absent(),
            Value<String> category = const Value.absent(),
            Value<String> tagsJson = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SettingEntriesCompanion(
            id: id,
            projectId: projectId,
            title: title,
            content: content,
            category: category,
            tagsJson: tagsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String title,
            required String content,
            Value<String> category = const Value.absent(),
            Value<String> tagsJson = const Value.absent(),
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SettingEntriesCompanion.insert(
            id: id,
            projectId: projectId,
            title: title,
            content: content,
            category: category,
            tagsJson: tagsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SettingEntriesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SettingEntriesTable,
    SettingEntryRow,
    $$SettingEntriesTableFilterComposer,
    $$SettingEntriesTableOrderingComposer,
    $$SettingEntriesTableAnnotationComposer,
    $$SettingEntriesTableCreateCompanionBuilder,
    $$SettingEntriesTableUpdateCompanionBuilder,
    (
      SettingEntryRow,
      BaseReferences<_$AppDatabase, $SettingEntriesTable, SettingEntryRow>
    ),
    SettingEntryRow,
    PrefetchHooks Function()>;
typedef $$NotesTableCreateCompanionBuilder = NotesCompanion Function({
  required String id,
  required String projectId,
  required String title,
  required String content,
  Value<String> category,
  Value<String> tagsJson,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$NotesTableUpdateCompanionBuilder = NotesCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> title,
  Value<String> content,
  Value<String> category,
  Value<String> tagsJson,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$NotesTableFilterComposer extends Composer<_$AppDatabase, $NotesTable> {
  $$NotesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get content => $composableBuilder(
      column: $table.content, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get category => $composableBuilder(
      column: $table.category, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tagsJson => $composableBuilder(
      column: $table.tagsJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$NotesTableOrderingComposer
    extends Composer<_$AppDatabase, $NotesTable> {
  $$NotesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get content => $composableBuilder(
      column: $table.content, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get category => $composableBuilder(
      column: $table.category, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tagsJson => $composableBuilder(
      column: $table.tagsJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$NotesTableAnnotationComposer
    extends Composer<_$AppDatabase, $NotesTable> {
  $$NotesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get projectId =>
      $composableBuilder(column: $table.projectId, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get content =>
      $composableBuilder(column: $table.content, builder: (column) => column);

  GeneratedColumn<String> get category =>
      $composableBuilder(column: $table.category, builder: (column) => column);

  GeneratedColumn<String> get tagsJson =>
      $composableBuilder(column: $table.tagsJson, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$NotesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $NotesTable,
    NoteRow,
    $$NotesTableFilterComposer,
    $$NotesTableOrderingComposer,
    $$NotesTableAnnotationComposer,
    $$NotesTableCreateCompanionBuilder,
    $$NotesTableUpdateCompanionBuilder,
    (NoteRow, BaseReferences<_$AppDatabase, $NotesTable, NoteRow>),
    NoteRow,
    PrefetchHooks Function()> {
  $$NotesTableTableManager(_$AppDatabase db, $NotesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$NotesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$NotesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$NotesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> content = const Value.absent(),
            Value<String> category = const Value.absent(),
            Value<String> tagsJson = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              NotesCompanion(
            id: id,
            projectId: projectId,
            title: title,
            content: content,
            category: category,
            tagsJson: tagsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String title,
            required String content,
            Value<String> category = const Value.absent(),
            Value<String> tagsJson = const Value.absent(),
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              NotesCompanion.insert(
            id: id,
            projectId: projectId,
            title: title,
            content: content,
            category: category,
            tagsJson: tagsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$NotesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $NotesTable,
    NoteRow,
    $$NotesTableFilterComposer,
    $$NotesTableOrderingComposer,
    $$NotesTableAnnotationComposer,
    $$NotesTableCreateCompanionBuilder,
    $$NotesTableUpdateCompanionBuilder,
    (NoteRow, BaseReferences<_$AppDatabase, $NotesTable, NoteRow>),
    NoteRow,
    PrefetchHooks Function()>;
typedef $$LlmProvidersTableCreateCompanionBuilder = LlmProvidersCompanion
    Function({
  required String id,
  required String projectId,
  required String name,
  required String baseUrl,
  required String secretKeyRef,
  Value<String> cachedModelsJson,
  Value<String?> selectedModelId,
  required String status,
  Value<double> temperature,
  Value<double> topP,
  Value<bool> streamingEnabled,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$LlmProvidersTableUpdateCompanionBuilder = LlmProvidersCompanion
    Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> name,
  Value<String> baseUrl,
  Value<String> secretKeyRef,
  Value<String> cachedModelsJson,
  Value<String?> selectedModelId,
  Value<String> status,
  Value<double> temperature,
  Value<double> topP,
  Value<bool> streamingEnabled,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$LlmProvidersTableFilterComposer
    extends Composer<_$AppDatabase, $LlmProvidersTable> {
  $$LlmProvidersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get baseUrl => $composableBuilder(
      column: $table.baseUrl, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get secretKeyRef => $composableBuilder(
      column: $table.secretKeyRef, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get cachedModelsJson => $composableBuilder(
      column: $table.cachedModelsJson,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get selectedModelId => $composableBuilder(
      column: $table.selectedModelId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get temperature => $composableBuilder(
      column: $table.temperature, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get topP => $composableBuilder(
      column: $table.topP, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get streamingEnabled => $composableBuilder(
      column: $table.streamingEnabled,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$LlmProvidersTableOrderingComposer
    extends Composer<_$AppDatabase, $LlmProvidersTable> {
  $$LlmProvidersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get baseUrl => $composableBuilder(
      column: $table.baseUrl, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get secretKeyRef => $composableBuilder(
      column: $table.secretKeyRef,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get cachedModelsJson => $composableBuilder(
      column: $table.cachedModelsJson,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get selectedModelId => $composableBuilder(
      column: $table.selectedModelId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get temperature => $composableBuilder(
      column: $table.temperature, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get topP => $composableBuilder(
      column: $table.topP, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get streamingEnabled => $composableBuilder(
      column: $table.streamingEnabled,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$LlmProvidersTableAnnotationComposer
    extends Composer<_$AppDatabase, $LlmProvidersTable> {
  $$LlmProvidersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get projectId =>
      $composableBuilder(column: $table.projectId, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get baseUrl =>
      $composableBuilder(column: $table.baseUrl, builder: (column) => column);

  GeneratedColumn<String> get secretKeyRef => $composableBuilder(
      column: $table.secretKeyRef, builder: (column) => column);

  GeneratedColumn<String> get cachedModelsJson => $composableBuilder(
      column: $table.cachedModelsJson, builder: (column) => column);

  GeneratedColumn<String> get selectedModelId => $composableBuilder(
      column: $table.selectedModelId, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<double> get temperature => $composableBuilder(
      column: $table.temperature, builder: (column) => column);

  GeneratedColumn<double> get topP =>
      $composableBuilder(column: $table.topP, builder: (column) => column);

  GeneratedColumn<bool> get streamingEnabled => $composableBuilder(
      column: $table.streamingEnabled, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$LlmProvidersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LlmProvidersTable,
    LlmProviderRow,
    $$LlmProvidersTableFilterComposer,
    $$LlmProvidersTableOrderingComposer,
    $$LlmProvidersTableAnnotationComposer,
    $$LlmProvidersTableCreateCompanionBuilder,
    $$LlmProvidersTableUpdateCompanionBuilder,
    (
      LlmProviderRow,
      BaseReferences<_$AppDatabase, $LlmProvidersTable, LlmProviderRow>
    ),
    LlmProviderRow,
    PrefetchHooks Function()> {
  $$LlmProvidersTableTableManager(_$AppDatabase db, $LlmProvidersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LlmProvidersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LlmProvidersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LlmProvidersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> baseUrl = const Value.absent(),
            Value<String> secretKeyRef = const Value.absent(),
            Value<String> cachedModelsJson = const Value.absent(),
            Value<String?> selectedModelId = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<double> temperature = const Value.absent(),
            Value<double> topP = const Value.absent(),
            Value<bool> streamingEnabled = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LlmProvidersCompanion(
            id: id,
            projectId: projectId,
            name: name,
            baseUrl: baseUrl,
            secretKeyRef: secretKeyRef,
            cachedModelsJson: cachedModelsJson,
            selectedModelId: selectedModelId,
            status: status,
            temperature: temperature,
            topP: topP,
            streamingEnabled: streamingEnabled,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String name,
            required String baseUrl,
            required String secretKeyRef,
            Value<String> cachedModelsJson = const Value.absent(),
            Value<String?> selectedModelId = const Value.absent(),
            required String status,
            Value<double> temperature = const Value.absent(),
            Value<double> topP = const Value.absent(),
            Value<bool> streamingEnabled = const Value.absent(),
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LlmProvidersCompanion.insert(
            id: id,
            projectId: projectId,
            name: name,
            baseUrl: baseUrl,
            secretKeyRef: secretKeyRef,
            cachedModelsJson: cachedModelsJson,
            selectedModelId: selectedModelId,
            status: status,
            temperature: temperature,
            topP: topP,
            streamingEnabled: streamingEnabled,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$LlmProvidersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $LlmProvidersTable,
    LlmProviderRow,
    $$LlmProvidersTableFilterComposer,
    $$LlmProvidersTableOrderingComposer,
    $$LlmProvidersTableAnnotationComposer,
    $$LlmProvidersTableCreateCompanionBuilder,
    $$LlmProvidersTableUpdateCompanionBuilder,
    (
      LlmProviderRow,
      BaseReferences<_$AppDatabase, $LlmProvidersTable, LlmProviderRow>
    ),
    LlmProviderRow,
    PrefetchHooks Function()>;
typedef $$LlmDefaultSettingsTableTableCreateCompanionBuilder
    = LlmDefaultSettingsTableCompanion Function({
  Value<int> id,
  Value<String?> writingProviderId,
  Value<String?> writingModelId,
  Value<String?> reasoningProviderId,
  Value<String?> reasoningModelId,
  Value<String?> embeddingProviderId,
  Value<String?> embeddingModelId,
  Value<double> defaultTemperature,
  Value<double> defaultTopP,
  Value<bool> streamingEnabled,
  required int updatedAt,
  Value<int> schemaVersion,
});
typedef $$LlmDefaultSettingsTableTableUpdateCompanionBuilder
    = LlmDefaultSettingsTableCompanion Function({
  Value<int> id,
  Value<String?> writingProviderId,
  Value<String?> writingModelId,
  Value<String?> reasoningProviderId,
  Value<String?> reasoningModelId,
  Value<String?> embeddingProviderId,
  Value<String?> embeddingModelId,
  Value<double> defaultTemperature,
  Value<double> defaultTopP,
  Value<bool> streamingEnabled,
  Value<int> updatedAt,
  Value<int> schemaVersion,
});

class $$LlmDefaultSettingsTableTableFilterComposer
    extends Composer<_$AppDatabase, $LlmDefaultSettingsTableTable> {
  $$LlmDefaultSettingsTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get writingProviderId => $composableBuilder(
      column: $table.writingProviderId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get writingModelId => $composableBuilder(
      column: $table.writingModelId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get reasoningProviderId => $composableBuilder(
      column: $table.reasoningProviderId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get reasoningModelId => $composableBuilder(
      column: $table.reasoningModelId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get embeddingProviderId => $composableBuilder(
      column: $table.embeddingProviderId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get embeddingModelId => $composableBuilder(
      column: $table.embeddingModelId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get defaultTemperature => $composableBuilder(
      column: $table.defaultTemperature,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get defaultTopP => $composableBuilder(
      column: $table.defaultTopP, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get streamingEnabled => $composableBuilder(
      column: $table.streamingEnabled,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$LlmDefaultSettingsTableTableOrderingComposer
    extends Composer<_$AppDatabase, $LlmDefaultSettingsTableTable> {
  $$LlmDefaultSettingsTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get writingProviderId => $composableBuilder(
      column: $table.writingProviderId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get writingModelId => $composableBuilder(
      column: $table.writingModelId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get reasoningProviderId => $composableBuilder(
      column: $table.reasoningProviderId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get reasoningModelId => $composableBuilder(
      column: $table.reasoningModelId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get embeddingProviderId => $composableBuilder(
      column: $table.embeddingProviderId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get embeddingModelId => $composableBuilder(
      column: $table.embeddingModelId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get defaultTemperature => $composableBuilder(
      column: $table.defaultTemperature,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get defaultTopP => $composableBuilder(
      column: $table.defaultTopP, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get streamingEnabled => $composableBuilder(
      column: $table.streamingEnabled,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$LlmDefaultSettingsTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $LlmDefaultSettingsTableTable> {
  $$LlmDefaultSettingsTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get writingProviderId => $composableBuilder(
      column: $table.writingProviderId, builder: (column) => column);

  GeneratedColumn<String> get writingModelId => $composableBuilder(
      column: $table.writingModelId, builder: (column) => column);

  GeneratedColumn<String> get reasoningProviderId => $composableBuilder(
      column: $table.reasoningProviderId, builder: (column) => column);

  GeneratedColumn<String> get reasoningModelId => $composableBuilder(
      column: $table.reasoningModelId, builder: (column) => column);

  GeneratedColumn<String> get embeddingProviderId => $composableBuilder(
      column: $table.embeddingProviderId, builder: (column) => column);

  GeneratedColumn<String> get embeddingModelId => $composableBuilder(
      column: $table.embeddingModelId, builder: (column) => column);

  GeneratedColumn<double> get defaultTemperature => $composableBuilder(
      column: $table.defaultTemperature, builder: (column) => column);

  GeneratedColumn<double> get defaultTopP => $composableBuilder(
      column: $table.defaultTopP, builder: (column) => column);

  GeneratedColumn<bool> get streamingEnabled => $composableBuilder(
      column: $table.streamingEnabled, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$LlmDefaultSettingsTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LlmDefaultSettingsTableTable,
    LlmDefaultSettingsRow,
    $$LlmDefaultSettingsTableTableFilterComposer,
    $$LlmDefaultSettingsTableTableOrderingComposer,
    $$LlmDefaultSettingsTableTableAnnotationComposer,
    $$LlmDefaultSettingsTableTableCreateCompanionBuilder,
    $$LlmDefaultSettingsTableTableUpdateCompanionBuilder,
    (
      LlmDefaultSettingsRow,
      BaseReferences<_$AppDatabase, $LlmDefaultSettingsTableTable,
          LlmDefaultSettingsRow>
    ),
    LlmDefaultSettingsRow,
    PrefetchHooks Function()> {
  $$LlmDefaultSettingsTableTableTableManager(
      _$AppDatabase db, $LlmDefaultSettingsTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LlmDefaultSettingsTableTableFilterComposer(
                  $db: db, $table: table),
          createOrderingComposer: () =>
              $$LlmDefaultSettingsTableTableOrderingComposer(
                  $db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LlmDefaultSettingsTableTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String?> writingProviderId = const Value.absent(),
            Value<String?> writingModelId = const Value.absent(),
            Value<String?> reasoningProviderId = const Value.absent(),
            Value<String?> reasoningModelId = const Value.absent(),
            Value<String?> embeddingProviderId = const Value.absent(),
            Value<String?> embeddingModelId = const Value.absent(),
            Value<double> defaultTemperature = const Value.absent(),
            Value<double> defaultTopP = const Value.absent(),
            Value<bool> streamingEnabled = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
          }) =>
              LlmDefaultSettingsTableCompanion(
            id: id,
            writingProviderId: writingProviderId,
            writingModelId: writingModelId,
            reasoningProviderId: reasoningProviderId,
            reasoningModelId: reasoningModelId,
            embeddingProviderId: embeddingProviderId,
            embeddingModelId: embeddingModelId,
            defaultTemperature: defaultTemperature,
            defaultTopP: defaultTopP,
            streamingEnabled: streamingEnabled,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String?> writingProviderId = const Value.absent(),
            Value<String?> writingModelId = const Value.absent(),
            Value<String?> reasoningProviderId = const Value.absent(),
            Value<String?> reasoningModelId = const Value.absent(),
            Value<String?> embeddingProviderId = const Value.absent(),
            Value<String?> embeddingModelId = const Value.absent(),
            Value<double> defaultTemperature = const Value.absent(),
            Value<double> defaultTopP = const Value.absent(),
            Value<bool> streamingEnabled = const Value.absent(),
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
          }) =>
              LlmDefaultSettingsTableCompanion.insert(
            id: id,
            writingProviderId: writingProviderId,
            writingModelId: writingModelId,
            reasoningProviderId: reasoningProviderId,
            reasoningModelId: reasoningModelId,
            embeddingProviderId: embeddingProviderId,
            embeddingModelId: embeddingModelId,
            defaultTemperature: defaultTemperature,
            defaultTopP: defaultTopP,
            streamingEnabled: streamingEnabled,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$LlmDefaultSettingsTableTableProcessedTableManager
    = ProcessedTableManager<
        _$AppDatabase,
        $LlmDefaultSettingsTableTable,
        LlmDefaultSettingsRow,
        $$LlmDefaultSettingsTableTableFilterComposer,
        $$LlmDefaultSettingsTableTableOrderingComposer,
        $$LlmDefaultSettingsTableTableAnnotationComposer,
        $$LlmDefaultSettingsTableTableCreateCompanionBuilder,
        $$LlmDefaultSettingsTableTableUpdateCompanionBuilder,
        (
          LlmDefaultSettingsRow,
          BaseReferences<_$AppDatabase, $LlmDefaultSettingsTableTable,
              LlmDefaultSettingsRow>
        ),
        LlmDefaultSettingsRow,
        PrefetchHooks Function()>;
typedef $$OutlineNodesTableCreateCompanionBuilder = OutlineNodesCompanion
    Function({
  required String id,
  required String projectId,
  required String title,
  Value<String> summary,
  Value<String> chapterId,
  Value<String> parentId,
  Value<int> sortOrder,
  Value<String> tagsJson,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$OutlineNodesTableUpdateCompanionBuilder = OutlineNodesCompanion
    Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> title,
  Value<String> summary,
  Value<String> chapterId,
  Value<String> parentId,
  Value<int> sortOrder,
  Value<String> tagsJson,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$OutlineNodesTableFilterComposer
    extends Composer<_$AppDatabase, $OutlineNodesTable> {
  $$OutlineNodesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get summary => $composableBuilder(
      column: $table.summary, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get parentId => $composableBuilder(
      column: $table.parentId, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get sortOrder => $composableBuilder(
      column: $table.sortOrder, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tagsJson => $composableBuilder(
      column: $table.tagsJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$OutlineNodesTableOrderingComposer
    extends Composer<_$AppDatabase, $OutlineNodesTable> {
  $$OutlineNodesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get summary => $composableBuilder(
      column: $table.summary, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get parentId => $composableBuilder(
      column: $table.parentId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get sortOrder => $composableBuilder(
      column: $table.sortOrder, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tagsJson => $composableBuilder(
      column: $table.tagsJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$OutlineNodesTableAnnotationComposer
    extends Composer<_$AppDatabase, $OutlineNodesTable> {
  $$OutlineNodesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get projectId =>
      $composableBuilder(column: $table.projectId, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get summary =>
      $composableBuilder(column: $table.summary, builder: (column) => column);

  GeneratedColumn<String> get chapterId =>
      $composableBuilder(column: $table.chapterId, builder: (column) => column);

  GeneratedColumn<String> get parentId =>
      $composableBuilder(column: $table.parentId, builder: (column) => column);

  GeneratedColumn<int> get sortOrder =>
      $composableBuilder(column: $table.sortOrder, builder: (column) => column);

  GeneratedColumn<String> get tagsJson =>
      $composableBuilder(column: $table.tagsJson, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$OutlineNodesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $OutlineNodesTable,
    OutlineNodeRow,
    $$OutlineNodesTableFilterComposer,
    $$OutlineNodesTableOrderingComposer,
    $$OutlineNodesTableAnnotationComposer,
    $$OutlineNodesTableCreateCompanionBuilder,
    $$OutlineNodesTableUpdateCompanionBuilder,
    (
      OutlineNodeRow,
      BaseReferences<_$AppDatabase, $OutlineNodesTable, OutlineNodeRow>
    ),
    OutlineNodeRow,
    PrefetchHooks Function()> {
  $$OutlineNodesTableTableManager(_$AppDatabase db, $OutlineNodesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$OutlineNodesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$OutlineNodesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$OutlineNodesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> summary = const Value.absent(),
            Value<String> chapterId = const Value.absent(),
            Value<String> parentId = const Value.absent(),
            Value<int> sortOrder = const Value.absent(),
            Value<String> tagsJson = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              OutlineNodesCompanion(
            id: id,
            projectId: projectId,
            title: title,
            summary: summary,
            chapterId: chapterId,
            parentId: parentId,
            sortOrder: sortOrder,
            tagsJson: tagsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String title,
            Value<String> summary = const Value.absent(),
            Value<String> chapterId = const Value.absent(),
            Value<String> parentId = const Value.absent(),
            Value<int> sortOrder = const Value.absent(),
            Value<String> tagsJson = const Value.absent(),
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              OutlineNodesCompanion.insert(
            id: id,
            projectId: projectId,
            title: title,
            summary: summary,
            chapterId: chapterId,
            parentId: parentId,
            sortOrder: sortOrder,
            tagsJson: tagsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$OutlineNodesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $OutlineNodesTable,
    OutlineNodeRow,
    $$OutlineNodesTableFilterComposer,
    $$OutlineNodesTableOrderingComposer,
    $$OutlineNodesTableAnnotationComposer,
    $$OutlineNodesTableCreateCompanionBuilder,
    $$OutlineNodesTableUpdateCompanionBuilder,
    (
      OutlineNodeRow,
      BaseReferences<_$AppDatabase, $OutlineNodesTable, OutlineNodeRow>
    ),
    OutlineNodeRow,
    PrefetchHooks Function()>;
typedef $$AgentTasksTableCreateCompanionBuilder = AgentTasksCompanion Function({
  required String id,
  required String projectId,
  required String taskType,
  required String status,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<String?> chapterId,
  Value<String?> instruction,
  Value<String?> result,
  Value<String?> errorMessage,
  Value<int> rowid,
});
typedef $$AgentTasksTableUpdateCompanionBuilder = AgentTasksCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> taskType,
  Value<String> status,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<String?> chapterId,
  Value<String?> instruction,
  Value<String?> result,
  Value<String?> errorMessage,
  Value<int> rowid,
});

final class $$AgentTasksTableReferences
    extends BaseReferences<_$AppDatabase, $AgentTasksTable, AgentTaskRow> {
  $$AgentTasksTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $ProjectsTable _projectIdTable(_$AppDatabase db) =>
      db.projects.createAlias(
          $_aliasNameGenerator(db.agentTasks.projectId, db.projects.id));

  $$ProjectsTableProcessedTableManager get projectId {
    final manager = $$ProjectsTableTableManager($_db, $_db.projects)
        .filter((f) => f.id($_item.projectId));
    final item = $_typedResult.readTableOrNull(_projectIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$AgentTasksTableFilterComposer
    extends Composer<_$AppDatabase, $AgentTasksTable> {
  $$AgentTasksTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get taskType => $composableBuilder(
      column: $table.taskType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get instruction => $composableBuilder(
      column: $table.instruction, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get result => $composableBuilder(
      column: $table.result, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get errorMessage => $composableBuilder(
      column: $table.errorMessage, builder: (column) => ColumnFilters(column));

  $$ProjectsTableFilterComposer get projectId {
    final $$ProjectsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableFilterComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$AgentTasksTableOrderingComposer
    extends Composer<_$AppDatabase, $AgentTasksTable> {
  $$AgentTasksTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get taskType => $composableBuilder(
      column: $table.taskType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get instruction => $composableBuilder(
      column: $table.instruction, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get result => $composableBuilder(
      column: $table.result, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get errorMessage => $composableBuilder(
      column: $table.errorMessage,
      builder: (column) => ColumnOrderings(column));

  $$ProjectsTableOrderingComposer get projectId {
    final $$ProjectsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableOrderingComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$AgentTasksTableAnnotationComposer
    extends Composer<_$AppDatabase, $AgentTasksTable> {
  $$AgentTasksTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get taskType =>
      $composableBuilder(column: $table.taskType, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);

  GeneratedColumn<String> get chapterId =>
      $composableBuilder(column: $table.chapterId, builder: (column) => column);

  GeneratedColumn<String> get instruction => $composableBuilder(
      column: $table.instruction, builder: (column) => column);

  GeneratedColumn<String> get result =>
      $composableBuilder(column: $table.result, builder: (column) => column);

  GeneratedColumn<String> get errorMessage => $composableBuilder(
      column: $table.errorMessage, builder: (column) => column);

  $$ProjectsTableAnnotationComposer get projectId {
    final $$ProjectsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableAnnotationComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$AgentTasksTableTableManager extends RootTableManager<
    _$AppDatabase,
    $AgentTasksTable,
    AgentTaskRow,
    $$AgentTasksTableFilterComposer,
    $$AgentTasksTableOrderingComposer,
    $$AgentTasksTableAnnotationComposer,
    $$AgentTasksTableCreateCompanionBuilder,
    $$AgentTasksTableUpdateCompanionBuilder,
    (AgentTaskRow, $$AgentTasksTableReferences),
    AgentTaskRow,
    PrefetchHooks Function({bool projectId})> {
  $$AgentTasksTableTableManager(_$AppDatabase db, $AgentTasksTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$AgentTasksTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$AgentTasksTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$AgentTasksTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> taskType = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<String?> chapterId = const Value.absent(),
            Value<String?> instruction = const Value.absent(),
            Value<String?> result = const Value.absent(),
            Value<String?> errorMessage = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              AgentTasksCompanion(
            id: id,
            projectId: projectId,
            taskType: taskType,
            status: status,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            chapterId: chapterId,
            instruction: instruction,
            result: result,
            errorMessage: errorMessage,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String taskType,
            required String status,
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<String?> chapterId = const Value.absent(),
            Value<String?> instruction = const Value.absent(),
            Value<String?> result = const Value.absent(),
            Value<String?> errorMessage = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              AgentTasksCompanion.insert(
            id: id,
            projectId: projectId,
            taskType: taskType,
            status: status,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            chapterId: chapterId,
            instruction: instruction,
            result: result,
            errorMessage: errorMessage,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$AgentTasksTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({projectId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (projectId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.projectId,
                    referencedTable:
                        $$AgentTasksTableReferences._projectIdTable(db),
                    referencedColumn:
                        $$AgentTasksTableReferences._projectIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$AgentTasksTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $AgentTasksTable,
    AgentTaskRow,
    $$AgentTasksTableFilterComposer,
    $$AgentTasksTableOrderingComposer,
    $$AgentTasksTableAnnotationComposer,
    $$AgentTasksTableCreateCompanionBuilder,
    $$AgentTasksTableUpdateCompanionBuilder,
    (AgentTaskRow, $$AgentTasksTableReferences),
    AgentTaskRow,
    PrefetchHooks Function({bool projectId})>;
typedef $$TimelineEventsTableCreateCompanionBuilder = TimelineEventsCompanion
    Function({
  required String id,
  required String projectId,
  required String characterId,
  required String chapterId,
  required String description,
  Value<int> chapterOrder,
  Value<String> eventType,
  Value<String> relatedCharacterIdsJson,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$TimelineEventsTableUpdateCompanionBuilder = TimelineEventsCompanion
    Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> characterId,
  Value<String> chapterId,
  Value<String> description,
  Value<int> chapterOrder,
  Value<String> eventType,
  Value<String> relatedCharacterIdsJson,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$TimelineEventsTableFilterComposer
    extends Composer<_$AppDatabase, $TimelineEventsTable> {
  $$TimelineEventsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get characterId => $composableBuilder(
      column: $table.characterId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get chapterOrder => $composableBuilder(
      column: $table.chapterOrder, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get eventType => $composableBuilder(
      column: $table.eventType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get relatedCharacterIdsJson => $composableBuilder(
      column: $table.relatedCharacterIdsJson,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$TimelineEventsTableOrderingComposer
    extends Composer<_$AppDatabase, $TimelineEventsTable> {
  $$TimelineEventsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get projectId => $composableBuilder(
      column: $table.projectId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get characterId => $composableBuilder(
      column: $table.characterId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get chapterOrder => $composableBuilder(
      column: $table.chapterOrder,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get eventType => $composableBuilder(
      column: $table.eventType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get relatedCharacterIdsJson => $composableBuilder(
      column: $table.relatedCharacterIdsJson,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$TimelineEventsTableAnnotationComposer
    extends Composer<_$AppDatabase, $TimelineEventsTable> {
  $$TimelineEventsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get projectId =>
      $composableBuilder(column: $table.projectId, builder: (column) => column);

  GeneratedColumn<String> get characterId => $composableBuilder(
      column: $table.characterId, builder: (column) => column);

  GeneratedColumn<String> get chapterId =>
      $composableBuilder(column: $table.chapterId, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  GeneratedColumn<int> get chapterOrder => $composableBuilder(
      column: $table.chapterOrder, builder: (column) => column);

  GeneratedColumn<String> get eventType =>
      $composableBuilder(column: $table.eventType, builder: (column) => column);

  GeneratedColumn<String> get relatedCharacterIdsJson => $composableBuilder(
      column: $table.relatedCharacterIdsJson, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$TimelineEventsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $TimelineEventsTable,
    TimelineEventRow,
    $$TimelineEventsTableFilterComposer,
    $$TimelineEventsTableOrderingComposer,
    $$TimelineEventsTableAnnotationComposer,
    $$TimelineEventsTableCreateCompanionBuilder,
    $$TimelineEventsTableUpdateCompanionBuilder,
    (
      TimelineEventRow,
      BaseReferences<_$AppDatabase, $TimelineEventsTable, TimelineEventRow>
    ),
    TimelineEventRow,
    PrefetchHooks Function()> {
  $$TimelineEventsTableTableManager(
      _$AppDatabase db, $TimelineEventsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$TimelineEventsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$TimelineEventsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$TimelineEventsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> characterId = const Value.absent(),
            Value<String> chapterId = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<int> chapterOrder = const Value.absent(),
            Value<String> eventType = const Value.absent(),
            Value<String> relatedCharacterIdsJson = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              TimelineEventsCompanion(
            id: id,
            projectId: projectId,
            characterId: characterId,
            chapterId: chapterId,
            description: description,
            chapterOrder: chapterOrder,
            eventType: eventType,
            relatedCharacterIdsJson: relatedCharacterIdsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String characterId,
            required String chapterId,
            required String description,
            Value<int> chapterOrder = const Value.absent(),
            Value<String> eventType = const Value.absent(),
            Value<String> relatedCharacterIdsJson = const Value.absent(),
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              TimelineEventsCompanion.insert(
            id: id,
            projectId: projectId,
            characterId: characterId,
            chapterId: chapterId,
            description: description,
            chapterOrder: chapterOrder,
            eventType: eventType,
            relatedCharacterIdsJson: relatedCharacterIdsJson,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$TimelineEventsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $TimelineEventsTable,
    TimelineEventRow,
    $$TimelineEventsTableFilterComposer,
    $$TimelineEventsTableOrderingComposer,
    $$TimelineEventsTableAnnotationComposer,
    $$TimelineEventsTableCreateCompanionBuilder,
    $$TimelineEventsTableUpdateCompanionBuilder,
    (
      TimelineEventRow,
      BaseReferences<_$AppDatabase, $TimelineEventsTable, TimelineEventRow>
    ),
    TimelineEventRow,
    PrefetchHooks Function()>;
typedef $$SessionsTableCreateCompanionBuilder = SessionsCompanion Function({
  required String id,
  required String projectId,
  required String title,
  required String status,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<String?> chapterId,
  Value<String?> agentMode,
  Value<String?> summary,
  Value<int?> startedAt,
  Value<int?> endedAt,
  Value<int> rowid,
});
typedef $$SessionsTableUpdateCompanionBuilder = SessionsCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> title,
  Value<String> status,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<String?> chapterId,
  Value<String?> agentMode,
  Value<String?> summary,
  Value<int?> startedAt,
  Value<int?> endedAt,
  Value<int> rowid,
});

final class $$SessionsTableReferences
    extends BaseReferences<_$AppDatabase, $SessionsTable, SessionRow> {
  $$SessionsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $ProjectsTable _projectIdTable(_$AppDatabase db) => db.projects
      .createAlias($_aliasNameGenerator(db.sessions.projectId, db.projects.id));

  $$ProjectsTableProcessedTableManager get projectId {
    final manager = $$ProjectsTableTableManager($_db, $_db.projects)
        .filter((f) => f.id($_item.projectId));
    final item = $_typedResult.readTableOrNull(_projectIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$SessionsTableFilterComposer
    extends Composer<_$AppDatabase, $SessionsTable> {
  $$SessionsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get agentMode => $composableBuilder(
      column: $table.agentMode, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get summary => $composableBuilder(
      column: $table.summary, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get startedAt => $composableBuilder(
      column: $table.startedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get endedAt => $composableBuilder(
      column: $table.endedAt, builder: (column) => ColumnFilters(column));

  $$ProjectsTableFilterComposer get projectId {
    final $$ProjectsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableFilterComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SessionsTableOrderingComposer
    extends Composer<_$AppDatabase, $SessionsTable> {
  $$SessionsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get agentMode => $composableBuilder(
      column: $table.agentMode, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get summary => $composableBuilder(
      column: $table.summary, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get startedAt => $composableBuilder(
      column: $table.startedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get endedAt => $composableBuilder(
      column: $table.endedAt, builder: (column) => ColumnOrderings(column));

  $$ProjectsTableOrderingComposer get projectId {
    final $$ProjectsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableOrderingComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SessionsTableAnnotationComposer
    extends Composer<_$AppDatabase, $SessionsTable> {
  $$SessionsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);

  GeneratedColumn<String> get chapterId =>
      $composableBuilder(column: $table.chapterId, builder: (column) => column);

  GeneratedColumn<String> get agentMode =>
      $composableBuilder(column: $table.agentMode, builder: (column) => column);

  GeneratedColumn<String> get summary =>
      $composableBuilder(column: $table.summary, builder: (column) => column);

  GeneratedColumn<int> get startedAt =>
      $composableBuilder(column: $table.startedAt, builder: (column) => column);

  GeneratedColumn<int> get endedAt =>
      $composableBuilder(column: $table.endedAt, builder: (column) => column);

  $$ProjectsTableAnnotationComposer get projectId {
    final $$ProjectsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableAnnotationComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SessionsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SessionsTable,
    SessionRow,
    $$SessionsTableFilterComposer,
    $$SessionsTableOrderingComposer,
    $$SessionsTableAnnotationComposer,
    $$SessionsTableCreateCompanionBuilder,
    $$SessionsTableUpdateCompanionBuilder,
    (SessionRow, $$SessionsTableReferences),
    SessionRow,
    PrefetchHooks Function({bool projectId})> {
  $$SessionsTableTableManager(_$AppDatabase db, $SessionsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SessionsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SessionsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SessionsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<String?> chapterId = const Value.absent(),
            Value<String?> agentMode = const Value.absent(),
            Value<String?> summary = const Value.absent(),
            Value<int?> startedAt = const Value.absent(),
            Value<int?> endedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SessionsCompanion(
            id: id,
            projectId: projectId,
            title: title,
            status: status,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            chapterId: chapterId,
            agentMode: agentMode,
            summary: summary,
            startedAt: startedAt,
            endedAt: endedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String title,
            required String status,
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<String?> chapterId = const Value.absent(),
            Value<String?> agentMode = const Value.absent(),
            Value<String?> summary = const Value.absent(),
            Value<int?> startedAt = const Value.absent(),
            Value<int?> endedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SessionsCompanion.insert(
            id: id,
            projectId: projectId,
            title: title,
            status: status,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            chapterId: chapterId,
            agentMode: agentMode,
            summary: summary,
            startedAt: startedAt,
            endedAt: endedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$SessionsTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: ({projectId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (projectId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.projectId,
                    referencedTable:
                        $$SessionsTableReferences._projectIdTable(db),
                    referencedColumn:
                        $$SessionsTableReferences._projectIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$SessionsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SessionsTable,
    SessionRow,
    $$SessionsTableFilterComposer,
    $$SessionsTableOrderingComposer,
    $$SessionsTableAnnotationComposer,
    $$SessionsTableCreateCompanionBuilder,
    $$SessionsTableUpdateCompanionBuilder,
    (SessionRow, $$SessionsTableReferences),
    SessionRow,
    PrefetchHooks Function({bool projectId})>;
typedef $$SnapshotsTableCreateCompanionBuilder = SnapshotsCompanion Function({
  required String id,
  required String projectId,
  required String name,
  required String type,
  required String contentHash,
  required String contentSnapshot,
  required int createdAt,
  required int updatedAt,
  Value<int> schemaVersion,
  Value<String?> chapterId,
  Value<String?> description,
  Value<int> rowid,
});
typedef $$SnapshotsTableUpdateCompanionBuilder = SnapshotsCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> name,
  Value<String> type,
  Value<String> contentHash,
  Value<String> contentSnapshot,
  Value<int> createdAt,
  Value<int> updatedAt,
  Value<int> schemaVersion,
  Value<String?> chapterId,
  Value<String?> description,
  Value<int> rowid,
});

final class $$SnapshotsTableReferences
    extends BaseReferences<_$AppDatabase, $SnapshotsTable, SnapshotRow> {
  $$SnapshotsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $ProjectsTable _projectIdTable(_$AppDatabase db) =>
      db.projects.createAlias(
          $_aliasNameGenerator(db.snapshots.projectId, db.projects.id));

  $$ProjectsTableProcessedTableManager get projectId {
    final manager = $$ProjectsTableTableManager($_db, $_db.projects)
        .filter((f) => f.id($_item.projectId));
    final item = $_typedResult.readTableOrNull(_projectIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$SnapshotsTableFilterComposer
    extends Composer<_$AppDatabase, $SnapshotsTable> {
  $$SnapshotsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get type => $composableBuilder(
      column: $table.type, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get contentHash => $composableBuilder(
      column: $table.contentHash, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get contentSnapshot => $composableBuilder(
      column: $table.contentSnapshot,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  $$ProjectsTableFilterComposer get projectId {
    final $$ProjectsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableFilterComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SnapshotsTableOrderingComposer
    extends Composer<_$AppDatabase, $SnapshotsTable> {
  $$SnapshotsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get type => $composableBuilder(
      column: $table.type, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get contentHash => $composableBuilder(
      column: $table.contentHash, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get contentSnapshot => $composableBuilder(
      column: $table.contentSnapshot,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  $$ProjectsTableOrderingComposer get projectId {
    final $$ProjectsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableOrderingComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SnapshotsTableAnnotationComposer
    extends Composer<_$AppDatabase, $SnapshotsTable> {
  $$SnapshotsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get type =>
      $composableBuilder(column: $table.type, builder: (column) => column);

  GeneratedColumn<String> get contentHash => $composableBuilder(
      column: $table.contentHash, builder: (column) => column);

  GeneratedColumn<String> get contentSnapshot => $composableBuilder(
      column: $table.contentSnapshot, builder: (column) => column);

  GeneratedColumn<int> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);

  GeneratedColumn<String> get chapterId =>
      $composableBuilder(column: $table.chapterId, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  $$ProjectsTableAnnotationComposer get projectId {
    final $$ProjectsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.projectId,
        referencedTable: $db.projects,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ProjectsTableAnnotationComposer(
              $db: $db,
              $table: $db.projects,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$SnapshotsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SnapshotsTable,
    SnapshotRow,
    $$SnapshotsTableFilterComposer,
    $$SnapshotsTableOrderingComposer,
    $$SnapshotsTableAnnotationComposer,
    $$SnapshotsTableCreateCompanionBuilder,
    $$SnapshotsTableUpdateCompanionBuilder,
    (SnapshotRow, $$SnapshotsTableReferences),
    SnapshotRow,
    PrefetchHooks Function({bool projectId})> {
  $$SnapshotsTableTableManager(_$AppDatabase db, $SnapshotsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SnapshotsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SnapshotsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SnapshotsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> type = const Value.absent(),
            Value<String> contentHash = const Value.absent(),
            Value<String> contentSnapshot = const Value.absent(),
            Value<int> createdAt = const Value.absent(),
            Value<int> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<String?> chapterId = const Value.absent(),
            Value<String?> description = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SnapshotsCompanion(
            id: id,
            projectId: projectId,
            name: name,
            type: type,
            contentHash: contentHash,
            contentSnapshot: contentSnapshot,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            chapterId: chapterId,
            description: description,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String name,
            required String type,
            required String contentHash,
            required String contentSnapshot,
            required int createdAt,
            required int updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<String?> chapterId = const Value.absent(),
            Value<String?> description = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SnapshotsCompanion.insert(
            id: id,
            projectId: projectId,
            name: name,
            type: type,
            contentHash: contentHash,
            contentSnapshot: contentSnapshot,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            chapterId: chapterId,
            description: description,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$SnapshotsTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({projectId = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [],
              addJoins: <
                  T extends TableManagerState<
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic,
                      dynamic>>(state) {
                if (projectId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.projectId,
                    referencedTable:
                        $$SnapshotsTableReferences._projectIdTable(db),
                    referencedColumn:
                        $$SnapshotsTableReferences._projectIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [];
              },
            );
          },
        ));
}

typedef $$SnapshotsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SnapshotsTable,
    SnapshotRow,
    $$SnapshotsTableFilterComposer,
    $$SnapshotsTableOrderingComposer,
    $$SnapshotsTableAnnotationComposer,
    $$SnapshotsTableCreateCompanionBuilder,
    $$SnapshotsTableUpdateCompanionBuilder,
    (SnapshotRow, $$SnapshotsTableReferences),
    SnapshotRow,
    PrefetchHooks Function({bool projectId})>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$ProjectsTableTableManager get projects =>
      $$ProjectsTableTableManager(_db, _db.projects);
  $$ChaptersTableTableManager get chapters =>
      $$ChaptersTableTableManager(_db, _db.chapters);
  $$RevisionsTableTableManager get revisions =>
      $$RevisionsTableTableManager(_db, _db.revisions);
  $$CharactersTableTableManager get characters =>
      $$CharactersTableTableManager(_db, _db.characters);
  $$SettingEntriesTableTableManager get settingEntries =>
      $$SettingEntriesTableTableManager(_db, _db.settingEntries);
  $$NotesTableTableManager get notes =>
      $$NotesTableTableManager(_db, _db.notes);
  $$LlmProvidersTableTableManager get llmProviders =>
      $$LlmProvidersTableTableManager(_db, _db.llmProviders);
  $$LlmDefaultSettingsTableTableTableManager get llmDefaultSettingsTable =>
      $$LlmDefaultSettingsTableTableTableManager(
          _db, _db.llmDefaultSettingsTable);
  $$OutlineNodesTableTableManager get outlineNodes =>
      $$OutlineNodesTableTableManager(_db, _db.outlineNodes);
  $$AgentTasksTableTableManager get agentTasks =>
      $$AgentTasksTableTableManager(_db, _db.agentTasks);
  $$TimelineEventsTableTableManager get timelineEvents =>
      $$TimelineEventsTableTableManager(_db, _db.timelineEvents);
  $$SessionsTableTableManager get sessions =>
      $$SessionsTableTableManager(_db, _db.sessions);
  $$SnapshotsTableTableManager get snapshots =>
      $$SnapshotsTableTableManager(_db, _db.snapshots);
}
