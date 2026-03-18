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

// New analytics types
export interface DashboardStats {
  total_events: number;
  views: number;
  unique_views: number;
  avg_time_spent_seconds: number;
}

export interface ChartDataPoint {
  period: string;
  count: number;
}

export interface BreakdownData {
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
  referrers: BreakdownItem[];
  utm: UTMBreakdown[];
  top_pages: PageBreakdown[];
}

export interface BreakdownItem {
  name: string;
  count: number;
  color?: string;
}

export interface UTMBreakdown {
  source: string;
  medium: string;
  campaign: string;
  count: number;
}

export interface PageBreakdown {
  path: string;
  count: number;
  unique_views: number;
}

export interface RecentEventData {
  id: number;
  event_name: string;
  session_id: string;
  page_path?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  properties?: any;
  created_at: string;
}
