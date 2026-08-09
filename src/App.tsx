/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { User, ViewMode, CanvasBackground, CollageItem } from './types';
import { authService } from './services/authService';
import { collageService } from './services/collageService';
import { Navbar } from './components/Navbar';
import { MasonryGridView } from './components/MasonryGridView';
import { FreeformCanvasView } from './components/FreeformCanvasView';
import { ArticleListView } from './components/ArticleListView';
import { AuthModal } from './components/AuthModal';
import { ArticleReaderModal } from './components/ArticleReaderModal';
import { ImageDetailModal } from './components/ImageDetailModal';
import { ItemFormModal, DEFAULT_CATEGORIES } from './components/ItemFormModal';
import { AIAssistModal } from './components/AIAssistModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Toast, ToastMessage } from './components/Toast';
import { Sparkles, Layers, Plus, BookOpen, Image as ImageIcon, Move, User as UserIcon, Globe } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [items, setItems] = useState<CollageItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [canvasBg, setCanvasBg] = useState<CanvasBackground>('paper');

  // Scope filter: 'mine' = user's personal collection, 'all' = community public wall
  const [ownerFilter, setOwnerFilter] = useState<'mine' | 'all'>('mine');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals & UI state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CollageItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<CollageItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<CollageItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<CollageItem | null>(null);
  const [isAIAssistOpen, setIsAIAssistOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Load items whenever user changes
  useEffect(() => {
    const loaded = collageService.getItems(user?.id);
    setItems(loaded);
  }, [user]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      type,
      text,
    });
  };

  // Extract unique categories from items merged with DEFAULT_CATEGORIES
  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  // Item counts for personal vs public scopes
  const userItemsCount = useMemo(() => {
    if (!user) return 0;
    return items.filter((i) => i.userId === user.id).length;
  }, [items, user]);

  const totalItemsCount = items.length;

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Scope/Owner filter: if user is logged in and ownerFilter is 'mine', show ONLY items owned by user
      if (user && ownerFilter === 'mine') {
        if (item.userId !== user.id) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // View mode article filter for Articles View
      if (viewMode === 'articles' && item.type !== 'article') {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title?.toLowerCase().includes(q);
        const inSummary = item.summary?.toLowerCase().includes(q);
        const inContent = item.content?.toLowerCase().includes(q);
        const inCaption = item.caption?.toLowerCase().includes(q);
        const inAuthor = item.author?.toLowerCase().includes(q);
        const inCategory = item.category?.toLowerCase().includes(q);
        const inTags = item.tags?.some((t) => t.toLowerCase().includes(q));

        return inTitle || inSummary || inContent || inCaption || inAuthor || inCategory || inTags;
      }

      return true;
    });
  }, [items, selectedCategory, searchQuery, viewMode, user, ownerFilter]);

  // Auth Handlers
  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setOwnerFilter('mine'); // Automatically switch to user's personal collection view
    showToast(`¡Bienvenido de nuevo, ${loggedInUser.name.split(' ')[0]}!`, 'success');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setOwnerFilter('all');
    showToast('Sesión cerrada correctamente.', 'info');
  };

  const handleResetData = () => {
    const res = collageService.resetToDefault();
    setItems(res);
    showToast('Se han restaurado las tarjetas de ejemplo.', 'info');
  };

  // Open add item with auth check
  const handleOpenAddModal = () => {
    if (!user) {
      showToast('Debes iniciar sesión para añadir contenido.', 'info');
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }
    if (user.isGuest || user.id === 'usr-guest') {
      showToast('Inicia sesión con una cuenta para publicar contenido.', 'info');
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }
    setEditingItem(null);
    setIsItemFormOpen(true);
  };

  // Open AI modal with auth check
  const handleOpenAIAssist = () => {
    if (!user) {
      showToast('Debes iniciar sesión para generar tarjetas con IA.', 'info');
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }
    setIsAIAssistOpen(true);
  };

  const handleRequireAuth = () => {
    showToast('Inicia sesión para interactuar con el collage.', 'info');
    setAuthInitialTab('login');
    setIsAuthOpen(true);
  };

  const handleToggleLike = (item: CollageItem) => {
    if (!user) {
      handleRequireAuth();
      return;
    }
    const updated = collageService.toggleLike(user, item.id);
    if (updated) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      if (selectedArticle?.id === item.id) {
        setSelectedArticle(updated);
      }
      if (selectedImage?.id === item.id) {
        setSelectedImage(updated);
      }
    }
  };

  const handleAddComment = (item: CollageItem, text: string) => {
    if (!user) {
      handleRequireAuth();
      return;
    }
    const res = collageService.addComment(user, item.id, text);
    if (res) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? res.updatedItem : i)));
      if (selectedArticle?.id === item.id) {
        setSelectedArticle(res.updatedItem);
      }
      if (selectedImage?.id === item.id) {
        setSelectedImage(res.updatedItem);
      }
      showToast('Comentario publicado correctamente.', 'success');
    }
  };

  const handleDeleteComment = (item: CollageItem, commentId: string) => {
    if (!user) return;
    const updated = collageService.deleteComment(user, item.id, commentId);
    if (updated) {
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      if (selectedArticle?.id === item.id) {
        setSelectedArticle(updated);
      }
      if (selectedImage?.id === item.id) {
        setSelectedImage(updated);
      }
      showToast('Comentario eliminado.', 'info');
    }
  };

  // Edit item check
  const handleStartEditItem = (item: CollageItem) => {
    if (!user) {
      showToast('Debes iniciar sesión para editar contenido.', 'info');
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }
    if (user.isGuest || user.id === 'usr-guest') {
      showToast('Inicia sesión con una cuenta para editar contenido.', 'info');
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }
    if (item.userId && item.userId !== user.id) {
      showToast('No puedes editar el contenido de otra persona, solamente tu perfil personal.', 'error');
      return;
    }
    setEditingItem(item);
    setIsItemFormOpen(true);
  };

  // Delete item check
  const handleStartDeleteItem = (item: CollageItem) => {
    if (!user) {
      showToast('Debes iniciar sesión para eliminar contenido.', 'info');
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }
    if (user.isGuest || user.id === 'usr-guest') {
      showToast('Inicia sesión con una cuenta para eliminar contenido.', 'info');
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }
    if (item.userId && item.userId !== user.id) {
      showToast('No puedes eliminar el contenido de otra persona, solamente tu perfil personal.', 'error');
      return;
    }
    setDeletingItem(item);
  };

  // Add & Update CRUD Handlers
  const handleSaveNewItem = (itemData: Omit<CollageItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || user.isGuest || user.id === 'usr-guest') {
      showToast('Inicia sesión con una cuenta para guardar contenido.', 'error');
      setIsItemFormOpen(false);
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }
    const created = collageService.addItem(user, itemData);
    setItems((prev) => [created, ...prev]);
    showToast(`¡"${created.title}" añadido a tu colección personal!`, 'success');
  };

  const handleUpdateItem = (itemId: string, updates: Partial<CollageItem>) => {
    if (!user) {
      showToast('Debes iniciar sesión para actualizar contenido.', 'error');
      return;
    }
    const updated = collageService.updateItem(user, itemId, updates);
    if (updated) {
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)));
      showToast('Tarjeta actualizada con éxito.', 'success');
    } else {
      showToast('No tienes permiso para modificar este elemento.', 'error');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;
    if (!user) {
      showToast('Debes iniciar sesión para eliminar contenido.', 'error');
      setDeletingItem(null);
      return;
    }
    const ok = collageService.deleteItem(user, deletingItem.id);
    if (ok) {
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      showToast(`Se eliminó "${deletingItem.title}".`, 'info');
    } else {
      showToast('No tienes permiso para eliminar este elemento.', 'error');
    }
    setDeletingItem(null);
  };

  // Card click inspector handler
  const handleSelectItem = (item: CollageItem) => {
    if (item.type === 'article') {
      setSelectedArticle(item);
    } else if (item.type === 'image') {
      setSelectedImage(item);
    } else if (item.type === 'note') {
      handleStartEditItem(item);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1A1F2B] font-sans antialiased selection:bg-[#4A90E2] selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        ownerFilter={ownerFilter}
        onOwnerFilterChange={setOwnerFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        canvasBg={canvasBg}
        onCanvasBgChange={setCanvasBg}
        onOpenAddModal={handleOpenAddModal}
        onOpenAIAssist={handleOpenAIAssist}
        onOpenAuth={() => {
          setAuthInitialTab('login');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onResetData={handleResetData}
      />

      {/* Hero Header / Board Banner */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Subtle Welcome Info Banner */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-semibold text-[#1A1F2B] flex items-center gap-2 flex-wrap">
              <span>
                {user 
                  ? (ownerFilter === 'mine' ? `Colección Personal de ${user.name}` : 'Mural Colectivo Comunitario')
                  : 'Mural Editorial Colectivo'}
              </span>
              <span className="text-xs font-sans px-2.5 py-0.5 bg-[#EBF8FF] text-[#4A90E2] border border-[#BEE3F8] rounded-full font-semibold">
                {filteredItems.length} {filteredItems.length === 1 ? 'Elemento' : 'Elementos'}
              </span>
            </h2>
            <p className="text-xs text-[#64748B]">
              {user && ownerFilter === 'mine'
                ? 'Viendo únicamente las tarjetas, imágenes y artículos que has publicado en tu cuenta.'
                : 'Explora y colecciona inspiraciones, artículos y notas de toda la comunidad.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 text-xs font-semibold bg-gradient-to-r from-[#4A90E2] to-[#7B61FF] hover:opacity-95 text-white rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
              title="Añadir Contenido"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Añadir Contenido</span>
            </button>
          </div>
        </div>

        {/* VIEW MODES SWITCHING CONTENT */}
        {viewMode === 'masonry' && (
          <MasonryGridView
            items={filteredItems}
            currentUser={user}
            onSelect={handleSelectItem}
            onEdit={handleStartEditItem}
            onDelete={handleStartDeleteItem}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onRequireAuth={handleRequireAuth}
            onOpenAddModal={handleOpenAddModal}
            onResetFilters={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          />
        )}

        {viewMode === 'canvas' && (
          <FreeformCanvasView
            items={filteredItems}
            currentUser={user}
            canvasBg={canvasBg}
            onSelect={handleSelectItem}
            onEdit={handleStartEditItem}
            onDelete={handleStartDeleteItem}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onRequireAuth={handleRequireAuth}
            onUpdateItemPosition={handleUpdateItem}
          />
        )}

        {viewMode === 'articles' && (
          <ArticleListView
            articles={filteredItems}
            currentUser={user}
            onSelect={handleSelectItem}
            onEdit={handleStartEditItem}
            onDelete={handleStartDeleteItem}
            onToggleLike={handleToggleLike}
            onRequireAuth={handleRequireAuth}
            onOpenAddModal={handleOpenAddModal}
          />
        )}

      </main>

      {/* MODALS */}

      {/* Auth Login/Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialTab={authInitialTab}
      />

      {/* Add or Edit Item Modal */}
      <ItemFormModal
        isOpen={isItemFormOpen}
        onClose={() => {
          setIsItemFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveNewItem}
        onUpdate={handleUpdateItem}
        editingItem={editingItem}
        onOpenAIAssist={handleOpenAIAssist}
      />

      {/* Article Full Reader Modal */}
      <ArticleReaderModal
        item={selectedArticle}
        currentUser={user}
        onClose={() => setSelectedArticle(null)}
        onEdit={handleStartEditItem}
        onDelete={handleStartDeleteItem}
        onToggleLike={handleToggleLike}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onRequireAuth={handleRequireAuth}
      />

      {/* Image High Res Detail Modal */}
      <ImageDetailModal
        item={selectedImage}
        currentUser={user}
        onClose={() => setSelectedImage(null)}
        onEdit={handleStartEditItem}
        onDelete={handleStartDeleteItem}
        onToggleLike={handleToggleLike}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onRequireAuth={handleRequireAuth}
      />

      {/* AI Assistant Modal */}
      <AIAssistModal
        isOpen={isAIAssistOpen}
        onClose={() => setIsAIAssistOpen(false)}
        onAddGeneratedItem={handleSaveNewItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
