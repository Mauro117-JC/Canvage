import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Image as ImageIcon, Sparkles, FilterX } from 'lucide-react';
import { CollageItem, User } from '../types';
import { CollageItemCard } from './CollageItemCard';

interface MasonryGridViewProps {
  items: CollageItem[];
  currentUser?: User | null;
  onSelect: (item: CollageItem) => void;
  onEdit: (item: CollageItem) => void;
  onDelete: (item: CollageItem) => void;
  onToggleLike?: (item: CollageItem) => void;
  onAddComment?: (item: CollageItem, text: string) => void;
  onDeleteComment?: (item: CollageItem, commentId: string) => void;
  onRequireAuth?: () => void;
  onOpenAddModal: () => void;
  onResetFilters: () => void;
}

export const MasonryGridView: React.FC<MasonryGridViewProps> = ({
  items,
  currentUser,
  onSelect,
  onEdit,
  onDelete,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onRequireAuth,
  onOpenAddModal,
  onResetFilters,
}) => {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#94A3B8]">
          <FilterX className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-[#1A1F2B]">No se encontraron elementos</h3>
        <p className="text-sm text-[#64748B]">
          {currentUser 
            ? 'Aún no has agregado publicaciones a tu colección personal o no coinciden con los filtros aplicados.'
            : 'Intenta borrar la búsqueda o seleccionar otra categoría.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1A1F2B] border border-[#CBD5E1] text-xs font-semibold rounded-xl transition-colors"
          >
            Limpiar Filtros
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-[#4A90E2] to-[#7B61FF] hover:opacity-95 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Añadir Contenido
          </button>
        </div>
      </div>
    );
  }

  // Split items into columns for balanced masonry
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 pb-16">
      <AnimatePresence>
        {items.map((item) => (
          <div key={item.id} className="break-inside-avoid">
            <CollageItemCard
              item={item}
              currentUser={currentUser}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleLike={onToggleLike}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onRequireAuth={onRequireAuth}
              isCanvasMode={false}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
