-- Create map_markers table for storing user contributions on the interactive map
CREATE TABLE IF NOT EXISTS map_markers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  media_urls TEXT[], -- Array of media file URLs
  media_types TEXT[], -- Array of media types (image, video, audio)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient location-based queries
CREATE INDEX IF NOT EXISTS idx_map_markers_location ON map_markers(latitude, longitude);

-- Create index for user-based queries
CREATE INDEX IF NOT EXISTS idx_map_markers_user_id ON map_markers(user_id);

-- Create index for time-based queries
CREATE INDEX IF NOT EXISTS idx_map_markers_created_at ON map_markers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE map_markers ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to read all markers
CREATE POLICY "Allow authenticated users to read map markers" ON map_markers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own markers
CREATE POLICY "Allow authenticated users to insert map markers" ON map_markers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own markers
CREATE POLICY "Allow users to update their own map markers" ON map_markers
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own markers
CREATE POLICY "Allow users to delete their own map markers" ON map_markers
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_map_markers_updated_at
  BEFORE UPDATE ON map_markers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 