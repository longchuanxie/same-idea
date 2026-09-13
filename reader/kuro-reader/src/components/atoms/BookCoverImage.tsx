import React, { useEffect, useState } from 'react';

export interface BookCoverImageProps {
  url: string;
  title: string;
  className?: string;
}

/** 小于等于该边长的图视为退化封面（占位生成失败的 1×1 残留） */
const DEGENERATE_PIXELS = 2

/** 封面图：blob URL 加载失败（坏 blob / 已撤销的会话级 URL）或退化成 1×1 像素
 *  （封面生成失败的残留）时回落图标占位——否则浏览器把 alt 文本按元素字号渲染，
 *  或把 1px 图拉伸成空白，被容器裁成大字残块。 */
export const BookCoverImage: React.FC<BookCoverImageProps> = ({ url, title, className }) => {
  const [failed, setFailed] = useState(false);

  // 同一书籍重新导入后封面 URL 会换新，失败态随之复位
  useEffect(() => {
    setFailed(false);
  }, [url]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth <= DEGENERATE_PIXELS && img.naturalHeight <= DEGENERATE_PIXELS) {
      setFailed(true);
    }
  };

  if (failed) {
    return (
      <div className={`w-full h-full bg-surface-container flex items-center justify-center ${className ?? ''}`}>
        <span className="material-symbols-outlined text-on-surface-faint text-4xl">auto_stories</span>
      </div>
    );
  }
  return <img src={url} alt={title} className={className} onError={() => setFailed(true)} onLoad={handleLoad} />;
};

export default BookCoverImage;
