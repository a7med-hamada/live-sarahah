import fs from 'fs';
import path from 'path';
import { UserProfile, AnonymousMessage } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  users: Record<string, UserProfile>;
  messages: AnonymousMessage[];
}

function initDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: {},
      messages: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = {};
    if (!parsed.messages) parsed.messages = [];
    return parsed;
  } catch (err) {
    console.error('Error reading database, resetting:', err);
    const initialData: DatabaseSchema = {
      users: {},
      messages: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const Storage = {
  // Users
  getUserByUsername(username: string): UserProfile | null {
    const db = initDb();
    const clean = username.toLowerCase().trim();
    return db.users[clean] || null;
  },

  getAllUsers(): UserProfile[] {
    const db = initDb();
    return Object.values(db.users);
  },

  saveUser(profile: UserProfile): UserProfile {
    const db = initDb();
    const clean = profile.username.toLowerCase().trim();
    db.users[clean] = profile;
    saveDb(db);
    return profile;
  },

  updateUserProfile(username: string, updates: Partial<UserProfile>): UserProfile | null {
    const db = initDb();
    const clean = username.toLowerCase().trim();
    if (!db.users[clean]) return null;
    db.users[clean] = { ...db.users[clean], ...updates };
    saveDb(db);
    return db.users[clean];
  },

  deleteUser(username: string): boolean {
    const db = initDb();
    const clean = username.toLowerCase().trim();
    if (db.users[clean]) {
      delete db.users[clean];
      db.messages = db.messages.filter((m) => m.recipientUsername.toLowerCase() !== clean);
      saveDb(db);
      return true;
    }
    return false;
  },

  // Messages
  getMessagesForUser(username: string): AnonymousMessage[] {
    const db = initDb();
    const clean = username.toLowerCase().trim();
    return db.messages
      .filter((m) => m.recipientUsername.toLowerCase() === clean)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  getMessageById(messageId: string): AnonymousMessage | null {
    const db = initDb();
    return db.messages.find((m) => m.id === messageId) || null;
  },

  addMessage(recipientUsername: string, content: string): AnonymousMessage {
    const db = initDb();
    const clean = recipientUsername.toLowerCase().trim();
    const newMessage: AnonymousMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      recipientUsername: clean,
      content: content.trim(),
      createdAt: Date.now(),
      isRead: false,
      isPinned: false,
      isArchived: false,
    };
    db.messages.unshift(newMessage);
    saveDb(db);
    return newMessage;
  },

  updateMessage(messageId: string, updates: Partial<AnonymousMessage>): boolean {
    const db = initDb();
    const idx = db.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return false;
    db.messages[idx] = { ...db.messages[idx], ...updates };
    saveDb(db);
    return true;
  },

  deleteMessage(messageId: string): boolean {
    const db = initDb();
    const initialLen = db.messages.length;
    db.messages = db.messages.filter((m) => m.id !== messageId);
    if (db.messages.length !== initialLen) {
      saveDb(db);
      return true;
    }
    return false;
  },

  setActiveOverlayMessage(username: string, messageId: string | null): boolean {
    const db = initDb();
    const clean = username.toLowerCase().trim();
    if (!db.users[clean]) return false;
    db.users[clean].activeOverlayMessageId = messageId;
    saveDb(db);
    return true;
  }
};
