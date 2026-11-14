export interface CardCustomization {
  messageFontSize?: number; // 14 to 42 px (default 26)
  nameFontSize?: number; // 11 to 28 px (default 15)
  footerFontSize?: number; // 9 to 18 px (default 12)
  avatarSize?: number; // 18 to 52 px (default 28)
  showAvatar?: boolean; // default true
  showName?: boolean; // default true
  cardHeaderName?: string; // custom name in card
  textAlign?: 'right' | 'center' | 'left'; // default 'right'
  badgeText?: string; // default "رسالة مجهولة 💌"

  // Colors & Transparency
  bgType?: 'solid' | 'transparent' | 'glass'; // default 'transparent'
  bgColor?: string; // hex color e.g. '#000000', '#0f1117'
  bgOpacity?: number; // 0 to 100 (%) default 0 (0 = 100% شفاف)
  messageColor?: string; // hex color e.g. '#ffffff'
  nameColor?: string; // hex color e.g. '#ffffff'
  footerColor?: string; // hex color e.g. '#67e8f9'
  borderTheme?: 'tiktok' | 'cyan' | 'purple' | 'gold' | 'neonGreen' | 'red' | 'white' | 'custom' | 'transparent'; // default 'tiktok'
  customBorderColor?: string; // custom hex e.g. '#00f2fe'
  borderWidth?: number; // 1 to 6 px (default 3.5)

  // Divider Lines (الخطين الفاصلين الأسودين)
  showDividers?: boolean; // default true
  dividerColor?: string; // default '#000000'
  dividerThickness?: number; // 1 to 6 px (default 2)
  dividerOpacity?: number; // 10 to 100 (%) default 85

  // Pure Transparent Blur (درجة البلور الضبابي الشفاف)
  blurAmount?: number; // 0 to 35 px (default 0)
}

export interface UserProfile {
  id: string;
  username: string; // e.g. "ahmedd"
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
