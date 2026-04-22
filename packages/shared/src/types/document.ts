export type DocumentEntityType = 'site' | 'permit' | 'utility' | 'task' | 'parcel'

export interface Document {
  id: string
  tenantId: string
  fileName: string | null
  storageKey: string | null
  mimeType: string | null
  fileSize: number | null
  documentType: string | null
  uploadedById: string | null
  createdAt: string
}

export interface DocumentLink {
  id: string
  documentId: string
  entityType: DocumentEntityType
  entityId: string
  createdAt: string
  document?: Document
}

export interface CreateDocumentLinkDto {
  entityType: DocumentEntityType
  entityId: string
}
