import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse, errorResponse, parseJsonBody, validateRequired, generateBase62Id, generateRandomHex, hashString } from '../_shared/utils.ts';

interface CreateEventRequest {
  title: string;
  memo?: string;
  dates: string[]; // YYYY-MM-DD
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
    // Parse and validate request
    const body = await parseJsonBody<CreateEventRequest>(req);
    validateRequired(body, ['title', 'dates']);
    
    const { title, memo, dates } = body;
    
    // Validate title length
    if (title.length > 200) {
      return errorResponse('Title must be 200 characters or less');
    }
    
    // Validate dates
    if (!Array.isArray(dates) || dates.length === 0) {
      return errorResponse('At least one date is required');
    }
    
    if (dates.length > 7) {
      return errorResponse('Maximum 7 dates allowed');
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const date of dates) {
      if (!dateRegex.test(date)) {
        return errorResponse(`Invalid date format: ${date}. Use YYYY-MM-DD`);
      }
    }
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Generate IDs and keys
    const eventId = crypto.randomUUID();
    const shareId = generateBase62Id(10);
    const adminKey = generateRandomHex(32);
    const adminKeyHash = await hashString(adminKey);
    
    // Insert event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        id: eventId,
        title,
        memo: memo || null,
        admin_key_hash: adminKeyHash,
        share_id: shareId
      })
      .select()
      .single();
    
    if (eventError) {
      console.error('Event insert error:', eventError);
      return errorResponse('Failed to create event', 500, eventError);
    }
    
    // Insert options (candidate dates)
    const optionsData = dates.map((date, index) => ({
      event_id: eventId,
      date,
      sort_index: index
    }));
    
    const { error: optionsError } = await supabase
      .from('options')
      .insert(optionsData);
    
    if (optionsError) {
      console.error('Options insert error:', optionsError);
      // Rollback event (delete it)
      await supabase.from('events').delete().eq('id', eventId);
      return errorResponse('Failed to create options', 500, optionsError);
    }
    
    // Insert links
    const linksData = [
      { event_id: eventId, kind: 'share', token: shareId },
      { event_id: eventId, kind: 'admin', token: adminKey }
    ];
    
    const { error: linksError } = await supabase
      .from('links')
      .insert(linksData);
    
    if (linksError) {
      console.error('Links insert error:', linksError);
      // Note: Links table issues shouldn't block event creation
    }
    
    // Construct URLs
    const baseUrl = req.headers.get('origin') || 'https://yourdomain.com';
    const adminUrl = `${baseUrl}/scheduler/e/${eventId}?k=${adminKey}`;
    const shareUrl = `${baseUrl}/scheduler/s/${shareId}`;
    
    // Return response
    return jsonResponse({
      event_id: eventId,
      share_id: shareId,
      admin_key: adminKey, // Only returned on creation
      admin_url: adminUrl,
      share_url: shareUrl
    }, 201);
    
  } catch (error) {
    console.error('Create event error:', error);
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Internal server error', 500);
  }
});

