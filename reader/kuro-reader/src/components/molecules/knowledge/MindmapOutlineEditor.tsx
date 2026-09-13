import React from 'react'

import { EntryReviseActions, VerifiedBadge } from '@/components/molecules/knowledge/ReviseControls'
import type { MindmapNodeData } from '@/types'
import type { MindmapNodePath } from '@/utils/knowledgeEdit'

/**
 * 思维导图的大纲修订器（修订模式专用）。
 * 画布适合看全局，改字要的是列表：按层级缩进铺开整棵树，
 * 每个节点一排「改/删/校章」，删分支连同子树（根是导图名，只可改不可删）。
 */

interface MindmapOutlineEditorProps {
  data: MindmapNodeData
  onEditNode: (path: MindmapNodePath) => void
  onRemoveNode: (path: MindmapNodePath) => void
  onToggleNodeVerified: (path: MindmapNodePath) => void
}

const NODE_ROWS_GAP_CLASS = 'gap-1.5'
const INDENT_UNIT = 18
/** detail 行缩进：对齐到节点标题文字（箭头图标宽 + 间隙） */
const DETAIL_INDENT_ALIGN = 26

const NodeRow: React.FC<{
  node: MindmapNodeData
  path: MindmapNodePath
  isRoot: boolean
  onEditNode: (path: MindmapNodePath) => void
  onRemoveNode: (path: MindmapNodePath) => void
  onToggleNodeVerified: (path: MindmapNodePath) => void
}> = ({ node, path, isRoot, onEditNode, onRemoveNode, onToggleNodeVerified }) => {
  const hasChildren = (node.children?.length ?? 0) > 0
  return (
    <>
      <div
        className={`flex items-center gap-2 py-1.5 ${isRoot ? 'mb-1' : ''}`}
        style={isRoot ? undefined : { paddingLeft: path.length * INDENT_UNIT }}
        data-mindmap-node={node.title}
      >
        <span
          className={`material-symbols-outlined text-icon-sm shrink-0 ${
            hasChildren ? 'text-primary' : 'text-on-surface-faint'
          }`}
        >
          {hasChildren ? 'subdirectory_arrow_right' : 'chevron_right'}
        </span>
        <span
          className={`min-w-0 truncate ${
            isRoot
              ? 'font-display text-headline-sm text-primary'
              : 'font-label text-label-md text-on-surface'
          }`}
        >
          {node.title}
        </span>
        {node.verified && <VerifiedBadge />}
        {!isRoot && (
          <EntryReviseActions
            verified={node.verified}
            entryLabel={node.title}
            onEdit={() => onEditNode(path)}
            onRemove={() => onRemoveNode(path)}
            onToggleVerified={() => onToggleNodeVerified(path)}
          />
        )}
        {isRoot && (
          <button
            aria-label={`改 ${node.title}`}
            className="w-7 h-7 ml-auto shrink-0 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            onClick={() => onEditNode(path)}
          >
            <span className="material-symbols-outlined text-icon-sm">edit</span>
          </button>
        )}
      </div>
      {node.detail && (
        <p
          className="font-label text-label-sm text-on-surface-variant truncate"
          style={isRoot ? undefined : { paddingLeft: path.length * INDENT_UNIT + DETAIL_INDENT_ALIGN }}
        >
          {node.detail}
        </p>
      )}
      {node.children?.map((child, index) => (
        <NodeRow
          key={`${child.title}-${index}`}
          node={child}
          path={[...path, index]}
          isRoot={false}
          onEditNode={onEditNode}
          onRemoveNode={onRemoveNode}
          onToggleNodeVerified={onToggleNodeVerified}
        />
      ))}
    </>
  )
}

export const MindmapOutlineEditor: React.FC<MindmapOutlineEditorProps> = ({
  data,
  onEditNode,
  onRemoveNode,
  onToggleNodeVerified,
}) => (
  <div
    className={`max-h-[68vh] overflow-y-auto overscroll-contain p-4 flex flex-col ${NODE_ROWS_GAP_CLASS}`}
  >
    <NodeRow
      node={data}
      path={[]}
      isRoot
      onEditNode={onEditNode}
      onRemoveNode={onRemoveNode}
      onToggleNodeVerified={onToggleNodeVerified}
    />
  </div>
)

export default MindmapOutlineEditor
