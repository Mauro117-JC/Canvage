import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { CollageItem } from '../types';

interface DeleteConfirmModalProps {
  item: CollageItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  item,
  onClose,
  onConfirm,
}) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl p-6 text-[#1A1F2B] space-y-4"
        >
          <div className="flex items-center gap-3 text-rose-600">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1A1F2B]">Delete Item?</h3>
              <p className="text-xs text-[#64748B]">This action will remove it from your board.</p>
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#475569] font-medium truncate">
            "{item.title}"
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1A1F2B] border border-[#CBD5E1] rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
