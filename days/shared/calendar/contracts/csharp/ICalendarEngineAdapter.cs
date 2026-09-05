using System;
using System.Collections.Generic;

namespace SameIdea.Days.Calendar;

public sealed record DateRange(DateOnly Start, DateOnly End);

public enum CalendarType
{
    Gregorian,
    ChineseLunar
}

public enum RepeatType
{
    None,
    Yearly
}

public enum OccurrenceStatus
{
    Valid,
    Skipped,
    NeedConfirm,
    OutOfRange,
    Invalid
}

public enum LeapDayPolicy
{
    Feb28,
    Mar01,
    Skip
}

public enum MissingLunarDayPolicy
{
    LastDayOfMonth,
    NextMonthFirstDay,
    Skip,
    Ask
}

public enum LeapMonthPolicy
{
    NormalMonthFallback,
    OnlyLeapMonth,
    Ask
}

public enum FestivalKind
{
    Solar,
    Lunar,
    DerivedLunar
}

public interface IDatePayload
{
}

public sealed record GregorianDatePayload(
    int Year,
    int Month,
    int Day,
    string Timezone) : IDatePayload;

public sealed record LunarDatePayload(
    int? LunarYear,
    int LunarMonth,
    int LunarDay,
    bool IsLeapMonth,
    string TimezoneBasis) : IDatePayload;

public sealed record LunarDate(
    int LunarYear,
    int LunarMonth,
    int LunarDay,
    bool IsLeapMonth,
    int MonthDays);

public sealed record RepeatRule(
    RepeatType Type,
    LeapDayPolicy LeapDayPolicy,
    MissingLunarDayPolicy MissingLunarDayPolicy,
    LeapMonthPolicy LeapMonthPolicy);

public sealed record AnniversaryEventInput(
    string Id,
    string Title,
    CalendarType CalendarType,
    IDatePayload DatePayload,
    RepeatRule RepeatRule);

public sealed record CalendarResult<T>(
    T? Value,
    OccurrenceStatus Status,
    string? Reason = null);

public sealed record Occurrence(
    string EventId,
    int TargetYear,
    DateOnly? OccurrenceDate,
    string SourceDisplay,
    OccurrenceStatus Status,
    string? Reason,
    string EngineVersion,
    string RuleVersion);

public sealed record FestivalInfo(
    string Id,
    string Name,
    FestivalKind Kind,
    string SourceDisplay);

public interface ICalendarEngineAdapter
{
    string EngineVersion { get; }

    string RuleVersion { get; }

    DateRange GetSupportedRange();

    CalendarResult<LunarDate> GregorianToLunar(DateOnly date);

    CalendarResult<DateOnly> LunarToGregorian(LunarDatePayload lunarDate);

    CalendarResult<int> GetLunarMonthDays(
        int lunarYear,
        int lunarMonth,
        bool isLeapMonth);

    CalendarResult<int?> GetLeapMonth(int lunarYear);

    Occurrence GenerateOccurrenceForYear(
        AnniversaryEventInput anniversaryEvent,
        int targetYear);

    Occurrence GetNextOccurrence(
        AnniversaryEventInput anniversaryEvent,
        DateOnly fromDate);

    IReadOnlyList<Occurrence> GetFutureOccurrences(
        AnniversaryEventInput anniversaryEvent,
        DateOnly fromDate,
        int count);

    IReadOnlyList<FestivalInfo> ResolveFestivals(DateOnly date);
}

