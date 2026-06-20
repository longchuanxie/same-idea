/**
 * 测试 TXT 和 EPUB 导入解析的脚本
 * 验证章节拆分、编码检测、EPUB 结构解析
 */
const fs = require('fs');
const path = require('path');

// ========== 章节拆分逻辑（从 utils.ts 复制） ==========

const CN_NUM = '[一二三四五六七八九十百千万零壹贰叁肆伍陆柒捌玖拾佰仟\\d]+';
const CHAPTER_WORD = '[章节回卷集篇部话话集]';

const CHAPTER_PATTERNS = [
  new RegExp(`^\\s*第${CN_NUM}${CHAPTER_WORD}.*\\s*$`, 'i'),
  /^\s*chapter\s+[\dIVXLCDMoneTwoThreeFourFiveSixSevenEightNineTen]+\b.*\s*$/i,
  /^\s*\d{1,4}\s*[、.．)\uff09]\s*.{1,40}\s*$/,
  /^\s*\d{3,4}\s+.{1,40}\s*$/,
];

const SPECIAL_CHAPTER_NAMES = new Set([
  '序言', '序', '前言', '前记', '引子', '楔子', '尾声', '后记', '后序', '跋',
  '终章', '番外', '番外篇', '完结', '尾声',
  'prologue', 'epilogue', 'preface', 'afterword', 'introduction', 'foreword',
  'appendix', 'interlude', 'conclusion',
]);

function isChapterTitle(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 60) return false;
  
  // 如果行以全角空格、半角空格、制表符开头，视为内容行
  if (line !== trimmed && /^[\s\u3000]/.test(line)) {
    return false;
  }
  
  if (SPECIAL_CHAPTER_NAMES.has(trimmed.toLowerCase())) return true;
  for (const pattern of CHAPTER_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  return false;
}

function splitTextIntoChapters(text) {
  const lines = text.split('\n');
  const chapters = [];
  let currentContent = [];
  let currentTitle = '';
  let foundFirstChapter = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (isChapterTitle(trimmed)) {
      if (currentContent.length > 0 || foundFirstChapter) {
        const content = currentContent.join('\n').trim();
        if (content || foundFirstChapter) {
          chapters.push({
            title: currentTitle || (foundFirstChapter ? '' : '前言'),
            content,
          });
        }
      }
      foundFirstChapter = true;
      currentTitle = trimmed;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  const lastContent = currentContent.join('\n').trim();
  if (foundFirstChapter) {
    chapters.push({ title: currentTitle, content: lastContent });
  } else if (lastContent) {
    chapters.push({ title: '正文', content: text });
  }

  return chapters.filter(ch => ch.content.length > 0);
}

// ========== 编码检测 ==========

function decodeWithFallback(buffer) {
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const text = decoder.decode(buffer);
    return { text, encoding: 'utf-8' };
  } catch {}
  try {
    const decoder = new TextDecoder('gbk', { fatal: false });
    const text = decoder.decode(buffer);
    return { text, encoding: 'gbk' };
  } catch {}
  const decoder = new TextDecoder('utf-8', { fatal: false });
  return { text: decoder.decode(buffer), encoding: 'utf-8' };
}

// ========== 测试 TXT ==========

async function testTxt() {
  console.log('\n========== TXT 测试 ==========');
  const filePath = 'C:\\Users\\15245\\Downloads\\凡人修仙传(1-500章).txt';
  
  const buffer = fs.readFileSync(filePath);
  console.log(`文件大小: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  
  const { text, encoding } = decodeWithFallback(buffer);
  console.log(`检测编码: ${encoding}`);
  console.log(`文本长度: ${text.length} 字符`);
  console.log(`前200字符预览: ${text.substring(0, 200).replace(/\n/g, '\\n')}`);
  
  const chapters = splitTextIntoChapters(text);
  console.log(`\n拆分章节数: ${chapters.length}`);
  
  // 显示前10个章节标题
  console.log('\n前10个章节:');
  chapters.slice(0, 10).forEach((ch, i) => {
    console.log(`  ${i + 1}. "${ch.title}" - ${ch.content.length} 字符`);
  });
  
  // 显示最后5个章节标题
  if (chapters.length > 10) {
    console.log('\n最后5个章节:');
    chapters.slice(-5).forEach((ch, i) => {
      console.log(`  ${chapters.length - 4 + i}. "${ch.title}" - ${ch.content.length} 字符`);
    });
  }
  
  // 检查章节标题格式
  const titlePatterns = {};
  chapters.forEach(ch => {
    const pattern = ch.title.match(/第(.+?)[章节回卷集篇部话]/);
    if (pattern) {
      const key = `第...${pattern[0].slice(-1)}`;
      titlePatterns[key] = (titlePatterns[key] || 0) + 1;
    }
  });
  console.log('\n章节标题格式统计:', titlePatterns);
  
  return chapters;
}

// ========== 测试 EPUB ==========

async function testEpub() {
  console.log('\n========== EPUB 测试 ==========');
  const filePath = 'C:\\Users\\15245\\Downloads\\《凡人修仙传》(精校版)_qinkan.net.epub';
  
  // 使用 JSZip
  const JSZip = require('jszip');
  const buffer = fs.readFileSync(filePath);
  console.log(`文件大小: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  
  const zip = await JSZip.loadAsync(buffer);
  const fileNames = Object.keys(zip.files);
  console.log(`ZIP 文件数: ${fileNames.length}`);
  
  // 找 OPF
  const containerXml = await zip.file('META-INF/container.xml')?.async('string');
  if (!containerXml) {
    console.log('ERROR: 找不到 container.xml');
    return;
  }
  
  const opfMatch = containerXml.match(/full-path="([^"]+\.opf)"/);
  if (!opfMatch) {
    console.log('ERROR: 找不到 OPF 路径');
    return;
  }
  const opfPath = opfMatch[1];
  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
  console.log(`OPF 路径: ${opfPath}`);
  
  const opfContent = await zip.file(opfPath)?.async('string');
  if (!opfContent) {
    console.log('ERROR: 无法读取 OPF');
    return;
  }
  
  // 元数据
  const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/);
  const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/);
  console.log(`书名: ${titleMatch?.[1]?.trim() || '(未找到)'}`);
  console.log(`作者: ${authorMatch?.[1]?.trim() || '(未找到)'}`);
  
  // Manifest
  const manifestItems = new Map();
  const itemRegex = /<item\s+([^>]+)\/?>/gi;
  let match;
  while ((match = itemRegex.exec(opfContent)) !== null) {
    const attrs = match[1];
    const idMatch = attrs.match(/id="([^"]+)"/);
    const hrefMatch = attrs.match(/href="([^"]+)"/);
    const mediaTypeMatch = attrs.match(/media-type="([^"]+)"/);
    if (idMatch && hrefMatch) {
      manifestItems.set(idMatch[1], {
        href: decodeURIComponent(hrefMatch[1]),
        mediaType: mediaTypeMatch?.[1] || '',
      });
    }
  }
  console.log(`Manifest 项数: ${manifestItems.size}`);
  
  // Spine
  const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i);
  const spineIds = [];
  if (spineMatch) {
    const itemrefRegex = /<itemref\s+[^>]*idref="([^"]+)"[^>]*\/?>/gi;
    while ((match = itemrefRegex.exec(spineMatch[1])) !== null) {
      spineIds.push(match[1]);
    }
  }
  console.log(`Spine 项数: ${spineIds.length}`);
  
  // NCX
  const ncxMatch = opfContent.match(/<item[^>]+media-type="application\/x-dtbncx\+xml"[^>]+href="([^"]+)"/i)
    || opfContent.match(/<item[^>]+href="([^"]+)"[^>]+media-type="application\/x-dtbncx\+xml"/i);
  const ncxToc = new Map();
  if (ncxMatch) {
    const ncxPath = opfDir + decodeURIComponent(ncxMatch[1]);
    console.log(`NCX 路径: ${ncxPath}`);
    const ncxContent = await zip.file(ncxPath)?.async('string');
    if (ncxContent) {
      const navPointRegex = /<navPoint[^>]*>([\s\S]*?)<\/navPoint>/gi;
      const textRegex = /<text[^>]*>([^<]+)<\/text>/i;
      const srcRegex = /<content\s+src="([^"]+)"/i;
      while ((match = navPointRegex.exec(ncxContent)) !== null) {
        const navContent = match[1];
        const titleMatch = navContent.match(textRegex);
        const srcMatch = navContent.match(srcRegex);
        if (titleMatch && srcMatch) {
          const href = decodeURIComponent(srcMatch[1]).split('#')[0];
          ncxToc.set(href, titleMatch[1].trim());
        }
      }
      console.log(`NCX 目录项数: ${ncxToc.size}`);
    }
  } else {
    console.log('NCX: 未找到');
  }
  
  // 提取章节
  const chapters = [];
  for (const idref of spineIds) {
    const item = manifestItems.get(idref);
    if (!item) continue;
    const isHtml = item.mediaType.includes('html') || item.mediaType.includes('xml');
    if (!isHtml) continue;
    const filePath = opfDir + item.href;
    const content = await zip.file(filePath)?.async('string');
    if (!content) continue;
    
    // 清理 HTML
    const text = content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n$1\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/&hellip;/g, '…')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    if (!text) continue;
    
    const title = ncxToc.get(item.href) || `章节 ${chapters.length + 1}`;
    chapters.push({ title, content: text });
  }
  
  console.log(`\n提取章节数: ${chapters.length}`);
  
  // 显示前10个章节
  console.log('\n前10个章节:');
  chapters.slice(0, 10).forEach((ch, i) => {
    console.log(`  ${i + 1}. "${ch.title}" - ${ch.content.length} 字符`);
  });
  
  // 显示最后5个章节
  if (chapters.length > 10) {
    console.log('\n最后5个章节:');
    chapters.slice(-5).forEach((ch, i) => {
      console.log(`  ${chapters.length - 4 + i}. "${ch.title}" - ${ch.content.length} 字符`);
    });
  }
  
  return chapters;
}

// ========== 运行测试 ==========

(async () => {
  try {
    await testTxt();
    await testEpub();
    console.log('\n========== 测试完成 ==========');
  } catch (err) {
    console.error('测试出错:', err);
    process.exit(1);
  }
})();
