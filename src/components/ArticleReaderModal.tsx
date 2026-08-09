import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, ExternalLink, Edit3, Trash2, BookOpen, Share2, Calendar, Lock, User as UserIcon, Heart, MessageSquare, Send } from 'lucide-react';
import { CollageItem, User } from '../types';
import { formatTimeAgo } from '../utils/timeAgo';

interface ArticleReaderModalProps {
  item: CollageItem | null;
  currentUser?: User | null;
  onClose: () => void;
  onEdit: (item: CollageItem) => void;
  onDelete: (item: CollageItem) => void;
  onToggleLike?: (item: CollageItem) => void;
  onAddComment?: (item: CollageItem, text: string) => void;
  onDeleteComment?: (item: CollageItem, commentId: string) => void;
  onRequireAuth?: () => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  item,
  currentUser,
  onClose,
  onEdit,
  onDelete,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onRequireAuth,
}) => {
  const [commentText, setCommentText] = useState('');

  if (!item) return null;

  const isOwner = currentUser ? (!item.userId || item.userId === currentUser.id) : false;
  const isOtherUser = currentUser && item.userId && item.userId !== currentUser.id;

  const likesCount = item.likes || 0;
  const hasLiked = currentUser && item.likedByUsers ? item.likedByUsers.includes(currentUser.id) : false;
  const comments = item.comments || [];

  const formattedDate = new Date(item.createdAt).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth?.();
      return;
    }
    if (!commentText.trim()) return;
    onAddComment?.(item, commentText.trim());
    setCommentText('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden text-[#1A1F2B] my-8"
        >
          {/* Header Controls */}
          <div className="sticky top-0 z-20 flex items-center justify-between p-3.5 px-5 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#4A90E2] font-semibold truncate">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">Lector de Editorial</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isOtherUser ? (
                <span className="px-2.5 py-1 bg-[#F1F5F9] text-[#64748B] text-xs font-semibold rounded-xl border border-[#CBD5E1] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#94A3B8]" /> Solo lectura
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(item);
                    }}
                    className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1A1F2B] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-[#CBD5E1]"
                    title="Editar artículo"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#4A90E2]" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onDelete(item);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    title="Eliminar artículo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              )}

              <div className="h-4 w-px bg-[#E2E8F0] mx-0.5" />

              <button
                onClick={onClose}
                className="p-1.5 text-[#64748B] hover:text-[#1A1F2B] hover:bg-[#F1F5F9] rounded-xl transition-colors border border-[#E2E8F0] shrink-0"
                title="Cerrar lectura"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Article Cover Image */}
          {item.coverImageUrl && (
            <div className="w-full h-64 sm:h-80 overflow-hidden bg-[#F8FAFC] relative">
              <img
                src={item.coverImageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 sm:p-10 space-y-6">
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] border-b border-[#E2E8F0] pb-4">
              <span className="px-2.5 py-1 bg-[#EBF8FF] text-[#4A90E2] border border-[#BEE3F8] rounded-full font-semibold">
                {item.category}
              </span>
              {item.readTimeMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8]" /> {item.readTimeMinutes} min read
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" /> {formattedDate} ({formatTimeAgo(item.createdAt)})
              </span>
              {item.author && <span className="font-semibold text-[#1A1F2B]">By {item.author}</span>}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-semibold text-[#1A1F2B] leading-tight">
              {item.title}
            </h1>

            {/* Hook Summary */}
            {item.summary && (
              <div className="p-4 bg-[#F8FAFC] border-l-4 border-[#4A90E2] rounded-r-xl text-[#1A1F2B] text-sm sm:text-base italic leading-relaxed font-medium">
                "{item.summary}"
              </div>
            )}

            {/* Main Article Paragraphs */}
            <div className="text-[#334155] text-sm sm:text-base leading-relaxed space-y-4 font-sans whitespace-pre-line">
              {item.content || item.summary || 'No detailed content provided for this article.'}
            </div>

            {/* Source Link */}
            {item.sourceUrl && (
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <span className="text-xs text-[#64748B] font-medium">Original Publication Source:</span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF8FF] hover:bg-[#D6EFFF] border border-[#BEE3F8] text-[#4A90E2] rounded-xl text-xs font-semibold transition-colors"
                >
                  Visit Article Source <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {item.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Social Interactions & Comments inside Reader Modal */}
            <div className="pt-6 border-t border-[#E2E8F0] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {/* Like Button */}
                  <button
                    onClick={() => {
                      if (!currentUser) onRequireAuth?.();
                      else onToggleLike?.(item);
                    }}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all ${
                      hasLiked
                        ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:text-rose-600 border border-[#E2E8F0]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{likesCount} Me gusta</span>
                  </button>

                  <span className="text-xs text-[#64748B] flex items-center gap-1 font-semibold">
                    <MessageSquare className="w-4 h-4 text-[#4A90E2]" />
                    {comments.length} {comments.length === 1 ? 'Comentario' : 'Comentarios'}
                  </span>
                </div>
              </div>

              {/* Comments Container */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <h4 className="text-xs font-bold text-[#1A1F2B] uppercase tracking-wider">
                  Discusión del Artículo
                </h4>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1 my-2 text-xs">
                  {comments.length === 0 ? (
                    <div className="text-center py-6 text-[#94A3B8] text-xs italic">
                      Aún no hay comentarios en este artículo. ¡Sé el primero en aportar a la lectura!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-3 rounded-xl bg-white border border-[#E2E8F0] space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#1A1F2B] flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#EBF8FF] text-[#4A90E2] flex items-center justify-center font-bold text-[10px] border border-[#BEE3F8]">
                              {comment.userName.charAt(0).toUpperCase()}
                            </div>
                            {comment.userName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#94A3B8]">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                            {(currentUser && (currentUser.id === comment.userId || isOwner)) && (
                              <button
                                onClick={() => onDeleteComment?.(item, comment.id)}
                                className="text-[#94A3B8] hover:text-rose-600 p-0.5 rounded transition-colors"
                                title="Eliminar comentario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-[#334155] leading-relaxed break-words pl-6">
                          {comment.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleSendComment} className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]">
                  <input
                    type="text"
                    placeholder={currentUser ? "Escribe un comentario sobre este artículo..." : "Inicia sesión para opinar"}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={!currentUser}
                    onClick={() => {
                      if (!currentUser) onRequireAuth?.();
                    }}
                    className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/30 focus:border-[#4A90E2] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!currentUser || !commentText.trim()}
                    className="px-4 py-2 bg-[#4A90E2] hover:bg-[#357ABD] disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors shrink-0 shadow-xs text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Comentar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
