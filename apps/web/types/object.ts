export interface HeyamaObject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export const SOCKET_EVENTS = {
  OBJECT_CREATED: 'object.created',
  OBJECT_UPDATED: 'object.updated',
  OBJECT_DELETED: 'object.deleted',
} as const;
