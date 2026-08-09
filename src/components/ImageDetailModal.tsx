import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, Trash2, Image as ImageIcon, Tag, Calendar, Download, ChevronLeft, ChevronRight, Layers, Lock, User as UserIcon, Heart, MessageSquare, Send } from 'lucide-react';
import { CollageItem, SubImage, User } from '../types';
import { formatTimeAgo } from '../utils/timeAgo';

interface ImageDetailModalProps {
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

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
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
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [commentText, setCommentText] = useState('');

  if (!item) return null;

  const isOwner = currentUser ? (!item.userId || item.userId === currentUser.id) : false;
  const isOtherUser = currentUser && item.userId && item.userId !== currentUser.id;

  const likesCount = item.likes || 0;
  const hasLiked = currentUser && item.likedByUsers ? item.likedByUsers.includes(currentUser.id) : false;
  const comments = item.comments || [];

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

  // Build full list of images for this item: [mainImage, ...galleryImages]
  const allImages: { url: string; title?: string; caption?: string }[] = [];

  if (item.imageUrl) {
    allImages.push({
      url: item.imageUrl,
      title: item.title,
      caption: item.caption,
    });
  }

  if (item.galleryImages && item.galleryImages.length > 0) {
    item.galleryImages.forEach((sub, i) => {
      if (sub.url) {
        allImages.push({
          url: sub.url,
          title: sub.title || `Foto #${i + 1}`,
          caption: sub.caption,
        });
      }
    });
  }

  const currentImage: { url: string; title?: string; caption?: string } =
    allImages[activeImageIndex] || allImages[0] || { url: '', title: item.title, caption: item.caption };

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white border border-[#E2E8F0] rounded-3xl overflow-hidden shadow-2xl text-[#1A1F2B] my-6 flex flex-col"
        >
          {/* Top Modal Header Bar with clean Edit, Delete, and Close controls */}
          <div className="flex items-center justify-between p-3.5 px-5 bg-white border-b border-[#E2E8F0] w-full shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4A90E2] truncate">
              <ImageIcon className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-xs">{item.title}</span>
              {allImages.length > 1 && (
                <span className="px-2 py-0.5 text-[10px] font-bold text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] rounded-full flex items-center gap-1 shrink-0">
                  <Layers className="w-3 h-3 text-[#4A90E2]" /> {allImages.length} Fotos
                </span>
              )}
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
                    title="Editar contenido"
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
                    title="Eliminar contenido"
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
                title="Cerrar vista previa"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Modal Main Content (Image + Sidebar) */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* High Res Image Section */}
            <div className="flex-1 bg-[#F8FAFC] flex flex-col items-center justify-between p-6 min-h-[340px] md:min-h-[520px] relative">
            {/* Carousel display */}
            <div className="flex-1 w-full flex items-center justify-center relative">
              {currentImage.url ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.title || item.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[60vh] w-auto max-w-full object-contain rounded-2xl shadow-md transition-all duration-300"
                />
              ) : (
                <div className="text-[#94A3B8] flex flex-col items-center gap-2">
                  <ImageIcon className="w-12 h-12" />
                  <p className="text-xs font-medium">No hay vista previa disponible</p>
                </div>
              )}

              {/* Prev / Next controls if multiple images */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 p-2 bg-white/80 hover:bg-white text-[#1A1F2B] rounded-full shadow-md border border-[#E2E8F0] transition-colors"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 p-2 bg-white/80 hover:bg-white text-[#1A1F2B] rounded-full shadow-md border border-[#E2E8F0] transition-colors"
                    title="Siguiente"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Sub-image Title Overlay / Caption Banner */}
            {currentImage.title && (
              <div className="w-full text-center mt-3 pt-2 border-t border-[#E2E8F0]/60">
                <span className="text-xs font-bold text-[#4A90E2] uppercase tracking-wider block">
                  {allImages.length > 1 ? `Foto ${activeImageIndex + 1} de ${allImages.length}` : 'Foto principal'}
                </span>
                <h4 className="text-sm font-semibold text-[#1A1F2B]">{currentImage.title}</h4>
                {currentImage.caption && (
                  <p className="text-xs text-[#64748B] italic mt-0.5">{currentImage.caption}</p>
                )}
              </div>
            )}

            {/* Thumbnail Navigation Bar */}
            {allImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3 overflow-x-auto max-w-full py-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#4A90E2] ring-2 ring-[#4A90E2]/30 scale-105'
                        : 'border-[#CBD5E1] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.title || `Thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Comments Sidebar */}
          <div className="w-full md:w-96 p-5 sm:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#E2E8F0] bg-white">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-[#EBF8FF] text-[#4A90E2] border border-[#BEE3F8] rounded-full">
                    {item.category}
                  </span>
                  <span className="px-2.5 py-1 text-xs text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full font-medium flex items-center gap-1">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>
                
                {/* Me gusta button inside modal */}
                <button
                  onClick={() => {
                    if (!currentUser) onRequireAuth?.();
                    else onToggleLike?.(item);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    hasLiked
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:text-rose-600 border border-[#E2E8F0]'
                  }`}
                  title="Me gusta"
                >
                  <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{likesCount} Likes</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-[#1A1F2B]">
                {item.title}
              </h2>

              {item.caption && (
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#475569] italic leading-relaxed font-medium">
                  "{item.caption}"
                </div>
              )}

              {/* COMMENTS SECTION INSIDE MODAL */}
              <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1A1F2B]">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#4A90E2]" />
                    Comentarios ({comments.length})
                  </span>
                </div>

                {/* Comment list */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 my-2 text-xs">
                  {comments.length === 0 ? (
                    <div className="text-center py-4 text-[#94A3B8] text-[11px] italic bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]/60">
                      Aún no hay comentarios. ¡Sé el primero en opinar!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-[#1A1F2B] flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-[#EBF8FF] text-[#4A90E2] flex items-center justify-center font-bold text-[9px] border border-[#BEE3F8]">
                              {comment.userName.charAt(0).toUpperCase()}
                            </div>
                            {comment.userName}
                          </span>
                          {(currentUser && (currentUser.id === comment.userId || isOwner)) && (
                            <button
                              onClick={() => onDeleteComment?.(item, comment.id)}
                              className="text-[#94A3B8] hover:text-rose-600 p-0.5 rounded transition-colors"
                              title="Eliminar comentario"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-[#334155] leading-snug break-words">
                          {comment.text}
                        </p>
                        <span className="text-[9px] text-[#94A3B8] block text-right">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input Form */}
                <form onSubmit={handleSendComment} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder={currentUser ? "Escribe un comentario..." : "Inicia sesión para comentar"}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={!currentUser}
                    onClick={() => {
                      if (!currentUser) onRequireAuth?.();
                    }}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#4A90E2] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={!currentUser || !commentText.trim()}
                    className="p-1.5 bg-[#4A90E2] hover:bg-[#357ABD] disabled:bg-slate-300 text-white rounded-xl transition-colors shrink-0 shadow-xs"
                    title="Publicar comentario"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] text-[#64748B] font-semibold flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#94A3B8]" /> Tags:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 text-[11px] bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] rounded-full font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-2 mt-4">
              {currentImage.url && (
                <a
                  href={currentImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#1A1F2B] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#4A90E2]" /> Abrir foto a máxima resolución
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </AnimatePresence>
  );
};
