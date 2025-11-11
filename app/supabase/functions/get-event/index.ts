import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse, errorResponse } from '../_shared/utils.ts';

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
    // Extract shareId from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const shareId = pathParts[pathParts.length - 1];
    
    if (!shareId) {
      return errorResponse('Share ID is required');
    }
    
    // Initialize Supabase client with anon key (read-only)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get event by share_id
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, memo, share_id, created_at, updated_at')
      .eq('share_id', shareId)
      .single();
    
    if (eventError || !event) {
      return errorResponse('Event not found', 404);
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
    
    // Return combined data
    return jsonResponse({
      event,
      options: options || [],
      participants: participants || [],
      votes: votes || []
    });
    
  } catch (error) {
    console.error('Get event error:', error);
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Internal server error', 500);
  }
});

