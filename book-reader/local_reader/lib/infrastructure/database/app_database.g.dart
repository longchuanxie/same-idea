// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $SeriesTable extends Series with TableInfo<$SeriesTable, Sery> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SeriesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _coverPathMeta =
      const VerificationMeta('coverPath');
  @override
  late final GeneratedColumn<String> coverPath = GeneratedColumn<String>(
      'cover_path', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [id, title, description, coverPath];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'series';
  @override
  VerificationContext validateIntegrity(Insertable<Sery> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    if (data.containsKey('cover_path')) {
      context.handle(_coverPathMeta,
          coverPath.isAcceptableOrUnknown(data['cover_path']!, _coverPathMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Sery map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Sery(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description']),
      coverPath: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}cover_path']),
    );
  }

  @override
  $SeriesTable createAlias(String alias) {
    return $SeriesTable(attachedDatabase, alias);
  }
}

class Sery extends DataClass implements Insertable<Sery> {
  final int id;
  final String title;
  final String? description;
  final String? coverPath;
  const Sery(
      {required this.id,
      required this.title,
      this.description,
      this.coverPath});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['title'] = Variable<String>(title);
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    if (!nullToAbsent || coverPath != null) {
      map['cover_path'] = Variable<String>(coverPath);
    }
    return map;
  }

  SeriesCompanion toCompanion(bool nullToAbsent) {
    return SeriesCompanion(
      id: Value(id),
      title: Value(title),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
      coverPath: coverPath == null && nullToAbsent
          ? const Value.absent()
          : Value(coverPath),
    );
  }

  factory Sery.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Sery(
      id: serializer.fromJson<int>(json['id']),
      title: serializer.fromJson<String>(json['title']),
      description: serializer.fromJson<String?>(json['description']),
      coverPath: serializer.fromJson<String?>(json['coverPath']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'title': serializer.toJson<String>(title),
      'description': serializer.toJson<String?>(description),
      'coverPath': serializer.toJson<String?>(coverPath),
    };
  }

  Sery copyWith(
          {int? id,
          String? title,
          Value<String?> description = const Value.absent(),
          Value<String?> coverPath = const Value.absent()}) =>
      Sery(
        id: id ?? this.id,
        title: title ?? this.title,
        description: description.present ? description.value : this.description,
        coverPath: coverPath.present ? coverPath.value : this.coverPath,
      );
  Sery copyWithCompanion(SeriesCompanion data) {
    return Sery(
      id: data.id.present ? data.id.value : this.id,
      title: data.title.present ? data.title.value : this.title,
      description:
          data.description.present ? data.description.value : this.description,
      coverPath: data.coverPath.present ? data.coverPath.value : this.coverPath,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Sery(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('coverPath: $coverPath')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, title, description, coverPath);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Sery &&
          other.id == this.id &&
          other.title == this.title &&
          other.description == this.description &&
          other.coverPath == this.coverPath);
}

class SeriesCompanion extends UpdateCompanion<Sery> {
  final Value<int> id;
  final Value<String> title;
  final Value<String?> description;
  final Value<String?> coverPath;
  const SeriesCompanion({
    this.id = const Value.absent(),
    this.title = const Value.absent(),
    this.description = const Value.absent(),
    this.coverPath = const Value.absent(),
  });
  SeriesCompanion.insert({
    this.id = const Value.absent(),
    required String title,
    this.description = const Value.absent(),
    this.coverPath = const Value.absent(),
  }) : title = Value(title);
  static Insertable<Sery> custom({
    Expression<int>? id,
    Expression<String>? title,
    Expression<String>? description,
    Expression<String>? coverPath,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (coverPath != null) 'cover_path': coverPath,
    });
  }

  SeriesCompanion copyWith(
      {Value<int>? id,
      Value<String>? title,
      Value<String?>? description,
      Value<String?>? coverPath}) {
    return SeriesCompanion(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      coverPath: coverPath ?? this.coverPath,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (coverPath.present) {
      map['cover_path'] = Variable<String>(coverPath.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SeriesCompanion(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('coverPath: $coverPath')
          ..write(')'))
        .toString();
  }
}

class $BooksTable extends Books with TableInfo<$BooksTable, Book> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $BooksTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
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
  static const VerificationMeta _filePathMeta =
      const VerificationMeta('filePath');
  @override
  late final GeneratedColumn<String> filePath = GeneratedColumn<String>(
      'file_path', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _formatMeta = const VerificationMeta('format');
  @override
  late final GeneratedColumn<String> format = GeneratedColumn<String>(
      'format', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _coverPathMeta =
      const VerificationMeta('coverPath');
  @override
  late final GeneratedColumn<String> coverPath = GeneratedColumn<String>(
      'cover_path', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _seriesIdMeta =
      const VerificationMeta('seriesId');
  @override
  late final GeneratedColumn<int> seriesId = GeneratedColumn<int>(
      'series_id', aliasedName, true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES series (id)'));
  static const VerificationMeta _volumeIndexMeta =
      const VerificationMeta('volumeIndex');
  @override
  late final GeneratedColumn<int> volumeIndex = GeneratedColumn<int>(
      'volume_index', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _fileSizeBytesMeta =
      const VerificationMeta('fileSizeBytes');
  @override
  late final GeneratedColumn<int> fileSizeBytes = GeneratedColumn<int>(
      'file_size_bytes', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _lastOpenedAtMeta =
      const VerificationMeta('lastOpenedAt');
  @override
  late final GeneratedColumn<DateTime> lastOpenedAt = GeneratedColumn<DateTime>(
      'last_opened_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _addedAtMeta =
      const VerificationMeta('addedAt');
  @override
  late final GeneratedColumn<DateTime> addedAt = GeneratedColumn<DateTime>(
      'added_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        title,
        author,
        filePath,
        format,
        coverPath,
        seriesId,
        volumeIndex,
        fileSizeBytes,
        lastOpenedAt,
        addedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'books';
  @override
  VerificationContext validateIntegrity(Insertable<Book> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
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
    if (data.containsKey('file_path')) {
      context.handle(_filePathMeta,
          filePath.isAcceptableOrUnknown(data['file_path']!, _filePathMeta));
    } else if (isInserting) {
      context.missing(_filePathMeta);
    }
    if (data.containsKey('format')) {
      context.handle(_formatMeta,
          format.isAcceptableOrUnknown(data['format']!, _formatMeta));
    } else if (isInserting) {
      context.missing(_formatMeta);
    }
    if (data.containsKey('cover_path')) {
      context.handle(_coverPathMeta,
          coverPath.isAcceptableOrUnknown(data['cover_path']!, _coverPathMeta));
    }
    if (data.containsKey('series_id')) {
      context.handle(_seriesIdMeta,
          seriesId.isAcceptableOrUnknown(data['series_id']!, _seriesIdMeta));
    }
    if (data.containsKey('volume_index')) {
      context.handle(
          _volumeIndexMeta,
          volumeIndex.isAcceptableOrUnknown(
              data['volume_index']!, _volumeIndexMeta));
    }
    if (data.containsKey('file_size_bytes')) {
      context.handle(
          _fileSizeBytesMeta,
          fileSizeBytes.isAcceptableOrUnknown(
              data['file_size_bytes']!, _fileSizeBytesMeta));
    }
    if (data.containsKey('last_opened_at')) {
      context.handle(
          _lastOpenedAtMeta,
          lastOpenedAt.isAcceptableOrUnknown(
              data['last_opened_at']!, _lastOpenedAtMeta));
    }
    if (data.containsKey('added_at')) {
      context.handle(_addedAtMeta,
          addedAt.isAcceptableOrUnknown(data['added_at']!, _addedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Book map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Book(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      author: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}author'])!,
      filePath: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}file_path'])!,
      format: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}format'])!,
      coverPath: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}cover_path']),
      seriesId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}series_id']),
      volumeIndex: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}volume_index']),
      fileSizeBytes: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}file_size_bytes']),
      lastOpenedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}last_opened_at']),
      addedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}added_at'])!,
    );
  }

  @override
  $BooksTable createAlias(String alias) {
    return $BooksTable(attachedDatabase, alias);
  }
}

class Book extends DataClass implements Insertable<Book> {
  final int id;
  final String title;
  final String author;
  final String filePath;
  final String format;
  final String? coverPath;
  final int? seriesId;
  final int? volumeIndex;
  final int? fileSizeBytes;
  final DateTime? lastOpenedAt;
  final DateTime addedAt;
  const Book(
      {required this.id,
      required this.title,
      required this.author,
      required this.filePath,
      required this.format,
      this.coverPath,
      this.seriesId,
      this.volumeIndex,
      this.fileSizeBytes,
      this.lastOpenedAt,
      required this.addedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['title'] = Variable<String>(title);
    map['author'] = Variable<String>(author);
    map['file_path'] = Variable<String>(filePath);
    map['format'] = Variable<String>(format);
    if (!nullToAbsent || coverPath != null) {
      map['cover_path'] = Variable<String>(coverPath);
    }
    if (!nullToAbsent || seriesId != null) {
      map['series_id'] = Variable<int>(seriesId);
    }
    if (!nullToAbsent || volumeIndex != null) {
      map['volume_index'] = Variable<int>(volumeIndex);
    }
    if (!nullToAbsent || fileSizeBytes != null) {
      map['file_size_bytes'] = Variable<int>(fileSizeBytes);
    }
    if (!nullToAbsent || lastOpenedAt != null) {
      map['last_opened_at'] = Variable<DateTime>(lastOpenedAt);
    }
    map['added_at'] = Variable<DateTime>(addedAt);
    return map;
  }

  BooksCompanion toCompanion(bool nullToAbsent) {
    return BooksCompanion(
      id: Value(id),
      title: Value(title),
      author: Value(author),
      filePath: Value(filePath),
      format: Value(format),
      coverPath: coverPath == null && nullToAbsent
          ? const Value.absent()
          : Value(coverPath),
      seriesId: seriesId == null && nullToAbsent
          ? const Value.absent()
          : Value(seriesId),
      volumeIndex: volumeIndex == null && nullToAbsent
          ? const Value.absent()
          : Value(volumeIndex),
      fileSizeBytes: fileSizeBytes == null && nullToAbsent
          ? const Value.absent()
          : Value(fileSizeBytes),
      lastOpenedAt: lastOpenedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastOpenedAt),
      addedAt: Value(addedAt),
    );
  }

  factory Book.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Book(
      id: serializer.fromJson<int>(json['id']),
      title: serializer.fromJson<String>(json['title']),
      author: serializer.fromJson<String>(json['author']),
      filePath: serializer.fromJson<String>(json['filePath']),
      format: serializer.fromJson<String>(json['format']),
      coverPath: serializer.fromJson<String?>(json['coverPath']),
      seriesId: serializer.fromJson<int?>(json['seriesId']),
      volumeIndex: serializer.fromJson<int?>(json['volumeIndex']),
      fileSizeBytes: serializer.fromJson<int?>(json['fileSizeBytes']),
      lastOpenedAt: serializer.fromJson<DateTime?>(json['lastOpenedAt']),
      addedAt: serializer.fromJson<DateTime>(json['addedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'title': serializer.toJson<String>(title),
      'author': serializer.toJson<String>(author),
      'filePath': serializer.toJson<String>(filePath),
      'format': serializer.toJson<String>(format),
      'coverPath': serializer.toJson<String?>(coverPath),
      'seriesId': serializer.toJson<int?>(seriesId),
      'volumeIndex': serializer.toJson<int?>(volumeIndex),
      'fileSizeBytes': serializer.toJson<int?>(fileSizeBytes),
      'lastOpenedAt': serializer.toJson<DateTime?>(lastOpenedAt),
      'addedAt': serializer.toJson<DateTime>(addedAt),
    };
  }

  Book copyWith(
          {int? id,
          String? title,
          String? author,
          String? filePath,
          String? format,
          Value<String?> coverPath = const Value.absent(),
          Value<int?> seriesId = const Value.absent(),
          Value<int?> volumeIndex = const Value.absent(),
          Value<int?> fileSizeBytes = const Value.absent(),
          Value<DateTime?> lastOpenedAt = const Value.absent(),
          DateTime? addedAt}) =>
      Book(
        id: id ?? this.id,
        title: title ?? this.title,
        author: author ?? this.author,
        filePath: filePath ?? this.filePath,
        format: format ?? this.format,
        coverPath: coverPath.present ? coverPath.value : this.coverPath,
        seriesId: seriesId.present ? seriesId.value : this.seriesId,
        volumeIndex: volumeIndex.present ? volumeIndex.value : this.volumeIndex,
        fileSizeBytes:
            fileSizeBytes.present ? fileSizeBytes.value : this.fileSizeBytes,
        lastOpenedAt:
            lastOpenedAt.present ? lastOpenedAt.value : this.lastOpenedAt,
        addedAt: addedAt ?? this.addedAt,
      );
  Book copyWithCompanion(BooksCompanion data) {
    return Book(
      id: data.id.present ? data.id.value : this.id,
      title: data.title.present ? data.title.value : this.title,
      author: data.author.present ? data.author.value : this.author,
      filePath: data.filePath.present ? data.filePath.value : this.filePath,
      format: data.format.present ? data.format.value : this.format,
      coverPath: data.coverPath.present ? data.coverPath.value : this.coverPath,
      seriesId: data.seriesId.present ? data.seriesId.value : this.seriesId,
      volumeIndex:
          data.volumeIndex.present ? data.volumeIndex.value : this.volumeIndex,
      fileSizeBytes: data.fileSizeBytes.present
          ? data.fileSizeBytes.value
          : this.fileSizeBytes,
      lastOpenedAt: data.lastOpenedAt.present
          ? data.lastOpenedAt.value
          : this.lastOpenedAt,
      addedAt: data.addedAt.present ? data.addedAt.value : this.addedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Book(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('author: $author, ')
          ..write('filePath: $filePath, ')
          ..write('format: $format, ')
          ..write('coverPath: $coverPath, ')
          ..write('seriesId: $seriesId, ')
          ..write('volumeIndex: $volumeIndex, ')
          ..write('fileSizeBytes: $fileSizeBytes, ')
          ..write('lastOpenedAt: $lastOpenedAt, ')
          ..write('addedAt: $addedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, title, author, filePath, format,
      coverPath, seriesId, volumeIndex, fileSizeBytes, lastOpenedAt, addedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Book &&
          other.id == this.id &&
          other.title == this.title &&
          other.author == this.author &&
          other.filePath == this.filePath &&
          other.format == this.format &&
          other.coverPath == this.coverPath &&
          other.seriesId == this.seriesId &&
          other.volumeIndex == this.volumeIndex &&
          other.fileSizeBytes == this.fileSizeBytes &&
          other.lastOpenedAt == this.lastOpenedAt &&
          other.addedAt == this.addedAt);
}

class BooksCompanion extends UpdateCompanion<Book> {
  final Value<int> id;
  final Value<String> title;
  final Value<String> author;
  final Value<String> filePath;
  final Value<String> format;
  final Value<String?> coverPath;
  final Value<int?> seriesId;
  final Value<int?> volumeIndex;
  final Value<int?> fileSizeBytes;
  final Value<DateTime?> lastOpenedAt;
  final Value<DateTime> addedAt;
  const BooksCompanion({
    this.id = const Value.absent(),
    this.title = const Value.absent(),
    this.author = const Value.absent(),
    this.filePath = const Value.absent(),
    this.format = const Value.absent(),
    this.coverPath = const Value.absent(),
    this.seriesId = const Value.absent(),
    this.volumeIndex = const Value.absent(),
    this.fileSizeBytes = const Value.absent(),
    this.lastOpenedAt = const Value.absent(),
    this.addedAt = const Value.absent(),
  });
  BooksCompanion.insert({
    this.id = const Value.absent(),
    required String title,
    this.author = const Value.absent(),
    required String filePath,
    required String format,
    this.coverPath = const Value.absent(),
    this.seriesId = const Value.absent(),
    this.volumeIndex = const Value.absent(),
    this.fileSizeBytes = const Value.absent(),
    this.lastOpenedAt = const Value.absent(),
    this.addedAt = const Value.absent(),
  })  : title = Value(title),
        filePath = Value(filePath),
        format = Value(format);
  static Insertable<Book> custom({
    Expression<int>? id,
    Expression<String>? title,
    Expression<String>? author,
    Expression<String>? filePath,
    Expression<String>? format,
    Expression<String>? coverPath,
    Expression<int>? seriesId,
    Expression<int>? volumeIndex,
    Expression<int>? fileSizeBytes,
    Expression<DateTime>? lastOpenedAt,
    Expression<DateTime>? addedAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (title != null) 'title': title,
      if (author != null) 'author': author,
      if (filePath != null) 'file_path': filePath,
      if (format != null) 'format': format,
      if (coverPath != null) 'cover_path': coverPath,
      if (seriesId != null) 'series_id': seriesId,
      if (volumeIndex != null) 'volume_index': volumeIndex,
      if (fileSizeBytes != null) 'file_size_bytes': fileSizeBytes,
      if (lastOpenedAt != null) 'last_opened_at': lastOpenedAt,
      if (addedAt != null) 'added_at': addedAt,
    });
  }

  BooksCompanion copyWith(
      {Value<int>? id,
      Value<String>? title,
      Value<String>? author,
      Value<String>? filePath,
      Value<String>? format,
      Value<String?>? coverPath,
      Value<int?>? seriesId,
      Value<int?>? volumeIndex,
      Value<int?>? fileSizeBytes,
      Value<DateTime?>? lastOpenedAt,
      Value<DateTime>? addedAt}) {
    return BooksCompanion(
      id: id ?? this.id,
      title: title ?? this.title,
      author: author ?? this.author,
      filePath: filePath ?? this.filePath,
      format: format ?? this.format,
      coverPath: coverPath ?? this.coverPath,
      seriesId: seriesId ?? this.seriesId,
      volumeIndex: volumeIndex ?? this.volumeIndex,
      fileSizeBytes: fileSizeBytes ?? this.fileSizeBytes,
      lastOpenedAt: lastOpenedAt ?? this.lastOpenedAt,
      addedAt: addedAt ?? this.addedAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (author.present) {
      map['author'] = Variable<String>(author.value);
    }
    if (filePath.present) {
      map['file_path'] = Variable<String>(filePath.value);
    }
    if (format.present) {
      map['format'] = Variable<String>(format.value);
    }
    if (coverPath.present) {
      map['cover_path'] = Variable<String>(coverPath.value);
    }
    if (seriesId.present) {
      map['series_id'] = Variable<int>(seriesId.value);
    }
    if (volumeIndex.present) {
      map['volume_index'] = Variable<int>(volumeIndex.value);
    }
    if (fileSizeBytes.present) {
      map['file_size_bytes'] = Variable<int>(fileSizeBytes.value);
    }
    if (lastOpenedAt.present) {
      map['last_opened_at'] = Variable<DateTime>(lastOpenedAt.value);
    }
    if (addedAt.present) {
      map['added_at'] = Variable<DateTime>(addedAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('BooksCompanion(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('author: $author, ')
          ..write('filePath: $filePath, ')
          ..write('format: $format, ')
          ..write('coverPath: $coverPath, ')
          ..write('seriesId: $seriesId, ')
          ..write('volumeIndex: $volumeIndex, ')
          ..write('fileSizeBytes: $fileSizeBytes, ')
          ..write('lastOpenedAt: $lastOpenedAt, ')
          ..write('addedAt: $addedAt')
          ..write(')'))
        .toString();
  }
}

class $TagsTable extends Tags with TableInfo<$TagsTable, Tag> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $TagsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: true,
      defaultConstraints: GeneratedColumn.constraintIsAlways('UNIQUE'));
  static const VerificationMeta _colorMeta = const VerificationMeta('color');
  @override
  late final GeneratedColumn<String> color = GeneratedColumn<String>(
      'color', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [id, name, color];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'tags';
  @override
  VerificationContext validateIntegrity(Insertable<Tag> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('color')) {
      context.handle(
          _colorMeta, color.isAcceptableOrUnknown(data['color']!, _colorMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Tag map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Tag(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      color: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}color']),
    );
  }

  @override
  $TagsTable createAlias(String alias) {
    return $TagsTable(attachedDatabase, alias);
  }
}

class Tag extends DataClass implements Insertable<Tag> {
  final int id;
  final String name;
  final String? color;
  const Tag({required this.id, required this.name, this.color});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || color != null) {
      map['color'] = Variable<String>(color);
    }
    return map;
  }

  TagsCompanion toCompanion(bool nullToAbsent) {
    return TagsCompanion(
      id: Value(id),
      name: Value(name),
      color:
          color == null && nullToAbsent ? const Value.absent() : Value(color),
    );
  }

  factory Tag.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Tag(
      id: serializer.fromJson<int>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      color: serializer.fromJson<String?>(json['color']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'name': serializer.toJson<String>(name),
      'color': serializer.toJson<String?>(color),
    };
  }

  Tag copyWith(
          {int? id,
          String? name,
          Value<String?> color = const Value.absent()}) =>
      Tag(
        id: id ?? this.id,
        name: name ?? this.name,
        color: color.present ? color.value : this.color,
      );
  Tag copyWithCompanion(TagsCompanion data) {
    return Tag(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      color: data.color.present ? data.color.value : this.color,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Tag(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('color: $color')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, color);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Tag &&
          other.id == this.id &&
          other.name == this.name &&
          other.color == this.color);
}

class TagsCompanion extends UpdateCompanion<Tag> {
  final Value<int> id;
  final Value<String> name;
  final Value<String?> color;
  const TagsCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.color = const Value.absent(),
  });
  TagsCompanion.insert({
    this.id = const Value.absent(),
    required String name,
    this.color = const Value.absent(),
  }) : name = Value(name);
  static Insertable<Tag> custom({
    Expression<int>? id,
    Expression<String>? name,
    Expression<String>? color,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (color != null) 'color': color,
    });
  }

  TagsCompanion copyWith(
      {Value<int>? id, Value<String>? name, Value<String?>? color}) {
    return TagsCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      color: color ?? this.color,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (color.present) {
      map['color'] = Variable<String>(color.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('TagsCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('color: $color')
          ..write(')'))
        .toString();
  }
}

class $BookTagsTable extends BookTags with TableInfo<$BookTagsTable, BookTag> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $BookTagsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _bookIdMeta = const VerificationMeta('bookId');
  @override
  late final GeneratedColumn<int> bookId = GeneratedColumn<int>(
      'book_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES books (id)'));
  static const VerificationMeta _tagIdMeta = const VerificationMeta('tagId');
  @override
  late final GeneratedColumn<int> tagId = GeneratedColumn<int>(
      'tag_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES tags (id)'));
  @override
  List<GeneratedColumn> get $columns => [bookId, tagId];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'book_tags';
  @override
  VerificationContext validateIntegrity(Insertable<BookTag> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('book_id')) {
      context.handle(_bookIdMeta,
          bookId.isAcceptableOrUnknown(data['book_id']!, _bookIdMeta));
    } else if (isInserting) {
      context.missing(_bookIdMeta);
    }
    if (data.containsKey('tag_id')) {
      context.handle(
          _tagIdMeta, tagId.isAcceptableOrUnknown(data['tag_id']!, _tagIdMeta));
    } else if (isInserting) {
      context.missing(_tagIdMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {bookId, tagId};
  @override
  BookTag map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return BookTag(
      bookId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}book_id'])!,
      tagId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}tag_id'])!,
    );
  }

  @override
  $BookTagsTable createAlias(String alias) {
    return $BookTagsTable(attachedDatabase, alias);
  }
}

class BookTag extends DataClass implements Insertable<BookTag> {
  final int bookId;
  final int tagId;
  const BookTag({required this.bookId, required this.tagId});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['book_id'] = Variable<int>(bookId);
    map['tag_id'] = Variable<int>(tagId);
    return map;
  }

  BookTagsCompanion toCompanion(bool nullToAbsent) {
    return BookTagsCompanion(
      bookId: Value(bookId),
      tagId: Value(tagId),
    );
  }

  factory BookTag.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return BookTag(
      bookId: serializer.fromJson<int>(json['bookId']),
      tagId: serializer.fromJson<int>(json['tagId']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'bookId': serializer.toJson<int>(bookId),
      'tagId': serializer.toJson<int>(tagId),
    };
  }

  BookTag copyWith({int? bookId, int? tagId}) => BookTag(
        bookId: bookId ?? this.bookId,
        tagId: tagId ?? this.tagId,
      );
  BookTag copyWithCompanion(BookTagsCompanion data) {
    return BookTag(
      bookId: data.bookId.present ? data.bookId.value : this.bookId,
      tagId: data.tagId.present ? data.tagId.value : this.tagId,
    );
  }

  @override
  String toString() {
    return (StringBuffer('BookTag(')
          ..write('bookId: $bookId, ')
          ..write('tagId: $tagId')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(bookId, tagId);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is BookTag &&
          other.bookId == this.bookId &&
          other.tagId == this.tagId);
}

class BookTagsCompanion extends UpdateCompanion<BookTag> {
  final Value<int> bookId;
  final Value<int> tagId;
  final Value<int> rowid;
  const BookTagsCompanion({
    this.bookId = const Value.absent(),
    this.tagId = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  BookTagsCompanion.insert({
    required int bookId,
    required int tagId,
    this.rowid = const Value.absent(),
  })  : bookId = Value(bookId),
        tagId = Value(tagId);
  static Insertable<BookTag> custom({
    Expression<int>? bookId,
    Expression<int>? tagId,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (bookId != null) 'book_id': bookId,
      if (tagId != null) 'tag_id': tagId,
      if (rowid != null) 'rowid': rowid,
    });
  }

  BookTagsCompanion copyWith(
      {Value<int>? bookId, Value<int>? tagId, Value<int>? rowid}) {
    return BookTagsCompanion(
      bookId: bookId ?? this.bookId,
      tagId: tagId ?? this.tagId,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (bookId.present) {
      map['book_id'] = Variable<int>(bookId.value);
    }
    if (tagId.present) {
      map['tag_id'] = Variable<int>(tagId.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('BookTagsCompanion(')
          ..write('bookId: $bookId, ')
          ..write('tagId: $tagId, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $ReadingProgressTableTable extends ReadingProgressTable
    with TableInfo<$ReadingProgressTableTable, ReadingProgressTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ReadingProgressTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _bookIdMeta = const VerificationMeta('bookId');
  @override
  late final GeneratedColumn<int> bookId = GeneratedColumn<int>(
      'book_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES books (id)'));
  static const VerificationMeta _positionMeta =
      const VerificationMeta('position');
  @override
  late final GeneratedColumn<String> position = GeneratedColumn<String>(
      'position', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _percentageMeta =
      const VerificationMeta('percentage');
  @override
  late final GeneratedColumn<double> percentage = GeneratedColumn<double>(
      'percentage', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _chapterIndexMeta =
      const VerificationMeta('chapterIndex');
  @override
  late final GeneratedColumn<int> chapterIndex = GeneratedColumn<int>(
      'chapter_index', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _chapterTitleMeta =
      const VerificationMeta('chapterTitle');
  @override
  late final GeneratedColumn<String> chapterTitle = GeneratedColumn<String>(
      'chapter_title', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _scrollOffsetMeta =
      const VerificationMeta('scrollOffset');
  @override
  late final GeneratedColumn<double> scrollOffset = GeneratedColumn<double>(
      'scroll_offset', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        bookId,
        position,
        percentage,
        chapterIndex,
        chapterTitle,
        scrollOffset,
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'reading_progress_table';
  @override
  VerificationContext validateIntegrity(
      Insertable<ReadingProgressTableData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('book_id')) {
      context.handle(_bookIdMeta,
          bookId.isAcceptableOrUnknown(data['book_id']!, _bookIdMeta));
    } else if (isInserting) {
      context.missing(_bookIdMeta);
    }
    if (data.containsKey('position')) {
      context.handle(_positionMeta,
          position.isAcceptableOrUnknown(data['position']!, _positionMeta));
    }
    if (data.containsKey('percentage')) {
      context.handle(
          _percentageMeta,
          percentage.isAcceptableOrUnknown(
              data['percentage']!, _percentageMeta));
    }
    if (data.containsKey('chapter_index')) {
      context.handle(
          _chapterIndexMeta,
          chapterIndex.isAcceptableOrUnknown(
              data['chapter_index']!, _chapterIndexMeta));
    }
    if (data.containsKey('chapter_title')) {
      context.handle(
          _chapterTitleMeta,
          chapterTitle.isAcceptableOrUnknown(
              data['chapter_title']!, _chapterTitleMeta));
    }
    if (data.containsKey('scroll_offset')) {
      context.handle(
          _scrollOffsetMeta,
          scrollOffset.isAcceptableOrUnknown(
              data['scroll_offset']!, _scrollOffsetMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ReadingProgressTableData map(Map<String, dynamic> data,
      {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ReadingProgressTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      bookId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}book_id'])!,
      position: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}position']),
      percentage: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}percentage']),
      chapterIndex: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}chapter_index']),
      chapterTitle: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}chapter_title']),
      scrollOffset: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}scroll_offset']),
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at']),
    );
  }

  @override
  $ReadingProgressTableTable createAlias(String alias) {
    return $ReadingProgressTableTable(attachedDatabase, alias);
  }
}

class ReadingProgressTableData extends DataClass
    implements Insertable<ReadingProgressTableData> {
  final int id;
  final int bookId;
  final String? position;
  final double? percentage;
  final int? chapterIndex;
  final String? chapterTitle;
  final double? scrollOffset;
  final DateTime? updatedAt;
  const ReadingProgressTableData(
      {required this.id,
      required this.bookId,
      this.position,
      this.percentage,
      this.chapterIndex,
      this.chapterTitle,
      this.scrollOffset,
      this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['book_id'] = Variable<int>(bookId);
    if (!nullToAbsent || position != null) {
      map['position'] = Variable<String>(position);
    }
    if (!nullToAbsent || percentage != null) {
      map['percentage'] = Variable<double>(percentage);
    }
    if (!nullToAbsent || chapterIndex != null) {
      map['chapter_index'] = Variable<int>(chapterIndex);
    }
    if (!nullToAbsent || chapterTitle != null) {
      map['chapter_title'] = Variable<String>(chapterTitle);
    }
    if (!nullToAbsent || scrollOffset != null) {
      map['scroll_offset'] = Variable<double>(scrollOffset);
    }
    if (!nullToAbsent || updatedAt != null) {
      map['updated_at'] = Variable<DateTime>(updatedAt);
    }
    return map;
  }

  ReadingProgressTableCompanion toCompanion(bool nullToAbsent) {
    return ReadingProgressTableCompanion(
      id: Value(id),
      bookId: Value(bookId),
      position: position == null && nullToAbsent
          ? const Value.absent()
          : Value(position),
      percentage: percentage == null && nullToAbsent
          ? const Value.absent()
          : Value(percentage),
      chapterIndex: chapterIndex == null && nullToAbsent
          ? const Value.absent()
          : Value(chapterIndex),
      chapterTitle: chapterTitle == null && nullToAbsent
          ? const Value.absent()
          : Value(chapterTitle),
      scrollOffset: scrollOffset == null && nullToAbsent
          ? const Value.absent()
          : Value(scrollOffset),
      updatedAt: updatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(updatedAt),
    );
  }

  factory ReadingProgressTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ReadingProgressTableData(
      id: serializer.fromJson<int>(json['id']),
      bookId: serializer.fromJson<int>(json['bookId']),
      position: serializer.fromJson<String?>(json['position']),
      percentage: serializer.fromJson<double?>(json['percentage']),
      chapterIndex: serializer.fromJson<int?>(json['chapterIndex']),
      chapterTitle: serializer.fromJson<String?>(json['chapterTitle']),
      scrollOffset: serializer.fromJson<double?>(json['scrollOffset']),
      updatedAt: serializer.fromJson<DateTime?>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'bookId': serializer.toJson<int>(bookId),
      'position': serializer.toJson<String?>(position),
      'percentage': serializer.toJson<double?>(percentage),
      'chapterIndex': serializer.toJson<int?>(chapterIndex),
      'chapterTitle': serializer.toJson<String?>(chapterTitle),
      'scrollOffset': serializer.toJson<double?>(scrollOffset),
      'updatedAt': serializer.toJson<DateTime?>(updatedAt),
    };
  }

  ReadingProgressTableData copyWith(
          {int? id,
          int? bookId,
          Value<String?> position = const Value.absent(),
          Value<double?> percentage = const Value.absent(),
          Value<int?> chapterIndex = const Value.absent(),
          Value<String?> chapterTitle = const Value.absent(),
          Value<double?> scrollOffset = const Value.absent(),
          Value<DateTime?> updatedAt = const Value.absent()}) =>
      ReadingProgressTableData(
        id: id ?? this.id,
        bookId: bookId ?? this.bookId,
        position: position.present ? position.value : this.position,
        percentage: percentage.present ? percentage.value : this.percentage,
        chapterIndex:
            chapterIndex.present ? chapterIndex.value : this.chapterIndex,
        chapterTitle:
            chapterTitle.present ? chapterTitle.value : this.chapterTitle,
        scrollOffset:
            scrollOffset.present ? scrollOffset.value : this.scrollOffset,
        updatedAt: updatedAt.present ? updatedAt.value : this.updatedAt,
      );
  ReadingProgressTableData copyWithCompanion(
      ReadingProgressTableCompanion data) {
    return ReadingProgressTableData(
      id: data.id.present ? data.id.value : this.id,
      bookId: data.bookId.present ? data.bookId.value : this.bookId,
      position: data.position.present ? data.position.value : this.position,
      percentage:
          data.percentage.present ? data.percentage.value : this.percentage,
      chapterIndex: data.chapterIndex.present
          ? data.chapterIndex.value
          : this.chapterIndex,
      chapterTitle: data.chapterTitle.present
          ? data.chapterTitle.value
          : this.chapterTitle,
      scrollOffset: data.scrollOffset.present
          ? data.scrollOffset.value
          : this.scrollOffset,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ReadingProgressTableData(')
          ..write('id: $id, ')
          ..write('bookId: $bookId, ')
          ..write('position: $position, ')
          ..write('percentage: $percentage, ')
          ..write('chapterIndex: $chapterIndex, ')
          ..write('chapterTitle: $chapterTitle, ')
          ..write('scrollOffset: $scrollOffset, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, bookId, position, percentage,
      chapterIndex, chapterTitle, scrollOffset, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ReadingProgressTableData &&
          other.id == this.id &&
          other.bookId == this.bookId &&
          other.position == this.position &&
          other.percentage == this.percentage &&
          other.chapterIndex == this.chapterIndex &&
          other.chapterTitle == this.chapterTitle &&
          other.scrollOffset == this.scrollOffset &&
          other.updatedAt == this.updatedAt);
}

class ReadingProgressTableCompanion
    extends UpdateCompanion<ReadingProgressTableData> {
  final Value<int> id;
  final Value<int> bookId;
  final Value<String?> position;
  final Value<double?> percentage;
  final Value<int?> chapterIndex;
  final Value<String?> chapterTitle;
  final Value<double?> scrollOffset;
  final Value<DateTime?> updatedAt;
  const ReadingProgressTableCompanion({
    this.id = const Value.absent(),
    this.bookId = const Value.absent(),
    this.position = const Value.absent(),
    this.percentage = const Value.absent(),
    this.chapterIndex = const Value.absent(),
    this.chapterTitle = const Value.absent(),
    this.scrollOffset = const Value.absent(),
    this.updatedAt = const Value.absent(),
  });
  ReadingProgressTableCompanion.insert({
    this.id = const Value.absent(),
    required int bookId,
    this.position = const Value.absent(),
    this.percentage = const Value.absent(),
    this.chapterIndex = const Value.absent(),
    this.chapterTitle = const Value.absent(),
    this.scrollOffset = const Value.absent(),
    this.updatedAt = const Value.absent(),
  }) : bookId = Value(bookId);
  static Insertable<ReadingProgressTableData> custom({
    Expression<int>? id,
    Expression<int>? bookId,
    Expression<String>? position,
    Expression<double>? percentage,
    Expression<int>? chapterIndex,
    Expression<String>? chapterTitle,
    Expression<double>? scrollOffset,
    Expression<DateTime>? updatedAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (bookId != null) 'book_id': bookId,
      if (position != null) 'position': position,
      if (percentage != null) 'percentage': percentage,
      if (chapterIndex != null) 'chapter_index': chapterIndex,
      if (chapterTitle != null) 'chapter_title': chapterTitle,
      if (scrollOffset != null) 'scroll_offset': scrollOffset,
      if (updatedAt != null) 'updated_at': updatedAt,
    });
  }

  ReadingProgressTableCompanion copyWith(
      {Value<int>? id,
      Value<int>? bookId,
      Value<String?>? position,
      Value<double?>? percentage,
      Value<int?>? chapterIndex,
      Value<String?>? chapterTitle,
      Value<double?>? scrollOffset,
      Value<DateTime?>? updatedAt}) {
    return ReadingProgressTableCompanion(
      id: id ?? this.id,
      bookId: bookId ?? this.bookId,
      position: position ?? this.position,
      percentage: percentage ?? this.percentage,
      chapterIndex: chapterIndex ?? this.chapterIndex,
      chapterTitle: chapterTitle ?? this.chapterTitle,
      scrollOffset: scrollOffset ?? this.scrollOffset,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (bookId.present) {
      map['book_id'] = Variable<int>(bookId.value);
    }
    if (position.present) {
      map['position'] = Variable<String>(position.value);
    }
    if (percentage.present) {
      map['percentage'] = Variable<double>(percentage.value);
    }
    if (chapterIndex.present) {
      map['chapter_index'] = Variable<int>(chapterIndex.value);
    }
    if (chapterTitle.present) {
      map['chapter_title'] = Variable<String>(chapterTitle.value);
    }
    if (scrollOffset.present) {
      map['scroll_offset'] = Variable<double>(scrollOffset.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ReadingProgressTableCompanion(')
          ..write('id: $id, ')
          ..write('bookId: $bookId, ')
          ..write('position: $position, ')
          ..write('percentage: $percentage, ')
          ..write('chapterIndex: $chapterIndex, ')
          ..write('chapterTitle: $chapterTitle, ')
          ..write('scrollOffset: $scrollOffset, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }
}

class $NotesTable extends Notes with TableInfo<$NotesTable, Note> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $NotesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _bookIdMeta = const VerificationMeta('bookId');
  @override
  late final GeneratedColumn<int> bookId = GeneratedColumn<int>(
      'book_id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: true,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('REFERENCES books (id)'));
  static const VerificationMeta _typeMeta = const VerificationMeta('type');
  @override
  late final GeneratedColumn<String> type = GeneratedColumn<String>(
      'type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _contentMeta =
      const VerificationMeta('content');
  @override
  late final GeneratedColumn<String> content = GeneratedColumn<String>(
      'content', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _highlightTextMeta =
      const VerificationMeta('highlightText');
  @override
  late final GeneratedColumn<String> highlightText = GeneratedColumn<String>(
      'highlight_text', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _positionMeta =
      const VerificationMeta('position');
  @override
  late final GeneratedColumn<String> position = GeneratedColumn<String>(
      'position', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _chapterIndexMeta =
      const VerificationMeta('chapterIndex');
  @override
  late final GeneratedColumn<int> chapterIndex = GeneratedColumn<int>(
      'chapter_index', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime,
      requiredDuringInsert: false,
      defaultValue: currentDateAndTime);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        bookId,
        type,
        content,
        highlightText,
        position,
        chapterIndex,
        createdAt,
        updatedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'notes';
  @override
  VerificationContext validateIntegrity(Insertable<Note> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('book_id')) {
      context.handle(_bookIdMeta,
          bookId.isAcceptableOrUnknown(data['book_id']!, _bookIdMeta));
    } else if (isInserting) {
      context.missing(_bookIdMeta);
    }
    if (data.containsKey('type')) {
      context.handle(
          _typeMeta, type.isAcceptableOrUnknown(data['type']!, _typeMeta));
    } else if (isInserting) {
      context.missing(_typeMeta);
    }
    if (data.containsKey('content')) {
      context.handle(_contentMeta,
          content.isAcceptableOrUnknown(data['content']!, _contentMeta));
    }
    if (data.containsKey('highlight_text')) {
      context.handle(
          _highlightTextMeta,
          highlightText.isAcceptableOrUnknown(
              data['highlight_text']!, _highlightTextMeta));
    }
    if (data.containsKey('position')) {
      context.handle(_positionMeta,
          position.isAcceptableOrUnknown(data['position']!, _positionMeta));
    }
    if (data.containsKey('chapter_index')) {
      context.handle(
          _chapterIndexMeta,
          chapterIndex.isAcceptableOrUnknown(
              data['chapter_index']!, _chapterIndexMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Note map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Note(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      bookId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}book_id'])!,
      type: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}type'])!,
      content: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}content']),
      highlightText: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}highlight_text']),
      position: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}position']),
      chapterIndex: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}chapter_index']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at']),
    );
  }

  @override
  $NotesTable createAlias(String alias) {
    return $NotesTable(attachedDatabase, alias);
  }
}

class Note extends DataClass implements Insertable<Note> {
  final int id;
  final int bookId;
  final String type;
  final String? content;
  final String? highlightText;
  final String? position;
  final int? chapterIndex;
  final DateTime createdAt;
  final DateTime? updatedAt;
  const Note(
      {required this.id,
      required this.bookId,
      required this.type,
      this.content,
      this.highlightText,
      this.position,
      this.chapterIndex,
      required this.createdAt,
      this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['book_id'] = Variable<int>(bookId);
    map['type'] = Variable<String>(type);
    if (!nullToAbsent || content != null) {
      map['content'] = Variable<String>(content);
    }
    if (!nullToAbsent || highlightText != null) {
      map['highlight_text'] = Variable<String>(highlightText);
    }
    if (!nullToAbsent || position != null) {
      map['position'] = Variable<String>(position);
    }
    if (!nullToAbsent || chapterIndex != null) {
      map['chapter_index'] = Variable<int>(chapterIndex);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    if (!nullToAbsent || updatedAt != null) {
      map['updated_at'] = Variable<DateTime>(updatedAt);
    }
    return map;
  }

  NotesCompanion toCompanion(bool nullToAbsent) {
    return NotesCompanion(
      id: Value(id),
      bookId: Value(bookId),
      type: Value(type),
      content: content == null && nullToAbsent
          ? const Value.absent()
          : Value(content),
      highlightText: highlightText == null && nullToAbsent
          ? const Value.absent()
          : Value(highlightText),
      position: position == null && nullToAbsent
          ? const Value.absent()
          : Value(position),
      chapterIndex: chapterIndex == null && nullToAbsent
          ? const Value.absent()
          : Value(chapterIndex),
      createdAt: Value(createdAt),
      updatedAt: updatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(updatedAt),
    );
  }

  factory Note.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Note(
      id: serializer.fromJson<int>(json['id']),
      bookId: serializer.fromJson<int>(json['bookId']),
      type: serializer.fromJson<String>(json['type']),
      content: serializer.fromJson<String?>(json['content']),
      highlightText: serializer.fromJson<String?>(json['highlightText']),
      position: serializer.fromJson<String?>(json['position']),
      chapterIndex: serializer.fromJson<int?>(json['chapterIndex']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime?>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'bookId': serializer.toJson<int>(bookId),
      'type': serializer.toJson<String>(type),
      'content': serializer.toJson<String?>(content),
      'highlightText': serializer.toJson<String?>(highlightText),
      'position': serializer.toJson<String?>(position),
      'chapterIndex': serializer.toJson<int?>(chapterIndex),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime?>(updatedAt),
    };
  }

  Note copyWith(
          {int? id,
          int? bookId,
          String? type,
          Value<String?> content = const Value.absent(),
          Value<String?> highlightText = const Value.absent(),
          Value<String?> position = const Value.absent(),
          Value<int?> chapterIndex = const Value.absent(),
          DateTime? createdAt,
          Value<DateTime?> updatedAt = const Value.absent()}) =>
      Note(
        id: id ?? this.id,
        bookId: bookId ?? this.bookId,
        type: type ?? this.type,
        content: content.present ? content.value : this.content,
        highlightText:
            highlightText.present ? highlightText.value : this.highlightText,
        position: position.present ? position.value : this.position,
        chapterIndex:
            chapterIndex.present ? chapterIndex.value : this.chapterIndex,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt.present ? updatedAt.value : this.updatedAt,
      );
  Note copyWithCompanion(NotesCompanion data) {
    return Note(
      id: data.id.present ? data.id.value : this.id,
      bookId: data.bookId.present ? data.bookId.value : this.bookId,
      type: data.type.present ? data.type.value : this.type,
      content: data.content.present ? data.content.value : this.content,
      highlightText: data.highlightText.present
          ? data.highlightText.value
          : this.highlightText,
      position: data.position.present ? data.position.value : this.position,
      chapterIndex: data.chapterIndex.present
          ? data.chapterIndex.value
          : this.chapterIndex,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Note(')
          ..write('id: $id, ')
          ..write('bookId: $bookId, ')
          ..write('type: $type, ')
          ..write('content: $content, ')
          ..write('highlightText: $highlightText, ')
          ..write('position: $position, ')
          ..write('chapterIndex: $chapterIndex, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, bookId, type, content, highlightText,
      position, chapterIndex, createdAt, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Note &&
          other.id == this.id &&
          other.bookId == this.bookId &&
          other.type == this.type &&
          other.content == this.content &&
          other.highlightText == this.highlightText &&
          other.position == this.position &&
          other.chapterIndex == this.chapterIndex &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class NotesCompanion extends UpdateCompanion<Note> {
  final Value<int> id;
  final Value<int> bookId;
  final Value<String> type;
  final Value<String?> content;
  final Value<String?> highlightText;
  final Value<String?> position;
  final Value<int?> chapterIndex;
  final Value<DateTime> createdAt;
  final Value<DateTime?> updatedAt;
  const NotesCompanion({
    this.id = const Value.absent(),
    this.bookId = const Value.absent(),
    this.type = const Value.absent(),
    this.content = const Value.absent(),
    this.highlightText = const Value.absent(),
    this.position = const Value.absent(),
    this.chapterIndex = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
  });
  NotesCompanion.insert({
    this.id = const Value.absent(),
    required int bookId,
    required String type,
    this.content = const Value.absent(),
    this.highlightText = const Value.absent(),
    this.position = const Value.absent(),
    this.chapterIndex = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
  })  : bookId = Value(bookId),
        type = Value(type);
  static Insertable<Note> custom({
    Expression<int>? id,
    Expression<int>? bookId,
    Expression<String>? type,
    Expression<String>? content,
    Expression<String>? highlightText,
    Expression<String>? position,
    Expression<int>? chapterIndex,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (bookId != null) 'book_id': bookId,
      if (type != null) 'type': type,
      if (content != null) 'content': content,
      if (highlightText != null) 'highlight_text': highlightText,
      if (position != null) 'position': position,
      if (chapterIndex != null) 'chapter_index': chapterIndex,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
    });
  }

  NotesCompanion copyWith(
      {Value<int>? id,
      Value<int>? bookId,
      Value<String>? type,
      Value<String?>? content,
      Value<String?>? highlightText,
      Value<String?>? position,
      Value<int?>? chapterIndex,
      Value<DateTime>? createdAt,
      Value<DateTime?>? updatedAt}) {
    return NotesCompanion(
      id: id ?? this.id,
      bookId: bookId ?? this.bookId,
      type: type ?? this.type,
      content: content ?? this.content,
      highlightText: highlightText ?? this.highlightText,
      position: position ?? this.position,
      chapterIndex: chapterIndex ?? this.chapterIndex,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (bookId.present) {
      map['book_id'] = Variable<int>(bookId.value);
    }
    if (type.present) {
      map['type'] = Variable<String>(type.value);
    }
    if (content.present) {
      map['content'] = Variable<String>(content.value);
    }
    if (highlightText.present) {
      map['highlight_text'] = Variable<String>(highlightText.value);
    }
    if (position.present) {
      map['position'] = Variable<String>(position.value);
    }
    if (chapterIndex.present) {
      map['chapter_index'] = Variable<int>(chapterIndex.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('NotesCompanion(')
          ..write('id: $id, ')
          ..write('bookId: $bookId, ')
          ..write('type: $type, ')
          ..write('content: $content, ')
          ..write('highlightText: $highlightText, ')
          ..write('position: $position, ')
          ..write('chapterIndex: $chapterIndex, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }
}

class $ShelfPreferencesTableTable extends ShelfPreferencesTable
    with TableInfo<$ShelfPreferencesTableTable, ShelfPreferencesTableData> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $ShelfPreferencesTableTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _sortByMeta = const VerificationMeta('sortBy');
  @override
  late final GeneratedColumn<String> sortBy = GeneratedColumn<String>(
      'sort_by', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _sortAscendingMeta =
      const VerificationMeta('sortAscending');
  @override
  late final GeneratedColumn<bool> sortAscending = GeneratedColumn<bool>(
      'sort_ascending', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("sort_ascending" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _filterFormatMeta =
      const VerificationMeta('filterFormat');
  @override
  late final GeneratedColumn<String> filterFormat = GeneratedColumn<String>(
      'filter_format', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _filterSeriesIdMeta =
      const VerificationMeta('filterSeriesId');
  @override
  late final GeneratedColumn<int> filterSeriesId = GeneratedColumn<int>(
      'filter_series_id', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _filterTagIdMeta =
      const VerificationMeta('filterTagId');
  @override
  late final GeneratedColumn<int> filterTagId = GeneratedColumn<int>(
      'filter_tag_id', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _viewModeMeta =
      const VerificationMeta('viewMode');
  @override
  late final GeneratedColumn<String> viewMode = GeneratedColumn<String>(
      'view_mode', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('grid'));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        sortBy,
        sortAscending,
        filterFormat,
        filterSeriesId,
        filterTagId,
        viewMode
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'shelf_preferences_table';
  @override
  VerificationContext validateIntegrity(
      Insertable<ShelfPreferencesTableData> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('sort_by')) {
      context.handle(_sortByMeta,
          sortBy.isAcceptableOrUnknown(data['sort_by']!, _sortByMeta));
    }
    if (data.containsKey('sort_ascending')) {
      context.handle(
          _sortAscendingMeta,
          sortAscending.isAcceptableOrUnknown(
              data['sort_ascending']!, _sortAscendingMeta));
    }
    if (data.containsKey('filter_format')) {
      context.handle(
          _filterFormatMeta,
          filterFormat.isAcceptableOrUnknown(
              data['filter_format']!, _filterFormatMeta));
    }
    if (data.containsKey('filter_series_id')) {
      context.handle(
          _filterSeriesIdMeta,
          filterSeriesId.isAcceptableOrUnknown(
              data['filter_series_id']!, _filterSeriesIdMeta));
    }
    if (data.containsKey('filter_tag_id')) {
      context.handle(
          _filterTagIdMeta,
          filterTagId.isAcceptableOrUnknown(
              data['filter_tag_id']!, _filterTagIdMeta));
    }
    if (data.containsKey('view_mode')) {
      context.handle(_viewModeMeta,
          viewMode.isAcceptableOrUnknown(data['view_mode']!, _viewModeMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  ShelfPreferencesTableData map(Map<String, dynamic> data,
      {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return ShelfPreferencesTableData(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      sortBy: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}sort_by']),
      sortAscending: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}sort_ascending'])!,
      filterFormat: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}filter_format']),
      filterSeriesId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}filter_series_id']),
      filterTagId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}filter_tag_id']),
      viewMode: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}view_mode'])!,
    );
  }

  @override
  $ShelfPreferencesTableTable createAlias(String alias) {
    return $ShelfPreferencesTableTable(attachedDatabase, alias);
  }
}

class ShelfPreferencesTableData extends DataClass
    implements Insertable<ShelfPreferencesTableData> {
  final int id;
  final String? sortBy;
  final bool sortAscending;
  final String? filterFormat;
  final int? filterSeriesId;
  final int? filterTagId;
  final String viewMode;
  const ShelfPreferencesTableData(
      {required this.id,
      this.sortBy,
      required this.sortAscending,
      this.filterFormat,
      this.filterSeriesId,
      this.filterTagId,
      required this.viewMode});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || sortBy != null) {
      map['sort_by'] = Variable<String>(sortBy);
    }
    map['sort_ascending'] = Variable<bool>(sortAscending);
    if (!nullToAbsent || filterFormat != null) {
      map['filter_format'] = Variable<String>(filterFormat);
    }
    if (!nullToAbsent || filterSeriesId != null) {
      map['filter_series_id'] = Variable<int>(filterSeriesId);
    }
    if (!nullToAbsent || filterTagId != null) {
      map['filter_tag_id'] = Variable<int>(filterTagId);
    }
    map['view_mode'] = Variable<String>(viewMode);
    return map;
  }

  ShelfPreferencesTableCompanion toCompanion(bool nullToAbsent) {
    return ShelfPreferencesTableCompanion(
      id: Value(id),
      sortBy:
          sortBy == null && nullToAbsent ? const Value.absent() : Value(sortBy),
      sortAscending: Value(sortAscending),
      filterFormat: filterFormat == null && nullToAbsent
          ? const Value.absent()
          : Value(filterFormat),
      filterSeriesId: filterSeriesId == null && nullToAbsent
          ? const Value.absent()
          : Value(filterSeriesId),
      filterTagId: filterTagId == null && nullToAbsent
          ? const Value.absent()
          : Value(filterTagId),
      viewMode: Value(viewMode),
    );
  }

  factory ShelfPreferencesTableData.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return ShelfPreferencesTableData(
      id: serializer.fromJson<int>(json['id']),
      sortBy: serializer.fromJson<String?>(json['sortBy']),
      sortAscending: serializer.fromJson<bool>(json['sortAscending']),
      filterFormat: serializer.fromJson<String?>(json['filterFormat']),
      filterSeriesId: serializer.fromJson<int?>(json['filterSeriesId']),
      filterTagId: serializer.fromJson<int?>(json['filterTagId']),
      viewMode: serializer.fromJson<String>(json['viewMode']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'sortBy': serializer.toJson<String?>(sortBy),
      'sortAscending': serializer.toJson<bool>(sortAscending),
      'filterFormat': serializer.toJson<String?>(filterFormat),
      'filterSeriesId': serializer.toJson<int?>(filterSeriesId),
      'filterTagId': serializer.toJson<int?>(filterTagId),
      'viewMode': serializer.toJson<String>(viewMode),
    };
  }

  ShelfPreferencesTableData copyWith(
          {int? id,
          Value<String?> sortBy = const Value.absent(),
          bool? sortAscending,
          Value<String?> filterFormat = const Value.absent(),
          Value<int?> filterSeriesId = const Value.absent(),
          Value<int?> filterTagId = const Value.absent(),
          String? viewMode}) =>
      ShelfPreferencesTableData(
        id: id ?? this.id,
        sortBy: sortBy.present ? sortBy.value : this.sortBy,
        sortAscending: sortAscending ?? this.sortAscending,
        filterFormat:
            filterFormat.present ? filterFormat.value : this.filterFormat,
        filterSeriesId:
            filterSeriesId.present ? filterSeriesId.value : this.filterSeriesId,
        filterTagId: filterTagId.present ? filterTagId.value : this.filterTagId,
        viewMode: viewMode ?? this.viewMode,
      );
  ShelfPreferencesTableData copyWithCompanion(
      ShelfPreferencesTableCompanion data) {
    return ShelfPreferencesTableData(
      id: data.id.present ? data.id.value : this.id,
      sortBy: data.sortBy.present ? data.sortBy.value : this.sortBy,
      sortAscending: data.sortAscending.present
          ? data.sortAscending.value
          : this.sortAscending,
      filterFormat: data.filterFormat.present
          ? data.filterFormat.value
          : this.filterFormat,
      filterSeriesId: data.filterSeriesId.present
          ? data.filterSeriesId.value
          : this.filterSeriesId,
      filterTagId:
          data.filterTagId.present ? data.filterTagId.value : this.filterTagId,
      viewMode: data.viewMode.present ? data.viewMode.value : this.viewMode,
    );
  }

  @override
  String toString() {
    return (StringBuffer('ShelfPreferencesTableData(')
          ..write('id: $id, ')
          ..write('sortBy: $sortBy, ')
          ..write('sortAscending: $sortAscending, ')
          ..write('filterFormat: $filterFormat, ')
          ..write('filterSeriesId: $filterSeriesId, ')
          ..write('filterTagId: $filterTagId, ')
          ..write('viewMode: $viewMode')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, sortBy, sortAscending, filterFormat,
      filterSeriesId, filterTagId, viewMode);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is ShelfPreferencesTableData &&
          other.id == this.id &&
          other.sortBy == this.sortBy &&
          other.sortAscending == this.sortAscending &&
          other.filterFormat == this.filterFormat &&
          other.filterSeriesId == this.filterSeriesId &&
          other.filterTagId == this.filterTagId &&
          other.viewMode == this.viewMode);
}

class ShelfPreferencesTableCompanion
    extends UpdateCompanion<ShelfPreferencesTableData> {
  final Value<int> id;
  final Value<String?> sortBy;
  final Value<bool> sortAscending;
  final Value<String?> filterFormat;
  final Value<int?> filterSeriesId;
  final Value<int?> filterTagId;
  final Value<String> viewMode;
  const ShelfPreferencesTableCompanion({
    this.id = const Value.absent(),
    this.sortBy = const Value.absent(),
    this.sortAscending = const Value.absent(),
    this.filterFormat = const Value.absent(),
    this.filterSeriesId = const Value.absent(),
    this.filterTagId = const Value.absent(),
    this.viewMode = const Value.absent(),
  });
  ShelfPreferencesTableCompanion.insert({
    this.id = const Value.absent(),
    this.sortBy = const Value.absent(),
    this.sortAscending = const Value.absent(),
    this.filterFormat = const Value.absent(),
    this.filterSeriesId = const Value.absent(),
    this.filterTagId = const Value.absent(),
    this.viewMode = const Value.absent(),
  });
  static Insertable<ShelfPreferencesTableData> custom({
    Expression<int>? id,
    Expression<String>? sortBy,
    Expression<bool>? sortAscending,
    Expression<String>? filterFormat,
    Expression<int>? filterSeriesId,
    Expression<int>? filterTagId,
    Expression<String>? viewMode,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (sortBy != null) 'sort_by': sortBy,
      if (sortAscending != null) 'sort_ascending': sortAscending,
      if (filterFormat != null) 'filter_format': filterFormat,
      if (filterSeriesId != null) 'filter_series_id': filterSeriesId,
      if (filterTagId != null) 'filter_tag_id': filterTagId,
      if (viewMode != null) 'view_mode': viewMode,
    });
  }

  ShelfPreferencesTableCompanion copyWith(
      {Value<int>? id,
      Value<String?>? sortBy,
      Value<bool>? sortAscending,
      Value<String?>? filterFormat,
      Value<int?>? filterSeriesId,
      Value<int?>? filterTagId,
      Value<String>? viewMode}) {
    return ShelfPreferencesTableCompanion(
      id: id ?? this.id,
      sortBy: sortBy ?? this.sortBy,
      sortAscending: sortAscending ?? this.sortAscending,
      filterFormat: filterFormat ?? this.filterFormat,
      filterSeriesId: filterSeriesId ?? this.filterSeriesId,
      filterTagId: filterTagId ?? this.filterTagId,
      viewMode: viewMode ?? this.viewMode,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (sortBy.present) {
      map['sort_by'] = Variable<String>(sortBy.value);
    }
    if (sortAscending.present) {
      map['sort_ascending'] = Variable<bool>(sortAscending.value);
    }
    if (filterFormat.present) {
      map['filter_format'] = Variable<String>(filterFormat.value);
    }
    if (filterSeriesId.present) {
      map['filter_series_id'] = Variable<int>(filterSeriesId.value);
    }
    if (filterTagId.present) {
      map['filter_tag_id'] = Variable<int>(filterTagId.value);
    }
    if (viewMode.present) {
      map['view_mode'] = Variable<String>(viewMode.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('ShelfPreferencesTableCompanion(')
          ..write('id: $id, ')
          ..write('sortBy: $sortBy, ')
          ..write('sortAscending: $sortAscending, ')
          ..write('filterFormat: $filterFormat, ')
          ..write('filterSeriesId: $filterSeriesId, ')
          ..write('filterTagId: $filterTagId, ')
          ..write('viewMode: $viewMode')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $SeriesTable series = $SeriesTable(this);
  late final $BooksTable books = $BooksTable(this);
  late final $TagsTable tags = $TagsTable(this);
  late final $BookTagsTable bookTags = $BookTagsTable(this);
  late final $ReadingProgressTableTable readingProgressTable =
      $ReadingProgressTableTable(this);
  late final $NotesTable notes = $NotesTable(this);
  late final $ShelfPreferencesTableTable shelfPreferencesTable =
      $ShelfPreferencesTableTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        series,
        books,
        tags,
        bookTags,
        readingProgressTable,
        notes,
        shelfPreferencesTable
      ];
}

typedef $$SeriesTableCreateCompanionBuilder = SeriesCompanion Function({
  Value<int> id,
  required String title,
  Value<String?> description,
  Value<String?> coverPath,
});
typedef $$SeriesTableUpdateCompanionBuilder = SeriesCompanion Function({
  Value<int> id,
  Value<String> title,
  Value<String?> description,
  Value<String?> coverPath,
});

final class $$SeriesTableReferences
    extends BaseReferences<_$AppDatabase, $SeriesTable, Sery> {
  $$SeriesTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$BooksTable, List<Book>> _booksRefsTable(
          _$AppDatabase db) =>
      MultiTypedResultKey.fromTable(db.books,
          aliasName: $_aliasNameGenerator(db.series.id, db.books.seriesId));

  $$BooksTableProcessedTableManager get booksRefs {
    final manager = $$BooksTableTableManager($_db, $_db.books)
        .filter((f) => f.seriesId.id($_item.id));

    final cache = $_typedResult.readTableOrNull(_booksRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$SeriesTableFilterComposer
    extends Composer<_$AppDatabase, $SeriesTable> {
  $$SeriesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get coverPath => $composableBuilder(
      column: $table.coverPath, builder: (column) => ColumnFilters(column));

  Expression<bool> booksRefs(
      Expression<bool> Function($$BooksTableFilterComposer f) f) {
    final $$BooksTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.seriesId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableFilterComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$SeriesTableOrderingComposer
    extends Composer<_$AppDatabase, $SeriesTable> {
  $$SeriesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get coverPath => $composableBuilder(
      column: $table.coverPath, builder: (column) => ColumnOrderings(column));
}

class $$SeriesTableAnnotationComposer
    extends Composer<_$AppDatabase, $SeriesTable> {
  $$SeriesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  GeneratedColumn<String> get coverPath =>
      $composableBuilder(column: $table.coverPath, builder: (column) => column);

  Expression<T> booksRefs<T extends Object>(
      Expression<T> Function($$BooksTableAnnotationComposer a) f) {
    final $$BooksTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.seriesId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableAnnotationComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$SeriesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SeriesTable,
    Sery,
    $$SeriesTableFilterComposer,
    $$SeriesTableOrderingComposer,
    $$SeriesTableAnnotationComposer,
    $$SeriesTableCreateCompanionBuilder,
    $$SeriesTableUpdateCompanionBuilder,
    (Sery, $$SeriesTableReferences),
    Sery,
    PrefetchHooks Function({bool booksRefs})> {
  $$SeriesTableTableManager(_$AppDatabase db, $SeriesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SeriesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SeriesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SeriesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String?> description = const Value.absent(),
            Value<String?> coverPath = const Value.absent(),
          }) =>
              SeriesCompanion(
            id: id,
            title: title,
            description: description,
            coverPath: coverPath,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String title,
            Value<String?> description = const Value.absent(),
            Value<String?> coverPath = const Value.absent(),
          }) =>
              SeriesCompanion.insert(
            id: id,
            title: title,
            description: description,
            coverPath: coverPath,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$SeriesTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: ({booksRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (booksRefs) db.books],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (booksRefs)
                    await $_getPrefetchedData(
                        currentTable: table,
                        referencedTable:
                            $$SeriesTableReferences._booksRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$SeriesTableReferences(db, table, p0).booksRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.seriesId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$SeriesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SeriesTable,
    Sery,
    $$SeriesTableFilterComposer,
    $$SeriesTableOrderingComposer,
    $$SeriesTableAnnotationComposer,
    $$SeriesTableCreateCompanionBuilder,
    $$SeriesTableUpdateCompanionBuilder,
    (Sery, $$SeriesTableReferences),
    Sery,
    PrefetchHooks Function({bool booksRefs})>;
typedef $$BooksTableCreateCompanionBuilder = BooksCompanion Function({
  Value<int> id,
  required String title,
  Value<String> author,
  required String filePath,
  required String format,
  Value<String?> coverPath,
  Value<int?> seriesId,
  Value<int?> volumeIndex,
  Value<int?> fileSizeBytes,
  Value<DateTime?> lastOpenedAt,
  Value<DateTime> addedAt,
});
typedef $$BooksTableUpdateCompanionBuilder = BooksCompanion Function({
  Value<int> id,
  Value<String> title,
  Value<String> author,
  Value<String> filePath,
  Value<String> format,
  Value<String?> coverPath,
  Value<int?> seriesId,
  Value<int?> volumeIndex,
  Value<int?> fileSizeBytes,
  Value<DateTime?> lastOpenedAt,
  Value<DateTime> addedAt,
});

final class $$BooksTableReferences
    extends BaseReferences<_$AppDatabase, $BooksTable, Book> {
  $$BooksTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $SeriesTable _seriesIdTable(_$AppDatabase db) => db.series
      .createAlias($_aliasNameGenerator(db.books.seriesId, db.series.id));

  $$SeriesTableProcessedTableManager? get seriesId {
    if ($_item.seriesId == null) return null;
    final manager = $$SeriesTableTableManager($_db, $_db.series)
        .filter((f) => f.id($_item.seriesId!));
    final item = $_typedResult.readTableOrNull(_seriesIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static MultiTypedResultKey<$BookTagsTable, List<BookTag>> _bookTagsRefsTable(
          _$AppDatabase db) =>
      MultiTypedResultKey.fromTable(db.bookTags,
          aliasName: $_aliasNameGenerator(db.books.id, db.bookTags.bookId));

  $$BookTagsTableProcessedTableManager get bookTagsRefs {
    final manager = $$BookTagsTableTableManager($_db, $_db.bookTags)
        .filter((f) => f.bookId.id($_item.id));

    final cache = $_typedResult.readTableOrNull(_bookTagsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$ReadingProgressTableTable,
      List<ReadingProgressTableData>> _readingProgressTableRefsTable(
          _$AppDatabase db) =>
      MultiTypedResultKey.fromTable(db.readingProgressTable,
          aliasName: $_aliasNameGenerator(
              db.books.id, db.readingProgressTable.bookId));

  $$ReadingProgressTableTableProcessedTableManager
      get readingProgressTableRefs {
    final manager =
        $$ReadingProgressTableTableTableManager($_db, $_db.readingProgressTable)
            .filter((f) => f.bookId.id($_item.id));

    final cache =
        $_typedResult.readTableOrNull(_readingProgressTableRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }

  static MultiTypedResultKey<$NotesTable, List<Note>> _notesRefsTable(
          _$AppDatabase db) =>
      MultiTypedResultKey.fromTable(db.notes,
          aliasName: $_aliasNameGenerator(db.books.id, db.notes.bookId));

  $$NotesTableProcessedTableManager get notesRefs {
    final manager = $$NotesTableTableManager($_db, $_db.notes)
        .filter((f) => f.bookId.id($_item.id));

    final cache = $_typedResult.readTableOrNull(_notesRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$BooksTableFilterComposer extends Composer<_$AppDatabase, $BooksTable> {
  $$BooksTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get author => $composableBuilder(
      column: $table.author, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get filePath => $composableBuilder(
      column: $table.filePath, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get format => $composableBuilder(
      column: $table.format, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get coverPath => $composableBuilder(
      column: $table.coverPath, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get volumeIndex => $composableBuilder(
      column: $table.volumeIndex, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get fileSizeBytes => $composableBuilder(
      column: $table.fileSizeBytes, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastOpenedAt => $composableBuilder(
      column: $table.lastOpenedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get addedAt => $composableBuilder(
      column: $table.addedAt, builder: (column) => ColumnFilters(column));

  $$SeriesTableFilterComposer get seriesId {
    final $$SeriesTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.seriesId,
        referencedTable: $db.series,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SeriesTableFilterComposer(
              $db: $db,
              $table: $db.series,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<bool> bookTagsRefs(
      Expression<bool> Function($$BookTagsTableFilterComposer f) f) {
    final $$BookTagsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.bookTags,
        getReferencedColumn: (t) => t.bookId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BookTagsTableFilterComposer(
              $db: $db,
              $table: $db.bookTags,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> readingProgressTableRefs(
      Expression<bool> Function($$ReadingProgressTableTableFilterComposer f)
          f) {
    final $$ReadingProgressTableTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.readingProgressTable,
        getReferencedColumn: (t) => t.bookId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$ReadingProgressTableTableFilterComposer(
              $db: $db,
              $table: $db.readingProgressTable,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<bool> notesRefs(
      Expression<bool> Function($$NotesTableFilterComposer f) f) {
    final $$NotesTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.notes,
        getReferencedColumn: (t) => t.bookId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$NotesTableFilterComposer(
              $db: $db,
              $table: $db.notes,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$BooksTableOrderingComposer
    extends Composer<_$AppDatabase, $BooksTable> {
  $$BooksTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get author => $composableBuilder(
      column: $table.author, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get filePath => $composableBuilder(
      column: $table.filePath, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get format => $composableBuilder(
      column: $table.format, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get coverPath => $composableBuilder(
      column: $table.coverPath, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get volumeIndex => $composableBuilder(
      column: $table.volumeIndex, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get fileSizeBytes => $composableBuilder(
      column: $table.fileSizeBytes,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastOpenedAt => $composableBuilder(
      column: $table.lastOpenedAt,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get addedAt => $composableBuilder(
      column: $table.addedAt, builder: (column) => ColumnOrderings(column));

  $$SeriesTableOrderingComposer get seriesId {
    final $$SeriesTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.seriesId,
        referencedTable: $db.series,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SeriesTableOrderingComposer(
              $db: $db,
              $table: $db.series,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$BooksTableAnnotationComposer
    extends Composer<_$AppDatabase, $BooksTable> {
  $$BooksTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get author =>
      $composableBuilder(column: $table.author, builder: (column) => column);

  GeneratedColumn<String> get filePath =>
      $composableBuilder(column: $table.filePath, builder: (column) => column);

  GeneratedColumn<String> get format =>
      $composableBuilder(column: $table.format, builder: (column) => column);

  GeneratedColumn<String> get coverPath =>
      $composableBuilder(column: $table.coverPath, builder: (column) => column);

  GeneratedColumn<int> get volumeIndex => $composableBuilder(
      column: $table.volumeIndex, builder: (column) => column);

  GeneratedColumn<int> get fileSizeBytes => $composableBuilder(
      column: $table.fileSizeBytes, builder: (column) => column);

  GeneratedColumn<DateTime> get lastOpenedAt => $composableBuilder(
      column: $table.lastOpenedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get addedAt =>
      $composableBuilder(column: $table.addedAt, builder: (column) => column);

  $$SeriesTableAnnotationComposer get seriesId {
    final $$SeriesTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.seriesId,
        referencedTable: $db.series,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$SeriesTableAnnotationComposer(
              $db: $db,
              $table: $db.series,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  Expression<T> bookTagsRefs<T extends Object>(
      Expression<T> Function($$BookTagsTableAnnotationComposer a) f) {
    final $$BookTagsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.bookTags,
        getReferencedColumn: (t) => t.bookId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BookTagsTableAnnotationComposer(
              $db: $db,
              $table: $db.bookTags,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }

  Expression<T> readingProgressTableRefs<T extends Object>(
      Expression<T> Function($$ReadingProgressTableTableAnnotationComposer a)
          f) {
    final $$ReadingProgressTableTableAnnotationComposer composer =
        $composerBuilder(
            composer: this,
            getCurrentColumn: (t) => t.id,
            referencedTable: $db.readingProgressTable,
            getReferencedColumn: (t) => t.bookId,
            builder: (joinBuilder,
                    {$addJoinBuilderToRootComposer,
                    $removeJoinBuilderFromRootComposer}) =>
                $$ReadingProgressTableTableAnnotationComposer(
                  $db: $db,
                  $table: $db.readingProgressTable,
                  $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
                  joinBuilder: joinBuilder,
                  $removeJoinBuilderFromRootComposer:
                      $removeJoinBuilderFromRootComposer,
                ));
    return f(composer);
  }

  Expression<T> notesRefs<T extends Object>(
      Expression<T> Function($$NotesTableAnnotationComposer a) f) {
    final $$NotesTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.notes,
        getReferencedColumn: (t) => t.bookId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$NotesTableAnnotationComposer(
              $db: $db,
              $table: $db.notes,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$BooksTableTableManager extends RootTableManager<
    _$AppDatabase,
    $BooksTable,
    Book,
    $$BooksTableFilterComposer,
    $$BooksTableOrderingComposer,
    $$BooksTableAnnotationComposer,
    $$BooksTableCreateCompanionBuilder,
    $$BooksTableUpdateCompanionBuilder,
    (Book, $$BooksTableReferences),
    Book,
    PrefetchHooks Function(
        {bool seriesId,
        bool bookTagsRefs,
        bool readingProgressTableRefs,
        bool notesRefs})> {
  $$BooksTableTableManager(_$AppDatabase db, $BooksTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$BooksTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$BooksTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$BooksTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String> author = const Value.absent(),
            Value<String> filePath = const Value.absent(),
            Value<String> format = const Value.absent(),
            Value<String?> coverPath = const Value.absent(),
            Value<int?> seriesId = const Value.absent(),
            Value<int?> volumeIndex = const Value.absent(),
            Value<int?> fileSizeBytes = const Value.absent(),
            Value<DateTime?> lastOpenedAt = const Value.absent(),
            Value<DateTime> addedAt = const Value.absent(),
          }) =>
              BooksCompanion(
            id: id,
            title: title,
            author: author,
            filePath: filePath,
            format: format,
            coverPath: coverPath,
            seriesId: seriesId,
            volumeIndex: volumeIndex,
            fileSizeBytes: fileSizeBytes,
            lastOpenedAt: lastOpenedAt,
            addedAt: addedAt,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String title,
            Value<String> author = const Value.absent(),
            required String filePath,
            required String format,
            Value<String?> coverPath = const Value.absent(),
            Value<int?> seriesId = const Value.absent(),
            Value<int?> volumeIndex = const Value.absent(),
            Value<int?> fileSizeBytes = const Value.absent(),
            Value<DateTime?> lastOpenedAt = const Value.absent(),
            Value<DateTime> addedAt = const Value.absent(),
          }) =>
              BooksCompanion.insert(
            id: id,
            title: title,
            author: author,
            filePath: filePath,
            format: format,
            coverPath: coverPath,
            seriesId: seriesId,
            volumeIndex: volumeIndex,
            fileSizeBytes: fileSizeBytes,
            lastOpenedAt: lastOpenedAt,
            addedAt: addedAt,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$BooksTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: (
              {seriesId = false,
              bookTagsRefs = false,
              readingProgressTableRefs = false,
              notesRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [
                if (bookTagsRefs) db.bookTags,
                if (readingProgressTableRefs) db.readingProgressTable,
                if (notesRefs) db.notes
              ],
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
                if (seriesId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.seriesId,
                    referencedTable: $$BooksTableReferences._seriesIdTable(db),
                    referencedColumn:
                        $$BooksTableReferences._seriesIdTable(db).id,
                  ) as T;
                }

                return state;
              },
              getPrefetchedDataCallback: (items) async {
                return [
                  if (bookTagsRefs)
                    await $_getPrefetchedData(
                        currentTable: table,
                        referencedTable:
                            $$BooksTableReferences._bookTagsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$BooksTableReferences(db, table, p0).bookTagsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.bookId == item.id),
                        typedResults: items),
                  if (readingProgressTableRefs)
                    await $_getPrefetchedData(
                        currentTable: table,
                        referencedTable: $$BooksTableReferences
                            ._readingProgressTableRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$BooksTableReferences(db, table, p0)
                                .readingProgressTableRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.bookId == item.id),
                        typedResults: items),
                  if (notesRefs)
                    await $_getPrefetchedData(
                        currentTable: table,
                        referencedTable:
                            $$BooksTableReferences._notesRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$BooksTableReferences(db, table, p0).notesRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.bookId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$BooksTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $BooksTable,
    Book,
    $$BooksTableFilterComposer,
    $$BooksTableOrderingComposer,
    $$BooksTableAnnotationComposer,
    $$BooksTableCreateCompanionBuilder,
    $$BooksTableUpdateCompanionBuilder,
    (Book, $$BooksTableReferences),
    Book,
    PrefetchHooks Function(
        {bool seriesId,
        bool bookTagsRefs,
        bool readingProgressTableRefs,
        bool notesRefs})>;
typedef $$TagsTableCreateCompanionBuilder = TagsCompanion Function({
  Value<int> id,
  required String name,
  Value<String?> color,
});
typedef $$TagsTableUpdateCompanionBuilder = TagsCompanion Function({
  Value<int> id,
  Value<String> name,
  Value<String?> color,
});

final class $$TagsTableReferences
    extends BaseReferences<_$AppDatabase, $TagsTable, Tag> {
  $$TagsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static MultiTypedResultKey<$BookTagsTable, List<BookTag>> _bookTagsRefsTable(
          _$AppDatabase db) =>
      MultiTypedResultKey.fromTable(db.bookTags,
          aliasName: $_aliasNameGenerator(db.tags.id, db.bookTags.tagId));

  $$BookTagsTableProcessedTableManager get bookTagsRefs {
    final manager = $$BookTagsTableTableManager($_db, $_db.bookTags)
        .filter((f) => f.tagId.id($_item.id));

    final cache = $_typedResult.readTableOrNull(_bookTagsRefsTable($_db));
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: cache));
  }
}

class $$TagsTableFilterComposer extends Composer<_$AppDatabase, $TagsTable> {
  $$TagsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get color => $composableBuilder(
      column: $table.color, builder: (column) => ColumnFilters(column));

  Expression<bool> bookTagsRefs(
      Expression<bool> Function($$BookTagsTableFilterComposer f) f) {
    final $$BookTagsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.bookTags,
        getReferencedColumn: (t) => t.tagId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BookTagsTableFilterComposer(
              $db: $db,
              $table: $db.bookTags,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$TagsTableOrderingComposer extends Composer<_$AppDatabase, $TagsTable> {
  $$TagsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get color => $composableBuilder(
      column: $table.color, builder: (column) => ColumnOrderings(column));
}

class $$TagsTableAnnotationComposer
    extends Composer<_$AppDatabase, $TagsTable> {
  $$TagsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get color =>
      $composableBuilder(column: $table.color, builder: (column) => column);

  Expression<T> bookTagsRefs<T extends Object>(
      Expression<T> Function($$BookTagsTableAnnotationComposer a) f) {
    final $$BookTagsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.id,
        referencedTable: $db.bookTags,
        getReferencedColumn: (t) => t.tagId,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BookTagsTableAnnotationComposer(
              $db: $db,
              $table: $db.bookTags,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return f(composer);
  }
}

class $$TagsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $TagsTable,
    Tag,
    $$TagsTableFilterComposer,
    $$TagsTableOrderingComposer,
    $$TagsTableAnnotationComposer,
    $$TagsTableCreateCompanionBuilder,
    $$TagsTableUpdateCompanionBuilder,
    (Tag, $$TagsTableReferences),
    Tag,
    PrefetchHooks Function({bool bookTagsRefs})> {
  $$TagsTableTableManager(_$AppDatabase db, $TagsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$TagsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$TagsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$TagsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String?> color = const Value.absent(),
          }) =>
              TagsCompanion(
            id: id,
            name: name,
            color: color,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String name,
            Value<String?> color = const Value.absent(),
          }) =>
              TagsCompanion.insert(
            id: id,
            name: name,
            color: color,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$TagsTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: ({bookTagsRefs = false}) {
            return PrefetchHooks(
              db: db,
              explicitlyWatchedTables: [if (bookTagsRefs) db.bookTags],
              addJoins: null,
              getPrefetchedDataCallback: (items) async {
                return [
                  if (bookTagsRefs)
                    await $_getPrefetchedData(
                        currentTable: table,
                        referencedTable:
                            $$TagsTableReferences._bookTagsRefsTable(db),
                        managerFromTypedResult: (p0) =>
                            $$TagsTableReferences(db, table, p0).bookTagsRefs,
                        referencedItemsForCurrentItem: (item,
                                referencedItems) =>
                            referencedItems.where((e) => e.tagId == item.id),
                        typedResults: items)
                ];
              },
            );
          },
        ));
}

typedef $$TagsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $TagsTable,
    Tag,
    $$TagsTableFilterComposer,
    $$TagsTableOrderingComposer,
    $$TagsTableAnnotationComposer,
    $$TagsTableCreateCompanionBuilder,
    $$TagsTableUpdateCompanionBuilder,
    (Tag, $$TagsTableReferences),
    Tag,
    PrefetchHooks Function({bool bookTagsRefs})>;
typedef $$BookTagsTableCreateCompanionBuilder = BookTagsCompanion Function({
  required int bookId,
  required int tagId,
  Value<int> rowid,
});
typedef $$BookTagsTableUpdateCompanionBuilder = BookTagsCompanion Function({
  Value<int> bookId,
  Value<int> tagId,
  Value<int> rowid,
});

final class $$BookTagsTableReferences
    extends BaseReferences<_$AppDatabase, $BookTagsTable, BookTag> {
  $$BookTagsTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $BooksTable _bookIdTable(_$AppDatabase db) => db.books
      .createAlias($_aliasNameGenerator(db.bookTags.bookId, db.books.id));

  $$BooksTableProcessedTableManager get bookId {
    final manager = $$BooksTableTableManager($_db, $_db.books)
        .filter((f) => f.id($_item.bookId));
    final item = $_typedResult.readTableOrNull(_bookIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }

  static $TagsTable _tagIdTable(_$AppDatabase db) =>
      db.tags.createAlias($_aliasNameGenerator(db.bookTags.tagId, db.tags.id));

  $$TagsTableProcessedTableManager get tagId {
    final manager = $$TagsTableTableManager($_db, $_db.tags)
        .filter((f) => f.id($_item.tagId));
    final item = $_typedResult.readTableOrNull(_tagIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$BookTagsTableFilterComposer
    extends Composer<_$AppDatabase, $BookTagsTable> {
  $$BookTagsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  $$BooksTableFilterComposer get bookId {
    final $$BooksTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.bookId,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableFilterComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$TagsTableFilterComposer get tagId {
    final $$TagsTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.tagId,
        referencedTable: $db.tags,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$TagsTableFilterComposer(
              $db: $db,
              $table: $db.tags,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$BookTagsTableOrderingComposer
    extends Composer<_$AppDatabase, $BookTagsTable> {
  $$BookTagsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  $$BooksTableOrderingComposer get bookId {
    final $$BooksTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.bookId,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableOrderingComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$TagsTableOrderingComposer get tagId {
    final $$TagsTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.tagId,
        referencedTable: $db.tags,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$TagsTableOrderingComposer(
              $db: $db,
              $table: $db.tags,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$BookTagsTableAnnotationComposer
    extends Composer<_$AppDatabase, $BookTagsTable> {
  $$BookTagsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  $$BooksTableAnnotationComposer get bookId {
    final $$BooksTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.bookId,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableAnnotationComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }

  $$TagsTableAnnotationComposer get tagId {
    final $$TagsTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.tagId,
        referencedTable: $db.tags,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$TagsTableAnnotationComposer(
              $db: $db,
              $table: $db.tags,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$BookTagsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $BookTagsTable,
    BookTag,
    $$BookTagsTableFilterComposer,
    $$BookTagsTableOrderingComposer,
    $$BookTagsTableAnnotationComposer,
    $$BookTagsTableCreateCompanionBuilder,
    $$BookTagsTableUpdateCompanionBuilder,
    (BookTag, $$BookTagsTableReferences),
    BookTag,
    PrefetchHooks Function({bool bookId, bool tagId})> {
  $$BookTagsTableTableManager(_$AppDatabase db, $BookTagsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$BookTagsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$BookTagsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$BookTagsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> bookId = const Value.absent(),
            Value<int> tagId = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              BookTagsCompanion(
            bookId: bookId,
            tagId: tagId,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required int bookId,
            required int tagId,
            Value<int> rowid = const Value.absent(),
          }) =>
              BookTagsCompanion.insert(
            bookId: bookId,
            tagId: tagId,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$BookTagsTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: ({bookId = false, tagId = false}) {
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
                if (bookId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.bookId,
                    referencedTable: $$BookTagsTableReferences._bookIdTable(db),
                    referencedColumn:
                        $$BookTagsTableReferences._bookIdTable(db).id,
                  ) as T;
                }
                if (tagId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.tagId,
                    referencedTable: $$BookTagsTableReferences._tagIdTable(db),
                    referencedColumn:
                        $$BookTagsTableReferences._tagIdTable(db).id,
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

typedef $$BookTagsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $BookTagsTable,
    BookTag,
    $$BookTagsTableFilterComposer,
    $$BookTagsTableOrderingComposer,
    $$BookTagsTableAnnotationComposer,
    $$BookTagsTableCreateCompanionBuilder,
    $$BookTagsTableUpdateCompanionBuilder,
    (BookTag, $$BookTagsTableReferences),
    BookTag,
    PrefetchHooks Function({bool bookId, bool tagId})>;
typedef $$ReadingProgressTableTableCreateCompanionBuilder
    = ReadingProgressTableCompanion Function({
  Value<int> id,
  required int bookId,
  Value<String?> position,
  Value<double?> percentage,
  Value<int?> chapterIndex,
  Value<String?> chapterTitle,
  Value<double?> scrollOffset,
  Value<DateTime?> updatedAt,
});
typedef $$ReadingProgressTableTableUpdateCompanionBuilder
    = ReadingProgressTableCompanion Function({
  Value<int> id,
  Value<int> bookId,
  Value<String?> position,
  Value<double?> percentage,
  Value<int?> chapterIndex,
  Value<String?> chapterTitle,
  Value<double?> scrollOffset,
  Value<DateTime?> updatedAt,
});

final class $$ReadingProgressTableTableReferences extends BaseReferences<
    _$AppDatabase, $ReadingProgressTableTable, ReadingProgressTableData> {
  $$ReadingProgressTableTableReferences(
      super.$_db, super.$_table, super.$_typedResult);

  static $BooksTable _bookIdTable(_$AppDatabase db) => db.books.createAlias(
      $_aliasNameGenerator(db.readingProgressTable.bookId, db.books.id));

  $$BooksTableProcessedTableManager get bookId {
    final manager = $$BooksTableTableManager($_db, $_db.books)
        .filter((f) => f.id($_item.bookId));
    final item = $_typedResult.readTableOrNull(_bookIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$ReadingProgressTableTableFilterComposer
    extends Composer<_$AppDatabase, $ReadingProgressTableTable> {
  $$ReadingProgressTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get position => $composableBuilder(
      column: $table.position, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get percentage => $composableBuilder(
      column: $table.percentage, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get chapterIndex => $composableBuilder(
      column: $table.chapterIndex, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get chapterTitle => $composableBuilder(
      column: $table.chapterTitle, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get scrollOffset => $composableBuilder(
      column: $table.scrollOffset, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  $$BooksTableFilterComposer get bookId {
    final $$BooksTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.bookId,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableFilterComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$ReadingProgressTableTableOrderingComposer
    extends Composer<_$AppDatabase, $ReadingProgressTableTable> {
  $$ReadingProgressTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get position => $composableBuilder(
      column: $table.position, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get percentage => $composableBuilder(
      column: $table.percentage, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get chapterIndex => $composableBuilder(
      column: $table.chapterIndex,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get chapterTitle => $composableBuilder(
      column: $table.chapterTitle,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get scrollOffset => $composableBuilder(
      column: $table.scrollOffset,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  $$BooksTableOrderingComposer get bookId {
    final $$BooksTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.bookId,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableOrderingComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$ReadingProgressTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $ReadingProgressTableTable> {
  $$ReadingProgressTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get position =>
      $composableBuilder(column: $table.position, builder: (column) => column);

  GeneratedColumn<double> get percentage => $composableBuilder(
      column: $table.percentage, builder: (column) => column);

  GeneratedColumn<int> get chapterIndex => $composableBuilder(
      column: $table.chapterIndex, builder: (column) => column);

  GeneratedColumn<String> get chapterTitle => $composableBuilder(
      column: $table.chapterTitle, builder: (column) => column);

  GeneratedColumn<double> get scrollOffset => $composableBuilder(
      column: $table.scrollOffset, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  $$BooksTableAnnotationComposer get bookId {
    final $$BooksTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.bookId,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableAnnotationComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$ReadingProgressTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ReadingProgressTableTable,
    ReadingProgressTableData,
    $$ReadingProgressTableTableFilterComposer,
    $$ReadingProgressTableTableOrderingComposer,
    $$ReadingProgressTableTableAnnotationComposer,
    $$ReadingProgressTableTableCreateCompanionBuilder,
    $$ReadingProgressTableTableUpdateCompanionBuilder,
    (ReadingProgressTableData, $$ReadingProgressTableTableReferences),
    ReadingProgressTableData,
    PrefetchHooks Function({bool bookId})> {
  $$ReadingProgressTableTableTableManager(
      _$AppDatabase db, $ReadingProgressTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ReadingProgressTableTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$ReadingProgressTableTableOrderingComposer(
                  $db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ReadingProgressTableTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int> bookId = const Value.absent(),
            Value<String?> position = const Value.absent(),
            Value<double?> percentage = const Value.absent(),
            Value<int?> chapterIndex = const Value.absent(),
            Value<String?> chapterTitle = const Value.absent(),
            Value<double?> scrollOffset = const Value.absent(),
            Value<DateTime?> updatedAt = const Value.absent(),
          }) =>
              ReadingProgressTableCompanion(
            id: id,
            bookId: bookId,
            position: position,
            percentage: percentage,
            chapterIndex: chapterIndex,
            chapterTitle: chapterTitle,
            scrollOffset: scrollOffset,
            updatedAt: updatedAt,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int bookId,
            Value<String?> position = const Value.absent(),
            Value<double?> percentage = const Value.absent(),
            Value<int?> chapterIndex = const Value.absent(),
            Value<String?> chapterTitle = const Value.absent(),
            Value<double?> scrollOffset = const Value.absent(),
            Value<DateTime?> updatedAt = const Value.absent(),
          }) =>
              ReadingProgressTableCompanion.insert(
            id: id,
            bookId: bookId,
            position: position,
            percentage: percentage,
            chapterIndex: chapterIndex,
            chapterTitle: chapterTitle,
            scrollOffset: scrollOffset,
            updatedAt: updatedAt,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable(table),
                    $$ReadingProgressTableTableReferences(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: ({bookId = false}) {
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
                if (bookId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.bookId,
                    referencedTable:
                        $$ReadingProgressTableTableReferences._bookIdTable(db),
                    referencedColumn: $$ReadingProgressTableTableReferences
                        ._bookIdTable(db)
                        .id,
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

typedef $$ReadingProgressTableTableProcessedTableManager
    = ProcessedTableManager<
        _$AppDatabase,
        $ReadingProgressTableTable,
        ReadingProgressTableData,
        $$ReadingProgressTableTableFilterComposer,
        $$ReadingProgressTableTableOrderingComposer,
        $$ReadingProgressTableTableAnnotationComposer,
        $$ReadingProgressTableTableCreateCompanionBuilder,
        $$ReadingProgressTableTableUpdateCompanionBuilder,
        (ReadingProgressTableData, $$ReadingProgressTableTableReferences),
        ReadingProgressTableData,
        PrefetchHooks Function({bool bookId})>;
typedef $$NotesTableCreateCompanionBuilder = NotesCompanion Function({
  Value<int> id,
  required int bookId,
  required String type,
  Value<String?> content,
  Value<String?> highlightText,
  Value<String?> position,
  Value<int?> chapterIndex,
  Value<DateTime> createdAt,
  Value<DateTime?> updatedAt,
});
typedef $$NotesTableUpdateCompanionBuilder = NotesCompanion Function({
  Value<int> id,
  Value<int> bookId,
  Value<String> type,
  Value<String?> content,
  Value<String?> highlightText,
  Value<String?> position,
  Value<int?> chapterIndex,
  Value<DateTime> createdAt,
  Value<DateTime?> updatedAt,
});

final class $$NotesTableReferences
    extends BaseReferences<_$AppDatabase, $NotesTable, Note> {
  $$NotesTableReferences(super.$_db, super.$_table, super.$_typedResult);

  static $BooksTable _bookIdTable(_$AppDatabase db) =>
      db.books.createAlias($_aliasNameGenerator(db.notes.bookId, db.books.id));

  $$BooksTableProcessedTableManager get bookId {
    final manager = $$BooksTableTableManager($_db, $_db.books)
        .filter((f) => f.id($_item.bookId));
    final item = $_typedResult.readTableOrNull(_bookIdTable($_db));
    if (item == null) return manager;
    return ProcessedTableManager(
        manager.$state.copyWith(prefetchedData: [item]));
  }
}

class $$NotesTableFilterComposer extends Composer<_$AppDatabase, $NotesTable> {
  $$NotesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get type => $composableBuilder(
      column: $table.type, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get content => $composableBuilder(
      column: $table.content, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get highlightText => $composableBuilder(
      column: $table.highlightText, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get position => $composableBuilder(
      column: $table.position, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get chapterIndex => $composableBuilder(
      column: $table.chapterIndex, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  $$BooksTableFilterComposer get bookId {
    final $$BooksTableFilterComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.bookId,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableFilterComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
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
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get type => $composableBuilder(
      column: $table.type, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get content => $composableBuilder(
      column: $table.content, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get highlightText => $composableBuilder(
      column: $table.highlightText,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get position => $composableBuilder(
      column: $table.position, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get chapterIndex => $composableBuilder(
      column: $table.chapterIndex,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  $$BooksTableOrderingComposer get bookId {
    final $$BooksTableOrderingComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.bookId,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableOrderingComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
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
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get type =>
      $composableBuilder(column: $table.type, builder: (column) => column);

  GeneratedColumn<String> get content =>
      $composableBuilder(column: $table.content, builder: (column) => column);

  GeneratedColumn<String> get highlightText => $composableBuilder(
      column: $table.highlightText, builder: (column) => column);

  GeneratedColumn<String> get position =>
      $composableBuilder(column: $table.position, builder: (column) => column);

  GeneratedColumn<int> get chapterIndex => $composableBuilder(
      column: $table.chapterIndex, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  $$BooksTableAnnotationComposer get bookId {
    final $$BooksTableAnnotationComposer composer = $composerBuilder(
        composer: this,
        getCurrentColumn: (t) => t.bookId,
        referencedTable: $db.books,
        getReferencedColumn: (t) => t.id,
        builder: (joinBuilder,
                {$addJoinBuilderToRootComposer,
                $removeJoinBuilderFromRootComposer}) =>
            $$BooksTableAnnotationComposer(
              $db: $db,
              $table: $db.books,
              $addJoinBuilderToRootComposer: $addJoinBuilderToRootComposer,
              joinBuilder: joinBuilder,
              $removeJoinBuilderFromRootComposer:
                  $removeJoinBuilderFromRootComposer,
            ));
    return composer;
  }
}

class $$NotesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $NotesTable,
    Note,
    $$NotesTableFilterComposer,
    $$NotesTableOrderingComposer,
    $$NotesTableAnnotationComposer,
    $$NotesTableCreateCompanionBuilder,
    $$NotesTableUpdateCompanionBuilder,
    (Note, $$NotesTableReferences),
    Note,
    PrefetchHooks Function({bool bookId})> {
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
            Value<int> id = const Value.absent(),
            Value<int> bookId = const Value.absent(),
            Value<String> type = const Value.absent(),
            Value<String?> content = const Value.absent(),
            Value<String?> highlightText = const Value.absent(),
            Value<String?> position = const Value.absent(),
            Value<int?> chapterIndex = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime?> updatedAt = const Value.absent(),
          }) =>
              NotesCompanion(
            id: id,
            bookId: bookId,
            type: type,
            content: content,
            highlightText: highlightText,
            position: position,
            chapterIndex: chapterIndex,
            createdAt: createdAt,
            updatedAt: updatedAt,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required int bookId,
            required String type,
            Value<String?> content = const Value.absent(),
            Value<String?> highlightText = const Value.absent(),
            Value<String?> position = const Value.absent(),
            Value<int?> chapterIndex = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<DateTime?> updatedAt = const Value.absent(),
          }) =>
              NotesCompanion.insert(
            id: id,
            bookId: bookId,
            type: type,
            content: content,
            highlightText: highlightText,
            position: position,
            chapterIndex: chapterIndex,
            createdAt: createdAt,
            updatedAt: updatedAt,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) =>
                  (e.readTable(table), $$NotesTableReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: ({bookId = false}) {
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
                if (bookId) {
                  state = state.withJoin(
                    currentTable: table,
                    currentColumn: table.bookId,
                    referencedTable: $$NotesTableReferences._bookIdTable(db),
                    referencedColumn:
                        $$NotesTableReferences._bookIdTable(db).id,
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

typedef $$NotesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $NotesTable,
    Note,
    $$NotesTableFilterComposer,
    $$NotesTableOrderingComposer,
    $$NotesTableAnnotationComposer,
    $$NotesTableCreateCompanionBuilder,
    $$NotesTableUpdateCompanionBuilder,
    (Note, $$NotesTableReferences),
    Note,
    PrefetchHooks Function({bool bookId})>;
typedef $$ShelfPreferencesTableTableCreateCompanionBuilder
    = ShelfPreferencesTableCompanion Function({
  Value<int> id,
  Value<String?> sortBy,
  Value<bool> sortAscending,
  Value<String?> filterFormat,
  Value<int?> filterSeriesId,
  Value<int?> filterTagId,
  Value<String> viewMode,
});
typedef $$ShelfPreferencesTableTableUpdateCompanionBuilder
    = ShelfPreferencesTableCompanion Function({
  Value<int> id,
  Value<String?> sortBy,
  Value<bool> sortAscending,
  Value<String?> filterFormat,
  Value<int?> filterSeriesId,
  Value<int?> filterTagId,
  Value<String> viewMode,
});

class $$ShelfPreferencesTableTableFilterComposer
    extends Composer<_$AppDatabase, $ShelfPreferencesTableTable> {
  $$ShelfPreferencesTableTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get sortBy => $composableBuilder(
      column: $table.sortBy, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get sortAscending => $composableBuilder(
      column: $table.sortAscending, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get filterFormat => $composableBuilder(
      column: $table.filterFormat, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get filterSeriesId => $composableBuilder(
      column: $table.filterSeriesId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get filterTagId => $composableBuilder(
      column: $table.filterTagId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get viewMode => $composableBuilder(
      column: $table.viewMode, builder: (column) => ColumnFilters(column));
}

class $$ShelfPreferencesTableTableOrderingComposer
    extends Composer<_$AppDatabase, $ShelfPreferencesTableTable> {
  $$ShelfPreferencesTableTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get sortBy => $composableBuilder(
      column: $table.sortBy, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get sortAscending => $composableBuilder(
      column: $table.sortAscending,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get filterFormat => $composableBuilder(
      column: $table.filterFormat,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get filterSeriesId => $composableBuilder(
      column: $table.filterSeriesId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get filterTagId => $composableBuilder(
      column: $table.filterTagId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get viewMode => $composableBuilder(
      column: $table.viewMode, builder: (column) => ColumnOrderings(column));
}

class $$ShelfPreferencesTableTableAnnotationComposer
    extends Composer<_$AppDatabase, $ShelfPreferencesTableTable> {
  $$ShelfPreferencesTableTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get sortBy =>
      $composableBuilder(column: $table.sortBy, builder: (column) => column);

  GeneratedColumn<bool> get sortAscending => $composableBuilder(
      column: $table.sortAscending, builder: (column) => column);

  GeneratedColumn<String> get filterFormat => $composableBuilder(
      column: $table.filterFormat, builder: (column) => column);

  GeneratedColumn<int> get filterSeriesId => $composableBuilder(
      column: $table.filterSeriesId, builder: (column) => column);

  GeneratedColumn<int> get filterTagId => $composableBuilder(
      column: $table.filterTagId, builder: (column) => column);

  GeneratedColumn<String> get viewMode =>
      $composableBuilder(column: $table.viewMode, builder: (column) => column);
}

class $$ShelfPreferencesTableTableTableManager extends RootTableManager<
    _$AppDatabase,
    $ShelfPreferencesTableTable,
    ShelfPreferencesTableData,
    $$ShelfPreferencesTableTableFilterComposer,
    $$ShelfPreferencesTableTableOrderingComposer,
    $$ShelfPreferencesTableTableAnnotationComposer,
    $$ShelfPreferencesTableTableCreateCompanionBuilder,
    $$ShelfPreferencesTableTableUpdateCompanionBuilder,
    (
      ShelfPreferencesTableData,
      BaseReferences<_$AppDatabase, $ShelfPreferencesTableTable,
          ShelfPreferencesTableData>
    ),
    ShelfPreferencesTableData,
    PrefetchHooks Function()> {
  $$ShelfPreferencesTableTableTableManager(
      _$AppDatabase db, $ShelfPreferencesTableTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$ShelfPreferencesTableTableFilterComposer(
                  $db: db, $table: table),
          createOrderingComposer: () =>
              $$ShelfPreferencesTableTableOrderingComposer(
                  $db: db, $table: table),
          createComputedFieldComposer: () =>
              $$ShelfPreferencesTableTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String?> sortBy = const Value.absent(),
            Value<bool> sortAscending = const Value.absent(),
            Value<String?> filterFormat = const Value.absent(),
            Value<int?> filterSeriesId = const Value.absent(),
            Value<int?> filterTagId = const Value.absent(),
            Value<String> viewMode = const Value.absent(),
          }) =>
              ShelfPreferencesTableCompanion(
            id: id,
            sortBy: sortBy,
            sortAscending: sortAscending,
            filterFormat: filterFormat,
            filterSeriesId: filterSeriesId,
            filterTagId: filterTagId,
            viewMode: viewMode,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String?> sortBy = const Value.absent(),
            Value<bool> sortAscending = const Value.absent(),
            Value<String?> filterFormat = const Value.absent(),
            Value<int?> filterSeriesId = const Value.absent(),
            Value<int?> filterTagId = const Value.absent(),
            Value<String> viewMode = const Value.absent(),
          }) =>
              ShelfPreferencesTableCompanion.insert(
            id: id,
            sortBy: sortBy,
            sortAscending: sortAscending,
            filterFormat: filterFormat,
            filterSeriesId: filterSeriesId,
            filterTagId: filterTagId,
            viewMode: viewMode,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$ShelfPreferencesTableTableProcessedTableManager
    = ProcessedTableManager<
        _$AppDatabase,
        $ShelfPreferencesTableTable,
        ShelfPreferencesTableData,
        $$ShelfPreferencesTableTableFilterComposer,
        $$ShelfPreferencesTableTableOrderingComposer,
        $$ShelfPreferencesTableTableAnnotationComposer,
        $$ShelfPreferencesTableTableCreateCompanionBuilder,
        $$ShelfPreferencesTableTableUpdateCompanionBuilder,
        (
          ShelfPreferencesTableData,
          BaseReferences<_$AppDatabase, $ShelfPreferencesTableTable,
              ShelfPreferencesTableData>
        ),
        ShelfPreferencesTableData,
        PrefetchHooks Function()>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$SeriesTableTableManager get series =>
      $$SeriesTableTableManager(_db, _db.series);
  $$BooksTableTableManager get books =>
      $$BooksTableTableManager(_db, _db.books);
  $$TagsTableTableManager get tags => $$TagsTableTableManager(_db, _db.tags);
  $$BookTagsTableTableManager get bookTags =>
      $$BookTagsTableTableManager(_db, _db.bookTags);
  $$ReadingProgressTableTableTableManager get readingProgressTable =>
      $$ReadingProgressTableTableTableManager(_db, _db.readingProgressTable);
  $$NotesTableTableManager get notes =>
      $$NotesTableTableManager(_db, _db.notes);
  $$ShelfPreferencesTableTableTableManager get shelfPreferencesTable =>
      $$ShelfPreferencesTableTableTableManager(_db, _db.shelfPreferencesTable);
}
