import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CollageItem, CanvasBackground, User } from '../types';
import { CollageItemCard } from './CollageItemCard';
import { Pin, RotateCcw, Move, Sparkles, Layers } from 'lucide-react';

interface FreeformCanvasViewProps {
  items: CollageItem[];
  currentUser?: User | null;
  canvasBg: CanvasBackground;
  onSelect: (item: CollageItem) => void;
  onEdit: (item: CollageItem) => void;
  onDelete: (item: CollageItem) => void;
  onToggleLike?: (item: CollageItem) => void;
  onAddComment?: (item: CollageItem, text: string) => void;
  onDeleteComment?: (item: CollageItem, commentId: string) => void;
  onRequireAuth?: () => void;
  onUpdateItemPosition?: (itemId: string, updates: Partial<CollageItem>) => void;
}

export const FreeformCanvasView: React.FC<FreeformCanvasViewProps> = ({
  items,
  currentUser,
  canvasBg,
  onSelect,
  onEdit,
  onDelete,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onRequireAuth,
  onUpdateItemPosition,
}) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Background styling mapping
  const bgStyles = {
    paper: 'bg-[#F8FAFC] bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px]',
    cork: 'bg-[#FEF3C7] bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:20px_20px]',
    dark: 'bg-[#0F172A] bg-[linear-gradient(to_right,#1E293B_1px,transparent_1px),linear-gradient(to_bottom,#1E293B_1px,transparent_1px)] [background-size:24px_24px]',
    linen: 'bg-[#F1F5F9] bg-[radial-gradient(#94A3B8_1px,transparent_1px)] [background-size:14px_14px]',
  };

  return (
    <div
      className={`relative min-h-[80vh] rounded-3xl border border-[#E2E8F0] p-6 sm:p-10 transition-colors overflow-hidden ${bgStyles[canvasBg]}`}
    >
      {/* Canvas Header Bar Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/90 backdrop-blur-md p-3 px-4 rounded-2xl border border-[#E2E8F0] shadow-xs text-xs text-[#1A1F2B]">
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4 text-[#4A90E2]" />
          <span className="font-semibold text-[#1A1F2B]">Mural Interactivo de Collage</span>
          <span className="text-[#CBD5E1]">•</span>
          <span className="text-[#64748B]">{items.length} tarjetas en vista</span>
        </div>
        <p className="text-[11px] text-[#64748B] italic font-medium">
          💡 Haz clic en cualquier elemento para expandir, o utiliza las opciones en la tarjeta para editar tus contenidos.
        </p>
      </div>

      {/* Collage Grid Cards with artistic tilt & overlap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
        {items.map((item, index) => {
          const isSelected = activeItem === item.id;

          return (
            <motion.div
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={`relative transition-all duration-300 ${
                isSelected ? 'z-40 scale-[1.02]' : 'z-10'
              }`}
            >
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
                isCanvasMode={true}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
