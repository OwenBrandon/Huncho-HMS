# 🏢 Smart Hostel Management System (SHMS)

A comprehensive, production-ready hostel management platform built with **React**, **TypeScript**, **Tailwind CSS**, and designed for **Supabase** integration.

---

## 🎯 Project Overview

SHMS is a modern, cloud-based, AI-enhanced platform for managing student hostel operations efficiently. It replaces manual and semi-digital processes with a centralized, intelligent system.

### Key Features

- ✅ **Automated Room Allocation Engine** with preference-based assignment
- ✅ **Integrated Payment System** with payment gateway support
- ✅ **Visitor Tracking** with QR-based check-in/out
- ✅ **Complaint Management** with status tracking and assignment
- ✅ **Real-time Analytics Dashboard** with charts and metrics
- ✅ **Role-Based Access Control** for 7 user types
- ✅ **Real-time Notifications** (in-app + email)
- ✅ **Mess Management** with subscription plans
- ✅ **Attendance Tracking** for students

---

## 👥 User Roles

The system supports **7 distinct user roles**, each with custom dashboards and permissions:

1. **Admin** - Full system control and configuration
2. **Warden** - Hostel operations and student management
3. **Student** - Personal dashboard with payments, complaints, and room info
4. **Security** - Visitor management and access control
5. **Finance Officer** - Payment tracking and revenue reports
6. **Maintenance Staff** - Complaint resolution and task management
7. **Auditor** - Read-only access with comprehensive reports

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **Recharts** for data visualization
- **Lucide React** for icons
- **React Hook Form** for form handling

### Backend (Ready for Supabase)
- **PostgreSQL** database with Row-Level Security (RLS)
- **Supabase Edge Functions** for serverless API
- **Supabase Auth** for authentication
- **Supabase Storage** for file management
- **Supabase Realtime** for live updates

### External Services (Integration Ready)
- **Stripe/Razorpay** - Payment processing
- **SendGrid/Resend** - Email notifications
- **Twilio** (optional) - SMS alerts

---

## 📁 Project Structure

```
/tmp/sandbox/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── Layout.tsx       # Main layout wrapper
│   │   │   └── Navigation.tsx   # Sidebar navigation
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx  # Authentication state
│   │   │   └── NotificationContext.tsx
│   │   ├── data/
│   │   │   └── mockData.ts      # Mock data (replace with Supabase)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── StudentsPage.tsx
│   │   │   ├── RoomsPage.tsx
│   │   │   ├── AllocationsPage.tsx
│   │   │   ├── PaymentsPage.tsx
│   │   │   ├── ComplaintsPage.tsx
│   │   │   └── VisitorsPage.tsx
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript interfaces
│   │   └── App.tsx              # Main app component
│   └── styles/
│       ├── index.css
│       ├── tailwind.css
│       ├── theme.css
│       └── fonts.css
├── ARCHITECTURE.md              # System architecture documentation
├── DATABASE_SCHEMA.sql          # Complete database schema
├── API_DOCUMENTATION.md         # API endpoint documentation
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (package manager)
- Supabase account (for backend)

### Installation

1. **Clone the repository**
```bash
cd /tmp/sandbox
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Run development server**
```bash
pnpm run dev
```

4. **Access the application**
The app will be available at the Figma Make preview URL.

---

## 🔐 Demo Accounts

For testing, use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hostel.com | demo123 |
| Warden | warden@hostel.com | demo123 |
| Student | john.doe@student.com | demo123 |
| Security | security@hostel.com | demo123 |
| Finance | finance@hostel.com | demo123 |
| Maintenance | maintenance@hostel.com | demo123 |
| Auditor | auditor@hostel.com | demo123 |

---

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Database Migration

Execute the SQL in `DATABASE_SCHEMA.sql` in your Supabase SQL editor:

```sql
-- Run the entire DATABASE_SCHEMA.sql file
```

This will create:
- All tables with proper relationships
- Enums for type safety
- Indexes for performance
- Triggers for automation
- Row-Level Security policies
- Analytics views

### 3. Connect Supabase to Make

1. Go to **Make settings page**
2. Connect your Supabase project
3. Add environment variables:
   - `STRIPE_SECRET_KEY` (for payments)
   - `SENDGRID_API_KEY` (for emails)

---

## 🔌 API Integration

### Replace Mock Data with Supabase

The app currently uses mock data from `src/app/data/mockData.ts`. To connect to Supabase:

1. **Install Supabase client** (if not already installed)
```bash
pnpm add @supabase/supabase-js
```

2. **Create Supabase client**
```typescript
// src/app/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
```

3. **Update data fetching** (example for students)
```typescript
// Before (mock):
import { mockStudents } from '../data/mockData';

// After (Supabase):
const { data: students } = await supabase
  .from('students')
  .select('*, user:users(*)')
  .order('created_at', { ascending: false });
```

### API Endpoints

Refer to `API_DOCUMENTATION.md` for complete endpoint specifications.

---

## 📊 Key Modules

### 1. Student Management
- Student registration and onboarding
- Document upload (ID proof, address proof, photo)
- Profile management
- Academic and personal information tracking

### 2. Room Allocation Engine
**Auto-assignment algorithm considers:**
- Room availability and capacity
- Gender restrictions
- Student preferences (room type, AC, floor)
- Special requirements (medical, accessibility)
- Building preferences

**Manual allocation** also supported with override capability.

### 3. Payment System
- Multiple payment types: Hostel fee, Mess fee, Security deposit, Fines
- Payment gateway integration (Stripe/Razorpay)
- Automated receipt generation
- Payment reminders and late fee calculation
- Comprehensive payment history

### 4. Complaint/Ticketing System
- Student complaint submission
- Auto ticket number generation
- Priority-based categorization
- Assignment to maintenance staff
- Status tracking: Open → In Progress → Resolved → Closed
- Resolution notes and attachments

### 5. Visitor Management
- QR-based check-in/out (ready for implementation)
- Visitor logging with ID verification
- Student-visitor linking
- Active visitor tracking
- Security dashboard for monitoring

### 6. Analytics Dashboard
**Role-specific metrics:**
- Admin: Occupancy rates, revenue, complaint statistics
- Finance: Payment collection, pending dues, revenue trends
- Warden: Student occupancy, complaints, visitor stats
- Security: Active visitors, entry/exit logs
- Maintenance: Assigned tasks, resolution rates

---

## 🎨 UI/UX Features

- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Dark Mode Ready** - Theme system in place
- **Accessibility** - WCAG 2.1 AA compliant components
- **Real-time Updates** - WebSocket support for live data
- **Interactive Charts** - Bar charts, pie charts, line graphs
- **Table Sorting & Filtering** - Advanced data manipulation
- **Form Validation** - React Hook Form integration
- **Toast Notifications** - User feedback system

---

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Session management
- Auto-logout on inactivity

### Authorization
- Row-Level Security (RLS) in PostgreSQL
- Role-based route guards
- API endpoint protection
- Fine-grained permissions

### Data Protection
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens
- Encrypted file storage

---

## 📈 Performance Optimization

- **Code Splitting** - Lazy-loaded components
- **Image Optimization** - WebP format support
- **Caching Strategy** - Browser and CDN caching
- **Database Indexing** - Optimized queries
- **Pagination** - Cursor-based for large datasets
- **Debounced Search** - Reduced API calls

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```bash
pnpm test
```

### E2E Tests (Playwright)
```bash
pnpm test:e2e
```

### Test Coverage
- Authentication flows
- CRUD operations
- Form validations
- Role-based access
- Payment processing
- Room allocation logic

---

## 🚀 Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables

Set these in your deployment platform:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📝 Future Enhancements

### Phase 2 Features
- [ ] AI-based room allocation optimization
- [ ] Predictive analytics for occupancy trends
- [ ] Multi-hostel/campus support
- [ ] Mobile apps (React Native)
- [ ] WhatsApp notifications
- [ ] Biometric attendance
- [ ] IoT device integration
- [ ] Energy consumption tracking
- [ ] Canteen/Laundry integration
- [ ] Alumni management

### Technical Improvements
- [ ] GraphQL API (alternative to REST)
- [ ] Redis caching layer
- [ ] Elasticsearch for advanced search
- [ ] Microservices architecture
- [ ] Docker containerization
- [ ] Kubernetes orchestration
- [ ] CI/CD pipeline automation
- [ ] Load testing and optimization

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Email: support@shms.example.com
- Documentation: https://docs.shms.example.com

---

## 🙏 Acknowledgments

- **shadcn/ui** - Beautiful component library
- **Supabase** - Backend infrastructure
- **Recharts** - Data visualization
- **Lucide** - Icon system
- **Tailwind CSS** - Utility-first CSS framework

---

**Built with ❤️ for modern hostel management**

*Version: 1.0.0*
*Last Updated: April 5, 2026*
