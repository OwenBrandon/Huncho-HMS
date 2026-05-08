// ============================================================
// MOCK DATA - Smart Hostel Management System
// This will be replaced with real Supabase queries
// ============================================================

import type {
  User,
  Student,
  Building,
  Room,
  RoomAllocation,
  Payment,
  Complaint,
  Visitor,
  VisitorType,
  Attendance,
  Notification,
  MessPlan,
  DashboardAnalytics,
  OccupancyData,
  Todo,
  WardenEvent,
} from '../types';

// ============================================================
// USERS
// ============================================================

export const mockUsers: User[] = [
  {
    id: 'user-admin-1',
    email: 'admin@hostel.com',
    role: 'admin',
    full_name: 'Dr. Sarah Johnson',
    phone_number: '+1234567890',
    profile_picture_url: 'https://i.pravatar.cc/150?img=47',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-warden-1',
    email: 'warden@hostel.com',
    role: 'warden',
    full_name: 'Mr. David Miller',
    phone_number: '+1234567891',
    profile_picture_url: 'https://i.pravatar.cc/150?img=12',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-student-1',
    email: 'john.doe@student.com',
    role: 'student',
    full_name: 'John Doe',
    phone_number: '+1234567892',
    profile_picture_url: 'https://i.pravatar.cc/150?img=33',
    is_active: true,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'user-security-1',
    email: 'security@hostel.com',
    role: 'security',
    full_name: 'Mike Security',
    phone_number: '+1234567893',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-finance-1',
    email: 'finance@hostel.com',
    role: 'finance_officer',
    full_name: 'Emma Finance',
    phone_number: '+1234567894',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-maintenance-1',
    email: 'maintenance@hostel.com',
    role: 'maintenance_staff',
    full_name: 'Tom Maintenance',
    phone_number: '+1234567895',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-auditor-1',
    email: 'auditor@hostel.com',
    role: 'auditor',
    full_name: 'Lisa Auditor',
    phone_number: '+1234567896',
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Generate Student Users
for (let i = 2; i <= 100; i++) {
  const names = [
    'Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack',
    'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rose', 'Sam', 'Tina',
    'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zane', 'Aiden', 'Bella', 'Caleb', 'Daisy'
  ];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
  
  mockUsers.push({
    id: `user-student-${i}`,
    email: `student${i}@hostel.com`,
    role: 'student',
    full_name: `${names[i % names.length]} ${lastNames[i % lastNames.length]}`,
    phone_number: `+1234567${String(i).padStart(3, '0')}`,
    profile_picture_url: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
    is_active: true,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  });
}

// ============================================================
// STUDENTS
// ============================================================

export const mockStudents: Student[] = [
  {
    id: 'student-1',
    user_id: 'user-student-1',
    student_id: 'STU2026001',
    date_of_birth: '2005-03-15',
    gender: 'male',
    blood_group: 'O+',
    emergency_contact_name: 'Mary Doe',
    emergency_contact_phone: '+1234567800',
    emergency_contact_relation: 'Mother',
    permanent_address: '123 Main St, New York, NY 10001',
    department: 'Computer Science',
    year_of_study: 2,
    admission_date: '2024-08-01',
    onboarding_status: 'assigned',
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
];

// Generate more mock students
for (let i = 2; i <= 100; i++) {
  mockStudents.push({
    id: `student-${i}`,
    user_id: `user-student-${i}`,
    student_id: `STU2026${String(i).padStart(3, '0')}`,
    date_of_birth: `200${Math.floor(Math.random() * 6)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15`,
    gender: Math.random() > 0.5 ? 'male' : 'female',
    blood_group: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'][Math.floor(Math.random() * 8)],
    emergency_contact_name: `Guardian ${i}`,
    emergency_contact_phone: `+123456${String(i).padStart(4, '0')}`,
    permanent_address: `Address ${i}`,
    department: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology', 'Architecture'][Math.floor(Math.random() * 6)],
    year_of_study: Math.floor(Math.random() * 4) + 1,
    admission_date: '2024-08-01',
    onboarding_status: i <= 80 ? 'assigned' : ['applied', 'verifying', 'interviewing', 'pending_assignment', 'reassignment_requested'][Math.floor(Math.random() * 5)] as any,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  });
}

// ============================================================
// BUILDINGS
// ============================================================

export const mockBuildings: Building[] = [
  {
    id: 'building-1',
    name: 'Block A - Boys Hostel',
    code: 'BLK-A',
    address: 'Campus Road 1',
    total_floors: 4,
    gender_restriction: 'male',
    warden_id: 'user-warden-1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'building-2',
    name: 'Block B - Girls Hostel',
    code: 'BLK-B',
    address: 'Campus Road 2',
    total_floors: 4,
    gender_restriction: 'female',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'building-3',
    name: 'Block C - Premium Boys',
    code: 'BLK-C',
    address: 'Campus Road 3',
    total_floors: 5,
    gender_restriction: 'male',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// ROOMS
// ============================================================

export const mockRooms: Room[] = [];

// Generate rooms for each building
mockBuildings.forEach((building, buildingIndex) => {
  const roomsPerFloor = 10;
  for (let floor = 1; floor <= building.total_floors; floor++) {
    for (let roomNum = 1; roomNum <= roomsPerFloor; roomNum++) {
      const roomNumber = `${building.code.split('-')[1]}-${floor}${String(roomNum).padStart(2, '0')}`;
      const roomTypes: Array<'single' | 'double' | 'triple' | 'quad'> = ['single', 'double', 'triple', 'quad'];
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const capacity = roomType === 'single' ? 1 : roomType === 'double' ? 2 : roomType === 'triple' ? 3 : 4;

      mockRooms.push({
        id: `room-${buildingIndex + 1}-${floor}-${roomNum}`,
        building_id: building.id,
        room_number: roomNumber,
        floor,
        room_type: roomType,
        capacity,
        current_occupancy: Math.random() > 0.3 ? Math.floor(Math.random() * capacity) : capacity,
        status: Math.random() > 0.1 ? 'occupied' : Math.random() > 0.5 ? 'available' : 'maintenance',
        monthly_rent: roomType === 'single' ? 5000 : roomType === 'double' ? 3500 : roomType === 'triple' ? 3000 : 2500,
        has_ac: buildingIndex === 2 || Math.random() > 0.6,
        has_attached_bathroom: Math.random() > 0.5,
        amenities: ['Bed', 'Study Table', 'Chair', 'Wardrobe', 'Fan'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
    }
  }
});

// ============================================================
// ROOM ALLOCATIONS
// ============================================================

export const mockAllocations: RoomAllocation[] = mockStudents.map((student, index) => ({
  id: `allocation-${index + 1}`,
  student_id: student.id,
  room_id: mockRooms[index % mockRooms.length].id,
  allocation_date: '2024-08-15',
  expected_checkout_date: '2025-05-31',
  status: (index % 10 === 0) ? 'completed' : 'active' as const,
  allocated_by: 'user-warden-1',
  created_at: '2024-08-15T00:00:00Z',
  updated_at: '2024-08-15T00:00:00Z',
}));

// ============================================================
// PAYMENTS & INSTITUTIONAL LEDGER (OFFLINE PIVOT)
// ============================================================

export const mockPayments: Payment[] = [];

// 1. Student Inflow Nodes (Logged Offline Student Payments)
mockStudents.slice(0, 50).forEach((student, index) => {
  // Hostel fee
  mockPayments.push({
    id: `inflow-hostel-${index + 1}`,
    student_id: student.id,
    payment_type: 'hostel_fee',
    amount: 5000,
    due_date: '2026-04-01',
    payment_date: index % 3 === 0 ? '2026-03-28' : undefined,
    status: index % 3 === 0 ? 'paid' : index % 3 === 1 ? 'pending' : 'overdue',
    authorization_status: 'approved',
    gl_account: '4000 - Student Hostel Revenue',
    cost_center: 'REV-HOSTEL',
    physical_receipt_no: `RCP-HOSTEL-${1000 + index}`,
    has_digital_receipt: index % 2 === 0,
    liquidity_impact: 'inflow',
    payment_method: 'Cash/Offline',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    late_fee: index % 3 === 2 ? 200 : 0,
  });

  // Mess fee
  mockPayments.push({
    id: `inflow-mess-${index + 1}`,
    student_id: student.id,
    payment_type: 'mess_fee',
    amount: 3000,
    due_date: '2026-04-01',
    payment_date: index % 2 === 0 ? '2026-03-25' : undefined,
    status: index % 2 === 0 ? 'paid' : 'pending',
    authorization_status: 'approved',
    gl_account: '4100 - Mess Operations Revenue',
    cost_center: 'REV-MESS',
    physical_receipt_no: `RCP-MESS-${2000 + index}`,
    has_digital_receipt: true,
    liquidity_impact: 'inflow',
    payment_method: 'POS/Offline',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    late_fee: 0,
  });
});

// 2. Institutional Fund Requests (Outflow Requests from Staff)
const fundRequests: Payment[] = [
  {
    id: 'req-staff-001',
    student_id: 'SYSTEM',
    request_originator: 'Rajesh Kumar (Maintenance Lead)',
    payment_type: 'other',
    amount: 15200,
    due_date: '2026-04-18',
    status: 'pending',
    authorization_status: 'pending_auth',
    gl_account: '7300 - Plumbing & Repair Supplies',
    cost_center: 'EXP-MAINTENANCE',
    has_digital_receipt: false,
    liquidity_impact: 'outflow',
    notes: 'Emergency replacement of Block B water pump valves.',
    created_at: '2026-04-12T00:00:00Z',
    updated_at: '2026-04-12T00:00:00Z',
    late_fee: 0,
  },
  {
    id: 'req-staff-002',
    student_id: 'SYSTEM',
    request_originator: 'Anita Sharma (Hostel Warden)',
    payment_type: 'other',
    amount: 8500,
    due_date: '2026-04-20',
    status: 'pending',
    authorization_status: 'pending_auth',
    gl_account: '7400 - Sanitary & Hygiene Supplies',
    cost_center: 'EXP-HOUSEKEEPING',
    has_digital_receipt: true,
    liquidity_impact: 'outflow',
    notes: 'Monthly restocking of cleaning chemicals for Block A.',
    created_at: '2026-04-13T00:00:00Z',
    updated_at: '2026-04-13T00:00:00Z',
    late_fee: 0,
  },
  {
    id: 'req-staff-003',
    student_id: 'SYSTEM',
    request_originator: 'Dr. Vikram Seth (Medical Officer)',
    payment_type: 'other',
    amount: 12000,
    due_date: '2026-04-15',
    status: 'paid',
    authorization_status: 'approved',
    gl_account: '7600 - Medical & First Aid',
    cost_center: 'EXP-HEALTH',
    has_digital_receipt: true,
    liquidity_impact: 'outflow',
    payment_method: 'Cash/Offline Disbursement',
    transaction_id: 'DISB-99120',
    payment_date: '2026-04-14',
    notes: 'Restocking of emergency medical supplies and bandages.',
    created_at: '2026-04-10T00:00:00Z',
    updated_at: '2026-04-14T00:00:00Z',
    late_fee: 0,
  },
  {
    id: 'req-staff-004',
    student_id: 'SYSTEM',
    request_originator: 'Security Dept (Night Shift)',
    payment_type: 'other',
    amount: 2500,
    due_date: '2026-04-14',
    status: 'pending',
    authorization_status: 'flagged',
    gl_account: '7500 - Security Equipment',
    cost_center: 'EXP-SECURITY',
    has_digital_receipt: false,
    liquidity_impact: 'outflow',
    notes: 'Unverified request for "miscellaneous patrol tools". Lacks PO.',
    created_at: '2026-04-14T00:00:00Z',
    updated_at: '2026-04-14T00:00:00Z',
    late_fee: 0,
  },
];

mockPayments.push(...fundRequests);

// Map payments to student names or staff originators for UI helper
export const getEntityNameForPayment = (payment: Payment) => {
  if (payment.student_id === 'SYSTEM') return payment.request_originator || 'INSTITUTIONAL REQUEST';
  const student = mockStudents.find(s => s.id === payment.student_id);
  const user = mockUsers.find(u => u.id === student?.user_id);
  return user?.full_name || 'UNKNOWN NODE';
};

// ============================================================
// COMPLAINTS
// ============================================================

export const mockComplaints: Complaint[] = [
  {
    id: 'complaint-1',
    ticket_number: 'TKT-2026-001',
    student_id: 'student-1',
    category: 'maintenance',
    priority: 'high',
    status: 'in_progress',
    title: 'AC not working',
    description: 'The air conditioner in my room has stopped working since yesterday.',
    room_id: 'room-1-1-1',
    assigned_to: 'user-maintenance-1',
    attachment_urls: [],
    created_at: '2026-04-03T10:30:00Z',
    updated_at: '2026-04-04T08:00:00Z',
  },
  {
    id: 'complaint-2',
    ticket_number: 'TKT-2026-002',
    student_id: 'student-2',
    category: 'electrical',
    priority: 'medium',
    status: 'open',
    title: 'Power socket damaged',
    description: 'One of the power sockets near my study table is not working.',
    room_id: 'room-1-1-2',
    attachment_urls: [],
    created_at: '2026-04-04T14:20:00Z',
    updated_at: '2026-04-04T14:20:00Z',
  },
  {
    id: 'complaint-3',
    ticket_number: 'TKT-2026-003',
    student_id: 'student-3',
    category: 'plumbing',
    priority: 'critical',
    status: 'resolved',
    title: 'Water leakage in bathroom',
    description: 'Severe water leakage from the bathroom ceiling.',
    room_id: 'room-2-2-3',
    assigned_to: 'user-maintenance-1',
    resolution_notes: 'Pipe repaired and ceiling fixed.',
    resolved_at: '2026-04-02T16:45:00Z',
    attachment_urls: [],
    created_at: '2026-04-01T09:15:00Z',
    updated_at: '2026-04-02T16:45:00Z',
  },
  {
    id: 'complaint-4',
    ticket_number: 'TKT-2026-004',
    student_id: 'student-4',
    category: 'maintenance',
    priority: 'low',
    status: 'open',
    title: 'Wardrobe hinge loose',
    description: 'The left door of the wardrobe is not closing properly due to a loose hinge.',
    room_id: 'room-1-1-3',
    attachment_urls: [],
    created_at: '2026-04-05T11:00:00Z',
    updated_at: '2026-04-05T11:00:00Z',
  },
  {
    id: 'complaint-5',
    ticket_number: 'TKT-2026-005',
    student_id: 'student-5',
    category: 'electrical',
    priority: 'medium',
    status: 'in_progress',
    title: 'Ceiling fan noise',
    description: 'The ceiling fan is making a clicking sound when running at full speed.',
    room_id: 'room-1-2-1',
    assigned_to: 'user-maintenance-1',
    attachment_urls: [],
    created_at: '2026-04-06T09:30:00Z',
    updated_at: '2026-04-06T14:00:00Z',
  },
  {
    id: 'complaint-6',
    ticket_number: 'TKT-2026-006',
    student_id: 'student-6',
    category: 'plumbing',
    priority: 'high',
    status: 'open',
    title: 'Clogged washbasin',
    description: 'The washbasin in the common area is not draining correctly.',
    room_id: 'room-2-1-4',
    attachment_urls: [],
    created_at: '2026-04-07T08:15:00Z',
    updated_at: '2026-04-07T08:15:00Z',
  },
  {
    id: 'complaint-7',
    ticket_number: 'TKT-2026-007',
    student_id: 'student-7',
    category: 'housekeeping',
    priority: 'low',
    status: 'resolved',
    title: 'Corridor window dusty',
    description: 'The windows in the 3rd-floor corridor need cleaning.',
    room_id: 'room-1-3-5',
    assigned_to: 'user-maintenance-1',
    resolution_notes: 'Janitorial staff informed and windows cleaned.',
    resolved_at: '2026-04-06T17:00:00Z',
    attachment_urls: [],
    created_at: '2026-04-06T10:00:00Z',
    updated_at: '2026-04-06T17:00:00Z',
  },
  {
    id: 'complaint-8',
    ticket_number: 'TKT-2026-008',
    student_id: 'student-8',
    category: 'security',
    priority: 'critical',
    status: 'open',
    title: 'Lost room key',
    description: 'I have lost my room key while coming back from the library. Requesting emergency spare.',
    room_id: 'room-3-1-2',
    attachment_urls: [],
    created_at: '2026-04-07T20:45:00Z',
    updated_at: '2026-04-07T20:45:00Z',
  },
];

// ============================================================
// VISITORS
// ============================================================

export const mockVisitors: Visitor[] = Array.from({ length: 100 }).map((_, i) => {
  const studentIndex = i % mockStudents.length;
  const student = mockStudents[studentIndex];
  const types: VisitorType[] = ['family', 'friend', 'delivery', 'maintenance', 'other', 'official', 'vendor'];
  const type = types[i % types.length];
  const isCheckedOut = i % 4 !== 0; // 75% are checked out
  
  const checkInDate = new Date('2026-04-07T10:00:00Z');
  checkInDate.setDate(checkInDate.getDate() - Math.floor(i / 10)); // 10 visits per day
  checkInDate.setHours(8 + (i % 12), (i * 7) % 60, 0, 0);

  return {
    id: `visitor-${i + 1}`,
    visitor_name: i === 0 ? 'Mary Doe' : i === 1 ? 'Tom Friend' : `Visitor ${i + 1}`,
    visitor_phone: `+12345${String(i).padStart(5, '0')}`,
    visitor_type: type,
    visitor_id_proof_type: i % 2 === 0 ? 'aadhar' : 'pan_card',
    visitor_id_proof_number: `ID-${1000 + i}`,
    student_id: student.id,
    room_id: `room-1-1-${(i % 10) + 1}`,
    check_in_time: checkInDate.toISOString(),
    check_out_time: isCheckedOut ? new Date(checkInDate.getTime() + 3600000 * (1 + (i % 3))).toISOString() : undefined,
    purpose: i === 0 ? 'Family visit' : i === 1 ? 'Social visit' : `${type.charAt(0).toUpperCase() + type.slice(1)} visit for student ${student.student_id}`,
    security_officer_id: 'user-security-1',
    created_at: checkInDate.toISOString(),
  };
});

// ============================================================
// NOTIFICATIONS
// ============================================================

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-student-1',
    type: 'payment_reminder',
    title: 'Payment Due Reminder',
    message: 'Your hostel fee of CFA 5,000 is due on April 1st, 2026.',
    is_read: false,
    sent_via: ['email', 'in_app'],
    created_at: '2026-03-25T09:00:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'user-student-1',
    type: 'complaint_update',
    title: 'Complaint Update',
    message: 'Your complaint TKT-2026-001 is now in progress.',
    is_read: true,
    sent_via: ['in_app'],
    created_at: '2026-04-04T08:05:00Z',
  },
  {
    id: 'notif-3',
    user_id: 'user-student-1',
    type: 'general',
    title: 'Hostel Notice',
    message: 'Monthly warden meeting scheduled for April 10th at 6 PM.',
    is_read: false,
    sent_via: ['in_app'],
    created_at: '2026-04-03T16:00:00Z',
  },
];
// ============================================================
// ATTENDANCE
// ============================================================

export const mockAttendance: Attendance[] = mockStudents.slice(0, 30).map((student, index) => ({
  id: `attendance-${index + 1}`,
  student_id: student.id,
  date: '2026-04-07',
  is_present: index % 5 !== 0, // Most are present
  check_in_time: index % 5 !== 0 ? '08:30:00' : undefined,
  notes: index % 5 === 0 ? 'On sanctioned leave' : undefined,
  created_at: '2026-04-07T08:00:00Z',
}));

// ============================================================
// TODOS
// ============================================================

export const mockTodos: Todo[] = [
  {
    id: 'todo-1',
    title: 'Conduct Floor 2 Inspection',
    description: 'Check for maintenance issues in Block A, Floor 2.',
    priority: 'high',
    status: 'pending',
    due_date: '2026-04-07',
    assigned_role: 'warden',
  },
  {
    id: 'todo-2',
    title: 'Verify Mess Attendance',
    description: 'Check the lunch attendance log and verify with the contractor.',
    priority: 'medium',
    status: 'completed',
    due_date: '2026-04-07',
    assigned_role: 'warden',
  },
  {
    id: 'todo-3',
    title: 'Review New Admission Files',
    description: '15 new student applications pending approval.',
    priority: 'high',
    status: 'pending',
    due_date: '2026-04-08',
    assigned_role: 'warden',
  },
  {
    id: 'todo-4',
    title: 'Order First Aid Supplies',
    priority: 'low',
    status: 'pending',
    due_date: '2026-04-10',
    assigned_role: 'warden',
  },
  {
    id: 'todo-5',
    title: 'Verify Revenue Sync Protocols',
    description: 'Ensure cross-node ledger consistency for current quarter.',
    priority: 'high',
    status: 'pending',
    due_date: '2026-04-13',
    assigned_role: 'auditor',
  },
  {
    id: 'todo-6',
    title: 'Audit Block C Personnel Logs',
    description: 'Verify security ingress metadata for premium block.',
    priority: 'medium',
    status: 'completed',
    due_date: '2026-04-12',
    assigned_role: 'auditor',
  },
  {
    id: 'todo-7',
    title: 'Archive Forensic Artifacts',
    description: 'Export and secure signed PDF reports for Q1.',
    priority: 'high',
    status: 'pending',
    due_date: '2026-04-15',
    assigned_role: 'auditor',
  },
  {
    id: 'admin-todo-1',
    title: 'Interview with new warden candidates',
    description: 'Final round of interviews for the senior warden position at Block B.',
    priority: 'high',
    status: 'pending',
    due_date: '2026-04-13',
    time: '09:00',
    category: 'personal',
    assigned_role: 'admin',
  },
  {
    id: 'admin-todo-2',
    title: 'Room allocation verification - Block B',
    description: 'Audit the manual override logs for recent student transfers.',
    priority: 'medium',
    status: 'completed',
    due_date: '2026-04-13',
    time: '10:30',
    category: 'global',
    assigned_role: 'admin',
  },
  {
    id: 'admin-todo-3',
    title: 'Review monthly balance sheet',
    description: 'Cross-verify revenue sync markers with finance department.',
    priority: 'high',
    status: 'pending',
    due_date: '2026-04-13',
    time: '13:30',
    category: 'global',
    assigned_role: 'admin',
  },
  {
    id: 'admin-todo-4',
    title: 'Site visit for maintenance requests',
    description: 'Physical inspection of Block C premium unit infrastructure.',
    priority: 'low',
    status: 'pending',
    due_date: '2026-04-13',
    time: '14:00',
    category: 'personal',
    assigned_role: 'admin',
  },
  {
    id: 'admin-todo-5',
    title: 'Security briefing for night shift',
    description: 'Personnel synchronization for upcoming night ingress protocol.',
    priority: 'medium',
    status: 'pending',
    due_date: '2026-04-13',
    time: '16:30',
    category: 'global',
    assigned_role: 'admin',
  },
];

// ============================================================
// WARDEN EVENTS
// ============================================================

export const mockWardenEvents: WardenEvent[] = [
  {
    id: 'event-1',
    title: 'Monthly Warden Meeting',
    description: 'Discuss hostel policies and upcoming maintenance schedule.',
    date: '2026-04-10',
    time: '18:00',
    type: 'meeting',
  },
  {
    id: 'event-2',
    title: 'Fire Safety Drill',
    description: 'Mandatory drill for all students and staff.',
    date: '2026-04-15',
    time: '10:00',
    type: 'other',
    building_id: 'building-1',
  },
  {
    id: 'event-3',
    title: 'Building A Inspection',
    date: '2026-04-08',
    time: '09:00',
    type: 'inspection',
    building_id: 'building-1',
  },
];

// ============================================================
// MESS PLANS
// ============================================================

export const mockMessPlans: MessPlan[] = [
  {
    id: 'mess-1',
    name: 'Standard Plan',
    description: 'Three meals a day - Breakfast, Lunch, and Dinner',
    monthly_fee: 3000,
    meals_included: ['breakfast', 'lunch', 'dinner'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mess-2',
    name: 'Lunch & Dinner Plan',
    description: 'Two meals a day - Lunch and Dinner',
    monthly_fee: 2500,
    meals_included: ['lunch', 'dinner'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mess-3',
    name: 'Lunch Only',
    description: 'Single meal - Lunch only',
    monthly_fee: 1500,
    meals_included: ['lunch'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================================
// ANALYTICS DATA
// ============================================================

export const mockDashboardAnalytics: DashboardAnalytics = {
  occupancy_rate: 85.5,
  total_students: 450,
  total_rooms: 120,
  available_rooms: 18,
  pending_payments: 45,
  total_revenue: 2250000,
  open_complaints: 12,
  recent_visitors: 8,
};

export const mockOccupancyData: OccupancyData[] = [
  {
    building_name: 'Block A - Boys Hostel',
    room_type: 'double',
    total_rooms: 30,
    total_capacity: 60,
    current_occupancy: 54,
    occupancy_percentage: 90,
  },
  {
    building_name: 'Block B - Girls Hostel',
    room_type: 'triple',
    total_rooms: 25,
    total_capacity: 75,
    current_occupancy: 60,
    occupancy_percentage: 80,
  },
  {
    building_name: 'Block C - Premium Boys',
    room_type: 'single',
    total_rooms: 20,
    total_capacity: 20,
    current_occupancy: 18,
    occupancy_percentage: 90,
  },
];

// Historical Trends for Analytics Dashboard
export const historicalOccupancyData = [
  { month: 'Oct', blockA: 78, blockB: 72, blockC: 85 },
  { month: 'Nov', blockA: 82, blockB: 75, blockC: 88 },
  { month: 'Dec', blockA: 85, blockB: 78, blockC: 92 },
  { month: 'Jan', blockA: 88, blockB: 80, blockC: 95 },
  { month: 'Feb', blockA: 90, blockB: 82, blockC: 94 },
  { month: 'Mar', blockA: 92, blockB: 85, blockC: 96 },
];

export const revenueStreamData = [
  { month: 'Apr 24', hostel: 900, mess: 600, utility: 150 },
  { month: 'May 24', hostel: 950, mess: 620, utility: 160 },
  { month: 'Jun 24', hostel: 980, mess: 650, utility: 170 },
  { month: 'Jul 24', hostel: 1000, mess: 680, utility: 180 },
  { month: 'Aug 24', hostel: 1050, mess: 700, utility: 190 },
  { month: 'Sep 24', hostel: 1100, mess: 720, utility: 200 },
  { month: 'Oct 24', hostel: 1150, mess: 750, utility: 210 },
  { month: 'Nov 24', hostel: 1180, mess: 780, utility: 220 },
  { month: 'Dec 24', hostel: 1200, mess: 800, utility: 230 },
  { month: 'Jan 25', hostel: 1220, mess: 820, utility: 240 },
  { month: 'Feb 25', hostel: 1250, mess: 850, utility: 250 },
  { month: 'Mar 25', hostel: 1280, mess: 880, utility: 260 },
  { month: 'Apr 25', hostel: 1300, mess: 900, utility: 270 },
  { month: 'May 25', hostel: 1320, mess: 920, utility: 280 },
  { month: 'Jun 25', hostel: 1350, mess: 950, utility: 290 },
  { month: 'Jul 25', hostel: 1380, mess: 980, utility: 300 },
  { month: 'Aug 25', hostel: 1400, mess: 1000, utility: 310 },
  { month: 'Sep 25', hostel: 1420, mess: 1020, utility: 320 },
  { month: 'Oct 25', hostel: 1450, mess: 1050, utility: 330 },
  { month: 'Nov 25', hostel: 1480, mess: 1080, utility: 340 },
  { month: 'Dec 25', hostel: 1500, mess: 1100, utility: 350 },
  { month: 'Jan 26', hostel: 1520, mess: 1120, utility: 360 },
  { month: 'Feb 26', hostel: 1550, mess: 1150, utility: 370 },
  { month: 'Mar 26', hostel: 1580, mess: 1180, utility: 380 },
];

export const resolutionEfficiencyData = [
  { week: 'W1', critical: 100, high: 92, medium: 85, low: 78 },
  { week: 'W2', critical: 95, high: 88, medium: 82, low: 75 },
  { week: 'W3', critical: 100, high: 95, medium: 90, low: 85 },
  { week: 'W4', critical: 98, high: 90, medium: 88, low: 82 },
];

export const satisfactionRadarData = [
  { subject: 'Security', blockA: 90, blockB: 85, blockC: 95, fullMark: 100 },
  { subject: 'Cleanliness', blockA: 85, blockB: 92, blockC: 88, fullMark: 100 },
  { subject: 'Internet', blockA: 75, blockB: 78, blockC: 92, fullMark: 100 },
  { subject: 'Comfort', blockA: 88, blockB: 85, blockC: 98, fullMark: 100 },
  { subject: 'Food', blockA: 80, blockB: 82, blockC: 85, fullMark: 100 },
  { subject: 'Service', blockA: 82, blockB: 88, blockC: 90, fullMark: 100 },
];

export const departmentalBudgetData = [
  { department: 'Maintenance', allocated: 45000, spent: 38200, color: '#D4FF3F' },
  { department: 'Mess Ops', allocated: 85000, spent: 72000, color: '#3B82F6' },
  { department: 'Security', allocated: 30000, spent: 28500, color: '#A855F7' },
  { department: 'Utilities', allocated: 55000, spent: 51000, color: '#EC4899' },
];

export const paymentComplianceData = [
  { name: 'Paid', value: 420, color: '#D4FF3F' },
  { name: 'Pending', value: 85, color: '#3B82F6' },
  { name: 'Overdue', value: 32, color: '#F43F5E' },
];

export const fiscalEventLog = [
  { id: 'FE-001', student: 'Sarah Wilson', amount: 5000, type: 'Hostel Fee', method: 'Card', time: '12m ago', status: 'verified' },
  { id: 'FE-002', student: 'Mike Ross', amount: 3000, type: 'Mess Renewal', method: 'UPI', time: '45m ago', status: 'verified' },
  { id: 'FE-003', student: 'James Bond', amount: 1500, type: 'Maintenance', method: 'Cash', time: '2h ago', status: 'pending' },
  { id: 'FE-004', student: 'Elena Gilbert', amount: 5000, type: 'Hostel Fee', method: 'Transfer', time: '3h ago', status: 'verified' },
  { id: 'FE-005', student: 'Damon Salvatore', amount: 3000, type: 'Hostel Fee', method: 'Card', time: '5h ago', status: 'flagged' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
}

export function authenticateUser(email: string, password: string): User | null {
  const user = mockUsers.find((u) => u.email === email);
  // In production, validate password hash
  return user || null;
}

export function getStudentByUserId(userId: string): Student | undefined {
  return mockStudents.find((s) => s.user_id === userId);
}

export function getRoomById(roomId: string): Room | undefined {
  return mockRooms.find((r) => r.id === roomId);
}

export function getBuildingById(buildingId: string): Building | undefined {
  return mockBuildings.find((b) => b.id === buildingId);
}

export function getAvailableRooms(gender?: 'male' | 'female'): Room[] {
  return mockRooms.filter((room) => {
    const building = mockBuildings.find((b) => b.id === room.building_id);
    const genderMatch = !gender || !building?.gender_restriction || building.gender_restriction === gender;
    return room.current_occupancy < room.capacity && room.status === 'available' && genderMatch;
  });
}
