export interface UserProfile { id: string; email: string; name: string; tier: string; currency: string; subscriptionActive: boolean; nextRenewalDate: string; monthlySalesCount: number; }
export interface Product { id: string; title: string; brand: string; category: string; cost: number; listPrice: number; soldPrice?: number; status: 'Available' | 'Sold' | 'Draft'; platform?: string; dateAdded: string; dateSold?: string; imageUrl?: string; }
export interface Stats { totalRevenue: number; totalProfit: number; activeListings: number; soldItemsCount: number; }
