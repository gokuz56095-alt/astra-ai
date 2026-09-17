import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Plus, Paperclip, X } from 'lucide-react';

const AIGenerateIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={2} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M14.5 7.5L15 9l.5-1.5L17 7l-1.5-.5L15 5l-.5 1.5L13 7l1.5.5z" />
    <path d="M7 16c2.5-4.5 6.5-4.5 10 0" />
  </svg>
);

export default function ChatInput({ input, setInput, handleSendMessage, isLoading, selectedImage, setSelectedImage, isImageGenMode, setIsImageGenMode, isEmpty }) {
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight > 200 ? '200px' : `${scrollHeight}px`;
    }
  }, [input]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
    setShowMenu(false);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setSelectedImage(reader.result);
          reader.readAsDataURL(file);
          setShowMenu(false);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const canSend = !isLoading && (input.trim() || selectedImage);
  const hasAttachment = selectedImage || isImageGenMode;

  return (
    <div className={`w-full flex flex-col relative ${isEmpty ? '' : 'bg-white pt-2 pb-6'}`}>
      
      {/* Khung input */}
      <div 
        className="w-full flex flex-col rounded-[26px] p-2
                   bg-white 
                   border border-[#D5D5D5]
                   shadow-[0_4px_20px_rgba(0,0,0,0.06)]
                   hover:border-[#C0C0C0]
                   focus-within:border-[#4D6BFE]/40
                   focus-within:shadow-[0_6px_24px_rgba(77,107,254,0.1)]
                   transition-all duration-200 relative"
      >
        
        {/* Preview row — trong khung */}
        {hasAttachment && (
          <div className="flex items-center gap-2 px-1 pt-1 pb-2">
            {selectedImage && !isImageGenMode && (
              <div className="relative inline-block">
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  className="h-20 w-auto rounded-xl object-cover border border-[#E5E5E5]" 
                />
                <button 
                  onClick={() => setSelectedImage(null)} 
                  className="absolute -top-2 -right-2 bg-white border border-[#E5E5E5] rounded-full p-1 
                             hover:bg-red-500 hover:border-red-500 hover:text-white 
                             text-[#4D4D4D] transition-colors shadow-sm"
                  title="Xoá ảnh"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {isImageGenMode && (
              <div className="flex items-center gap-2 bg-[#F5F5F5] text-[#1A1A1A] px-3 py-1.5 rounded-full border border-[#E5E5E5] shadow-sm">
                <AIGenerateIcon className="text-[#4D6BFE]" size={16} /> 
                <span className="text-[13.5px] font-medium">Hình ảnh</span>
                <button 
                  onClick={() => setIsImageGenMode(false)} 
                  className="hover:text-[#1A1A1A] ml-1 text-[#8B8B8B] transition-colors"
                  title="Xoá chế độ ảnh"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-1.5">
          
          <div className="relative shrink-0">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`flex items-center justify-center w-9 h-9 transition-all rounded-full shrink-0 ${
                showMenu 
                  ? 'bg-[#F0F0F0] text-[#1A1A1A]' 
                  : 'text-[#4D4D4D] hover:text-[#4D6BFE] hover:bg-[#F5F5F5]'
              }`}
            >
              {showMenu ? <X size={20} /> : <Plus size={20} />}
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <div className="absolute bottom-full left-0 mb-3 w-64 bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] p-1.5 flex flex-col gap-0.5 z-50">
                  
                  <button 
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F5F5F5] text-[#1A1A1A] text-[14.5px] text-left transition-colors rounded-xl"
                    onClick={() => { fileInputRef.current?.click(); }}
                  >
                    <Paperclip className="text-[#4D4D4D]" size={18} /> Tải tệp lên
                  </button>
                  
                  <button 
                    className="group relative w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F5F5F5] text-[#1A1A1A] text-[14.5px] text-left transition-colors rounded-xl"
                    onClick={() => { setIsImageGenMode(true); setShowMenu(false); setSelectedImage(null); }}
                  >
                    <AIGenerateIcon className="text-[#4D4D4D]" size={18} /> Tạo hình ảnh
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-[#1A1A1A] text-white px-4 py-2.5 rounded-2xl text-[12.5px] font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl pointer-events-none">
                      Trực quan hoá và chỉnh sửa
                    </div>
                  </button>

                </div>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>
          
          <textarea 
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows="1"
            placeholder="Hãy hỏi bất cứ điều gì"
            className="flex-1 bg-transparent text-[#0A0A0A] placeholder-[#9A9A9A] 
                       py-1 px-1 resize-none focus:outline-none 
                       text-[17px] font-medium leading-7 tracking-[-0.01em]
                       [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ minHeight: '36px', maxHeight: '200px' }}
          ></textarea>
          
          <button 
            onClick={handleSendMessage}
            disabled={!canSend}
            className={`rounded-full w-9 h-9 flex items-center justify-center shrink-0 transition-all duration-150 ${
              canSend 
                ? 'bg-[#4D6BFE] hover:bg-[#3D5AEB] text-white shadow-[0_2px_10px_rgba(77,107,254,0.35)]' 
                : 'bg-[#F0F0F0] text-[#B0B0B0] cursor-not-allowed'
            }`}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}