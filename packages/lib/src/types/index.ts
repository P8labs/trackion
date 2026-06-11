export interface TokenResponse {
  token: string;
}

export interface Project {
  id: string;
  name: string;
  domains: string[];
  api_key: string;
  settings: ProjectSettings;
  created_at: string;
  updated_at: string;
}

export interface ProjectSettings {
  auto_pageview: boolean;
  time_spent: boolean;
  campaign: boolean;
  clicks: boolean;
}

export interface Plan {
  title: string;
  description: string;
  message: string;
  type: "free" | "pro" | "unlimited";
  price: string;
  features: string[];
  cta: string;
  href: string;
  limits: {
    monthly_events: number;
    max_projects: number;
    max_config_keys: number;
    error_retention: number;
    supports_rollout: boolean;
  };
}

export interface CreateProjectInput {
  name: string;
  domains: string[];
  settings: ProjectSettings;
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
  email: string;
  name: string;
  avatar_url?: string;
  is_email_verified: boolean;
  is_active_subscription: boolean;
  subscription_ends_at?: string;
  subscription_plan?: string;
  created_at: string;
  updated_at: string;
  providers: {
    type: "google" | "github" | "email";
    verified: boolean;
    created_at: string;
    updated_at: string;
  }[];
}

export interface Subscription {
  plan: string;
  status: string;
  current_period_end: string;
  events_limit: number;
  projects_limit: number;
  config_keys_limit: number;
  error_retention_days: number;
  supports_rollout: boolean;
}

export interface Provider {
  id: string;
  type: string;
  verified: boolean;
  created_at?: string;
  updated_at?: string;
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

export interface DeviceAnalytics {
  devices: Array<{ name: string; count: number; color?: string }>;
  browsers: Array<{ name: string; count: number; color?: string }>;
}

export interface TrafficSource {
  referrers: Array<{ name: string; count: number; color?: string }>;
  countries: Array<{ name: string; count: number; color?: string }>;
  utm_sources: Array<{ name: string; count: number; color?: string }>;
  utm_mediums: Array<{ name: string; count: number; color?: string }>;
}

export interface TopPage {
  path: string;
  total_views: number;
  unique_visitors: number;
  avg_time_seconds: number;
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

export interface CountryMapEntry {
  name: string;
  count: number;
  country_code?: string;
  emoji?: string;
  normalized_name: string;
}

export interface CountryMapData {
  countries: CountryMapEntry[];
  max_count: number;
  by_code: Record<string, CountryMapEntry>;
  by_name: Record<string, CountryMapEntry>;
}

export interface TrafficHeatmapData {
  calendar: Record<string, number>;
  day_hour: number[][];
  start_date: string;
  end_date: string;
  stats: {
    today: number;
    weekly_avg: number;
    monthly_avg: number;
  };
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
  event_type?: string;
  user_id?: string;
  session_id: string;
  platform?: string;
  device?: string;
  os_version?: string;
  app_version?: string;
  browser?: string;
  page_path?: string;
  page_title?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  properties?: any;
  created_at: string;
}

export interface RealtimeEventData {
  id: number;
  event_name: string;
  event_type?: string;
  user_id?: string;
  session_id: string;
  platform?: string;
  device?: string;
  page_path?: string;
  created_at: string;
}

export interface PagninatedRealtimeEventsResponse {
  events: RealtimeEventData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedEventsResponse {
  events: RecentEventData[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
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
  project: {
    id: string;
    name: string;
  };
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

export interface UsagePlan {
  plan: "free" | "pro";
  status: string;
  current_period_end: string;
  last_usage_reset: string;
  events_used: number;
  events_limit: number;
  events_remaining: number;
  projects_used: number;
  projects_limit: number;
  projects_remaining: number;
  configs_used: number;
  config_keys_limit: number;
  config_keys_remaining: number;
  config_unlimited: boolean;
  feature_flags_used: number;
  error_retention_days: number;
  supports_rollout: boolean;

  events_used_percent: number;
  projects_used_percent: number;
  config_keys_used_percent: number;
}

export interface PlanLimits {
  monthly_events: number;
  max_projects: number;
  max_config_keys: number;
  error_retention: number;
  supports_rollout: boolean;
}

export interface PlanInfo {
  plan: "free" | "pro";
  status: string;
  limits: PlanLimits;
}

export interface ReplaySessionSummary {
  session_id: string;
  project_id: string;
  started_at: string;
  last_seen_at: string;
  chunk_count: number;
}

export interface ReplaySessionPayload {
  session_id: string;
  events: Record<string, unknown>[];
}
