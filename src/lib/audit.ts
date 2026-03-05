import { supabase } from '@/integrations/supabase/client';
import { AuditAction } from '@/types';

interface AuditParams {
  action: AuditAction;
  module: string;
  entityType?: string;
  entityId?: string;
  description: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  userName?: string;
  userRole?: string;
}

export async function logAudit(params: AuditParams) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      user_id: user?.id ?? null,
      user_name: params.userName ?? null,
      user_role: params.userRole ?? null,
      action: params.action,
      module: params.module,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      description: params.description,
      old_values: params.oldValues as any ?? null,
      new_values: params.newValues as any ?? null,
    });
  } catch {
    // Audit failures should not break the app
  }
}
