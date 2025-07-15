-- Enable Row Level Security
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own suggestions
CREATE POLICY "Users can view their own suggestions" ON suggestions
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own suggestions
CREATE POLICY "Users can insert their own suggestions" ON suggestions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own suggestions
CREATE POLICY "Users can update their own suggestions" ON suggestions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own suggestions
CREATE POLICY "Users can delete their own suggestions" ON suggestions
    FOR DELETE USING (auth.uid() = user_id);

-- Add user_id column if it doesn't exist (run this only if the column doesn't exist)
-- ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at);

-- Optional: Create a function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION handle_new_suggestion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user_id
CREATE TRIGGER on_suggestion_created
  BEFORE INSERT ON suggestions
  FOR EACH ROW EXECUTE FUNCTION handle_new_suggestion(); 