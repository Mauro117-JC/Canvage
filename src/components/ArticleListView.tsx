import React from 'react';
import { motion } from 'motion/react';
import { FileText, Clock, ExternalLink, Edit3, Trash2, ArrowRight, BookOpen, Lock, User as UserIcon, Heart, MessageSquare } from 'lucide-react';
import { CollageItem, User } from '../types';
import { formatTimeAgo } from '../utils/timeAgo';

interface ArticleListViewProps {
  articles: CollageItem[];
  currentUser?: User | null;
  onSelect: (item: CollageItem) => void;
  onEdit: (item: CollageItem) => void;
  onDelete: (item: CollageItem) => void;
  onToggleLike?: (item: CollageItem) => void;
  onRequireAuth?: () => void;
  onOpenAddModal: () => void;
}

export const ArticleListView: React.FC<ArticleListViewProps> = ({
  articles,
  currentUser,
  onSelect,
  onEdit,
  onDelete,
  onToggleLike,
  onRequireAuth,
  onOpenAddModal,
}) => {
  if (articles.length === 0) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#94A3B8]">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-semibold text-[#1A1F2B]">No hay artículos en la colección</h3>
        <p className="text-sm text-[#64748B]">
          Añade un enlace, artículo o ensayo a tu collage personal.
        </p>
        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-gradient-to-r from-[#4A90E2] to-[#7B61FF] hover:opacity-95 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
        >
          Añadir Artículo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-16">
      {articles.map((article) => {
        const isOtherUserContent = currentUser && article.userId && article.userId !== currentUser.id;

        return (
          <motion.div
            key={article.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-2xl p-5 sm:p-6 transition-all shadow-xs hover:shadow-md text-[#1A1F2B] flex flex-col md:flex-row gap-6 items-start"
          >
            {/* Action Overlay */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md p-1 rounded-xl border border-[#E2E8F0] shadow-xs">
              {isOtherUserContent ? (
                <span className="px-2 py-1 text-[10px] text-[#64748B] font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#94A3B8]" /> Solo lectura
                </span>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(article)}
                    className="p-1.5 text-[#64748B] hover:text-[#4A90E2] hover:bg-[#F1F5F9] rounded-lg transition-colors"
                    title={currentUser ? "Editar artículo" : "Inicia sesión para editar"}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(article)}
                    className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title={currentUser ? "Eliminar artículo" : "Inicia sesión para eliminar"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Article Cover Photo */}
            {article.coverImageUrl && (
              <div
                onClick={() => onSelect(article)}
                className="w-full md:w-56 h-40 shrink-0 rounded-xl overflow-hidden bg-[#F8FAFC] cursor-pointer"
              >
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            {/* Article Info */}
            <div className="flex-1 flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs flex-wrap">
                  <span className="px-2.5 py-0.5 bg-[#EBF8FF] text-[#4A90E2] border border-[#BEE3F8] rounded-full font-semibold">
                    {article.category}
                  </span>
                  {article.userName && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium flex items-center gap-1 border ${
                      currentUser && article.userId === currentUser.id
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                        : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                    }`}>
                      <UserIcon className="w-2.5 h-2.5" />
                      {currentUser && article.userId === currentUser.id ? 'Tú' : article.userName}
                    </span>
                  )}
                  <span className="text-[#64748B] flex items-center gap-1 text-[11px] font-medium bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3 text-[#94A3B8]" /> {formatTimeAgo(article.createdAt)}
                  </span>
                  {article.readTimeMinutes && (
                    <span className="text-[#64748B] flex items-center gap-1 text-[11px] font-medium">
                      {article.readTimeMinutes} min lect.
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => onSelect(article)}
                  className="font-semibold text-xl text-[#1A1F2B] group-hover:text-[#4A90E2] transition-colors cursor-pointer leading-snug"
                >
                  {article.title}
                </h3>

                {article.summary && (
                  <p className="mt-2 text-xs text-[#475569] leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] text-xs text-[#64748B] flex-wrap gap-2">
                <span>{article.author ? `Por ${article.author}` : 'Artículo'}</span>
                
                <div className="flex items-center gap-3">
                  {/* Likes button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!currentUser) onRequireAuth?.();
                      else onToggleLike?.(article);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
                      currentUser && article.likedByUsers?.includes(currentUser.id)
                        ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:text-rose-600 border border-[#E2E8F0]'
                    }`}
                    title="Me gusta"
                  >
                    <Heart className={`w-3.5 h-3.5 ${currentUser && article.likedByUsers?.includes(currentUser.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{article.likes || 0}</span>
                  </button>

                  {/* Comment Count */}
                  <button
                    onClick={() => onSelect(article)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F8FAFC] text-[#64748B] hover:text-[#4A90E2] border border-[#E2E8F0] flex items-center gap-1"
                    title="Comentarios"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{article.comments?.length || 0}</span>
                  </button>

                  <button
                    onClick={() => onSelect(article)}
                    className="text-[#4A90E2] font-semibold hover:underline flex items-center gap-1 ml-1"
                  >
                    Leer completo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

