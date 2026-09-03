export interface ObjectDto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export const SOCKET_EVENTS = {
  OBJECT_CREATED: 'object.created',
  OBJECT_DELETED: 'object.deleted',
} as const;

export interface ObjectDeletedPayload {
  id: string;
}
