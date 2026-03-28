export interface ActivityResponse {
  id: string;
  actorName: string;
  actorPicture: string | null;
  actionType: string;
  entityType: string;
  entityId: string;
  entityName: string;
  metadata: string | null;
  createdAt: string;
} 