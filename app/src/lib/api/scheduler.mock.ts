// Mock implementation for Scheduler API

import type {
  CreateEventRequest,
  CreateEventResponse,
  GetEventResponse,
  UpsertParticipantRequest,
  UpsertParticipantResponse,
  SubmitVotesRequest
} from './scheduler';

// Helper functions for ID generation (mock only)
function generateId(): string {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function generateShortId(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

/**
 * Mock: Create a new event
 */
export function createEventMock(data: CreateEventRequest): Promise<CreateEventResponse> {
  console.log('[MOCK API] Creating event:', data);
  
  const mockEventId = generateId();
  const mockShareId = generateShortId();
  const mockAdminKey = generateId();
  
  return Promise.resolve({
    event_id: mockEventId,
    share_id: mockShareId,
    admin_key: mockAdminKey,
    admin_url: `${window.location.origin}/scheduler/e/${mockEventId}?k=${mockAdminKey}`,
    share_url: `${window.location.origin}/scheduler/s/${mockShareId}`
  });
}

/**
 * Mock: Get event by share ID
 */
export function getEventByShareIdMock(shareId: string): Promise<GetEventResponse> {
  console.log('[MOCK API] Getting event:', shareId);
  
  return Promise.resolve({
    event: {
      id: generateId(),
      title: 'モックイベント',
      memo: 'これはモックデータです',
      share_id: shareId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    options: [
      { id: '1', event_id: '1', date: '2024-12-01', sort_index: 0 },
      { id: '2', event_id: '1', date: '2024-12-02', sort_index: 1 },
      { id: '3', event_id: '1', date: '2024-12-03', sort_index: 2 }
    ],
    participants: [
      { id: 'p1', nickname: '太郎' },
      { id: 'p2', nickname: '花子' }
    ],
    votes: [
      { id: 'v1', option_id: '1', participant_id: 'p1', value: 2 },
      { id: 'v2', option_id: '2', participant_id: 'p1', value: 1 },
      { id: 'v3', option_id: '3', participant_id: 'p1', value: 0 },
      { id: 'v4', option_id: '1', participant_id: 'p2', value: 2 },
      { id: 'v5', option_id: '2', participant_id: 'p2', value: 2 },
      { id: 'v6', option_id: '3', participant_id: 'p2', value: 1 }
    ]
  });
}

/**
 * Mock: Upsert participant
 */
export function upsertParticipantMock(
  shareId: string,
  data: UpsertParticipantRequest
): Promise<UpsertParticipantResponse> {
  console.log('[MOCK API] Upserting participant:', shareId, data);
  
  return Promise.resolve({
    participant_id: generateId(),
    participant_token: generateId(),
    nickname: data.nickname
  });
}

/**
 * Mock: Submit votes
 */
export function submitVotesMock(shareId: string, data: SubmitVotesRequest): Promise<void> {
  console.log('[MOCK API] Submitting votes:', shareId, data);
  return Promise.resolve();
}

/**
 * Mock: Get event by event ID (admin)
 */
export function getEventByEventIdMock(
  eventId: string,
  adminKey: string
): Promise<GetEventResponse> {
  console.log('[MOCK API] Getting event by ID (admin):', eventId, adminKey);
  
  return Promise.resolve({
    event: {
      id: eventId,
      title: 'チーム飲み会',
      memo: '新宿駅周辺で、19時頃から',
      share_id: 'ABC123XYZ',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    options: [
      { id: 'opt1', event_id: eventId, date: '2025-11-15', sort_index: 0 },
      { id: 'opt2', event_id: eventId, date: '2025-11-16', sort_index: 1 },
      { id: 'opt3', event_id: eventId, date: '2025-11-17', sort_index: 2 }
    ],
    participants: [
      { id: 'p1', nickname: '山田' },
      { id: 'p2', nickname: '佐藤' }
    ],
    votes: [
      { id: 'v1', option_id: 'opt1', participant_id: 'p1', value: 2 },
      { id: 'v2', option_id: 'opt2', participant_id: 'p1', value: 1 },
      { id: 'v3', option_id: 'opt1', participant_id: 'p2', value: 2 },
      { id: 'v4', option_id: 'opt3', participant_id: 'p2', value: 0 }
    ]
  });
}

/**
 * Mock: Delete event (admin)
 */
export function deleteEventMock(eventId: string, adminKey: string): Promise<void> {
  console.log('[MOCK API] Deleting event:', eventId, adminKey);
  return Promise.resolve();
}

