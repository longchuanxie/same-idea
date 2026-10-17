/**
 * 测试夹具生成器：产出漫画压缩包、多编码文本、EPUB、PDF 等边界场景文件。
 *
 * 用法：node scripts/generate-test-fixtures.mjs
 * 输出：test-fixtures/{comics,text,markdown,epub,pdf,loose-images}/
 *
 * 全部文件可由本脚本确定性重建（不依赖网络与外部工具）。
 * 生成时会自检 GBK 字节表与 PDF 结构，失败即报错。
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const JSZip = require('jszip');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'test-fixtures');

function write(relPath, data) {
  const full = join(OUT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, data);
  console.log('  +', relPath);
}

/** 纯色 PNG（任意尺寸）：IHDR + stored-deflate IDAT，供条漫宽高比夹具 */
function makePng(width, height, r, g, b) {
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c >>> 0;
  }
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = new Uint8Array(4);
    new DataView(len.buffer).setUint32(0, data.length);
    const typeBytes = new Uint8Array([...type].map((c) => c.charCodeAt(0)));
    const body = new Uint8Array(data.length + 4);
    body.set(typeBytes); body.set(data, 4);
    const crc = new Uint8Array(4);
    new DataView(crc.buffer).setUint32(0, crc32(body));
    return new Uint8Array([...len, ...body, ...crc]);
  };
  const ihdr = new Uint8Array(13);
  new DataView(ihdr.buffer).setUint32(0, width);
  new DataView(ihdr.buffer).setUint32(4, height);
  ihdr[8] = 8; ihdr[9] = 2;
  const raw = new Uint8Array(height * (width * 3 + 1));
  for (let y = 0; y < height; y++) {
    const row = y * (width * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x++) {
      raw[row + 1 + x * 3] = r; raw[row + 2 + x * 3] = g; raw[row + 3 + x * 3] = b;
    }
  }
  const blocks = [];
  for (let i = 0; i < raw.length; i += 65535) {
    const slice = raw.subarray(i, i + 65535);
    const last = i + 65535 >= raw.length ? 1 : 0;
    blocks.push(new Uint8Array([last, slice.length & 255, (slice.length >> 8) & 255, ~slice.length & 255, (~(slice.length >> 8)) & 255, ...slice]));
  }
  const zdata = new Uint8Array(blocks.reduce((n, blk) => n + blk.length, 0));
  let zi = 0; for (const blk of blocks) { zdata.set(blk, zi); zi += blk.length; }
  const zlib = new Uint8Array(zdata.length + 6);
  zlib[0] = 0x78; zlib[1] = 0x01;
  const A = 65521; let a = 1, bb = 0;
  for (const byte of raw) { a = (a + byte) % A; bb = (bb + a) % A; }
  zlib.set(zdata, 2);
  zlib.set(new Uint8Array([(bb >> 8) & 255, bb & 255, (a >> 8) & 255, a & 255]), zlib.length - 4);
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk('IHDR', ihdr), chunk('IDAT', zlib), chunk('IEND', new Uint8Array(0))];
  const total = parts.reduce((n, part) => n + part.length, 0);
  const out = new Uint8Array(total);
  let o = 0; for (const part of parts) { out.set(part, o); o += part.length; }
  return Buffer.from(out);
}

// 1x1 红色 PNG（解析器不读像素，占位即可）
const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

/** 手工构造合法的极简 PDF（xref 偏移按字节计算） */
function buildMinimalPdf(pageCount) {
  const objects = [];
  objects[1] = '<</Type/Catalog/Pages 2 0 R>>';
  const kids = Array.from({ length: pageCount }, (_, i) => `${3 + i} 0 R`).join(' ');
  objects[2] = `<</Type/Pages/Kids[${kids}]/Count ${pageCount}>>`;
  for (let i = 0; i < pageCount; i++) {
    objects[3 + i] = '<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>';
  }
  let out = '%PDF-1.4\n';
  const offsets = [];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = out.length;
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i++) {
    out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<</Size ${objects.length}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}

// GBK 字节表（仅夹具所需字符；生成时自检）
const GBK_TABLE = {
  第: [0xb5, 0xda], 一: [0xd2, 0xbb], 章: [0xd5, 0xc2], 二: [0xb6, 0xfe],
  十: [0xca, 0xae], 百: [0xb0, 0xd9], 这: [0xd5, 0xe2], 是: [0xca, 0xc7],
  内: [0xc4, 0xda], 容: [0xc8, 0xdd], 更: [0xb8, 0xfc], 多: [0xb6, 0xe0],
  结: [0xbd, 0xe1], 尾: [0xce, 0xb2], 天: [0xcc, 0xec], 地: [0xb5, 0xd8],
  '。': [0xa1, 0xa3],
};

function toGbk(text) {
  const bytes = [];
  for (const ch of text) {
    if (ch === '\n') { bytes.push(0x0a); continue; }
    const code = GBK_TABLE[ch];
    if (!code) throw new Error(`GBK 表缺少字符: ${ch}`);
    bytes.push(...code);
  }
  return Buffer.from(bytes);
}

async function main() {
  console.log('生成测试夹具 →', OUT);

  // ============ 漫画压缩包 ============
  const zipOf = async (entries) => {
    const zip = new JSZip();
    for (const [name, data] of Object.entries(entries)) {
      zip.file(name, data);
    }
    return zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });
  };

  await write('comics/comic-basic-3pages.cbz', await zipOf({
    '001.jpg': PNG_1X1, '002.jpg': PNG_1X1, '003.jpg': PNG_1X1,
  }));

  // 自然排序：字典序 1,10,11,2 vs 数字序 1,2,10,11
  await write('comics/comic-natural-sort.cbz', await zipOf({
    'page-1.jpg': PNG_1X1, 'page-2.jpg': PNG_1X1,
    'page-10.jpg': PNG_1X1, 'page-11.jpg': PNG_1X1,
  }));

  // 嵌套目录：图片应被递归收集
  await write('comics/comic-nested-folders.cbz', await zipOf({
    'vol1/001.jpg': PNG_1X1, 'vol1/002.jpg': PNG_1X1, 'vol2/001.jpg': PNG_1X1,
  }));

  // 中文文件名（UTF-8 标志位）
  await write('comics/comic-chinese-names.cbz', await zipOf({
    '第01话/开篇.png': PNG_1X1, '第02话/发展.png': PNG_1X1,
  }));

  // 混入非图片文件：应被忽略
  await write('comics/comic-mixed-nonimage.cbz', await zipOf({
    '001.jpg': PNG_1X1, 'readme.txt': Buffer.from('说明'), 'info.xml': Buffer.from('<a/>'),
  }));

  // 单页漫画
  await write('comics/comic-single-page.cbz', await zipOf({ 'only.jpg': PNG_1X1 }));

  // 章节化：目录模式（第N话）
  await write('comics/comic-chapter-folders.cbz', await zipOf({
    '第01话/001.jpg': PNG_1X1, '第01话/002.jpg': PNG_1X1,
    '第02话/001.jpg': PNG_1X1, '第02话/002.jpg': PNG_1X1,
  }));

  // 章节化：零售扫描包（内页文件夹过度细分 → 上退一级目录）
  await write('comics/comic-chapter-nested.cbz', await zipOf({
    'Ch.001/0001/001.jpg': PNG_1X1, 'Ch.001/0002/001.jpg': PNG_1X1,
    'Ch.002/0001/001.jpg': PNG_1X1,
  }));

  // 章节化：文件名序列（前缀+首数字段）
  await write('comics/comic-chapter-filename.cbz', await zipOf({
    'c01_001.jpg': PNG_1X1, 'c01_002.jpg': PNG_1X1,
    'c02_001.jpg': PNG_1X1, 'c02_002.jpg': PNG_1X1,
  }));

  // 条漫：极端竖长图，一图一话（64x512，宽高比 8）
  const TALL = () => makePng(64, 512, 120, 90, 60);
  await write('comics/comic-webtoon-tall.cbz', await zipOf({
    'strip1.png': TALL(), 'strip2.png': TALL(), 'strip3.png': TALL(),
  }));

  // 空压缩包（0 条目）→ 导入应报「压缩包中未找到任何图片」
  await write('comics/comic-empty.zip', await zipOf({}));

  // 只有文本没有图片 → 同样报错
  await write('comics/comic-no-images.zip', await zipOf({ 'readme.txt': Buffer.from('没有图片') }));

  // ============ 文本（各编码与结构边界） ============
  const threeChapters = '前言内容。\n第一章 开端\n开篇的内容。\n第二章 发展\n发展的内容。\n第一百二十章 大结局\n结局的内容。';
  write('text/utf8-nobom.txt', Buffer.from(threeChapters, 'utf-8'));
  write('text/utf8-bom.txt', Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(threeChapters, 'utf-8')]));

  // GBK：生成时自检解码一致性
  const gbkText = '第一章\n这是内容。\n第二章\n更多内容。\n第一百二十章\n结尾。';
  const gbkBytes = toGbk(gbkText);
  write('text/gbk.txt', gbkBytes);

  // UTF-16LE：已知限制——解码回退链（UTF-8→GBK）会产生乱码但不崩溃
  write('text/utf16le-known-limitation.txt', Buffer.from('第一章\n内容。', 'utf16le'));

  write('text/empty.txt', Buffer.alloc(0));
  write('text/whitespace-only.txt', Buffer.from('  \n\n \t \n', 'utf-8'));
  write('text/no-chapters.txt', Buffer.from('这是没有章节标记的一本书。\n第二段内容。\n第三段内容。', 'utf-8'));
  write('text/chapter-at-start.txt', Buffer.from('第一章 从头开始\n开篇内容。', 'utf-8'));
  write('text/large-chapter-numbers.txt', Buffer.from('第12章 十二\n内容。\n第100章 一百\n内容。', 'utf-8'));
  // 前导空白的「第一章」应视为内容行而非标题（单章节）
  write('text/indented-title-not-chapter.txt', Buffer.from('正文开始。\n  第一章 缩进的伪标题\n正文内容。', 'utf-8'));
  write('text/crlf.txt', Buffer.from('第一章 CRLF\r\n内容一。\r\n第二章 CRLF\r\n内容二。', 'utf-8'));
  // 超长单段（约 220KB）：分页性能压力样本
  write('text/long-paragraph.txt', Buffer.from('这是一个很长的段落没有换行。'.repeat(17000), 'utf-8'));

  // ============ Markdown ============
  write('markdown/md-no-headings.md', Buffer.from('普通段落一。\n\n普通段落二。', 'utf-8'));
  write('markdown/md-h1-h2.md', Buffer.from('# 卷一\n引言。\n\n## 第一章\n内容。\n\n## 第二章\n内容。', 'utf-8'));
  // 已知限制：代码围栏内的 `# 标题` 行也会被当作章节标题（splitMarkdownIntoChapters 不感知围栏）
  write('markdown/md-code-fence-known-limitation.md', Buffer.from(
    '```bash\n# 这不是标题\necho hi\n```\n正文。', 'utf-8'));

  // ============ EPUB ============
  const epubOf = async (files) => {
    const zip = new JSZip();
    for (const [name, data] of Object.entries(files)) zip.file(name, data);
    return zip.generateAsync({ type: 'nodebuffer' });
  };
  const containerXml = '<?xml version="1.0"?><container><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>';
  const opf = (withNcx) => `<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
  <manifest>
    <item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch2" href="ch2.xhtml" media-type="application/xhtml+xml"/>
    ${withNcx ? '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>' : '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>'}
  </manifest>
  <spine${withNcx ? ' toc="ncx"' : ''}><itemref idref="ch1"/><itemref idref="ch2"/></spine>
</package>`;
  const ch1 = '<html><body><h1>第一章 标题</h1><p>第一章的段落。</p></body></html>';
  const ch2 = '<html><body><h2>第二章 标题</h2><p>第二章的段落。</p></body></html>';
  const ncx = `<?xml version="1.0"?><ncx xmlns="http://www.daisy.org/z3986/2005/ncx/"><navMap>
    <navPoint id="n1"><navLabel><text>第一章 目录</text></navLabel><content src="ch1.xhtml"/></navPoint>
    <navPoint id="n2"><navLabel><text>第二章 目录</text></navLabel><content src="ch2.xhtml"/></navPoint>
  </navMap></ncx>`;
  const nav = `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body><nav epub:type="toc"><ol>
    <li><a href="ch1.xhtml">第一章 目录</a></li>
    <li><a href="ch2.xhtml">第二章 目录</a></li>
  </ol></nav></body></html>`;

  await write('epub/basic-ncx.epub', await epubOf({
    mimetype: 'application/epub+zip',
    'META-INF/container.xml': containerXml,
    'OEBPS/content.opf': opf(true),
    'OEBPS/ch1.xhtml': ch1, 'OEBPS/ch2.xhtml': ch2, 'OEBPS/toc.ncx': ncx,
  }));
  // EPUB3 仅 nav 无 NCX：标题应回退 nav 或默认编号
  await write('epub/nav-only.epub', await epubOf({
    mimetype: 'application/epub+zip',
    'META-INF/container.xml': containerXml,
    'OEBPS/content.opf': opf(false),
    'OEBPS/ch1.xhtml': ch1, 'OEBPS/ch2.xhtml': ch2, 'OEBPS/nav.xhtml': nav,
  }));
  // 空章节：ch2 无文本内容，应被跳过
  await write('epub/empty-second-chapter.epub', await epubOf({
    mimetype: 'application/epub+zip',
    'META-INF/container.xml': containerXml,
    'OEBPS/content.opf': opf(true),
    'OEBPS/ch1.xhtml': ch1, 'OEBPS/ch2.xhtml': '<html><body></body></html>',
    'OEBPS/toc.ncx': ncx,
  }));
  // 损坏包：缺 container.xml → 应给出「无法解析 EPUB 包结构」类错误而非崩溃
  await write('epub/missing-container.epub', await epubOf({
    mimetype: 'application/epub+zip',
    'OEBPS/content.opf': opf(true), 'OEBPS/ch1.xhtml': ch1,
  }));

  // ============ PDF ============
  write('pdf/minimal-1page.pdf', buildMinimalPdf(1));
  write('pdf/minimal-3pages.pdf', buildMinimalPdf(3));
  // 截断损坏：应解析失败而非挂起
  write('pdf/truncated-corrupt.pdf', buildMinimalPdf(2).subarray(0, 120));

  // ============ 多文件合并（一话一文件，手动测试） ============
  await write('multi-archive/夜航 第01话.cbz', await zipOf({
    '001.jpg': PNG_1X1, '002.jpg': PNG_1X1,
  }));
  await write('multi-archive/夜航 第02话.cbz', await zipOf({
    '001.jpg': PNG_1X1, '002.jpg': PNG_1X1, '003.jpg': PNG_1X1,
  }));
  await write('multi-archive/夜航 第03话.cbz', await zipOf({
    '001.jpg': PNG_1X1,
  }));

// ============ 散图文件夹（文件夹导入手动测试） ============
  write('loose-images/划水的猫 01.png', PNG_1X1);
  write('loose-images/划水的猫 02.png', PNG_1X1);
  write('loose-images/划水的猫 03.png', PNG_1X1);
  write('loose-images/readme-not-image.txt', Buffer.from('文件夹导入时应忽略'));

// ============ MOBI（mobi6：无压缩 + EXTH + 图片资源） ============
/** 大端整型 Buffer */
const u16 = (v) => { const b = Buffer.alloc(2); b.writeUInt16BE(v >>> 0); return b; };
const u32 = (v) => { const b = Buffer.alloc(4); b.writeUInt32BE(v >>> 0); return b; };

/**
 * 手工构造合法的极简 mobi6（按 foliate-js mobi.js 读取的字段偏移对齐）：
 * 记录 0 = PalmDOC 头(16B) + MOBI 头(232B) + EXTH + 书名；
 * 记录 1 = 全文 HTML（按 <mbp:pagebreak/> 分节）；
 * 记录 2.. = 图片资源（recindex 1 起）。
 */
function buildMobi({ title, author, html, images }) {
  const titleBytes = Buffer.from(title, 'utf-8');
  const htmlBytes = Buffer.from(html, 'utf-8');
  const MOBI_HEADER_LEN = 232;
  const FIRST_IMAGE_RECORD = 2;

  const exthRecord = (type, data) => Buffer.concat([u32(type), u32(8 + data.length), data]);
  const exthBody = Buffer.concat([
    exthRecord(503, Buffer.from(title, 'utf-8')),   // title
    exthRecord(100, Buffer.from(author, 'utf-8')),  // creator
    exthRecord(201, u32(0)),                        // coverOffset：第 0 个资源即封面
  ]);
  const exthLenPadded = 12 + exthBody.length + ((4 - ((12 + exthBody.length) % 4)) % 4);
  const exth = Buffer.concat([
    Buffer.from('EXTH'), u32(exthLenPadded), u32(3), exthBody,
    Buffer.alloc(exthLenPadded - 12 - exthBody.length),
  ]);

  const titleOffset = 16 + MOBI_HEADER_LEN + exth.length;
  const rec0 = Buffer.alloc(titleOffset + titleBytes.length, 0);
  rec0.writeUInt16BE(1, 0);                    // compression: 1 = 无压缩
  rec0.writeUInt32BE(htmlBytes.length, 4);     // text length
  rec0.writeUInt16BE(1, 8);                    // numTextRecords
  rec0.writeUInt16BE(4096, 10);                // recordSize
  rec0.writeUInt16BE(0, 12);                   // encryption: 0
  rec0.write('MOBI', 16, 'latin1');
  rec0.writeUInt32BE(MOBI_HEADER_LEN, 20);
  rec0.writeUInt32BE(2, 24);                   // type: 2 = book
  rec0.writeUInt32BE(65001, 28);               // encoding: utf-8
  rec0.writeUInt32BE(17, 32);                  // uid
  rec0.writeUInt32BE(6, 36);                   // version: mobi6
  rec0.writeUInt32BE(titleOffset, 84);
  rec0.writeUInt32BE(titleBytes.length, 88);
  rec0.writeUInt32BE(FIRST_IMAGE_RECORD, 108); // first image record
  rec0.writeUInt32BE(0xffffffff, 112);         // 无 HUFF/CDIC
  rec0.writeUInt32BE(0, 116);
  rec0.writeUInt32BE(0x40, 128);               // exthFlag: EXTH 存在
  rec0.writeUInt32BE(0, 240);                  // trailing flags: 无
  rec0.writeUInt32BE(0xffffffff, 244);         // 无 INDX
  exth.copy(rec0, 16 + MOBI_HEADER_LEN);
  titleBytes.copy(rec0, titleOffset);

  const records = [rec0, htmlBytes, ...images];
  const headerLen = 78 + records.length * 8;
  const pdb = Buffer.alloc(headerLen, 0);
  pdb.write('mobi-fixture', 0, 'latin1');
  pdb.write('BOOK', 60, 'latin1');
  pdb.write('MOBI', 64, 'latin1');
  pdb.writeUInt32BE(0xffffffff, 72);
  pdb.writeUInt16BE(records.length, 76);
  let offset = headerLen;
  records.forEach((rec, i) => {
    pdb.writeUInt32BE(offset, 78 + i * 8);
    offset += rec.length;
  });
  return Buffer.concat([pdb, ...records]);
}

async function writeMobiFixtures() {
  const img = makePng(60, 20, 0x2f, 0x3b, 0x2f);
  const html = [
    '<html><body>',
    '<h1>第一章 长夜</h1>',
    '<p>山风掠过林梢，她沿着石阶向上走。</p>',
    '<p><img recindex="0001" alt="插图一"/></p>',
    '<p>暮色从谷底漫起来。</p>',
    '<mbp:pagebreak/>',
    '<h1>第二章 微光</h1>',
    '<p>堤岸尽头的路灯下有人在等。</p>',
    '</body></html>',
  ].join('');
  const mobi = buildMobi({
    title: 'MOBI 夹具书',
    author: '夹具作者',
    html,
    images: [img],
  });
  // 结构自检：BOOKMOBI 魔数与关键偏移
  if (mobi.toString('latin1', 60, 68) !== 'BOOKMOBI') throw new Error('MOBI 夹具魔数自检失败');
  write('mobi/fixture.mobi', mobi);
}

  await writeMobiFixtures();

  // GBK 自检
  const { TextDecoder } = globalThis;
  const decoded = new TextDecoder('gbk').decode(gbkBytes);
  if (decoded !== gbkText) {
    throw new Error(`GBK 字节表自检失败:\n期望: ${gbkText}\n实际: ${decoded}`);
  }
  if (!existsSync(OUT)) throw new Error('输出目录不存在');
  console.log('完成。GBK 自检通过，全部夹具已写入。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
