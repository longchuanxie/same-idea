import 'package:calendar_core/calendar_core.dart';
import 'package:flutter/material.dart';

import '../../domain/anniversary_repository.dart';
import '../../domain/anniversary_reminder.dart';

class EventEditScreen extends StatefulWidget {
  const EventEditScreen({
    required this.repository,
    this.onSaved,
    super.key,
  });

  static const routeName = '/edit';

  final AnniversaryRepository repository;
  final VoidCallback? onSaved;

  @override
  State<EventEditScreen> createState() => _EventEditScreenState();
}

class _EventEditScreenState extends State<EventEditScreen> {
  final _titleController = TextEditingController();
  final _noteController = TextEditingController();
  final _advanceDaysController = TextEditingController(text: '7,0');
  bool _hasLoadedInitialDraft = false;
  String? _editingEventId;
  String _category = 'OTHER';
  CalendarType _calendarType = CalendarType.chineseLunar;
  late DateTime _gregorianDate;
  late int _lunarYear;
  late int _lunarMonth;
  late int _lunarDay;
  bool _isLeapMonth = false;
  RepeatType _repeatType = RepeatType.yearly;
  _ReminderPreset _reminderPreset = _ReminderPreset.sevenAndSameDay;
  bool _reminderEnabled = true;
  TimeOfDay _reminderTime = const TimeOfDay(hour: 9, minute: 0);

  RuntimeRulesCalendarEngine get _engine => widget.repository.calendarEngine;

  @override
  void initState() {
    super.initState();
    _gregorianDate = widget.repository.today;
    final lunar = _engine.gregorianToLunar(widget.repository.today).value;
    _lunarYear = lunar?.lunarYear ?? widget.repository.today.year;
    _lunarMonth = lunar?.lunarMonth ?? 1;
    _lunarDay = lunar?.lunarDay ?? 1;
    _isLeapMonth = lunar?.isLeapMonth ?? false;
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_hasLoadedInitialDraft) {
      return;
    }
    _hasLoadedInitialDraft = true;
    final arguments = ModalRoute.of(context)?.settings.arguments;
    final eventId = arguments is String ? arguments : null;
    if (eventId == null) {
      return;
    }
    _loadDraft(eventId);
  }

  Future<void> _loadDraft(String eventId) async {
    final draft = await widget.repository.getEventDraft(eventId);
    if (draft == null || !mounted) {
      return;
    }
    setState(() {
      _editingEventId = eventId;
      _titleController.text = draft.title;
      _noteController.text = draft.note;
      _category = _normalizeCategory(draft.category);
      _calendarType = draft.calendarType;
      _repeatType = draft.repeatRule.type;
      _applyDatePayload(draft.datePayload);
      _applyReminderRule(draft.reminderRule);
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _noteController.dispose();
    _advanceDaysController.dispose();
    super.dispose();
  }

  void _applyDatePayload(DatePayload payload) {
    switch (payload) {
      case GregorianDatePayload():
        _gregorianDate = DateTime.utc(payload.year, payload.month, payload.day);
      case LunarDatePayload():
        _lunarYear = payload.lunarYear ?? _lunarYear;
        _lunarMonth = payload.lunarMonth;
        _lunarDay = payload.lunarDay;
        _isLeapMonth = payload.isLeapMonth;
    }
  }

  void _applyReminderRule(AnniversaryReminderRule rule) {
    _reminderEnabled = rule.enabled;
    _reminderPreset = _presetForRule(rule);
    _reminderTime = _timeOfDayFromText(rule.time);
    _advanceDaysController.text =
        rule.advanceDays.isEmpty ? '0' : rule.advanceDays.join(',');
  }

  void _applyReminderPreset(_ReminderPreset preset) {
    _reminderPreset = preset;
    if (preset == _ReminderPreset.custom) {
      _reminderEnabled = true;
      return;
    }
    _reminderEnabled = preset != _ReminderPreset.off;
    _reminderTime = const TimeOfDay(hour: 9, minute: 0);
    _advanceDaysController.text =
        preset.advanceDays.isEmpty ? '0' : preset.advanceDays.join(',');
  }

  void _setReminderEnabled(bool value) {
    setState(() {
      if (value) {
        _reminderEnabled = true;
        if (_reminderPreset == _ReminderPreset.off) {
          _applyReminderPreset(_ReminderPreset.sevenAndSameDay);
        }
      } else {
        _applyReminderPreset(_ReminderPreset.off);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final previewEvent = _buildPreviewEvent();
    final futureOccurrences =
        _engine.getFutureOccurrences(previewEvent, widget.repository.today, 5);

    return Scaffold(
      appBar: AppBar(
        title: Text(_editingEventId == null ? '新增纪念日' : '编辑纪念日'),
        actions: [
          TextButton.icon(
            onPressed: _saveDraft,
            icon: const Icon(Icons.check),
            label: const Text('保存'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  TextFormField(
                    controller: _titleController,
                    decoration: const InputDecoration(
                      labelText: '名称',
                      prefixIcon: Icon(Icons.favorite_border),
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<String>(
                    value: _category,
                    decoration: const InputDecoration(
                      labelText: '分类',
                      prefixIcon: Icon(Icons.sell_outlined),
                    ),
                    items: [
                      for (final option in _categoryOptions)
                        DropdownMenuItem(
                          value: option.value,
                          child: Text(option.label),
                        ),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        setState(() => _category = value);
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  SegmentedButton<CalendarType>(
                    segments: const [
                      ButtonSegment(
                        value: CalendarType.gregorian,
                        icon: Icon(Icons.calendar_today_outlined),
                        label: Text('公历'),
                      ),
                      ButtonSegment(
                        value: CalendarType.chineseLunar,
                        icon: Icon(Icons.nights_stay_outlined),
                        label: Text('农历'),
                      ),
                    ],
                    selected: {_calendarType},
                    onSelectionChanged: (selection) {
                      setState(() => _calendarType = selection.single);
                    },
                  ),
                  const SizedBox(height: 16),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 180),
                    child: _calendarType == CalendarType.gregorian
                        ? _GregorianPicker(
                            key: const ValueKey('gregorian'),
                            date: _gregorianDate,
                            onPickDate: _pickGregorianDate,
                          )
                        : _LunarPicker(
                            key: const ValueKey('lunar'),
                            engine: _engine,
                            year: _lunarYear,
                            month: _lunarMonth,
                            day: _lunarDay,
                            isLeapMonth: _isLeapMonth,
                            onChanged: _updateLunarDate,
                          ),
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<RepeatType>(
                    value: _repeatType,
                    decoration: const InputDecoration(
                      labelText: '重复',
                      prefixIcon: Icon(Icons.repeat),
                    ),
                    items: const [
                      DropdownMenuItem(
                        value: RepeatType.yearly,
                        child: Text('每年提醒'),
                      ),
                      DropdownMenuItem(
                        value: RepeatType.none,
                        child: Text('不重复'),
                      ),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        setState(() => _repeatType = value);
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  DropdownButtonFormField<_ReminderPreset>(
                    value: _reminderPreset,
                    decoration: const InputDecoration(
                      labelText: '提醒方案',
                      prefixIcon: Icon(Icons.notifications_outlined),
                    ),
                    items: [
                      for (final preset in _ReminderPreset.values)
                        DropdownMenuItem(
                          value: preset,
                          child: Text(preset.label),
                        ),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        setState(() => _applyReminderPreset(value));
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  _ReminderEditor(
                    enabled: _reminderEnabled,
                    time: _reminderTime,
                    advanceDaysController: _advanceDaysController,
                    onEnabledChanged: _setReminderEnabled,
                    onPickTime: _pickReminderTime,
                    onAdvanceDaysChanged: () {
                      setState(_syncReminderPresetFromFields);
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _noteController,
                    decoration: const InputDecoration(
                      labelText: '备注',
                      prefixIcon: Icon(Icons.notes_outlined),
                      alignLabelWithHint: true,
                    ),
                    minLines: 2,
                    maxLines: 4,
                    onChanged: (_) => setState(() {}),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          _PreviewCard(
            event: previewEvent,
            occurrences: futureOccurrences,
          ),
        ],
      ),
    );
  }

  AnniversaryEventInput _buildPreviewEvent() {
    return AnniversaryEventInput(
      id: 'draft-event',
      title: _titleController.text.trim().isEmpty
          ? '新的纪念日'
          : _titleController.text.trim(),
      calendarType: _calendarType,
      datePayload: _calendarType == CalendarType.gregorian
          ? GregorianDatePayload(
              year: _gregorianDate.year,
              month: _gregorianDate.month,
              day: _gregorianDate.day,
              timezone: 'Asia/Shanghai',
            )
          : LunarDatePayload(
              lunarYear: _lunarYear,
              lunarMonth: _lunarMonth,
              lunarDay: _lunarDay,
              isLeapMonth: _isLeapMonth,
              timezoneBasis: 'Asia/Shanghai',
            ),
      repeatRule: RepeatRule(type: _repeatType),
    );
  }

  Future<void> _pickGregorianDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _gregorianDate,
      firstDate: widget.repository.calendarEngine.supportedRange.start,
      lastDate: widget.repository.calendarEngine.supportedRange.end,
    );
    if (picked != null) {
      setState(() {
        _gregorianDate = DateTime.utc(picked.year, picked.month, picked.day);
      });
    }
  }

  Future<void> _pickReminderTime() async {
    final picked = await showDialog<TimeOfDay>(
      context: context,
      builder: (context) => _ReminderTimePickerDialog(
        initialTime: _reminderTime,
      ),
    );
    if (picked != null) {
      setState(() {
        _reminderTime = picked;
        _syncReminderPresetFromFields();
      });
    }
  }

  void _syncReminderPresetFromFields() {
    _reminderPreset = _presetForRule(_buildReminderRule());
  }

  AnniversaryReminderRule _buildReminderRule() {
    if (!_reminderEnabled) {
      return const AnniversaryReminderRule.disabled();
    }
    return AnniversaryReminderRule(
      enabled: true,
      time: _formatReminderTime(_reminderTime),
      advanceDays: _parseAdvanceDays(_advanceDaysController.text),
      timezoneMode: 'DEVICE',
    );
  }

  void _updateLunarDate({
    int? year,
    int? month,
    int? day,
    bool? isLeapMonth,
  }) {
    setState(() {
      _lunarYear = year ?? _lunarYear;
      _lunarMonth = month ?? _lunarMonth;
      _lunarDay = day ?? _lunarDay;
      final leapMonth = _engine.getLeapMonth(_lunarYear).value;
      if (isLeapMonth != null) {
        _isLeapMonth = isLeapMonth;
      }
      if (leapMonth != _lunarMonth) {
        _isLeapMonth = false;
      }
      final days = _engine
          .getLunarMonthDays(_lunarYear, _lunarMonth, _isLeapMonth)
          .value;
      if (days != null && _lunarDay > days) {
        _lunarDay = days;
      }
    });
  }

  Future<void> _saveDraft() async {
    try {
      await widget.repository.saveEvent(
        AnniversaryEventDraft(
          id: _editingEventId,
          title: _titleController.text,
          calendarType: _calendarType,
          datePayload: _calendarType == CalendarType.gregorian
              ? GregorianDatePayload(
                  year: _gregorianDate.year,
                  month: _gregorianDate.month,
                  day: _gregorianDate.day,
                  timezone: 'Asia/Shanghai',
                )
              : LunarDatePayload(
                  lunarYear: _lunarYear,
                  lunarMonth: _lunarMonth,
                  lunarDay: _lunarDay,
                  isLeapMonth: _isLeapMonth,
                  timezoneBasis: 'Asia/Shanghai',
                ),
          repeatRule: RepeatRule(type: _repeatType),
          category: _category,
          note: _noteController.text.trim(),
          reminderRule: _buildReminderRule(),
        ),
      );
    } on DuplicateAnniversaryTitleException {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('已存在同名纪念日，请换一个名称')),
      );
      return;
    }
    widget.onSaved?.call();
    if (!mounted) return;
    Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
  }
}

TimeOfDay _timeOfDayFromText(String value) {
  final parts = value.split(':');
  if (parts.length != 2) {
    return const TimeOfDay(hour: 9, minute: 0);
  }
  final hour = int.tryParse(parts[0]);
  final minute = int.tryParse(parts[1]);
  if (hour == null ||
      minute == null ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59) {
    return const TimeOfDay(hour: 9, minute: 0);
  }
  return TimeOfDay(hour: hour, minute: minute);
}

String _formatReminderTime(TimeOfDay time) {
  String two(int value) => value.toString().padLeft(2, '0');
  return '${two(time.hour)}:${two(time.minute)}';
}

List<int> _parseAdvanceDays(String value) {
  final parsed = value
      .split(RegExp(r'[,，\s]+'))
      .map((part) => int.tryParse(part.trim()))
      .whereType<int>()
      .where((day) => day >= 0 && day <= 3650)
      .toSet()
      .toList()
    ..sort((left, right) => right.compareTo(left));
  return parsed.isEmpty ? [0] : parsed;
}

String _normalizeCategory(String value) {
  return _categoryOptions.any((option) => option.value == value)
      ? value
      : 'OTHER';
}

const _categoryOptions = [
  _CategoryOption('BIRTHDAY', '生日'),
  _CategoryOption('FAMILY', '家人'),
  _CategoryOption('LOVE', '恋爱'),
  _CategoryOption('ANNIVERSARY', '纪念日'),
  _CategoryOption('LIFE', '生活'),
  _CategoryOption('OTHER', '其他'),
];

class _CategoryOption {
  const _CategoryOption(this.value, this.label);

  final String value;
  final String label;
}

enum _ReminderPreset {
  off('关闭提醒', []),
  sameDay('当天 09:00', [0]),
  oneDay('提前 1 天 09:00', [1]),
  threeDays('提前 3 天 09:00', [3]),
  sevenAndSameDay('提前 7 天和当天 09:00', [7, 0]),
  custom('自定义', []);

  const _ReminderPreset(this.label, this.advanceDays);

  final String label;
  final List<int> advanceDays;

  AnniversaryReminderRule toRule() {
    if (this == _ReminderPreset.off) {
      return const AnniversaryReminderRule.disabled();
    }
    return AnniversaryReminderRule(
      enabled: true,
      time: '09:00',
      advanceDays: advanceDays,
      timezoneMode: 'DEVICE',
    );
  }
}

_ReminderPreset _presetForRule(AnniversaryReminderRule rule) {
  if (!rule.enabled) {
    return _ReminderPreset.off;
  }
  for (final preset in _ReminderPreset.values) {
    if (preset == _ReminderPreset.off || preset == _ReminderPreset.custom) {
      continue;
    }
    if (rule.time == '09:00' &&
        _hasSameReminderDays(rule.advanceDays, preset.advanceDays)) {
      return preset;
    }
  }
  return _ReminderPreset.custom;
}

bool _hasSameReminderDays(List<int> left, List<int> right) {
  final normalizedLeft = [...left]..sort();
  final normalizedRight = [...right]..sort();
  if (normalizedLeft.length != normalizedRight.length) {
    return false;
  }
  for (var index = 0; index < normalizedLeft.length; index++) {
    if (normalizedLeft[index] != normalizedRight[index]) {
      return false;
    }
  }
  return true;
}

enum _TimePickerMode {
  wheel,
  input,
}

class _ReminderTimePickerDialog extends StatefulWidget {
  const _ReminderTimePickerDialog({
    required this.initialTime,
  });

  final TimeOfDay initialTime;

  @override
  State<_ReminderTimePickerDialog> createState() =>
      _ReminderTimePickerDialogState();
}

class _ReminderTimePickerDialogState extends State<_ReminderTimePickerDialog> {
  late int _hour;
  late int _minute;
  late final FixedExtentScrollController _hourController;
  late final FixedExtentScrollController _minuteController;
  late final TextEditingController _hourInputController;
  late final TextEditingController _minuteInputController;
  _TimePickerMode _mode = _TimePickerMode.wheel;
  String? _errorText;

  @override
  void initState() {
    super.initState();
    _hour = widget.initialTime.hour;
    _minute = widget.initialTime.minute;
    _hourController = FixedExtentScrollController(initialItem: _hour);
    _minuteController = FixedExtentScrollController(initialItem: _minute);
    _hourInputController = TextEditingController(text: _twoDigits(_hour));
    _minuteInputController = TextEditingController(text: _twoDigits(_minute));
  }

  @override
  void dispose() {
    _hourController.dispose();
    _minuteController.dispose();
    _hourInputController.dispose();
    _minuteInputController.dispose();
    super.dispose();
  }

  void _syncInputs() {
    _hourInputController.text = _twoDigits(_hour);
    _minuteInputController.text = _twoDigits(_minute);
  }

  void _confirm() {
    final parsedHour = int.tryParse(_hourInputController.text.trim());
    final parsedMinute = int.tryParse(_minuteInputController.text.trim());
    if (parsedHour == null ||
        parsedMinute == null ||
        parsedHour < 0 ||
        parsedHour > 23 ||
        parsedMinute < 0 ||
        parsedMinute > 59) {
      setState(() => _errorText = '请输入 00-23 小时和 00-59 分钟');
      return;
    }
    Navigator.of(context).pop(
      TimeOfDay(hour: parsedHour, minute: parsedMinute),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return AlertDialog(
      title: const Text('选择提醒时间'),
      content: SizedBox(
        width: 360,
        child: MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: const TextScaler.linear(1),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SegmentedButton<_TimePickerMode>(
                segments: const [
                  ButtonSegment(
                    value: _TimePickerMode.wheel,
                    icon: Icon(Icons.swap_vert),
                    label: Text('滚动选择'),
                  ),
                  ButtonSegment(
                    value: _TimePickerMode.input,
                    icon: Icon(Icons.keyboard_outlined),
                    label: Text('手动输入'),
                  ),
                ],
                selected: {_mode},
                onSelectionChanged: (selection) {
                  setState(() {
                    _mode = selection.single;
                    _errorText = null;
                    _syncInputs();
                  });
                },
              ),
              const SizedBox(height: 20),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 160),
                child: _mode == _TimePickerMode.wheel
                    ? _WheelTimePicker(
                        key: const ValueKey('wheel-time-picker'),
                        hour: _hour,
                        minute: _minute,
                        hourController: _hourController,
                        minuteController: _minuteController,
                        onHourChanged: (value) {
                          setState(() {
                            _hour = value;
                            _errorText = null;
                            _syncInputs();
                          });
                        },
                        onMinuteChanged: (value) {
                          setState(() {
                            _minute = value;
                            _errorText = null;
                            _syncInputs();
                          });
                        },
                      )
                    : _ManualTimeInput(
                        key: const ValueKey('manual-time-input'),
                        hourController: _hourInputController,
                        minuteController: _minuteInputController,
                        onChanged: () => setState(() => _errorText = null),
                      ),
              ),
              if (_errorText != null) ...[
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    _errorText!,
                    style: TextStyle(
                      color: scheme.error,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('取消'),
        ),
        FilledButton(
          onPressed: _confirm,
          child: const Text('确定'),
        ),
      ],
    );
  }
}

class _WheelTimePicker extends StatelessWidget {
  const _WheelTimePicker({
    required this.hour,
    required this.minute,
    required this.hourController,
    required this.minuteController,
    required this.onHourChanged,
    required this.onMinuteChanged,
    super.key,
  });

  final int hour;
  final int minute;
  final FixedExtentScrollController hourController;
  final FixedExtentScrollController minuteController;
  final ValueChanged<int> onHourChanged;
  final ValueChanged<int> onMinuteChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      key: const ValueKey('wheel-time-picker-row'),
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _TimeWheel(
          label: '小时',
          value: hour,
          itemCount: 24,
          controller: hourController,
          onChanged: onHourChanged,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: Text(
            ':',
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
        ),
        _TimeWheel(
          label: '分钟',
          value: minute,
          itemCount: 60,
          controller: minuteController,
          onChanged: onMinuteChanged,
        ),
      ],
    );
  }
}

class _TimeWheel extends StatelessWidget {
  const _TimeWheel({
    required this.label,
    required this.value,
    required this.itemCount,
    required this.controller,
    required this.onChanged,
  });

  final String label;
  final int value;
  final int itemCount;
  final FixedExtentScrollController controller;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      children: [
        Container(
          width: 116,
          height: 150,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: scheme.outline),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(
                height: 44,
                margin: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  color: scheme.primaryContainer.withOpacity(0.45),
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              ListWheelScrollView.useDelegate(
                controller: controller,
                itemExtent: 44,
                physics: const FixedExtentScrollPhysics(),
                perspective: 0.002,
                overAndUnderCenterOpacity: 0.48,
                onSelectedItemChanged: onChanged,
                childDelegate: ListWheelChildBuilderDelegate(
                  childCount: itemCount,
                  builder: (context, index) {
                    final selected = index == value;
                    return Center(
                      child: Text(
                        _twoDigits(index),
                        style: Theme.of(context)
                            .textTheme
                            .headlineSmall
                            ?.copyWith(
                              color:
                                  selected ? scheme.primary : scheme.onSurface,
                              fontWeight:
                                  selected ? FontWeight.w900 : FontWeight.w500,
                            ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(label),
      ],
    );
  }
}

class _ManualTimeInput extends StatelessWidget {
  const _ManualTimeInput({
    required this.hourController,
    required this.minuteController,
    required this.onChanged,
    super.key,
  });

  final TextEditingController hourController;
  final TextEditingController minuteController;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      key: const ValueKey('manual-time-input-row'),
      children: [
        Expanded(
          child: _TimeNumberField(
            label: '小时',
            controller: hourController,
            onChanged: onChanged,
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 0, 14, 22),
          child: Text(
            ':',
            style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
        ),
        Expanded(
          child: _TimeNumberField(
            label: '分钟',
            controller: minuteController,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
}

class _TimeNumberField extends StatelessWidget {
  const _TimeNumberField({
    required this.label,
    required this.controller,
    required this.onChanged,
  });

  final String label;
  final TextEditingController controller;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: TextInputType.number,
      maxLength: 2,
      textAlign: TextAlign.center,
      style: Theme.of(context).textTheme.displaySmall?.copyWith(
            fontWeight: FontWeight.w800,
          ),
      decoration: InputDecoration(
        counterText: '',
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      onChanged: (_) => onChanged(),
    );
  }
}

String _twoDigits(int value) => value.toString().padLeft(2, '0');

class _ReminderEditor extends StatelessWidget {
  const _ReminderEditor({
    required this.enabled,
    required this.time,
    required this.advanceDaysController,
    required this.onEnabledChanged,
    required this.onPickTime,
    required this.onAdvanceDaysChanged,
  });

  final bool enabled;
  final TimeOfDay time;
  final TextEditingController advanceDaysController;
  final ValueChanged<bool> onEnabledChanged;
  final VoidCallback onPickTime;
  final VoidCallback onAdvanceDaysChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          value: enabled,
          onChanged: onEnabledChanged,
          secondary: const Icon(Icons.notifications_active_outlined),
          title: const Text('启用提醒'),
          subtitle: Text(
            enabled
                ? '提前 ${advanceDaysController.text} 天 · ${_formatReminderTime(time)}'
                : '关闭提醒',
          ),
        ),
        if (enabled) ...[
          const SizedBox(height: 8),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.schedule_outlined),
            title: const Text('提醒时间'),
            subtitle: Text(_formatReminderTime(time)),
            trailing: FilledButton.icon(
              onPressed: onPickTime,
              icon: const Icon(Icons.access_time),
              label: const Text('选择'),
            ),
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: advanceDaysController,
            decoration: const InputDecoration(
              labelText: '提前天数',
              helperText: '用逗号分隔；0 表示当天，例如 7,3,0',
              prefixIcon: Icon(Icons.date_range_outlined),
            ),
            keyboardType: TextInputType.text,
            onChanged: (_) => onAdvanceDaysChanged(),
          ),
        ],
      ],
    );
  }
}

class _GregorianPicker extends StatelessWidget {
  const _GregorianPicker({
    required this.date,
    required this.onPickDate,
    super.key,
  });

  final DateTime date;
  final VoidCallback onPickDate;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.event_outlined),
      title: const Text('公历日期'),
      subtitle: Text(formatDate(date)),
      trailing: FilledButton.icon(
        onPressed: onPickDate,
        icon: const Icon(Icons.calendar_month_outlined),
        label: const Text('选择'),
      ),
    );
  }
}

class _LunarPicker extends StatelessWidget {
  const _LunarPicker({
    required this.engine,
    required this.year,
    required this.month,
    required this.day,
    required this.isLeapMonth,
    required this.onChanged,
    super.key,
  });

  final RuntimeRulesCalendarEngine engine;
  final int year;
  final int month;
  final int day;
  final bool isLeapMonth;
  final void Function({
    int? year,
    int? month,
    int? day,
    bool? isLeapMonth,
  }) onChanged;

  @override
  Widget build(BuildContext context) {
    final leapMonth = engine.getLeapMonth(year).value;
    final monthDays =
        engine.getLunarMonthDays(year, month, isLeapMonth).value ?? 30;
    final monthOptions = <_LunarMonthOption>[
      for (var value = 1; value <= 12; value++) _LunarMonthOption(value, false),
      if (leapMonth != null) _LunarMonthOption(leapMonth, true),
    ]..sort((left, right) {
        final byMonth = left.month.compareTo(right.month);
        if (byMonth != 0) {
          return byMonth;
        }
        return left.isLeap ? 1 : -1;
      });
    final selected = _LunarMonthOption(month, isLeapMonth);

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<int>(
                value: year,
                decoration: const InputDecoration(
                  labelText: '农历年',
                  prefixIcon: Icon(Icons.calendar_view_month_outlined),
                ),
                items: [
                  for (var value = engine.supportedRange.start.year;
                      value <= engine.supportedRange.end.year;
                      value++)
                    DropdownMenuItem(
                      value: value,
                      child: Text('$value 年'),
                    ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    onChanged(year: value);
                  }
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: DropdownButtonFormField<_LunarMonthOption>(
                value: monthOptions.contains(selected) ? selected : null,
                decoration: const InputDecoration(labelText: '农历月'),
                items: [
                  for (final option in monthOptions)
                    DropdownMenuItem(
                      value: option,
                      child: Text(option.label),
                    ),
                ],
                onChanged: (value) {
                  if (value != null) {
                    onChanged(
                      month: value.month,
                      isLeapMonth: value.isLeap,
                    );
                  }
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<int>(
          value: day > monthDays ? monthDays : day,
          decoration: const InputDecoration(
            labelText: '农历日',
            prefixIcon: Icon(Icons.event_available_outlined),
          ),
          items: [
            for (var value = 1; value <= monthDays; value++)
              DropdownMenuItem(
                value: value,
                child: Text(DateDisplayFormatter.lunar(month, value, false)
                    .replaceFirst('农历', '')),
              ),
          ],
          onChanged: (value) {
            if (value != null) {
              onChanged(day: value);
            }
          },
        ),
        if (isLeapMonth || day >= 29)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: _SpecialDateHint(
              isLeapMonth: isLeapMonth,
              day: day,
            ),
          ),
      ],
    );
  }
}

class _SpecialDateHint extends StatelessWidget {
  const _SpecialDateHint({
    required this.isLeapMonth,
    required this.day,
  });

  final bool isLeapMonth;
  final int day;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = isLeapMonth
        ? '闰月不是每年都有；当前预览按“无闰月时使用普通同月”处理。'
        : day == 30
            ? '农历三十遇到小月时，当前预览按“当月最后一天”处理。'
            : '这个日期在部分年份可能需要特殊处理。';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: scheme.tertiaryContainer.withOpacity(0.36),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: Text(text),
    );
  }
}

class _PreviewCard extends StatelessWidget {
  const _PreviewCard({
    required this.event,
    required this.occurrences,
  });

  final AnniversaryEventInput event;
  final List<Occurrence> occurrences;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '未来日期预览',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              event.title,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 8),
            if (occurrences.isEmpty)
              const ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text('暂不可计算'),
                subtitle: Text('请选择支持范围内的日期'),
              )
            else
              for (final occurrence in occurrences)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                    occurrence.occurrenceDate == null
                        ? '暂不可计算'
                        : formatDate(occurrence.occurrenceDate!),
                  ),
                  subtitle: Text(occurrence.sourceDisplay),
                ),
          ],
        ),
      ),
    );
  }
}

class _LunarMonthOption {
  const _LunarMonthOption(this.month, this.isLeap);

  final int month;
  final bool isLeap;

  String get label {
    final display = DateDisplayFormatter.lunar(month, 1, isLeap)
        .replaceFirst('农历', '')
        .replaceFirst('初一', '');
    return display;
  }

  @override
  bool operator ==(Object other) {
    return other is _LunarMonthOption &&
        other.month == month &&
        other.isLeap == isLeap;
  }

  @override
  int get hashCode => Object.hash(month, isLeap);
}
