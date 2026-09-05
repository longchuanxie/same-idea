import 'package:sqflite/sqflite.dart';

// ---------------------------------------------------------------------------
// Schema version
// ---------------------------------------------------------------------------

const int kDatabaseVersion = 1;

// ---------------------------------------------------------------------------
// Open database with schema
// ---------------------------------------------------------------------------

/// Opens the application SQLite database using the given [factory] and [path].
///
/// The caller is responsible for selecting the appropriate [DatabaseFactory]
/// (e.g. `databaseFactory` from `sqflite` on mobile, or `databaseFactoryFfi`
/// from `sqflite_common_ffi` on desktop).
Future<Database> openAppDatabase({
  required DatabaseFactory factory,
  required String path,
}) async {
  return factory.openDatabase(
    path,
    options: OpenDatabaseOptions(
      version: kDatabaseVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
      onConfigure: (db) async {
        await db.execute('PRAGMA foreign_keys = ON');
      },
    ),
  );
}

// ---------------------------------------------------------------------------
// Schema creation
// ---------------------------------------------------------------------------

Future<void> _onCreate(Database db, int version) async {
  await db.execute('''
    CREATE TABLE IF NOT EXISTS event (
      id                  TEXT PRIMARY KEY,
      title               TEXT NOT NULL,
      category            TEXT NOT NULL DEFAULT 'OTHER',
      calendar_type       TEXT NOT NULL,
      gregorian_year      INTEGER,
      gregorian_month     INTEGER,
      gregorian_day       INTEGER,
      gregorian_timezone  TEXT,
      lunar_year          INTEGER,
      lunar_month         INTEGER,
      lunar_day           INTEGER,
      is_leap_month       INTEGER DEFAULT 0,
      lunar_timezone      TEXT,
      repeat_type         TEXT NOT NULL DEFAULT 'YEARLY',
      leap_day_policy     TEXT NOT NULL DEFAULT 'FEB_28',
      missing_lunar_day_policy TEXT NOT NULL DEFAULT 'LAST_DAY_OF_MONTH',
      leap_month_policy   TEXT NOT NULL DEFAULT 'NORMAL_MONTH_FALLBACK',
      main_display        TEXT NOT NULL DEFAULT 'COUNTDOWN',
      note                TEXT NOT NULL DEFAULT '',
      is_pinned           INTEGER NOT NULL DEFAULT 0,
      is_archived         INTEGER NOT NULL DEFAULT 0,
      created_at          TEXT NOT NULL,
      updated_at          TEXT NOT NULL
    )
  ''');

  await db.execute('''
    CREATE TABLE IF NOT EXISTS reminder_rule (
      id               TEXT PRIMARY KEY,
      event_id         TEXT NOT NULL REFERENCES event(id) ON DELETE CASCADE,
      enabled          INTEGER NOT NULL DEFAULT 0,
      reminder_time    TEXT NOT NULL DEFAULT '09:00',
      advance_days_json TEXT NOT NULL DEFAULT '[]',
      timezone_mode    TEXT NOT NULL DEFAULT 'DEVICE',
      fixed_timezone   TEXT
    )
  ''');

  await db.execute('''
    CREATE TABLE IF NOT EXISTS policy_rule (
      event_id                TEXT PRIMARY KEY REFERENCES event(id) ON DELETE CASCADE,
      leap_day_policy         TEXT NOT NULL DEFAULT 'FEB_28',
      missing_lunar_day_policy TEXT NOT NULL DEFAULT 'LAST_DAY_OF_MONTH',
      leap_month_policy       TEXT NOT NULL DEFAULT 'NORMAL_MONTH_FALLBACK'
    )
  ''');

  await db.execute('''
    CREATE TABLE IF NOT EXISTS occurrence_cache (
      event_id        TEXT NOT NULL REFERENCES event(id) ON DELETE CASCADE,
      target_year     INTEGER NOT NULL,
      occurrence_date TEXT,
      source_display  TEXT NOT NULL,
      status          TEXT NOT NULL,
      engine_version  TEXT NOT NULL,
      rule_version    TEXT NOT NULL,
      generated_at    TEXT NOT NULL,
      PRIMARY KEY (event_id, target_year)
    )
  ''');

  await db.execute('''
    CREATE TABLE IF NOT EXISTS widget_snapshot (
      widget_id    TEXT PRIMARY KEY,
      widget_type  TEXT NOT NULL,
      event_id     TEXT REFERENCES event(id) ON DELETE SET NULL,
      title        TEXT NOT NULL DEFAULT '',
      main_text    TEXT NOT NULL DEFAULT '',
      sub_text     TEXT NOT NULL DEFAULT '',
      target_date  TEXT,
      privacy_mode INTEGER NOT NULL DEFAULT 0,
      updated_at   TEXT NOT NULL
    )
  ''');

  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_event_is_archived '
    'ON event(is_archived)',
  );
  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_event_is_pinned '
    'ON event(is_pinned)',
  );
  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_reminder_event '
    'ON reminder_rule(event_id)',
  );
  await db.execute(
    'CREATE INDEX IF NOT EXISTS idx_occurrence_event '
    'ON occurrence_cache(event_id)',
  );
}

// ---------------------------------------------------------------------------
// Migration placeholder
// ---------------------------------------------------------------------------

Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
  // Future schema migrations go here.
}
