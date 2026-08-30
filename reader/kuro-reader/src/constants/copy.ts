/**
 * 图书馆语气库（UI 重构建议书 7.8）——面向用户的一切文案先入库存审。
 * 语气总则：拟人，不卖萌。少字、具象动词、说清后果；技术细节放括号。
 */
export const COPY = {
  toast: {
    /** 备份恢复 */
    backupVersionUnsupported: '这份备份来得太早——版本不受支持',
    backupRestored: '馆藏已从备份恢复',
    backupBroken: '这份备份打不开——文件可能损坏或格式不对',
    /** 手记 */
    noAnnotations: '这本书还没有手记。读的时候，长按一句话就能把它贴上墙',
    /** 馆务 */
    storageComingSoon: '馆容量的整理还在筹备中',
  },
  dialog: {
    /** 恢复备份确认（破坏性：覆盖） */
    backupRestoreTitle: '用备份覆盖现在的馆藏？',
    backupRestoreMessage: '当前的阅读进度、书签与手记会被备份里的内容替换，且无法撤销。',
    backupRestoreConfirm: '覆盖导入',
    backupRestoreCancel: '先不',
  },
  /** 手记（划线/批注分离：划线零输入，批注弹笔记） */
  annotation: {
    highlightAction: '划线',
    annotateAction: '批注',
    notePlaceholder: '写点什么…（留空则仅划线）',
    saveNote: '保存批注',
    saveHighlightOnly: '仅划线',
    pureHighlight: '纯划线',
    clearToPureHighlight: '清空文字即转为纯划线',
    goTo: '回到此处',
    remove: '删除',
    edit: '编辑',
    save: '保存',
    cancel: '取消',
    close: '关闭',
    styleLabels: {
      highlight: '水彩笔',
      underline: '下划线',
      wavy: '波浪线',
    },
  },
} as const;
