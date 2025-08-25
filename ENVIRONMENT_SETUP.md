# Environment Variables Setup

## ⚠️ Important Security Note
Environment files (`.env.*`) contain sensitive information and should NEVER be committed to Git. Always use the `.example` files as templates.

## Setup Instructions

### 1. Frontend Environment Variables

Copy the example file and fill in your actual values:
```bash
cp frontend/.env.production.example frontend/.env.production
cp frontend/.env.development.example frontend/.env.development
```

### 2. Backend Environment Variables

Copy the example file and fill in your actual values:
```bash
cp backend/.env.production.example backend/.env.production
```

### 3. Required API Keys

You'll need to obtain the following API keys:

- **Clerk**: Get from [clerk.com](https://clerk.com)
- **Stripe**: Get from [stripe.com](https://stripe.com)
- **MongoDB**: Get connection string from [mongodb.com](https://mongodb.com)
- **Cloudinary**: Get from [cloudinary.com](https://cloudinary.com)
- **Google OAuth**: Get from [console.cloud.google.com](https://console.cloud.google.com)
- **Gemini API**: Get from [ai.google.dev](https://ai.google.dev)

### 4. Deployment

For production deployment:
- Add environment variables to your hosting platform (Vercel, Render, etc.)
- Never expose secret keys in client-side code
- Use different keys for development and production

## File Structure
```
├── frontend/
│   ├── .env.development      # Local development (ignored by Git)
│   ├── .env.production       # Production config (ignored by Git)
│   ├── .env.development.example  # Template for development
│   └── .env.production.example   # Template for production
└── backend/
    ├── .env.production       # Production config (ignored by Git)
    └── .env.production.example   # Template for production
```
