import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:novel_creator/app/injection.dart';
import 'package:novel_creator/app/theme/morandi_colors.dart';
import 'package:novel_creator/domain/entities/search_result.dart';
import 'package:novel_creator/domain/repositories/search_repository.dart';
import 'package:novel_creator/features/search/bloc/search_bloc.dart';
import 'package:novel_creator/features/search/bloc/search_event.dart';
import 'package:novel_creator/features/search/bloc/search_state.dart';
import 'package:novel_creator/features/search/widgets/search_result_list_widget.dart';

class SearchPage extends StatelessWidget {
  const SearchPage({super.key, required this.projectId});

  final String projectId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider<SearchBloc>(
      create: (_) => SearchBloc(
        searchRepository: getIt<SearchRepository>(),
        projectId: projectId,
      ),
      child: const _SearchView(),
    );
  }
}

class _SearchView extends StatelessWidget {
  const _SearchView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: MorandiColors.paper,
      appBar: AppBar(
        title: const Text('搜索'),
        backgroundColor: MorandiColors.paper,
        foregroundColor: MorandiColors.ink,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: _SearchBar(),
        ),
      ),
      body: const Column(
        children: [
          _TypeFilterBar(),
          Expanded(child: SearchResultListWidget()),
        ],
      ),
    );
  }
}

class _SearchBar extends StatefulWidget {
  const _SearchBar();

  @override
  State<_SearchBar> createState() => _SearchBarState();
}

class _SearchBarState extends State<_SearchBar> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: TextField(
        controller: _controller,
        autofocus: true,
        textInputAction: TextInputAction.search,
        decoration: InputDecoration(
          hintText: '搜索角色、设定、笔记...',
          hintStyle: TextStyle(color: MorandiColors.sage.withOpacity(0.7)),
          filled: true,
          fillColor: Colors.white,
          prefixIcon:
              Icon(Icons.search, color: MorandiColors.sage.withOpacity(0.6)),
          suffixIcon: _controller.text.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear, color: MorandiColors.sage),
                  onPressed: () {
                    _controller.clear();
                    context
                        .read<SearchBloc>()
                        .add(const SearchQueryChanged(''));
                  },
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16),
        ),
        onChanged: (value) =>
            context.read<SearchBloc>().add(SearchQueryChanged(value)),
        onSubmitted: (value) =>
            context.read<SearchBloc>().add(SearchQueryChanged(value)),
      ),
    );
  }
}

class _TypeFilterBar extends StatelessWidget {
  const _TypeFilterBar();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<SearchBloc, SearchState>(
      builder: (context, state) {
        return Container(
          height: 40,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              _FilterChip(
                label: '全部',
                isSelected: state.typeFilter == null,
                onTap: () => context
                    .read<SearchBloc>()
                    .add(const SearchTypeFilterChanged(null)),
              ),
              _FilterChip(
                label: '角色',
                isSelected: state.typeFilter == SearchEntityType.character,
                onTap: () => context.read<SearchBloc>().add(
                    const SearchTypeFilterChanged(SearchEntityType.character)),
              ),
              _FilterChip(
                label: '设定',
                isSelected:
                    state.typeFilter == SearchEntityType.settingEntry,
                onTap: () => context.read<SearchBloc>().add(
                    const SearchTypeFilterChanged(SearchEntityType.settingEntry)),
              ),
              _FilterChip(
                label: '笔记',
                isSelected: state.typeFilter == SearchEntityType.note,
                onTap: () => context.read<SearchBloc>().add(
                    const SearchTypeFilterChanged(SearchEntityType.note)),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => onTap(),
        selectedColor: MorandiColors.sage.withOpacity(0.3),
        checkmarkColor: MorandiColors.ink,
        labelStyle: TextStyle(
          color: isSelected ? MorandiColors.ink : MorandiColors.sage,
          fontSize: 13,
        ),
        side: BorderSide(
          color: isSelected ? MorandiColors.sage : MorandiColors.mist,
        ),
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        padding: const EdgeInsets.symmetric(horizontal: 4),
      ),
    );
  }
}
