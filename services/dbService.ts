import { supabase } from "./supabase";
import { Product } from "@/types";

export const saveProductToSupabase = async (userId: string, product: Product) => {
  const { error } = await supabase
    .from('products')
    .upsert({
      id: product.id,
      user_id: userId,
      title: product.title,
      brand: product.brand,
      category: product.category,
      cost: product.cost,
      list_price: product.listPrice,
      sold_price: product.soldPrice,
      status: product.status,
      platform: product.platform,
      date_added: product.dateAdded,
      date_sold: product.dateSold,
      image_url: product.imageUrl,
      updated_at: new Date().toISOString()
    });
  if (error) throw error;
};

export const loadProductsFromSupabase = async (userId: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(r => ({
    id: r.id, title: r.title, brand: r.brand, category: r.category,
    cost: Number(r.cost), listPrice: Number(r.list_price), soldPrice: r.sold_price ? Number(r.sold_price) : undefined,
    status: r.status, platform: r.platform, dateAdded: r.date_added, dateSold: r.date_sold, imageUrl: r.image_url
  })) as Product[];
};

export const deleteProductFromSupabase = async (userId: string, productId: string) => {
  const { error } = await supabase.from('products').delete().eq('id', productId).eq('user_id', userId);
  if (error) throw error;
};
