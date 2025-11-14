// API client for interacting with Supabase Edge Functions

import { getSupabaseClient } from '$lib/supabase';
import { PUBLIC_USE_MOCK_API } from '$env/static/public';
import { base } from '$app/paths';
import {
  createEventMock,
  getEventByShareIdMock,
  upsertParticipantMock,
  submitVotesMock,
  getEventByEventIdMock,
  deleteEventMock
} from './scheduler.mock';

// Check if we should use mock API
const useMockApi = PUBLIC_USE_MOCK_API === 'true';

export interface CreateEventRequest {
  title: string;
  memo?: string;
  dates: string[]; // YYYY-MM-DD format
}

export interface CreateEventResponse {
  event_id: string;
  share_id: string;
  admin_key: string;
  admin_url: string;
  share_url: string;
}

export interface GetEventResponse {
  event: {
    id: string;
    title: string;
    memo: string | null;
    share_id: string;
    created_at: string;
    updated_at: string;
  };
  options: Array<{
    id: string;
    event_id: string;
    date: string;
    sort_index: number;
  }>;
  participants: Array<{
    id: string;
    nickname: string;
  }>;
  votes: Array<{
    id: string;
    option_id: string;
    participant_id: string;
    value: number;
  }>;
}

export interface UpsertParticipantRequest {
  nickname: string;
  device_hash: string;
  participant_token?: string;
}

export interface UpsertParticipantResponse {
  participant_id: string;
  participant_token: string;
  nickname: string;
}

export interface SubmitVotesRequest {
  participant_id: string;
  votes: Array<{
    option_id: string;
    value: number;
  }>;
}

/**
 * Create a new event
 */
export async function createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
  let response: CreateEventResponse;

  if (useMockApi) {
    response = await createEventMock(data);
  } else {
    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase.functions.invoke('create-event', {
      body: {
        ...data,
        base_path: base // Send base path to server
      }
    });

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    response = result;
  }

  // Ensure URLs include base path (fallback in case server didn't include it)
  if (base && response.admin_url) {
    try {
      const adminUrlObj = new URL(response.admin_url);
      if (!adminUrlObj.pathname.startsWith(base)) {
        adminUrlObj.pathname = base + adminUrlObj.pathname;
        response.admin_url = adminUrlObj.toString();
      }
    } catch {
      // Invalid URL, skip
    }
  }
  if (base && response.share_url) {
    try {
      const shareUrlObj = new URL(response.share_url);
      if (!shareUrlObj.pathname.startsWith(base)) {
        shareUrlObj.pathname = base + shareUrlObj.pathname;
        response.share_url = shareUrlObj.toString();
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return response;
}

/**
 * Get event by share ID
 */
export async function getEventByShareId(shareId: string): Promise<GetEventResponse> {
  if (useMockApi) {
    return getEventByShareIdMock(shareId);
  }

  const supabase = getSupabaseClient();
  const { data: response, error } = await supabase.functions.invoke(`get-event/${shareId}`, {
    method: 'GET'
  });

  if (error) {
    throw new Error(`Failed to get event: ${error.message}`);
  }

  return response;
}

/**
 * Upsert participant
 */
export async function upsertParticipant(
  shareId: string,
  data: UpsertParticipantRequest
): Promise<UpsertParticipantResponse> {
  if (useMockApi) {
    return upsertParticipantMock(shareId, data);
  }

  const supabase = getSupabaseClient();
  const { data: response, error } = await supabase.functions.invoke(
    `upsert-participant/events/${shareId}/participants`,
    {
      body: data
    }
  );

  if (error) {
    throw new Error(`Failed to upsert participant: ${error.message}`);
  }

  return response;
}

/**
 * Submit votes
 */
export async function submitVotes(
  shareId: string,
  data: SubmitVotesRequest
): Promise<void> {
  if (useMockApi) {
    return submitVotesMock(shareId, data);
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.functions.invoke(
    `submit-votes/events/${shareId}/votes`,
    {
      body: data
    }
  );

  if (error) {
    throw new Error(`Failed to submit votes: ${error.message}`);
  }
}

export interface EventStats {
  totalParticipants: number;
  totalVotes: number;
  optionStats: Array<{
    option_id: string;
    date: string;
    yes: number;
    maybe: number;
    no: number;
    score: number;
  }>;
}

/**
 * Get event statistics (uses getEventByShareId and calculates stats)
 */
export async function getEventStats(shareId: string): Promise<EventStats> {
  const eventData = await getEventByShareId(shareId);

  // Calculate statistics from event data
  const stats: EventStats = {
    totalParticipants: eventData.participants.length,
    totalVotes: eventData.votes.length,
    optionStats: eventData.options.map(option => {
      const optionVotes = eventData.votes.filter(v => v.option_id === option.id);
      const yes = optionVotes.filter(v => v.value === 2).length;
      const maybe = optionVotes.filter(v => v.value === 1).length;
      const no = optionVotes.filter(v => v.value === 0).length;

      return {
        option_id: option.id,
        date: option.date,
        yes,
        maybe,
        no,
        score: yes * 2 + maybe
      };
    }).sort((a, b) => b.score - a.score)
  };

  return stats;
}

/**
 * Get event by event ID (admin only - requires admin key)
 */
export async function getEventByEventId(
  eventId: string,
  adminKey: string
): Promise<GetEventResponse> {
  if (useMockApi) {
    return getEventByEventIdMock(eventId, adminKey);
  }

  const supabase = getSupabaseClient();
  const { data: response, error } = await supabase.functions.invoke(
    `get-event-admin/${eventId}`,
    {
      method: 'GET',
      headers: {
        'X-Admin-Key': adminKey
      }
    }
  );

  if (error) {
    throw new Error(`Failed to get event: ${error.message}`);
  }

  return response;
}

/**
 * Delete event (admin only - requires admin key)
 */
export async function deleteEvent(eventId: string, adminKey: string): Promise<void> {
  if (useMockApi) {
    return deleteEventMock(eventId, adminKey);
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.functions.invoke(`delete-event/${eventId}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Key': adminKey
    }
  });

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }
}


