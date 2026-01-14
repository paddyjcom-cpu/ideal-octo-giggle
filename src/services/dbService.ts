import { supabase } from "./supabase";
import { Product } from "../types";

/**
 * Saves or updates a product in the Supabase 'products' table.
 */
export const saveProductToSupabase = async (userId: string, product: Product) => {
  const payload = {
    id: product.id,
    user_id: userId,
    title: product.title,
    brand: product.brand || 'Unknown',
    category: product.category || 'Misc',
    cost: product.cost || 0,
    list_price: product.listPrice || 0,
    sold_price: product.soldPrice ?? null,
    status: product.status,
    platform: product.platform ?? null,
    date_added: product.dateAdded,
    date_sold: product.dateSold ?? null,
    image_url: product.imageUrl ?? null,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('products')
    .upsert(payload);

  if (error) {
    console.error("Supabase Save Error:", error.message);
    throw new Error(`Cloud Sync Failed: ${error.message}`);
  }
};

/**
 * Removes a product from the database.
 */
export const deleteProductFromSupabase = async (userId: string, productId: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
    .eq('user_id', userId);

  if (error) throw error;
};

/**
 * Fetches all products belonging to the logged-in user.
 */
export const loadProductsFromSupabase = async (userId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId)
    .order('date_added', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    brand: row.brand,
    category: row.category,
    cost: Number(row.cost),
    listPrice: Number(row.list_price),
    soldPrice: row.sold_price ? Number(row.sold_price) : undefined,
    status: row.status,
    platform: row.platform,
    dateAdded: row.date_added,
    dateSold: row.date_sold,
    imageUrl: row.image_url,
    description: '' 
  })) as Product[];
};

/**
 * Wipes all records for a specific user (Factory Reset).
 */
export const clearUserSupabaseData = async (userId: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
};
