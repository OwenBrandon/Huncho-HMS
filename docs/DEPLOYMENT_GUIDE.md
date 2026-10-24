# 🚀 SHMS Deployment Guide

Complete step-by-step guide to deploy the Smart Hostel Management System to production.

---

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema migrated
- [ ] Environment variables configured
- [ ] Payment gateway account (Stripe/Razorpay)
- [ ] Email service account (SendGrid/Resend)
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (auto-provided by Vercel/Netlify)

---

## 🗄️ Part 1: Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: "SHMS Production" (or your choice)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Run Database Migration

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Copy the entire contents of `DATABASE_SCHEMA.sql`
4. Paste and click **"Run"**
5. Verify tables are created in **Table Editor**

### Step 3: Configure Row-Level Security

The schema includes RLS policies, but verify they're enabled:

1. Go to **Authentication** → **Policies**
2. Ensure all tables have policies enabled
3. Test with a sample user

### Step 4: Set Up Storage Buckets

1. Go to **Storage**
2. Create buckets:
   - `student-documents` (for ID proofs, photos)
   - `receipts` (for payment receipts)
   - `complaint-attachments` (for complaint images)
3. Set policies for each bucket

### Step 5: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates:
   - Confirmation
   - Password reset
   - Magic link (optional)
4. Set **Site URL** to your domain
5. Add **Redirect URLs** for your domain

### Step 6: Get API Keys

1. Go to **Settings** → **API**
2. Copy:
   - `Project URL`
   - `anon/public` key
   - `service_role` key (keep secret!)
3. Save these for environment variables

---

## 🔌 Part 2: External Service Configuration

### Stripe (Payment Gateway)

1. Create account at [stripe.com](https://stripe.com)
2. Go to **Developers** → **API Keys**
3. Copy:
   - **Publishable key** (for frontend)
   - **Secret key** (for backend - store in Supabase secrets)
4. Set up webhooks:
   - Endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy **Webhook signing secret**

### SendGrid (Email Service)

1. Create account at [sendgrid.com](https://sendgrid.com)
2. Go to **Settings** → **API Keys**
3. Create new API key with **Full Access**
4. Copy and save the API key
5. Verify sender email:
   - Go to **Settings** → **Sender Authentication**
   - Verify your domain or single sender email
6. Create email templates for:
   - Payment receipts
   - Complaint updates
   - Payment reminders
   - Welcome emails

### Alternative: Resend (Simpler Email Service)

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Create API key
4. Use their React Email templates

---

## 🌐 Part 3: Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Configure Project

1. In your project root, create `vercel.json`:

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_STRIPE_PUBLISHABLE_KEY": "@stripe-publishable-key"
  }
}
```

### Step 3: Set Environment Variables

```bash
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase anon key

vercel env add VITE_STRIPE_PUBLISHABLE_KEY
# Paste your Stripe publishable key
```

### Step 4: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 5: Configure Custom Domain (Optional)

1. Go to Vercel dashboard → **Settings** → **Domains**
2. Add your domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic)

---

## 🔧 Part 4: Backend Setup (Supabase Edge Functions)

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Initialize Supabase

```bash
supabase init
supabase login
supabase link --project-ref your-project-ref
```

### Step 3: Create Edge Functions

Create function for room auto-allocation:

```bash
supabase functions new auto-allocate-room
```

Edit `supabase/functions/auto-allocate-room/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { studentId, preferences } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Auto-allocation logic
  const { data: availableRooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('status', 'available')
    .lt('current_occupancy', supabase.raw('capacity'));

  // Filter by gender, preferences, etc.
  // Assign best match

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Step 4: Deploy Edge Functions

```bash
supabase functions deploy auto-allocate-room
```

### Step 5: Set Function Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set SENDGRID_API_KEY=SG...
```

---

## 🔐 Part 5: Security Hardening

### 1. Configure CORS

In Supabase dashboard:
- Go to **Settings** → **API**
- Set allowed origins to your domain only

### 2. Enable Rate Limiting

Add rate limiting in Edge Functions:

```typescript
import { RateLimiter } from 'https://deno.land/x/rate_limiter@1.0.0/mod.ts';

const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: 'minute',
});
```

### 3. Configure Content Security Policy

Add to Vercel headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

### 4. Enable HTTPS Only

In Vercel:
- Automatic HTTPS enforcement
- HSTS headers enabled by default

### 5. Rotate API Keys Regularly

- Schedule monthly API key rotation
- Update in all environments

---

## 📊 Part 6: Monitoring & Analytics

### Set Up Sentry (Error Tracking)

1. Create account at [sentry.io](https://sentry.io)
2. Create new project
3. Install SDK:

```bash
pnpm add @sentry/react @sentry/vite-plugin
```

4. Configure in `src/main.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-dsn",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### Set Up Vercel Analytics

1. Go to Vercel dashboard → **Analytics**
2. Enable Web Analytics
3. Add script to `index.html`

### Supabase Monitoring

1. Go to **Reports** in Supabase dashboard
2. Monitor:
   - API usage
   - Database performance
   - Storage usage
   - Function invocations

---

## 🧪 Part 7: Testing Production

### Smoke Tests

1. **Authentication**
   - [ ] Login with all 7 user roles
   - [ ] Logout
   - [ ] Password reset

2. **Student Module**
   - [ ] Create new student
   - [ ] View student list
   - [ ] Edit student profile

3. **Room Allocation**
   - [ ] Manual allocation
   - [ ] Auto allocation
   - [ ] Check-out process

4. **Payments**
   - [ ] Create payment record
   - [ ] Process payment (Stripe test mode)
   - [ ] Download receipt

5. **Complaints**
   - [ ] Submit complaint
   - [ ] Assign to staff
   - [ ] Resolve complaint

6. **Visitors**
   - [ ] Check-in visitor
   - [ ] Check-out visitor

### Performance Testing

```bash
# Use Lighthouse
npx lighthouse https://your-domain.com --view

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
```

---

## 🔄 Part 8: CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📱 Part 9: Mobile Responsiveness Check

Test on:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Desktop (Chrome, Firefox, Safari, Edge)

---

## 🎯 Part 10: Go-Live Checklist

### Before Launch
- [ ] All database migrations applied
- [ ] Environment variables set
- [ ] SSL certificate active
- [ ] Payment gateway in live mode
- [ ] Email service configured
- [ ] Monitoring tools active
- [ ] Backup strategy in place
- [ ] Documentation complete

### Launch Day
- [ ] Final smoke tests
- [ ] Load testing
- [ ] Monitor error rates
- [ ] Check email deliverability
- [ ] Verify payment processing
- [ ] Test with real users (beta)

### Post-Launch
- [ ] Monitor performance daily
- [ ] Collect user feedback
- [ ] Address critical bugs within 24h
- [ ] Plan next iteration

---

## 🆘 Troubleshooting

### Common Issues

**Issue: CORS errors**
- Solution: Add domain to Supabase allowed origins

**Issue: Payments not processing**
- Solution: Check Stripe webhook configuration and API keys

**Issue: Emails not sending**
- Solution: Verify SendGrid sender authentication

**Issue: Slow page loads**
- Solution: Enable CDN, optimize images, add caching

**Issue: Database connection errors**
- Solution: Check Supabase connection pooler settings

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Community Discord**: [Your Discord link]

---

## 🎉 Congratulations!

Your Smart Hostel Management System is now live in production!

**Next Steps:**
1. Onboard your first users
2. Collect feedback
3. Iterate and improve
4. Scale as needed

---

*Last Updated: April 5, 2026*
*Version: 1.0.0*
