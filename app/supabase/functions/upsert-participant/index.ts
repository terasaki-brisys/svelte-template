import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse, errorResponse, parseJsonBody, validateRequired, checkRateLimit } from '../_shared/utils.ts';

interface UpsertParticipantRequest {
  nickname: string;
  device_hash: string;
  participant_token?: string;
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
    const rateLimitKey = `upsert-participant:${clientIp}:${shareId}`;
    if (!checkRateLimit(rateLimitKey, 10, 60000)) {
      return errorResponse('Rate limit exceeded. Please try again later.', 429);
    }
    
    // Parse and validate request
    const body = await parseJsonBody<UpsertParticipantRequest>(req);
    validateRequired(body, ['nickname', 'device_hash']);
    
    const { nickname, device_hash, participant_token } = body;
    
    // Validate nickname
    if (nickname.length < 1 || nickname.length > 16) {
      return errorResponse('Nickname must be between 1 and 16 characters');
    }
    
    // Validate device_hash
    if (device_hash.length < 32) {
      return errorResponse('Invalid device hash');
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
    
    // Check if participant already exists with this device_hash
    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('id, nickname')
      .eq('event_id', event.id)
      .eq('device_hash', device_hash)
      .single();
    
    if (existingParticipant) {
      // Update existing participant's nickname
      const { data: updated, error: updateError } = await supabase
        .from('participants')
        .update({ nickname })
        .eq('id', existingParticipant.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Participant update error:', updateError);
        return errorResponse('Failed to update participant', 500);
      }
      
      // Generate new participant token
      const newToken = crypto.randomUUID();
      
      return jsonResponse({
        participant_id: updated.id,
        participant_token: newToken,
        nickname: updated.nickname
      });
    }
    
    // Handle nickname collision (append number if needed)
    let finalNickname = nickname;
    let suffix = 1;
    while (true) {
      const { data: collision } = await supabase
        .from('participants')
        .select('id')
        .eq('event_id', event.id)
        .eq('nickname', finalNickname)
        .single();
      
      if (!collision) break;
      
      suffix++;
      finalNickname = `${nickname}${suffix}`;
      
      if (suffix > 100) {
        return errorResponse('Too many participants with similar nicknames');
      }
    }
    
    // Create new participant
    const { data: newParticipant, error: insertError } = await supabase
      .from('participants')
      .insert({
        event_id: event.id,
        nickname: finalNickname,
        device_hash
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Participant insert error:', insertError);
      return errorResponse('Failed to create participant', 500);
    }
    
    // Generate participant token
    const token = crypto.randomUUID();
    
    return jsonResponse({
      participant_id: newParticipant.id,
      participant_token: token,
      nickname: newParticipant.nickname
    }, 201);
    
  } catch (error) {
    console.error('Upsert participant error:', error);
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Internal server error', 500);
  }
});

