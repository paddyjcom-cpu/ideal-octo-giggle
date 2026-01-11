import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ufzeimniqplvniflycmg.supabase.co/';
const supabaseKey = 'sb_publishable_mGzTyDJomZDJngwTKbdYQw_d5E0iJx3';
export const supabase = createClient(supabaseUrl, supabaseKey);
