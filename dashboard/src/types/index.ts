export interface Project {
  id: string;
  name: string;
  domains: string[];
  api_key: string;
  settings: ProjectSettings;
  created_at: string;
  updated_at: string;
}

export interface UpdateProject {
  name: string;
  auto_pageview: boolean;
  time_spent: boolean;
  campaign: boolean;
  clicks: boolean;
}

export interface ProjectSettings {
  auto_pageview: boolean;
  time_spent: boolean;
  campaign: boolean;
  clicks: boolean;
}

export interface Event {
  id: string;
  project_id: string;
  event_name: string;
  session_id: string;
  timestamp: string;
  properties?: Record<string, any>;
}

export interface DashboardData {
  total_events: number;
  page_views: number;
  avg_time_spent: string;
  custom_events: number;
  events_over_time: TimeSeriesData[];
  event_breakdown: EventBreakdown[];
  recent_events: Event[];
}

export interface TimeSeriesData {
  date: string;
  events: number;
}

export interface EventBreakdown {
  name: string;
  count: number;
  color: string;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
}

export interface AuthState {
  authToken: string | null;
  serverUrl: string;
  user: User | null;
  isAuthenticated: boolean;
}
