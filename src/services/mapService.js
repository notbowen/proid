import { supabase } from '../lib/supabase.js'

export const mapService = {
  // Get all map markers
  async getMarkers() {
    const { data, error } = await supabase
      .from('map_markers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Add a new map marker
  async addMarker(markerData) {
    const { data, error } = await supabase
      .from('map_markers')
      .insert([markerData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update a map marker
  async updateMarker(id, updates) {
    const { data, error } = await supabase
      .from('map_markers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete a map marker
  async deleteMarker(id) {
    const { error } = await supabase
      .from('map_markers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Upload media file to Supabase Storage
  async uploadMedia(file, markerId) {
    // Validate file object
    if (!file || typeof file !== 'object') {
      throw new Error('Invalid file object provided')
    }
    
    // Ensure file has a name property
    if (!file.name || typeof file.name !== 'string') {
      throw new Error('File must have a valid name property')
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${markerId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('map-media')
      .upload(fileName, file)
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('map-media')
      .getPublicUrl(fileName)
    
    return {
      url: publicUrl,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'audio'
    }
  },

  // Subscribe to real-time changes
  subscribeToMarkers(callback) {
    return supabase
      .channel('map_markers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'map_markers'
        },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()
  }
} 