import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse, errorResponse, hashString } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // Extract eventId from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const eventId = pathParts[pathParts.length - 1];

    if (!eventId) {
      return errorResponse('Event ID is required');
    }

    // Get admin key from header
    const adminKey = req.headers.get('X-Admin-Key');
    if (!adminKey) {
      return errorResponse('Admin key is required', 401);
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get event by ID
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, memo, share_id, admin_key_hash, created_at, updated_at')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return errorResponse('Event not found', 404);
    }

    // Verify admin key
    const adminKeyHash = await hashString(adminKey);
    if (adminKeyHash !== event.admin_key_hash) {
      return errorResponse('Invalid admin key', 403);
    }

    // Get options
    const { data: options, error: optionsError } = await supabase
      .from('options')
      .select('id, event_id, date, sort_index')
      .eq('event_id', event.id)
      .order('sort_index');

    if (optionsError) {
      console.error('Options fetch error:', optionsError);
      return errorResponse('Failed to fetch options', 500);
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id, nickname')
      .eq('event_id', event.id)
      .order('created_at');

    if (participantsError) {
      console.error('Participants fetch error:', participantsError);
      return errorResponse('Failed to fetch participants', 500);
    }

    // Get votes
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('id, option_id, participant_id, value')
      .eq('event_id', event.id);

    if (votesError) {
      console.error('Votes fetch error:', votesError);
      return errorResponse('Failed to fetch votes', 500);
    }

    // Remove admin_key_hash from response
    const { admin_key_hash, ...eventData } = event;

    // Return combined data
    return jsonResponse({
      event: eventData,
      options: options || [],
      participants: participants || [],
      votes: votes || []
    });

  } catch (error) {
    console.error('Get event admin error:', error);
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Internal server error', 500);
  }
});

