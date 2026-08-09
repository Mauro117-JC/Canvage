import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutGrid, 
  Move, 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  Palette,
  Globe
} from 'lucide-react';
import { User, ViewMode, CanvasBackground } from '../types';

interface NavbarProps {
  user: User | null;
  ownerFilter?: 'mine' | 'all';
  onOwnerFilterChange?: (filter: 'mine' | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  canvasBg: CanvasBackground;
  onCanvasBgChange: (bg: CanvasBackground) => void;
  onOpenAddModal: () => void;
  onOpenAIAssist: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onResetData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  ownerFilter = 'all',
  onOwnerFilterChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  viewMode,
  onViewModeChange,
  canvasBg,
  onCanvasBgChange,
  onOpenAddModal,
  onOpenAIAssist,
  onOpenAuth,
  onLogout,
  onResetData,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleOwnerClick = (filter: 'mine' | 'all') => {
    if (filter === 'mine' && !user) {
      onOpenAuth();
      return;
    }
    if (onOwnerFilterChange) {
      onOwnerFilterChange(filter);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] text-[#1A1F2B] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4A90E2] to-[#7B61FF] text-white font-bold text-lg shadow-sm flex items-center justify-center">
              C
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[#1A1F2B] flex items-center gap-2">
                Canvage
              </h1>
              <p className="text-[10px] text-[#718096] -mt-1 hidden sm:block font-medium">
                Articles, Images & Moodboards
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xs sm:max-w-md relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search images, articles, notes, tags..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4A90E2] focus:ring-1 focus:ring-[#4A90E2] transition-all"
            />
          </div>

          {/* View Modes Switcher */}
          <div className="flex items-center p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl">
            <button
              onClick={() => onViewModeChange('masonry')}
              title="Masonry Collage Grid"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                viewMode === 'masonry'
                  ? 'bg-white text-[#1A1F2B] shadow-xs font-semibold'
                  : 'text-[#64748B] hover:text-[#1A1F2B]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Masonry</span>
            </button>
            <button
              onClick={() => onViewModeChange('canvas')}
              title="Interactive Pinboard Canvas"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                viewMode === 'canvas'
                  ? 'bg-white text-[#1A1F2B] shadow-xs font-semibold'
                  : 'text-[#64748B] hover:text-[#1A1F2B]'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Canvas</span>
            </button>
            <button
              onClick={() => onViewModeChange('articles')}
              title="Article Reader List"
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                viewMode === 'articles'
                  ? 'bg-white text-[#1A1F2B] shadow-xs font-semibold'
                  : 'text-[#64748B] hover:text-[#1A1F2B]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Articles</span>
            </button>
          </div>

          {/* Canvas Background Options (Visible only in Canvas Mode) */}
          {viewMode === 'canvas' && (
            <div className="hidden xl:flex items-center gap-1 px-2 py-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-xs">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold px-1 flex items-center gap-1">
                <Palette className="w-3 h-3" /> Skin:
              </span>
              {(['paper', 'cork', 'dark', 'linen'] as CanvasBackground[]).map((bg) => (
                <button
                  key={bg}
                  onClick={() => onCanvasBgChange(bg)}
                  className={`px-2 py-0.5 rounded text-[11px] capitalize transition-all ${
                    canvasBg === bg
                      ? 'bg-[#EBF8FF] text-[#4A90E2] font-semibold border border-[#BEE3F8]'
                      : 'text-[#64748B] hover:text-[#1A1F2B]'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Add Content Button */}
            <button
              onClick={onOpenAddModal}
              className="p-2 sm:px-3 sm:py-1.5 bg-gradient-to-r from-[#4A90E2] to-[#7B61FF] hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
              title="Añadir Contenido"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Añadir Contenido</span>
            </button>

            {/* User Account / Login */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 p-1 pr-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] text-xs transition-colors"
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-[#4A90E2]"
                    />
                    <span className="font-medium text-[#1A1F2B] max-w-[80px] truncate hidden sm:inline">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                  </button>

                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 p-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 text-[#1A1F2B] text-xs space-y-1">
                      <div className="p-2 border-b border-[#E2E8F0]">
                        <p className="font-semibold text-[#1A1F2B]">{user.name}</p>
                        <p className="text-[11px] text-[#64748B] truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#EBF8FF] border border-[#BEE3F8] text-[#4A90E2] text-[10px] font-semibold rounded-full">
                          {user.role || 'Curator'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 p-2 hover:bg-rose-50 text-rose-600 rounded-xl text-left transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#1A1F2B] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Bar: 3 Rows on Mobile, 1 Row on Desktop */}
        <div className="py-2.5 border-t border-[#E2E8F0] flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          
          {/* Row 1 (Mobile only): Search bar */}
          <div className="relative w-full md:hidden">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar imágenes, artículos, notas, tags..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4A90E2] transition-all"
            />
          </div>

          {/* Row 2 (Mobile) / Left side (Desktop): "Mis publicaciones" & "Mural público" buttons */}
          {onOwnerFilterChange && (
            <div className="w-full md:w-auto flex items-center justify-center md:justify-start shrink-0">
              <div className="flex items-center p-1 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl shadow-2xs w-full sm:w-auto">
                <button
                  onClick={() => handleOwnerClick('mine')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    ownerFilter === 'mine'
                      ? 'bg-[#4A90E2] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#1A1F2B]'
                  }`}
                  title="Ver sólo mis publicaciones"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Mis publicaciones</span>
                </button>
                <button
                  onClick={() => handleOwnerClick('all')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    ownerFilter === 'all'
                      ? 'bg-[#1A1F2B] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#1A1F2B]'
                  }`}
                  title="Ver mural público"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Mural público</span>
                </button>
              </div>
            </div>
          )}

          {/* Row 3 (Mobile) / Right side (Desktop): Category Tags */}
          <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => onCategoryChange('All')}
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-[#1A1F2B] text-white border border-[#1A1F2B] shadow-xs'
                  : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#1A1F2B] hover:bg-slate-50'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#1A1F2B] text-white border border-[#1A1F2B] shadow-xs'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#1A1F2B] hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

      </div>
    </header>
  );
};
