import { supabase } from '../lib/supabase.js'

export const suggestionsService = {
  // Get all suggestions
  async getAllSuggestions() {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      throw error
    }
  },

  // Create a new suggestion
  async createSuggestion(suggestion) {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .insert([{
          title: suggestion.title,
          content: suggestion.content,
          status: 'submitted'
        }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error creating suggestion:', error)
      throw error
    }
  },

  // Update suggestion status
  async updateSuggestionStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .update({ status })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating suggestion status:', error)
      throw error
    }
  },

  // Delete a suggestion
  async deleteSuggestion(id) {
    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting suggestion:', error)
      throw error
    }
  }
} 