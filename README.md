
# HIPAAX

HIPAAX is a secure, real-time medical records access platform designed for healthcare professionals in Singapore. It simplifies centralized health data access while enforcing TOTP-based 2FA for regulatory compliance and patient safety.

## Live Demo
https://youtu.be/mCvbZeKa8Mk

## Features

- Secure login for healthcare staff
- TOTP 2FA setup via Google Authenticator, Authy, or Microsoft Authenticator
- Real-time patient record search
- Medical record viewing and updating
- Access audit logging (coming soon)

## Built With

- Next.js (App Router)
- React
- Tailwind CSS
- Supabase Auth (TOTP MFA)
- Next.js API Routes
- React Context / Server Actions

## Getting Started

### 1. Clone the repo

```
git clone https://github.com/t-yunqi/lifehack
cd lifehack
```

### 2. Install dependencies

```
npm install
```

### 3. Set up environment variables

Create a .env.local file and configure it in the following format:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run the development server

```
npm run dev
```

## File Structure Highlights

- /app: Routing, pages, API endpoints
- /pages/api: API routes for handling authentication and patient data  
- /utils:
> client.ts: Supabase client for browser-side operations  
> server.ts: Supabase client for server-side actions (e.g. Server Actions or API routes)  
> middleware.ts: Middleware logic (e.g. auth guards, redirects)
- .env.local: Local environment variables (excluded from Git)


## Inspiration

Fragmented medical data across systems increases the risk of diagnostic errors and delays. A 2023 U.S. study showed over 795,000 serious harms per year due to diagnostic failures. HIPAAX addresses this by offering a simpler, secure, and accessible alternative to complex EHR systems like NEHR.

