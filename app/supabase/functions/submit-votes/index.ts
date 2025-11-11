import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse, errorResponse, parseJsonBody, validateRequired, checkRateLimit } from '../_shared/utils.ts';

interface SubmitVotesRequest {
  participant_id: string;
  votes: Array<{
    option_id: string;
    value: number;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }
  
  try {
    // Extract shareId from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const shareIdIndex = pathParts.indexOf('events') + 1;
    const shareId = pathParts[shareIdIndex];
    
    if (!shareId) {
      return errorResponse('Share ID is required');
    }
    
    // Rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `submit-votes:${clientIp}:${shareId}`;
    if (!checkRateLimit(rateLimitKey, 20, 60000)) {
      return errorResponse('Rate limit exceeded. Please try again later.', 429);
    }
    
    // Parse and validate request
    const body = await parseJsonBody<SubmitVotesRequest>(req);
    validateRequired(body, ['participant_id', 'votes']);
    
    const { participant_id, votes } = body;
    
    // Validate votes array
    if (!Array.isArray(votes)) {
      return errorResponse('Votes must be an array');
    }
    
    // Validate vote values
    for (const vote of votes) {
      if (![0, 1, 2].includes(vote.value)) {
        return errorResponse(`Invalid vote value: ${vote.value}. Must be 0, 1, or 2`);
      }
    }
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get event by share_id
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('share_id', shareId)
      .single();
    
    if (eventError || !event) {
      return errorResponse('Event not found', 404);
    }
    
    // Verify participant belongs to this event
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id')
      .eq('id', participant_id)
      .eq('event_id', event.id)
      .single();
    
    if (participantError || !participant) {
      return errorResponse('Participant not found', 404);
    }
    
    // Upsert votes (one by one to handle unique constraint)
    for (const vote of votes) {
      // Check if option belongs to this event
      const { data: option } = await supabase
        .from('options')
        .select('id')
        .eq('id', vote.option_id)
        .eq('event_id', event.id)
        .single();
      
      if (!option) {
        console.warn(`Option ${vote.option_id} not found for event ${event.id}`);
        continue;
      }
      
      // Upsert vote
      const { error: voteError } = await supabase
        .from('votes')
        .upsert({
          event_id: event.id,
          option_id: vote.option_id,
          participant_id,
          value: vote.value
        }, {
          onConflict: 'option_id,participant_id'
        });
      
      if (voteError) {
        console.error('Vote upsert error:', voteError);
        // Continue with other votes even if one fails
      }
    }
    
    return jsonResponse({
      success: true,
      message: 'Votes submitted successfully'
    });
    
  } catch (error) {
    console.error('Submit votes error:', error);
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Internal server error', 500);
  }
});

