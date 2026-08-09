import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Image as ImageIcon, 
  StickyNote, 
  Clock, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Pin,
  Tag,
  Layers,
  Lock,
  User as UserIcon,
  Heart,
  MessageSquare,
  Send,
  X
} from 'lucide-react';
import { CollageItem, User } from '../types';
import { formatTimeAgo } from '../utils/timeAgo';

interface CollageItemCardProps {
  item: CollageItem;
  currentUser?: User | null;
  onSelect: (item: CollageItem) => void;
  onEdit: (item: CollageItem) => void;
  onDelete: (item: CollageItem) => void;
  onToggleLike?: (item: CollageItem) => void;
  onAddComment?: (item: CollageItem, text: string) => void;
  onDeleteComment?: (item: CollageItem, commentId: string) => void;
  onRequireAuth?: () => void;
  isCanvasMode?: boolean;
}

export const CollageItemCard: React.FC<CollageItemCardProps> = ({
  item,
  currentUser,
  onSelect,
  onEdit,
  onDelete,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onRequireAuth,
  isCanvasMode = false,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const tiltStyle = isCanvasMode && item.rotationDegrees
    ? { transform: `rotate(${item.rotationDegrees}deg)` }
    : {};

  // Check if current logged-in user is owner
  const isOwner = currentUser ? (!item.userId || item.userId === currentUser.id) : false;
  const isOtherUserContent = currentUser && item.userId && item.userId !== currentUser.id;

  // Likes & Comments calculation
  const likesCount = item.likes || 0;
  const hasLiked = currentUser && item.likedByUsers ? item.likedByUsers.includes(currentUser.id) : false;
  const comments = item.comments || [];

  // Color mappings for Note items
  const noteColors = {
    amber: 'bg-[#FFFBEB] border-[#FCD34D] text-[#92400E]',
    rose: 'bg-[#FFF1F2] border-[#FECDD3] text-[#9F1239]',
    emerald: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]',
    sky: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#075985]',
    purple: 'bg-[#FAF5FF] border-[#E9D5FF] text-[#6B21A8]',
    slate: 'bg-white border-[#E2E8F0] text-[#1A1F2B]',
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      onRequireAuth?.();
      return;
    }
    if (!commentText.trim()) return;
    onAddComment?.(item, commentText.trim());
    setCommentText('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={tiltStyle}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl flex flex-col ${
        showComments ? 'sm:flex-row sm:items-stretch sm:max-w-2xl' : ''
      } ${
        item.type === 'note'
          ? noteColors[item.colorScheme || 'amber']
          : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] text-[#1A1F2B] shadow-xs'
      }`}
    >
      {/* Pin Icon decoration for Collage Effect */}
      {item.pinned && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-4 h-4 rounded-full bg-[#4A90E2] border border-white shadow-xs flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      )}

      {/* Action Overlay Buttons */}
      {!showComments && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md p-1 rounded-xl border border-[#E2E8F0] shadow-sm">
          {isOtherUserContent ? (
            <span className="px-2 py-1 text-[10px] text-[#64748B] font-medium flex items-center gap-1" title="Solo lectura - Contenido de otro perfil">
              <Lock className="w-3 h-3 text-[#94A3B8]" /> Solo lectura
            </span>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="p-1.5 text-[#64748B] hover:text-[#4A90E2] hover:bg-[#F1F5F9] rounded-lg transition-colors"
                title={currentUser ? "Editar contenido" : "Inicia sesión para editar"}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title={currentUser ? "Eliminar contenido" : "Inicia sesión para eliminar"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div
        onClick={() => onSelect(item)}
        className="cursor-pointer p-4 pt-5 flex flex-col justify-between flex-1"
      >
        <div>
          {/* IMAGE TYPE CARD */}
          {item.type === 'image' && (
            <div className="space-y-3">
              {item.imageUrl && (
                <div className="relative overflow-hidden rounded-xl bg-[#F8FAFC] group-hover:scale-[1.01] transition-transform">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover max-h-[380px] rounded-xl"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3 rounded-xl">
                    <span className="text-[10px] text-white font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Ver detalle
                    </span>
                    {item.galleryImages && item.galleryImages.length > 0 && (
                      <span className="text-[10px] bg-slate-900/80 text-white font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs shadow-xs">
                        <Layers className="w-3 h-3 text-[#4A90E2]" /> +{item.galleryImages.length} foto{item.galleryImages.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider bg-[#EBF8FF] text-[#4A90E2] border border-[#BEE3F8] rounded-full font-semibold">
                    {item.category}
                  </span>
                  {item.userName && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium flex items-center gap-1 border ${
                      currentUser && item.userId === currentUser.id
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                        : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                    }`}>
                      <UserIcon className="w-2.5 h-2.5" />
                      {currentUser && item.userId === currentUser.id ? 'Tú' : item.userName}
                    </span>
                  )}
                  <span className="px-2 py-0.5 text-[10px] text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] rounded-full font-medium flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-[#94A3B8]" />
                    {formatTimeAgo(item.createdAt)}
                  </span>
                  {item.galleryImages && item.galleryImages.length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] rounded-full font-semibold flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#4A90E2]" /> +{item.galleryImages.length} extra
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-base text-[#1A1F2B] group-hover:text-[#4A90E2] transition-colors leading-snug">
                  {item.title}
                </h3>
                {item.caption && (
                  <p className="mt-1 text-xs text-[#64748B] line-clamp-2 italic">
                    "{item.caption}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ARTICLE TYPE CARD */}
          {item.type === 'article' && (
            <div className="space-y-3">
              {item.coverImageUrl && (
                <div className="relative overflow-hidden rounded-xl bg-[#F8FAFC] max-h-48">
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-36 object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-white/90 backdrop-blur-md text-[10px] text-[#4A90E2] font-semibold rounded-full border border-[#E2E8F0] flex items-center gap-1 shadow-xs">
                    <FileText className="w-3 h-3" /> Artículo
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1.5 flex-wrap gap-1">
                  <span className="px-2.5 py-0.5 bg-[#EBF8FF] text-[#4A90E2] border border-[#BEE3F8] rounded-full font-semibold">
                    {item.category}
                  </span>
                  {item.userName && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium flex items-center gap-1 border ${
                      currentUser && item.userId === currentUser.id
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                        : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                    }`}>
                      <UserIcon className="w-2.5 h-2.5" />
                      {currentUser && item.userId === currentUser.id ? 'Tú' : item.userName}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[#64748B] text-[10px]">
                    <Clock className="w-3 h-3 text-[#94A3B8]" /> {formatTimeAgo(item.createdAt)}
                  </span>
                  {item.readTimeMinutes && (
                    <span className="flex items-center gap-1 text-[#64748B]">
                      {item.readTimeMinutes} min lect.
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-lg text-[#1A1F2B] group-hover:text-[#4A90E2] transition-colors leading-snug">
                  {item.title}
                </h3>

                {item.summary && (
                  <p className="mt-2 text-xs text-[#475569] leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                )}

                {item.author && (
                  <p className="mt-3 text-[11px] text-[#64748B] font-medium border-t border-[#E2E8F0] pt-2 flex items-center justify-between">
                    <span>Por {item.author}</span>
                    <span className="text-[#4A90E2] group-hover:underline flex items-center gap-0.5 font-semibold">
                      Leer <ExternalLink className="w-3 h-3" />
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* NOTE / QUOTE TYPE CARD */}
          {item.type === 'note' && (
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-black/5 rounded-full uppercase tracking-wider">
                  {item.category}
                </span>
                <StickyNote className="w-4 h-4 opacity-60" />
              </div>

              <h3 className="font-semibold text-base">
                {item.title}
              </h3>

              {item.summary && (
                <blockquote className="text-sm italic leading-relaxed opacity-90 border-l-2 border-[#4A90E2]/60 pl-3 my-2">
                  {item.summary}
                </blockquote>
              )}

              <div className="flex items-center justify-between text-[10px] opacity-75 font-medium flex-wrap gap-1">
                {item.userName && (
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-3 h-3" />
                    {currentUser && item.userId === currentUser.id ? 'Publicado por ti' : `Por ${item.userName}`}
                  </div>
                )}
                <div className="flex items-center gap-1 opacity-90">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTimeAgo(item.createdAt)}
                </div>
              </div>

              {item.quoteAuthor && (
                <p className="text-xs font-medium text-right opacity-80 pt-1">
                  — {item.quoteAuthor}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Social Bar (Likes & Comments Buttons) */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className="mt-4 pt-2.5 border-t border-[#E2E8F0]/80 flex items-center justify-between gap-2 text-xs text-[#64748B]"
        >
          {/* Tags preview */}
          <div className="flex flex-wrap gap-1 items-center overflow-hidden">
            {item.tags && item.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="text-[10px] text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full border border-[#E2E8F0] font-medium truncate max-w-[80px]">
                #{tag}
              </span>
            ))}
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Me Gusta Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!currentUser) {
                  onRequireAuth?.();
                } else {
                  onToggleLike?.(item);
                }
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
                hasLiked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:text-rose-600 border border-[#E2E8F0] hover:bg-rose-50/50'
              }`}
              title={hasLiked ? "Ya te gusta esto (haz clic para quitar)" : "Me gusta"}
            >
              <Heart className={`w-3.5 h-3.5 transition-transform active:scale-125 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likesCount}</span>
            </button>

            {/* Comentarios Toggle Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 transition-all ${
                showComments
                  ? 'bg-[#EBF8FF] text-[#4A90E2] border border-[#BEE3F8] shadow-2xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#4A90E2] border border-[#E2E8F0] hover:bg-[#EBF8FF]/50'
              }`}
              title="Ver o agregar comentarios en la tarjeta"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{comments.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right-Side Comments Panel (Inside Card) */}
      {showComments && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:w-72 border-t sm:border-t-0 sm:border-l border-[#E2E8F0] p-3.5 bg-[#F8FAFC] flex flex-col justify-between shrink-0 cursor-default"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1F2B]">
              <MessageSquare className="w-3.5 h-3.5 text-[#4A90E2]" />
              <span>Comentarios ({comments.length})</span>
            </div>
            <button 
              onClick={() => setShowComments(false)}
              className="text-[#94A3B8] hover:text-[#1A1F2B] p-1 rounded-md transition-colors"
              title="Cerrar panel de comentarios"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto max-h-56 space-y-2 pr-1 my-1 text-xs">
            {comments.length === 0 ? (
              <div className="text-center py-6 text-[#94A3B8] text-[11px] italic">
                Sé el primero en comentar este collage...
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-1">
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

          {/* Comment Form */}
          <form onSubmit={handleSendComment} className="pt-2 border-t border-[#E2E8F0] flex items-center gap-1.5">
            <input
              type="text"
              placeholder={currentUser ? "Añadir comentario..." : "Inicia sesión para comentar"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!currentUser}
              onClick={() => {
                if (!currentUser) onRequireAuth?.();
              }}
              className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#4A90E2] disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!currentUser || !commentText.trim()}
              className="p-1.5 bg-[#4A90E2] hover:bg-[#357ABD] disabled:bg-slate-300 text-white rounded-xl transition-colors shrink-0 shadow-xs"
              title="Enviar comentario"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
};


