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
  /** 书内检索 */
  searchInBook: {
    title: '检索本书',
    placeholder: '在这本书里找一个词',
    hint: '至少两个字符；命中按章节排列',
    noResults: '这本书里没有找到',
    hitCount: (n: number) => `找到 ${n} 处`,
  },
  /** 摘抄墙 */
  notesWall: {
    searchPlaceholder: '找一句划过的句子',
    filterAll: '全部',
    filterHighlight: '纯划线',
    filterNote: '批注',
    filterBookAll: '所有书',
    filterTagAll: '所有标签',
    emptyFiltered: '没有符合条件的手记——换个词或放宽筛选',
    exportAll: '导出整墙 Markdown',
  },
  /** 回望席（门厅的呼出环节） */
  revisit: {
    sectionTitle: '回望席',
    anniversaryBook: (years: number) => `这本书入馆 ${years} 周年了`,
    anniversaryNote: (years: number) => `${years} 年前的今天，你划下了这句`,
    revisitAnnotated: '这本书留了你的手记，很久没翻了',
    revisitLongUnread: '它在书架上等你很久了',
    revisitRandom: '今天想从这本开始吗？',
    dismissToday: '今日不再看',
    goBack: '回望',
  },
} as const;
