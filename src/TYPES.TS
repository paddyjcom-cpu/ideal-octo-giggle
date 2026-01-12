export type SubscriptionTier = 'Free' | 'Starter' | 'Growth';
export interface UserProfile { id: string; email: string; name: string; tier: SubscriptionTier; subscriptionActive: boolean; currency: string; }
export interface Product { id: string; title: string; brand: string; category: string; cost: number; listPrice: number; soldPrice?: number; status: 'Available' | 'Sold' | 'Draft'; platform?: string; dateAdded: string; dateSold?: string; imageUrl?: string; description?: string; }
export interface Stats { totalRevenue: number; totalProfit: number; activeListings: number; soldItemsCount: number; }
