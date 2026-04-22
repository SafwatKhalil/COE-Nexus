export type AuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'score_recomputed'
  | 'document_uploaded'
  | 'document_linked'

export interface AuditEvent {
  id: string
  tenantId: string
  actorUserId: string | null
  entityType: string
  entityId: string
  action: AuditAction
  beforeState: Record<string, unknown> | null
  afterState: Record<string, unknown> | null
  createdAt: string
}

export interface AuditEventFilter {
  entityType?: string
  entityId?: string
  actorUserId?: string
  action?: AuditAction
  fromDate?: string
  toDate?: string
}
