# ✙ HealthHub

**HealthHub** is a full-stack telemedicine and healthcare management platform that connects patients with doctors for seamless online consultations. It supports real-time video consultations, appointment scheduling, digital prescriptions, medical records management, secure payments, and a comprehensive admin dashboard - all in one unified platform.


## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
  - [Admin Panel](#-admin-panel)
  - [Doctor Portal](#-doctor-portal)
  - [User / Patient Portal](#-user--patient-portal)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running with Docker](#-running-with-docker)


## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **MUI (Material UI)** | Component library |
| **Redux Toolkit + Redux Persist** | Global state management & persistence |
| **Zustand** | Lightweight local state management |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client |
| **Socket.IO Client** | Real-time communication |
| **Framer Motion** | Animations & transitions |
| **Recharts** | Data visualization & analytics charts |
| **React Big Calendar** | Appointment calendar view |
| **React Leaflet** | Interactive maps for organization locations |
| **Stripe.js** | Frontend payment integration |
| **Google OAuth** | Social login |
| **React Dropzone** | File uploads |
| **React Easy Crop** | Profile image cropping |
| **Lucide React / React Icons** | Icon libraries |
| **date-fns / Day.js** | Date manipulation |
| **RRule** | Recurring schedule rule generation |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express v5** | Web framework |
| **TypeScript** | Type-safe server-side development |
| **MongoDB + Mongoose** | Primary database & ODM |
| **Socket.IO** | Real-time WebSocket communication |
| **JSON Web Tokens (JWT)** | Authentication & authorization |
| **bcryptjs** | Password hashing |
| **Stripe** | Payment processing & webhook handling |
| **AWS S3** | Cloud file/document storage |
| **Nodemailer** | Email delivery (OTP, notifications) |
| **Google Auth Library** | OAuth 2.0 verification |
| **Winston + Daily Rotate File** | Structured logging |
| **Prometheus Client (prom-client)** | Metrics collection |
| **Node-Cron** | Scheduled background jobs |
| **Node-Cache** | In-memory caching |
| **Zod** | Runtime schema validation |
| **Helmet** | HTTP security headers |
| **Morgan** | HTTP request logging |
| **Multer** | Multipart file upload handling |
| **UUID** | Unique identifier generation |
| **RRule** | Recurring slot schedule generation |
| **Docker** | Containerization |

### Architecture
The backend follows **Clean Architecture** principles, organized into distinct layers:
- **Domain** — Entities, interfaces, enums, constants
- **Application** — Use cases, services, DTOs, mappers
- **Infrastructure** — Database models, repositories, cron jobs, Socket.IO
- **Presentation** — Controllers, routes, middlewares, validators, DI

### Monitoring & DevOps
- **Docker + Docker Compose** — Container orchestration
- **Prometheus** — Metrics scraping
- **Grafana** — Metrics visualization & dashboards


## ✨ Features

### 🛡️ Admin Panel

| Feature | Description |
|---|---|
| **Dashboard** | Overview of platform stats — appointments, revenue, users, doctors |
| **User Management** | View, block/unblock patient accounts; view detailed user profiles |
| **Doctor Management** | View, approve/reject/block doctor accounts; inspect doctor profiles and credentials |
| **Organization Management** | Manage hospitals, clinics, and diagnostic centers; approve/reject organizations |
| **Specialization Management** | Create, edit, and delete medical specializations available on the platform |
| **Appointments** | View all platform appointments and their details |
| **Transactions** | View all payment transactions across the platform |
| **Wallets** | Monitor platform and user wallet balances |
| **Payouts** | Review and process weekly doctor payouts; view payout details |
| **Reviews Management** | Monitor and moderate patient reviews for doctors |
| **Disputes** | Handle appointment disputes raised by patients; approve/reject refunds |


### 🩺 Doctor Portal

| Feature | Description |
|---|---|
| **Landing Page** | Public-facing doctor landing page |
| **Registration & Login** | Email/password signup with OTP verification; login with forgot password support |
| **Onboarding** | Multi-step profile creation (personal info, qualifications, specializations) |
| **Profile Management** | View and update professional profile, photo, and practice details |
| **Slot Management** | Create and manage recurring or one-time appointment slots using RRule; manage exceptions |
| **Appointments** | View upcoming and past appointments; access detailed appointment views |
| **Consultation Room** | Real-time video consultation interface with in-call chat |
| **Digital Prescriptions** | Issue prescriptions with medications and instructions during/after consultations |
| **Medical Reports** | Upload and share consultation reports with patients |
| **Chat / Messaging** | Real-time post-consultation messaging with patients |
| **Wallet** | View wallet balance and transaction history |
| **Payouts** | View payout history and individual payout breakdowns |
| **Analytics / Analysis** | Revenue charts, appointment trends, and performance analytics |
| **Reviews** | View patient reviews and ratings |
| **Practice Settings** | Configure consultation fees, availability, and practice details |
| **Account Settings** | Change password and manage account preferences |


### 👤 User / Patient Portal

| Feature | Description |
|---|---|
| **Landing Page** | Public marketing page for the platform |
| **Registration & Login** | Email/password signup with OTP verification; Google OAuth login; forgot password |
| **Profile Creation** | Multi-step patient profile setup |
| **Browse Doctors** | Search and filter doctors by specialization, location, and availability |
| **View Doctor Profile** | Full doctor profile with qualifications, experience, reviews, and ratings |
| **View Doctor Slots** | Browse available time slots for a specific doctor |
| **Appointment Booking** | Book appointments with slot selection and payment via Stripe or wallet balance |
| **Appointment Confirmation** | Payment success confirmation page |
| **Appointments List** | View all upcoming and past appointments |
| **View Appointment** | Detailed appointment view with status, actions, reschedule & cancellation options |
| **Consultation Room** | Real-time video consultation with in-call text chat |
| **Chat / Messaging** | Post-consultation messaging with doctors |
| **Digital Prescriptions** | View issued prescriptions with verification QR code |
| **Prescription Verification** | Publicly accessible prescription verification via unique token |
| **Medical Reports** | View consultation reports and diagnostic uploads |
| **Medical Records** | Centralized repository of all medical history — prescriptions, reports, appointments |
| **Organization Enrollment** | Enroll with a hospital or diagnostic organization on the platform |
| **Organization Status** | Track the status of an organization enrollment request |
| **Wallet** | Top up wallet via Stripe; view wallet balance and transaction history |
| **Wallet Top-up Confirmation** | Payment success page for wallet top-up |
| **Account Settings** | Manage password and account preferences |


## 🗒️ Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) **v20** or higher
- [npm](https://www.npmjs.com/) **v10** or higher
- [MongoDB](https://www.mongodb.com/) running locally (or a connection URI to a cloud instance)
- [Git](https://git-scm.com/)

You will also need accounts and credentials for:
- **AWS S3** — For file and document storage
- **Stripe** — For payment processing
- **Google Cloud** — For Google OAuth (Client ID & Secret)
- **Nodemailer** — An email account for sending OTPs (Gmail recommended with App Password)
- **Geoapify** — API key for map/location features


## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/gigiljames/HealthHub.git
cd HealthHub
```


### 2. Set Up the Backend

#### Navigate to the Backend directory
```bash
cd Backend
```

#### Install dependencies
```bash
npm install
```

#### Create the environment file
Copy the example below and create a `.env` file in the `Backend/` directory:

```env
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URL=mongodb://localhost:27017/HealthHub

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# OTP
OTP_EXPIRY=300

# Nodemailer (Email)
NODEMAILER_USER=your_email@gmail.com
NODEMAILER_PASS=your_gmail_app_password

# Google OAuth
GOOGLE_AUTH_CLIENT_ID=your_google_client_id
GOOGLE_AUTH_CLIENT_SECRET=your_google_client_secret

# AWS S3
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your_s3_bucket_name
AWS_SIGNED_ACCESS_URL_EXPIRY=1800
AWS_SIGNED_UPLOAD_URL_EXPIRY=300

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Business Logic
MAX_SLOT_DAYS=30
SLOT_LOCK_EXPIRY_MS=60000
PLATFORM_COMMISSION=7
FIXED_PLATFORM_FEE=8

# Cron Rules (cron expression)
DOCTOR_PAYOUT_CRON_RULE=0 0 * * 0
LOCK_SWEEPER_CRON_RULE=*/5 * * * *
AUTO_NO_SHOW_CRON_RULE=*/10 * * * *
```

#### Start the backend development server
```bash
npm run dev
```

The backend API will be available at **http://localhost:3000**.


### 3. Set Up the Frontend

Open a **new terminal** and navigate to the Frontend directory:

```bash
cd Frontend
```

#### Install dependencies
```bash
npm install
```

#### Create the environment file
Create a `.env` file in the `Frontend/` directory:

```env
VITE_AXIOS_BASE_URL=http://localhost:3000
VITE_GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_MAX_SLOT_DAYS=30
VITE_INDIAN_MEDICAL_REGISTRY_SEARCH_URL=https://www.nmc.org.in/information-desk/indian-medical-register/
```

#### Start the frontend development server
```bash
npm run dev
```

The frontend app will be available at **http://localhost:5173**.


### 4. Access the Application

| Portal | URL |
|---|---|
| **User / Patient Portal** | http://localhost:5173 |
| **Doctor Portal** | http://localhost:5173/doctor |
| **Admin Panel** | http://localhost:5173/admin |


## 🌍 Environment Variables

### Backend `.env` Reference

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on |
| `NODE_ENV` | `development` or `production` |
| `FRONTEND_URL` | Frontend origin URL (for CORS) |
| `MONGODB_URL` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | JWT access token signing secret |
| `REFRESH_TOKEN_SECRET` | JWT refresh token signing secret |
| `OTP_EXPIRY` | OTP validity duration in seconds |
| `NODEMAILER_USER` | Gmail address used for sending OTP emails |
| `NODEMAILER_PASS` | Gmail App Password |
| `GOOGLE_AUTH_CLIENT_ID` | Google OAuth 2.0 Client ID |
| `GOOGLE_AUTH_CLIENT_SECRET` | Google OAuth 2.0 Client Secret |
| `AWS_REGION` | AWS region for S3 bucket |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key ID |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret access key |
| `AWS_S3_BUCKET_NAME` | S3 bucket name for file storage |
| `AWS_SIGNED_ACCESS_URL_EXPIRY` | Pre-signed URL expiry for read access (seconds) |
| `AWS_SIGNED_UPLOAD_URL_EXPIRY` | Pre-signed URL expiry for uploads (seconds) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `MAX_SLOT_DAYS` | Maximum days ahead doctors can create slots |
| `SLOT_LOCK_EXPIRY_MS` | Slot lock duration during booking (milliseconds) |
| `PLATFORM_COMMISSION` | Platform commission percentage on appointments |
| `FIXED_PLATFORM_FEE` | Fixed platform fee per appointment |
| `DOCTOR_PAYOUT_CRON_RULE` | Cron expression for weekly payout job |
| `LOCK_SWEEPER_CRON_RULE` | Cron expression for clearing expired slot locks |
| `AUTO_NO_SHOW_CRON_RULE` | Cron expression for auto-marking no-shows |

### Frontend `.env` Reference

| Variable | Description |
|---|---|
| `VITE_AXIOS_BASE_URL` | Backend API base URL |
| `VITE_GOOGLE_OAUTH_CLIENT_ID` | Google OAuth Client ID |
| `VITE_GEOAPIFY_API_KEY` | Geoapify API key for maps |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `VITE_MAX_SLOT_DAYS` | Maximum days ahead to show available slots |
| `VITE_INDIAN_MEDICAL_REGISTRY_SEARCH_URL` | NMC medical registry URL for doctor verification |


## 🐳 Running with Docker

The backend includes a `Dockerfile` and `docker-compose.yml` that also spins up **Prometheus** and **Grafana** for monitoring.

### 1. Navigate to the Backend directory
```bash
cd Backend
```

### 2. Create the `.env` file
Populate the `.env` file as described in the [Environment Variables](#-environment-variables) section.

### 3. Start all services
```bash
docker-compose up -d
```

This will start:
| Service | URL |
|---|---|
| **HealthHub Backend** | http://localhost:3000 |
| **Prometheus** | http://localhost:9090 |
| **Grafana** | http://localhost:3001 |

### 4. Stop all services
```bash
docker-compose down
```

> **Note:** You still need to run the Frontend separately using `npm run dev` in the `Frontend/` directory, or build it and serve it with a static file server.


## 📁 Project Structure

```
HealthHub/
├── Backend/
│   ├── src/
│   │   ├── app.ts                  # App entry point
│   │   ├── domain/                 # Entities, interfaces, enums
│   │   ├── application/            # Use cases, services, DTOs, mappers
│   │   ├── infrastructure/         # DB models, repositories, cron, sockets
│   │   ├── presentation/           # Controllers, routes, middlewares, DI
│   │   ├── config/                 # Environment & app config
│   │   └── utils/                  # Logger, helpers
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── admin/              # Admin panel pages
    │   │   ├── doctor/             # Doctor portal pages
    │   │   └── user/               # Patient portal pages
    │   ├── components/             # Shared & role-specific components
    │   ├── routes/                 # React Router route definitions
    │   ├── redux/                  # Redux slices & store
    │   ├── zustand/                # Zustand stores
    │   ├── api/                    # Axios API call definitions
    │   ├── hooks/                  # Custom React hooks
    │   ├── layouts/                # Layout wrappers
    │   ├── types/                  # TypeScript type definitions
    │   └── utils/                  # Utility functions
    ├── index.html
    └── package.json
```
