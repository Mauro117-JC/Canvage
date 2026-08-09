import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image as ImageIcon, FileText, StickyNote, Sparkles, Plus, Save, Upload, Trash2, Edit2, Layers } from 'lucide-react';
import { CollageItem, ItemType, SubImage } from '../types';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<CollageItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate?: (itemId: string, updates: Partial<CollageItem>) => void;
  editingItem?: CollageItem | null;
  onOpenAIAssist?: () => void;
}

export const DEFAULT_CATEGORIES = [
  'Design & Editorial',
  'Architecture',
  'Culture',
  'Gaming',
  'Photography',
  'Quotes & Ideas',
  'Technology',
  'Personal Notes',
];

const CATEGORIES = DEFAULT_CATEGORIES;

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editingItem,
  onOpenAIAssist,
}) => {
  const [type, setType] = useState<ItemType>('article');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState('');

  // Image specific
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [galleryImages, setGalleryImages] = useState<SubImage[]>([]);

  // Article specific
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [readTimeMinutes, setReadTimeMinutes] = useState<number>(3);

  // Note specific
  const [quoteAuthor, setQuoteAuthor] = useState('');
  const [colorScheme, setColorScheme] = useState<'amber' | 'rose' | 'emerald' | 'sky' | 'purple' | 'slate'>('amber');

  // Tilt
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);

  // File input refs
  const mainImageFileRef = useRef<HTMLInputElement>(null);
  const coverImageFileRef = useRef<HTMLInputElement>(null);
  const galleryFilesRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItem) {
      setType(editingItem.type);
      setTitle(editingItem.title);
      setCategory(editingItem.category || CATEGORIES[0]);
      setTagsInput(editingItem.tags ? editingItem.tags.join(', ') : '');
      setImageUrl(editingItem.imageUrl || '');
      setCaption(editingItem.caption || '');
      setGalleryImages(editingItem.galleryImages || []);
      setSummary(editingItem.summary || '');
      setContent(editingItem.content || '');
      setAuthor(editingItem.author || '');
      setSourceUrl(editingItem.sourceUrl || '');
      setCoverImageUrl(editingItem.coverImageUrl || '');
      setReadTimeMinutes(editingItem.readTimeMinutes || 3);
      setQuoteAuthor(editingItem.quoteAuthor || '');
      setColorScheme(editingItem.colorScheme || 'amber');
      setRotationDegrees(editingItem.rotationDegrees || 0);
    } else {
      // Reset form
      setType('article');
      setTitle('');
      setCategory(CATEGORIES[0]);
      setTagsInput('');
      setImageUrl('');
      setCaption('');
      setGalleryImages([]);
      setSummary('');
      setContent('');
      setAuthor('');
      setSourceUrl('');
      setCoverImageUrl('');
      setReadTimeMinutes(3);
      setQuoteAuthor('');
      setColorScheme('amber');
      setRotationDegrees(Math.floor(Math.random() * 7) - 3);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  // Read local file as Data URL
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetSetter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          targetSetter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add sub-images from local device
  const handleMultipleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          const formattedName = cleanFileName.charAt(0).toUpperCase() + cleanFileName.slice(1);
          setGalleryImages((prev) => [
            ...prev,
            {
              id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              url: reader.result as string,
              title: formattedName || 'Imagen ' + (prev.length + 1),
              caption: '',
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    // reset input
    e.target.value = '';
  };

  const handleAddGalleryImageByUrl = () => {
    setGalleryImages((prev) => [
      ...prev,
      {
        id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        url: '',
        title: 'Nueva imagen ' + (prev.length + 1),
        caption: '',
      },
    ]);
  };

  const updateGalleryImage = (id: string, updates: Partial<SubImage>) => {
    setGalleryImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  };

  const removeGalleryImage = (id: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    // Filter valid gallery images
    const validGallery = galleryImages.filter((img) => img.url.trim().length > 0);

    const payload: Omit<CollageItem, 'id' | 'createdAt' | 'updatedAt'> = {
      type,
      title: title.trim(),
      category,
      tags: tagsArray,
      rotationDegrees,
      pinned: true,
      imageUrl: type === 'image' ? (imageUrl.trim() || (validGallery.length > 0 ? validGallery[0].url : '')) : undefined,
      caption: type === 'image' ? caption.trim() : undefined,
      galleryImages: validGallery.length > 0 ? validGallery : undefined,
      summary: (type === 'article' || type === 'note') ? summary.trim() : undefined,
      content: type === 'article' ? content.trim() : undefined,
      author: type === 'article' ? author.trim() : undefined,
      sourceUrl: type === 'article' ? sourceUrl.trim() : undefined,
      coverImageUrl: type === 'article' ? coverImageUrl.trim() : undefined,
      readTimeMinutes: type === 'article' ? Number(readTimeMinutes) : undefined,
      quoteAuthor: type === 'note' ? quoteAuthor.trim() : undefined,
      colorScheme: type === 'note' ? colorScheme : undefined,
    };

    if (editingItem && onUpdate) {
      onUpdate(editingItem.id, payload);
    } else {
      onSave(payload);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden text-[#1A1F2B] my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1F2B]">
                {editingItem ? 'Edit Collage Item' : 'Add Content to Collage'}
              </h2>
              <p className="text-xs text-[#64748B]">
                Collect articles, images, and notes onto your board
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenAIAssist && !editingItem && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAIAssist();
                  }}
                  className="px-3 py-1.5 bg-[#EBF8FF] hover:bg-[#D6EFFF] border border-[#BEE3F8] text-[#4A90E2] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Draft</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#64748B] hover:text-[#1A1F2B] hover:bg-[#F1F5F9] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Type Selector (Image vs Article vs Note) */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-2">Item Format</label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#F1F5F9] rounded-2xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setType('article')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
                    type === 'article'
                      ? 'bg-white text-[#4A90E2] shadow-xs'
                      : 'text-[#64748B] hover:text-[#1A1F2B]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Article</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('image')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
                    type === 'image'
                      ? 'bg-white text-[#4A90E2] shadow-xs'
                      : 'text-[#64748B] hover:text-[#1A1F2B]'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('note')}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
                    type === 'note'
                      ? 'bg-white text-[#4A90E2] shadow-xs'
                      : 'text-[#64748B] hover:text-[#1A1F2B]'
                  }`}
                >
                  <StickyNote className="w-4 h-4" />
                  <span>Note / Quote</span>
                </button>
              </div>
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Title <span className="text-[#4A90E2]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    type === 'image'
                      ? 'e.g. Kyoto Shadow Architectural Study'
                      : type === 'article'
                      ? 'e.g. Design Principles of Modern Typography'
                      : 'e.g. Thought on Digital Tactility'
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* IMAGE TYPE SPECIFIC FIELDS */}
            {type === 'image' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#475569]">Imagen principal</label>
                    <button
                      type="button"
                      onClick={() => mainImageFileRef.current?.click()}
                      className="text-xs text-[#4A90E2] hover:text-[#357ABD] font-semibold flex items-center gap-1 bg-[#EBF8FF] hover:bg-[#D6EFFF] px-2.5 py-1 rounded-lg border border-[#BEE3F8] transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir desde dispositivo</span>
                    </button>
                    <input
                      ref={mainImageFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setImageUrl)}
                    />
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... o sube un archivo local"
                    className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                  />
                </div>

                {/* Live Image Preview */}
                {imageUrl && (
                  <div className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden max-h-48 flex items-center justify-center relative group">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-44 object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1 bg-white/90 hover:bg-rose-50 text-rose-600 rounded-lg shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Quitar imagen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Descripción / Notas</label>
                  <textarea
                    rows={2}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Descripción corta o notas sobre esta imagen..."
                    className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                  />
                </div>
              </div>
            )}

            {/* MULTIPLE IMAGES / GALLERY SECTION FOR CARD */}
            {(type === 'image' || type === 'article') && (
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1F2B] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#4A90E2]" />
                      Imágenes adicionales en el collage ({galleryImages.length})
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      Agrega varias imágenes a esta carta con su título individual
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => galleryFilesRef.current?.click()}
                      className="px-2.5 py-1.5 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir de dispositivo</span>
                    </button>
                    <input
                      ref={galleryFilesRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleMultipleFileUpload}
                    />

                    <button
                      type="button"
                      onClick={handleAddGalleryImageByUrl}
                      className="px-2.5 py-1.5 bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>URL</span>
                    </button>
                  </div>
                </div>

                {galleryImages.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-[#CBD5E1] rounded-xl text-center text-xs text-[#64748B] bg-white">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 text-[#94A3B8]" />
                    <span>No hay imágenes adicionales en esta carta. Haz clic en "Subir de dispositivo" para incluir múltiples imágenes con títulos.</span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={img.id}
                        className="p-3 bg-white border border-[#E2E8F0] rounded-xl shadow-xs flex flex-col sm:flex-row items-start gap-3"
                      >
                        {/* Image preview / file upload button */}
                        <div className="relative w-20 h-20 shrink-0 bg-[#F1F5F9] rounded-lg overflow-hidden border border-[#CBD5E1] flex items-center justify-center group">
                          {img.url ? (
                            <img
                              src={img.url}
                              alt={img.title || 'Sub-imagen'}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-1">
                              <ImageIcon className="w-5 h-5 mx-auto text-[#94A3B8]" />
                              <span className="text-[9px] text-[#64748B]">Sin imagen</span>
                            </div>
                          )}

                          <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-[10px]">
                            <Upload className="w-4 h-4" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    if (typeof reader.result === 'string') {
                                      updateGalleryImage(img.id, { url: reader.result });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>

                        {/* Title & URL inputs */}
                        <div className="flex-1 space-y-1.5 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#4A90E2] uppercase tracking-wider">
                              Imagen #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(img.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar esta foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={img.title || ''}
                            onChange={(e) => updateGalleryImage(img.id, { title: e.target.value })}
                            placeholder="Título de esta foto (ej. Vista lateral, Detalle frontal...)"
                            className="w-full px-2.5 py-1 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#1A1F2B] font-semibold focus:outline-none focus:border-[#4A90E2]"
                          />

                          <input
                            type="text"
                            value={img.url}
                            onChange={(e) => updateGalleryImage(img.id, { url: e.target.value })}
                            placeholder="URL de la imagen o archivo cargado"
                            className="w-full px-2.5 py-1 text-[11px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#64748B] focus:outline-none focus:border-[#4A90E2]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ARTICLE TYPE SPECIFIC FIELDS */}
            {type === 'article' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Article Summary Hook</label>
                  <input
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief 1-2 sentence hook or takeaway..."
                    className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Full Article Body / Content</label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write or paste full article body..."
                    className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Author Name</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Read Time (minutes)</label>
                    <input
                      type="number"
                      min={1}
                      value={readTimeMinutes}
                      onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#475569]">Imagen de portada</label>
                      <button
                        type="button"
                        onClick={() => coverImageFileRef.current?.click()}
                        className="text-[11px] text-[#4A90E2] hover:underline font-semibold flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Subir</span>
                      </button>
                      <input
                        ref={coverImageFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setCoverImageUrl)}
                      />
                    </div>
                    <input
                      type="url"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://... o archivo local"
                      className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">URL original del artículo</label>
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* NOTE TYPE SPECIFIC FIELDS */}
            {type === 'note' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Quote or Thought Text</label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Write quote, idea snippet, or note..."
                    className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Author / Source Reference</label>
                    <input
                      type="text"
                      value={quoteAuthor}
                      onChange={(e) => setQuoteAuthor(e.target.value)}
                      placeholder="e.g. Dieter Rams"
                      className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Note Accent Color</label>
                    <select
                      value={colorScheme}
                      onChange={(e: any) => setColorScheme(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2] capitalize"
                    >
                      <option value="amber">Warm Amber</option>
                      <option value="rose">Soft Rose</option>
                      <option value="emerald">Emerald Green</option>
                      <option value="sky">Sky Blue</option>
                      <option value="purple">Royal Purple</option>
                      <option value="slate">Smoked Slate</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tags & Collage Tilt Angle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E2E8F0]">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Design, Editorial, Architecture"
                  className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Collage Tilt Angle ({rotationDegrees}°)
                </label>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  value={rotationDegrees}
                  onChange={(e) => setRotationDegrees(Number(e.target.value))}
                  className="w-full accent-[#4A90E2] cursor-pointer"
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1A1F2B] border border-[#CBD5E1] rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-[#4A90E2] to-[#7B61FF] hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{editingItem ? 'Save Changes' : 'Pin to Collage'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
