// src/api/urls.js
import { supabase } from '../lib/supabase';

export const urlsAPI = {
  // Get all URLs for current user
  getUserUrls: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('urls')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get a single URL by ID
  getUrlById: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('urls')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get clicks for a specific URL
  getClicksForUrl: async (urlId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Verify the URL belongs to the user
    const { data: url, error: urlError } = await supabase
      .from('urls')
      .select('id')
      .eq('id', urlId)
      .eq('user_id', user.id)
      .single();
    
    if (urlError || !url) throw new Error('URL not found or access denied');

    const { data, error } = await supabase
      .from('clicks')
      .select('*')
      .eq('url_id', urlId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Create a new URL
  createUrl: async (urlData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Generate short URL if not provided
    let shortUrl = urlData.short_url;
    if (!shortUrl) {
      shortUrl = Math.random().toString(36).substring(2, 8);
    }

    // Check if short URL already exists
    const { data: existing } = await supabase
      .from('urls')
      .select('id')
      .eq('short_url', shortUrl)
      .single();

    if (existing) {
      throw new Error('Short URL already exists. Try a different one.');
    }

    const newUrl = {
      original_url: urlData.original_url,
      short_url: shortUrl,
      custom_url: urlData.custom_url || null,
      title: urlData.title || null,
      user_id: user.id,
      clicks_count: 0,
      is_active: true,
    };

    const { data, error } = await supabase
      .from('urls')
      .insert([newUrl])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a URL
  updateUrl: async (id, updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('urls')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a URL
  deleteUrl: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('urls')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) throw error;
  },

  // Track a click (for redirect page)
  trackClick: async (urlId, clickData = {}) => {
    const click = {
      url_id: urlId,
      city: clickData.city || null,
      country: clickData.country || null,
      device: clickData.device || null,
    };

    const { error } = await supabase
      .from('clicks')
      .insert([click]);

    if (error) throw error;

    // Update click count in URLs table
    const { error: updateError } = await supabase.rpc('increment_clicks', {
      url_id: urlId
    });

    if (updateError) throw updateError;
  },

  // Get URL by short code (for redirect)
  getUrlByShortCode: async (shortCode) => {
    const { data, error } = await supabase
      .from('urls')
      .select('*')
      .or(`short_url.eq.${shortCode},custom_url.eq.${shortCode}`)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get URL statistics
  getUrlStats: async (urlId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Verify the URL belongs to the user
    const { data: url } = await supabase
      .from('urls')
      .select('id')
      .eq('id', urlId)
      .eq('user_id', user.id)
      .single();
    
    if (!url) throw new Error('URL not found or access denied');

    // Get click statistics
    const { data: clicks, error } = await supabase
      .from('clicks')
      .select('*')
      .eq('url_id', urlId);
    
    if (error) throw error;

    // Calculate stats
    const totalClicks = clicks.length;
    const uniqueCountries = [...new Set(clicks.map(click => click.country).filter(Boolean))];
    const uniqueCities = [...new Set(clicks.map(click => click.city).filter(Boolean))];
    const devices = clicks.reduce((acc, click) => {
      const device = click.device || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    return {
      totalClicks,
      uniqueCountries: uniqueCountries.length,
      uniqueCities: uniqueCities.length,
      devices,
      clicksByDate: groupClicksByDate(clicks),
    };
  },
};

// Helper function to group clicks by date
const groupClicksByDate = (clicks) => {
  const grouped = {};
  clicks.forEach(click => {
    const date = new Date(click.created_at).toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });
  return grouped;
};