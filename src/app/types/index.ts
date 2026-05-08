// ============================================================
// TYPE DEFINITIONS - Smart Hostel Management System
// ============================================================

export type UserRole =
  | 'admin'
  | 'warden'
  | 'student'
  | 'security'
  | 'finance_officer'
  | 'maintenance_staff'
  | 'auditor';

export type Gender = 'male' | 'female' | 'other';

export type RoomType = 'single' | 'double' | 'triple' | 'quad';

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

export type AllocationStatus = 'active' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded' | 'voided' | 'flagged';

export type PaymentType = 'hostel_fee' | 'mess_fee' | 'security_deposit' | 'fine' | 'other';

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export type ComplaintCategory =
  | 'maintenance'
  | 'electrical'
  | 'plumbing'
  | 'housekeeping'
  | 'security'
  | 'food_quality'
  | 'other';

export type VisitorType = 'family' | 'friend' | 'official' | 'vendor' | 'maintenance' | 'delivery' | 'other';

export type NotificationType =
  | 'payment_reminder'
  | 'complaint_update'
  | 'allocation_update'
  | 'visitor_alert'
  | 'general'
  | 'emergency';

export type OnboardingStatus = 
  | 'applied' 
  | 'verifying' 
  | 'interviewing' 
  | 'pending_assignment' 
  | 'assigned' 
  | 'reassignment_requested';

// ============================================================
// INTERFACES
// ============================================================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone_number?: string;
  profile_picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  date_of_birth: string;
  gender: Gender;
  blood_group?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation?: string;
  guardian_name?: string;
  guardian_phone?: string;
  permanent_address?: string;
  department?: string;
  year_of_study?: number;
  admission_date?: string;
  onboarding_status?: OnboardingStatus;
  document_id_proof_url?: string;
  document_address_proof_url?: string;
  document_photo_url?: string;
  medical_conditions?: string;
  special_requirements?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  address?: string;
  total_floors: number;
  gender_restriction?: Gender;
  warden_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  warden?: User;
}

export interface Room {
  id: string;
  building_id: string;
  room_number: string;
  floor: number;
  room_type: RoomType;
  capacity: number;
  current_occupancy: number;
  status: RoomStatus;
  monthly_rent: number;
  has_ac: boolean;
  has_attached_bathroom: boolean;
  amenities: string[];
  created_at: string;
  updated_at: string;
  building?: Building;
}

export interface RoomAllocation {
  id: string;
  student_id: string;
  room_id: string;
  allocation_date: string;
  expected_checkout_date?: string;
  actual_checkout_date?: string;
  status: AllocationStatus;
  allocation_notes?: string;
  allocated_by?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  room?: Room;
}

export interface Payment {
  id: string;
  student_id: string;
  payment_type: PaymentType;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: PaymentStatus;
  authorization_status?: 'approved' | 'pending_auth' | 'flagged' | 'rejected';
  gl_account?: string;
  cost_center?: string;
  physical_receipt_no?: string;
  request_originator?: string;
  has_digital_receipt?: boolean;
  liquidity_impact?: 'inflow' | 'outflow';
  payment_method?: string;
  transaction_id?: string;
  receipt_url?: string;
  late_fee: number;
  notes?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
}

export interface Complaint {
  id: string;
  ticket_number: string;
  student_id: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  title: string;
  description: string;
  room_id?: string;
  building_id?: string;
  assigned_to?: string;
  attachment_urls: string[];
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  room?: Room;
  assigned_user?: User;
}

export interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_type: VisitorType;
  visitor_id_proof_type?: string;
  visitor_id_proof_number?: string;
  student_id: string;
  room_id?: string;
  check_in_time: string;
  check_out_time?: string;
  purpose?: string;
  approved_by?: string;
  security_officer_id?: string;
  notes?: string;
  created_at: string;
  student?: Student;
  room?: Room;
}

export interface Attendance {
  id: string;
  student_id: string;
  check_in_time?: string;
  check_out_time?: string;
  date: string;
  is_present: boolean;
  marked_by?: string;
  notes?: string;
  created_at: string;
  student?: Student;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  sent_via: string[];
  created_at: string;
}

export interface MessPlan {
  id: string;
  name: string;
  description?: string;
  monthly_fee: number;
  meals_included: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessSubscription {
  id: string;
  student_id: string;
  mess_plan_id: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  mess_plan?: MessPlan;
}

// ============================================================
// ANALYTICS INTERFACES
// ============================================================

export interface DashboardAnalytics {
  occupancy_rate: number;
  total_students: number;
  total_rooms: number;
  available_rooms: number;
  pending_payments: number;
  total_revenue: number;
  open_complaints: number;
  recent_visitors: number;
}

export interface OccupancyData {
  building_name: string;
  room_type: RoomType;
  total_rooms: number;
  total_capacity: number;
  current_occupancy: number;
  occupancy_percentage: number;
}

export interface PaymentSummary {
  student_id: string;
  student_number: string;
  full_name: string;
  total_payments: number;
  total_paid: number;
  total_pending: number;
  total_overdue: number;
}

export interface ComplaintStatistics {
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  count: number;
  avg_resolution_hours?: number;
}

// ============================================================
// FORM INTERFACES
// ============================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface StudentRegistrationFormData {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  student_id: string;
  date_of_birth: string;
  gender: Gender;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  department: string;
  year_of_study: number;
}

export interface ComplaintFormData {
  category: ComplaintCategory;
  priority: ComplaintPriority;
  title: string;
  description: string;
  room_id?: string;
}

export interface VisitorCheckInFormData {
  visitor_name: string;
  visitor_phone: string;
  visitor_type: VisitorType;
  visitor_id_proof_type: string;
  visitor_id_proof_number: string;
  student_id: string;
  purpose: string;
}

export interface RoomAllocationFormData {
  student_id: string;
  room_id: string;
  expected_checkout_date: string;
  allocation_notes?: string;
}

export interface PaymentFormData {
  student_id: string;
  payment_type: PaymentType;
  amount: number;
  due_date: string;
  notes?: string;
}

// ============================================================
// API RESPONSE INTERFACES
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface AuthResponse {
  user: User & { student_details?: Student };
  token: string;
  expires_at: string;
}

// ============================================================
// CONTEXT INTERFACES
// ============================================================

export interface AuthContextType {
  user: (User & { student_details?: Student }) | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (notification: Partial<Notification>) => Promise<void>;
}
export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  due_date: string;
  time?: string;
  category?: 'personal' | 'global';
  assigned_role?: UserRole;
}

export interface WardenEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: 'inspection' | 'meeting' | 'maintenance' | 'other';
  building_id?: string;
  room_id?: string;
}
