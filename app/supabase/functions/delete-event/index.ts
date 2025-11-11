import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, jsonResponse, errorResponse, hashString } from '../_shared/utils.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // Only allow DELETE
  if (req.method !== 'DELETE') {
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
    
    // Get event by ID to verify admin key
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, admin_key_hash')
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
    
    // Delete event (cascade will delete related records)
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (deleteError) {
      console.error('Delete event error:', deleteError);
      return errorResponse('Failed to delete event', 500, deleteError);
    }
    
    // Return success
    return jsonResponse({ success: true, message: 'Event deleted successfully' });
    
  } catch (error) {
    console.error('Delete event error:', error);
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }
    return errorResponse('Internal server error', 500);
  }
});

