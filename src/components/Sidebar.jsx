import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Pencil, Pin, PinOff, Trash2, Search, PanelLeft, PanelLeftOpen, X, ArrowUpDown, Edit3, Check, LayoutGrid } from 'lucide-react';
import AstraLogo from './AstraLogo';

export default function Sidebar({
  sessions,
  currentSessionId,
  setCurrentSessionId,
  handleNewChat,
  handleDeleteChat,
  handleRenameChat,
  handleTogglePin,
  handleBulkDelete,
  handleBulkPin,
  isSidebarOpen,
  toggleSidebar,
  searchTrigger,
  currentView,
  setCurrentView,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [pendingSearchActivate, setPendingSearchActivate] = useState(false);

  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const searchInputRef = useRef(null);
  const isFirstTriggerRef = useRef(true);

  useEffect(() => {
    if (isSidebarOpen && pendingSearchActivate) {
      setIsSearchActive(true);
      setPendingSearchActivate(false);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSidebarOpen, pendingSearchActivate]);

  useEffect(() => {
    if (isSearchActive) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchActive]);

  useEffect(() => {
    if (isFirstTriggerRef.current) {
      isFirstTriggerRef.current = false;
      return;
    }
    if (!isSidebarOpen) {
      setPendingSearchActivate(true);
      toggleSidebar();
    } else {
      setIsSearchActive(true);
    }
  }, [searchTrigger]);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const startEditing = (e, session) => {
    e.stopPropagation();
    setEditingId(session?.id);
    setEditTitle(session?.title || 'Đoạn chat không tên');
    setOpenMenuId(null);
  };

  const saveEdit = (id) => {
    handleRenameChat(id, editTitle);
    setEditingId(null);
  };

  const handleSearchClick = () => {
    if (typeof setCurrentView === 'function') setCurrentView('chat');
    if (!isSidebarOpen) {
      setPendingSearchActivate(true);
      toggleSidebar();
    } else {
      setIsSearchActive(true);
    }
  };

  const handleLibraryClick = () => {
    if (typeof setCurrentView === 'function') setCurrentView('library');
    setIsMultiSelect(false);
    setSelectedIds([]);
    setOpenMenuId(null);
    setEditingId(null);
  };

  const handleSessionClick = (sessionId) => {
    if (typeof setCurrentView === 'function') setCurrentView('chat');
    setCurrentSessionId(sessionId);
    setOpenMenuId(null);
  };

  const toggleMultiSelect = () => {
    setIsMultiSelect(prev => !prev);
    setSelectedIds([]);
    setOpenMenuId(null);
    setEditingId(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkPinClick = () => {
    if (selectedIds.length === 0) return;
    const allPinned = selectedIds.every(id => sessions.find(s => s?.id === id)?.isPinned);
    const shouldPin = !allPinned;
    if (typeof handleBulkPin === 'function') {
      handleBulkPin(selectedIds, shouldPin);
    }
    setSelectedIds([]);
    setIsMultiSelect(false);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    if (typeof handleBulkDelete === 'function') {
      handleBulkDelete(selectedIds);
    }
    setSelectedIds([]);
    setIsMultiSelect(false);
  };

  const filteredSessions = (sessions || []).filter((s) => {
    if (!s) return false;
    const title = s.title || 'Đoạn chat không tên';
    return title.toLowerCase().includes((searchQuery || '').toLowerCase());
  });

  const groupSessionsByDate = (list) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOf7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;
    const startOf30Days = startOfToday - 30 * 24 * 60 * 60 * 1000;

    const groups = {
      pinned: [],
      today: [],
      yesterday: [],
      previous7Days: [],
      previous30Days: [],
      older: [],
    };

    list.forEach((s) => {
      if (s?.isPinned) {
        groups.pinned.push(s);
        return;
      }
      const t = typeof s.id === 'number' ? s.id : Date.now();
      if (t >= startOfToday) groups.today.push(s);
      else if (t >= startOfYesterday) groups.yesterday.push(s);
      else if (t >= startOf7Days) groups.previous7Days.push(s);
      else if (t >= startOf30Days) groups.previous30Days.push(s);
      else groups.older.push(s);
    });

    return groups;
  };

  const groups = groupSessionsByDate(filteredSessions);

  const orderedGroups = [
    { label: 'Đã ghim', list: groups.pinned },
    { label: 'Hôm nay', list: groups.today },
    { label: 'Hôm qua', list: groups.yesterday },
    { label: '7 ngày trước', list: groups.previous7Days },
    { label: '30 ngày trước', list: groups.previous30Days },
    { label: 'Cũ hơn', list: groups.older },
  ].filter(g => g.list.length > 0);

  const firstGroupLabel = orderedGroups[0]?.label;

  const renderSessionItem = (session) => {
    if (!session) return null;
    const isActive = session.id === currentSessionId;
    const isMenuOpen = openMenuId === session.id;
    const isEditing = editingId === session.id;
    const isSelected = selectedIds.includes(session.id);
    const displayTitle = session.title || 'Đoạn chat không tên';

    const handleItemClick = () => {
      if (isMultiSelect) {
        toggleSelect(session.id);
        return;
      }
      if (!isEditing) {
        handleSessionClick(session.id);
      }
    };

    let itemClasses = 'text-[#1A1A1A] hover:bg-[#F0F0F0]';
    if (isMultiSelect && isSelected) {
      itemClasses = 'bg-[#E8EEFF] text-[#1A1A1A]';
    } else if (!isMultiSelect && isActive && currentView === 'chat') {
      itemClasses = 'bg-[#E8EEFF] text-[#4D6BFE] font-medium';
    }

    return (
      <div key={session.id} className="relative">
        <div
          onClick={handleItemClick}
          className={`group flex items-center w-full h-10 px-3 rounded-full cursor-pointer text-[14.5px] transition-colors ${itemClasses}`}
        >
          {isMultiSelect && (
            <div
              className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 mr-3 transition-colors ${
                isSelected
                  ? 'bg-[#4D6BFE] border-[#4D6BFE]'
                  : 'border-[#D0D0D0] bg-white'
              }`}
            >
              {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
            </div>
          )}

          {isEditing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => saveEdit(session.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit(session.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              className="flex-1 bg-transparent text-[#1A1A1A] outline-none w-full pr-2 text-[14.5px]"
            />
          ) : (
            <span className="truncate flex-1 pr-6">{displayTitle}</span>
          )}

          {!isEditing && !isMultiSelect && (
            <button
              onClick={(e) => toggleMenu(e, session.id)}
              className={`p-0.5 rounded-full transition-opacity ${
                isActive && currentView === 'chat'
                  ? 'text-[#4D6BFE] hover:bg-[#D5E0FF]'
                  : 'text-[#8B8B8B] hover:text-[#1A1A1A] hover:bg-[#E5E5E5]'
              } ${
                isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              title="Tuỳ chọn"
            >
              <MoreHorizontal size={16} />
            </button>
          )}
        </div>

        {isMenuOpen && !isEditing && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)}></div>
            <div className="absolute right-2 top-10 w-52 bg-white rounded-xl shadow-2xl border border-[#E5E5E5] py-1 z-50">
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#F5F5F5] text-[#1A1A1A] text-[14px] text-left transition-colors"
                onClick={(e) => startEditing(e, session)}
              >
                <Pencil size={15} /> Đổi tên
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#F5F5F5] text-[#1A1A1A] text-[14px] text-left transition-colors"
                onClick={(e) => {
                  handleTogglePin(session.id, e);
                  setOpenMenuId(null);
                }}
              >
                {session.isPinned ? <PinOff size={15} /> : <Pin size={15} />}
                {session.isPinned ? 'Bỏ ghim' : 'Ghim đoạn chat'}
              </button>
              <div className="h-px bg-[#EAEAEA] my-1"></div>
              <button
                onClick={(e) => {
                  handleDeleteChat(session.id, e);
                  setOpenMenuId(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[#F5F5F5] text-red-500 text-[14px] text-left transition-colors"
              >
                <Trash2 size={15} /> Xóa
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderGroup = (label, list, showToggle = false) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between px-3 mb-1 h-6">
          <span className="text-[12.5px] font-medium text-[#8B8B8B]">{label}</span>
          {showToggle && (
            <button
              onClick={toggleMultiSelect}
              title={isMultiSelect ? 'Thoát chọn nhiều' : 'Chọn nhiều'}
              className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                isMultiSelect
                  ? 'bg-[#4D6BFE] text-white hover:bg-[#3D5AEB]'
                  : 'text-[#8B8B8B] hover:bg-[#E5E5E5] hover:text-[#1A1A1A]'
              }`}
            >
              {isMultiSelect ? <X size={12} strokeWidth={2.5} /> : <ArrowUpDown size={13} />}
            </button>
          )}
        </div>
        <div className="space-y-0.5">{list.map(renderSessionItem)}</div>
      </div>
    );
  };

  const Tooltip = ({ children }) => (
    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 
                    px-3.5 py-2 rounded-full
                    bg-[#1F1F1F] text-white text-[12.5px] font-medium leading-none
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                    transition-opacity duration-150 whitespace-nowrap pointer-events-none z-50 
                    shadow-lg">
      {children}
    </div>
  );

  // ============================================================
  // EXPANDED
  // ============================================================
  if (isSidebarOpen) {
    return (
      <div className="bg-[#FAFAFA] flex flex-col h-full w-[260px] border-r border-[#E5E5E5]">
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <AstraLogo size={28} />
            </div>
            <span className="text-[18px] font-semibold tracking-tight text-[#1A1A1A] truncate">
              Astra
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleSearchClick}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                isSearchActive
                  ? 'bg-[#EBEBEB] text-[#1A1A1A]'
                  : 'text-[#4D4D4D] hover:text-[#1A1A1A] hover:bg-[#F0F0F0]'
              }`}
              title="Tìm kiếm"
            >
              <Search size={18} />
            </button>
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center rounded-full text-[#4D4D4D] hover:text-[#1A1A1A] hover:bg-[#F0F0F0] transition-colors"
              title="Thu gọn thanh bên"
            >
              <PanelLeft size={18} />
            </button>
          </div>
        </div>

        {/* Search field */}
        {isSearchActive && (
          <div className="px-3 mb-2 shrink-0">
            <div className="flex items-center gap-2 h-9 px-3 rounded-full bg-white text-[#1A1A1A] border border-[#E5E5E5]">
              <Search size={16} className="text-[#8B8B8B] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm trong các cuộc trò chuyện..."
                className="bg-transparent outline-none w-full text-[14.5px] placeholder-[#8B8B8B]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSearchActive(false);
                    setSearchQuery('');
                  }
                }}
                onBlur={() => {
                  if (!searchQuery) setIsSearchActive(false);
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#8B8B8B] hover:text-[#1A1A1A]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Nav items */}
        <div className="px-3 mt-1 shrink-0 flex flex-col gap-1">
          {/* Nav 1: New chat */}
          <div className="relative group/nav">
            <button
              onClick={handleNewChat}
              className="group/btn w-full flex items-center justify-between h-10 px-3 rounded-full 
                         text-[#1A1A1A] text-[14.5px]
                         transition-all duration-200 ease-out
                         hover:bg-[#F0F0F0]
                         active:bg-[#E5E5E5] active:scale-[0.985]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Edit3
                  size={18}
                  strokeWidth={1.75}
                  className="text-[#5F5F5F] shrink-0 
                             transition-all duration-200 ease-out
                             group-hover/btn:text-[#4D6BFE] group-hover/btn:scale-105"
                />
                <span className="truncate">Cuộc trò chuyện mới</span>
              </div>
              <span
                className="text-[11.5px] font-medium text-[#9A9A9A] tracking-tight 
                           whitespace-nowrap overflow-hidden shrink-0
                           max-w-0 opacity-0 ml-0
                           group-hover/btn:max-w-[120px] group-hover/btn:opacity-100 group-hover/btn:ml-2
                           transition-all duration-200 ease-out"
              >
                Ctrl+Shift+O
              </span>
            </button>

            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                            px-3.5 py-2 rounded-full
                            bg-[#1F1F1F] text-white text-[13px] font-medium leading-none
                            whitespace-nowrap pointer-events-none z-50
                            shadow-xl
                            opacity-0 invisible
                            group-hover/nav:opacity-100 group-hover/nav:visible
                            transition-opacity duration-150">
              Cuộc trò chuyện mới
            </div>
          </div>

          {/* Nav 2: Search */}
          <div className="relative group/nav">
            <button
              onClick={handleSearchClick}
              className="group/btn w-full flex items-center justify-between h-10 px-3 rounded-full 
                         text-[#1A1A1A] text-[14.5px]
                         transition-all duration-200 ease-out
                         hover:bg-[#F0F0F0]
                         active:bg-[#E5E5E5] active:scale-[0.985]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Search
                  size={18}
                  strokeWidth={1.75}
                  className="text-[#5F5F5F] shrink-0 
                             transition-all duration-200 ease-out
                             group-hover/btn:text-[#4D6BFE] group-hover/btn:scale-105"
                />
                <span className="truncate">Tìm kiếm trong các cuộc trò chuyện</span>
              </div>
              <span
                className="text-[11.5px] font-medium text-[#9A9A9A] tracking-tight 
                           whitespace-nowrap overflow-hidden shrink-0
                           max-w-0 opacity-0 ml-0
                           group-hover/btn:max-w-[120px] group-hover/btn:opacity-100 group-hover/btn:ml-2
                           transition-all duration-200 ease-out"
              >
                Ctrl+Shift+K
              </span>
            </button>

            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                            px-3.5 py-2 rounded-full
                            bg-[#1F1F1F] text-white text-[13px] font-medium leading-none
                            whitespace-nowrap pointer-events-none z-50
                            shadow-xl
                            opacity-0 invisible
                            group-hover/nav:opacity-100 group-hover/nav:visible
                            transition-opacity duration-150">
              Tìm kiếm trong các cuộc trò chuyện
            </div>
          </div>

          {/* Nav 3: Library */}
          <div className="relative group/nav">
            <button
              onClick={handleLibraryClick}
              className={`group/btn w-full flex items-center h-10 px-3 rounded-full 
                         text-[14.5px]
                         transition-all duration-200 ease-out
                         active:scale-[0.985]
                         ${
                           currentView === 'library'
                             ? 'bg-[#E8EEFF] text-[#4D6BFE] font-medium'
                             : 'text-[#1A1A1A] hover:bg-[#F0F0F0] active:bg-[#E5E5E5]'
                         }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <LayoutGrid
                  size={18}
                  strokeWidth={1.75}
                  className={`shrink-0 transition-all duration-200 ease-out group-hover/btn:scale-105 ${
                    currentView === 'library' 
                      ? 'text-[#4D6BFE]' 
                      : 'text-[#5F5F5F] group-hover/btn:text-[#4D6BFE]'
                  }`}
                />
                <span className="truncate">Thư viện</span>
              </div>
            </button>

            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3
                            px-3.5 py-2 rounded-full
                            bg-[#1F1F1F] text-white text-[13px] font-medium leading-none
                            whitespace-nowrap pointer-events-none z-50
                            shadow-xl
                            opacity-0 invisible
                            group-hover/nav:opacity-100 group-hover/nav:visible
                            transition-opacity duration-150">
              Thư viện ảnh
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#EAEAEA] mx-3 my-3 shrink-0"></div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-3 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#D5D5D5] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {orderedGroups.map(g => 
            renderGroup(g.label, g.list, g.label === firstGroupLabel)
          )}

          {filteredSessions.length === 0 && (
            <div className="text-center text-[#8B8B8B] text-[13.5px] px-3 py-8">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có đoạn chat nào'}
            </div>
          )}
        </div>

        {/* Bottom action bar (multi-select) */}
        {isMultiSelect && (
          <div className="border-t border-[#EAEAEA] flex shrink-0">
            <button
              onClick={handleBulkPinClick}
              disabled={selectedIds.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[14px] transition-colors ${
                selectedIds.length === 0
                  ? 'text-[#C0C0C0] cursor-not-allowed'
                  : 'text-[#4D4D4D] hover:bg-[#F0F0F0] hover:text-[#1A1A1A]'
              }`}
            >
              <Pin size={17} strokeWidth={1.75} />
              <span>Ghim</span>
            </button>
            <div className="w-px bg-[#EAEAEA]"></div>
            <button
              onClick={handleBulkDeleteClick}
              disabled={selectedIds.length === 0}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[14px] transition-colors ${
                selectedIds.length === 0
                  ? 'text-[#C0C0C0] cursor-not-allowed'
                  : 'text-[#4D4D4D] hover:bg-[#F0F0F0] hover:text-red-500'
              }`}
            >
              <Trash2 size={17} strokeWidth={1.75} />
              <span>Xóa</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // COLLAPSED
  // ============================================================
  return (
    <div className="bg-[#FAFAFA] flex flex-col items-center h-full w-[52px] py-4 border-r border-[#E5E5E5]">

      <div className="relative group mb-2">
        <button
          onClick={toggleSidebar}
          className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-[#F0F0F0]"
        >
          <AstraLogo
            size={26}
            className="absolute transition-opacity duration-150 group-hover:opacity-0"
          />
          <PanelLeftOpen
            size={20}
            strokeWidth={1.75}
            className="absolute text-[#4D4D4D] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          />
        </button>
        <Tooltip>Mở thanh bên</Tooltip>
      </div>

      <div className="relative group mb-1">
        <button
          onClick={handleNewChat}
          className="w-10 h-10 flex items-center justify-center rounded-full 
                     text-[#5F5F5F] hover:text-[#4D6BFE] hover:bg-[#F0F0F0] 
                     transition-colors"
        >
          <Edit3 size={20} strokeWidth={1.75} />
        </button>
        <Tooltip>Cuộc trò chuyện mới</Tooltip>
      </div>

      <div className="relative group mb-1">
        <button
          onClick={handleSearchClick}
          className="w-10 h-10 flex items-center justify-center rounded-full 
                     text-[#5F5F5F] hover:text-[#4D6BFE] hover:bg-[#F0F0F0] 
                     transition-colors"
        >
          <Search size={20} strokeWidth={1.75} />
        </button>
        <Tooltip>Tìm kiếm</Tooltip>
      </div>

      <div className="relative group">
        <button
          onClick={handleLibraryClick}
          className={`w-10 h-10 flex items-center justify-center rounded-full 
                     transition-colors ${
                       currentView === 'library'
                         ? 'bg-[#E8EEFF] text-[#4D6BFE]'
                         : 'text-[#5F5F5F] hover:text-[#4D6BFE] hover:bg-[#F0F0F0]'
                     }`}
        >
          <LayoutGrid size={20} strokeWidth={1.75} />
        </button>
        <Tooltip>Thư viện</Tooltip>
      </div>

    </div>
  );
}