package com.sameidea.days.calendar

import java.time.LocalDate

data class DateRange(
    val start: LocalDate,
    val end: LocalDate,
)

enum class CalendarType {
    GREGORIAN,
    CHINESE_LUNAR,
}

enum class RepeatType {
    NONE,
    YEARLY,
}

enum class OccurrenceStatus {
    VALID,
    SKIPPED,
    NEED_CONFIRM,
    OUT_OF_RANGE,
    INVALID,
}

enum class LeapDayPolicy {
    FEB_28,
    MAR_01,
    SKIP,
}

enum class MissingLunarDayPolicy {
    LAST_DAY_OF_MONTH,
    NEXT_MONTH_FIRST_DAY,
    SKIP,
    ASK,
}

enum class LeapMonthPolicy {
    NORMAL_MONTH_FALLBACK,
    ONLY_LEAP_MONTH,
    ASK,
}

enum class FestivalKind {
    SOLAR,
    LUNAR,
    DERIVED_LUNAR,
}

sealed interface DatePayload

data class GregorianDatePayload(
    val year: Int,
    val month: Int,
    val day: Int,
    val timezone: String,
) : DatePayload

data class LunarDatePayload(
    val lunarYear: Int?,
    val lunarMonth: Int,
    val lunarDay: Int,
    val isLeapMonth: Boolean,
    val timezoneBasis: String,
) : DatePayload

data class LunarDate(
    val lunarYear: Int,
    val lunarMonth: Int,
    val lunarDay: Int,
    val isLeapMonth: Boolean,
    val monthDays: Int,
)

data class RepeatRule(
    val type: RepeatType,
    val leapDayPolicy: LeapDayPolicy = LeapDayPolicy.FEB_28,
    val missingLunarDayPolicy: MissingLunarDayPolicy = MissingLunarDayPolicy.LAST_DAY_OF_MONTH,
    val leapMonthPolicy: LeapMonthPolicy = LeapMonthPolicy.NORMAL_MONTH_FALLBACK,
)

data class AnniversaryEventInput(
    val id: String,
    val title: String,
    val calendarType: CalendarType,
    val datePayload: DatePayload,
    val repeatRule: RepeatRule,
)

data class CalendarResult<T>(
    val value: T?,
    val status: OccurrenceStatus,
    val reason: String? = null,
)

data class Occurrence(
    val eventId: String,
    val targetYear: Int,
    val occurrenceDate: LocalDate?,
    val sourceDisplay: String,
    val status: OccurrenceStatus,
    val reason: String? = null,
    val engineVersion: String,
    val ruleVersion: String,
)

data class FestivalInfo(
    val id: String,
    val name: String,
    val kind: FestivalKind,
    val sourceDisplay: String,
)

interface CalendarEngine {
    val engineVersion: String
    val ruleVersion: String

    fun getSupportedRange(): DateRange

    fun gregorianToLunar(date: LocalDate): CalendarResult<LunarDate>

    fun lunarToGregorian(lunarDate: LunarDatePayload): CalendarResult<LocalDate>

    fun getLunarMonthDays(
        lunarYear: Int,
        lunarMonth: Int,
        isLeapMonth: Boolean,
    ): CalendarResult<Int>

    fun getLeapMonth(lunarYear: Int): CalendarResult<Int?>

    fun generateOccurrenceForYear(
        event: AnniversaryEventInput,
        targetYear: Int,
    ): Occurrence

    fun getNextOccurrence(
        event: AnniversaryEventInput,
        fromDate: LocalDate,
    ): Occurrence

    fun getFutureOccurrences(
        event: AnniversaryEventInput,
        fromDate: LocalDate,
        count: Int,
    ): List<Occurrence>

    fun resolveFestivals(date: LocalDate): List<FestivalInfo>
}

