export type ItemType = 'image' | 'article' | 'note';

export type CanvasBackground = 'paper' | 'cork' | 'dark' | 'linen';

export interface SubImage {
  id: string;
  url: string;
  title?: string;
  caption?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface CollageItem {
  id: string;
  userId?: string;     // ID of owner user
  userName?: string;   // Name of owner user
  type: ItemType;
  title: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  
  // Likes and Comments
  likes?: number;
  likedByUsers?: string[];
  comments?: Comment[];

  // Image specific properties
  imageUrl?: string;
  caption?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'wide';
  galleryImages?: SubImage[];

  // Article specific properties
  summary?: string;
  content?: string;
  author?: string;
  sourceUrl?: string;
  readTimeMinutes?: number;
  coverImageUrl?: string;

  // Note specific properties
  quoteAuthor?: string;
  colorScheme?: 'amber' | 'rose' | 'emerald' | 'sky' | 'purple' | 'slate';

  // Freeform canvas layout options
  rotationDegrees?: number; // e.g. -6 to +6 deg for realistic pin effect
  zIndex?: number;
  pinned?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  joinedDate: string;
  isGuest?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type ViewMode = 'masonry' | 'canvas' | 'articles';
