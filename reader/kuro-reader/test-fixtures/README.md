# 测试夹具库

由 `node scripts/generate-test-fixtures.mjs` **确定性生成**（无网络/外部工具依赖，生成时自检 GBK 字节表）。修改生成器后重新运行即可刷新本目录。

用途：
1. **自动化回归**：`src/services/parsers/boundaryFixtures.test.ts` 直接以本目录文件驱动真实解析管线（31 用例，随 CI 运行）
2. **手动 / 端到端导入测试**：在应用「导入」页选择本目录文件，验证完整用户旅程

## 漫画压缩包（comics/）

| 文件 | 边界场景 | 预期行为 |
|------|----------|----------|
| `comic-basic-3pages.cbz` | 基线样例 | 3 页，按文件名排序 |
| `comic-natural-sort.cbz` | 自然排序 | page-2 排在 page-10 之前（数字感知排序） |
| `comic-nested-folders.cbz` | 嵌套目录 | 递归收集 3 页 |
| `comic-chinese-names.cbz` | 中文文件名（UTF-8 标志位） | 正常 2 页 |
| `comic-mixed-nonimage.cbz` | 混入 txt/xml | 非图片被忽略，仅 1 页 |
| `comic-single-page.cbz` | 单页 | 1 页（单章） |
| `comic-chapter-folders.cbz` | 章节识别：目录模式 | 2 章（第01话/第02话），扁平数组不变 |
| `comic-chapter-nested.cbz` | 章节识别：内页文件夹过度细分 | 上退一级目录 → Ch.001/Ch.002 两章 |
| `comic-chapter-filename.cbz` | 章节识别：文件名序列 | c01_*/c02_* → 2 章 |
| `comic-webtoon-tall.cbz` | 章节识别：条漫竖长图 | 64×512（宽高比 8）→ 一图一话 3 章 |
| `comic-empty.zip` | 0 条目 | **报错**「压缩包中未找到任何图片」 |
| `comic-no-images.zip` | 只有文本无图片 | **报错**同上 |

## 文本（text/）

| 文件 | 边界场景 | 预期行为 |
|------|----------|----------|
| `utf8-nobom.txt` | 基线多章 | 4 章（首章前内容归「前言」章） |
| `utf8-bom.txt` | UTF-8 BOM | BOM 被剥离，同上 4 章 |
| `gbk.txt` | GBK 编码 | 回退解码成功，3 章中文完整 |
| `utf16le-known-limitation.txt` | UTF-16LE | **已知限制**：回退链（UTF-8→GBK）产生乱码但不崩溃 |
| `empty.txt` | 0 字节 | 0 章 |
| `whitespace-only.txt` | 纯空白 | 0 章 |
| `no-chapters.txt` | 无章节标记 | 整篇归「正文」单章 |
| `chapter-at-start.txt` | 章节在首行 | 「前言」被过滤，单章 |
| `large-chapter-numbers.txt` | 第12章/第100章 | 大数字章节号正常识别 |
| `indented-title-not-chapter.txt` | 前导空白的伪标题 | 视为内容行，单章 |
| `crlf.txt` | CRLF 行尾 | 标题无残留 `\r` |
| `long-paragraph.txt` | 约 220KB 单段 | 分页性能压力样本，解析不崩溃 |

## Markdown（markdown/）

| 文件 | 边界场景 | 预期行为 |
|------|----------|----------|
| `md-no-headings.md` | 无标题 | 回退单章 |
| `md-h1-h2.md` | h1/h2 混合 | 3 章，生成 markdownDocument |
| `md-code-fence-known-limitation.md` | 代码围栏内 `#` 行 | **已知限制**：围栏不感知，`# 行` 仍被拆为标题 |

## EPUB（epub/）

| 文件 | 边界场景 | 预期行为 |
|------|----------|----------|
| `basic-ncx.epub` | 标准 NCX 目录 | 导入 2 章；阅读时 NCX 标题 + Markdown 保真内容 |
| `nav-only.epub` | EPUB3 仅 nav 无 NCX | 阅读时 nav 目录回退生效 |
| `empty-second-chapter.epub` | 空白章节 | 空章被跳过 |
| `missing-container.epub` | 缺 container.xml | 导入报错；阅读回退占位章节 |

## PDF（pdf/）

| 文件 | 边界场景 | 预期行为 |
|------|----------|----------|
| `minimal-1page.pdf` | 极简 1 页 | numPages = 1 |
| `minimal-3pages.pdf` | 极简 3 页 | numPages = 3 |
| `truncated-corrupt.pdf` | 截断损坏 | 解析报错而非挂起 |

## 散图文件夹（loose-images/）

文件夹导入手动测试样本：3 张 PNG（含中文与空格文件名）+ 1 个应被忽略的 txt。

## 已知限制（有意锁定的当前行为）

1. **RAR 无法生成**：项目可读 RAR（libarchive.js）但无免费打包工具，建议手工放置一个 `sample.rar` 做手动验证
2. **GBK 编码的 zip 文件名**（旧打包器、非 UTF-8 标志位）：可能乱码；本库使用 UTF-8 标志位文件名
3. **UTF-16 文本**：按回退链解码为乱码（不崩溃）
4. **Markdown 代码围栏**：围栏内 `#` 行会被误认为章节标题
5. **「第X节」开头的正文行**：会被误判为章节标题（启发式拆分的固有局限）
6. **加密/DRM 的 EPUB/PDF**：不支持
