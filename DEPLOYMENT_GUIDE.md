# 🚀 SmartBill Complete Full-Stack Deployment Guide

This guide walks you through deploying **SmartBill** (Backend + CRM + Admin Panel + Landing Page) online for **100% FREE** using modern cloud hosting platforms:
- **Backend API**: [Render](https://render.com) (Free Node.js Web Service) or [Railway](https://railway.app)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Free 512MB M0 Cluster)
- **Frontend Apps**: [Vercel](https://vercel.com) or [Render](https://render.com) (Free Static Site Hosting)

---

## 📋 Pre-Deployment Checklist

Before starting, ensure you have:
1. Your project pushed to a GitHub repository: `https://github.com/Prathameshbhavsar26/SmartBill`
2. A free [MongoDB Atlas Account](https://www.mongodb.com/atlas)
3. A free [Render Account](https://render.com) (Sign in with GitHub)
4. A free [Vercel Account](https://vercel.com) (Sign in with GitHub)

---

## Step 1: Set Up Free MongoDB Database (MongoDB Atlas)

1. Log in to [MongoDB Atlas](https://account.mongodb.com/account/login).
2. Click **Build a Database** → Choose the **FREE (M0)** shared tier.
3. Choose a cloud provider and region closest to your users (e.g. AWS / Mumbai `ap-south-1`).
4. Click **Create Deployment**.
5. **Create a Database User**:
   - Username: `smartbill_admin`
   - Password: `<Generate a strong password and copy it>`
6. **Configure IP Access List**:
   - Go to **Network Access** → Click **Add IP Address**.
   - Choose **Allow Access from Anywhere (`0.0.0.0/0`)** → Click **Confirm**.
7. **Get Connection String**:
   - Go to **Database** → Click **Connect** → Choose **Drivers** (Node.js).
   - Copy the connection URI:
     ```
     mongodb+srv://smartbill_admin:<password>@cluster0.xxxxx.mongodb.net/smartbill?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password.

---

## Step 2: Deploy Backend API on Render (FREE)

### Method A: One-Click Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository `SmartBill`.
4. Render will read `render.yaml` automatically.
5. In the environment variable prompts, enter:
   - `MONGODB_URI`: Your MongoDB connection string from Step 1.
   - `SUPERADMIN_PASSWORD`: Your desired password for SuperAdmin (e.g. `SuperAdmin@2026!`).
6. Click **Apply**. Render will automatically build and deploy the Backend API!

---

### Method B: Manual Web Service on Render
If you prefer setting it up manually:
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your `SmartBill` repository.
3. Configure the service:
   - **Name**: `smartbill-backend`
   - **Region**: Oregon (or closest)
   - **Root Directory**: `Backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
4. Add **Environment Variables** under the Environment tab:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://...` (from Step 1) |
   | `JWT_SECRET` | `your_secret_jwt_key_at_least_32_characters_long` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `SUPERADMIN_EMAIL` | `admin@smartbill.com` |
   | `SUPERADMIN_PASSWORD` | `YourStrongPassword123!` |
   | `ALLOWED_ORIGINS` | `*` |
5. Click **Create Web Service**.
6. Once deployed, note your backend public URL (e.g., `https://smartbill-backend.onrender.com`).
7. Test the health endpoint: `https://smartbill-backend.onrender.com/health` → Should return `{"status": "healthy"}`.

---

## Step 3: Deploy Frontend Apps on Vercel (FREE)

You can deploy the 3 frontend apps (**CRM**, **Admin Panel**, **Landing Page**) on Vercel with dedicated URLs:

### 1. Deploy CRM / POS App (`apps/crm`)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Click **Add New...** → **Project**.
2. Select your `SmartBill` repository.
3. Configure settings:
   - **Project Name**: `smartbill-crm`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` → select `apps/crm`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://smartbill-backend.onrender.com/api` |
5. Click **Deploy**.
6. Your CRM will be live at `https://smartbill-crm.vercel.app`!

---

### 2. Deploy SuperAdmin Panel (`apps/admin-panel`)
1. In Vercel, click **Add New...** → **Project** → Select `SmartBill`.
2. Configure settings:
   - **Project Name**: `smartbill-admin`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/admin-panel`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://smartbill-backend.onrender.com/api` |
4. Click **Deploy**.
5. Your Admin Panel will be live at `https://smartbill-admin.vercel.app`!

---

### 3. Deploy Landing Page (`apps/landing-page`)
1. In Vercel, click **Add New...** → **Project** → Select `SmartBill`.
2. Configure settings:
   - **Project Name**: `smartbill-landing`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/landing-page`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variables (link other apps):
   | Key | Value |
   |---|---|
   | `VITE_CRM_URL` | `https://smartbill-crm.vercel.app` |
   | `VITE_ADMIN_URL` | `https://smartbill-admin.vercel.app` |
   | `VITE_API_BASE_URL` | `https://smartbill-backend.onrender.com/api` |
4. Click **Deploy**.
5. Your Landing Page will be live at `https://smartbill-landing.vercel.app`!

---

## Step 4: Login & Verify Live Production System

1. **SuperAdmin Login**:
   - URL: `https://smartbill-admin.vercel.app`
   - Email: `admin@smartbill.com`
   - Password: The password configured in `SUPERADMIN_PASSWORD`.

2. **Business Owner Registration & CRM**:
   - URL: `https://smartbill-crm.vercel.app`
   - Register a new business owner account or login.
   - Test creating customers, products, POS invoices, inventory, and subscription tabs.

---

## 🛠️ Alternative Hosting Options

| Platform | Best For | Free Tier? |
|---|---|---|
| **Render** | Backend API & Full Blueprint | Yes (Free Web Services & Static Sites) |
| **Vercel** | Vite / React Frontends | Yes (Unlimited projects & fast Edge CDN) |
| **Railway** | Backend & MongoDB | Yes ($5 monthly credit trial) |
| **Netlify** | Static Frontends | Yes |
| **Docker / VPS** | Self-hosting on Ubuntu / AWS / DigitalOcean | Uses `docker-compose up -d` |
