import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/search_result.dart';
import 'package:novel_creator/features/search/bloc/search_bloc.dart';
import 'package:novel_creator/features/search/bloc/search_state.dart';

class SearchResultListWidget extends StatelessWidget {
  const SearchResultListWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchBloc, SearchState>(
      builder: (context, state) {
        if (state.isSearching) {
          return const Center(child: CircularProgressIndicator());
        }

        if (state.query.isEmpty) {
          return Center(
            child: Text(
              '输入关键词开始搜索',
              style: TextStyle(color: MorandiColors.sage, fontSize: 15),
            ),
          );
        }

        if (state.error != null) {
          return Center(
            child: Text(
              state.error!.userMessage,
              style: const TextStyle(color: Colors.redAccent, fontSize: 14),
            ),
          );
        }

        if (state.results.isEmpty) {
          return Center(
            child: Text(
              '未找到与 "${state.query}" 相关的结果',
              style: TextStyle(color: MorandiColors.sage, fontSize: 15),
            ),
          );
        }

        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: state.results.length,
          separatorBuilder: (_, __) =>
              Divider(height: 1, color: MorandiColors.mist),
          itemBuilder: (context, index) {
            final result = state.results[index];
            return _ResultTile(result: result);
          },
        );
      },
    );
  }
}

class _ResultTile extends StatelessWidget {
  const _ResultTile({required this.result});

  final SearchResult result;

  IconData get _icon {
    switch (result.type) {
      case SearchEntityType.character:
        return Icons.person_outline;
      case SearchEntityType.settingEntry:
        return Icons.menu_book_outlined;
      case SearchEntityType.note:
        return Icons.note_outlined;
      case SearchEntityType.chapter:
        return Icons.article_outlined;
    }
  }

  String get _typeLabel {
    switch (result.type) {
      case SearchEntityType.character:
        return '角色';
      case SearchEntityType.settingEntry:
        return '设定';
      case SearchEntityType.note:
        return '笔记';
      case SearchEntityType.chapter:
        return '章节';
    }
  }

  Color get _badgeColor {
    switch (result.type) {
      case SearchEntityType.character:
        return MorandiColors.clay;
      case SearchEntityType.settingEntry:
        return MorandiColors.sage;
      case SearchEntityType.note:
        return MorandiColors.mist;
      case SearchEntityType.chapter:
        return MorandiColors.ink;
    }
  }

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(10),
      onTap: () {},
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _badgeColor.withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(_icon, color: _badgeColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          result.title,
                          style: TextStyle(
                            color: MorandiColors.ink,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: _badgeColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _typeLabel,
                          style: TextStyle(
                            color: _badgeColor,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  if (result.snippet.isNotEmpty)
                    Text(
                      result.snippet,
                      style: TextStyle(
                        color: MorandiColors.ink.withOpacity(0.6),
                        fontSize: 13,
                        height: 1.4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
