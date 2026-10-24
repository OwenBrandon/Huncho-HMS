# 🔌 API Documentation - Smart Hostel Management System

## Base URL
```
Production: https://your-project.supabase.co
Development: http://localhost:54321
```

## Authentication
All endpoints (except login/register) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 📍 Endpoints

### 🔐 Authentication

#### POST `/auth/login`
Login user and get JWT token

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "role": "student",
    "full_name": "John Doe"
  },
  "token": "jwt_token_here",
  "expires_at": "2026-04-06T12:00:00Z"
}
```

#### POST `/auth/register`
Register new student

**Request:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone_number": "+1234567890",
  "student_id": "STU2026001",
  "date_of_birth": "2005-01-15",
  "gender": "male"
}
```

#### POST `/auth/logout`
Logout user

---

### 👤 User Management

#### GET `/api/users/profile`
Get current user profile

**Response:**
```json
{
  "id": "uuid",
  "email": "student@example.com",
  "role": "student",
  "full_name": "John Doe",
  "phone_number": "+1234567890",
  "profile_picture_url": "https://...",
  "student_details": {
    "student_id": "STU2026001",
    "department": "Computer Science",
    "year_of_study": 2
  }
}
```

#### PATCH `/api/users/profile`
Update user profile

#### PATCH `/api/users/signature`
<!-- [NEW UPDATE 2026-05-02] Added for CFO/Admin digital signature matrix -->
Update digital signature matrix (CFO/Admin)

**Request:**
```json
{
  "signature_url": "https://..."
}
```

---

### 🎓 Student Management

#### GET `/api/students`
Get all students (Admin/Warden only)

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (search by name/student_id)
- `department`
- `year_of_study`

**Response:**
```json
{
  "students": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

#### GET `/api/students/:id`
Get student details

#### POST `/api/students`
Create new student (Admin only)

#### PATCH `/api/students/:id`
Update student details

#### DELETE `/api/students/:id`
Deactivate student (Admin only)

#### POST `/api/students/:id/documents`
Upload student documents

**Form Data:**
- `document_type`: "id_proof" | "address_proof" | "photo"
- `file`: File upload

---

### 🏢 Room Management

#### GET `/api/buildings`
Get all buildings

**Response:**
```json
{
  "buildings": [
    {
      "id": "uuid",
      "name": "Block A",
      "code": "BLK-A",
      "total_floors": 4,
      "gender_restriction": "male",
      "total_rooms": 50
    }
  ]
}
```

#### GET `/api/rooms`
Get all rooms

**Query Parameters:**
- `building_id`
- `status`: "available" | "occupied" | "maintenance"
- `room_type`: "single" | "double" | "triple" | "quad"
- `available_only`: boolean

#### GET `/api/rooms/:id`
Get room details with current occupants

#### POST `/api/rooms`
Create new room (Admin only)

#### PATCH `/api/rooms/:id`
Update room details

#### PATCH `/api/rooms/:id/status`
Update room status (Admin/Warden)

---

### 🛏️ Room Allocations

#### GET `/api/allocations`
Get all allocations

**Query Parameters:**
- `student_id`
- `room_id`
- `status`: "active" | "completed" | "cancelled"

#### POST `/api/allocations`
Create room allocation (Manual)

**Request:**
```json
{
  "student_id": "uuid",
  "room_id": "uuid",
  "expected_checkout_date": "2026-12-31"
}
```

#### POST `/api/allocations/auto-assign`
Auto-assign room to student

**Request:**
```json
{
  "student_id": "uuid",
  "preferences": {
    "room_type": "double",
    "has_ac": true,
    "building_preference": "uuid"
  }
}
```

**Response:**
```json
{
  "allocation": {
    "id": "uuid",
    "room": {
      "room_number": "A-201",
      "building_name": "Block A",
      "floor": 2
    },
    "allocation_date": "2026-04-05"
  },
  "message": "Room allocated successfully"
}
```

#### PATCH `/api/allocations/:id/checkout`
Process checkout

---

### 💰 Finance & Payments

#### GET `/api/payments`
Get payments

**Query Parameters:**
- `student_id`
- `status`: "pending" | "paid" | "overdue"
- `payment_type`: "hostel_fee" | "mess_fee" | "security_deposit"
- `from_date`
- `to_date`

#### GET `/api/payments/:id`
Get payment details

#### POST `/api/payments`
Create payment record (Finance Officer)

**Request:**
```json
{
  "student_id": "uuid",
  "payment_type": "hostel_fee",
  "amount": 5000.00,
  "due_date": "2026-05-01"
}
```

#### POST `/api/finance/expenses`
<!-- [NEW UPDATE 2026-05-02] Log institutional expense for system audit -->
Record institutional operation cost (Finance Officer)

**Request:**
```json
{
  "category": "utility" | "maintenance" | "administrative",
  "amount": 1250.00,
  "description": "Generator Fuel - Block A",
  "authorized_by": "uuid"
}
```

#### POST `/api/finance/requisitions`
<!-- [NEW UPDATE 2026-05-02] Added for tactical fund requests -->
Submit fund requisition (Warden/Maintenance)

**Request:**
```json
{
  "amount": 25000.00,
  "category": "Maintenance",
  "justification": "Emergency plumbing repairs in Block B"
}
```

#### PATCH `/api/finance/requisitions/:id/approve`
<!-- [NEW UPDATE 2026-05-02] Added for fiscal authorization -->
Approve fund requisition (Finance Officer)

#### POST `/api/payments/:id/process`
Process payment (Stripe integration)

**Request:**
```json
{
  "payment_method_id": "pm_xxx",
  "amount": 5000.00
}
```

**Response:**
```json
{
  "payment": {
    "id": "uuid",
    "status": "paid",
    "transaction_id": "txn_xxx",
    "receipt_url": "https://..."
  }
}
```

#### GET `/api/payments/student/:student_id/summary`
Get payment summary for student

**Response:**
```json
{
  "total_paid": 15000.00,
  "total_pending": 5000.00,
  "total_overdue": 0,
  "upcoming_payments": [...]
}
```

---

### 🎫 Complaints/Tickets

#### GET `/api/complaints`
Get complaints

**Query Parameters:**
- `student_id`
- `status`: "open" | "in_progress" | "resolved" | "closed"
- `priority`: "low" | "medium" | "high" | "critical"
- `category`
- `assigned_to`

#### GET `/api/complaints/:id`
Get complaint details

#### POST `/api/complaints`
Create complaint (Student)

**Request:**
```json
{
  "category": "maintenance",
  "priority": "medium",
  "title": "AC not working",
  "description": "The AC in my room has stopped working",
  "room_id": "uuid",
  "attachments": ["file1.jpg", "file2.jpg"]
}
```

#### PATCH `/api/complaints/:id`
Update complaint (Assigned staff)

#### PATCH `/api/complaints/:id/assign`
Assign complaint to staff (Warden)

**Request:**
```json
{
  "assigned_to": "uuid",
  "priority": "high"
}
```

#### PATCH `/api/complaints/:id/acknowledge`
<!-- [NEW UPDATE 2026-05-02] Added for Maintenance Staff field acknowledgment -->
Acknowledge task dispatch (Maintenance Staff)

**Response:**
```json
{
  "status": "in_progress",
  "acknowledged_at": "2026-05-02T14:30:00Z"
}
```

#### PATCH `/api/complaints/:id/resolve`
Resolve complaint (Maintenance staff)

**Request:**
```json
{
  "resolution_notes": "AC filter cleaned and gas refilled"
}
```

#### POST `/api/mess/book-meal`
<!-- [NEW UPDATE 2026-05-02] Added for Student Portal Quick Actions -->
Book mess meal (Student)

**Request:**
```json
{
  "student_id": "uuid",
  "meal_type": "breakfast" | "lunch" | "dinner",
  "date": "2026-05-03"
}
```

---

### 🛡️ Governance & Command

#### POST `/api/governance/directives`
<!-- [NEW UPDATE 2026-05-02] Added for Tactical Command Hub -->
Issue tactical directive (Admin/Warden)

**Request:**
```json
{
  "title": "Block A Sanitary Sweep",
  "target_unit": "maintenance_staff",
  "priority": "high"
}
```

#### POST `/api/governance/incidents`
<!-- [NEW UPDATE 2026-05-02] Added for Incident Logging (Protocol 104-B) -->
Log operational incident (Security/Staff)

**Request:**
```json
{
  "incident_type": "security_breach",
  "location": "Main Gate",
  "description": "Unauthorized access attempt at 02:00 AM"
}
```

---

### 🎯 Mission Control

#### GET `/api/missions`
<!-- [NEW UPDATE 2026-05-02] Added for Todo/Mission Hub -->
Get active missions for current role

#### PATCH `/api/missions/:id/status`
<!-- [NEW UPDATE 2026-05-02] Added for Mission completion -->
Update mission status

**Request:**
```json
{
  "status": "completed"
}
```

---

### 👥 Visitor Management

#### GET `/api/visitors`
Get visitors

**Query Parameters:**
- `student_id`
- `from_date`
- `to_date`
- `active_only`: boolean (not checked out)

#### POST `/api/visitors/check-in`
Register visitor check-in (Security)

**Request:**
```json
{
  "visitor_name": "Jane Doe",
  "visitor_phone": "+1234567890",
  "visitor_type": "family",
  "visitor_id_proof_type": "aadhar",
  "visitor_id_proof_number": "1234-5678-9012",
  "student_id": "uuid",
  "room_id": "uuid",
  "purpose": "Family visit"
}
```

#### POST `/api/visitors/:id/check-out`
Register visitor check-out (Security)

---

### 📊 Attendance

#### GET `/api/attendance`
Get attendance records

**Query Parameters:**
- `student_id`
- `from_date`
- `to_date`

#### POST `/api/attendance/mark`
Mark attendance (Security/Warden)

**Request:**
```json
{
  "student_id": "uuid",
  "date": "2026-04-05",
  "is_present": true,
  "notes": "Late night entry - 11:30 PM"
}
```

---

### 🔔 Notifications

#### GET `/api/notifications`
Get user notifications

**Query Parameters:**
- `is_read`: boolean
- `type`
- `limit`

#### PATCH `/api/notifications/:id/read`
Mark notification as read

#### PATCH `/api/notifications/read-all`
Mark all notifications as read

#### POST `/api/notifications/send`
Send notification (Admin/Warden)

**Request:**
```json
{
  "user_ids": ["uuid1", "uuid2"],
  "type": "general",
  "title": "Holiday Notice",
  "message": "Hostel will be closed from...",
  "send_via": ["email", "in_app"]
}
```

---

### 📈 Analytics & Reports

#### GET `/api/analytics/dashboard`
Get dashboard analytics (Role-specific)

**Response:**
```json
{
  "occupancy_rate": 85.5,
  "total_students": 450,
  "pending_payments": 25,
  "open_complaints": 12,
  "recent_visitors": 8,
  "revenue_this_month": 225000.00
}
```

#### GET `/api/analytics/occupancy`
Get occupancy trends

**Query Parameters:**
- `from_date`
- `to_date`
- `building_id`

#### GET `/api/analytics/payments`
Get payment analytics

#### GET `/api/analytics/complaints`
Get complaint statistics

#### GET `/api/reports/students`
Export students report (CSV/PDF)

#### GET `/api/reports/payments`
Export payments report (CSV/PDF)

---

### ⚙️ System Configuration

#### PATCH `/api/system/settings`
<!-- [NEW UPDATE 2026-05-02] Added for Global Protocol Switches -->
Update global system protocols (Admin)

**Request:**
```json
{
  "setting_key": "auto_curfew_verification",
  "setting_value": true
}
```

---

### 🍽️ Mess Management

#### GET `/api/mess-plans`
Get available mess plans

#### GET `/api/mess-subscriptions/:student_id`
Get student mess subscription

#### POST `/api/mess-subscriptions`
Subscribe to mess plan

**Request:**
```json
{
  "student_id": "uuid",
  "mess_plan_id": "uuid",
  "start_date": "2026-05-01"
}
```

---

## 🔄 Real-time Subscriptions (WebSocket)

### Subscribe to notifications
```javascript
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload)
  })
  .subscribe()
```

### Subscribe to complaint updates
```javascript
const subscription = supabase
  .channel('complaints')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'complaints',
    filter: `student_id=eq.${studentId}`
  }, (payload) => {
    console.log('Complaint updated:', payload)
  })
  .subscribe()
```

---

## 📝 Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email already exists"
    }
  }
}
```

### Error Codes
- `UNAUTHORIZED`: 401 - Missing/invalid token
- `FORBIDDEN`: 403 - Insufficient permissions
- `NOT_FOUND`: 404 - Resource not found
- `VALIDATION_ERROR`: 400 - Invalid input
- `CONFLICT`: 409 - Duplicate resource
- `INTERNAL_ERROR`: 500 - Server error

---

## 🔒 Rate Limiting

- **General API**: 100 requests/minute per user
- **File uploads**: 10 uploads/minute
- **Authentication**: 5 login attempts/minute

---

## 📦 Pagination

Standard pagination format:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 🧪 Testing

### Get API Token (for testing)
```bash
curl -X POST https://your-project.supabase.co/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Example API Call
```bash
curl -X GET https://your-project.supabase.co/rest/v1/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "apikey: YOUR_ANON_KEY"
```
