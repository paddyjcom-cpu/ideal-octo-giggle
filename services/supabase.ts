import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ufzeimniqplvniflycmg.supabase.co/';
const supabaseKey = 'YOUR_SUPABASE_KEY_HERE';
export const supabase = createClient(supabaseUrl, supabaseKey);
