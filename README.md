# Reservelt – Rental Management

> A unified platform to manage rental products, availability, bookings, and checkout with flexible pricing (hour, week, month, year).

---

## 📌 Overview

**Reservelt** streamlines the rental workflow for businesses and customers:

- Browse available products 
- Reserve dates/times with live availability
- Flexible pricing per product (hourly/weekly/monthly/yearly)
- Seamless checkout and booking confirmation

---

## 🎯 Problem Statement

Traditional rental operations are error-prone and manual: scheduling clashes, scattered pricing rules, and limited visibility. **Reservelt** digitizes this flow—centralizing inventory, pricing, booking, and payments—so teams work faster and customers self-serve with confidence.

---


## Example .env Configuration

Create a `.env` file in your project root with the following structure:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_SERVICE=gmail

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

VITE_API_BASE_URL=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

**Note:** Replace all `your_*` values with your actual credentials. Never commit real secrets to your repository!

- **Product**: name, description, media, SKU, stock/quantity  
- **PricingRule**: unit (hour/week/month/year), rate, min/max duration, seasonal rules  
- **Inventory/Availability**: quantity by product, blackout periods  
- **Reservation**: product(s), start/end, status, total  
- **Customer**: profile, payments, history  
- **EndUser**: identity/contact (linked or separate from Customer)  
- **Payment**: method, transaction id, refund status

---

## 🏗️ Tech Stack

> Replace with your stack. Example:

- **Frontend**:  React  
- **Backend**: Node.js (Express/Nest)  
- **Database**: PostgreSQL / MongoDB  
- **Auth**: clerk 
- **Payments**: Stripe 


---

## 🛠️ Getting Started (Local)

```bash
# 1) Clone
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>

# 2) Configure env
cp .env.example .env
# Fill in DB_URL, PAYMENT_KEYS, EMAIL/SMS keys, etc.

# 3) Install
npm install
# or: pnpm install / yarn

# 4) Setup DB (example)
npm run db:migrate
npm run db:seed

# 5) Start dev
npm run dev
