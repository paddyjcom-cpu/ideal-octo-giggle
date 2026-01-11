export type SubscriptionTier = 'Free' | 'Starter' | 'Growth';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tier: SubscriptionTier;
  monthlySalesCount: number;
  subscriptionActive: boolean;
  nextRenewalDate: string;
  currency: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  cost: number;
  listPrice: number;
  soldPrice?: number;
  status: 'Available' | 'Sold' | 'Draft';
  platform?: 'eBay' | 'Depop' | 'Vinted' | 'Grailed' | 'Poshmark' | 'Other';
  dateAdded: string;
  dateSold?: string;
  imageUrl?: string;
}

export interface Stats {
  totalRevenue: number;
  totalProfit: number;
  activeListings: number;
  soldItemsCount: number;
}
