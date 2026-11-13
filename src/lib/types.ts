export interface CardCustomization {
  messageFontSize?: number; // 14 to 40 px (default 20)
  nameFontSize?: number; // 11 to 26 px (default 14)
  footerFontSize?: number; // 10 to 18 px (default 12)
  avatarSize?: number; // 18 to 50 px (default 28)
  showAvatar?: boolean; // default true
  showName?: boolean; // default true
  cardHeaderName?: string; // custom name in card
  textAlign?: 'right' | 'center' | 'left'; // default 'right'
  badgeText?: string; // default "رسالة مجهولة 💌"
}

export interface UserProfile {
  id: string;
  username: string; // e.g. "ahmed"
  password?: string;
  email?: string;
  displayName: string; // e.g. "Ahmed"
  bigTitle: string; // e.g. "Ahmed Live"
  avatarUrl: string; // profile picture URL or base64
  subtitle: string; // "ابعتلي أي حاجة في دماغك من غير اسم..."
  topicTitle: string; // "مشاكل عاطفية"
  topicNotice: string; // "أي رسالة برا الموضوع ده، أو سؤال عن الشغل، مش هتظهر في اللايف 👀"
  isLive: boolean;
  liveBadgeText: string; // "• LIVE"
  activeOverlayMessageId?: string | null;
  cardCustomization?: CardCustomization;
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
