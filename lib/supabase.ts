import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function logAction(projectId: string, entityType: string, entityId: string, action: string, author: string, oldData?: any, newData?: any, comment?: string) {
  return await supabase.from('audit_logs').insert({
    project_id: projectId,
    entity_type: entityType,
    entity_id: entityId,
    action,
    author,
    old_data: oldData,
    new_data: newData,
    comment
  });
}
