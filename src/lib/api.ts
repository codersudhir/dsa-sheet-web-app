const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Topic {
  id: number;
  name: string;
  description: string;
  order_index: number;
  created_at: string;
}

export interface Problem {
  id: number;
  topic_id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  leetcode_link: string;
  codeforces_link: string;
  youtube_link: string;
  article_link: string;
  order_index: number;
  created_at: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  problem_id: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
  };
  token: string;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Registration failed');
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Login failed');
  }

  return response.json();
}

export async function getTopics(token: string): Promise<Topic[]> {
  const response = await fetch(`${API_URL}/api/topics`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to fetch topics');
  return response.json();
}

export async function getProblems(token: string): Promise<Problem[]> {
  const response = await fetch(`${API_URL}/api/problems`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to fetch problems');
  return response.json();
}

export async function getProgress(token: string): Promise<UserProgress[]> {
  const response = await fetch(`${API_URL}/api/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error('Failed to fetch progress');
  return response.json();
}

export async function updateProgress(
  token: string,
  problemId: number,
  completed: boolean
): Promise<UserProgress> {
  const response = await fetch(`${API_URL}/api/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ problem_id: problemId, completed }),
  });

  if (!response.ok) throw new Error('Failed to update progress');
  return response.json();
}
