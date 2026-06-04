// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $ProjectsTableTable extends ProjectsTable
    with TableInfo<$ProjectsTableTable, ProjectsTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ProjectsTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _authorMeta = const VerificationMeta('author');
  @override
  late final GeneratedColumn<String> author = GeneratedColumn<String>(
      'author', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _languageMeta =
      const VerificationMeta('language');
  @override
  late final GeneratedColumn<String> language = GeneratedColumn<String>(
      'language', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('zh'));
  static const VerificationMeta _genreMeta = const VerificationMeta('genre');
  @override
  late final GeneratedColumn<String> genre = GeneratedColumn<String>(
      'genre', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _tagsMeta = const VerificationMeta('tags');
  @override
  late final GeneratedColumn<String> tags = GeneratedColumn<String>(
      'tags', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _defaultStyleProfileIdMeta =
      const VerificationMeta('defaultStyleProfileId');
  @override
  late final GeneratedColumn<String> defaultStyleProfileId =
      GeneratedColumn<String>('default_style_profile_id', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _activeChapterIdMeta =
      const VerificationMeta('activeChapterId');
  @override
  late final GeneratedColumn<String> activeChapterId = GeneratedColumn<String>(
      'active_chapter_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _localEncryptionEnabledMeta =
      const VerificationMeta('localEncryptionEnabled');
  @override
  late final GeneratedColumn<bool> localEncryptionEnabled =
      GeneratedColumn<bool>('local_encryption_enabled', aliasedName, false,
          type: DriftSqlType.bool,
          requiredDuringInsert: false,
          defaultConstraints: GeneratedColumn.constraintIsAlways(
              'CHECK ("local_encryption_enabled" IN (0, 1))'),
          defaultValue: const Constant(false));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
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
        title,
        author,
        description,
        language,
        genre,
        tags,
        defaultStyleProfileId,
        activeChapterId,
        localEncryptionEnabled,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'projects_table';
  @override
  VerificationContext validateIntegrity(Insertable<ProjectsTableData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('author')) {
      context.handle(_authorMeta,
          author.isAcceptableOrUnknown(data['author']!, _authorMeta));
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    if (data.containsKey('language')) {
      context.handle(_languageMeta,
          language.isAcceptableOrUnknown(data['language']!, _languageMeta));
    }
    if (data.containsKey('genre')) {
      context.handle(
          _genreMeta, genre.isAcceptableOrUnknown(data['genre']!, _genreMeta));
    }
    if (data.containsKey('tags')) {
      context.handle(
          _tagsMeta, tags.isAcceptableOrUnknown(data['tags']!, _tagsMeta));
    }
    if (data.containsKey('default_style_profile_id')) {
      context.handle(
          _defaultStyleProfileIdMeta,
          defaultStyleProfileId.isAcceptableOrUnknown(
              data['default_style_profile_id']!, _defaultStyleProfileIdMeta));
    }
    if (data.containsKey('active_chapter_id')) {
      context.handle(
          _activeChapterIdMeta,
          activeChapterId.isAcceptableOrUnknown(
              data['active_chapter_id']!, _activeChapterIdMeta));
    }
    if (data.containsKey('local_encryption_enabled')) {
      context.handle(
          _localEncryptionEnabledMeta,
          localEncryptionEnabled.isAcceptableOrUnknown(
              data['local_encryption_enabled']!, _localEncryptionEnabledMeta));
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
  ProjectsTableData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ProjectsTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      author: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}author'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description'])!,
      language: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}language'])!,
      genre: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}genre'])!,
      tags: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}tags'])!,
      defaultStyleProfileId: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}default_style_profile_id']),
      activeChapterId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}active_chapter_id']),
      localEncryptionEnabled: attachedDatabase.typeMapping.read(
          DriftSqlType.bool,
          data['${effectivePrefix}local_encryption_enabled'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $ProjectsTableTable createAlias(String alias) {
    return $ProjectsTableTable(attachedDatabase, alias);
  }
}

class ProjectsTableData extends DataClass
    implements Insertable<ProjectsTableData> {
  final String id;
  final String title;
  final String author;
  final String description;
  final String language;
  final String genre;
  final String tags;
  final String? defaultStyleProfileId;
  final String? activeChapterId;
  final bool localEncryptionEnabled;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int schemaVersion;
  const ProjectsTableData(
      {required this.id,
      required this.title,
      required this.author,
      required this.description,
      required this.language,
      required this.genre,
      required this.tags,
      this.defaultStyleProfileId,
      this.activeChapterId,
      required this.localEncryptionEnabled,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['title'] = Variable<String>(title);
    map['author'] = Variable<String>(author);
    map['description'] = Variable<String>(description);
    map['language'] = Variable<String>(language);
    map['genre'] = Variable<String>(genre);
    map['tags'] = Variable<String>(tags);
    if (!nullToAbsent || defaultStyleProfileId != null) {
      map['default_style_profile_id'] = Variable<String>(defaultStyleProfileId);
    }
    if (!nullToAbsent || activeChapterId != null) {
      map['active_chapter_id'] = Variable<String>(activeChapterId);
    }
    map['local_encryption_enabled'] = Variable<bool>(localEncryptionEnabled);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  ProjectsTableCompanion toCompanion(bool nullToAbsent) {
    return ProjectsTableCompanion(
      id: Value(id),
      title: Value(title),
      author: Value(author),
      description: Value(description),
      language: Value(language),
      genre: Value(genre),
      tags: Value(tags),
      defaultStyleProfileId: defaultStyleProfileId == null && nullToAbsent
          ? const Value.absent()
          : Value(defaultStyleProfileId),
      activeChapterId: activeChapterId == null && nullToAbsent
          ? const Value.absent()
          : Value(activeChapterId),
      localEncryptionEnabled: Value(localEncryptionEnabled),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory ProjectsTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ProjectsTableData(
      id: serializer.fromJson<String>(json['id']),
      title: serializer.fromJson<String>(json['title']),
      author: serializer.fromJson<String>(json['author']),
      description: serializer.fromJson<String>(json['description']),
      language: serializer.fromJson<String>(json['language']),
      genre: serializer.fromJson<String>(json['genre']),
      tags: serializer.fromJson<String>(json['tags']),
      defaultStyleProfileId:
          serializer.fromJson<String?>(json['defaultStyleProfileId']),
      activeChapterId: serializer.fromJson<String?>(json['activeChapterId']),
      localEncryptionEnabled:
          serializer.fromJson<bool>(json['localEncryptionEnabled']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'title': serializer.toJson<String>(title),
      'author': serializer.toJson<String>(author),
      'description': serializer.toJson<String>(description),
      'language': serializer.toJson<String>(language),
      'genre': serializer.toJson<String>(genre),
      'tags': serializer.toJson<String>(tags),
      'defaultStyleProfileId':
          serializer.toJson<String?>(defaultStyleProfileId),
      'activeChapterId': serializer.toJson<String?>(activeChapterId),
      'localEncryptionEnabled': serializer.toJson<bool>(localEncryptionEnabled),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  ProjectsTableData copyWith(
          {String? id,
          String? title,
          String? author,
          String? description,
          String? language,
          String? genre,
          String? tags,
          Value<String?> defaultStyleProfileId = const Value.absent(),
          Value<String?> activeChapterId = const Value.absent(),
          bool? localEncryptionEnabled,
          DateTime? createdAt,
          DateTime? updatedAt,
          int? schemaVersion}) =>
      ProjectsTableData(
        id: id ?? this.id,
        title: title ?? this.title,
        author: author ?? this.author,
        description: description ?? this.description,
        language: language ?? this.language,
        genre: genre ?? this.genre,
        tags: tags ?? this.tags,
        defaultStyleProfileId: defaultStyleProfileId.present
            ? defaultStyleProfileId.value
            : this.defaultStyleProfileId,
        activeChapterId: activeChapterId.present
            ? activeChapterId.value
            : this.activeChapterId,
        localEncryptionEnabled:
            localEncryptionEnabled ?? this.localEncryptionEnabled,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  ProjectsTableData copyWithCompanion(ProjectsTableCompanion data) {
    return ProjectsTableData(
      id: data.id.present ? data.id.value : this.id,
      title: data.title.present ? data.title.value : this.title,
      author: data.author.present ? data.author.value : this.author,
      description:
          data.description.present ? data.description.value : this.description,
      language: data.language.present ? data.language.value : this.language,
      genre: data.genre.present ? data.genre.value : this.genre,
      tags: data.tags.present ? data.tags.value : this.tags,
      defaultStyleProfileId: data.defaultStyleProfileId.present
          ? data.defaultStyleProfileId.value
          : this.defaultStyleProfileId,
      activeChapterId: data.activeChapterId.present
          ? data.activeChapterId.value
          : this.activeChapterId,
      localEncryptionEnabled: data.localEncryptionEnabled.present
          ? data.localEncryptionEnabled.value
          : this.localEncryptionEnabled,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ProjectsTableData(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('author: $author, ')
          ..write('description: $description, ')
          ..write('language: $language, ')
          ..write('genre: $genre, ')
          ..write('tags: $tags, ')
          ..write('defaultStyleProfileId: $defaultStyleProfileId, ')
          ..write('activeChapterId: $activeChapterId, ')
          ..write('localEncryptionEnabled: $localEncryptionEnabled, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      title,
      author,
      description,
      language,
      genre,
      tags,
      defaultStyleProfileId,
      activeChapterId,
      localEncryptionEnabled,
      createdAt,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ProjectsTableData &&
          other.id == this.id &&
          other.title == this.title &&
          other.author == this.author &&
          other.description == this.description &&
          other.language == this.language &&
          other.genre == this.genre &&
          other.tags == this.tags &&
          other.defaultStyleProfileId == this.defaultStyleProfileId &&
          other.activeChapterId == this.activeChapterId &&
          other.localEncryptionEnabled == this.localEncryptionEnabled &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class ProjectsTableCompanion extends UpdateCompanion<ProjectsTableData> {
  final Value<String> id;
  final Value<String> title;
  final Value<String> author;
  final Value<String> description;
  final Value<String> language;
  final Value<String> genre;
  final Value<String> tags;
  final Value<String?> defaultStyleProfileId;
  final Value<String?> activeChapterId;
  final Value<bool> localEncryptionEnabled;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const ProjectsTableCompanion({
    this.id = const Value.absent(),
    this.title = const Value.absent(),
    this.author = const Value.absent(),
    this.description = const Value.absent(),
    this.language = const Value.absent(),
    this.genre = const Value.absent(),
    this.tags = const Value.absent(),
    this.defaultStyleProfileId = const Value.absent(),
    this.activeChapterId = const Value.absent(),
    this.localEncryptionEnabled = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ProjectsTableCompanion.insert({
    required String id,
    required String title,
    this.author = const Value.absent(),
    this.description = const Value.absent(),
    this.language = const Value.absent(),
    this.genre = const Value.absent(),
    this.tags = const Value.absent(),
    this.defaultStyleProfileId = const Value.absent(),
    this.activeChapterId = const Value.absent(),
    this.localEncryptionEnabled = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        title = Value(title),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<ProjectsTableData> custom({
    Expression<String>? id,
    Expression<String>? title,
    Expression<String>? author,
    Expression<String>? description,
    Expression<String>? language,
    Expression<String>? genre,
    Expression<String>? tags,
    Expression<String>? defaultStyleProfileId,
    Expression<String>? activeChapterId,
    Expression<bool>? localEncryptionEnabled,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (title != null) 'title': title,
      if (author != null) 'author': author,
      if (description != null) 'description': description,
      if (language != null) 'language': language,
      if (genre != null) 'genre': genre,
      if (tags != null) 'tags': tags,
      if (defaultStyleProfileId != null)
        'default_style_profile_id': defaultStyleProfileId,
      if (activeChapterId != null) 'active_chapter_id': activeChapterId,
      if (localEncryptionEnabled != null)
        'local_encryption_enabled': localEncryptionEnabled,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ProjectsTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? title,
      Value<String>? author,
      Value<String>? description,
      Value<String>? language,
      Value<String>? genre,
      Value<String>? tags,
      Value<String?>? defaultStyleProfileId,
      Value<String?>? activeChapterId,
      Value<bool>? localEncryptionEnabled,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return ProjectsTableCompanion(
      id: id ?? this.id,
      title: title ?? this.title,
      author: author ?? this.author,
      description: description ?? this.description,
      language: language ?? this.language,
      genre: genre ?? this.genre,
      tags: tags ?? this.tags,
      defaultStyleProfileId:
          defaultStyleProfileId ?? this.defaultStyleProfileId,
      activeChapterId: activeChapterId ?? this.activeChapterId,
      localEncryptionEnabled:
          localEncryptionEnabled ?? this.localEncryptionEnabled,
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
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (author.present) {
      map['author'] = Variable<String>(author.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (language.present) {
      map['language'] = Variable<String>(language.value);
    }
    if (genre.present) {
      map['genre'] = Variable<String>(genre.value);
    }
    if (tags.present) {
      map['tags'] = Variable<String>(tags.value);
    }
    if (defaultStyleProfileId.present) {
      map['default_style_profile_id'] =
          Variable<String>(defaultStyleProfileId.value);
    }
    if (activeChapterId.present) {
      map['active_chapter_id'] = Variable<String>(activeChapterId.value);
    }
    if (localEncryptionEnabled.present) {
      map['local_encryption_enabled'] =
          Variable<bool>(localEncryptionEnabled.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
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
    return (StringBuffer('ProjectsTableCompanion(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('author: $author, ')
          ..write('description: $description, ')
          ..write('language: $language, ')
          ..write('genre: $genre, ')
          ..write('tags: $tags, ')
          ..write('defaultStyleProfileId: $defaultStyleProfileId, ')
          ..write('activeChapterId: $activeChapterId, ')
          ..write('localEncryptionEnabled: $localEncryptionEnabled, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $ChaptersTableTable extends ChaptersTable
    with TableInfo<$ChaptersTableTable, ChaptersTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ChaptersTableTable(this.attachedDatabase, [this._alias]);
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
  static const VerificationMeta _outlineNodeIdMeta =
      const VerificationMeta('outlineNodeId');
  @override
  late final GeneratedColumn<String> outlineNodeId = GeneratedColumn<String>(
      'outline_node_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _orderIndexMeta =
      const VerificationMeta('orderIndex');
  @override
  late final GeneratedColumn<int> orderIndex = GeneratedColumn<int>(
      'order_index', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _contentFormatMeta =
      const VerificationMeta('contentFormat');
  @override
  late final GeneratedColumn<String> contentFormat = GeneratedColumn<String>(
      'content_format', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('markdown'));
  static const VerificationMeta _contentMeta =
      const VerificationMeta('content');
  @override
  late final GeneratedColumn<String> content = GeneratedColumn<String>(
      'content', aliasedName, false,
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
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('draft'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
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
        outlineNodeId,
        title,
        orderIndex,
        contentFormat,
        content,
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
  static const String $name = 'chapters_table';
  @override
  VerificationContext validateIntegrity(Insertable<ChaptersTableData> instance,
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
    if (data.containsKey('outline_node_id')) {
      context.handle(
          _outlineNodeIdMeta,
          outlineNodeId.isAcceptableOrUnknown(
              data['outline_node_id']!, _outlineNodeIdMeta));
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('order_index')) {
      context.handle(
          _orderIndexMeta,
          orderIndex.isAcceptableOrUnknown(
              data['order_index']!, _orderIndexMeta));
    } else if (isInserting) {
      context.missing(_orderIndexMeta);
    }
    if (data.containsKey('content_format')) {
      context.handle(
          _contentFormatMeta,
          contentFormat.isAcceptableOrUnknown(
              data['content_format']!, _contentFormatMeta));
    }
    if (data.containsKey('content')) {
      context.handle(_contentMeta,
          content.isAcceptableOrUnknown(data['content']!, _contentMeta));
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
  ChaptersTableData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ChaptersTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      outlineNodeId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}outline_node_id']),
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      orderIndex: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}order_index'])!,
      contentFormat: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}content_format'])!,
      content: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}content'])!,
      plainTextCache: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}plain_text_cache'])!,
      wordCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}word_count'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $ChaptersTableTable createAlias(String alias) {
    return $ChaptersTableTable(attachedDatabase, alias);
  }
}

class ChaptersTableData extends DataClass
    implements Insertable<ChaptersTableData> {
  final String id;
  final String projectId;
  final String? outlineNodeId;
  final String title;
  final int orderIndex;
  final String contentFormat;
  final String content;
  final String plainTextCache;
  final int wordCount;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int schemaVersion;
  const ChaptersTableData(
      {required this.id,
      required this.projectId,
      this.outlineNodeId,
      required this.title,
      required this.orderIndex,
      required this.contentFormat,
      required this.content,
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
    if (!nullToAbsent || outlineNodeId != null) {
      map['outline_node_id'] = Variable<String>(outlineNodeId);
    }
    map['title'] = Variable<String>(title);
    map['order_index'] = Variable<int>(orderIndex);
    map['content_format'] = Variable<String>(contentFormat);
    map['content'] = Variable<String>(content);
    map['plain_text_cache'] = Variable<String>(plainTextCache);
    map['word_count'] = Variable<int>(wordCount);
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  ChaptersTableCompanion toCompanion(bool nullToAbsent) {
    return ChaptersTableCompanion(
      id: Value(id),
      projectId: Value(projectId),
      outlineNodeId: outlineNodeId == null && nullToAbsent
          ? const Value.absent()
          : Value(outlineNodeId),
      title: Value(title),
      orderIndex: Value(orderIndex),
      contentFormat: Value(contentFormat),
      content: Value(content),
      plainTextCache: Value(plainTextCache),
      wordCount: Value(wordCount),
      status: Value(status),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory ChaptersTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ChaptersTableData(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      outlineNodeId: serializer.fromJson<String?>(json['outlineNodeId']),
      title: serializer.fromJson<String>(json['title']),
      orderIndex: serializer.fromJson<int>(json['orderIndex']),
      contentFormat: serializer.fromJson<String>(json['contentFormat']),
      content: serializer.fromJson<String>(json['content']),
      plainTextCache: serializer.fromJson<String>(json['plainTextCache']),
      wordCount: serializer.fromJson<int>(json['wordCount']),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'outlineNodeId': serializer.toJson<String?>(outlineNodeId),
      'title': serializer.toJson<String>(title),
      'orderIndex': serializer.toJson<int>(orderIndex),
      'contentFormat': serializer.toJson<String>(contentFormat),
      'content': serializer.toJson<String>(content),
      'plainTextCache': serializer.toJson<String>(plainTextCache),
      'wordCount': serializer.toJson<int>(wordCount),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  ChaptersTableData copyWith(
          {String? id,
          String? projectId,
          Value<String?> outlineNodeId = const Value.absent(),
          String? title,
          int? orderIndex,
          String? contentFormat,
          String? content,
          String? plainTextCache,
          int? wordCount,
          String? status,
          DateTime? createdAt,
          DateTime? updatedAt,
          int? schemaVersion}) =>
      ChaptersTableData(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        outlineNodeId:
            outlineNodeId.present ? outlineNodeId.value : this.outlineNodeId,
        title: title ?? this.title,
        orderIndex: orderIndex ?? this.orderIndex,
        contentFormat: contentFormat ?? this.contentFormat,
        content: content ?? this.content,
        plainTextCache: plainTextCache ?? this.plainTextCache,
        wordCount: wordCount ?? this.wordCount,
        status: status ?? this.status,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  ChaptersTableData copyWithCompanion(ChaptersTableCompanion data) {
    return ChaptersTableData(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      outlineNodeId: data.outlineNodeId.present
          ? data.outlineNodeId.value
          : this.outlineNodeId,
      title: data.title.present ? data.title.value : this.title,
      orderIndex:
          data.orderIndex.present ? data.orderIndex.value : this.orderIndex,
      contentFormat: data.contentFormat.present
          ? data.contentFormat.value
          : this.contentFormat,
      content: data.content.present ? data.content.value : this.content,
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
    return (StringBuffer('ChaptersTableData(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('outlineNodeId: $outlineNodeId, ')
          ..write('title: $title, ')
          ..write('orderIndex: $orderIndex, ')
          ..write('contentFormat: $contentFormat, ')
          ..write('content: $content, ')
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
  int get hashCode => Object.hash(
      id,
      projectId,
      outlineNodeId,
      title,
      orderIndex,
      contentFormat,
      content,
      plainTextCache,
      wordCount,
      status,
      createdAt,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ChaptersTableData &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.outlineNodeId == this.outlineNodeId &&
          other.title == this.title &&
          other.orderIndex == this.orderIndex &&
          other.contentFormat == this.contentFormat &&
          other.content == this.content &&
          other.plainTextCache == this.plainTextCache &&
          other.wordCount == this.wordCount &&
          other.status == this.status &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class ChaptersTableCompanion extends UpdateCompanion<ChaptersTableData> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String?> outlineNodeId;
  final Value<String> title;
  final Value<int> orderIndex;
  final Value<String> contentFormat;
  final Value<String> content;
  final Value<String> plainTextCache;
  final Value<int> wordCount;
  final Value<String> status;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const ChaptersTableCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.outlineNodeId = const Value.absent(),
    this.title = const Value.absent(),
    this.orderIndex = const Value.absent(),
    this.contentFormat = const Value.absent(),
    this.content = const Value.absent(),
    this.plainTextCache = const Value.absent(),
    this.wordCount = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  ChaptersTableCompanion.insert({
    required String id,
    required String projectId,
    this.outlineNodeId = const Value.absent(),
    required String title,
    required int orderIndex,
    this.contentFormat = const Value.absent(),
    this.content = const Value.absent(),
    this.plainTextCache = const Value.absent(),
    this.wordCount = const Value.absent(),
    this.status = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        title = Value(title),
        orderIndex = Value(orderIndex),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<ChaptersTableData> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? outlineNodeId,
    Expression<String>? title,
    Expression<int>? orderIndex,
    Expression<String>? contentFormat,
    Expression<String>? content,
    Expression<String>? plainTextCache,
    Expression<int>? wordCount,
    Expression<String>? status,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (outlineNodeId != null) 'outline_node_id': outlineNodeId,
      if (title != null) 'title': title,
      if (orderIndex != null) 'order_index': orderIndex,
      if (contentFormat != null) 'content_format': contentFormat,
      if (content != null) 'content': content,
      if (plainTextCache != null) 'plain_text_cache': plainTextCache,
      if (wordCount != null) 'word_count': wordCount,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  ChaptersTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String?>? outlineNodeId,
      Value<String>? title,
      Value<int>? orderIndex,
      Value<String>? contentFormat,
      Value<String>? content,
      Value<String>? plainTextCache,
      Value<int>? wordCount,
      Value<String>? status,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return ChaptersTableCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      outlineNodeId: outlineNodeId ?? this.outlineNodeId,
      title: title ?? this.title,
      orderIndex: orderIndex ?? this.orderIndex,
      contentFormat: contentFormat ?? this.contentFormat,
      content: content ?? this.content,
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
    if (outlineNodeId.present) {
      map['outline_node_id'] = Variable<String>(outlineNodeId.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (orderIndex.present) {
      map['order_index'] = Variable<int>(orderIndex.value);
    }
    if (contentFormat.present) {
      map['content_format'] = Variable<String>(contentFormat.value);
    }
    if (content.present) {
      map['content'] = Variable<String>(content.value);
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
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
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
    return (StringBuffer('ChaptersTableCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('outlineNodeId: $outlineNodeId, ')
          ..write('title: $title, ')
          ..write('orderIndex: $orderIndex, ')
          ..write('contentFormat: $contentFormat, ')
          ..write('content: $content, ')
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

class $RevisionsTableTable extends RevisionsTable
    with TableInfo<$RevisionsTableTable, RevisionsTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $RevisionsTableTable(this.attachedDatabase, [this._alias]);
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
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _operationMeta =
      const VerificationMeta('operation');
  @override
  late final GeneratedColumn<String> operation = GeneratedColumn<String>(
      'operation', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _anchorMeta = const VerificationMeta('anchor');
  @override
  late final GeneratedColumn<String> anchor = GeneratedColumn<String>(
      'anchor', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _beforeTextMeta =
      const VerificationMeta('beforeText');
  @override
  late final GeneratedColumn<String> beforeText = GeneratedColumn<String>(
      'before_text', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _afterTextMeta =
      const VerificationMeta('afterText');
  @override
  late final GeneratedColumn<String> afterText = GeneratedColumn<String>(
      'after_text', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _sourceMeta = const VerificationMeta('source');
  @override
  late final GeneratedColumn<String> source = GeneratedColumn<String>(
      'source', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('agent'));
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('pending'));
  static const VerificationMeta _metadataMeta =
      const VerificationMeta('metadata');
  @override
  late final GeneratedColumn<String> metadata = GeneratedColumn<String>(
      'metadata', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _resolvedAtMeta =
      const VerificationMeta('resolvedAt');
  @override
  late final GeneratedColumn<DateTime> resolvedAt = GeneratedColumn<DateTime>(
      'resolved_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
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
        operation,
        anchor,
        beforeText,
        afterText,
        source,
        status,
        metadata,
        resolvedAt,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'revisions_table';
  @override
  VerificationContext validateIntegrity(Insertable<RevisionsTableData> instance,
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
    if (data.containsKey('operation')) {
      context.handle(_operationMeta,
          operation.isAcceptableOrUnknown(data['operation']!, _operationMeta));
    } else if (isInserting) {
      context.missing(_operationMeta);
    }
    if (data.containsKey('anchor')) {
      context.handle(_anchorMeta,
          anchor.isAcceptableOrUnknown(data['anchor']!, _anchorMeta));
    } else if (isInserting) {
      context.missing(_anchorMeta);
    }
    if (data.containsKey('before_text')) {
      context.handle(
          _beforeTextMeta,
          beforeText.isAcceptableOrUnknown(
              data['before_text']!, _beforeTextMeta));
    } else if (isInserting) {
      context.missing(_beforeTextMeta);
    }
    if (data.containsKey('after_text')) {
      context.handle(_afterTextMeta,
          afterText.isAcceptableOrUnknown(data['after_text']!, _afterTextMeta));
    } else if (isInserting) {
      context.missing(_afterTextMeta);
    }
    if (data.containsKey('source')) {
      context.handle(_sourceMeta,
          source.isAcceptableOrUnknown(data['source']!, _sourceMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('metadata')) {
      context.handle(_metadataMeta,
          metadata.isAcceptableOrUnknown(data['metadata']!, _metadataMeta));
    }
    if (data.containsKey('resolved_at')) {
      context.handle(
          _resolvedAtMeta,
          resolvedAt.isAcceptableOrUnknown(
              data['resolved_at']!, _resolvedAtMeta));
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
  RevisionsTableData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return RevisionsTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      chapterId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}chapter_id'])!,
      operation: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}operation'])!,
      anchor: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}anchor'])!,
      beforeText: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}before_text'])!,
      afterText: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}after_text'])!,
      source: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}source'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      metadata: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}metadata']),
      resolvedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}resolved_at']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $RevisionsTableTable createAlias(String alias) {
    return $RevisionsTableTable(attachedDatabase, alias);
  }
}

class RevisionsTableData extends DataClass
    implements Insertable<RevisionsTableData> {
  final String id;
  final String projectId;
  final String chapterId;
  final String operation;
  final String anchor;
  final String beforeText;
  final String afterText;
  final String source;
  final String status;
  final String? metadata;
  final DateTime? resolvedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int schemaVersion;
  const RevisionsTableData(
      {required this.id,
      required this.projectId,
      required this.chapterId,
      required this.operation,
      required this.anchor,
      required this.beforeText,
      required this.afterText,
      required this.source,
      required this.status,
      this.metadata,
      this.resolvedAt,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['chapter_id'] = Variable<String>(chapterId);
    map['operation'] = Variable<String>(operation);
    map['anchor'] = Variable<String>(anchor);
    map['before_text'] = Variable<String>(beforeText);
    map['after_text'] = Variable<String>(afterText);
    map['source'] = Variable<String>(source);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || metadata != null) {
      map['metadata'] = Variable<String>(metadata);
    }
    if (!nullToAbsent || resolvedAt != null) {
      map['resolved_at'] = Variable<DateTime>(resolvedAt);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  RevisionsTableCompanion toCompanion(bool nullToAbsent) {
    return RevisionsTableCompanion(
      id: Value(id),
      projectId: Value(projectId),
      chapterId: Value(chapterId),
      operation: Value(operation),
      anchor: Value(anchor),
      beforeText: Value(beforeText),
      afterText: Value(afterText),
      source: Value(source),
      status: Value(status),
      metadata: metadata == null && nullToAbsent
          ? const Value.absent()
          : Value(metadata),
      resolvedAt: resolvedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(resolvedAt),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory RevisionsTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return RevisionsTableData(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      chapterId: serializer.fromJson<String>(json['chapterId']),
      operation: serializer.fromJson<String>(json['operation']),
      anchor: serializer.fromJson<String>(json['anchor']),
      beforeText: serializer.fromJson<String>(json['beforeText']),
      afterText: serializer.fromJson<String>(json['afterText']),
      source: serializer.fromJson<String>(json['source']),
      status: serializer.fromJson<String>(json['status']),
      metadata: serializer.fromJson<String?>(json['metadata']),
      resolvedAt: serializer.fromJson<DateTime?>(json['resolvedAt']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
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
      'operation': serializer.toJson<String>(operation),
      'anchor': serializer.toJson<String>(anchor),
      'beforeText': serializer.toJson<String>(beforeText),
      'afterText': serializer.toJson<String>(afterText),
      'source': serializer.toJson<String>(source),
      'status': serializer.toJson<String>(status),
      'metadata': serializer.toJson<String?>(metadata),
      'resolvedAt': serializer.toJson<DateTime?>(resolvedAt),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  RevisionsTableData copyWith(
          {String? id,
          String? projectId,
          String? chapterId,
          String? operation,
          String? anchor,
          String? beforeText,
          String? afterText,
          String? source,
          String? status,
          Value<String?> metadata = const Value.absent(),
          Value<DateTime?> resolvedAt = const Value.absent(),
          DateTime? createdAt,
          DateTime? updatedAt,
          int? schemaVersion}) =>
      RevisionsTableData(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        chapterId: chapterId ?? this.chapterId,
        operation: operation ?? this.operation,
        anchor: anchor ?? this.anchor,
        beforeText: beforeText ?? this.beforeText,
        afterText: afterText ?? this.afterText,
        source: source ?? this.source,
        status: status ?? this.status,
        metadata: metadata.present ? metadata.value : this.metadata,
        resolvedAt: resolvedAt.present ? resolvedAt.value : this.resolvedAt,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  RevisionsTableData copyWithCompanion(RevisionsTableCompanion data) {
    return RevisionsTableData(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      chapterId: data.chapterId.present ? data.chapterId.value : this.chapterId,
      operation: data.operation.present ? data.operation.value : this.operation,
      anchor: data.anchor.present ? data.anchor.value : this.anchor,
      beforeText:
          data.beforeText.present ? data.beforeText.value : this.beforeText,
      afterText: data.afterText.present ? data.afterText.value : this.afterText,
      source: data.source.present ? data.source.value : this.source,
      status: data.status.present ? data.status.value : this.status,
      metadata: data.metadata.present ? data.metadata.value : this.metadata,
      resolvedAt:
          data.resolvedAt.present ? data.resolvedAt.value : this.resolvedAt,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('RevisionsTableData(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('chapterId: $chapterId, ')
          ..write('operation: $operation, ')
          ..write('anchor: $anchor, ')
          ..write('beforeText: $beforeText, ')
          ..write('afterText: $afterText, ')
          ..write('source: $source, ')
          ..write('status: $status, ')
          ..write('metadata: $metadata, ')
          ..write('resolvedAt: $resolvedAt, ')
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
      chapterId,
      operation,
      anchor,
      beforeText,
      afterText,
      source,
      status,
      metadata,
      resolvedAt,
      createdAt,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is RevisionsTableData &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.chapterId == this.chapterId &&
          other.operation == this.operation &&
          other.anchor == this.anchor &&
          other.beforeText == this.beforeText &&
          other.afterText == this.afterText &&
          other.source == this.source &&
          other.status == this.status &&
          other.metadata == this.metadata &&
          other.resolvedAt == this.resolvedAt &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class RevisionsTableCompanion extends UpdateCompanion<RevisionsTableData> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> chapterId;
  final Value<String> operation;
  final Value<String> anchor;
  final Value<String> beforeText;
  final Value<String> afterText;
  final Value<String> source;
  final Value<String> status;
  final Value<String?> metadata;
  final Value<DateTime?> resolvedAt;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const RevisionsTableCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.chapterId = const Value.absent(),
    this.operation = const Value.absent(),
    this.anchor = const Value.absent(),
    this.beforeText = const Value.absent(),
    this.afterText = const Value.absent(),
    this.source = const Value.absent(),
    this.status = const Value.absent(),
    this.metadata = const Value.absent(),
    this.resolvedAt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  RevisionsTableCompanion.insert({
    required String id,
    required String projectId,
    required String chapterId,
    required String operation,
    required String anchor,
    required String beforeText,
    required String afterText,
    this.source = const Value.absent(),
    this.status = const Value.absent(),
    this.metadata = const Value.absent(),
    this.resolvedAt = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        chapterId = Value(chapterId),
        operation = Value(operation),
        anchor = Value(anchor),
        beforeText = Value(beforeText),
        afterText = Value(afterText),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<RevisionsTableData> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? chapterId,
    Expression<String>? operation,
    Expression<String>? anchor,
    Expression<String>? beforeText,
    Expression<String>? afterText,
    Expression<String>? source,
    Expression<String>? status,
    Expression<String>? metadata,
    Expression<DateTime>? resolvedAt,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (chapterId != null) 'chapter_id': chapterId,
      if (operation != null) 'operation': operation,
      if (anchor != null) 'anchor': anchor,
      if (beforeText != null) 'before_text': beforeText,
      if (afterText != null) 'after_text': afterText,
      if (source != null) 'source': source,
      if (status != null) 'status': status,
      if (metadata != null) 'metadata': metadata,
      if (resolvedAt != null) 'resolved_at': resolvedAt,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  RevisionsTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? chapterId,
      Value<String>? operation,
      Value<String>? anchor,
      Value<String>? beforeText,
      Value<String>? afterText,
      Value<String>? source,
      Value<String>? status,
      Value<String?>? metadata,
      Value<DateTime?>? resolvedAt,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return RevisionsTableCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      chapterId: chapterId ?? this.chapterId,
      operation: operation ?? this.operation,
      anchor: anchor ?? this.anchor,
      beforeText: beforeText ?? this.beforeText,
      afterText: afterText ?? this.afterText,
      source: source ?? this.source,
      status: status ?? this.status,
      metadata: metadata ?? this.metadata,
      resolvedAt: resolvedAt ?? this.resolvedAt,
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
    if (operation.present) {
      map['operation'] = Variable<String>(operation.value);
    }
    if (anchor.present) {
      map['anchor'] = Variable<String>(anchor.value);
    }
    if (beforeText.present) {
      map['before_text'] = Variable<String>(beforeText.value);
    }
    if (afterText.present) {
      map['after_text'] = Variable<String>(afterText.value);
    }
    if (source.present) {
      map['source'] = Variable<String>(source.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (metadata.present) {
      map['metadata'] = Variable<String>(metadata.value);
    }
    if (resolvedAt.present) {
      map['resolved_at'] = Variable<DateTime>(resolvedAt.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
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
    return (StringBuffer('RevisionsTableCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('chapterId: $chapterId, ')
          ..write('operation: $operation, ')
          ..write('anchor: $anchor, ')
          ..write('beforeText: $beforeText, ')
          ..write('afterText: $afterText, ')
          ..write('source: $source, ')
          ..write('status: $status, ')
          ..write('metadata: $metadata, ')
          ..write('resolvedAt: $resolvedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $OutlineNodesTableTable extends OutlineNodesTable
    with TableInfo<$OutlineNodesTableTable, OutlineNodesTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $OutlineNodesTableTable(this.attachedDatabase, [this._alias]);
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
  static const VerificationMeta _parentIdMeta =
      const VerificationMeta('parentId');
  @override
  late final GeneratedColumn<String> parentId = GeneratedColumn<String>(
      'parent_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _orderIndexMeta =
      const VerificationMeta('orderIndex');
  @override
  late final GeneratedColumn<int> orderIndex = GeneratedColumn<int>(
      'order_index', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _nodeTypeMeta =
      const VerificationMeta('nodeType');
  @override
  late final GeneratedColumn<String> nodeType = GeneratedColumn<String>(
      'node_type', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('chapter'));
  static const VerificationMeta _summaryMeta =
      const VerificationMeta('summary');
  @override
  late final GeneratedColumn<String> summary = GeneratedColumn<String>(
      'summary', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _linkedChapterIdMeta =
      const VerificationMeta('linkedChapterId');
  @override
  late final GeneratedColumn<String> linkedChapterId = GeneratedColumn<String>(
      'linked_chapter_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('planned'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
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
        parentId,
        orderIndex,
        title,
        nodeType,
        summary,
        linkedChapterId,
        status,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'outline_nodes_table';
  @override
  VerificationContext validateIntegrity(
      Insertable<OutlineNodesTableData> instance,
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
    if (data.containsKey('parent_id')) {
      context.handle(_parentIdMeta,
          parentId.isAcceptableOrUnknown(data['parent_id']!, _parentIdMeta));
    }
    if (data.containsKey('order_index')) {
      context.handle(
          _orderIndexMeta,
          orderIndex.isAcceptableOrUnknown(
              data['order_index']!, _orderIndexMeta));
    } else if (isInserting) {
      context.missing(_orderIndexMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('node_type')) {
      context.handle(_nodeTypeMeta,
          nodeType.isAcceptableOrUnknown(data['node_type']!, _nodeTypeMeta));
    }
    if (data.containsKey('summary')) {
      context.handle(_summaryMeta,
          summary.isAcceptableOrUnknown(data['summary']!, _summaryMeta));
    }
    if (data.containsKey('linked_chapter_id')) {
      context.handle(
          _linkedChapterIdMeta,
          linkedChapterId.isAcceptableOrUnknown(
              data['linked_chapter_id']!, _linkedChapterIdMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
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
  OutlineNodesTableData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return OutlineNodesTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      parentId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}parent_id']),
      orderIndex: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}order_index'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      nodeType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}node_type'])!,
      summary: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}summary'])!,
      linkedChapterId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}linked_chapter_id']),
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $OutlineNodesTableTable createAlias(String alias) {
    return $OutlineNodesTableTable(attachedDatabase, alias);
  }
}

class OutlineNodesTableData extends DataClass
    implements Insertable<OutlineNodesTableData> {
  final String id;
  final String projectId;
  final String? parentId;
  final int orderIndex;
  final String title;
  final String nodeType;
  final String summary;
  final String? linkedChapterId;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int schemaVersion;
  const OutlineNodesTableData(
      {required this.id,
      required this.projectId,
      this.parentId,
      required this.orderIndex,
      required this.title,
      required this.nodeType,
      required this.summary,
      this.linkedChapterId,
      required this.status,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    if (!nullToAbsent || parentId != null) {
      map['parent_id'] = Variable<String>(parentId);
    }
    map['order_index'] = Variable<int>(orderIndex);
    map['title'] = Variable<String>(title);
    map['node_type'] = Variable<String>(nodeType);
    map['summary'] = Variable<String>(summary);
    if (!nullToAbsent || linkedChapterId != null) {
      map['linked_chapter_id'] = Variable<String>(linkedChapterId);
    }
    map['status'] = Variable<String>(status);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  OutlineNodesTableCompanion toCompanion(bool nullToAbsent) {
    return OutlineNodesTableCompanion(
      id: Value(id),
      projectId: Value(projectId),
      parentId: parentId == null && nullToAbsent
          ? const Value.absent()
          : Value(parentId),
      orderIndex: Value(orderIndex),
      title: Value(title),
      nodeType: Value(nodeType),
      summary: Value(summary),
      linkedChapterId: linkedChapterId == null && nullToAbsent
          ? const Value.absent()
          : Value(linkedChapterId),
      status: Value(status),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory OutlineNodesTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return OutlineNodesTableData(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      parentId: serializer.fromJson<String?>(json['parentId']),
      orderIndex: serializer.fromJson<int>(json['orderIndex']),
      title: serializer.fromJson<String>(json['title']),
      nodeType: serializer.fromJson<String>(json['nodeType']),
      summary: serializer.fromJson<String>(json['summary']),
      linkedChapterId: serializer.fromJson<String?>(json['linkedChapterId']),
      status: serializer.fromJson<String>(json['status']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'parentId': serializer.toJson<String?>(parentId),
      'orderIndex': serializer.toJson<int>(orderIndex),
      'title': serializer.toJson<String>(title),
      'nodeType': serializer.toJson<String>(nodeType),
      'summary': serializer.toJson<String>(summary),
      'linkedChapterId': serializer.toJson<String?>(linkedChapterId),
      'status': serializer.toJson<String>(status),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  OutlineNodesTableData copyWith(
          {String? id,
          String? projectId,
          Value<String?> parentId = const Value.absent(),
          int? orderIndex,
          String? title,
          String? nodeType,
          String? summary,
          Value<String?> linkedChapterId = const Value.absent(),
          String? status,
          DateTime? createdAt,
          DateTime? updatedAt,
          int? schemaVersion}) =>
      OutlineNodesTableData(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        parentId: parentId.present ? parentId.value : this.parentId,
        orderIndex: orderIndex ?? this.orderIndex,
        title: title ?? this.title,
        nodeType: nodeType ?? this.nodeType,
        summary: summary ?? this.summary,
        linkedChapterId: linkedChapterId.present
            ? linkedChapterId.value
            : this.linkedChapterId,
        status: status ?? this.status,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  OutlineNodesTableData copyWithCompanion(OutlineNodesTableCompanion data) {
    return OutlineNodesTableData(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      parentId: data.parentId.present ? data.parentId.value : this.parentId,
      orderIndex:
          data.orderIndex.present ? data.orderIndex.value : this.orderIndex,
      title: data.title.present ? data.title.value : this.title,
      nodeType: data.nodeType.present ? data.nodeType.value : this.nodeType,
      summary: data.summary.present ? data.summary.value : this.summary,
      linkedChapterId: data.linkedChapterId.present
          ? data.linkedChapterId.value
          : this.linkedChapterId,
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
    return (StringBuffer('OutlineNodesTableData(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('parentId: $parentId, ')
          ..write('orderIndex: $orderIndex, ')
          ..write('title: $title, ')
          ..write('nodeType: $nodeType, ')
          ..write('summary: $summary, ')
          ..write('linkedChapterId: $linkedChapterId, ')
          ..write('status: $status, ')
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
      parentId,
      orderIndex,
      title,
      nodeType,
      summary,
      linkedChapterId,
      status,
      createdAt,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is OutlineNodesTableData &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.parentId == this.parentId &&
          other.orderIndex == this.orderIndex &&
          other.title == this.title &&
          other.nodeType == this.nodeType &&
          other.summary == this.summary &&
          other.linkedChapterId == this.linkedChapterId &&
          other.status == this.status &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class OutlineNodesTableCompanion
    extends UpdateCompanion<OutlineNodesTableData> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String?> parentId;
  final Value<int> orderIndex;
  final Value<String> title;
  final Value<String> nodeType;
  final Value<String> summary;
  final Value<String?> linkedChapterId;
  final Value<String> status;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const OutlineNodesTableCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.parentId = const Value.absent(),
    this.orderIndex = const Value.absent(),
    this.title = const Value.absent(),
    this.nodeType = const Value.absent(),
    this.summary = const Value.absent(),
    this.linkedChapterId = const Value.absent(),
    this.status = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  OutlineNodesTableCompanion.insert({
    required String id,
    required String projectId,
    this.parentId = const Value.absent(),
    required int orderIndex,
    required String title,
    this.nodeType = const Value.absent(),
    this.summary = const Value.absent(),
    this.linkedChapterId = const Value.absent(),
    this.status = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        orderIndex = Value(orderIndex),
        title = Value(title),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<OutlineNodesTableData> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? parentId,
    Expression<int>? orderIndex,
    Expression<String>? title,
    Expression<String>? nodeType,
    Expression<String>? summary,
    Expression<String>? linkedChapterId,
    Expression<String>? status,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (parentId != null) 'parent_id': parentId,
      if (orderIndex != null) 'order_index': orderIndex,
      if (title != null) 'title': title,
      if (nodeType != null) 'node_type': nodeType,
      if (summary != null) 'summary': summary,
      if (linkedChapterId != null) 'linked_chapter_id': linkedChapterId,
      if (status != null) 'status': status,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  OutlineNodesTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String?>? parentId,
      Value<int>? orderIndex,
      Value<String>? title,
      Value<String>? nodeType,
      Value<String>? summary,
      Value<String?>? linkedChapterId,
      Value<String>? status,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return OutlineNodesTableCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      parentId: parentId ?? this.parentId,
      orderIndex: orderIndex ?? this.orderIndex,
      title: title ?? this.title,
      nodeType: nodeType ?? this.nodeType,
      summary: summary ?? this.summary,
      linkedChapterId: linkedChapterId ?? this.linkedChapterId,
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
    if (parentId.present) {
      map['parent_id'] = Variable<String>(parentId.value);
    }
    if (orderIndex.present) {
      map['order_index'] = Variable<int>(orderIndex.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (nodeType.present) {
      map['node_type'] = Variable<String>(nodeType.value);
    }
    if (summary.present) {
      map['summary'] = Variable<String>(summary.value);
    }
    if (linkedChapterId.present) {
      map['linked_chapter_id'] = Variable<String>(linkedChapterId.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
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
    return (StringBuffer('OutlineNodesTableCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('parentId: $parentId, ')
          ..write('orderIndex: $orderIndex, ')
          ..write('title: $title, ')
          ..write('nodeType: $nodeType, ')
          ..write('summary: $summary, ')
          ..write('linkedChapterId: $linkedChapterId, ')
          ..write('status: $status, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $CharactersTableTable extends CharactersTable
    with TableInfo<$CharactersTableTable, CharactersTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CharactersTableTable(this.attachedDatabase, [this._alias]);
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
  static const VerificationMeta _aliasesMeta =
      const VerificationMeta('aliases');
  @override
  late final GeneratedColumn<String> aliases = GeneratedColumn<String>(
      'aliases', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _roleMeta = const VerificationMeta('role');
  @override
  late final GeneratedColumn<String> role = GeneratedColumn<String>(
      'role', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('supporting'));
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
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
  static const VerificationMeta _relationshipsMeta =
      const VerificationMeta('relationships');
  @override
  late final GeneratedColumn<String> relationships = GeneratedColumn<String>(
      'relationships', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _firstAppearanceChapterIdMeta =
      const VerificationMeta('firstAppearanceChapterId');
  @override
  late final GeneratedColumn<String> firstAppearanceChapterId =
      GeneratedColumn<String>('first_appearance_chapter_id', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _tagsMeta = const VerificationMeta('tags');
  @override
  late final GeneratedColumn<String> tags = GeneratedColumn<String>(
      'tags', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _consistencyFactsMeta =
      const VerificationMeta('consistencyFacts');
  @override
  late final GeneratedColumn<String> consistencyFacts = GeneratedColumn<String>(
      'consistency_facts', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
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
        aliases,
        role,
        description,
        appearance,
        personality,
        goals,
        conflicts,
        secrets,
        relationships,
        firstAppearanceChapterId,
        tags,
        consistencyFacts,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'characters_table';
  @override
  VerificationContext validateIntegrity(
      Insertable<CharactersTableData> instance,
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
    if (data.containsKey('aliases')) {
      context.handle(_aliasesMeta,
          aliases.isAcceptableOrUnknown(data['aliases']!, _aliasesMeta));
    }
    if (data.containsKey('role')) {
      context.handle(
          _roleMeta, role.isAcceptableOrUnknown(data['role']!, _roleMeta));
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
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
    if (data.containsKey('relationships')) {
      context.handle(
          _relationshipsMeta,
          relationships.isAcceptableOrUnknown(
              data['relationships']!, _relationshipsMeta));
    }
    if (data.containsKey('first_appearance_chapter_id')) {
      context.handle(
          _firstAppearanceChapterIdMeta,
          firstAppearanceChapterId.isAcceptableOrUnknown(
              data['first_appearance_chapter_id']!,
              _firstAppearanceChapterIdMeta));
    }
    if (data.containsKey('tags')) {
      context.handle(
          _tagsMeta, tags.isAcceptableOrUnknown(data['tags']!, _tagsMeta));
    }
    if (data.containsKey('consistency_facts')) {
      context.handle(
          _consistencyFactsMeta,
          consistencyFacts.isAcceptableOrUnknown(
              data['consistency_facts']!, _consistencyFactsMeta));
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
  CharactersTableData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CharactersTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      aliases: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}aliases'])!,
      role: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}role'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description'])!,
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
      relationships: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}relationships'])!,
      firstAppearanceChapterId: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}first_appearance_chapter_id']),
      tags: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}tags'])!,
      consistencyFacts: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}consistency_facts'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $CharactersTableTable createAlias(String alias) {
    return $CharactersTableTable(attachedDatabase, alias);
  }
}

class CharactersTableData extends DataClass
    implements Insertable<CharactersTableData> {
  final String id;
  final String projectId;
  final String name;
  final String aliases;
  final String role;
  final String description;
  final String appearance;
  final String personality;
  final String goals;
  final String conflicts;
  final String secrets;
  final String relationships;
  final String? firstAppearanceChapterId;
  final String tags;
  final String consistencyFacts;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int schemaVersion;
  const CharactersTableData(
      {required this.id,
      required this.projectId,
      required this.name,
      required this.aliases,
      required this.role,
      required this.description,
      required this.appearance,
      required this.personality,
      required this.goals,
      required this.conflicts,
      required this.secrets,
      required this.relationships,
      this.firstAppearanceChapterId,
      required this.tags,
      required this.consistencyFacts,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['name'] = Variable<String>(name);
    map['aliases'] = Variable<String>(aliases);
    map['role'] = Variable<String>(role);
    map['description'] = Variable<String>(description);
    map['appearance'] = Variable<String>(appearance);
    map['personality'] = Variable<String>(personality);
    map['goals'] = Variable<String>(goals);
    map['conflicts'] = Variable<String>(conflicts);
    map['secrets'] = Variable<String>(secrets);
    map['relationships'] = Variable<String>(relationships);
    if (!nullToAbsent || firstAppearanceChapterId != null) {
      map['first_appearance_chapter_id'] =
          Variable<String>(firstAppearanceChapterId);
    }
    map['tags'] = Variable<String>(tags);
    map['consistency_facts'] = Variable<String>(consistencyFacts);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  CharactersTableCompanion toCompanion(bool nullToAbsent) {
    return CharactersTableCompanion(
      id: Value(id),
      projectId: Value(projectId),
      name: Value(name),
      aliases: Value(aliases),
      role: Value(role),
      description: Value(description),
      appearance: Value(appearance),
      personality: Value(personality),
      goals: Value(goals),
      conflicts: Value(conflicts),
      secrets: Value(secrets),
      relationships: Value(relationships),
      firstAppearanceChapterId: firstAppearanceChapterId == null && nullToAbsent
          ? const Value.absent()
          : Value(firstAppearanceChapterId),
      tags: Value(tags),
      consistencyFacts: Value(consistencyFacts),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory CharactersTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CharactersTableData(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      name: serializer.fromJson<String>(json['name']),
      aliases: serializer.fromJson<String>(json['aliases']),
      role: serializer.fromJson<String>(json['role']),
      description: serializer.fromJson<String>(json['description']),
      appearance: serializer.fromJson<String>(json['appearance']),
      personality: serializer.fromJson<String>(json['personality']),
      goals: serializer.fromJson<String>(json['goals']),
      conflicts: serializer.fromJson<String>(json['conflicts']),
      secrets: serializer.fromJson<String>(json['secrets']),
      relationships: serializer.fromJson<String>(json['relationships']),
      firstAppearanceChapterId:
          serializer.fromJson<String?>(json['firstAppearanceChapterId']),
      tags: serializer.fromJson<String>(json['tags']),
      consistencyFacts: serializer.fromJson<String>(json['consistencyFacts']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
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
      'aliases': serializer.toJson<String>(aliases),
      'role': serializer.toJson<String>(role),
      'description': serializer.toJson<String>(description),
      'appearance': serializer.toJson<String>(appearance),
      'personality': serializer.toJson<String>(personality),
      'goals': serializer.toJson<String>(goals),
      'conflicts': serializer.toJson<String>(conflicts),
      'secrets': serializer.toJson<String>(secrets),
      'relationships': serializer.toJson<String>(relationships),
      'firstAppearanceChapterId':
          serializer.toJson<String?>(firstAppearanceChapterId),
      'tags': serializer.toJson<String>(tags),
      'consistencyFacts': serializer.toJson<String>(consistencyFacts),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  CharactersTableData copyWith(
          {String? id,
          String? projectId,
          String? name,
          String? aliases,
          String? role,
          String? description,
          String? appearance,
          String? personality,
          String? goals,
          String? conflicts,
          String? secrets,
          String? relationships,
          Value<String?> firstAppearanceChapterId = const Value.absent(),
          String? tags,
          String? consistencyFacts,
          DateTime? createdAt,
          DateTime? updatedAt,
          int? schemaVersion}) =>
      CharactersTableData(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        name: name ?? this.name,
        aliases: aliases ?? this.aliases,
        role: role ?? this.role,
        description: description ?? this.description,
        appearance: appearance ?? this.appearance,
        personality: personality ?? this.personality,
        goals: goals ?? this.goals,
        conflicts: conflicts ?? this.conflicts,
        secrets: secrets ?? this.secrets,
        relationships: relationships ?? this.relationships,
        firstAppearanceChapterId: firstAppearanceChapterId.present
            ? firstAppearanceChapterId.value
            : this.firstAppearanceChapterId,
        tags: tags ?? this.tags,
        consistencyFacts: consistencyFacts ?? this.consistencyFacts,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  CharactersTableData copyWithCompanion(CharactersTableCompanion data) {
    return CharactersTableData(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      name: data.name.present ? data.name.value : this.name,
      aliases: data.aliases.present ? data.aliases.value : this.aliases,
      role: data.role.present ? data.role.value : this.role,
      description:
          data.description.present ? data.description.value : this.description,
      appearance:
          data.appearance.present ? data.appearance.value : this.appearance,
      personality:
          data.personality.present ? data.personality.value : this.personality,
      goals: data.goals.present ? data.goals.value : this.goals,
      conflicts: data.conflicts.present ? data.conflicts.value : this.conflicts,
      secrets: data.secrets.present ? data.secrets.value : this.secrets,
      relationships: data.relationships.present
          ? data.relationships.value
          : this.relationships,
      firstAppearanceChapterId: data.firstAppearanceChapterId.present
          ? data.firstAppearanceChapterId.value
          : this.firstAppearanceChapterId,
      tags: data.tags.present ? data.tags.value : this.tags,
      consistencyFacts: data.consistencyFacts.present
          ? data.consistencyFacts.value
          : this.consistencyFacts,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CharactersTableData(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('name: $name, ')
          ..write('aliases: $aliases, ')
          ..write('role: $role, ')
          ..write('description: $description, ')
          ..write('appearance: $appearance, ')
          ..write('personality: $personality, ')
          ..write('goals: $goals, ')
          ..write('conflicts: $conflicts, ')
          ..write('secrets: $secrets, ')
          ..write('relationships: $relationships, ')
          ..write('firstAppearanceChapterId: $firstAppearanceChapterId, ')
          ..write('tags: $tags, ')
          ..write('consistencyFacts: $consistencyFacts, ')
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
      aliases,
      role,
      description,
      appearance,
      personality,
      goals,
      conflicts,
      secrets,
      relationships,
      firstAppearanceChapterId,
      tags,
      consistencyFacts,
      createdAt,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CharactersTableData &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.name == this.name &&
          other.aliases == this.aliases &&
          other.role == this.role &&
          other.description == this.description &&
          other.appearance == this.appearance &&
          other.personality == this.personality &&
          other.goals == this.goals &&
          other.conflicts == this.conflicts &&
          other.secrets == this.secrets &&
          other.relationships == this.relationships &&
          other.firstAppearanceChapterId == this.firstAppearanceChapterId &&
          other.tags == this.tags &&
          other.consistencyFacts == this.consistencyFacts &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class CharactersTableCompanion extends UpdateCompanion<CharactersTableData> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> name;
  final Value<String> aliases;
  final Value<String> role;
  final Value<String> description;
  final Value<String> appearance;
  final Value<String> personality;
  final Value<String> goals;
  final Value<String> conflicts;
  final Value<String> secrets;
  final Value<String> relationships;
  final Value<String?> firstAppearanceChapterId;
  final Value<String> tags;
  final Value<String> consistencyFacts;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const CharactersTableCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.name = const Value.absent(),
    this.aliases = const Value.absent(),
    this.role = const Value.absent(),
    this.description = const Value.absent(),
    this.appearance = const Value.absent(),
    this.personality = const Value.absent(),
    this.goals = const Value.absent(),
    this.conflicts = const Value.absent(),
    this.secrets = const Value.absent(),
    this.relationships = const Value.absent(),
    this.firstAppearanceChapterId = const Value.absent(),
    this.tags = const Value.absent(),
    this.consistencyFacts = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CharactersTableCompanion.insert({
    required String id,
    required String projectId,
    required String name,
    this.aliases = const Value.absent(),
    this.role = const Value.absent(),
    this.description = const Value.absent(),
    this.appearance = const Value.absent(),
    this.personality = const Value.absent(),
    this.goals = const Value.absent(),
    this.conflicts = const Value.absent(),
    this.secrets = const Value.absent(),
    this.relationships = const Value.absent(),
    this.firstAppearanceChapterId = const Value.absent(),
    this.tags = const Value.absent(),
    this.consistencyFacts = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        name = Value(name),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<CharactersTableData> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? name,
    Expression<String>? aliases,
    Expression<String>? role,
    Expression<String>? description,
    Expression<String>? appearance,
    Expression<String>? personality,
    Expression<String>? goals,
    Expression<String>? conflicts,
    Expression<String>? secrets,
    Expression<String>? relationships,
    Expression<String>? firstAppearanceChapterId,
    Expression<String>? tags,
    Expression<String>? consistencyFacts,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (name != null) 'name': name,
      if (aliases != null) 'aliases': aliases,
      if (role != null) 'role': role,
      if (description != null) 'description': description,
      if (appearance != null) 'appearance': appearance,
      if (personality != null) 'personality': personality,
      if (goals != null) 'goals': goals,
      if (conflicts != null) 'conflicts': conflicts,
      if (secrets != null) 'secrets': secrets,
      if (relationships != null) 'relationships': relationships,
      if (firstAppearanceChapterId != null)
        'first_appearance_chapter_id': firstAppearanceChapterId,
      if (tags != null) 'tags': tags,
      if (consistencyFacts != null) 'consistency_facts': consistencyFacts,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CharactersTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? name,
      Value<String>? aliases,
      Value<String>? role,
      Value<String>? description,
      Value<String>? appearance,
      Value<String>? personality,
      Value<String>? goals,
      Value<String>? conflicts,
      Value<String>? secrets,
      Value<String>? relationships,
      Value<String?>? firstAppearanceChapterId,
      Value<String>? tags,
      Value<String>? consistencyFacts,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return CharactersTableCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      name: name ?? this.name,
      aliases: aliases ?? this.aliases,
      role: role ?? this.role,
      description: description ?? this.description,
      appearance: appearance ?? this.appearance,
      personality: personality ?? this.personality,
      goals: goals ?? this.goals,
      conflicts: conflicts ?? this.conflicts,
      secrets: secrets ?? this.secrets,
      relationships: relationships ?? this.relationships,
      firstAppearanceChapterId:
          firstAppearanceChapterId ?? this.firstAppearanceChapterId,
      tags: tags ?? this.tags,
      consistencyFacts: consistencyFacts ?? this.consistencyFacts,
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
    if (aliases.present) {
      map['aliases'] = Variable<String>(aliases.value);
    }
    if (role.present) {
      map['role'] = Variable<String>(role.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
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
    if (relationships.present) {
      map['relationships'] = Variable<String>(relationships.value);
    }
    if (firstAppearanceChapterId.present) {
      map['first_appearance_chapter_id'] =
          Variable<String>(firstAppearanceChapterId.value);
    }
    if (tags.present) {
      map['tags'] = Variable<String>(tags.value);
    }
    if (consistencyFacts.present) {
      map['consistency_facts'] = Variable<String>(consistencyFacts.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
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
    return (StringBuffer('CharactersTableCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('name: $name, ')
          ..write('aliases: $aliases, ')
          ..write('role: $role, ')
          ..write('description: $description, ')
          ..write('appearance: $appearance, ')
          ..write('personality: $personality, ')
          ..write('goals: $goals, ')
          ..write('conflicts: $conflicts, ')
          ..write('secrets: $secrets, ')
          ..write('relationships: $relationships, ')
          ..write('firstAppearanceChapterId: $firstAppearanceChapterId, ')
          ..write('tags: $tags, ')
          ..write('consistencyFacts: $consistencyFacts, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $NotesTableTable extends NotesTable
    with TableInfo<$NotesTableTable, NotesTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $NotesTableTable(this.attachedDatabase, [this._alias]);
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
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _typeMeta = const VerificationMeta('type');
  @override
  late final GeneratedColumn<String> type = GeneratedColumn<String>(
      'type', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('idea'));
  static const VerificationMeta _sourceUrlMeta =
      const VerificationMeta('sourceUrl');
  @override
  late final GeneratedColumn<String> sourceUrl = GeneratedColumn<String>(
      'source_url', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _agentTaskIdMeta =
      const VerificationMeta('agentTaskId');
  @override
  late final GeneratedColumn<String> agentTaskId = GeneratedColumn<String>(
      'agent_task_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _tagsMeta = const VerificationMeta('tags');
  @override
  late final GeneratedColumn<String> tags = GeneratedColumn<String>(
      'tags', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
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
        type,
        sourceUrl,
        agentTaskId,
        tags,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'notes_table';
  @override
  VerificationContext validateIntegrity(Insertable<NotesTableData> instance,
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
    }
    if (data.containsKey('type')) {
      context.handle(
          _typeMeta, type.isAcceptableOrUnknown(data['type']!, _typeMeta));
    }
    if (data.containsKey('source_url')) {
      context.handle(_sourceUrlMeta,
          sourceUrl.isAcceptableOrUnknown(data['source_url']!, _sourceUrlMeta));
    }
    if (data.containsKey('agent_task_id')) {
      context.handle(
          _agentTaskIdMeta,
          agentTaskId.isAcceptableOrUnknown(
              data['agent_task_id']!, _agentTaskIdMeta));
    }
    if (data.containsKey('tags')) {
      context.handle(
          _tagsMeta, tags.isAcceptableOrUnknown(data['tags']!, _tagsMeta));
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
  NotesTableData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return NotesTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      content: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}content'])!,
      type: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}type'])!,
      sourceUrl: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}source_url']),
      agentTaskId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}agent_task_id']),
      tags: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}tags'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $NotesTableTable createAlias(String alias) {
    return $NotesTableTable(attachedDatabase, alias);
  }
}

class NotesTableData extends DataClass implements Insertable<NotesTableData> {
  final String id;
  final String projectId;
  final String title;
  final String content;
  final String type;
  final String? sourceUrl;
  final String? agentTaskId;
  final String tags;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int schemaVersion;
  const NotesTableData(
      {required this.id,
      required this.projectId,
      required this.title,
      required this.content,
      required this.type,
      this.sourceUrl,
      this.agentTaskId,
      required this.tags,
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
    map['type'] = Variable<String>(type);
    if (!nullToAbsent || sourceUrl != null) {
      map['source_url'] = Variable<String>(sourceUrl);
    }
    if (!nullToAbsent || agentTaskId != null) {
      map['agent_task_id'] = Variable<String>(agentTaskId);
    }
    map['tags'] = Variable<String>(tags);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  NotesTableCompanion toCompanion(bool nullToAbsent) {
    return NotesTableCompanion(
      id: Value(id),
      projectId: Value(projectId),
      title: Value(title),
      content: Value(content),
      type: Value(type),
      sourceUrl: sourceUrl == null && nullToAbsent
          ? const Value.absent()
          : Value(sourceUrl),
      agentTaskId: agentTaskId == null && nullToAbsent
          ? const Value.absent()
          : Value(agentTaskId),
      tags: Value(tags),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory NotesTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return NotesTableData(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      title: serializer.fromJson<String>(json['title']),
      content: serializer.fromJson<String>(json['content']),
      type: serializer.fromJson<String>(json['type']),
      sourceUrl: serializer.fromJson<String?>(json['sourceUrl']),
      agentTaskId: serializer.fromJson<String?>(json['agentTaskId']),
      tags: serializer.fromJson<String>(json['tags']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
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
      'type': serializer.toJson<String>(type),
      'sourceUrl': serializer.toJson<String?>(sourceUrl),
      'agentTaskId': serializer.toJson<String?>(agentTaskId),
      'tags': serializer.toJson<String>(tags),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  NotesTableData copyWith(
          {String? id,
          String? projectId,
          String? title,
          String? content,
          String? type,
          Value<String?> sourceUrl = const Value.absent(),
          Value<String?> agentTaskId = const Value.absent(),
          String? tags,
          DateTime? createdAt,
          DateTime? updatedAt,
          int? schemaVersion}) =>
      NotesTableData(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        title: title ?? this.title,
        content: content ?? this.content,
        type: type ?? this.type,
        sourceUrl: sourceUrl.present ? sourceUrl.value : this.sourceUrl,
        agentTaskId: agentTaskId.present ? agentTaskId.value : this.agentTaskId,
        tags: tags ?? this.tags,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  NotesTableData copyWithCompanion(NotesTableCompanion data) {
    return NotesTableData(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      title: data.title.present ? data.title.value : this.title,
      content: data.content.present ? data.content.value : this.content,
      type: data.type.present ? data.type.value : this.type,
      sourceUrl: data.sourceUrl.present ? data.sourceUrl.value : this.sourceUrl,
      agentTaskId:
          data.agentTaskId.present ? data.agentTaskId.value : this.agentTaskId,
      tags: data.tags.present ? data.tags.value : this.tags,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('NotesTableData(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('content: $content, ')
          ..write('type: $type, ')
          ..write('sourceUrl: $sourceUrl, ')
          ..write('agentTaskId: $agentTaskId, ')
          ..write('tags: $tags, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, projectId, title, content, type,
      sourceUrl, agentTaskId, tags, createdAt, updatedAt, schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is NotesTableData &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.title == this.title &&
          other.content == this.content &&
          other.type == this.type &&
          other.sourceUrl == this.sourceUrl &&
          other.agentTaskId == this.agentTaskId &&
          other.tags == this.tags &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class NotesTableCompanion extends UpdateCompanion<NotesTableData> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> title;
  final Value<String> content;
  final Value<String> type;
  final Value<String?> sourceUrl;
  final Value<String?> agentTaskId;
  final Value<String> tags;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const NotesTableCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.title = const Value.absent(),
    this.content = const Value.absent(),
    this.type = const Value.absent(),
    this.sourceUrl = const Value.absent(),
    this.agentTaskId = const Value.absent(),
    this.tags = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  NotesTableCompanion.insert({
    required String id,
    required String projectId,
    required String title,
    this.content = const Value.absent(),
    this.type = const Value.absent(),
    this.sourceUrl = const Value.absent(),
    this.agentTaskId = const Value.absent(),
    this.tags = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        title = Value(title),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<NotesTableData> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? title,
    Expression<String>? content,
    Expression<String>? type,
    Expression<String>? sourceUrl,
    Expression<String>? agentTaskId,
    Expression<String>? tags,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (title != null) 'title': title,
      if (content != null) 'content': content,
      if (type != null) 'type': type,
      if (sourceUrl != null) 'source_url': sourceUrl,
      if (agentTaskId != null) 'agent_task_id': agentTaskId,
      if (tags != null) 'tags': tags,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  NotesTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? title,
      Value<String>? content,
      Value<String>? type,
      Value<String?>? sourceUrl,
      Value<String?>? agentTaskId,
      Value<String>? tags,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return NotesTableCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      title: title ?? this.title,
      content: content ?? this.content,
      type: type ?? this.type,
      sourceUrl: sourceUrl ?? this.sourceUrl,
      agentTaskId: agentTaskId ?? this.agentTaskId,
      tags: tags ?? this.tags,
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
    if (type.present) {
      map['type'] = Variable<String>(type.value);
    }
    if (sourceUrl.present) {
      map['source_url'] = Variable<String>(sourceUrl.value);
    }
    if (agentTaskId.present) {
      map['agent_task_id'] = Variable<String>(agentTaskId.value);
    }
    if (tags.present) {
      map['tags'] = Variable<String>(tags.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
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
    return (StringBuffer('NotesTableCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('content: $content, ')
          ..write('type: $type, ')
          ..write('sourceUrl: $sourceUrl, ')
          ..write('agentTaskId: $agentTaskId, ')
          ..write('tags: $tags, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SessionsTableTable extends SessionsTable
    with TableInfo<$SessionsTableTable, SessionsTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SessionsTableTable(this.attachedDatabase, [this._alias]);
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
  static const VerificationMeta _stageMeta = const VerificationMeta('stage');
  @override
  late final GeneratedColumn<String> stage = GeneratedColumn<String>(
      'stage', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('writing'));
  static const VerificationMeta _parentSessionIdMeta =
      const VerificationMeta('parentSessionId');
  @override
  late final GeneratedColumn<String> parentSessionId = GeneratedColumn<String>(
      'parent_session_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _branchNameMeta =
      const VerificationMeta('branchName');
  @override
  late final GeneratedColumn<String> branchName = GeneratedColumn<String>(
      'branch_name', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _messagesMeta =
      const VerificationMeta('messages');
  @override
  late final GeneratedColumn<String> messages = GeneratedColumn<String>(
      'messages', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _contextSnapshotIdMeta =
      const VerificationMeta('contextSnapshotId');
  @override
  late final GeneratedColumn<String> contextSnapshotId =
      GeneratedColumn<String>('context_snapshot_id', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _archivedMeta =
      const VerificationMeta('archived');
  @override
  late final GeneratedColumn<bool> archived = GeneratedColumn<bool>(
      'archived', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("archived" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
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
        stage,
        parentSessionId,
        branchName,
        messages,
        contextSnapshotId,
        archived,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sessions_table';
  @override
  VerificationContext validateIntegrity(Insertable<SessionsTableData> instance,
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
    if (data.containsKey('stage')) {
      context.handle(
          _stageMeta, stage.isAcceptableOrUnknown(data['stage']!, _stageMeta));
    }
    if (data.containsKey('parent_session_id')) {
      context.handle(
          _parentSessionIdMeta,
          parentSessionId.isAcceptableOrUnknown(
              data['parent_session_id']!, _parentSessionIdMeta));
    }
    if (data.containsKey('branch_name')) {
      context.handle(
          _branchNameMeta,
          branchName.isAcceptableOrUnknown(
              data['branch_name']!, _branchNameMeta));
    }
    if (data.containsKey('messages')) {
      context.handle(_messagesMeta,
          messages.isAcceptableOrUnknown(data['messages']!, _messagesMeta));
    }
    if (data.containsKey('context_snapshot_id')) {
      context.handle(
          _contextSnapshotIdMeta,
          contextSnapshotId.isAcceptableOrUnknown(
              data['context_snapshot_id']!, _contextSnapshotIdMeta));
    }
    if (data.containsKey('archived')) {
      context.handle(_archivedMeta,
          archived.isAcceptableOrUnknown(data['archived']!, _archivedMeta));
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
  SessionsTableData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SessionsTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      stage: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}stage'])!,
      parentSessionId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}parent_session_id']),
      branchName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}branch_name']),
      messages: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}messages'])!,
      contextSnapshotId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}context_snapshot_id']),
      archived: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}archived'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $SessionsTableTable createAlias(String alias) {
    return $SessionsTableTable(attachedDatabase, alias);
  }
}

class SessionsTableData extends DataClass
    implements Insertable<SessionsTableData> {
  final String id;
  final String projectId;
  final String title;
  final String stage;
  final String? parentSessionId;
  final String? branchName;
  final String messages;
  final String? contextSnapshotId;
  final bool archived;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int schemaVersion;
  const SessionsTableData(
      {required this.id,
      required this.projectId,
      required this.title,
      required this.stage,
      this.parentSessionId,
      this.branchName,
      required this.messages,
      this.contextSnapshotId,
      required this.archived,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['title'] = Variable<String>(title);
    map['stage'] = Variable<String>(stage);
    if (!nullToAbsent || parentSessionId != null) {
      map['parent_session_id'] = Variable<String>(parentSessionId);
    }
    if (!nullToAbsent || branchName != null) {
      map['branch_name'] = Variable<String>(branchName);
    }
    map['messages'] = Variable<String>(messages);
    if (!nullToAbsent || contextSnapshotId != null) {
      map['context_snapshot_id'] = Variable<String>(contextSnapshotId);
    }
    map['archived'] = Variable<bool>(archived);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  SessionsTableCompanion toCompanion(bool nullToAbsent) {
    return SessionsTableCompanion(
      id: Value(id),
      projectId: Value(projectId),
      title: Value(title),
      stage: Value(stage),
      parentSessionId: parentSessionId == null && nullToAbsent
          ? const Value.absent()
          : Value(parentSessionId),
      branchName: branchName == null && nullToAbsent
          ? const Value.absent()
          : Value(branchName),
      messages: Value(messages),
      contextSnapshotId: contextSnapshotId == null && nullToAbsent
          ? const Value.absent()
          : Value(contextSnapshotId),
      archived: Value(archived),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory SessionsTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SessionsTableData(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      title: serializer.fromJson<String>(json['title']),
      stage: serializer.fromJson<String>(json['stage']),
      parentSessionId: serializer.fromJson<String?>(json['parentSessionId']),
      branchName: serializer.fromJson<String?>(json['branchName']),
      messages: serializer.fromJson<String>(json['messages']),
      contextSnapshotId:
          serializer.fromJson<String?>(json['contextSnapshotId']),
      archived: serializer.fromJson<bool>(json['archived']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
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
      'stage': serializer.toJson<String>(stage),
      'parentSessionId': serializer.toJson<String?>(parentSessionId),
      'branchName': serializer.toJson<String?>(branchName),
      'messages': serializer.toJson<String>(messages),
      'contextSnapshotId': serializer.toJson<String?>(contextSnapshotId),
      'archived': serializer.toJson<bool>(archived),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  SessionsTableData copyWith(
          {String? id,
          String? projectId,
          String? title,
          String? stage,
          Value<String?> parentSessionId = const Value.absent(),
          Value<String?> branchName = const Value.absent(),
          String? messages,
          Value<String?> contextSnapshotId = const Value.absent(),
          bool? archived,
          DateTime? createdAt,
          DateTime? updatedAt,
          int? schemaVersion}) =>
      SessionsTableData(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        title: title ?? this.title,
        stage: stage ?? this.stage,
        parentSessionId: parentSessionId.present
            ? parentSessionId.value
            : this.parentSessionId,
        branchName: branchName.present ? branchName.value : this.branchName,
        messages: messages ?? this.messages,
        contextSnapshotId: contextSnapshotId.present
            ? contextSnapshotId.value
            : this.contextSnapshotId,
        archived: archived ?? this.archived,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  SessionsTableData copyWithCompanion(SessionsTableCompanion data) {
    return SessionsTableData(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      title: data.title.present ? data.title.value : this.title,
      stage: data.stage.present ? data.stage.value : this.stage,
      parentSessionId: data.parentSessionId.present
          ? data.parentSessionId.value
          : this.parentSessionId,
      branchName:
          data.branchName.present ? data.branchName.value : this.branchName,
      messages: data.messages.present ? data.messages.value : this.messages,
      contextSnapshotId: data.contextSnapshotId.present
          ? data.contextSnapshotId.value
          : this.contextSnapshotId,
      archived: data.archived.present ? data.archived.value : this.archived,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SessionsTableData(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('stage: $stage, ')
          ..write('parentSessionId: $parentSessionId, ')
          ..write('branchName: $branchName, ')
          ..write('messages: $messages, ')
          ..write('contextSnapshotId: $contextSnapshotId, ')
          ..write('archived: $archived, ')
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
      title,
      stage,
      parentSessionId,
      branchName,
      messages,
      contextSnapshotId,
      archived,
      createdAt,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SessionsTableData &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.title == this.title &&
          other.stage == this.stage &&
          other.parentSessionId == this.parentSessionId &&
          other.branchName == this.branchName &&
          other.messages == this.messages &&
          other.contextSnapshotId == this.contextSnapshotId &&
          other.archived == this.archived &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class SessionsTableCompanion extends UpdateCompanion<SessionsTableData> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> title;
  final Value<String> stage;
  final Value<String?> parentSessionId;
  final Value<String?> branchName;
  final Value<String> messages;
  final Value<String?> contextSnapshotId;
  final Value<bool> archived;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const SessionsTableCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.title = const Value.absent(),
    this.stage = const Value.absent(),
    this.parentSessionId = const Value.absent(),
    this.branchName = const Value.absent(),
    this.messages = const Value.absent(),
    this.contextSnapshotId = const Value.absent(),
    this.archived = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SessionsTableCompanion.insert({
    required String id,
    required String projectId,
    required String title,
    this.stage = const Value.absent(),
    this.parentSessionId = const Value.absent(),
    this.branchName = const Value.absent(),
    this.messages = const Value.absent(),
    this.contextSnapshotId = const Value.absent(),
    this.archived = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        title = Value(title),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<SessionsTableData> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? title,
    Expression<String>? stage,
    Expression<String>? parentSessionId,
    Expression<String>? branchName,
    Expression<String>? messages,
    Expression<String>? contextSnapshotId,
    Expression<bool>? archived,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (title != null) 'title': title,
      if (stage != null) 'stage': stage,
      if (parentSessionId != null) 'parent_session_id': parentSessionId,
      if (branchName != null) 'branch_name': branchName,
      if (messages != null) 'messages': messages,
      if (contextSnapshotId != null) 'context_snapshot_id': contextSnapshotId,
      if (archived != null) 'archived': archived,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SessionsTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? title,
      Value<String>? stage,
      Value<String?>? parentSessionId,
      Value<String?>? branchName,
      Value<String>? messages,
      Value<String?>? contextSnapshotId,
      Value<bool>? archived,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return SessionsTableCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      title: title ?? this.title,
      stage: stage ?? this.stage,
      parentSessionId: parentSessionId ?? this.parentSessionId,
      branchName: branchName ?? this.branchName,
      messages: messages ?? this.messages,
      contextSnapshotId: contextSnapshotId ?? this.contextSnapshotId,
      archived: archived ?? this.archived,
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
    if (stage.present) {
      map['stage'] = Variable<String>(stage.value);
    }
    if (parentSessionId.present) {
      map['parent_session_id'] = Variable<String>(parentSessionId.value);
    }
    if (branchName.present) {
      map['branch_name'] = Variable<String>(branchName.value);
    }
    if (messages.present) {
      map['messages'] = Variable<String>(messages.value);
    }
    if (contextSnapshotId.present) {
      map['context_snapshot_id'] = Variable<String>(contextSnapshotId.value);
    }
    if (archived.present) {
      map['archived'] = Variable<bool>(archived.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
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
    return (StringBuffer('SessionsTableCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('title: $title, ')
          ..write('stage: $stage, ')
          ..write('parentSessionId: $parentSessionId, ')
          ..write('branchName: $branchName, ')
          ..write('messages: $messages, ')
          ..write('contextSnapshotId: $contextSnapshotId, ')
          ..write('archived: $archived, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SettingEntriesTableTable extends SettingEntriesTable
    with TableInfo<$SettingEntriesTableTable, SettingEntriesTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SettingEntriesTableTable(this.attachedDatabase, [this._alias]);
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
  static const VerificationMeta _categoryMeta =
      const VerificationMeta('category');
  @override
  late final GeneratedColumn<String> category = GeneratedColumn<String>(
      'category', aliasedName, false,
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
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _tagsMeta = const VerificationMeta('tags');
  @override
  late final GeneratedColumn<String> tags = GeneratedColumn<String>(
      'tags', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
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
        category,
        title,
        content,
        tags,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'setting_entries_table';
  @override
  VerificationContext validateIntegrity(
      Insertable<SettingEntriesTableData> instance,
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
    if (data.containsKey('category')) {
      context.handle(_categoryMeta,
          category.isAcceptableOrUnknown(data['category']!, _categoryMeta));
    } else if (isInserting) {
      context.missing(_categoryMeta);
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
    }
    if (data.containsKey('tags')) {
      context.handle(
          _tagsMeta, tags.isAcceptableOrUnknown(data['tags']!, _tagsMeta));
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
  SettingEntriesTableData map(Map<String, dynamic> data,
      {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SettingEntriesTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      category: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}category'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      content: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}content'])!,
      tags: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}tags'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $SettingEntriesTableTable createAlias(String alias) {
    return $SettingEntriesTableTable(attachedDatabase, alias);
  }
}

class SettingEntriesTableData extends DataClass
    implements Insertable<SettingEntriesTableData> {
  final String id;
  final String projectId;
  final String category;
  final String title;
  final String content;
  final String tags;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int schemaVersion;
  const SettingEntriesTableData(
      {required this.id,
      required this.projectId,
      required this.category,
      required this.title,
      required this.content,
      required this.tags,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['category'] = Variable<String>(category);
    map['title'] = Variable<String>(title);
    map['content'] = Variable<String>(content);
    map['tags'] = Variable<String>(tags);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  SettingEntriesTableCompanion toCompanion(bool nullToAbsent) {
    return SettingEntriesTableCompanion(
      id: Value(id),
      projectId: Value(projectId),
      category: Value(category),
      title: Value(title),
      content: Value(content),
      tags: Value(tags),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory SettingEntriesTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SettingEntriesTableData(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      category: serializer.fromJson<String>(json['category']),
      title: serializer.fromJson<String>(json['title']),
      content: serializer.fromJson<String>(json['content']),
      tags: serializer.fromJson<String>(json['tags']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'category': serializer.toJson<String>(category),
      'title': serializer.toJson<String>(title),
      'content': serializer.toJson<String>(content),
      'tags': serializer.toJson<String>(tags),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  SettingEntriesTableData copyWith(
          {String? id,
          String? projectId,
          String? category,
          String? title,
          String? content,
          String? tags,
          DateTime? createdAt,
          DateTime? updatedAt,
          int? schemaVersion}) =>
      SettingEntriesTableData(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        category: category ?? this.category,
        title: title ?? this.title,
        content: content ?? this.content,
        tags: tags ?? this.tags,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  SettingEntriesTableData copyWithCompanion(SettingEntriesTableCompanion data) {
    return SettingEntriesTableData(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      category: data.category.present ? data.category.value : this.category,
      title: data.title.present ? data.title.value : this.title,
      content: data.content.present ? data.content.value : this.content,
      tags: data.tags.present ? data.tags.value : this.tags,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SettingEntriesTableData(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('category: $category, ')
          ..write('title: $title, ')
          ..write('content: $content, ')
          ..write('tags: $tags, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, projectId, category, title, content, tags,
      createdAt, updatedAt, schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SettingEntriesTableData &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.category == this.category &&
          other.title == this.title &&
          other.content == this.content &&
          other.tags == this.tags &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class SettingEntriesTableCompanion
    extends UpdateCompanion<SettingEntriesTableData> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> category;
  final Value<String> title;
  final Value<String> content;
  final Value<String> tags;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const SettingEntriesTableCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.category = const Value.absent(),
    this.title = const Value.absent(),
    this.content = const Value.absent(),
    this.tags = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SettingEntriesTableCompanion.insert({
    required String id,
    required String projectId,
    required String category,
    required String title,
    this.content = const Value.absent(),
    this.tags = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        category = Value(category),
        title = Value(title),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<SettingEntriesTableData> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? category,
    Expression<String>? title,
    Expression<String>? content,
    Expression<String>? tags,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (category != null) 'category': category,
      if (title != null) 'title': title,
      if (content != null) 'content': content,
      if (tags != null) 'tags': tags,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SettingEntriesTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? category,
      Value<String>? title,
      Value<String>? content,
      Value<String>? tags,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return SettingEntriesTableCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      category: category ?? this.category,
      title: title ?? this.title,
      content: content ?? this.content,
      tags: tags ?? this.tags,
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
    if (category.present) {
      map['category'] = Variable<String>(category.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (content.present) {
      map['content'] = Variable<String>(content.value);
    }
    if (tags.present) {
      map['tags'] = Variable<String>(tags.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
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
    return (StringBuffer('SettingEntriesTableCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('category: $category, ')
          ..write('title: $title, ')
          ..write('content: $content, ')
          ..write('tags: $tags, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $AgentTasksTableTable extends AgentTasksTable
    with TableInfo<$AgentTasksTableTable, AgentTasksTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AgentTasksTableTable(this.attachedDatabase, [this._alias]);
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
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('created'));
  static const VerificationMeta _inputJsonMeta =
      const VerificationMeta('inputJson');
  @override
  late final GeneratedColumn<String> inputJson = GeneratedColumn<String>(
      'input_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _outputJsonMeta =
      const VerificationMeta('outputJson');
  @override
  late final GeneratedColumn<String> outputJson = GeneratedColumn<String>(
      'output_json', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _modelMeta = const VerificationMeta('model');
  @override
  late final GeneratedColumn<String> model = GeneratedColumn<String>(
      'model', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _tokenUsageMeta =
      const VerificationMeta('tokenUsage');
  @override
  late final GeneratedColumn<String> tokenUsage = GeneratedColumn<String>(
      'token_usage', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _errorMeta = const VerificationMeta('error');
  @override
  late final GeneratedColumn<String> error = GeneratedColumn<String>(
      'error', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _sideEffectsMeta =
      const VerificationMeta('sideEffects');
  @override
  late final GeneratedColumn<String> sideEffects = GeneratedColumn<String>(
      'side_effects', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('[]'));
  static const VerificationMeta _startedAtMeta =
      const VerificationMeta('startedAt');
  @override
  late final GeneratedColumn<DateTime> startedAt = GeneratedColumn<DateTime>(
      'started_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _completedAtMeta =
      const VerificationMeta('completedAt');
  @override
  late final GeneratedColumn<DateTime> completedAt = GeneratedColumn<DateTime>(
      'completed_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
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
        taskType,
        status,
        inputJson,
        outputJson,
        model,
        tokenUsage,
        error,
        sideEffects,
        startedAt,
        completedAt,
        createdAt,
        updatedAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'agent_tasks_table';
  @override
  VerificationContext validateIntegrity(
      Insertable<AgentTasksTableData> instance,
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
    }
    if (data.containsKey('input_json')) {
      context.handle(_inputJsonMeta,
          inputJson.isAcceptableOrUnknown(data['input_json']!, _inputJsonMeta));
    }
    if (data.containsKey('output_json')) {
      context.handle(
          _outputJsonMeta,
          outputJson.isAcceptableOrUnknown(
              data['output_json']!, _outputJsonMeta));
    }
    if (data.containsKey('model')) {
      context.handle(
          _modelMeta, model.isAcceptableOrUnknown(data['model']!, _modelMeta));
    }
    if (data.containsKey('token_usage')) {
      context.handle(
          _tokenUsageMeta,
          tokenUsage.isAcceptableOrUnknown(
              data['token_usage']!, _tokenUsageMeta));
    }
    if (data.containsKey('error')) {
      context.handle(
          _errorMeta, error.isAcceptableOrUnknown(data['error']!, _errorMeta));
    }
    if (data.containsKey('side_effects')) {
      context.handle(
          _sideEffectsMeta,
          sideEffects.isAcceptableOrUnknown(
              data['side_effects']!, _sideEffectsMeta));
    }
    if (data.containsKey('started_at')) {
      context.handle(_startedAtMeta,
          startedAt.isAcceptableOrUnknown(data['started_at']!, _startedAtMeta));
    }
    if (data.containsKey('completed_at')) {
      context.handle(
          _completedAtMeta,
          completedAt.isAcceptableOrUnknown(
              data['completed_at']!, _completedAtMeta));
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
  AgentTasksTableData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AgentTasksTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      taskType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}task_type'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      inputJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}input_json'])!,
      outputJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}output_json'])!,
      model: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}model']),
      tokenUsage: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}token_usage']),
      error: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}error']),
      sideEffects: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}side_effects'])!,
      startedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}started_at']),
      completedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}completed_at']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $AgentTasksTableTable createAlias(String alias) {
    return $AgentTasksTableTable(attachedDatabase, alias);
  }
}

class AgentTasksTableData extends DataClass
    implements Insertable<AgentTasksTableData> {
  final String id;
  final String projectId;
  final String taskType;
  final String status;
  final String inputJson;
  final String outputJson;
  final String? model;
  final String? tokenUsage;
  final String? error;
  final String sideEffects;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int schemaVersion;
  const AgentTasksTableData(
      {required this.id,
      required this.projectId,
      required this.taskType,
      required this.status,
      required this.inputJson,
      required this.outputJson,
      this.model,
      this.tokenUsage,
      this.error,
      required this.sideEffects,
      this.startedAt,
      this.completedAt,
      required this.createdAt,
      required this.updatedAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['task_type'] = Variable<String>(taskType);
    map['status'] = Variable<String>(status);
    map['input_json'] = Variable<String>(inputJson);
    map['output_json'] = Variable<String>(outputJson);
    if (!nullToAbsent || model != null) {
      map['model'] = Variable<String>(model);
    }
    if (!nullToAbsent || tokenUsage != null) {
      map['token_usage'] = Variable<String>(tokenUsage);
    }
    if (!nullToAbsent || error != null) {
      map['error'] = Variable<String>(error);
    }
    map['side_effects'] = Variable<String>(sideEffects);
    if (!nullToAbsent || startedAt != null) {
      map['started_at'] = Variable<DateTime>(startedAt);
    }
    if (!nullToAbsent || completedAt != null) {
      map['completed_at'] = Variable<DateTime>(completedAt);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  AgentTasksTableCompanion toCompanion(bool nullToAbsent) {
    return AgentTasksTableCompanion(
      id: Value(id),
      projectId: Value(projectId),
      taskType: Value(taskType),
      status: Value(status),
      inputJson: Value(inputJson),
      outputJson: Value(outputJson),
      model:
          model == null && nullToAbsent ? const Value.absent() : Value(model),
      tokenUsage: tokenUsage == null && nullToAbsent
          ? const Value.absent()
          : Value(tokenUsage),
      error:
          error == null && nullToAbsent ? const Value.absent() : Value(error),
      sideEffects: Value(sideEffects),
      startedAt: startedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(startedAt),
      completedAt: completedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(completedAt),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory AgentTasksTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AgentTasksTableData(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      taskType: serializer.fromJson<String>(json['taskType']),
      status: serializer.fromJson<String>(json['status']),
      inputJson: serializer.fromJson<String>(json['inputJson']),
      outputJson: serializer.fromJson<String>(json['outputJson']),
      model: serializer.fromJson<String?>(json['model']),
      tokenUsage: serializer.fromJson<String?>(json['tokenUsage']),
      error: serializer.fromJson<String?>(json['error']),
      sideEffects: serializer.fromJson<String>(json['sideEffects']),
      startedAt: serializer.fromJson<DateTime?>(json['startedAt']),
      completedAt: serializer.fromJson<DateTime?>(json['completedAt']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
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
      'inputJson': serializer.toJson<String>(inputJson),
      'outputJson': serializer.toJson<String>(outputJson),
      'model': serializer.toJson<String?>(model),
      'tokenUsage': serializer.toJson<String?>(tokenUsage),
      'error': serializer.toJson<String?>(error),
      'sideEffects': serializer.toJson<String>(sideEffects),
      'startedAt': serializer.toJson<DateTime?>(startedAt),
      'completedAt': serializer.toJson<DateTime?>(completedAt),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  AgentTasksTableData copyWith(
          {String? id,
          String? projectId,
          String? taskType,
          String? status,
          String? inputJson,
          String? outputJson,
          Value<String?> model = const Value.absent(),
          Value<String?> tokenUsage = const Value.absent(),
          Value<String?> error = const Value.absent(),
          String? sideEffects,
          Value<DateTime?> startedAt = const Value.absent(),
          Value<DateTime?> completedAt = const Value.absent(),
          DateTime? createdAt,
          DateTime? updatedAt,
          int? schemaVersion}) =>
      AgentTasksTableData(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        taskType: taskType ?? this.taskType,
        status: status ?? this.status,
        inputJson: inputJson ?? this.inputJson,
        outputJson: outputJson ?? this.outputJson,
        model: model.present ? model.value : this.model,
        tokenUsage: tokenUsage.present ? tokenUsage.value : this.tokenUsage,
        error: error.present ? error.value : this.error,
        sideEffects: sideEffects ?? this.sideEffects,
        startedAt: startedAt.present ? startedAt.value : this.startedAt,
        completedAt: completedAt.present ? completedAt.value : this.completedAt,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  AgentTasksTableData copyWithCompanion(AgentTasksTableCompanion data) {
    return AgentTasksTableData(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      taskType: data.taskType.present ? data.taskType.value : this.taskType,
      status: data.status.present ? data.status.value : this.status,
      inputJson: data.inputJson.present ? data.inputJson.value : this.inputJson,
      outputJson:
          data.outputJson.present ? data.outputJson.value : this.outputJson,
      model: data.model.present ? data.model.value : this.model,
      tokenUsage:
          data.tokenUsage.present ? data.tokenUsage.value : this.tokenUsage,
      error: data.error.present ? data.error.value : this.error,
      sideEffects:
          data.sideEffects.present ? data.sideEffects.value : this.sideEffects,
      startedAt: data.startedAt.present ? data.startedAt.value : this.startedAt,
      completedAt:
          data.completedAt.present ? data.completedAt.value : this.completedAt,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AgentTasksTableData(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('taskType: $taskType, ')
          ..write('status: $status, ')
          ..write('inputJson: $inputJson, ')
          ..write('outputJson: $outputJson, ')
          ..write('model: $model, ')
          ..write('tokenUsage: $tokenUsage, ')
          ..write('error: $error, ')
          ..write('sideEffects: $sideEffects, ')
          ..write('startedAt: $startedAt, ')
          ..write('completedAt: $completedAt, ')
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
      taskType,
      status,
      inputJson,
      outputJson,
      model,
      tokenUsage,
      error,
      sideEffects,
      startedAt,
      completedAt,
      createdAt,
      updatedAt,
      schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AgentTasksTableData &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.taskType == this.taskType &&
          other.status == this.status &&
          other.inputJson == this.inputJson &&
          other.outputJson == this.outputJson &&
          other.model == this.model &&
          other.tokenUsage == this.tokenUsage &&
          other.error == this.error &&
          other.sideEffects == this.sideEffects &&
          other.startedAt == this.startedAt &&
          other.completedAt == this.completedAt &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt &&
          other.schemaVersion == this.schemaVersion);
}

class AgentTasksTableCompanion extends UpdateCompanion<AgentTasksTableData> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> taskType;
  final Value<String> status;
  final Value<String> inputJson;
  final Value<String> outputJson;
  final Value<String?> model;
  final Value<String?> tokenUsage;
  final Value<String?> error;
  final Value<String> sideEffects;
  final Value<DateTime?> startedAt;
  final Value<DateTime?> completedAt;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const AgentTasksTableCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.taskType = const Value.absent(),
    this.status = const Value.absent(),
    this.inputJson = const Value.absent(),
    this.outputJson = const Value.absent(),
    this.model = const Value.absent(),
    this.tokenUsage = const Value.absent(),
    this.error = const Value.absent(),
    this.sideEffects = const Value.absent(),
    this.startedAt = const Value.absent(),
    this.completedAt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  AgentTasksTableCompanion.insert({
    required String id,
    required String projectId,
    required String taskType,
    this.status = const Value.absent(),
    this.inputJson = const Value.absent(),
    this.outputJson = const Value.absent(),
    this.model = const Value.absent(),
    this.tokenUsage = const Value.absent(),
    this.error = const Value.absent(),
    this.sideEffects = const Value.absent(),
    this.startedAt = const Value.absent(),
    this.completedAt = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        taskType = Value(taskType),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<AgentTasksTableData> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? taskType,
    Expression<String>? status,
    Expression<String>? inputJson,
    Expression<String>? outputJson,
    Expression<String>? model,
    Expression<String>? tokenUsage,
    Expression<String>? error,
    Expression<String>? sideEffects,
    Expression<DateTime>? startedAt,
    Expression<DateTime>? completedAt,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (taskType != null) 'task_type': taskType,
      if (status != null) 'status': status,
      if (inputJson != null) 'input_json': inputJson,
      if (outputJson != null) 'output_json': outputJson,
      if (model != null) 'model': model,
      if (tokenUsage != null) 'token_usage': tokenUsage,
      if (error != null) 'error': error,
      if (sideEffects != null) 'side_effects': sideEffects,
      if (startedAt != null) 'started_at': startedAt,
      if (completedAt != null) 'completed_at': completedAt,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  AgentTasksTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? taskType,
      Value<String>? status,
      Value<String>? inputJson,
      Value<String>? outputJson,
      Value<String?>? model,
      Value<String?>? tokenUsage,
      Value<String?>? error,
      Value<String>? sideEffects,
      Value<DateTime?>? startedAt,
      Value<DateTime?>? completedAt,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return AgentTasksTableCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      taskType: taskType ?? this.taskType,
      status: status ?? this.status,
      inputJson: inputJson ?? this.inputJson,
      outputJson: outputJson ?? this.outputJson,
      model: model ?? this.model,
      tokenUsage: tokenUsage ?? this.tokenUsage,
      error: error ?? this.error,
      sideEffects: sideEffects ?? this.sideEffects,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
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
    if (taskType.present) {
      map['task_type'] = Variable<String>(taskType.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (inputJson.present) {
      map['input_json'] = Variable<String>(inputJson.value);
    }
    if (outputJson.present) {
      map['output_json'] = Variable<String>(outputJson.value);
    }
    if (model.present) {
      map['model'] = Variable<String>(model.value);
    }
    if (tokenUsage.present) {
      map['token_usage'] = Variable<String>(tokenUsage.value);
    }
    if (error.present) {
      map['error'] = Variable<String>(error.value);
    }
    if (sideEffects.present) {
      map['side_effects'] = Variable<String>(sideEffects.value);
    }
    if (startedAt.present) {
      map['started_at'] = Variable<DateTime>(startedAt.value);
    }
    if (completedAt.present) {
      map['completed_at'] = Variable<DateTime>(completedAt.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
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
    return (StringBuffer('AgentTasksTableCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('taskType: $taskType, ')
          ..write('status: $status, ')
          ..write('inputJson: $inputJson, ')
          ..write('outputJson: $outputJson, ')
          ..write('model: $model, ')
          ..write('tokenUsage: $tokenUsage, ')
          ..write('error: $error, ')
          ..write('sideEffects: $sideEffects, ')
          ..write('startedAt: $startedAt, ')
          ..write('completedAt: $completedAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SnapshotsTableTable extends SnapshotsTable
    with TableInfo<$SnapshotsTableTable, SnapshotsTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SnapshotsTableTable(this.attachedDatabase, [this._alias]);
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
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _triggerMeta =
      const VerificationMeta('trigger');
  @override
  late final GeneratedColumn<String> trigger = GeneratedColumn<String>(
      'trigger', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('manual'));
  static const VerificationMeta _dataSnapshotMeta =
      const VerificationMeta('dataSnapshot');
  @override
  late final GeneratedColumn<String> dataSnapshot = GeneratedColumn<String>(
      'data_snapshot', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
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
        description,
        trigger,
        dataSnapshot,
        createdAt,
        schemaVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'snapshots_table';
  @override
  VerificationContext validateIntegrity(Insertable<SnapshotsTableData> instance,
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
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    } else if (isInserting) {
      context.missing(_descriptionMeta);
    }
    if (data.containsKey('trigger')) {
      context.handle(_triggerMeta,
          trigger.isAcceptableOrUnknown(data['trigger']!, _triggerMeta));
    }
    if (data.containsKey('data_snapshot')) {
      context.handle(
          _dataSnapshotMeta,
          dataSnapshot.isAcceptableOrUnknown(
              data['data_snapshot']!, _dataSnapshotMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
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
  SnapshotsTableData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SnapshotsTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      projectId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}project_id'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description'])!,
      trigger: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}trigger'])!,
      dataSnapshot: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}data_snapshot'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      schemaVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}schema_version'])!,
    );
  }

  @override
  $SnapshotsTableTable createAlias(String alias) {
    return $SnapshotsTableTable(attachedDatabase, alias);
  }
}

class SnapshotsTableData extends DataClass
    implements Insertable<SnapshotsTableData> {
  final String id;
  final String projectId;
  final String description;
  final String trigger;
  final String dataSnapshot;
  final DateTime createdAt;
  final int schemaVersion;
  const SnapshotsTableData(
      {required this.id,
      required this.projectId,
      required this.description,
      required this.trigger,
      required this.dataSnapshot,
      required this.createdAt,
      required this.schemaVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['project_id'] = Variable<String>(projectId);
    map['description'] = Variable<String>(description);
    map['trigger'] = Variable<String>(trigger);
    map['data_snapshot'] = Variable<String>(dataSnapshot);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['schema_version'] = Variable<int>(schemaVersion);
    return map;
  }

  SnapshotsTableCompanion toCompanion(bool nullToAbsent) {
    return SnapshotsTableCompanion(
      id: Value(id),
      projectId: Value(projectId),
      description: Value(description),
      trigger: Value(trigger),
      dataSnapshot: Value(dataSnapshot),
      createdAt: Value(createdAt),
      schemaVersion: Value(schemaVersion),
    );
  }

  factory SnapshotsTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SnapshotsTableData(
      id: serializer.fromJson<String>(json['id']),
      projectId: serializer.fromJson<String>(json['projectId']),
      description: serializer.fromJson<String>(json['description']),
      trigger: serializer.fromJson<String>(json['trigger']),
      dataSnapshot: serializer.fromJson<String>(json['dataSnapshot']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      schemaVersion: serializer.fromJson<int>(json['schemaVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'projectId': serializer.toJson<String>(projectId),
      'description': serializer.toJson<String>(description),
      'trigger': serializer.toJson<String>(trigger),
      'dataSnapshot': serializer.toJson<String>(dataSnapshot),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'schemaVersion': serializer.toJson<int>(schemaVersion),
    };
  }

  SnapshotsTableData copyWith(
          {String? id,
          String? projectId,
          String? description,
          String? trigger,
          String? dataSnapshot,
          DateTime? createdAt,
          int? schemaVersion}) =>
      SnapshotsTableData(
        id: id ?? this.id,
        projectId: projectId ?? this.projectId,
        description: description ?? this.description,
        trigger: trigger ?? this.trigger,
        dataSnapshot: dataSnapshot ?? this.dataSnapshot,
        createdAt: createdAt ?? this.createdAt,
        schemaVersion: schemaVersion ?? this.schemaVersion,
      );
  SnapshotsTableData copyWithCompanion(SnapshotsTableCompanion data) {
    return SnapshotsTableData(
      id: data.id.present ? data.id.value : this.id,
      projectId: data.projectId.present ? data.projectId.value : this.projectId,
      description:
          data.description.present ? data.description.value : this.description,
      trigger: data.trigger.present ? data.trigger.value : this.trigger,
      dataSnapshot: data.dataSnapshot.present
          ? data.dataSnapshot.value
          : this.dataSnapshot,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      schemaVersion: data.schemaVersion.present
          ? data.schemaVersion.value
          : this.schemaVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SnapshotsTableData(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('description: $description, ')
          ..write('trigger: $trigger, ')
          ..write('dataSnapshot: $dataSnapshot, ')
          ..write('createdAt: $createdAt, ')
          ..write('schemaVersion: $schemaVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, projectId, description, trigger,
      dataSnapshot, createdAt, schemaVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SnapshotsTableData &&
          other.id == this.id &&
          other.projectId == this.projectId &&
          other.description == this.description &&
          other.trigger == this.trigger &&
          other.dataSnapshot == this.dataSnapshot &&
          other.createdAt == this.createdAt &&
          other.schemaVersion == this.schemaVersion);
}

class SnapshotsTableCompanion extends UpdateCompanion<SnapshotsTableData> {
  final Value<String> id;
  final Value<String> projectId;
  final Value<String> description;
  final Value<String> trigger;
  final Value<String> dataSnapshot;
  final Value<DateTime> createdAt;
  final Value<int> schemaVersion;
  final Value<int> rowid;
  const SnapshotsTableCompanion({
    this.id = const Value.absent(),
    this.projectId = const Value.absent(),
    this.description = const Value.absent(),
    this.trigger = const Value.absent(),
    this.dataSnapshot = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SnapshotsTableCompanion.insert({
    required String id,
    required String projectId,
    required String description,
    this.trigger = const Value.absent(),
    this.dataSnapshot = const Value.absent(),
    required DateTime createdAt,
    this.schemaVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        projectId = Value(projectId),
        description = Value(description),
        createdAt = Value(createdAt);
  static Insertable<SnapshotsTableData> custom({
    Expression<String>? id,
    Expression<String>? projectId,
    Expression<String>? description,
    Expression<String>? trigger,
    Expression<String>? dataSnapshot,
    Expression<DateTime>? createdAt,
    Expression<int>? schemaVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (projectId != null) 'project_id': projectId,
      if (description != null) 'description': description,
      if (trigger != null) 'trigger': trigger,
      if (dataSnapshot != null) 'data_snapshot': dataSnapshot,
      if (createdAt != null) 'created_at': createdAt,
      if (schemaVersion != null) 'schema_version': schemaVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SnapshotsTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? projectId,
      Value<String>? description,
      Value<String>? trigger,
      Value<String>? dataSnapshot,
      Value<DateTime>? createdAt,
      Value<int>? schemaVersion,
      Value<int>? rowid}) {
    return SnapshotsTableCompanion(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      description: description ?? this.description,
      trigger: trigger ?? this.trigger,
      dataSnapshot: dataSnapshot ?? this.dataSnapshot,
      createdAt: createdAt ?? this.createdAt,
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
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (trigger.present) {
      map['trigger'] = Variable<String>(trigger.value);
    }
    if (dataSnapshot.present) {
      map['data_snapshot'] = Variable<String>(dataSnapshot.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
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
    return (StringBuffer('SnapshotsTableCompanion(')
          ..write('id: $id, ')
          ..write('projectId: $projectId, ')
          ..write('description: $description, ')
          ..write('trigger: $trigger, ')
          ..write('dataSnapshot: $dataSnapshot, ')
          ..write('createdAt: $createdAt, ')
          ..write('schemaVersion: $schemaVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $LlmProvidersTableTable extends LlmProvidersTable
    with TableInfo<$LlmProvidersTableTable, LlmProvidersTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LlmProvidersTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _displayNameMeta =
      const VerificationMeta('displayName');
  @override
  late final GeneratedColumn<String> displayName = GeneratedColumn<String>(
      'display_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _baseUrlMeta =
      const VerificationMeta('baseUrl');
  @override
  late final GeneratedColumn<String> baseUrl = GeneratedColumn<String>(
      'base_url', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _defaultModelMeta =
      const VerificationMeta('defaultModel');
  @override
  late final GeneratedColumn<String> defaultModel = GeneratedColumn<String>(
      'default_model', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('gpt-4o-mini'));
  static const VerificationMeta _temperatureMeta =
      const VerificationMeta('temperature');
  @override
  late final GeneratedColumn<double> temperature = GeneratedColumn<double>(
      'temperature', aliasedName, false,
      type: DriftSqlType.double,
      requiredDuringInsert: false,
      defaultValue: const Constant(0.7));
  static const VerificationMeta _maxTokensMeta =
      const VerificationMeta('maxTokens');
  @override
  late final GeneratedColumn<int> maxTokens = GeneratedColumn<int>(
      'max_tokens', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(2048));
  static const VerificationMeta _enabledMeta =
      const VerificationMeta('enabled');
  @override
  late final GeneratedColumn<bool> enabled = GeneratedColumn<bool>(
      'enabled', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("enabled" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        displayName,
        baseUrl,
        defaultModel,
        temperature,
        maxTokens,
        enabled,
        createdAt,
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'llm_providers_table';
  @override
  VerificationContext validateIntegrity(
      Insertable<LlmProvidersTableData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('display_name')) {
      context.handle(
          _displayNameMeta,
          displayName.isAcceptableOrUnknown(
              data['display_name']!, _displayNameMeta));
    } else if (isInserting) {
      context.missing(_displayNameMeta);
    }
    if (data.containsKey('base_url')) {
      context.handle(_baseUrlMeta,
          baseUrl.isAcceptableOrUnknown(data['base_url']!, _baseUrlMeta));
    } else if (isInserting) {
      context.missing(_baseUrlMeta);
    }
    if (data.containsKey('default_model')) {
      context.handle(
          _defaultModelMeta,
          defaultModel.isAcceptableOrUnknown(
              data['default_model']!, _defaultModelMeta));
    }
    if (data.containsKey('temperature')) {
      context.handle(
          _temperatureMeta,
          temperature.isAcceptableOrUnknown(
              data['temperature']!, _temperatureMeta));
    }
    if (data.containsKey('max_tokens')) {
      context.handle(_maxTokensMeta,
          maxTokens.isAcceptableOrUnknown(data['max_tokens']!, _maxTokensMeta));
    }
    if (data.containsKey('enabled')) {
      context.handle(_enabledMeta,
          enabled.isAcceptableOrUnknown(data['enabled']!, _enabledMeta));
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
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LlmProvidersTableData map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LlmProvidersTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      displayName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}display_name'])!,
      baseUrl: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}base_url'])!,
      defaultModel: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}default_model'])!,
      temperature: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}temperature'])!,
      maxTokens: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}max_tokens'])!,
      enabled: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}enabled'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $LlmProvidersTableTable createAlias(String alias) {
    return $LlmProvidersTableTable(attachedDatabase, alias);
  }
}

class LlmProvidersTableData extends DataClass
    implements Insertable<LlmProvidersTableData> {
  final String id;
  final String displayName;
  final String baseUrl;
  final String defaultModel;
  final double temperature;
  final int maxTokens;
  final bool enabled;
  final DateTime createdAt;
  final DateTime updatedAt;
  const LlmProvidersTableData(
      {required this.id,
      required this.displayName,
      required this.baseUrl,
      required this.defaultModel,
      required this.temperature,
      required this.maxTokens,
      required this.enabled,
      required this.createdAt,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['display_name'] = Variable<String>(displayName);
    map['base_url'] = Variable<String>(baseUrl);
    map['default_model'] = Variable<String>(defaultModel);
    map['temperature'] = Variable<double>(temperature);
    map['max_tokens'] = Variable<int>(maxTokens);
    map['enabled'] = Variable<bool>(enabled);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  LlmProvidersTableCompanion toCompanion(bool nullToAbsent) {
    return LlmProvidersTableCompanion(
      id: Value(id),
      displayName: Value(displayName),
      baseUrl: Value(baseUrl),
      defaultModel: Value(defaultModel),
      temperature: Value(temperature),
      maxTokens: Value(maxTokens),
      enabled: Value(enabled),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory LlmProvidersTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LlmProvidersTableData(
      id: serializer.fromJson<String>(json['id']),
      displayName: serializer.fromJson<String>(json['displayName']),
      baseUrl: serializer.fromJson<String>(json['baseUrl']),
      defaultModel: serializer.fromJson<String>(json['defaultModel']),
      temperature: serializer.fromJson<double>(json['temperature']),
      maxTokens: serializer.fromJson<int>(json['maxTokens']),
      enabled: serializer.fromJson<bool>(json['enabled']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'displayName': serializer.toJson<String>(displayName),
      'baseUrl': serializer.toJson<String>(baseUrl),
      'defaultModel': serializer.toJson<String>(defaultModel),
      'temperature': serializer.toJson<double>(temperature),
      'maxTokens': serializer.toJson<int>(maxTokens),
      'enabled': serializer.toJson<bool>(enabled),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  LlmProvidersTableData copyWith(
          {String? id,
          String? displayName,
          String? baseUrl,
          String? defaultModel,
          double? temperature,
          int? maxTokens,
          bool? enabled,
          DateTime? createdAt,
          DateTime? updatedAt}) =>
      LlmProvidersTableData(
        id: id ?? this.id,
        displayName: displayName ?? this.displayName,
        baseUrl: baseUrl ?? this.baseUrl,
        defaultModel: defaultModel ?? this.defaultModel,
        temperature: temperature ?? this.temperature,
        maxTokens: maxTokens ?? this.maxTokens,
        enabled: enabled ?? this.enabled,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  LlmProvidersTableData copyWithCompanion(LlmProvidersTableCompanion data) {
    return LlmProvidersTableData(
      id: data.id.present ? data.id.value : this.id,
      displayName:
          data.displayName.present ? data.displayName.value : this.displayName,
      baseUrl: data.baseUrl.present ? data.baseUrl.value : this.baseUrl,
      defaultModel: data.defaultModel.present
          ? data.defaultModel.value
          : this.defaultModel,
      temperature:
          data.temperature.present ? data.temperature.value : this.temperature,
      maxTokens: data.maxTokens.present ? data.maxTokens.value : this.maxTokens,
      enabled: data.enabled.present ? data.enabled.value : this.enabled,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LlmProvidersTableData(')
          ..write('id: $id, ')
          ..write('displayName: $displayName, ')
          ..write('baseUrl: $baseUrl, ')
          ..write('defaultModel: $defaultModel, ')
          ..write('temperature: $temperature, ')
          ..write('maxTokens: $maxTokens, ')
          ..write('enabled: $enabled, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, displayName, baseUrl, defaultModel,
      temperature, maxTokens, enabled, createdAt, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LlmProvidersTableData &&
          other.id == this.id &&
          other.displayName == this.displayName &&
          other.baseUrl == this.baseUrl &&
          other.defaultModel == this.defaultModel &&
          other.temperature == this.temperature &&
          other.maxTokens == this.maxTokens &&
          other.enabled == this.enabled &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class LlmProvidersTableCompanion
    extends UpdateCompanion<LlmProvidersTableData> {
  final Value<String> id;
  final Value<String> displayName;
  final Value<String> baseUrl;
  final Value<String> defaultModel;
  final Value<double> temperature;
  final Value<int> maxTokens;
  final Value<bool> enabled;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const LlmProvidersTableCompanion({
    this.id = const Value.absent(),
    this.displayName = const Value.absent(),
    this.baseUrl = const Value.absent(),
    this.defaultModel = const Value.absent(),
    this.temperature = const Value.absent(),
    this.maxTokens = const Value.absent(),
    this.enabled = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LlmProvidersTableCompanion.insert({
    required String id,
    required String displayName,
    required String baseUrl,
    this.defaultModel = const Value.absent(),
    this.temperature = const Value.absent(),
    this.maxTokens = const Value.absent(),
    this.enabled = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        displayName = Value(displayName),
        baseUrl = Value(baseUrl),
        createdAt = Value(createdAt),
        updatedAt = Value(updatedAt);
  static Insertable<LlmProvidersTableData> custom({
    Expression<String>? id,
    Expression<String>? displayName,
    Expression<String>? baseUrl,
    Expression<String>? defaultModel,
    Expression<double>? temperature,
    Expression<int>? maxTokens,
    Expression<bool>? enabled,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (displayName != null) 'display_name': displayName,
      if (baseUrl != null) 'base_url': baseUrl,
      if (defaultModel != null) 'default_model': defaultModel,
      if (temperature != null) 'temperature': temperature,
      if (maxTokens != null) 'max_tokens': maxTokens,
      if (enabled != null) 'enabled': enabled,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LlmProvidersTableCompanion copyWith(
      {Value<String>? id,
      Value<String>? displayName,
      Value<String>? baseUrl,
      Value<String>? defaultModel,
      Value<double>? temperature,
      Value<int>? maxTokens,
      Value<bool>? enabled,
      Value<DateTime>? createdAt,
      Value<DateTime>? updatedAt,
      Value<int>? rowid}) {
    return LlmProvidersTableCompanion(
      id: id ?? this.id,
      displayName: displayName ?? this.displayName,
      baseUrl: baseUrl ?? this.baseUrl,
      defaultModel: defaultModel ?? this.defaultModel,
      temperature: temperature ?? this.temperature,
      maxTokens: maxTokens ?? this.maxTokens,
      enabled: enabled ?? this.enabled,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (displayName.present) {
      map['display_name'] = Variable<String>(displayName.value);
    }
    if (baseUrl.present) {
      map['base_url'] = Variable<String>(baseUrl.value);
    }
    if (defaultModel.present) {
      map['default_model'] = Variable<String>(defaultModel.value);
    }
    if (temperature.present) {
      map['temperature'] = Variable<double>(temperature.value);
    }
    if (maxTokens.present) {
      map['max_tokens'] = Variable<int>(maxTokens.value);
    }
    if (enabled.present) {
      map['enabled'] = Variable<bool>(enabled.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LlmProvidersTableCompanion(')
          ..write('id: $id, ')
          ..write('displayName: $displayName, ')
          ..write('baseUrl: $baseUrl, ')
          ..write('defaultModel: $defaultModel, ')
          ..write('temperature: $temperature, ')
          ..write('maxTokens: $maxTokens, ')
          ..write('enabled: $enabled, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $ProjectsTableTable projectsTable = $ProjectsTableTable(this);
  late final $ChaptersTableTable chaptersTable = $ChaptersTableTable(this);
  late final $RevisionsTableTable revisionsTable = $RevisionsTableTable(this);
  late final $OutlineNodesTableTable outlineNodesTable =
      $OutlineNodesTableTable(this);
  late final $CharactersTableTable charactersTable =
      $CharactersTableTable(this);
  late final $NotesTableTable notesTable = $NotesTableTable(this);
  late final $SessionsTableTable sessionsTable = $SessionsTableTable(this);
  late final $SettingEntriesTableTable settingEntriesTable =
      $SettingEntriesTableTable(this);
  late final $AgentTasksTableTable agentTasksTable =
      $AgentTasksTableTable(this);
  late final $SnapshotsTableTable snapshotsTable = $SnapshotsTableTable(this);
  late final $LlmProvidersTableTable llmProvidersTable =
      $LlmProvidersTableTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        projectsTable,
        chaptersTable,
        revisionsTable,
        outlineNodesTable,
        charactersTable,
        notesTable,
        sessionsTable,
        settingEntriesTable,
        agentTasksTable,
        snapshotsTable,
        llmProvidersTable
      ];
}

typedef $$ProjectsTableTableCreateCompanionBuilder = ProjectsTableCompanion
    Function({
  required String id,
  required String title,
  Value<String> author,
  Value<String> description,
  Value<String> language,
  Value<String> genre,
  Value<String> tags,
  Value<String?> defaultStyleProfileId,
  Value<String?> activeChapterId,
  Value<bool> localEncryptionEnabled,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$ProjectsTableTableUpdateCompanionBuilder = ProjectsTableCompanion
    Function({
  Value<String> id,
  Value<String> title,
  Value<String> author,
  Value<String> description,
  Value<String> language,
  Value<String> genre,
  Value<String> tags,
  Value<String?> defaultStyleProfileId,
  Value<String?> activeChapterId,
  Value<bool> localEncryptionEnabled,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$ProjectsTableTableFilterComposer
    extends Composer<_$AppDatabase, $ProjectsTableTable> {
  $$ProjectsTableTableFilterComposer({
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

  ColumnFilters<String> get author => $composableBuilder(
      column: $table.author, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get language => $composableBuilder(
      column: $table.language, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get genre => $composableBuilder(
      column: $table.genre, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tags => $composableBuilder(
      column: $table.tags, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get defaultStyleProfileId => $composableBuilder(
      column: $table.defaultStyleProfileId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get activeChapterId => $composableBuilder(
      column: $table.activeChapterId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get localEncryptionEnabled => $composableBuilder(
      column: $table.localEncryptionEnabled,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$ProjectsTableTableOrderingComposer
    extends Composer<_$AppDatabase, $ProjectsTableTable> {
  $$ProjectsTableTableOrderingComposer({
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

  ColumnOrderings<String> get author => $composableBuilder(
      column: $table.author, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get language => $composableBuilder(
      column: $table.language, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get genre => $composableBuilder(
      column: $table.genre, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tags => $composableBuilder(
      column: $table.tags, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get defaultStyleProfileId => $composableBuilder(
      column: $table.defaultStyleProfileId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get activeChapterId => $composableBuilder(
      column: $table.activeChapterId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get localEncryptionEnabled => $composableBuilder(
      column: $table.localEncryptionEnabled,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$ProjectsTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $ProjectsTableTable> {
  $$ProjectsTableTableAnnotationComposer({
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

  GeneratedColumn<String> get author =>
      $composableBuilder(column: $table.author, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  GeneratedColumn<String> get language =>
      $composableBuilder(column: $table.language, builder: (column) => column);

  GeneratedColumn<String> get genre =>
      $composableBuilder(column: $table.genre, builder: (column) => column);

  GeneratedColumn<String> get tags =>
      $composableBuilder(column: $table.tags, builder: (column) => column);

  GeneratedColumn<String> get defaultStyleProfileId => $composableBuilder(
      column: $table.defaultStyleProfileId, builder: (column) => column);

  GeneratedColumn<String> get activeChapterId => $composableBuilder(
      column: $table.activeChapterId, builder: (column) => column);

  GeneratedColumn<bool> get localEncryptionEnabled => $composableBuilder(
      column: $table.localEncryptionEnabled, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$ProjectsTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ProjectsTableTable,
    ProjectsTableData,
    $$ProjectsTableTableFilterComposer,
    $$ProjectsTableTableOrderingComposer,
    $$ProjectsTableTableAnnotationComposer,
    $$ProjectsTableTableCreateCompanionBuilder,
    $$ProjectsTableTableUpdateCompanionBuilder,
    (
      ProjectsTableData,
      BaseReferences<_$AppDatabase, $ProjectsTableTable, ProjectsTableData>
    ),
    ProjectsTableData,
    PrefetchHooks Function()> {
  $$ProjectsTableTableTableManager(_$AppDatabase db, $ProjectsTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ProjectsTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ProjectsTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ProjectsTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> author = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<String> language = const Value.absent(),
            Value<String> genre = const Value.absent(),
            Value<String> tags = const Value.absent(),
            Value<String?> defaultStyleProfileId = const Value.absent(),
            Value<String?> activeChapterId = const Value.absent(),
            Value<bool> localEncryptionEnabled = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ProjectsTableCompanion(
            id: id,
            title: title,
            author: author,
            description: description,
            language: language,
            genre: genre,
            tags: tags,
            defaultStyleProfileId: defaultStyleProfileId,
            activeChapterId: activeChapterId,
            localEncryptionEnabled: localEncryptionEnabled,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String title,
            Value<String> author = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<String> language = const Value.absent(),
            Value<String> genre = const Value.absent(),
            Value<String> tags = const Value.absent(),
            Value<String?> defaultStyleProfileId = const Value.absent(),
            Value<String?> activeChapterId = const Value.absent(),
            Value<bool> localEncryptionEnabled = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ProjectsTableCompanion.insert(
            id: id,
            title: title,
            author: author,
            description: description,
            language: language,
            genre: genre,
            tags: tags,
            defaultStyleProfileId: defaultStyleProfileId,
            activeChapterId: activeChapterId,
            localEncryptionEnabled: localEncryptionEnabled,
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

typedef $$ProjectsTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $ProjectsTableTable,
    ProjectsTableData,
    $$ProjectsTableTableFilterComposer,
    $$ProjectsTableTableOrderingComposer,
    $$ProjectsTableTableAnnotationComposer,
    $$ProjectsTableTableCreateCompanionBuilder,
    $$ProjectsTableTableUpdateCompanionBuilder,
    (
      ProjectsTableData,
      BaseReferences<_$AppDatabase, $ProjectsTableTable, ProjectsTableData>
    ),
    ProjectsTableData,
    PrefetchHooks Function()>;
typedef $$ChaptersTableTableCreateCompanionBuilder = ChaptersTableCompanion
    Function({
  required String id,
  required String projectId,
  Value<String?> outlineNodeId,
  required String title,
  required int orderIndex,
  Value<String> contentFormat,
  Value<String> content,
  Value<String> plainTextCache,
  Value<int> wordCount,
  Value<String> status,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$ChaptersTableTableUpdateCompanionBuilder = ChaptersTableCompanion
    Function({
  Value<String> id,
  Value<String> projectId,
  Value<String?> outlineNodeId,
  Value<String> title,
  Value<int> orderIndex,
  Value<String> contentFormat,
  Value<String> content,
  Value<String> plainTextCache,
  Value<int> wordCount,
  Value<String> status,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$ChaptersTableTableFilterComposer
    extends Composer<_$AppDatabase, $ChaptersTableTable> {
  $$ChaptersTableTableFilterComposer({
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

  ColumnFilters<String> get outlineNodeId => $composableBuilder(
      column: $table.outlineNodeId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get orderIndex => $composableBuilder(
      column: $table.orderIndex, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get contentFormat => $composableBuilder(
      column: $table.contentFormat, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get content => $composableBuilder(
      column: $table.content, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get plainTextCache => $composableBuilder(
      column: $table.plainTextCache,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get wordCount => $composableBuilder(
      column: $table.wordCount, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$ChaptersTableTableOrderingComposer
    extends Composer<_$AppDatabase, $ChaptersTableTable> {
  $$ChaptersTableTableOrderingComposer({
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

  ColumnOrderings<String> get outlineNodeId => $composableBuilder(
      column: $table.outlineNodeId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get orderIndex => $composableBuilder(
      column: $table.orderIndex, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get contentFormat => $composableBuilder(
      column: $table.contentFormat,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get content => $composableBuilder(
      column: $table.content, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get plainTextCache => $composableBuilder(
      column: $table.plainTextCache,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get wordCount => $composableBuilder(
      column: $table.wordCount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$ChaptersTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $ChaptersTableTable> {
  $$ChaptersTableTableAnnotationComposer({
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

  GeneratedColumn<String> get outlineNodeId => $composableBuilder(
      column: $table.outlineNodeId, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<int> get orderIndex => $composableBuilder(
      column: $table.orderIndex, builder: (column) => column);

  GeneratedColumn<String> get contentFormat => $composableBuilder(
      column: $table.contentFormat, builder: (column) => column);

  GeneratedColumn<String> get content =>
      $composableBuilder(column: $table.content, builder: (column) => column);

  GeneratedColumn<String> get plainTextCache => $composableBuilder(
      column: $table.plainTextCache, builder: (column) => column);

  GeneratedColumn<int> get wordCount =>
      $composableBuilder(column: $table.wordCount, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$ChaptersTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ChaptersTableTable,
    ChaptersTableData,
    $$ChaptersTableTableFilterComposer,
    $$ChaptersTableTableOrderingComposer,
    $$ChaptersTableTableAnnotationComposer,
    $$ChaptersTableTableCreateCompanionBuilder,
    $$ChaptersTableTableUpdateCompanionBuilder,
    (
      ChaptersTableData,
      BaseReferences<_$AppDatabase, $ChaptersTableTable, ChaptersTableData>
    ),
    ChaptersTableData,
    PrefetchHooks Function()> {
  $$ChaptersTableTableTableManager(_$AppDatabase db, $ChaptersTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ChaptersTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ChaptersTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ChaptersTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String?> outlineNodeId = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<int> orderIndex = const Value.absent(),
            Value<String> contentFormat = const Value.absent(),
            Value<String> content = const Value.absent(),
            Value<String> plainTextCache = const Value.absent(),
            Value<int> wordCount = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ChaptersTableCompanion(
            id: id,
            projectId: projectId,
            outlineNodeId: outlineNodeId,
            title: title,
            orderIndex: orderIndex,
            contentFormat: contentFormat,
            content: content,
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
            Value<String?> outlineNodeId = const Value.absent(),
            required String title,
            required int orderIndex,
            Value<String> contentFormat = const Value.absent(),
            Value<String> content = const Value.absent(),
            Value<String> plainTextCache = const Value.absent(),
            Value<int> wordCount = const Value.absent(),
            Value<String> status = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              ChaptersTableCompanion.insert(
            id: id,
            projectId: projectId,
            outlineNodeId: outlineNodeId,
            title: title,
            orderIndex: orderIndex,
            contentFormat: contentFormat,
            content: content,
            plainTextCache: plainTextCache,
            wordCount: wordCount,
            status: status,
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

typedef $$ChaptersTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $ChaptersTableTable,
    ChaptersTableData,
    $$ChaptersTableTableFilterComposer,
    $$ChaptersTableTableOrderingComposer,
    $$ChaptersTableTableAnnotationComposer,
    $$ChaptersTableTableCreateCompanionBuilder,
    $$ChaptersTableTableUpdateCompanionBuilder,
    (
      ChaptersTableData,
      BaseReferences<_$AppDatabase, $ChaptersTableTable, ChaptersTableData>
    ),
    ChaptersTableData,
    PrefetchHooks Function()>;
typedef $$RevisionsTableTableCreateCompanionBuilder = RevisionsTableCompanion
    Function({
  required String id,
  required String projectId,
  required String chapterId,
  required String operation,
  required String anchor,
  required String beforeText,
  required String afterText,
  Value<String> source,
  Value<String> status,
  Value<String?> metadata,
  Value<DateTime?> resolvedAt,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$RevisionsTableTableUpdateCompanionBuilder = RevisionsTableCompanion
    Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> chapterId,
  Value<String> operation,
  Value<String> anchor,
  Value<String> beforeText,
  Value<String> afterText,
  Value<String> source,
  Value<String> status,
  Value<String?> metadata,
  Value<DateTime?> resolvedAt,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$RevisionsTableTableFilterComposer
    extends Composer<_$AppDatabase, $RevisionsTableTable> {
  $$RevisionsTableTableFilterComposer({
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

  ColumnFilters<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get operation => $composableBuilder(
      column: $table.operation, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get anchor => $composableBuilder(
      column: $table.anchor, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get beforeText => $composableBuilder(
      column: $table.beforeText, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get afterText => $composableBuilder(
      column: $table.afterText, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get source => $composableBuilder(
      column: $table.source, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get metadata => $composableBuilder(
      column: $table.metadata, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get resolvedAt => $composableBuilder(
      column: $table.resolvedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$RevisionsTableTableOrderingComposer
    extends Composer<_$AppDatabase, $RevisionsTableTable> {
  $$RevisionsTableTableOrderingComposer({
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

  ColumnOrderings<String> get chapterId => $composableBuilder(
      column: $table.chapterId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get operation => $composableBuilder(
      column: $table.operation, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get anchor => $composableBuilder(
      column: $table.anchor, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get beforeText => $composableBuilder(
      column: $table.beforeText, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get afterText => $composableBuilder(
      column: $table.afterText, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get source => $composableBuilder(
      column: $table.source, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get metadata => $composableBuilder(
      column: $table.metadata, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get resolvedAt => $composableBuilder(
      column: $table.resolvedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$RevisionsTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $RevisionsTableTable> {
  $$RevisionsTableTableAnnotationComposer({
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

  GeneratedColumn<String> get chapterId =>
      $composableBuilder(column: $table.chapterId, builder: (column) => column);

  GeneratedColumn<String> get operation =>
      $composableBuilder(column: $table.operation, builder: (column) => column);

  GeneratedColumn<String> get anchor =>
      $composableBuilder(column: $table.anchor, builder: (column) => column);

  GeneratedColumn<String> get beforeText => $composableBuilder(
      column: $table.beforeText, builder: (column) => column);

  GeneratedColumn<String> get afterText =>
      $composableBuilder(column: $table.afterText, builder: (column) => column);

  GeneratedColumn<String> get source =>
      $composableBuilder(column: $table.source, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get metadata =>
      $composableBuilder(column: $table.metadata, builder: (column) => column);

  GeneratedColumn<DateTime> get resolvedAt => $composableBuilder(
      column: $table.resolvedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$RevisionsTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $RevisionsTableTable,
    RevisionsTableData,
    $$RevisionsTableTableFilterComposer,
    $$RevisionsTableTableOrderingComposer,
    $$RevisionsTableTableAnnotationComposer,
    $$RevisionsTableTableCreateCompanionBuilder,
    $$RevisionsTableTableUpdateCompanionBuilder,
    (
      RevisionsTableData,
      BaseReferences<_$AppDatabase, $RevisionsTableTable, RevisionsTableData>
    ),
    RevisionsTableData,
    PrefetchHooks Function()> {
  $$RevisionsTableTableTableManager(
      _$AppDatabase db, $RevisionsTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$RevisionsTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$RevisionsTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$RevisionsTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> chapterId = const Value.absent(),
            Value<String> operation = const Value.absent(),
            Value<String> anchor = const Value.absent(),
            Value<String> beforeText = const Value.absent(),
            Value<String> afterText = const Value.absent(),
            Value<String> source = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> metadata = const Value.absent(),
            Value<DateTime?> resolvedAt = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              RevisionsTableCompanion(
            id: id,
            projectId: projectId,
            chapterId: chapterId,
            operation: operation,
            anchor: anchor,
            beforeText: beforeText,
            afterText: afterText,
            source: source,
            status: status,
            metadata: metadata,
            resolvedAt: resolvedAt,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String chapterId,
            required String operation,
            required String anchor,
            required String beforeText,
            required String afterText,
            Value<String> source = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String?> metadata = const Value.absent(),
            Value<DateTime?> resolvedAt = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              RevisionsTableCompanion.insert(
            id: id,
            projectId: projectId,
            chapterId: chapterId,
            operation: operation,
            anchor: anchor,
            beforeText: beforeText,
            afterText: afterText,
            source: source,
            status: status,
            metadata: metadata,
            resolvedAt: resolvedAt,
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

typedef $$RevisionsTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $RevisionsTableTable,
    RevisionsTableData,
    $$RevisionsTableTableFilterComposer,
    $$RevisionsTableTableOrderingComposer,
    $$RevisionsTableTableAnnotationComposer,
    $$RevisionsTableTableCreateCompanionBuilder,
    $$RevisionsTableTableUpdateCompanionBuilder,
    (
      RevisionsTableData,
      BaseReferences<_$AppDatabase, $RevisionsTableTable, RevisionsTableData>
    ),
    RevisionsTableData,
    PrefetchHooks Function()>;
typedef $$OutlineNodesTableTableCreateCompanionBuilder
    = OutlineNodesTableCompanion Function({
  required String id,
  required String projectId,
  Value<String?> parentId,
  required int orderIndex,
  required String title,
  Value<String> nodeType,
  Value<String> summary,
  Value<String?> linkedChapterId,
  Value<String> status,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$OutlineNodesTableTableUpdateCompanionBuilder
    = OutlineNodesTableCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<String?> parentId,
  Value<int> orderIndex,
  Value<String> title,
  Value<String> nodeType,
  Value<String> summary,
  Value<String?> linkedChapterId,
  Value<String> status,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$OutlineNodesTableTableFilterComposer
    extends Composer<_$AppDatabase, $OutlineNodesTableTable> {
  $$OutlineNodesTableTableFilterComposer({
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

  ColumnFilters<String> get parentId => $composableBuilder(
      column: $table.parentId, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get orderIndex => $composableBuilder(
      column: $table.orderIndex, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get nodeType => $composableBuilder(
      column: $table.nodeType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get summary => $composableBuilder(
      column: $table.summary, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get linkedChapterId => $composableBuilder(
      column: $table.linkedChapterId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$OutlineNodesTableTableOrderingComposer
    extends Composer<_$AppDatabase, $OutlineNodesTableTable> {
  $$OutlineNodesTableTableOrderingComposer({
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

  ColumnOrderings<String> get parentId => $composableBuilder(
      column: $table.parentId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get orderIndex => $composableBuilder(
      column: $table.orderIndex, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get nodeType => $composableBuilder(
      column: $table.nodeType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get summary => $composableBuilder(
      column: $table.summary, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get linkedChapterId => $composableBuilder(
      column: $table.linkedChapterId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$OutlineNodesTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $OutlineNodesTableTable> {
  $$OutlineNodesTableTableAnnotationComposer({
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

  GeneratedColumn<String> get parentId =>
      $composableBuilder(column: $table.parentId, builder: (column) => column);

  GeneratedColumn<int> get orderIndex => $composableBuilder(
      column: $table.orderIndex, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get nodeType =>
      $composableBuilder(column: $table.nodeType, builder: (column) => column);

  GeneratedColumn<String> get summary =>
      $composableBuilder(column: $table.summary, builder: (column) => column);

  GeneratedColumn<String> get linkedChapterId => $composableBuilder(
      column: $table.linkedChapterId, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$OutlineNodesTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $OutlineNodesTableTable,
    OutlineNodesTableData,
    $$OutlineNodesTableTableFilterComposer,
    $$OutlineNodesTableTableOrderingComposer,
    $$OutlineNodesTableTableAnnotationComposer,
    $$OutlineNodesTableTableCreateCompanionBuilder,
    $$OutlineNodesTableTableUpdateCompanionBuilder,
    (
      OutlineNodesTableData,
      BaseReferences<_$AppDatabase, $OutlineNodesTableTable,
          OutlineNodesTableData>
    ),
    OutlineNodesTableData,
    PrefetchHooks Function()> {
  $$OutlineNodesTableTableTableManager(
      _$AppDatabase db, $OutlineNodesTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$OutlineNodesTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$OutlineNodesTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$OutlineNodesTableTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String?> parentId = const Value.absent(),
            Value<int> orderIndex = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> nodeType = const Value.absent(),
            Value<String> summary = const Value.absent(),
            Value<String?> linkedChapterId = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              OutlineNodesTableCompanion(
            id: id,
            projectId: projectId,
            parentId: parentId,
            orderIndex: orderIndex,
            title: title,
            nodeType: nodeType,
            summary: summary,
            linkedChapterId: linkedChapterId,
            status: status,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            Value<String?> parentId = const Value.absent(),
            required int orderIndex,
            required String title,
            Value<String> nodeType = const Value.absent(),
            Value<String> summary = const Value.absent(),
            Value<String?> linkedChapterId = const Value.absent(),
            Value<String> status = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              OutlineNodesTableCompanion.insert(
            id: id,
            projectId: projectId,
            parentId: parentId,
            orderIndex: orderIndex,
            title: title,
            nodeType: nodeType,
            summary: summary,
            linkedChapterId: linkedChapterId,
            status: status,
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

typedef $$OutlineNodesTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $OutlineNodesTableTable,
    OutlineNodesTableData,
    $$OutlineNodesTableTableFilterComposer,
    $$OutlineNodesTableTableOrderingComposer,
    $$OutlineNodesTableTableAnnotationComposer,
    $$OutlineNodesTableTableCreateCompanionBuilder,
    $$OutlineNodesTableTableUpdateCompanionBuilder,
    (
      OutlineNodesTableData,
      BaseReferences<_$AppDatabase, $OutlineNodesTableTable,
          OutlineNodesTableData>
    ),
    OutlineNodesTableData,
    PrefetchHooks Function()>;
typedef $$CharactersTableTableCreateCompanionBuilder = CharactersTableCompanion
    Function({
  required String id,
  required String projectId,
  required String name,
  Value<String> aliases,
  Value<String> role,
  Value<String> description,
  Value<String> appearance,
  Value<String> personality,
  Value<String> goals,
  Value<String> conflicts,
  Value<String> secrets,
  Value<String> relationships,
  Value<String?> firstAppearanceChapterId,
  Value<String> tags,
  Value<String> consistencyFacts,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$CharactersTableTableUpdateCompanionBuilder = CharactersTableCompanion
    Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> name,
  Value<String> aliases,
  Value<String> role,
  Value<String> description,
  Value<String> appearance,
  Value<String> personality,
  Value<String> goals,
  Value<String> conflicts,
  Value<String> secrets,
  Value<String> relationships,
  Value<String?> firstAppearanceChapterId,
  Value<String> tags,
  Value<String> consistencyFacts,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$CharactersTableTableFilterComposer
    extends Composer<_$AppDatabase, $CharactersTableTable> {
  $$CharactersTableTableFilterComposer({
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

  ColumnFilters<String> get aliases => $composableBuilder(
      column: $table.aliases, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get role => $composableBuilder(
      column: $table.role, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

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

  ColumnFilters<String> get relationships => $composableBuilder(
      column: $table.relationships, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get firstAppearanceChapterId => $composableBuilder(
      column: $table.firstAppearanceChapterId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tags => $composableBuilder(
      column: $table.tags, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get consistencyFacts => $composableBuilder(
      column: $table.consistencyFacts,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$CharactersTableTableOrderingComposer
    extends Composer<_$AppDatabase, $CharactersTableTable> {
  $$CharactersTableTableOrderingComposer({
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

  ColumnOrderings<String> get aliases => $composableBuilder(
      column: $table.aliases, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get role => $composableBuilder(
      column: $table.role, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

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

  ColumnOrderings<String> get relationships => $composableBuilder(
      column: $table.relationships,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get firstAppearanceChapterId => $composableBuilder(
      column: $table.firstAppearanceChapterId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tags => $composableBuilder(
      column: $table.tags, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get consistencyFacts => $composableBuilder(
      column: $table.consistencyFacts,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$CharactersTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $CharactersTableTable> {
  $$CharactersTableTableAnnotationComposer({
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

  GeneratedColumn<String> get aliases =>
      $composableBuilder(column: $table.aliases, builder: (column) => column);

  GeneratedColumn<String> get role =>
      $composableBuilder(column: $table.role, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

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

  GeneratedColumn<String> get relationships => $composableBuilder(
      column: $table.relationships, builder: (column) => column);

  GeneratedColumn<String> get firstAppearanceChapterId => $composableBuilder(
      column: $table.firstAppearanceChapterId, builder: (column) => column);

  GeneratedColumn<String> get tags =>
      $composableBuilder(column: $table.tags, builder: (column) => column);

  GeneratedColumn<String> get consistencyFacts => $composableBuilder(
      column: $table.consistencyFacts, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$CharactersTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $CharactersTableTable,
    CharactersTableData,
    $$CharactersTableTableFilterComposer,
    $$CharactersTableTableOrderingComposer,
    $$CharactersTableTableAnnotationComposer,
    $$CharactersTableTableCreateCompanionBuilder,
    $$CharactersTableTableUpdateCompanionBuilder,
    (
      CharactersTableData,
      BaseReferences<_$AppDatabase, $CharactersTableTable, CharactersTableData>
    ),
    CharactersTableData,
    PrefetchHooks Function()> {
  $$CharactersTableTableTableManager(
      _$AppDatabase db, $CharactersTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CharactersTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CharactersTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CharactersTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String> aliases = const Value.absent(),
            Value<String> role = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<String> appearance = const Value.absent(),
            Value<String> personality = const Value.absent(),
            Value<String> goals = const Value.absent(),
            Value<String> conflicts = const Value.absent(),
            Value<String> secrets = const Value.absent(),
            Value<String> relationships = const Value.absent(),
            Value<String?> firstAppearanceChapterId = const Value.absent(),
            Value<String> tags = const Value.absent(),
            Value<String> consistencyFacts = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              CharactersTableCompanion(
            id: id,
            projectId: projectId,
            name: name,
            aliases: aliases,
            role: role,
            description: description,
            appearance: appearance,
            personality: personality,
            goals: goals,
            conflicts: conflicts,
            secrets: secrets,
            relationships: relationships,
            firstAppearanceChapterId: firstAppearanceChapterId,
            tags: tags,
            consistencyFacts: consistencyFacts,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String name,
            Value<String> aliases = const Value.absent(),
            Value<String> role = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<String> appearance = const Value.absent(),
            Value<String> personality = const Value.absent(),
            Value<String> goals = const Value.absent(),
            Value<String> conflicts = const Value.absent(),
            Value<String> secrets = const Value.absent(),
            Value<String> relationships = const Value.absent(),
            Value<String?> firstAppearanceChapterId = const Value.absent(),
            Value<String> tags = const Value.absent(),
            Value<String> consistencyFacts = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              CharactersTableCompanion.insert(
            id: id,
            projectId: projectId,
            name: name,
            aliases: aliases,
            role: role,
            description: description,
            appearance: appearance,
            personality: personality,
            goals: goals,
            conflicts: conflicts,
            secrets: secrets,
            relationships: relationships,
            firstAppearanceChapterId: firstAppearanceChapterId,
            tags: tags,
            consistencyFacts: consistencyFacts,
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

typedef $$CharactersTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $CharactersTableTable,
    CharactersTableData,
    $$CharactersTableTableFilterComposer,
    $$CharactersTableTableOrderingComposer,
    $$CharactersTableTableAnnotationComposer,
    $$CharactersTableTableCreateCompanionBuilder,
    $$CharactersTableTableUpdateCompanionBuilder,
    (
      CharactersTableData,
      BaseReferences<_$AppDatabase, $CharactersTableTable, CharactersTableData>
    ),
    CharactersTableData,
    PrefetchHooks Function()>;
typedef $$NotesTableTableCreateCompanionBuilder = NotesTableCompanion Function({
  required String id,
  required String projectId,
  required String title,
  Value<String> content,
  Value<String> type,
  Value<String?> sourceUrl,
  Value<String?> agentTaskId,
  Value<String> tags,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$NotesTableTableUpdateCompanionBuilder = NotesTableCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> title,
  Value<String> content,
  Value<String> type,
  Value<String?> sourceUrl,
  Value<String?> agentTaskId,
  Value<String> tags,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$NotesTableTableFilterComposer
    extends Composer<_$AppDatabase, $NotesTableTable> {
  $$NotesTableTableFilterComposer({
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

  ColumnFilters<String> get type => $composableBuilder(
      column: $table.type, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get sourceUrl => $composableBuilder(
      column: $table.sourceUrl, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get agentTaskId => $composableBuilder(
      column: $table.agentTaskId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tags => $composableBuilder(
      column: $table.tags, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$NotesTableTableOrderingComposer
    extends Composer<_$AppDatabase, $NotesTableTable> {
  $$NotesTableTableOrderingComposer({
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

  ColumnOrderings<String> get type => $composableBuilder(
      column: $table.type, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get sourceUrl => $composableBuilder(
      column: $table.sourceUrl, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get agentTaskId => $composableBuilder(
      column: $table.agentTaskId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tags => $composableBuilder(
      column: $table.tags, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$NotesTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $NotesTableTable> {
  $$NotesTableTableAnnotationComposer({
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

  GeneratedColumn<String> get type =>
      $composableBuilder(column: $table.type, builder: (column) => column);

  GeneratedColumn<String> get sourceUrl =>
      $composableBuilder(column: $table.sourceUrl, builder: (column) => column);

  GeneratedColumn<String> get agentTaskId => $composableBuilder(
      column: $table.agentTaskId, builder: (column) => column);

  GeneratedColumn<String> get tags =>
      $composableBuilder(column: $table.tags, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$NotesTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $NotesTableTable,
    NotesTableData,
    $$NotesTableTableFilterComposer,
    $$NotesTableTableOrderingComposer,
    $$NotesTableTableAnnotationComposer,
    $$NotesTableTableCreateCompanionBuilder,
    $$NotesTableTableUpdateCompanionBuilder,
    (
      NotesTableData,
      BaseReferences<_$AppDatabase, $NotesTableTable, NotesTableData>
    ),
    NotesTableData,
    PrefetchHooks Function()> {
  $$NotesTableTableTableManager(_$AppDatabase db, $NotesTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$NotesTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$NotesTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$NotesTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> content = const Value.absent(),
            Value<String> type = const Value.absent(),
            Value<String?> sourceUrl = const Value.absent(),
            Value<String?> agentTaskId = const Value.absent(),
            Value<String> tags = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              NotesTableCompanion(
            id: id,
            projectId: projectId,
            title: title,
            content: content,
            type: type,
            sourceUrl: sourceUrl,
            agentTaskId: agentTaskId,
            tags: tags,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String title,
            Value<String> content = const Value.absent(),
            Value<String> type = const Value.absent(),
            Value<String?> sourceUrl = const Value.absent(),
            Value<String?> agentTaskId = const Value.absent(),
            Value<String> tags = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              NotesTableCompanion.insert(
            id: id,
            projectId: projectId,
            title: title,
            content: content,
            type: type,
            sourceUrl: sourceUrl,
            agentTaskId: agentTaskId,
            tags: tags,
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

typedef $$NotesTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $NotesTableTable,
    NotesTableData,
    $$NotesTableTableFilterComposer,
    $$NotesTableTableOrderingComposer,
    $$NotesTableTableAnnotationComposer,
    $$NotesTableTableCreateCompanionBuilder,
    $$NotesTableTableUpdateCompanionBuilder,
    (
      NotesTableData,
      BaseReferences<_$AppDatabase, $NotesTableTable, NotesTableData>
    ),
    NotesTableData,
    PrefetchHooks Function()>;
typedef $$SessionsTableTableCreateCompanionBuilder = SessionsTableCompanion
    Function({
  required String id,
  required String projectId,
  required String title,
  Value<String> stage,
  Value<String?> parentSessionId,
  Value<String?> branchName,
  Value<String> messages,
  Value<String?> contextSnapshotId,
  Value<bool> archived,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$SessionsTableTableUpdateCompanionBuilder = SessionsTableCompanion
    Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> title,
  Value<String> stage,
  Value<String?> parentSessionId,
  Value<String?> branchName,
  Value<String> messages,
  Value<String?> contextSnapshotId,
  Value<bool> archived,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$SessionsTableTableFilterComposer
    extends Composer<_$AppDatabase, $SessionsTableTable> {
  $$SessionsTableTableFilterComposer({
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

  ColumnFilters<String> get stage => $composableBuilder(
      column: $table.stage, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get parentSessionId => $composableBuilder(
      column: $table.parentSessionId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get branchName => $composableBuilder(
      column: $table.branchName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get messages => $composableBuilder(
      column: $table.messages, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get contextSnapshotId => $composableBuilder(
      column: $table.contextSnapshotId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get archived => $composableBuilder(
      column: $table.archived, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$SessionsTableTableOrderingComposer
    extends Composer<_$AppDatabase, $SessionsTableTable> {
  $$SessionsTableTableOrderingComposer({
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

  ColumnOrderings<String> get stage => $composableBuilder(
      column: $table.stage, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get parentSessionId => $composableBuilder(
      column: $table.parentSessionId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get branchName => $composableBuilder(
      column: $table.branchName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get messages => $composableBuilder(
      column: $table.messages, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get contextSnapshotId => $composableBuilder(
      column: $table.contextSnapshotId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get archived => $composableBuilder(
      column: $table.archived, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$SessionsTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $SessionsTableTable> {
  $$SessionsTableTableAnnotationComposer({
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

  GeneratedColumn<String> get stage =>
      $composableBuilder(column: $table.stage, builder: (column) => column);

  GeneratedColumn<String> get parentSessionId => $composableBuilder(
      column: $table.parentSessionId, builder: (column) => column);

  GeneratedColumn<String> get branchName => $composableBuilder(
      column: $table.branchName, builder: (column) => column);

  GeneratedColumn<String> get messages =>
      $composableBuilder(column: $table.messages, builder: (column) => column);

  GeneratedColumn<String> get contextSnapshotId => $composableBuilder(
      column: $table.contextSnapshotId, builder: (column) => column);

  GeneratedColumn<bool> get archived =>
      $composableBuilder(column: $table.archived, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$SessionsTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SessionsTableTable,
    SessionsTableData,
    $$SessionsTableTableFilterComposer,
    $$SessionsTableTableOrderingComposer,
    $$SessionsTableTableAnnotationComposer,
    $$SessionsTableTableCreateCompanionBuilder,
    $$SessionsTableTableUpdateCompanionBuilder,
    (
      SessionsTableData,
      BaseReferences<_$AppDatabase, $SessionsTableTable, SessionsTableData>
    ),
    SessionsTableData,
    PrefetchHooks Function()> {
  $$SessionsTableTableTableManager(_$AppDatabase db, $SessionsTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SessionsTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SessionsTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SessionsTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> stage = const Value.absent(),
            Value<String?> parentSessionId = const Value.absent(),
            Value<String?> branchName = const Value.absent(),
            Value<String> messages = const Value.absent(),
            Value<String?> contextSnapshotId = const Value.absent(),
            Value<bool> archived = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SessionsTableCompanion(
            id: id,
            projectId: projectId,
            title: title,
            stage: stage,
            parentSessionId: parentSessionId,
            branchName: branchName,
            messages: messages,
            contextSnapshotId: contextSnapshotId,
            archived: archived,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String title,
            Value<String> stage = const Value.absent(),
            Value<String?> parentSessionId = const Value.absent(),
            Value<String?> branchName = const Value.absent(),
            Value<String> messages = const Value.absent(),
            Value<String?> contextSnapshotId = const Value.absent(),
            Value<bool> archived = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SessionsTableCompanion.insert(
            id: id,
            projectId: projectId,
            title: title,
            stage: stage,
            parentSessionId: parentSessionId,
            branchName: branchName,
            messages: messages,
            contextSnapshotId: contextSnapshotId,
            archived: archived,
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

typedef $$SessionsTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SessionsTableTable,
    SessionsTableData,
    $$SessionsTableTableFilterComposer,
    $$SessionsTableTableOrderingComposer,
    $$SessionsTableTableAnnotationComposer,
    $$SessionsTableTableCreateCompanionBuilder,
    $$SessionsTableTableUpdateCompanionBuilder,
    (
      SessionsTableData,
      BaseReferences<_$AppDatabase, $SessionsTableTable, SessionsTableData>
    ),
    SessionsTableData,
    PrefetchHooks Function()>;
typedef $$SettingEntriesTableTableCreateCompanionBuilder
    = SettingEntriesTableCompanion Function({
  required String id,
  required String projectId,
  required String category,
  required String title,
  Value<String> content,
  Value<String> tags,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$SettingEntriesTableTableUpdateCompanionBuilder
    = SettingEntriesTableCompanion Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> category,
  Value<String> title,
  Value<String> content,
  Value<String> tags,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$SettingEntriesTableTableFilterComposer
    extends Composer<_$AppDatabase, $SettingEntriesTableTable> {
  $$SettingEntriesTableTableFilterComposer({
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

  ColumnFilters<String> get category => $composableBuilder(
      column: $table.category, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get content => $composableBuilder(
      column: $table.content, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tags => $composableBuilder(
      column: $table.tags, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$SettingEntriesTableTableOrderingComposer
    extends Composer<_$AppDatabase, $SettingEntriesTableTable> {
  $$SettingEntriesTableTableOrderingComposer({
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

  ColumnOrderings<String> get category => $composableBuilder(
      column: $table.category, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get content => $composableBuilder(
      column: $table.content, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tags => $composableBuilder(
      column: $table.tags, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$SettingEntriesTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $SettingEntriesTableTable> {
  $$SettingEntriesTableTableAnnotationComposer({
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

  GeneratedColumn<String> get category =>
      $composableBuilder(column: $table.category, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get content =>
      $composableBuilder(column: $table.content, builder: (column) => column);

  GeneratedColumn<String> get tags =>
      $composableBuilder(column: $table.tags, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$SettingEntriesTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SettingEntriesTableTable,
    SettingEntriesTableData,
    $$SettingEntriesTableTableFilterComposer,
    $$SettingEntriesTableTableOrderingComposer,
    $$SettingEntriesTableTableAnnotationComposer,
    $$SettingEntriesTableTableCreateCompanionBuilder,
    $$SettingEntriesTableTableUpdateCompanionBuilder,
    (
      SettingEntriesTableData,
      BaseReferences<_$AppDatabase, $SettingEntriesTableTable,
          SettingEntriesTableData>
    ),
    SettingEntriesTableData,
    PrefetchHooks Function()> {
  $$SettingEntriesTableTableTableManager(
      _$AppDatabase db, $SettingEntriesTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SettingEntriesTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SettingEntriesTableTableOrderingComposer(
                  $db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SettingEntriesTableTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> category = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> content = const Value.absent(),
            Value<String> tags = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SettingEntriesTableCompanion(
            id: id,
            projectId: projectId,
            category: category,
            title: title,
            content: content,
            tags: tags,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String category,
            required String title,
            Value<String> content = const Value.absent(),
            Value<String> tags = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SettingEntriesTableCompanion.insert(
            id: id,
            projectId: projectId,
            category: category,
            title: title,
            content: content,
            tags: tags,
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

typedef $$SettingEntriesTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SettingEntriesTableTable,
    SettingEntriesTableData,
    $$SettingEntriesTableTableFilterComposer,
    $$SettingEntriesTableTableOrderingComposer,
    $$SettingEntriesTableTableAnnotationComposer,
    $$SettingEntriesTableTableCreateCompanionBuilder,
    $$SettingEntriesTableTableUpdateCompanionBuilder,
    (
      SettingEntriesTableData,
      BaseReferences<_$AppDatabase, $SettingEntriesTableTable,
          SettingEntriesTableData>
    ),
    SettingEntriesTableData,
    PrefetchHooks Function()>;
typedef $$AgentTasksTableTableCreateCompanionBuilder = AgentTasksTableCompanion
    Function({
  required String id,
  required String projectId,
  required String taskType,
  Value<String> status,
  Value<String> inputJson,
  Value<String> outputJson,
  Value<String?> model,
  Value<String?> tokenUsage,
  Value<String?> error,
  Value<String> sideEffects,
  Value<DateTime?> startedAt,
  Value<DateTime?> completedAt,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$AgentTasksTableTableUpdateCompanionBuilder = AgentTasksTableCompanion
    Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> taskType,
  Value<String> status,
  Value<String> inputJson,
  Value<String> outputJson,
  Value<String?> model,
  Value<String?> tokenUsage,
  Value<String?> error,
  Value<String> sideEffects,
  Value<DateTime?> startedAt,
  Value<DateTime?> completedAt,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$AgentTasksTableTableFilterComposer
    extends Composer<_$AppDatabase, $AgentTasksTableTable> {
  $$AgentTasksTableTableFilterComposer({
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

  ColumnFilters<String> get taskType => $composableBuilder(
      column: $table.taskType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get inputJson => $composableBuilder(
      column: $table.inputJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get outputJson => $composableBuilder(
      column: $table.outputJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get model => $composableBuilder(
      column: $table.model, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get tokenUsage => $composableBuilder(
      column: $table.tokenUsage, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get error => $composableBuilder(
      column: $table.error, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get sideEffects => $composableBuilder(
      column: $table.sideEffects, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get startedAt => $composableBuilder(
      column: $table.startedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get completedAt => $composableBuilder(
      column: $table.completedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$AgentTasksTableTableOrderingComposer
    extends Composer<_$AppDatabase, $AgentTasksTableTable> {
  $$AgentTasksTableTableOrderingComposer({
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

  ColumnOrderings<String> get taskType => $composableBuilder(
      column: $table.taskType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get inputJson => $composableBuilder(
      column: $table.inputJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get outputJson => $composableBuilder(
      column: $table.outputJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get model => $composableBuilder(
      column: $table.model, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get tokenUsage => $composableBuilder(
      column: $table.tokenUsage, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get error => $composableBuilder(
      column: $table.error, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get sideEffects => $composableBuilder(
      column: $table.sideEffects, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get startedAt => $composableBuilder(
      column: $table.startedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get completedAt => $composableBuilder(
      column: $table.completedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$AgentTasksTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $AgentTasksTableTable> {
  $$AgentTasksTableTableAnnotationComposer({
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

  GeneratedColumn<String> get taskType =>
      $composableBuilder(column: $table.taskType, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<String> get inputJson =>
      $composableBuilder(column: $table.inputJson, builder: (column) => column);

  GeneratedColumn<String> get outputJson => $composableBuilder(
      column: $table.outputJson, builder: (column) => column);

  GeneratedColumn<String> get model =>
      $composableBuilder(column: $table.model, builder: (column) => column);

  GeneratedColumn<String> get tokenUsage => $composableBuilder(
      column: $table.tokenUsage, builder: (column) => column);

  GeneratedColumn<String> get error =>
      $composableBuilder(column: $table.error, builder: (column) => column);

  GeneratedColumn<String> get sideEffects => $composableBuilder(
      column: $table.sideEffects, builder: (column) => column);

  GeneratedColumn<DateTime> get startedAt =>
      $composableBuilder(column: $table.startedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get completedAt => $composableBuilder(
      column: $table.completedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$AgentTasksTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $AgentTasksTableTable,
    AgentTasksTableData,
    $$AgentTasksTableTableFilterComposer,
    $$AgentTasksTableTableOrderingComposer,
    $$AgentTasksTableTableAnnotationComposer,
    $$AgentTasksTableTableCreateCompanionBuilder,
    $$AgentTasksTableTableUpdateCompanionBuilder,
    (
      AgentTasksTableData,
      BaseReferences<_$AppDatabase, $AgentTasksTableTable, AgentTasksTableData>
    ),
    AgentTasksTableData,
    PrefetchHooks Function()> {
  $$AgentTasksTableTableTableManager(
      _$AppDatabase db, $AgentTasksTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$AgentTasksTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$AgentTasksTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$AgentTasksTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> taskType = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<String> inputJson = const Value.absent(),
            Value<String> outputJson = const Value.absent(),
            Value<String?> model = const Value.absent(),
            Value<String?> tokenUsage = const Value.absent(),
            Value<String?> error = const Value.absent(),
            Value<String> sideEffects = const Value.absent(),
            Value<DateTime?> startedAt = const Value.absent(),
            Value<DateTime?> completedAt = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              AgentTasksTableCompanion(
            id: id,
            projectId: projectId,
            taskType: taskType,
            status: status,
            inputJson: inputJson,
            outputJson: outputJson,
            model: model,
            tokenUsage: tokenUsage,
            error: error,
            sideEffects: sideEffects,
            startedAt: startedAt,
            completedAt: completedAt,
            createdAt: createdAt,
            updatedAt: updatedAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String taskType,
            Value<String> status = const Value.absent(),
            Value<String> inputJson = const Value.absent(),
            Value<String> outputJson = const Value.absent(),
            Value<String?> model = const Value.absent(),
            Value<String?> tokenUsage = const Value.absent(),
            Value<String?> error = const Value.absent(),
            Value<String> sideEffects = const Value.absent(),
            Value<DateTime?> startedAt = const Value.absent(),
            Value<DateTime?> completedAt = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              AgentTasksTableCompanion.insert(
            id: id,
            projectId: projectId,
            taskType: taskType,
            status: status,
            inputJson: inputJson,
            outputJson: outputJson,
            model: model,
            tokenUsage: tokenUsage,
            error: error,
            sideEffects: sideEffects,
            startedAt: startedAt,
            completedAt: completedAt,
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

typedef $$AgentTasksTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $AgentTasksTableTable,
    AgentTasksTableData,
    $$AgentTasksTableTableFilterComposer,
    $$AgentTasksTableTableOrderingComposer,
    $$AgentTasksTableTableAnnotationComposer,
    $$AgentTasksTableTableCreateCompanionBuilder,
    $$AgentTasksTableTableUpdateCompanionBuilder,
    (
      AgentTasksTableData,
      BaseReferences<_$AppDatabase, $AgentTasksTableTable, AgentTasksTableData>
    ),
    AgentTasksTableData,
    PrefetchHooks Function()>;
typedef $$SnapshotsTableTableCreateCompanionBuilder = SnapshotsTableCompanion
    Function({
  required String id,
  required String projectId,
  required String description,
  Value<String> trigger,
  Value<String> dataSnapshot,
  required DateTime createdAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});
typedef $$SnapshotsTableTableUpdateCompanionBuilder = SnapshotsTableCompanion
    Function({
  Value<String> id,
  Value<String> projectId,
  Value<String> description,
  Value<String> trigger,
  Value<String> dataSnapshot,
  Value<DateTime> createdAt,
  Value<int> schemaVersion,
  Value<int> rowid,
});

class $$SnapshotsTableTableFilterComposer
    extends Composer<_$AppDatabase, $SnapshotsTableTable> {
  $$SnapshotsTableTableFilterComposer({
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

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get trigger => $composableBuilder(
      column: $table.trigger, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get dataSnapshot => $composableBuilder(
      column: $table.dataSnapshot, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => ColumnFilters(column));
}

class $$SnapshotsTableTableOrderingComposer
    extends Composer<_$AppDatabase, $SnapshotsTableTable> {
  $$SnapshotsTableTableOrderingComposer({
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

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get trigger => $composableBuilder(
      column: $table.trigger, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get dataSnapshot => $composableBuilder(
      column: $table.dataSnapshot,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion,
      builder: (column) => ColumnOrderings(column));
}

class $$SnapshotsTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $SnapshotsTableTable> {
  $$SnapshotsTableTableAnnotationComposer({
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

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  GeneratedColumn<String> get trigger =>
      $composableBuilder(column: $table.trigger, builder: (column) => column);

  GeneratedColumn<String> get dataSnapshot => $composableBuilder(
      column: $table.dataSnapshot, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get schemaVersion => $composableBuilder(
      column: $table.schemaVersion, builder: (column) => column);
}

class $$SnapshotsTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SnapshotsTableTable,
    SnapshotsTableData,
    $$SnapshotsTableTableFilterComposer,
    $$SnapshotsTableTableOrderingComposer,
    $$SnapshotsTableTableAnnotationComposer,
    $$SnapshotsTableTableCreateCompanionBuilder,
    $$SnapshotsTableTableUpdateCompanionBuilder,
    (
      SnapshotsTableData,
      BaseReferences<_$AppDatabase, $SnapshotsTableTable, SnapshotsTableData>
    ),
    SnapshotsTableData,
    PrefetchHooks Function()> {
  $$SnapshotsTableTableTableManager(
      _$AppDatabase db, $SnapshotsTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SnapshotsTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SnapshotsTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SnapshotsTableTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> projectId = const Value.absent(),
            Value<String> description = const Value.absent(),
            Value<String> trigger = const Value.absent(),
            Value<String> dataSnapshot = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SnapshotsTableCompanion(
            id: id,
            projectId: projectId,
            description: description,
            trigger: trigger,
            dataSnapshot: dataSnapshot,
            createdAt: createdAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String projectId,
            required String description,
            Value<String> trigger = const Value.absent(),
            Value<String> dataSnapshot = const Value.absent(),
            required DateTime createdAt,
            Value<int> schemaVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SnapshotsTableCompanion.insert(
            id: id,
            projectId: projectId,
            description: description,
            trigger: trigger,
            dataSnapshot: dataSnapshot,
            createdAt: createdAt,
            schemaVersion: schemaVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SnapshotsTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SnapshotsTableTable,
    SnapshotsTableData,
    $$SnapshotsTableTableFilterComposer,
    $$SnapshotsTableTableOrderingComposer,
    $$SnapshotsTableTableAnnotationComposer,
    $$SnapshotsTableTableCreateCompanionBuilder,
    $$SnapshotsTableTableUpdateCompanionBuilder,
    (
      SnapshotsTableData,
      BaseReferences<_$AppDatabase, $SnapshotsTableTable, SnapshotsTableData>
    ),
    SnapshotsTableData,
    PrefetchHooks Function()>;
typedef $$LlmProvidersTableTableCreateCompanionBuilder
    = LlmProvidersTableCompanion Function({
  required String id,
  required String displayName,
  required String baseUrl,
  Value<String> defaultModel,
  Value<double> temperature,
  Value<int> maxTokens,
  Value<bool> enabled,
  required DateTime createdAt,
  required DateTime updatedAt,
  Value<int> rowid,
});
typedef $$LlmProvidersTableTableUpdateCompanionBuilder
    = LlmProvidersTableCompanion Function({
  Value<String> id,
  Value<String> displayName,
  Value<String> baseUrl,
  Value<String> defaultModel,
  Value<double> temperature,
  Value<int> maxTokens,
  Value<bool> enabled,
  Value<DateTime> createdAt,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});

class $$LlmProvidersTableTableFilterComposer
    extends Composer<_$AppDatabase, $LlmProvidersTableTable> {
  $$LlmProvidersTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get displayName => $composableBuilder(
      column: $table.displayName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get baseUrl => $composableBuilder(
      column: $table.baseUrl, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get defaultModel => $composableBuilder(
      column: $table.defaultModel, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get temperature => $composableBuilder(
      column: $table.temperature, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get maxTokens => $composableBuilder(
      column: $table.maxTokens, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get enabled => $composableBuilder(
      column: $table.enabled, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$LlmProvidersTableTableOrderingComposer
    extends Composer<_$AppDatabase, $LlmProvidersTableTable> {
  $$LlmProvidersTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get displayName => $composableBuilder(
      column: $table.displayName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get baseUrl => $composableBuilder(
      column: $table.baseUrl, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get defaultModel => $composableBuilder(
      column: $table.defaultModel,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get temperature => $composableBuilder(
      column: $table.temperature, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get maxTokens => $composableBuilder(
      column: $table.maxTokens, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get enabled => $composableBuilder(
      column: $table.enabled, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$LlmProvidersTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $LlmProvidersTableTable> {
  $$LlmProvidersTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get displayName => $composableBuilder(
      column: $table.displayName, builder: (column) => column);

  GeneratedColumn<String> get baseUrl =>
      $composableBuilder(column: $table.baseUrl, builder: (column) => column);

  GeneratedColumn<String> get defaultModel => $composableBuilder(
      column: $table.defaultModel, builder: (column) => column);

  GeneratedColumn<double> get temperature => $composableBuilder(
      column: $table.temperature, builder: (column) => column);

  GeneratedColumn<int> get maxTokens =>
      $composableBuilder(column: $table.maxTokens, builder: (column) => column);

  GeneratedColumn<bool> get enabled =>
      $composableBuilder(column: $table.enabled, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$LlmProvidersTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $LlmProvidersTableTable,
    LlmProvidersTableData,
    $$LlmProvidersTableTableFilterComposer,
    $$LlmProvidersTableTableOrderingComposer,
    $$LlmProvidersTableTableAnnotationComposer,
    $$LlmProvidersTableTableCreateCompanionBuilder,
    $$LlmProvidersTableTableUpdateCompanionBuilder,
    (
      LlmProvidersTableData,
      BaseReferences<_$AppDatabase, $LlmProvidersTableTable,
          LlmProvidersTableData>
    ),
    LlmProvidersTableData,
    PrefetchHooks Function()> {
  $$LlmProvidersTableTableTableManager(
      _$AppDatabase db, $LlmProvidersTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LlmProvidersTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LlmProvidersTableTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LlmProvidersTableTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> displayName = const Value.absent(),
            Value<String> baseUrl = const Value.absent(),
            Value<String> defaultModel = const Value.absent(),
            Value<double> temperature = const Value.absent(),
            Value<int> maxTokens = const Value.absent(),
            Value<bool> enabled = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              LlmProvidersTableCompanion(
            id: id,
            displayName: displayName,
            baseUrl: baseUrl,
            defaultModel: defaultModel,
            temperature: temperature,
            maxTokens: maxTokens,
            enabled: enabled,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String displayName,
            required String baseUrl,
            Value<String> defaultModel = const Value.absent(),
            Value<double> temperature = const Value.absent(),
            Value<int> maxTokens = const Value.absent(),
            Value<bool> enabled = const Value.absent(),
            required DateTime createdAt,
            required DateTime updatedAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              LlmProvidersTableCompanion.insert(
            id: id,
            displayName: displayName,
            baseUrl: baseUrl,
            defaultModel: defaultModel,
            temperature: temperature,
            maxTokens: maxTokens,
            enabled: enabled,
            createdAt: createdAt,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$LlmProvidersTableTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $LlmProvidersTableTable,
    LlmProvidersTableData,
    $$LlmProvidersTableTableFilterComposer,
    $$LlmProvidersTableTableOrderingComposer,
    $$LlmProvidersTableTableAnnotationComposer,
    $$LlmProvidersTableTableCreateCompanionBuilder,
    $$LlmProvidersTableTableUpdateCompanionBuilder,
    (
      LlmProvidersTableData,
      BaseReferences<_$AppDatabase, $LlmProvidersTableTable,
          LlmProvidersTableData>
    ),
    LlmProvidersTableData,
    PrefetchHooks Function()>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$ProjectsTableTableTableManager get projectsTable =>
      $$ProjectsTableTableTableManager(_db, _db.projectsTable);
  $$ChaptersTableTableTableManager get chaptersTable =>
      $$ChaptersTableTableTableManager(_db, _db.chaptersTable);
  $$RevisionsTableTableTableManager get revisionsTable =>
      $$RevisionsTableTableTableManager(_db, _db.revisionsTable);
  $$OutlineNodesTableTableTableManager get outlineNodesTable =>
      $$OutlineNodesTableTableTableManager(_db, _db.outlineNodesTable);
  $$CharactersTableTableTableManager get charactersTable =>
      $$CharactersTableTableTableManager(_db, _db.charactersTable);
  $$NotesTableTableTableManager get notesTable =>
      $$NotesTableTableTableManager(_db, _db.notesTable);
  $$SessionsTableTableTableManager get sessionsTable =>
      $$SessionsTableTableTableManager(_db, _db.sessionsTable);
  $$SettingEntriesTableTableTableManager get settingEntriesTable =>
      $$SettingEntriesTableTableTableManager(_db, _db.settingEntriesTable);
  $$AgentTasksTableTableTableManager get agentTasksTable =>
      $$AgentTasksTableTableTableManager(_db, _db.agentTasksTable);
  $$SnapshotsTableTableTableManager get snapshotsTable =>
      $$SnapshotsTableTableTableManager(_db, _db.snapshotsTable);
  $$LlmProvidersTableTableTableManager get llmProvidersTable =>
      $$LlmProvidersTableTableTableManager(_db, _db.llmProvidersTable);
}
