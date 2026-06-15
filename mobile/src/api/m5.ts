import { api } from './client';
import type { components } from './generated/types';

export type ApiErrorLike = { status: number; detail: string };
export type ProOut = components['schemas']['ProOut'];
export type ServiceAreaIn = components['schemas']['ServiceAreaIn'];
export type KraftIn = components['schemas']['KraftIn'];
export type KraftOut = components['schemas']['KraftOut'];
export type BroadcastIn = components['schemas']['BroadcastIn'];
export type BroadcastOut = components['schemas']['BroadcastOut'];
export type HomeAccountOut = components['schemas']['HomeAccountOut'];
export type HomeJobOut = components['schemas']['HomeJobOut'];
export type NotifPrefOut = components['schemas']['NotifPrefOut'];

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
  }
}

function detailOf(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'detail' in error &&
    typeof (error as { detail: unknown }).detail === 'string'
  ) {
    return (error as { detail: string }).detail;
  }
  return fallback;
}

function unwrap<T>(
  data: T | undefined,
  error: unknown,
  status: number,
  fallback: string,
): T {
  if (!data) {
    throw new ApiError(status, detailOf(error, fallback));
  }
  return data;
}

export async function listPros(): Promise<ProOut[]> {
  const { data, error, response } = await api.GET('/api/pros');
  return unwrap(data, error, response.status, 'Failed to load pros.');
}

export async function getMyProProfile(): Promise<ProOut> {
  const { data, error, response } = await api.GET('/api/pros/me');
  return unwrap(data, error, response.status, 'Failed to load pro profile.');
}

export async function updateServiceArea(
  body: ServiceAreaIn,
): Promise<ProOut> {
  const { data, error, response } = await api.PATCH(
    '/api/pros/me/service-area',
    { body },
  );
  return unwrap(data, error, response.status, 'Failed to update service area.');
}

export async function createKraft(body: KraftIn): Promise<KraftOut> {
  const { data, error, response } = await api.POST('/api/krafts', { body });
  return unwrap(data, error, response.status, 'Failed to create Kraft.');
}

export async function publishKraft(id: number): Promise<KraftOut> {
  const { data, error, response } = await api.POST(
    '/api/krafts/{kraft_id}/publish',
    { params: { path: { kraft_id: id } } },
  );
  return unwrap(data, error, response.status, 'Failed to publish Kraft.');
}

export async function createBroadcast(
  body: BroadcastIn,
): Promise<BroadcastOut> {
  const { data, error, response } = await api.POST('/api/emergencies', {
    body,
  });
  return unwrap(data, error, response.status, 'Failed to create emergency.');
}

export async function listOpenBroadcasts(): Promise<BroadcastOut[]> {
  const { data, error, response } = await api.GET('/api/emergencies/open');
  return unwrap(data, error, response.status, 'Failed to load emergencies.');
}

export async function claimBroadcast(id: number): Promise<BroadcastOut> {
  const { data, error, response } = await api.POST(
    '/api/emergencies/{broadcast_id}/claim',
    { params: { path: { broadcast_id: id } } },
  );
  return unwrap(data, error, response.status, 'Failed to claim emergency.');
}

export async function getHomeAccount(): Promise<HomeAccountOut> {
  const { data, error, response } = await api.GET('/api/home/account');
  return unwrap(data, error, response.status, 'Failed to load account.');
}

export async function listHomeJobs(): Promise<HomeJobOut[]> {
  const { data, error, response } = await api.GET('/api/home/jobs');
  return unwrap(data, error, response.status, 'Failed to load jobs.');
}

export async function listSavedPros(): Promise<ProOut[]> {
  const { data, error, response } = await api.GET('/api/home/saved-pros');
  return unwrap(data, error, response.status, 'Failed to load saved pros.');
}

export async function savePro(id: number): Promise<void> {
  const { data, error, response } = await api.POST(
    '/api/home/saved-pros/{pro_id}',
    { params: { path: { pro_id: id } } },
  );
  unwrap(data, error, response.status, 'Failed to save pro.');
}

export async function getNotifPrefs(): Promise<NotifPrefOut> {
  const { data, error, response } = await api.GET('/api/me/notif-prefs');
  return unwrap(data, error, response.status, 'Failed to load preferences.');
}

export async function updateNotifPrefs(
  body: Partial<NotifPrefOut>,
): Promise<NotifPrefOut> {
  const { data, error, response } = await api.PATCH('/api/me/notif-prefs', {
    body,
  });
  return unwrap(data, error, response.status, 'Failed to update preferences.');
}
