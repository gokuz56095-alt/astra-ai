import React, { useState, useMemo } from 'react';
import { Download, X, LayoutGrid, Sparkles, Upload, ImageOff } from 'lucide-react';

function formatRelativeTime(timestamp) {
  if (!timestamp || typeof timestamp !== 'number') return 'Không rõ';
  const diff = Date.now() - timestamp;
  if (diff < 0) return 'Vừa xong';

  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const week = Math.floor(day / 7);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);

  if (sec < 60) return 'Vừa xong';
  if (min < 60) return `${min} phút trước`;
  if (hr < 24) return `${hr} giờ trước`;
  if (day < 7) return `${day} ngày trước`;
  if (week < 5) return `${week} tuần trước`;
  if (month < 12) return `${month} tháng trước`;
  return `${year} năm trước`;
}

export default function Library({ sessions }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'ai' | 'upload'
  const [previewImage, setPreviewImage] = useState(null);

  // Extract toàn bộ ảnh từ sessions — sort mới nhất lên đầu, gán số thứ tự cố định
  const allImages = useMemo(() => {
    const result = [];
    (sessions || []).forEach((session) => {
      if (!session) return;
      const sessionTs = typeof session.id === 'number' ? session.id : 0;
      const sessionTitle = session.title || 'Đoạn chat không tên';

      (session.messages || []).forEach((msg, msgIdx) => {
        if (!msg) return;

        if (msg.type === 'image' && typeof msg.content === 'string' && msg.content) {
          result.push({
            id: `${session.id}-${msgIdx}-ai`,
            url: msg.content,
            type: 'ai',
            sessionTs,
            sessionTitle,
            order: msgIdx,
          });
        }

        if (Array.isArray(msg.content)) {
          msg.content.forEach((item, subIdx) => {
            if (item?.type === 'image_url' && item?.image_url?.url) {
              result.push({
                id: `${session.id}-${msgIdx}-${subIdx}-up`,
                url: item.image_url.url,
                type: 'upload',
                sessionTs,
                sessionTitle,
                order: msgIdx * 1000 + subIdx,
              });
            }
          });
        }
      });
    });

    result.sort((a, b) => {
      if (b.sessionTs !== a.sessionTs) return b.sessionTs - a.sessionTs;
      return b.order - a.order;
    });
    result.forEach((img, idx) => {
      img.displayIndex = idx + 1;
    });

    return result;
  }, [sessions]);

  const visibleImages = useMemo(() => {
    if (filter === 'ai') return allImages.filter(i => i.type === 'ai');
    if (filter === 'upload') return allImages.filter(i => i.type === 'upload');
    return allImages;
  }, [allImages, filter]);

  const handleDownload = (url, type) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      const ext = url.startsWith('data:image/jpeg') ? 'jpg' : 'png';
      a.download = `astra-${type}-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(url, '_blank');
    }
  };

  const filterTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'ai', label: 'AI tạo' },
    { key: 'upload', label: 'Đã tải lên' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-white overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 md:px-8 pt-6 pb-4">
        {/* Title row */}
        <div className="flex items-center gap-2.5 mb-4">
          <LayoutGrid size={20} strokeWidth={1.75} className="text-[#0A0A0A] shrink-0" />
          <h1 className="text-[20px] font-semibold text-[#0A0A0A] tracking-tight truncate">
            Thư viện
          </h1>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {filterTabs.map(tab => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 h-8 rounded-full text-[13.5px] whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#E8EEFF] text-[#4D6BFE] font-medium'
                    : 'text-[#4D4D4D] hover:bg-[#F5F5F5] font-normal'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#F0F0F0] mx-6 md:mx-8 shrink-0"></div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#D5D5D5] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {visibleImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[340px] text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F3FF] flex items-center justify-center mb-4">
              {filter === 'upload' ? (
                <Upload size={26} strokeWidth={1.75} className="text-[#4D6BFE]" />
              ) : filter === 'ai' ? (
                <Sparkles size={26} strokeWidth={1.75} className="text-[#4D6BFE]" />
              ) : (
                <ImageOff size={26} strokeWidth={1.75} className="text-[#4D6BFE]" />
              )}
            </div>

            <p className="text-[16px] font-semibold text-[#0A0A0A] mb-1.5">
              {filter === 'all'
                ? 'Thư viện đang trống'
                : filter === 'ai'
                  ? 'Chưa có ảnh AI nào'
                  : 'Chưa có ảnh tải lên'}
            </p>
            <p className="text-[13.5px] text-[#8B8B8B] max-w-[400px] leading-relaxed">
              {filter === 'all'
                ? 'Ảnh bạn tạo bằng AI hoặc tải lên trong cuộc trò chuyện sẽ xuất hiện tại đây.'
                : filter === 'ai'
                  ? 'Yêu cầu AI tạo ảnh trong cuộc trò chuyện — ảnh sẽ tự động lưu về đây.'
                  : 'Đính kèm ảnh khi trò chuyện — ảnh sẽ tự động lưu về đây.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header row */}
            <div className="flex items-center px-3 py-2 text-[12px] font-medium text-[#8B8B8B] uppercase tracking-wider">
              <div className="flex-1 min-w-0">Tên</div>
              <div className="w-[160px] shrink-0 text-right pr-2">Hoạt động gần nhất</div>
            </div>

            {/* List rows */}
            <div className="flex flex-col">
              {visibleImages.map(img => {
                const displayName = `Ảnh #${img.displayIndex} · ${img.sessionTitle}`;
                const timeLabel = formatRelativeTime(img.sessionTs);
                return (
                  <button
                    key={img.id}
                    onClick={() => setPreviewImage(img)}
                    className="group flex items-center px-3 py-2.5 rounded-lg hover:bg-[#F5F5F5] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#F0F0F0] shrink-0 border border-[#EFEFEF]">
                      <img
                        src={img.url}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 ml-3">
                      <div className="text-[14px] text-[#1A1A1A] truncate">
                        {displayName}
                      </div>
                      <div className="text-[12px] text-[#8B8B8B] mt-0.5 flex items-center gap-1.5">
                        {img.type === 'ai' ? (
                          <>
                            <Sparkles size={11} strokeWidth={2} />
                            <span>AI tạo</span>
                          </>
                        ) : (
                          <>
                            <Upload size={11} strokeWidth={2} />
                            <span>Đã tải lên</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="w-[160px] shrink-0 text-right pr-2 text-[13px] text-[#6B6B6B]">
                      Đã tạo {timeLabel.toLowerCase()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm
                     flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full
                       bg-white/10 hover:bg-white/20 backdrop-blur-sm
                       flex items-center justify-center
                       text-white transition-colors z-10"
            title="Đóng"
          >
            <X size={20} />
          </button>

          <div
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage.url}
              alt=""
              className="max-w-full max-h-[75vh] rounded-lg shadow-2xl object-contain"
            />

            <div className="mt-4 flex flex-col items-center gap-1">
              <p className="text-white text-[14px] font-medium">
                Ảnh #{previewImage.displayIndex} · {previewImage.sessionTitle}
              </p>
              <p className="text-white/60 text-[12.5px]">
                {previewImage.type === 'ai' ? 'AI tạo' : 'Đã tải lên'} · Đã tạo {formatRelativeTime(previewImage.sessionTs).toLowerCase()}
              </p>
            </div>

            <button
              onClick={() => handleDownload(previewImage.url, previewImage.type)}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full
                         bg-white text-[#1A1A1A] text-[14px] font-medium
                         hover:bg-[#E5E5E5] transition-colors shadow-lg"
            >
              <Download size={16} strokeWidth={2} />
              <span>Tải xuống</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}