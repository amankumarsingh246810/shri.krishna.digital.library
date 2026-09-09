# 📚 Shri Krishna Digital Library

> **A modern digital library management platform for students and library administrators.**

Shri Krishna Digital Library is a full-stack web application developed for **Shri Krishna Digital Library, Musaila Chauraha, Deoria**.

The platform combines a responsive student-facing web application with a secure administrative management system. It provides student authentication, student management, fee and payment tracking, payment auditing, notifications, Firebase integration, and a structured REST API backed by MongoDB.

The project is designed to provide a centralized digital platform for managing day-to-day library operations while giving students a convenient way to access their account and fee-related information.

---

## 🌐 Project Overview

The application follows a **client-server architecture**:

```text
                         Shri Krishna Digital Library
                                    │
                   ┌────────────────┴────────────────┐
                   │                                 │
              React Client                     Express Server
                   │                                 │
          ┌────────┼────────┐              ┌─────────┼─────────┐
          │        │        │              │         │         │
       Student   Admin   Services        Routes   Controllers  Jobs
          │        │        │              │         │
          └────────┴────────┘              │      Middleware
                   │                       │         │
                   └────────── API ────────┘         │
                                                   Models
                                                      │
                                                      ▼
                                                 MongoDB
                                                      │
                                      ┌───────────────┴───────────────┐
                                      │                               │
                                Firebase Auth                  Firebase FCM
```

The frontend communicates with the Express backend through REST APIs. The backend handles business logic, authorization, payment operations, notifications, and database access. Firebase is used for student authentication and push-notification functionality.

---

# ✨ Key Features

## 👨‍🎓 Student Features

* Student login using Firebase Authentication
* Phone/OTP-based authentication
* Protected student dashboard
* Student profile information
* Current fee/payment status
* Payment history
* Student-specific notifications
* Firebase Cloud Messaging integration
* Automatic Firebase ID-token handling
* Secure logout
* Responsive student interface

The frontend contains dedicated student login and dashboard pages, while student-specific API requests are handled through the centralized Axios service and Firebase authentication layer.

---

## 👨‍💼 Admin Features

The application provides a separate administrative interface for library operators.

### Admin capabilities include:

* Admin authentication
* Admin dashboard
* Student management
* Fee management
* Payment management
* Payment history
* Payment audit/correction management
* Notification management
* Student-related administrative operations
* Protected admin routes

The current frontend contains dedicated pages for `AdminDashboard`, `AdminLogin`, `FeeManagement`, `Notifications`, `PaymentHistory`, and `StudentManagement`.

---

## 💰 Fee & Payment Management

The backend contains dedicated payment functionality rather than treating payments as generic student data.

The system includes:

* Payment records
* Student-specific payment tracking
* Monthly fee status
* Payment history
* Payment audit records
* Payment correction/audit functionality
* Admin-side payment management

The backend separates payment controllers, payment routes, payment models, and payment-audit functionality, providing a clear separation of responsibilities.

---

## 🔔 Notifications

The platform includes notification functionality for communicating with students.

The notification architecture includes:

* Frontend notification utilities
* Firebase Cloud Messaging
* Backend notification service
* Notification API routes
* Notification controller
* Notification database model
* Student FCM-token management
* Admin notification interface

The client contains dedicated Firebase and notification services, while the server provides notification routes, controllers, services, and persistence.

---

## 🔐 Authentication & Authorization

The application uses separate authentication mechanisms for the two primary user types.

### Student Authentication

Students authenticate through Firebase Authentication.

Student API requests obtain the current Firebase ID token automatically through the centralized Axios interceptor. The client also attempts a token refresh when a student request receives an HTTP `401` response.

### Admin Authentication

Administrative API requests use a JWT-based authentication mechanism.

The client automatically attaches the stored admin token to protected API requests, while the backend contains dedicated authentication and authorization middleware.

This separation allows student and administrator authentication flows to remain independent.

---

# 🏗️ Architecture

The backend follows a layered architecture:

```text
Client
  │
  ▼
REST API
  │
  ▼
Routes
  │
  ▼
Authentication / Authorization Middleware
  │
  ▼
Controllers
  │
  ├──────────────► Services
  │
  ▼
Models
  │
  ▼
MongoDB
```

The Express application currently exposes separate API namespaces for authentication, dashboard operations, student management, payments, payment audits, student authentication, and notifications. It also includes a health-check endpoint, 404 handling, and a global error handler.

---

# 🛠️ Technology Stack

## Frontend

* **React 18**
* **JavaScript / ES Modules**
* **React Router**
* **Axios**
* **Firebase**
* **Lucide React**
* **Vite**
* **CSS**

The current client package uses React 18.3.1, React Router, Axios, Firebase, Lucide React, and Vite 5.4.x.

## Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **Firebase Admin SDK**
* **JWT**
* **bcryptjs**
* **Helmet**
* **CORS**
* **Morgan**
* **node-cron**
* **dotenv**

The backend package currently defines Express, Mongoose, Firebase Admin, JWT, bcryptjs, Helmet, CORS, Morgan, MongoDB, and node-cron as its primary dependencies.

## Database

* **MongoDB**
* **Mongoose ODM**

## Authentication

* **Firebase Authentication** — student authentication
* **JSON Web Tokens (JWT)** — admin authentication

## Notifications

* **Firebase Cloud Messaging (FCM)**

## Development & Tooling

* **Git**
* **GitHub**
* **npm**
* **Vite**
* **Nodemon**

---

# 📂 Project Structure

```text
shri.krishna.digital.library/
│
├── client/                              # React frontend
│   │
│   ├── public/
│   │   └── firebase-messaging-sw.js     # Firebase messaging service worker
│   │
│   ├── src/
│   │   │
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── AuthShell.jsx
│   │   │   └── StudentProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminLogin.jsx
│   │   │   │   ├── FeeManagement.jsx
│   │   │   │   ├── Notifications.jsx
│   │   │   │   ├── PaymentHistory.jsx
│   │   │   │   └── StudentManagement.jsx
│   │   │   │
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   └── StudentLogin.jsx
│   │   │   │
│   │   │   └── Home.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── firebase.js
│   │   │   └── notification.js
│   │   │
│   │   ├── styles/
│   │   │   └── auth.css
│   │   │
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
│
├── server/                              # Node.js + Express backend
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── firebaseAdmin.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── notificationController.js
│   │   ├── paymentAuditController.js
│   │   ├── paymentController.js
│   │   ├── studentAuthController.js
│   │   └── studentController.js
│   │
│   ├── jobs/
│   │   └── feeReminderJob.js
│   │
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   └── studentAuthMiddleware.js
│   │
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Notification.js
│   │   ├── Payment.js
│   │   ├── PaymentAudit.js
│   │   └── Student.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── paymentAuditRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── studentAuthRoutes.js
│   │   └── studentRoutes.js
│   │
│   ├── services/
│   │   └── notificationService.js
│   │
│   ├── utils/
│   │   ├── createAdmin.js
│   │   ├── jwt.js
│   │   └── password.js
│   │
│   ├── .env.example
│   ├── app.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── .gitignore
├── IMPLEMENTATION_PLAN.md
├── README.md
├── eslint.config.js
├── package.json
├── package-lock.json
└── vite.config.js
```

The repository currently separates the React client and Express server into independent application layers, with dedicated frontend services/pages and backend routes/controllers/models/middleware.

---

# 🔌 API Architecture

The Express backend currently exposes the following major API groups:

| API Base Path         | Responsibility                                  |
| --------------------- | ----------------------------------------------- |
| `/api/health`         | Server health check                             |
| `/api/auth`           | Admin authentication                            |
| `/api/dashboard`      | Admin dashboard operations                      |
| `/api/students`       | Student management                              |
| `/api/payments`       | Payment management                              |
| `/api/payment-audits` | Payment auditing/corrections                    |
| `/api/student-auth`   | Student authentication and student account APIs |
| `/api/notifications`  | Notification operations                         |

These routes are registered centrally inside the Express application.

---

# 🔄 Authentication Flow

## Student Flow

```text
Student
   │
   ▼
Student Login
   │
   ▼
Firebase Authentication
   │
   ▼
Firebase ID Token
   │
   ▼
React API Service
   │
   ▼
/api/student-auth/*
   │
   ▼
Student Authentication Middleware
   │
   ▼
Student Controller
   │
   ▼
MongoDB
```

The frontend API service automatically retrieves the Firebase ID token for student-authenticated requests and attaches it as a Bearer token. It can force-refresh the token and retry a failed request once after a `401` response.

---

## Admin Flow

```text
Admin
  │
  ▼
Admin Login
  │
  ▼
Backend Authentication
  │
  ▼
JWT
  │
  ▼
React API Service
  │
  ▼
Protected Admin API
  │
  ▼
Admin Middleware
  │
  ▼
Controller
  │
  ▼
MongoDB
```

---

# 🗄️ Database Models

The backend currently contains the following Mongoose models:

* `Admin`
* `Student`
* `Payment`
* `PaymentAudit`
* `Notification`

This separation provides dedicated persistence models for users, students, financial records, audit information, and notifications.

---

# 🔔 Notification Architecture

The notification system is structured across multiple layers:

```text
Admin / Scheduled Process
          │
          ▼
Notification Controller / Job
          │
          ▼
Notification Service
          │
          ▼
Firebase Cloud Messaging
          │
          ▼
Student Device / Browser
```

The backend also stores notification-related information and student FCM tokens, allowing the system to target individual students.

---

# ⏰ Fee Reminder System

The backend contains a dedicated `feeReminderJob.js` using `node-cron`.

The implemented job checks active students for unpaid monthly fees and can send fee-reminder push notifications to students who have registered FCM tokens. The scheduler is configured for a daily 10:00 AM execution time.

### Current production status

The current `server.js` explicitly reports that **automatic fee reminders are paused**, with manual notifications from the admin panel being used for now. Therefore, the scheduled job exists in the codebase but should not be described as currently active in production until it is enabled.

---

# 🛡️ Security Considerations

The project includes several security-oriented mechanisms:

* JWT-based admin authentication
* Firebase ID-token verification for student authentication
* Password hashing with `bcryptjs`
* Protected API middleware
* CORS configuration
* HTTP security middleware through Helmet
* Environment-based configuration
* `.env` files excluded from Git
* Centralized authentication handling
* Token refresh handling for Firebase-authenticated student requests

The backend dependencies include Helmet, bcryptjs, JWT, Firebase Admin, dotenv, and CORS, while the frontend centralizes token handling in its API service.

> **Security Note:** Never commit real MongoDB credentials, JWT secrets, Firebase Admin private keys, or other production credentials to GitHub.

---

# ⚙️ Environment Variables

The project provides separate environment templates for the frontend and backend.

### Client

Create:

```text
client/.env
```

based on:

```text
client/.env.example
```

The frontend API service supports:

```env
VITE_API_BASE_URL=
```

The current client API configuration falls back to:

```text
http://localhost:5000/api
```

when the environment variable is not provided.

### Server

Create:

```text
server/.env
```

based on:

```text
server/.env.example
```

The backend requires environment configuration for items such as:

```env
PORT=
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Firebase Admin initialization explicitly requires the Firebase project ID, client email, and private key.

**Never upload the actual `.env` files to GitHub.**

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* MongoDB Atlas account or accessible MongoDB instance
* Firebase project
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/amankumarsingh246810/shri.krishna.digital.library.git
```

```bash
cd shri.krishna.digital.library
```

---

# 2. Install Client Dependencies

```bash
cd client
npm install
```

---

# 3. Configure Client Environment

Create:

```text
client/.env
```

and configure the required frontend environment variables based on:

```text
client/.env.example
```

---

# 4. Start the Client

```bash
npm run dev
```

The frontend is powered by Vite. The client package defines `dev`, `build`, and `preview` scripts.

---

# 5. Install Server Dependencies

Open another terminal:

```bash
cd server
npm install
```

---

# 6. Configure Server Environment

Create:

```text
server/.env
```

using:

```text
server/.env.example
```

Add your MongoDB, JWT, Firebase Admin, and client-origin configuration.

---

# 7. Start the Backend

For development:

```bash
npm run dev
```

For production-style execution:

```bash
npm start
```

The backend uses Nodemon for development and `node server.js` for its production start command.

---

# 🧪 API Health Check

The backend provides a health endpoint:

```text
GET /api/health
```

A successful response returns a JSON confirmation that the Shri Krishna Digital Library API is running.

---

# 🏗️ Production Build

## Frontend

From the `client` directory:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

The frontend uses Vite's production build system.

## Backend

The backend can be started using:

```bash
npm start
```

and listens on the environment-provided `PORT`, falling back to port `5000`.

---

# ☁️ Deployment Architecture

For production deployment, the application can be deployed as separate frontend and backend services:

```text
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │ React / Vite    │
              │ Frontend        │
              └────────┬────────┘
                       │ HTTPS
                       ▼
              ┌─────────────────┐
              │ Node / Express  │
              │ REST API        │
              └───────┬─────────┘
                      │
             ┌────────┴─────────┐
             ▼                  ▼
      ┌──────────────┐   ┌──────────────┐
      │ MongoDB      │   │ Firebase     │
      │ Atlas        │   │ Auth + FCM   │
      └──────────────┘   └──────────────┘
```

A suitable deployment strategy is:

* **Frontend:** Vercel / Netlify / similar static hosting
* **Backend:** Render / Railway / similar Node.js hosting
* **Database:** MongoDB Atlas
* **Authentication & Notifications:** Firebase

The exact production provider can be selected according to operational requirements and budget.

---

# 📱 Responsive Design

The frontend is designed as a responsive web application intended to work across:

* Desktop
* Laptop
* Tablet
* Mobile devices

Student and administrative interfaces are separated into dedicated pages and components to make the application easier to maintain and extend.

---

# 🎯 Project Goals

The primary goals of the project are:

* Digitize routine library management operations
* Provide a dedicated student portal
* Provide a secure administrator portal
* Centralize student information
* Track monthly fees and payments
* Maintain payment audit records
* Provide student notifications
* Simplify administrative workflows
* Provide a responsive and accessible user interface
* Build a maintainable full-stack architecture
* Establish a foundation for future library-management features

---

# 🔮 Future Enhancements

Potential future improvements include:

* Online payment gateway integration
* Automated production fee-reminder scheduling
* Seat availability tracking
* Seat reservation
* Digital study materials
* Digital newspaper section
* Library membership management
* Advanced reporting and analytics
* Attendance tracking
* Admin activity logs
* Role-based administrative permissions
* Email notifications
* Enhanced dashboard analytics
* Custom domain deployment
* Automated CI/CD pipeline
* Automated testing
* Application monitoring and logging

---

# 🧩 Engineering Highlights

This project demonstrates several practical full-stack engineering concepts:

* Component-based React architecture
* Client-server separation
* RESTful API design
* JWT authentication
* Firebase authentication
* Firebase Admin SDK
* Token refresh handling
* Protected routes
* Middleware-based authorization
* MongoDB data modeling
* Mongoose ODM
* Payment and audit separation
* Notification services
* Scheduled backend jobs
* Environment-based configuration
* Centralized Axios API handling
* Responsive frontend development
* Error handling and health checks

---

# 📊 Project Architecture at a Glance

```text
Frontend
│
├── React
├── React Router
├── Axios
├── Firebase Client SDK
└── Responsive UI
        │
        │ REST API
        ▼
Backend
│
├── Express
├── Authentication
│   ├── Firebase Authentication
│   └── JWT
│
├── Middleware
├── Controllers
├── Services
├── Scheduled Jobs
└── Mongoose Models
        │
        ▼
Database
│
└── MongoDB
        │
        ├── Students
        ├── Admins
        ├── Payments
        ├── Payment Audits
        └── Notifications
```

---

# 👨‍💻 Developer

**Aman Kumar Singh**

Full Stack Developer / MERN Stack Developer

GitHub:

https://github.com/amankumarsingh246810

Project Repository:

https://github.com/amankumarsingh246810/shri.krishna.digital.library

---

# 📄 License

This project is developed for **Shri Krishna Digital Library**.

Add an explicit open-source license such as MIT only if you intend to make the project available under those terms.

---

## ⭐ Acknowledgement

Built with the goal of making library management more organized, accessible, and student-friendly.

> **A better place to focus, learn and grow.**
