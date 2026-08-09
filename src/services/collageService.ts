import { CollageItem, User, Comment } from '../types';
import { INITIAL_COLLAGE_ITEMS } from '../data/initialData';

const MAIN_STORAGE_KEY = 'collage_canvas_items_unified';

export const collageService = {
  getStorageKey(): string {
    return MAIN_STORAGE_KEY;
  },

  getItems(userId?: string): CollageItem[] {
    const raw = localStorage.getItem(MAIN_STORAGE_KEY);
    if (!raw) {
      // Check legacy storage key if exists
      const legacyKey = `collage_canvas_items_${userId || 'shared'}`;
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          this.saveAllItems(parsed);
          return parsed;
        } catch {
          // Fallback to sample dataset
        }
      }
      // Seed with initial sample dataset
      this.saveAllItems(INITIAL_COLLAGE_ITEMS);
      return INITIAL_COLLAGE_ITEMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_COLLAGE_ITEMS;
    }
  },

  saveAllItems(items: CollageItem[]) {
    localStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(items));
  },

  toggleLike(user: User, itemId: string): CollageItem | null {
    const currentItems = this.getItems();
    const index = currentItems.findIndex((i) => i.id === itemId);
    if (index === -1) return null;

    const item = currentItems[index];
    const likedBy = item.likedByUsers || [];
    const currentLikes = item.likes || 0;

    let newLikedBy: string[];
    let newLikes: number;

    if (likedBy.includes(user.id)) {
      newLikedBy = likedBy.filter((id) => id !== user.id);
      newLikes = Math.max(0, currentLikes - 1);
    } else {
      newLikedBy = [...likedBy, user.id];
      newLikes = currentLikes + 1;
    }

    const updatedItem: CollageItem = {
      ...item,
      likes: newLikes,
      likedByUsers: newLikedBy,
      updatedAt: new Date().toISOString(),
    };

    currentItems[index] = updatedItem;
    this.saveAllItems(currentItems);
    return updatedItem;
  },

  addComment(user: User, itemId: string, text: string): { updatedItem: CollageItem; newComment: Comment } | null {
    if (!text.trim()) return null;
    const currentItems = this.getItems();
    const index = currentItems.findIndex((i) => i.id === itemId);
    if (index === -1) return null;

    const item = currentItems[index];
    const currentComments = item.comments || [];

    const newComment: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedItem: CollageItem = {
      ...item,
      comments: [...currentComments, newComment],
      updatedAt: new Date().toISOString(),
    };

    currentItems[index] = updatedItem;
    this.saveAllItems(currentItems);
    return { updatedItem, newComment };
  },

  deleteComment(user: User, itemId: string, commentId: string): CollageItem | null {
    const currentItems = this.getItems();
    const index = currentItems.findIndex((i) => i.id === itemId);
    if (index === -1) return null;

    const item = currentItems[index];
    const currentComments = item.comments || [];
    const comment = currentComments.find((c) => c.id === commentId);

    if (!comment) return null;

    // Check permission: comment creator or item owner
    const isCommentCreator = comment.userId === user.id;
    const isItemOwner = item.userId === user.id || !item.userId;

    if (!isCommentCreator && !isItemOwner) {
      return null;
    }

    const updatedComments = currentComments.filter((c) => c.id !== commentId);
    const updatedItem: CollageItem = {
      ...item,
      comments: updatedComments,
      updatedAt: new Date().toISOString(),
    };

    currentItems[index] = updatedItem;
    this.saveAllItems(currentItems);
    return updatedItem;
  },

  addItem(user: User, item: Omit<CollageItem, 'id' | 'createdAt' | 'updatedAt'>): CollageItem {
    const currentItems = this.getItems();
    const now = new Date().toISOString();
    
    // Pick random slight tilt for collage style if none provided
    const randomTilt = Math.floor(Math.random() * 9) - 4; // -4 to +4

    const newItem: CollageItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      userName: user.name,
      createdAt: now,
      updatedAt: now,
      rotationDegrees: item.rotationDegrees ?? randomTilt,
      pinned: item.pinned ?? true,
    };

    const updated = [newItem, ...currentItems];
    this.saveAllItems(updated);
    return newItem;
  },

  updateItem(user: User, itemId: string, updates: Partial<CollageItem>): CollageItem | null {
    const currentItems = this.getItems();
    const index = currentItems.findIndex((i) => i.id === itemId);
    if (index === -1) return null;

    const existingItem = currentItems[index];

    // Ownership check: item must belong to user or be a default sample item with no userId
    if (existingItem.userId && existingItem.userId !== user.id) {
      return null;
    }

    const updatedItem: CollageItem = {
      ...existingItem,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    currentItems[index] = updatedItem;
    this.saveAllItems(currentItems);
    return updatedItem;
  },

  deleteItem(user: User, itemId: string): boolean {
    const currentItems = this.getItems();
    const existingItem = currentItems.find((i) => i.id === itemId);
    if (!existingItem) return false;

    // Ownership check: item must belong to user or be a default sample item with no userId
    if (existingItem.userId && existingItem.userId !== user.id) {
      return false;
    }

    const filtered = currentItems.filter((i) => i.id !== itemId);
    this.saveAllItems(filtered);
    return true;
  },

  resetToDefault(): CollageItem[] {
    this.saveAllItems(INITIAL_COLLAGE_ITEMS);
    return INITIAL_COLLAGE_ITEMS;
  },
};
