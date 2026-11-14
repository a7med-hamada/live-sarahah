import fs from 'fs';
import path from 'path';
import os from 'os';
import { UserProfile, AnonymousMessage } from './types';

interface DatabaseSchema {
  users: Record<string, UserProfile>;
  messages: AnonymousMessage[];
}

declare global {
  // eslint-disable-next-line no-var
  var __LIVE_DB_CACHE__: DatabaseSchema | undefined;
}

function getUpstashConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return { url: url.replace(/\/$/, ''), token };
  }
  return null;
}

// Safely determine writable file path for Vercel / serverless / local
function resolveDbPath(): { runtimePath: string; seedPath: string } {
  const seedPath = path.join(process.cwd(), 'data', 'database.json');

  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.cwd().startsWith('/var/task');

  if (isServerless) {
    return {
      runtimePath: path.join(os.tmpdir(), 'live_db_v2.json'),
      seedPath,
    };
  }

  // Local test
  try {
    const localDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, '.write_check');
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    return {
      runtimePath: path.join(localDir, 'database.json'),
      seedPath,
    };
  } catch {
    // If local directory is not writable (EROFS), fallback to tmpdir
    return {
      runtimePath: path.join(os.tmpdir(), 'live_db_v2.json'),
      seedPath,
    };
  }
}

function initDb(): DatabaseSchema {
  // 1. Fast in-memory cache
  if (globalThis.__LIVE_DB_CACHE__) {
    return globalThis.__LIVE_DB_CACHE__;
  }

  const { runtimePath, seedPath } = resolveDbPath();

  // 2. Try loading from runtimePath (e.g. /tmp/live_database.json)
  if (fs.existsSync(runtimePath)) {
    try {
      const raw = fs.readFileSync(runtimePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.users) parsed.users = {};
      if (!parsed.messages) parsed.messages = [];
      globalThis.__LIVE_DB_CACHE__ = parsed;
      return parsed;
    } catch (e) {
      console.warn('Error reading runtime DB, will try seed:', e);
    }
  }

  // 3. Fallback to bundled seed database if available
  let initialData: DatabaseSchema = { users: {}, messages: [] };
  if (fs.existsSync(seedPath)) {
    try {
      const raw = fs.readFileSync(seedPath, 'utf-8');
      initialData = JSON.parse(raw);
      if (!initialData.users) initialData.users = {};
      if (!initialData.messages) initialData.messages = [];
    } catch (e) {
      console.warn('Error reading seed DB:', e);
    }
  }

  // 4. Save to runtimePath for subsequent writes
  try {
    const dir = path.dirname(runtimePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(runtimePath, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write initial DB to disk (continuing in-memory):', err);
  }

  globalThis.__LIVE_DB_CACHE__ = initialData;

  // 5. Trigger cloud sync in background if cloud storage is configured
  if (getUpstashConfig()) {
    Storage.syncFromCloud().catch(() => {});
  }

  return initialData;
}

function saveDb(data: DatabaseSchema): void {
  globalThis.__LIVE_DB_CACHE__ = data;
  const { runtimePath } = resolveDbPath();
  try {
    const dir = path.dirname(runtimePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(runtimePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to persist DB to disk (data safely held in memory cache):', err);
  }

  // Cloud Persistence via Upstash Redis / Vercel KV REST API
  const upstash = getUpstashConfig();
  if (upstash) {
    try {
      fetch(`${upstash.url}/set/live_database_v3`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstash.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(data)),
      }).catch((err) => console.error('Upstash async persistence error:', err));
    } catch (e) {
      console.warn('Upstash fetch failed:', e);
    }
  }
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
  },

  async syncFromCloud(): Promise<boolean> {
    const upstash = getUpstashConfig();
    if (!upstash) return false;
    try {
      const res = await fetch(`${upstash.url}/get/live_database_v3`, {
        headers: { Authorization: `Bearer ${upstash.token}` },
      });
      const data = await res.json();
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        if (parsed && parsed.users) {
          globalThis.__LIVE_DB_CACHE__ = parsed;
          const { runtimePath } = resolveDbPath();
          try {
            fs.writeFileSync(runtimePath, JSON.stringify(parsed, null, 2), 'utf-8');
          } catch {}
          return true;
        }
      }
    } catch (err) {
      console.warn('Failed to sync from Upstash:', err);
    }
    return false;
  },
};
