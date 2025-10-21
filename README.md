# 🏪 StoreRating App

## 🧩 Project Summary

This project is a Full Stack Web Application built using React.js (frontend), Express.js/NestJS/Loopback (backend), and PostgreSQL/MySQL (database).
It enables users to rate stores (1–5 stars) and manages access through role-based authentication — including System Administrator, Normal User, and Store Owner.

### 👥 User Roles & Features

#### System Administrator
- Manages stores and users
- Views dashboards with totals, filters, and details
- Full access to user management
- Analytics and oversight capabilities

#### Normal User
- Register and login
- Browse and search stores
- Submit and update store ratings (1-5 stars)
- Track personal rating history

#### Store Owner
- Monitor store performance
- View user ratings and feedback
- Track average ratings over time
- Manage store details

### 🛠️ Technical Features
- Role-based authentication and authorization
- Form validations and data integrity checks
- Real-time sorting and filtering
- Responsive design with Tailwind CSS
- Client-side persistence (localStorage)
- SPA routing with proper fallbacks

## 🚀 Quick Start

To run locally (Windows PowerShell):

```powershell
cd "c:/Users/risha/OneDrive/Desktop/roxiler project"
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### 🔑 Demo Admin Access

For testing the admin features:
- Email: RKADD@gmail.com
- Password: RKADD@147852369

See `ADMIN_CREDENTIALS.md` for more details.

## 📝 Notes
- Currently uses localStorage for persistence (data stays in browser)
- Tailwind CSS loaded via CDN for development
- Production deployment ready with Vercel configuration
