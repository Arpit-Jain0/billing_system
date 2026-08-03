import { supabase } from './supabase';

/**
 * Helper function to query saree schema tables
 * Usage: db.from('table_name').select('*')
 */
export const db = {
  from: (tableName: string) => {
    return supabase.schema('saree').from(tableName);
  },
};

export default db;
