import { User } from '../types';

const CURRENT_USER_KEY = 'collage_canvas_active_user';
const USERS_LIST_KEY = 'collage_canvas_registered_users';

const DEFAULT_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Alex Vance',
    email: 'demo@collage.io',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    role: 'Editor & Curator',
    joinedDate: '2026-01-15',
  },
];

// Helper to seed initial user list if empty
function initializeUsersStore(): Record<string, { user: User; passwordHash: string }> {
  const existing = localStorage.getItem(USERS_LIST_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      // Fallback
    }
  }

  const initialMap: Record<string, { user: User; passwordHash: string }> = {
    'demo@collage.io': {
      user: DEFAULT_USERS[0],
      passwordHash: 'password123', // Demo plaintext comparison for client app
    },
  };

  localStorage.setItem(USERS_LIST_KEY, JSON.stringify(initialMap));
  return initialMap;
}

export const authService = {
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const usersMap = initializeUsersStore();
    const normalizedEmail = email.trim().toLowerCase();

    const record = usersMap[normalizedEmail];
    if (!record) {
      return { success: false, error: 'No user account found with this email.' };
    }

    if (record.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please check your credentials.' };
    }

    this.setCurrentUser(record.user);
    return { success: true, user: record.user };
  },

  register(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
    if (!name.trim() || !email.trim() || !password) {
      return { success: false, error: 'All fields are required.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const usersMap = initializeUsersStore();
    const normalizedEmail = email.trim().toLowerCase();

    if (usersMap[normalizedEmail]) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      role: 'Curator',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    usersMap[normalizedEmail] = {
      user: newUser,
      passwordHash: password,
    };

    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(usersMap));
    this.setCurrentUser(newUser);

    return { success: true, user: newUser };
  },

  loginAsGuest(): User {
    const guestUser: User = {
      id: 'usr-guest',
      name: 'Guest Curator',
      email: 'guest@collage.local',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      role: 'Invitado (Solo lectura/interacción)',
      joinedDate: new Date().toISOString().split('T')[0],
      isGuest: true,
    };
    this.setCurrentUser(guestUser);
    return guestUser;
  },

  logout() {
    this.setCurrentUser(null);
  },
};
