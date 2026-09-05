const app = document.getElementById("app");
const device = document.getElementById("device");
const title = document.getElementById("stageTitle");
const desc = document.getElementById("stageDesc");

// ─── Heroicons (outline 24x24) SVG path data ───
const ICONS = {
  home: '<path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>',
  'book-open': '<path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>',
  'magnifying-glass': '<path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>',
  'pencil-square': '<path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>',
  'cog-6-tooth': '<path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>',
  'arrow-left': '<path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>',
  'x-mark': '<path d="M6 18 18 6M6 6l12 12"/>',
  plus: '<path d="M12 4.5v15m7.5-7.5h-15"/>',
  trash: '<path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>',
  'folder-open': '<path d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"/>',
  'chevron-left': '<path d="M15.75 19.5 8.25 12l7.5-7.5"/>',
  'chevron-right': '<path d="m8.25 4.5 7.5 7.5-7.5 7.5"/>',
  'chevron-down': '<path d="m19.5 8.25-7.5 7.5-7.5-7.5"/>',
  'bookmark-square': '<path d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75"/><path d="M6 6.75h12a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 19.5V9A2.25 2.25 0 0 1 6 6.75Z"/>',
  'list-bullet': '<path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>',
  sun: '<path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>',
  moon: '<path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>',
  'adjustments-horizontal': '<path d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/>',
  'document-text': '<path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>',
  photo: '<path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"/>',
  document: '<path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>',
  heart: '<path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/>',
  tag: '<path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"/><path d="M6 6h.008v.008H6V6Z"/>',
  folder: '<path d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"/>',
  'arrow-up-tray': '<path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/>',
  'arrow-down-tray': '<path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3"/>',
  'shield-check': '<path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>',
  check: '<path d="m4.5 12.75 6 6 9-13.5"/>',
  'check-circle': '<path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>',
  'exclamation-triangle': '<path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>',
  'information-circle': '<path d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>',
  eye: '<path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>',
  sparkles: '<path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>',
  'squares-2x2': '<path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"/>',
  'view-columns': '<path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>',
  clock: '<path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>',
  'archive-box': '<path d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/>',
  funnel: '<path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"/>',
  server: '<path d="M21.75 17.25v-.228a4.5 4.5 0 0 0-.12-1.03l-2.268-9.64a3.375 3.375 0 0 0-3.285-2.602H7.923a3.375 3.375 0 0 0-3.285 2.602l-2.268 9.64a4.5 4.5 0 0 0-.12 1.03v.228m19.5 0a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3m19.5 0a3 3 0 0 0-3-3H5.25a3 3 0 0 0-3 3m16.5 0h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z"/>',
  'wrench-screwdriver': '<path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"/>',
};

function icon(name, cls = '') {
  const paths = ICONS[name];
  if (!paths) return '';
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

// ─── State ───
let state = {
  screen: 'home',
  device: 'phone',
  shelfFilter: 0,
  shelfPage: 1,
  shelfViewMode: 'grid',
  shelfSortOpen: false,
  readerPanel: null,
  searchQuery: '',
  settings: { nightTheme: false, dualColumn: false, volumeKey: false, autoBackup: true, autoScan: true, reduceMotion: false },
  commandOpen: false,
  commandQuery: '',
  history: [],
  isEmpty: false,
};

// ─── Meta ───
const meta = {
  home: ["首页", "继续阅读与本地书房概览"],
  shelf: ["书架", "分区、分页、聚合，不再无限下拉"],
  discover: ["搜索", "书库、正文、笔记、PDF 统一检索"],
  detail: ["详情", "书籍元数据与操作中心"],
  bookEdit: ["编辑", "编辑书籍元数据"],
  series: ["系列", "按作品聚合卷册"],
  text: ["文本阅读", "沉浸式文本阅读器"],
  comic: ["漫画阅读", "双页、条漫与缩略图"],
  pdf: ["PDF 阅读", "工具化 PDF 阅读体验"],
  notes: ["笔记", "书签、摘录、批注集中管理"],
  noteDetail: ["笔记详情", "查看笔记内容与来源"],
  import: ["导入扫描", "本地目录扫描与导入反馈"],
  settings: ["设置", "阅读、数据、隐私设置"],
  backup: ["备份", "导出与导入阅读数据"],
  cache: ["缓存", "管理本地缓存空间"],
  privacy: ["隐私", "本地优先，默认不上传"],
  viewAll: ["全部书籍", "浏览完整书库"],
  onboarding: ["欢迎", "开始构建你的本地书房"],
};

// ─── Book data ───
const books = [
  ["海边的书房", "散文集", "EPUB", "a", 68],
  ["火凤燎原 12", "漫画系列", "CBZ", "b", 42],
  ["城市与记忆", "资料文档", "PDF", "c", 27],
  ["长夜手记", "本地小说", "TXT", "d", 81],
  ["山风慢读", "Markdown", "MD", "a", 12],
  ["纸上剧场", "漫画短篇", "ZIP", "b", 95],
  ["阅读器设计笔记", "产品文档", "PDF", "c", 51],
  ["旧书目录", "HTML", "HTML", "d", 6]
].map(([title, author, type, cover, progress]) => ({ title, author, type, cover, progress }));

function wide() { return state.device !== "phone"; }

// ─── Navigation ───
function nav(active) {
  const items = [["home","首页"],["shelf","书架"],["discover","搜索"],["notes","笔记"],["settings","设置"]];
  return items.map(([key,label]) => `<button class="nav-tab ${active===key?"active":""}" data-go="${key}"><span>${label}</span><small>${key==="shelf"?"128":""}</small></button>`).join("");
}

// ─── Shell ───
function shell(content, active = "home", pageTitle = "首页", subtitle = "本地优先阅读器", showBack = false) {
  const backButton = showBack ? `<button class="back-button icon-button" data-go="back">${icon('arrow-left', 'icon-sm')}</button>` : '';
  if (wide()) {
    return `<div class="app-shell wide-shell fade-in">
      <aside class="app-side">
        <div class="side-brand"><div class="side-mark">LR</div><div><strong>本地阅读器</strong><span>Local First</span></div></div>
        <div class="side-nav">${nav(active)}</div>
      </aside>
      <main class="app-main">
        ${topbar(pageTitle, subtitle, backButton)}
        <div class="content">${content}</div>
      </main>
    </div>`;
  }
  return `<div class="app-shell phone-shell fade-in">
    ${topbar(pageTitle, subtitle, backButton)}
    <div class="content">${content}</div>
    <nav class="bottom-nav">${nav(active)}</nav>
  </div>`;
}

function topbar(pageTitle, subtitle, backButton = '') {
  return `<header class="topbar">
    ${backButton}
    <div class="page-title"><h2>${pageTitle}</h2><p>${subtitle}</p></div>
    ${wide()?`<div class="command" data-go="discover">搜索书名、作者、标签或正文</div>`:""}
    <div class="top-actions"><button class="icon-button" data-go="import">${icon('arrow-up-tray', 'icon-sm')} 导入</button><button class="icon-button">${icon('funnel', 'icon-sm')} 筛选</button></div>
  </header>`;
}

// ─── Cover & BookCard ───
function cover(book) {
  return `<div class="cover ${book.cover}" data-title="${book.title}"></div>`;
}

function bookCard(book) {
  const go = book.type === "CBZ" || book.type === "ZIP" ? "comic" : book.type === "PDF" ? "pdf" : "detail";
  return `<div class="book-card" data-go="${go}">
    ${cover(book)}
    <strong>${book.title}</strong>
    <small>${book.author} · ${book.type}</small>
    <div class="progress"><span style="width:${book.progress}%"></span></div>
  </div>`;
}

function formatIcon(type) {
  if (type === 'CBZ' || type === 'ZIP') return icon('photo', 'icon-sm');
  if (type === 'PDF') return icon('document', 'icon-sm');
  if (type === 'MD' || type === 'HTML') return icon('document-text', 'icon-sm');
  return icon('book-open', 'icon-sm');
}

// ─── Switch component ───
function switchEl(settingKey) {
  const on = state.settings[settingKey];
  return `<div class="switch ${on ? 'on' : ''}" data-setting="${settingKey}"><div class="switch-thumb"></div></div>`;
}

// ─── Pages ───

function onboarding() {
  return shell(`
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:32px 16px;">
      <div style="margin-bottom:24px;opacity:0.6;">${icon('book-open', 'icon-xl')}</div>
      <h3 style="font-size:24px;font-weight:700;margin:0 0 12px;letter-spacing:-0.03em;">开始构建你的本地书房</h3>
      <p style="color:var(--muted);max-width:360px;line-height:1.7;margin:0 0 24px;">导入本地文件或扫描目录，阅读器会自动识别格式并整理书架。所有数据保存在本机。</p>
      <div class="button-row" style="justify-content:center;">
        <button class="primary-button" data-go="import">${icon('arrow-up-tray', 'icon-sm')} 导入文件</button>
        <button class="ghost-button" data-go="import">${icon('folder-open', 'icon-sm')} 扫描目录</button>
      </div>
      <p style="color:var(--muted);font-size:12px;margin-top:32px;opacity:0.7;">支持 EPUB、PDF、CBZ、TXT、Markdown、HTML 等格式</p>
    </div>
  `, "home", "欢迎", "开始构建你的本地书房");
}

function home() {
  if (state.isEmpty) return onboarding();
  return shell(`
    <div class="bento">
      <section class="hero-card card">
        <span class="kicker">继续阅读</span>
        <h3>把本地书库整理成一个安静的阅读工作台</h3>
        <p>当前停在《海边的书房》第三章。阅读进度、标签、笔记和书签都保存在本机。</p>
        <div class="button-row">
          <button class="primary-button" data-go="text">${icon('book-open', 'icon-sm')} 继续阅读</button>
          <button class="ghost-button" data-go="shelf">${icon('squares-2x2', 'icon-sm')} 进入书架</button>
        </div>
      </section>
      <section class="metric-grid">
        <div class="metric">${icon('book-open', 'icon-sm')}<b>128</b><span>本地内容</span></div>
        <div class="metric">${icon('eye', 'icon-sm')}<b>36</b><span>阅读中</span></div>
        <div class="metric">${icon('folder', 'icon-sm')}<b>18</b><span>系列聚合</span></div>
      </section>
    </div>
    <section class="section solid-card">
      <div class="section-head"><div><h3>最近阅读</h3><p>固定展示最近 4 本，不做无尽信息流</p></div><button class="text-button" data-go="shelf">查看书架</button></div>
      <div class="book-row">${books.slice(0,4).map(bookCard).join("")}</div>
    </section>
  `, "home", "首页", "继续阅读与本地书房概览");
}

function shelf() {
  const filters = [
    { label: "继续阅读", count: 36 },
    { label: "最近添加", count: 24 },
    { label: "未读", count: 58 },
    { label: "收藏", count: 27 },
    { label: "漫画", count: 42 },
    { label: "PDF", count: 16 },
    { label: "文件丢失", count: 1 },
  ];
  const filterBtns = filters.map((f, i) =>
    `<button class="shelf-filter ${i === state.shelfFilter ? 'active' : ''}" data-shelf-filter="${i}"><span>${f.label}</span><b>${f.count}</b></button>`
  ).join('');

  const viewModeBtn = state.shelfViewMode === 'grid'
    ? `<button class="chip active" data-shelf-view="grid">${icon('squares-2x2', 'icon-sm')} 网格</button><button class="chip" data-shelf-view="list">${icon('view-columns', 'icon-sm')} 列表</button>`
    : `<button class="chip" data-shelf-view="grid">${icon('squares-2x2', 'icon-sm')} 网格</button><button class="chip active" data-shelf-view="list">${icon('view-columns', 'icon-sm')} 列表</button>`;

  const sortMenu = state.shelfSortOpen
    ? `<div class="sort-menu" style="position:absolute;right:0;top:100%;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:4px;z-index:10;min-width:120px;box-shadow:0 4px 12px rgba(0,0,0,.1);">
        <button class="chip" style="width:100%;text-align:left;">按名称</button>
        <button class="chip" style="width:100%;text-align:left;">按作者</button>
        <button class="chip" style="width:100%;text-align:left;">按日期</button>
        <button class="chip" style="width:100%;text-align:left;">按进度</button>
      </div>` : '';

  const fileLostSection = state.shelfFilter === 6
    ? `<section class="shelf-section">
        <div class="section-head"><div><h3>${icon('exclamation-triangle', 'icon-sm')} 文件丢失</h3><p>原始文件已被移动或删除</p></div></div>
        <div class="list">
          <div class="list-item"><div class="thumb"></div><div><strong>旧日手稿.txt</strong><span>原路径 /Docs/old 不存在</span></div><button class="chip">重新定位</button></div>
        </div>
      </section>` : '';

  return shell(`
    <div class="shelf-layout">
      <aside class="shelf-rail">${filterBtns}</aside>
      <section class="shelf-main">
        <div class="shelf-tool">
          <div class="search-pill">
            <input class="search-input" type="text" placeholder="在当前书架内搜索" value="${state.searchQuery}" data-search="shelf">
          </div>
          <div class="tool-actions" style="position:relative;">
            ${viewModeBtn}
            <button class="chip" data-shelf-sort>${icon('funnel', 'icon-sm')} 排序</button>
            ${sortMenu}
          </div>
        </div>

        <section class="shelf-section">
          <div class="section-head"><div><h3>继续阅读</h3><p>只展示最近 4 本，其余通过分页或搜索定位</p></div><button class="text-button" data-go="viewAll">查看全部</button></div>
          <div class="book-row">${books.slice(0,4).map(bookCard).join("")}</div>
        </section>

        <section class="shelf-section">
          <div class="section-head"><div><h3>最近添加</h3><p>按导入批次分页，避免无限下拉</p></div><button class="chip">第 ${state.shelfPage} / 8 页</button></div>
          <div class="book-row">${books.slice(4,8).map(bookCard).join("")}</div>
          <div class="pagination">
            <button class="page-btn" data-shelf-page="prev">${icon('chevron-left', 'icon-sm')}</button>
            <button class="page-btn ${state.shelfPage===1?'active':''}" data-shelf-page="1">1</button>
            <button class="page-btn ${state.shelfPage===2?'active':''}" data-shelf-page="2">2</button>
            <button class="page-btn ${state.shelfPage===3?'active':''}" data-shelf-page="3">3</button>
            <button class="page-btn" data-shelf-page="next">${icon('chevron-right', 'icon-sm')}</button>
          </div>
        </section>

        <section class="shelf-section">
          <div class="section-head"><div><h3>系列书架</h3><p>长篇与漫画优先聚合，减少卷册占满页面</p></div><button class="text-button" data-go="series">管理系列</button></div>
          <div class="series-cards">
            <div class="series-card" data-go="series"><strong>火凤燎原</strong><span>5 卷 · 当前第 3 卷</span><div class="progress"><span style="width:48%"></span></div></div>
            <div class="series-card" data-go="series"><strong>慢读札记</strong><span>3 册 · 68%</span><div class="progress"><span style="width:68%"></span></div></div>
            <div class="series-card" data-go="series"><strong>城市档案</strong><span>8 份 PDF · 27%</span><div class="progress"><span style="width:27%"></span></div></div>
          </div>
        </section>

        ${fileLostSection}
      </section>
    </div>
  `, "shelf", "书架", "分区、分页、聚合，不再无限下拉");
}

function discover() {
  const q = state.searchQuery;
  const hasQuery = q.length > 0;

  const suggestions = !hasQuery ? `
    <div style="margin-bottom:24px;">
      <h4 style="font-size:14px;color:var(--muted);margin:0 0 12px;">搜索建议</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${['散文','漫画','PDF','本地小说','火凤燎原'].map(t => `<button class="chip" data-search-suggest="${t}">${t}</button>`).join('')}
      </div>
    </div>
    <div>
      <h4 style="font-size:14px;color:var(--muted);margin:0 0 12px;">${icon('clock', 'icon-sm')} 最近搜索</h4>
      <div class="list">
        ${['海边的书房','阅读器设计'].map(t => `<div class="list-item" style="cursor:pointer;" data-search-suggest="${t}"><div><strong>${t}</strong></div></div>`).join('')}
      </div>
    </div>
  ` : '';

  const results = hasQuery ? `
    <div style="margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap;">
      <button class="chip active">全部</button>
      <button class="chip">书籍</button>
      <button class="chip">正文</button>
      <button class="chip">笔记</button>
    </div>
    <div class="list">
      ${[
        ["海边的书房","正文命中 · 第三章 · 灯光落在书桌上","text"],
        ["阅读摘录","笔记命中 · 本地书房与边界感","notes"],
        ["阅读器设计笔记","PDF 第 12 页 · Local First","pdf"]
      ].map(([a,b,g])=>`<div class="list-item" data-go="${g}"><div class="thumb"></div><div><strong>${a}</strong><span>${b}</span></div><button class="chip active">跳转</button></div>`).join("")}
    </div>
    <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
      <h4 style="font-size:13px;color:var(--muted);margin:0 0 8px;">${icon('sparkles', 'icon-sm')} 命令</h4>
      <div class="list">
        <div class="list-item" data-go="import"><div>${icon('arrow-up-tray', 'icon-sm')}</div><div><strong>导入文件</strong><span>打开导入扫描页面</span></div></div>
        <div class="list-item" data-go="settings"><div>${icon('cog-6-tooth', 'icon-sm')}</div><div><strong>打开设置</strong><span>阅读、数据、隐私设置</span></div></div>
      </div>
    </div>
  ` : '';

  return shell(`
    <div class="card" style="padding:14px;margin-bottom:16px;">
      <div class="search-pill">
        <span style="opacity:0.5;margin-right:8px;">${icon('magnifying-glass', 'icon-sm')}</span>
        <input class="search-input" type="text" placeholder="搜索书名、作者、标签或正文" value="${q}" data-search="discover" autofocus>
        <span style="font-size:11px;color:var(--muted);white-space:nowrap;margin-left:8px;">Ctrl+K</span>
      </div>
    </div>
    ${suggestions}
    ${results}
  `, "discover", "搜索", "书库、正文、笔记、PDF 统一检索");
}

function detail() {
  return shell(`
    <div class="detail-grid">
      <div class="detail-cover">${cover(books[0])}<div class="button-row">
        <button class="primary-button" data-go="text">${icon('book-open', 'icon-sm')} 继续阅读</button>
        <button class="ghost-button">${icon('heart', 'icon-sm')} 收藏</button>
      </div></div>
      <div class="card" style="padding:18px;">
        <span class="kicker">${formatIcon('EPUB')} EPUB · 阅读中</span>
        <h3 style="font-size:30px;letter-spacing:-.05em;margin:0 0 8px;">海边的书房</h3>
        <p style="color:var(--muted);line-height:1.8;">本地散文集。当前位于第三章，阅读进度 68%。</p>
        <div class="progress"><span style="width:68%"></span></div>
        <div class="info-grid" style="margin-top:16px;">
          <div class="info-box"><span>作者</span><strong>未命名作者</strong></div>
          <div class="info-box"><span>系列</span><strong><a data-go="series" style="cursor:pointer;color:var(--accent);">慢读札记</a></strong></div>
          <div class="info-box"><span>标签</span><strong>散文、夜读、收藏</strong></div>
          <div class="info-box"><span>本地路径</span><strong>/Books/Essay</strong></div>
        </div>
        <div style="margin-top:16px;display:flex;gap:8px;">
          <button class="ghost-button" data-go="bookEdit">${icon('pencil-square', 'icon-sm')} 编辑</button>
          <button class="ghost-button" style="color:var(--danger);" data-action="deleteBook">${icon('trash', 'icon-sm')} 删除</button>
        </div>
        <div style="margin-top:12px;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);">
          ${icon('check-circle', 'icon-sm')} <span>文件状态正常</span>
        </div>
      </div>
    </div>
  `, "shelf", "书籍详情", "元数据、进度和本地文件状态");
}

function bookEdit() {
  return shell(`
    <div class="card" style="padding:20px;">
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;color:var(--muted);margin-bottom:6px;">标题</label>
        <input class="search-input" type="text" value="海边的书房" style="width:100%;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;color:var(--muted);margin-bottom:6px;">作者</label>
        <input class="search-input" type="text" value="未命名作者" style="width:100%;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;color:var(--muted);margin-bottom:6px;">系列</label>
        <input class="search-input" type="text" value="慢读札记" style="width:100%;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;color:var(--muted);margin-bottom:6px;">卷号</label>
        <input class="search-input" type="text" value="" placeholder="如：第 3 卷" style="width:100%;">
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;color:var(--muted);margin-bottom:6px;">标签</label>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">
          <span class="chip active">散文 <span style="cursor:pointer;margin-left:4px;">×</span></span>
          <span class="chip active">夜读 <span style="cursor:pointer;margin-left:4px;">×</span></span>
          <span class="chip active">收藏 <span style="cursor:pointer;margin-left:4px;">×</span></span>
        </div>
        <div style="display:flex;gap:8px;">
          <input class="search-input" type="text" placeholder="添加标签" style="flex:1;">
          <button class="chip">${icon('plus', 'icon-sm')} 添加</button>
        </div>
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;color:var(--muted);margin-bottom:6px;">格式</label>
        <input class="search-input" type="text" value="EPUB" style="width:100%;" readonly>
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;color:var(--muted);margin-bottom:6px;">文件路径</label>
        <input class="search-input" type="text" value="/Books/Essay/海边的书房.epub" style="width:100%;" readonly>
      </div>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:13px;color:var(--muted);margin-bottom:6px;">简介</label>
        <textarea class="search-input" style="width:100%;min-height:80px;resize:vertical;" placeholder="添加简介...">本地散文集。关于阅读、书房与安静的文字。</textarea>
      </div>
      <div class="button-row">
        <button class="primary-button" data-action="saveEdit">${icon('check', 'icon-sm')} 保存</button>
        <button class="ghost-button" data-go="back">取消</button>
      </div>
    </div>
  `, "shelf", "编辑书籍元数据", "编辑", true);
}

function series() {
  const seriesList = [
    { name: "火凤燎原", volumes: 5, current: 3, progress: 48, type: "CBZ" },
    { name: "慢读札记", volumes: 3, current: 2, progress: 68, type: "EPUB" },
    { name: "城市档案", volumes: 8, current: 1, progress: 27, type: "PDF" },
  ];
  return shell(`
    <section class="section solid-card" style="margin-top:0;">
      <div class="section-head"><div><h3>全部系列</h3><p>共 ${seriesList.length} 个系列</p></div></div>
      <div class="series-cards">
        ${seriesList.map(s => `
          <div class="series-card" data-go="series">
            <strong>${s.name}</strong>
            <span>${s.volumes} 卷 · 当前第 ${s.current} 卷 · ${s.type}</span>
            <div class="progress"><span style="width:${s.progress}%"></span></div>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="section solid-card">
      <div class="section-head"><div><h3>火凤燎原</h3><p>5 卷 · 当前第 3 卷 · 从右到左</p></div><button class="primary-button" data-go="comic">${icon('book-open', 'icon-sm')} 继续当前卷</button></div>
      <div class="list">
        ${[1,2,3,4,5].map(i=>`<div class="list-item" data-go="comic"><div class="thumb"></div><div><strong>第 ${String(i).padStart(2,"0")} 卷</strong><span>${i<3?"已读":i===3?"阅读中 · 42%":"未读"} · CBZ</span></div><button class="chip ${i===3?"active":""}">${i===3?"继续":"打开"}</button></div>`).join("")}
      </div>
    </section>
  `, "shelf", "系列", "卷册聚合与连续阅读");
}

function textReader() {
  const panelContent = getReaderPanel();
  return `<div class="reader fade-in">
    <div class="reader-top">
      <button class="icon-button back-button" data-go="back" style="color:var(--muted);">${icon('arrow-left', 'icon-sm')}</button>
      <span>海边的书房</span><span>第三章 · 68%</span>
    </div>
    <article class="text-page">
      <h2>第三章　潮声与灯下纸页</h2>
      <p>窗外的海风在夜色里变得缓慢。书房没有多余的灯，只留下一盏低低的台灯，把纸页照成温暖的颜色。</p>
      <p>本地书库像一间安静的屋子。每一本书都在原处，只是被重新编排、标记、照看。</p>
      <p>阅读不需要被打断，也不必向远处证明什么。读者只需留下进度、书签，以及那些愿意反复回看的句子。</p>
    </article>
    <div class="reader-toolbar">
      <span style="color:var(--muted);font-size:12px;">第 3 章 · 68%</span>
      <div class="reader-tools">
        <button class="chip ${state.readerPanel==='toc'?'active':''}" data-panel="toc">${icon('list-bullet', 'icon-sm')} 目录</button>
        <button class="chip ${state.readerPanel==='font'?'active':''}" data-panel="font">${icon('adjustments-horizontal', 'icon-sm')} 字体</button>
        <button class="chip ${state.readerPanel==='theme'?'active':''}" data-panel="theme">${icon('sun', 'icon-sm')} 主题</button>
        <button class="chip ${state.readerPanel==='bookmark'?'active':''}" data-panel="bookmark">${icon('bookmark-square', 'icon-sm')} 书签</button>
      </div>
    </div>
    ${panelContent}
  </div>`;
}

function comic() {
  const panelContent = getComicPanel();
  return `<div class="reader fade-in">
    <div class="comic-stage">
      <div class="reader-top">
        <button class="icon-button back-button" data-go="back" style="color:#dce1e7;">${icon('arrow-left', 'icon-sm')}</button>
        <span style="color:#dce1e7;">火凤燎原 12</span><span style="color:#dce1e7;">42 / 128</span>
      </div>
      <div class="comic-sheet"><div class="comic-panel"></div><div class="comic-panel"></div></div>
      <div class="reader-toolbar">
        <span style="color:var(--muted);font-size:12px;">双页 · 从右到左</span>
        <div class="reader-tools">
          <button class="chip ${state.readerPanel==='thumbnail'?'active':''}" data-panel="thumbnail">${icon('squares-2x2', 'icon-sm')} 缩略图</button>
          <button class="chip ${state.readerPanel==='mode'?'active':''}" data-panel="mode">${icon('view-columns', 'icon-sm')} 模式</button>
          <button class="chip ${state.readerPanel==='direction'?'active':''}" data-panel="direction">${icon('arrow-left', 'icon-sm')} 方向</button>
          <button class="chip ${state.readerPanel==='crop'?'active':''}" data-panel="crop">${icon('adjustments-horizontal', 'icon-sm')} 裁边</button>
        </div>
      </div>
      ${panelContent}
    </div>
  </div>`;
}

function pdf() {
  const panelContent = getPdfPanel();
  return `<div class="reader fade-in">
    <div class="pdf-stage">
      <div class="reader-top">
        <button class="icon-button back-button" data-go="back" style="color:var(--muted);">${icon('arrow-left', 'icon-sm')}</button>
        <span>阅读器设计笔记</span><span>12 / 86</span>
      </div>
      <div class="pdf-page">
        <h2>Local First Reading Workspace</h2>
        <div class="pdf-line"></div><div class="pdf-line"></div><div class="pdf-line short"></div>
        <div class="pdf-callout">A reader should first respect the user's own files, habits, and silence.</div>
        <div class="pdf-line"></div><div class="pdf-line"></div><div class="pdf-line short"></div>
      </div>
      <div class="reader-toolbar">
        <span style="color:var(--muted);font-size:12px;">第 12 页 · 目录可用</span>
        <div class="reader-tools">
          <button class="chip ${state.readerPanel==='toc'?'active':''}" data-panel="toc">${icon('list-bullet', 'icon-sm')} 目录</button>
          <button class="chip ${state.readerPanel==='jump'?'active':''}" data-panel="jump">${icon('document-text', 'icon-sm')} 跳页</button>
          <button class="chip ${state.readerPanel==='highlight'?'active':''}" data-panel="highlight">${icon('pencil-square', 'icon-sm')} 高亮</button>
          <button class="chip ${state.readerPanel==='bookmark'?'active':''}" data-panel="bookmark">${icon('bookmark-square', 'icon-sm')} 书签</button>
        </div>
      </div>
      ${panelContent}
    </div>
  </div>`;
}

function notes() {
  const noteFilters = ['全部','摘录','高亮','备注'];
  const notesData = [
    { type: "摘录", title: "文本摘录", content: "阅读不需要被打断，也不必向远处证明什么。", source: "海边的书房 · 第三章", go: "noteDetail" },
    { type: "高亮", title: "PDF 高亮", content: "本地优先不是功能，而是一种边界感。", source: "阅读器设计笔记 · 第 12 页", go: "noteDetail" },
    { type: "备注", title: "漫画页备注", content: "这一页适合作为系列封面候选。", source: "火凤燎原 12 · 第 42 页", go: "noteDetail" },
  ];
  return shell(`
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
      ${noteFilters.map((f, i) => `<button class="chip ${i===0?'active':''}">${f}</button>`).join('')}
    </div>
    <div class="list">
      ${notesData.map(n => `
        <div class="list-item" data-go="${n.go}">
          <div class="thumb"></div>
          <div><strong>${n.title}</strong><span>${n.content}<br>${n.source}</span></div>
          <button class="chip">${icon('eye', 'icon-sm')} 查看</button>
        </div>
      `).join('')}
    </div>
  `, "notes", "笔记", "书签、摘录、批注集中管理");
}

function noteDetail() {
  return shell(`
    <div class="card" style="padding:20px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
        <span class="chip active">摘录</span>
        <span style="font-size:12px;color:var(--muted);">2025-01-15 22:30</span>
      </div>
      <h3 style="font-size:20px;margin:0 0 12px;">文本摘录</h3>
      <div style="margin-bottom:16px;">
        <p style="font-size:13px;color:var(--muted);margin:0 0 4px;">来源</p>
        <div style="display:flex;align-items:center;gap:6px;">
          ${icon('book-open', 'icon-sm')}
          <strong>海边的书房</strong>
          <span style="color:var(--muted);">· 第三章 · 68%</span>
        </div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px;line-height:1.8;">
        阅读不需要被打断，也不必向远处证明什么。读者只需留下进度、书签，以及那些愿意反复回看的句子。
      </div>
      <div class="button-row">
        <button class="primary-button" data-go="text">${icon('book-open', 'icon-sm')} 跳转到原文</button>
        <button class="ghost-button">${icon('pencil-square', 'icon-sm')} 编辑</button>
        <button class="ghost-button" style="color:var(--danger);" data-action="deleteNote">${icon('trash', 'icon-sm')} 删除</button>
      </div>
    </div>
  `, "notes", "笔记详情", "查看笔记内容与来源", true);
}

function importPage() {
  return shell(`
    <div class="bento">
      <section class="hero-card card">
        <span class="kicker">扫描中</span>
        <h3>正在整理本地目录</h3>
        <p>/Books、/Comics、/Documents。扫描过程不会移动或上传你的原始文件。</p>
        <div class="progress"><span style="width:74%"></span></div>
        <div class="button-row" style="margin-top:12px;">
          <button class="ghost-button">${icon('x-mark', 'icon-sm')} 取消扫描</button>
        </div>
      </section>
      <section class="metric-grid">
        <div class="metric">${icon('check-circle', 'icon-sm')}<b>24</b><span>新增</span></div>
        <div class="metric">${icon('arrow-up-tray', 'icon-sm')}<b>8</b><span>更新</span></div>
        <div class="metric">${icon('exclamation-triangle', 'icon-sm')}<b>3</b><span>失败</span></div>
      </section>
    </div>
    <section class="section solid-card">
      <div class="section-head"><div><h3>导入明细</h3><p>失败项可单独重试</p></div></div>
      <div class="list">
        <div class="list-item"><div class="thumb"></div><div><strong>火凤燎原 第12卷.cbz</strong><span>已加入书库</span></div><button class="chip active">${icon('check', 'icon-sm')} 完成</button></div>
        <div class="list-item"><div class="thumb"></div><div><strong>旧书目录.html</strong><span>已识别</span></div><button class="chip active">${icon('check', 'icon-sm')} 完成</button></div>
        <div class="list-item"><div class="thumb"></div><div><strong>损坏压缩包.zip</strong><span>解析失败</span></div><button class="chip" data-retry="损坏压缩包.zip">${icon('arrow-up-tray', 'icon-sm')} 重试</button></div>
      </div>
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
        <p style="font-size:12px;color:var(--muted);">${icon('information-circle', 'icon-sm')} 支持 EPUB、PDF、CBZ、CBR、TXT、Markdown、HTML 等格式。大文件可能需要更长的解析时间。</p>
      </div>
    </section>
  `, "settings", "导入扫描", "本地目录扫描与导入反馈");
}

function settings() {
  return shell(`
    <div class="setting-grid">
      <div class="setting">
        <div><strong>${icon('moon', 'icon-sm')} 默认夜读主题</strong><p>文本阅读使用柔和暗色背景</p></div>
        ${switchEl('nightTheme')}
      </div>
      <div class="setting">
        <div><strong>${icon('view-columns', 'icon-sm')} 横屏双栏</strong><p>平板和桌面文本阅读启用</p></div>
        ${switchEl('dualColumn')}
      </div>
      <div class="setting">
        <div><strong>${icon('adjustments-horizontal', 'icon-sm')} 音量键翻页</strong><p>Android 设备可用</p></div>
        ${switchEl('volumeKey')}
      </div>
      <div class="setting">
        <div><strong>${icon('archive-box', 'icon-sm')} 自动备份</strong><p>每周自动导出阅读数据</p></div>
        ${switchEl('autoBackup')}
      </div>
      <div class="setting">
        <div><strong>${icon('folder-open', 'icon-sm')} 自动扫描</strong><p>启动时扫描本地目录变更</p></div>
        ${switchEl('autoScan')}
      </div>
      <div class="setting">
        <div><strong>${icon('sparkles', 'icon-sm')} 减少动画</strong><p>降低界面动画效果</p></div>
        ${switchEl('reduceMotion')}
      </div>
    </div>
    <div style="margin-top:16px;">
      <div class="list">
        <div class="list-item" data-go="backup"><div>${icon('archive-box', 'icon-sm')}</div><div><strong>备份管理</strong><span>导出与导入阅读数据</span></div>${icon('chevron-right', 'icon-sm')}</div>
        <div class="list-item" data-go="cache"><div>${icon('server', 'icon-sm')}</div><div><strong>缓存管理</strong><span>封面、缩略图、搜索索引</span></div>${icon('chevron-right', 'icon-sm')}</div>
        <div class="list-item" data-go="privacy"><div>${icon('shield-check', 'icon-sm')}</div><div><strong>隐私说明</strong><span>默认不上传原始文件</span></div>${icon('chevron-right', 'icon-sm')}</div>
        <div class="list-item" data-action="about"><div>${icon('information-circle', 'icon-sm')}</div><div><strong>关于</strong><span>版本 1.0.0</span></div>${icon('chevron-right', 'icon-sm')}</div>
      </div>
    </div>
  `, "settings", "设置", "阅读、数据、隐私设置");
}

function backup() {
  return shell(`
    <div class="card" style="padding:20px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
        ${icon('archive-box', 'icon-md')}
        <div>
          <strong>上次备份</strong>
          <p style="color:var(--muted);font-size:13px;margin:0;">2025-01-14 08:30 · 自动备份</p>
        </div>
      </div>
      <div class="button-row">
        <button class="primary-button" data-action="exportBackup">${icon('arrow-down-tray', 'icon-sm')} 导出备份</button>
        <button class="ghost-button" data-action="importBackup">${icon('arrow-up-tray', 'icon-sm')} 导入备份</button>
      </div>
    </div>
    <div class="card" style="padding:20px;margin-bottom:16px;">
      <h4 style="margin:0 0 12px;">备份内容</h4>
      <div class="info-grid">
        <div class="info-box"><span>书籍元数据</span><strong>128 条</strong></div>
        <div class="info-box"><span>阅读进度</span><strong>36 条</strong></div>
        <div class="info-box"><span>笔记与书签</span><strong>24 条</strong></div>
        <div class="info-box"><span>标签与系列</span><strong>18 条</strong></div>
      </div>
    </div>
    <div style="padding:0 4px;">
      <p style="font-size:12px;color:var(--muted);line-height:1.7;">${icon('information-circle', 'icon-sm')} 备份文件为 JSON 格式，包含书籍元数据、阅读进度、笔记、书签和标签信息。不包含原始文件内容。</p>
    </div>
  `, "settings", "备份", "导出与导入阅读数据", true);
}

function cache() {
  const cacheItems = [
    { name: "封面缓存", size: "48 MB", percent: 60 },
    { name: "缩略图缓存", size: "120 MB", percent: 75 },
    { name: "搜索索引", size: "12 MB", percent: 30 },
    { name: "PDF 页面缓存", size: "86 MB", percent: 55 },
  ];
  return shell(`
    <div class="card" style="padding:20px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div>
          <strong>总缓存大小</strong>
          <p style="color:var(--muted);font-size:13px;margin:0;">266 MB</p>
        </div>
        ${icon('server', 'icon-md')}
      </div>
    </div>
    <div class="card" style="padding:20px;margin-bottom:16px;">
      ${cacheItems.map(c => `
        <div style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:14px;">${c.name}</span>
            <span style="font-size:13px;color:var(--muted);">${c.size}</span>
          </div>
          <div class="progress"><span style="width:${c.percent}%"></span></div>
        </div>
      `).join('')}
    </div>
    <div class="button-row" style="justify-content:center;">
      <button class="ghost-button" style="color:var(--danger);" data-action="clearCache">${icon('trash', 'icon-sm')} 清除全部缓存</button>
    </div>
  `, "settings", "缓存", "管理本地缓存空间", true);
}

function privacy() {
  return shell(`
    <div class="card" style="padding:20px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
        ${icon('shield-check', 'icon-md')}
        <h3 style="margin:0;">核心原则</h3>
      </div>
      <div class="list">
        <div class="list-item"><div>${icon('check', 'icon-sm')}</div><div><strong>默认不上传</strong><span>所有数据保存在本机，不发送到任何服务器</span></div></div>
        <div class="list-item"><div>${icon('check', 'icon-sm')}</div><div><strong>不删除原文件</strong><span>导入扫描只读取，不移动或修改原始文件</span></div></div>
        <div class="list-item"><div>${icon('check', 'icon-sm')}</div><div><strong>数据本地存储</strong><span>进度、笔记、书签全部保存在本地数据库</span></div></div>
      </div>
    </div>
    <div class="card" style="padding:20px;margin-bottom:16px;">
      <h4 style="margin:0 0 12px;">权限说明</h4>
      <div class="list">
        <div class="list-item"><div>${icon('folder-open', 'icon-sm')}</div><div><strong>文件读取</strong><span>扫描和导入本地书籍文件</span></div></div>
        <div class="list-item"><div>${icon('folder', 'icon-sm')}</div><div><strong>目录访问</strong><span>批量扫描指定目录下的书籍</span></div></div>
        <div class="list-item"><div>${icon('archive-box', 'icon-sm')}</div><div><strong>存储写入</strong><span>保存阅读数据和备份文件</span></div></div>
      </div>
    </div>
    <div class="card" style="padding:20px;">
      <h4 style="margin:0 0 12px;">数据清除</h4>
      <p style="color:var(--muted);font-size:14px;line-height:1.7;">卸载应用将自动清除所有阅读数据。你也可以在设置中手动清除缓存或导出备份后重置数据。原始文件不受影响。</p>
    </div>
  `, "settings", "隐私", "本地优先，默认不上传", true);
}

function viewAll() {
  return shell(`
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center;">
      <div class="search-pill" style="flex:1;min-width:200px;">
        <input class="search-input" type="text" placeholder="搜索书籍..." data-search="viewAll">
      </div>
      <button class="chip active">全部</button>
      <button class="chip">EPUB</button>
      <button class="chip">PDF</button>
      <button class="chip">CBZ</button>
      <button class="chip">${icon('funnel', 'icon-sm')} 排序</button>
    </div>
    <div class="book-row" style="flex-wrap:wrap;">
      ${books.map(bookCard).join('')}
    </div>
    <div class="pagination" style="margin-top:16px;">
      <button class="page-btn">${icon('chevron-left', 'icon-sm')}</button>
      <button class="page-btn active">1</button>
      <button class="page-btn">2</button>
      <button class="page-btn">3</button>
      <button class="page-btn">${icon('chevron-right', 'icon-sm')}</button>
    </div>
  `, "shelf", "全部书籍", "浏览完整书库", true);
}

// ─── Reader Panels ───

function tocPanel() {
  return `<div class="reader-panel fade-in">
    <div class="panel-header"><h4>目录</h4><button class="icon-button" data-panel="close">${icon('x-mark', 'icon-sm')}</button></div>
    <div class="panel-body">
      <div class="toc-item">第一章　书房的边界</div>
      <div class="toc-item">第二章　纸页之间</div>
      <div class="toc-item active">第三章　潮声与灯下纸页</div>
      <div class="toc-item" style="padding-left:24px;">3.1　海风与台灯</div>
      <div class="toc-item" style="padding-left:24px;">3.2　安静的房子</div>
      <div class="toc-item">第四章　阅读的留白</div>
      <div class="toc-item">第五章　本地与远方</div>
    </div>
  </div>`;
}

function fontPanel() {
  return `<div class="reader-panel fade-in">
    <div class="panel-header"><h4>字体设置</h4><button class="icon-button" data-panel="close">${icon('x-mark', 'icon-sm')}</button></div>
    <div class="panel-body">
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;">字号</span><span style="font-size:13px;color:var(--muted);">18px</span></div>
        <input type="range" min="14" max="28" value="18" style="width:100%;">
      </div>
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;">行距</span><span style="font-size:13px;color:var(--muted);">2.05</span></div>
        <input type="range" min="15" max="25" value="20" style="width:100%;">
      </div>
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-size:13px;">边距</span><span style="font-size:13px;color:var(--muted);">30px</span></div>
        <input type="range" min="20" max="60" value="30" style="width:100%;">
      </div>
      <div>
        <span style="font-size:13px;display:block;margin-bottom:8px;">字体</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="chip active">系统默认</button>
          <button class="chip">宋体</button>
          <button class="chip">楷体</button>
          <button class="chip">黑体</button>
        </div>
      </div>
    </div>
  </div>`;
}

function themePanel() {
  const themes = [
    { name: "默认白", color: "#ffffff" },
    { name: "暖黄", color: "#f5f0e8" },
    { name: "护眼绿", color: "#e8f0e4" },
    { name: "深色", color: "#1a1a2e" },
  ];
  return `<div class="reader-panel fade-in">
    <div class="panel-header"><h4>阅读主题</h4><button class="icon-button" data-panel="close">${icon('x-mark', 'icon-sm')}</button></div>
    <div class="panel-body">
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        ${themes.map((t, i) => `
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;">
            <div style="width:48px;height:48px;border-radius:8px;background:${t.color};border:2px solid ${i===0?'var(--accent)':'var(--border)'};"></div>
            <span style="font-size:12px;color:var(--muted);">${t.name}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

function bookmarkPanel() {
  return `<div class="reader-panel fade-in">
    <div class="panel-header"><h4>书签</h4><button class="icon-button" data-panel="close">${icon('x-mark', 'icon-sm')}</button></div>
    <div class="panel-body">
      <button class="primary-button" style="width:100%;margin-bottom:16px;">${icon('bookmark-square', 'icon-sm')} 添加书签</button>
      <div class="list">
        <div class="list-item"><div>${icon('bookmark-square', 'icon-sm')}</div><div><strong>第三章开头</strong><span>潮声与灯下纸页</span></div></div>
        <div class="list-item"><div>${icon('bookmark-square', 'icon-sm')}</div><div><strong>重要段落</strong><span>第二章 · 阅读不需要被打断</span></div></div>
        <div class="list-item"><div>${icon('bookmark-square', 'icon-sm')}</div><div><strong>序言</strong><span>关于本地与边界</span></div></div>
      </div>
    </div>
  </div>`;
}

function comicThumbnailPanel() {
  const pages = Array.from({length: 20}, (_, i) => i + 1);
  return `<div class="reader-panel fade-in">
    <div class="panel-header"><h4>页面缩略图</h4><button class="icon-button" data-panel="close">${icon('x-mark', 'icon-sm')}</button></div>
    <div class="panel-body">
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
        ${pages.map(p => `
          <div style="aspect-ratio:3/4;background:var(--surface);border:2px solid ${p===42%20+1?'var(--accent)':'var(--border)'};border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted);">
            ${p}
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}

function pdfJumpPanel() {
  return `<div class="reader-panel fade-in">
    <div class="panel-header"><h4>跳转到页面</h4><button class="icon-button" data-panel="close">${icon('x-mark', 'icon-sm')}</button></div>
    <div class="panel-body">
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <input class="search-input" type="number" placeholder="页码" min="1" max="86" style="flex:1;">
        <button class="primary-button">跳转</button>
      </div>
      <p style="font-size:13px;color:var(--muted);text-align:center;">当前第 12 页 / 共 86 页</p>
    </div>
  </div>`;
}

function getReaderPanel() {
  switch (state.readerPanel) {
    case 'toc': return tocPanel();
    case 'font': return fontPanel();
    case 'theme': return themePanel();
    case 'bookmark': return bookmarkPanel();
    default: return '';
  }
}

function getComicPanel() {
  switch (state.readerPanel) {
    case 'thumbnail': return comicThumbnailPanel();
    case 'mode': return `<div class="reader-panel fade-in">
      <div class="panel-header"><h4>阅读模式</h4><button class="icon-button" data-panel="close">${icon('x-mark', 'icon-sm')}</button></div>
      <div class="panel-body">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="chip active" style="width:100%;justify-content:left;">单页模式</button>
          <button class="chip" style="width:100%;justify-content:left;">双页模式</button>
          <button class="chip" style="width:100%;justify-content:left;">条漫模式</button>
        </div>
      </div>
    </div>`;
    case 'direction': return `<div class="reader-panel fade-in">
      <div class="panel-header"><h4>阅读方向</h4><button class="icon-button" data-panel="close">${icon('x-mark', 'icon-sm')}</button></div>
      <div class="panel-body">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="chip active" style="width:100%;justify-content:left;">从右到左（日漫）</button>
          <button class="chip" style="width:100%;justify-content:left;">从左到右</button>
        </div>
      </div>
    </div>`;
    case 'crop': return `<div class="reader-panel fade-in">
      <div class="panel-header"><h4>裁边设置</h4><button class="icon-button" data-panel="close">${icon('x-mark', 'icon-sm')}</button></div>
      <div class="panel-body">
        <div class="setting">
          <div><strong>自动裁边</strong><p>去除页面白边</p></div>
          ${switchEl('nightTheme')}
        </div>
      </div>
    </div>`;
    default: return '';
  }
}

function getPdfPanel() {
  switch (state.readerPanel) {
    case 'toc': return tocPanel();
    case 'jump': return pdfJumpPanel();
    case 'highlight': return `<div class="reader-panel fade-in">
      <div class="panel-header"><h4>高亮工具</h4><button class="icon-button" data-panel="close">${icon('x-mark', 'icon-sm')}</button></div>
      <div class="panel-body">
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <div style="width:28px;height:28px;border-radius:50%;background:#fbbf24;border:2px solid var(--accent);"></div>
          <div style="width:28px;height:28px;border-radius:50%;background:#34d399;"></div>
          <div style="width:28px;height:28px;border-radius:50%;background:#60a5fa;"></div>
          <div style="width:28px;height:28px;border-radius:50%;background:#f87171;"></div>
        </div>
        <p style="font-size:13px;color:var(--muted);">选中文字后可添加高亮标注</p>
      </div>
    </div>`;
    case 'bookmark': return bookmarkPanel();
    default: return '';
  }
}

// ─── Dialog System ───
function showDialog(html) {
  const overlay = document.getElementById('dialogOverlay');
  const dialog = document.getElementById('dialog');
  dialog.innerHTML = html;
  overlay.classList.remove('hidden');
}

function hideDialog() {
  document.getElementById('dialogOverlay').classList.add('hidden');
}

function confirmDialog(title, message, confirmText, onConfirm) {
  showDialog(`
    <div class="dialog-header"><h3>${title}</h3></div>
    <div class="dialog-body"><p>${message}</p></div>
    <div class="dialog-actions">
      <button class="ghost-button" onclick="hideDialog()">取消</button>
      <button class="primary-button" id="dialogConfirm">${confirmText}</button>
    </div>
  `);
  document.getElementById('dialogConfirm').addEventListener('click', () => {
    hideDialog();
    if (onConfirm) onConfirm();
  });
}

// ─── Toast System ───
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconMap = { success: 'check-circle', error: 'exclamation-triangle', info: 'information-circle' };
  toast.innerHTML = `${icon(iconMap[type] || 'information-circle', 'icon-sm')}<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; setTimeout(() => toast.remove(), 200); }, 3000);
}

// ─── Command Palette ───
function renderCommandPalette() {
  const overlay = document.getElementById('commandOverlay');
  const palette = document.getElementById('commandPalette');
  if (!state.commandOpen) { overlay.classList.add('hidden'); return; }
  overlay.classList.remove('hidden');
  const q = state.commandQuery.toLowerCase();
  const commands = [
    { icon: 'arrow-up-tray', label: '导入文件', action: 'import', kbd: 'Ctrl+O' },
    { icon: 'folder-open', label: '扫描目录', action: 'import' },
    { icon: 'magnifying-glass', label: '搜索书库', action: 'discover', kbd: 'Ctrl+K' },
    { icon: 'cog-6-tooth', label: '打开设置', action: 'settings', kbd: 'Ctrl+,' },
    { icon: 'book-open', label: '继续阅读', action: 'text' },
    { icon: 'archive-box', label: '备份管理', action: 'backup' },
    { icon: 'shield-check', label: '隐私说明', action: 'privacy' },
  ];
  const filtered = q ? commands.filter(c => c.label.toLowerCase().includes(q)) : commands;
  palette.innerHTML = `
    <input class="command-input" placeholder="输入命令或搜索..." value="${state.commandQuery}" id="commandInput">
    <div class="command-results">
      ${filtered.map(c => `<div class="command-item" data-go="${c.action}">${icon(c.icon, 'icon-md')}<span>${c.label}</span>${c.kbd ? `<span class="command-kbd">${c.kbd}</span>` : ''}</div>`).join('')}
    </div>
    <div class="command-hint">
      <span><span class="command-kbd">↑↓</span> 导航</span>
      <span><span class="command-kbd">Enter</span> 确认</span>
      <span><span class="command-kbd">Esc</span> 关闭</span>
    </div>
  `;
  const input = document.getElementById('commandInput');
  input.addEventListener('input', e => { state.commandQuery = e.target.value; renderCommandPalette(); });
  input.focus();
}

function openCommandPalette() {
  state.commandOpen = true;
  state.commandQuery = '';
  renderCommandPalette();
}

function closeCommandPalette() {
  state.commandOpen = false;
  state.commandQuery = '';
  renderCommandPalette();
}

// ─── Views ───
const views = {
  home, shelf, discover, detail, bookEdit, series,
  text: textReader, comic, pdf,
  notes, noteDetail, import: importPage,
  settings, backup, cache, privacy, viewAll, onboarding
};

// ─── Render ───
function render() {
  const [t, d] = meta[state.screen] || ["", ""];
  title.textContent = t;
  desc.textContent = d;
  app.innerHTML = views[state.screen]();
  bindEvents();
  document.querySelectorAll("#screenList button").forEach(btn => btn.classList.toggle("active", btn.dataset.screen === state.screen));
}

function navigate(screen) {
  if (screen === 'back') {
    if (state.history.length > 0) {
      state.screen = state.history.pop();
    } else {
      state.screen = 'home';
    }
  } else {
    state.history.push(state.screen);
    state.screen = screen;
  }
  state.readerPanel = null;
  render();
}

function bindEvents() {
  // data-go navigation
  document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", (e) => {
    e.stopPropagation();
    const target = el.dataset.go;
    navigate(target);
  }));

  // data-shelf-filter
  document.querySelectorAll("[data-shelf-filter]").forEach(el => el.addEventListener("click", () => {
    state.shelfFilter = parseInt(el.dataset.shelfFilter);
    render();
  }));

  // data-shelf-page
  document.querySelectorAll("[data-shelf-page]").forEach(el => el.addEventListener("click", () => {
    const val = el.dataset.shelfPage;
    if (val === 'prev') state.shelfPage = Math.max(1, state.shelfPage - 1);
    else if (val === 'next') state.shelfPage = Math.min(8, state.shelfPage + 1);
    else state.shelfPage = parseInt(val);
    render();
  }));

  // data-shelf-view
  document.querySelectorAll("[data-shelf-view]").forEach(el => el.addEventListener("click", () => {
    state.shelfViewMode = el.dataset.shelfView;
    render();
  }));

  // data-shelf-sort
  document.querySelectorAll("[data-shelf-sort]").forEach(el => el.addEventListener("click", () => {
    state.shelfSortOpen = !state.shelfSortOpen;
    render();
  }));

  // data-panel
  document.querySelectorAll("[data-panel]").forEach(el => el.addEventListener("click", () => {
    const panel = el.dataset.panel;
    if (panel === 'close') {
      state.readerPanel = null;
    } else {
      state.readerPanel = state.readerPanel === panel ? null : panel;
    }
    render();
  }));

  // data-setting
  document.querySelectorAll("[data-setting]").forEach(el => el.addEventListener("click", () => {
    const key = el.dataset.setting;
    state.settings[key] = !state.settings[key];
    render();
  }));

  // data-retry
  document.querySelectorAll("[data-retry]").forEach(el => el.addEventListener("click", () => {
    showToast(`正在重试导入: ${el.dataset.retry}`, 'info');
  }));

  // data-action
  document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", () => {
    const action = el.dataset.action;
    switch (action) {
      case 'deleteBook':
        confirmDialog('删除书籍', '确定要从书架移除《海边的书房》吗？原始文件不会被删除。', '删除', () => {
          showToast('已从书架移除', 'success');
        });
        break;
      case 'deleteNote':
        confirmDialog('删除笔记', '确定要删除这条笔记吗？此操作不可撤销。', '删除', () => {
          showToast('笔记已删除', 'success');
        });
        break;
      case 'saveEdit':
        showToast('保存成功', 'success');
        navigate('back');
        break;
      case 'exportBackup':
        showToast('备份已导出到 /Backups/', 'success');
        break;
      case 'importBackup':
        confirmDialog('导入备份', '导入将覆盖当前数据，确定继续？', '导入', () => {
          showToast('备份已导入', 'success');
        });
        break;
      case 'clearCache':
        confirmDialog('清除缓存', '确定要清除所有缓存？下次打开书籍时需要重新加载。', '清除', () => {
          showToast('缓存已清除', 'success');
        });
        break;
      case 'about':
        showDialog(`
          <div class="dialog-header"><h3>关于本地阅读器</h3></div>
          <div class="dialog-body">
            <p style="text-align:center;margin-bottom:12px;">${icon('book-open', 'icon-xl')}</p>
            <p style="text-align:center;"><strong>本地阅读器</strong> v1.0.0</p>
            <p style="text-align:center;color:var(--muted);font-size:13px;">Local First · 默认不上传</p>
          </div>
          <div class="dialog-actions">
            <button class="primary-button" onclick="hideDialog()">确定</button>
          </div>
        `);
        break;
    }
  }));

  // search inputs
  document.querySelectorAll("[data-search]").forEach(el => el.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
  }));
  document.querySelectorAll("[data-search-suggest]").forEach(el => el.addEventListener("click", () => {
    state.searchQuery = el.dataset.searchSuggest;
    render();
  }));
}

// ─── Studio Controls ───
document.getElementById("screenList").addEventListener("click", e => {
  const btn = e.target.closest("button[data-screen]");
  if (!btn) return;
  state.screen = btn.dataset.screen;
  state.history = [];
  state.readerPanel = null;
  render();
});

document.getElementById("deviceSwitch").addEventListener("click", e => {
  const btn = e.target.closest("button[data-device]");
  if (!btn) return;
  state.device = btn.dataset.device;
  device.className = `device ${state.device}`;
  document.querySelectorAll("#deviceSwitch button").forEach(b => b.classList.toggle("active", b === btn));
  render();
});

document.getElementById("themeToggle").addEventListener("click", () => document.body.classList.toggle("dark"));
document.getElementById("densityToggle").addEventListener("click", () => document.body.classList.toggle("compact"));

// ─── Dialog overlay close ───
document.getElementById('dialogOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('dialogOverlay')) hideDialog();
});

// ─── Command overlay close ───
document.getElementById('commandOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('commandOverlay')) closeCommandPalette();
});

// ─── Keyboard shortcuts ───
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state.commandOpen) { closeCommandPalette(); return; }
    if (state.readerPanel) { state.readerPanel = null; render(); return; }
    const overlay = document.getElementById('dialogOverlay');
    if (!overlay.classList.contains('hidden')) { hideDialog(); return; }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (state.commandOpen) closeCommandPalette();
    else openCommandPalette();
  }
});

// ─── Init ───
render();
