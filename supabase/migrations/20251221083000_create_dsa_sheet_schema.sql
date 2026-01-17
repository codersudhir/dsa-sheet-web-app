/*
  # DSA Sheet Application Schema

  ## Overview
  This migration creates the complete database schema for a Data Structures and Algorithms (DSA) learning platform with progress tracking.

  ## New Tables
  
  ### 1. `topics`
  Stores main DSA topic categories (e.g., Arrays, Linked Lists, Trees, etc.)
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Topic name (e.g., "Arrays", "Dynamic Programming")
  - `description` (text) - Brief description of the topic
  - `order_index` (integer) - For ordering topics in the UI
  - `created_at` (timestamptz) - Timestamp of creation

  ### 2. `problems`
  Stores individual DSA problems under each topic
  - `id` (uuid, primary key) - Unique identifier
  - `topic_id` (uuid, foreign key) - References topics table
  - `title` (text) - Problem title
  - `description` (text) - Problem description
  - `difficulty` (text) - Easy, Medium, or Hard
  - `leetcode_link` (text, optional) - Link to LeetCode problem
  - `codeforces_link` (text, optional) - Link to Codeforces problem
  - `youtube_link` (text, optional) - Tutorial video link
  - `article_link` (text, optional) - Theory/article reference
  - `order_index` (integer) - For ordering problems within a topic
  - `created_at` (timestamptz) - Timestamp of creation

  ### 3. `user_progress`
  Tracks which problems each user has completed
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `problem_id` (uuid, foreign key) - References problems table
  - `completed` (boolean) - Whether the problem is completed
  - `completed_at` (timestamptz, optional) - When the problem was completed
  - `created_at` (timestamptz) - Timestamp of creation
  - Unique constraint on (user_id, problem_id) to prevent duplicates

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Users can read all topics and problems
  - Users can only read and modify their own progress
  - Authenticated users required for progress tracking

  ## Notes
  - Progress is automatically saved when users check/uncheck problems
  - Users resume from where they left off on next login
  - Difficulty levels: Easy, Medium, Hard
*/

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create problems table
CREATE TABLE IF NOT EXISTS problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  leetcode_link text DEFAULT '',
  codeforces_link text DEFAULT '',
  youtube_link text DEFAULT '',
  article_link text DEFAULT '',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_problems_topic_id ON problems(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_problem_id ON user_progress(problem_id);

-- Enable Row Level Security
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for topics table
CREATE POLICY "Anyone can view topics"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for problems table
CREATE POLICY "Anyone can view problems"
  ON problems FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_progress table
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);