import 'package:flutter/material.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/services/timeline_service.dart';

/// Widget that displays character timelines as a visual timeline.
class CharacterTimelineWidget extends StatelessWidget {
  const CharacterTimelineWidget({
    super.key,
    required this.timeline,
    this.selectedCharacterId,
    this.onCharacterTap,
    this.onPointTap,
  });

  final ProjectTimeline timeline;
  final String? selectedCharacterId;
  final ValueChanged<String>? onCharacterTap;
  final ValueChanged<CharacterTimelinePoint>? onPointTap;

  @override
  Widget build(BuildContext context) {
    if (timeline.points.isEmpty) {
      return const Center(
        child: Text(
          '暂无时间线数据',
          style: TextStyle(color: MorandiColors.sage),
        ),
      );
    }

    final displayPoints = selectedCharacterId != null
        ? timeline.forCharacter(selectedCharacterId!)
        : timeline.points;

    return ListView.builder(
      padding: const EdgeInsets.all(16.0),
      itemCount: displayPoints.length,
      itemBuilder: (context, index) {
        final point = displayPoints[index];
        return _TimelinePointCard(
          point: point,
          isLast: index == displayPoints.length - 1,
          onTap: onPointTap,
        );
      },
    );
  }
}

class _TimelinePointCard extends StatelessWidget {
  const _TimelinePointCard({
    required this.point,
    required this.isLast,
    this.onTap,
  });

  final CharacterTimelinePoint point;
  final bool isLast;
  final ValueChanged<CharacterTimelinePoint>? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap != null ? () => onTap!(point) : null,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline indicator
          SizedBox(
            width: 48.0,
            child: Column(
              children: [
                Container(
                  width: 12.0,
                  height: 12.0,
                  decoration: BoxDecoration(
                    color: MorandiColors.clay,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: MorandiColors.mist,
                      width: 2.0,
                    ),
                  ),
                ),
                if (!isLast)
                  Container(
                    width: 2.0,
                    height: 40.0,
                    color: MorandiColors.mist,
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12.0),
          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  point.chapterTitle,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14.0,
                    color: MorandiColors.ink,
                  ),
                ),
                const SizedBox(height: 4.0),
                Text(
                  point.description,
                  style: const TextStyle(
                    fontSize: 13.0,
                    color: MorandiColors.sage,
                  ),
                ),
                if (point.relatedCharacterIds.isNotEmpty) ...[
                  const SizedBox(height: 4.0),
                  Text(
                    '同场角色: ${point.relatedCharacterIds.length}人',
                    style: const TextStyle(
                      fontSize: 11.0,
                      color: MorandiColors.mist,
                    ),
                  ),
                ],
                if (!isLast) const SizedBox(height: 16.0),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
