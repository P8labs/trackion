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
  name?: string;
  domains?: string[];
  settings?: ProjectSettings;
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
  github_id?: string;
  google_id?: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthState {
  authToken: string | null;
  serverUrl: string;
  user: User | null;
  isAuthenticated: boolean;
}

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

export interface AreaChartDataPoint {
  period: string;
  desktop: number;
  mobile: number;
}

export interface BreakdownData {
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
  referrers: BreakdownItem[];
  countries: BreakdownItem[];
  utm: UTMBreakdown[];
  top_pages: PageBreakdown[];
}

export interface BreakdownItem {
  name: string;
  count: number;
  color?: string;
  country_code?: string;
  emoji?: string;
}

export interface CountryDataItem {
  name: string;
  count: number;
  country_code?: string;
  emoji?: string;
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

export interface UsageSummary {
  mode: "saas" | "selfhost";
  is_limited: boolean;
  plan?: string;
  status?: string;
  current_usage: number;
  monthly_limit: number;
  remaining: number;
  retention_days: number;
  delete_after_days: number;
}

export interface ServerHealth {
  status: string;
  timestamp: string;
  server_version: string;
}

export interface RuntimeFlag {
  key: string;
  enabled: boolean;
  rollout_percentage: number;
}

export interface RuntimeConfig {
  key: string;
  value: unknown;
}

export interface ProjectRuntime {
  flags: RuntimeFlag[];
  configs: RuntimeConfig[];
}

// Error Tracking Types
export interface GroupedError {
  fingerprint: string;
  message: string;
  count: number;
  first_seen: string;
  last_seen: string;
  last_url?: string;
}

export interface ErrorOccurrence {
  id: number;
  timestamp: string;
  message: string;
  stack_trace: string;
  url: string;
  user_id?: string;
  session_id?: string;
  browser?: string;
  platform?: string;
  line_number?: number;
  column_number?: number;
  context?: Record<string, any>;
}

export interface ErrorStats {
  total_errors: number;
  time_range: string;
}

// Billing and Usage Types
export interface UsagePlan {
  events_used: number;
  events_limit: number;
  projects_used: number;
  projects_limit: number;
  plan: "free" | "pro";
}

export interface PlanLimits {
  monthly_events: number;
  max_projects: number;
  max_config_keys: number;
  error_retention: number; // hours
  supports_rollout: boolean;
}

export interface PlanInfo {
  plan: "free" | "pro";
  status: string;
  limits: PlanLimits;
}
