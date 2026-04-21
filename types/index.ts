// ===========================================
// TripSync - Global TypeScript Types
// ===========================================

export type TripType = "friends" | "family" | "solo" | "bike_trip";
export type ExpenseSplitType = "equal" | "custom" | "percentage";
export type VoteStatus = "open" | "closed";
export type MemberRole = "owner" | "admin" | "member";
export type NotificationType =
  | "trip_invite"
  | "expense_added"
  | "vote_started"
  | "itinerary_ready"
  | "payment_reminder";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  trip_type: TripType;
  notes: string | null;
  cover_image: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  members?: TripMember[];
  expenses?: Expense[];
  itineraries?: Itinerary[];
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  user?: User;
}

export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  paid_by: string;
  split_type: ExpenseSplitType;
  category: string;
  notes: string | null;
  created_at: string;
  splits?: ExpenseSplit[];
  payer?: User;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  is_settled: boolean;
  user?: User;
}

export interface Vote {
  id: string;
  trip_id: string;
  title: string;
  description: string | null;
  options: VoteOption[];
  status: VoteStatus;
  ends_at: string | null;
  created_by: string;
  created_at: string;
  responses?: VoteResponse[];
}

export interface VoteOption {
  id: string;
  label: string;
  image_url?: string;
}

export interface VoteResponse {
  id: string;
  vote_id: string;
  user_id: string;
  option_id: string;
  created_at: string;
  user?: User;
}

export interface Itinerary {
  id: string;
  trip_id: string;
  generated_by: string;
  content: ItineraryContent;
  created_at: string;
}

export interface ItineraryContent {
  days: ItineraryDay[];
  summary: string;
  estimated_total_cost: number;
  tips: string[];
}

export interface ItineraryDay {
  day: number;
  date?: string;
  theme: string;
  morning: ItineraryActivity[];
  afternoon: ItineraryActivity[];
  evening: ItineraryActivity[];
  meals: MealSuggestion[];
  estimated_cost: number;
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
  duration: string;
  tips?: string;
}

export interface MealSuggestion {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  cuisine: string;
  price_range: string;
  must_try?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface BalanceSummary {
  user_id: string;
  user: User;
  total_paid: number;
  total_owed: number;
  net_balance: number;
}

export interface DebtSummary {
  from_user: User;
  to_user: User;
  amount: number;
}

// API Types
export interface AIItineraryRequest {
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  trip_type: TripType;
  interests: string[];
  num_people: number;
  trip_style: string;
}

export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feels_like: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  min_temp: number;
  max_temp: number;
  description: string;
  icon: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_trips: number;
  upcoming_trips: number;
  total_spent: number;
  pending_balance: number;
}
