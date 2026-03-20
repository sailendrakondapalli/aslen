# ASLEN TECH SOLUTIONS - Setup Guide

## 1. Supabase Setup

1. Go to https://supabase.com and create a new project
2. In the SQL Editor, run the contents of `supabase-setup.sql`
3. Go to Authentication → Providers → Enable **Google**
   - Add your Google OAuth credentials (Client ID + Secret)
   - Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy your project URL and anon key from Settings → API

## 2. Razorpay Setup

1. Go to https://razorpay.com and create an account
2. Get your **Key ID** from Settings → API Keys
3. For production, use live keys; for testing use test keys

## 3. Environment Variables

Edit `.env` with your actual values:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

## 4. Run the App

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 5. Google OAuth Redirect

In Supabase → Authentication → URL Configuration, add:
- Site URL: `http://localhost:5173` (dev) or your production URL
- Redirect URLs: `http://localhost:5173/dashboard`
