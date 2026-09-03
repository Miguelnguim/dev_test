import type { HeyamaObject } from '@/types/object';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.message ?? 'Something went wrong. Please try again.';
  } catch {
    return 'Something went wrong. Please try again.';
  }
}

export async function fetchObjects(): Promise<HeyamaObject[]> {
  const response = await fetch(`${API_URL}/objects`, { cache: 'no-store' });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return response.json();
}

export async function fetchObject(id: string): Promise<HeyamaObject> {
  const response = await fetch(`${API_URL}/objects/${id}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return response.json();
}

export async function createObject(formData: FormData): Promise<HeyamaObject> {
  const response = await fetch(`${API_URL}/objects`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return response.json();
}

export async function deleteObject(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/objects/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }
}
