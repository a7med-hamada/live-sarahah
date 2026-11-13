export interface UserProfile {
  id: string;
  username: string; // e.g. "nexon"
  password?: string;
  email?: string;
  displayName: string; // e.g. "Nexon"
  bigTitle: string; // e.g. "Nexon Live"
  avatarUrl: string; // profile picture URL or base64
  subtitle: string; // "ابعتلي أي حاجة في دماغك من غير اسم..."
  topicTitle: string; // "مشاكل عاطفية"
  topicNotice: string; // "أي رسالة برا الموضوع ده، أو سؤال عن الشغل، مش هتظهر في اللايف 👀"
  isLive: boolean;
  liveBadgeText: string; // "• LIVE"
  activeOverlayMessageId?: string | null;
  createdAt: number;
}

export interface AnonymousMessage {
  id: string;
  recipientUsername: string;
  content: string;
  createdAt: number;
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
