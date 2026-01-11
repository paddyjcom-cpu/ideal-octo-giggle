import { supabase } from "./supabase";
import { Product } from "../types";

export const saveProductToSupabase = async (userId: string, product: Product) => {
  const { error } = await supabase.from('products').upsert({
    id: product.id, user_id: userId, title: product.title, brand: product.brand, category: product.category,
    cost: product.cost, list_price: product.listPrice, sold_price: product.soldPrice, status: product.status,
    platform: product.platform, date_added: product.dateAdded, date_sold: product.dateSold, image_url: product.imageUrl, updated_at: new Date().toISOString()
  });
  if (error) throw error;
};

export const loadProductsFromSupabase = async (userId: string): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').eq('user_id', userId).order('date_added', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id, title: row.title, brand: row.brand, category: row.category,
    cost: Number(row.cost), listPrice: Number(row.list_price), soldPrice: row.sold_price ? Number(row.sold_price) : undefined,
    status: row.status, platform: row.platform, dateAdded: row.date_added, dateSold: row.date_sold, imageUrl: row.image_url
  })) as Product[];
};

export const deleteProductFromSupabase = async (userId: string, productId: string) => {
  const { error } = await supabase.from('products').delete().eq('id', productId).eq('user_id', userId);
  if (error) throw error;
};

export const clearUserSupabaseData = async (userId: string) => {
  await supabase.from('products').delete().eq('user_id', userId);
};
