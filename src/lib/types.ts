
export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt?: number;
  lastLogin?: number;
  currentSessionId?: string;
}

export type ExpenseCategory = 'electricity' | 'stock' | 'salary' | 'maintenance' | 'rent' | 'other';

export interface Station {
  id: string;
  name: string;
  type: 'PS3' | 'PS4' | 'PS5';
  ipAddress: string;
  stationIndex: number;
  hdmiIndex?: number;
  status: 'connected' | 'disconnected';
  is_active: boolean;
  is_paused?: boolean;
  start_time: number | null;
  end_time: number | null;
  remaining_seconds?: number | null;
  current_transaction_id: string | null;
  last_action?: string | null;
  last_action_timestamp?: number | null;
  last_heartbeat?: any;
}

export interface Transaction {
  id: string;
  stationId: string;
  stationName: string;
  packageName?: string | null;
  durationMinutes: number;
  amount: number;
  discount: number;
  paidAmount: number;
  timestamp: number;
  status: 'paid' | 'unpaid';
  memberId?: string | null;
  memberName?: string | null;
  shiftId?: string | null;
  isLoyaltyProcessed?: boolean;
  fnbItems: { id: string; name: string; price: number; quantity: number }[];
  additionalCharges: {
    description: string;
    amount: number;
    timestamp: number;
    isPaid?: boolean;
  }[];
  claimCode?: string | null;
}

export interface PointRedemption {
    id: string;
    memberId: string;
    rewardLabel: string;
    pointsRedeemed: number;
    timestamp: number;
    voucherCode?: string | null;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  points: number;
  stamps: number;
  joinDate: number;
  lastActivity?: number;
}

export interface MemberRequest {
    id: string;
    name: string;
    phone: string;
    timestamp: number;
}

export interface Reward {
  id: string;
  label: string;
  points: number;
  type: 'time' | 'item' | 'other';
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  timestamp: number;
  shiftId?: string | null;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  stationId: string;
  stationName: string;
  startTime: number;
  durationMinutes: number;
  status: 'scheduled' | 'checked-in' | 'cancelled';
  createdAt: number;
  dpAmount: number;
}

export interface GeneralSettings {
  storeName: string;
  address: string;
  phone: string;
  themeMode?: 'light' | 'dark' | 'scheduled';
  dayThemeStart?: string;
  nightThemeStart?: string;
  receiptPaperSize?: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

export interface LandingSettings {
  heroHeadline: string;
  heroSubHeadline: string;
  ctaText: string;
  ctaLink: string;
  ctaIcon: string;
  facilities: { icon: string; title: string; description: string }[];
  whatsapp: string;
  instagram: string;
  tiktok: string;
  address?: string;
  googleMapsEmbedUrl?: string;
  latitude?: string;
  longitude?: string;
}

export interface CreditVoucher {
  id: string;
  code: string;
  durationMinutes: number;
  stationType: 'PS3' | 'PS4' | 'PS5' | 'All';
  status: 'active' | 'used';
  usesCount: number;
  createdAt: number;
  claimedAt?: number | null;
  originalTransactionId?: string | null;
  description?: string;
}

export type NotificationType = 'session-ended' | 'shift-closed' | 'low-stock' | 'new-expense' | 'new-reservation';

export interface Notification {
  id: string;
  stationId?: string;
  stationName?: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
  isRead: boolean;
  transactionId?: string | null;
  metadata?: any;
}
