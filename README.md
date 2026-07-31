<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=28&pause=1000&color=00C9FF&center=true&vCenter=true&width=700&lines=Healthcare+System+Management+AI;Powered+by+LumenaAI+%F0%9F%A4%96%F0%9F%A5%BC" alt="Typing SVG" />

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Prisma-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-BullMQ-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
</p>

<br/>

> **LumenaAI** is an end-to-end AI-augmented healthcare management platform designed for **disability and aged-care service providers**. It automates shift scheduling, generates AI-powered care notes and incident reports, manages NDIS compliance claims, and enables real-time communication between staff, patients, and administrators — all through a unified, role-based ecosystem.

<br/>

[![Live Platform](https://img.shields.io/badge/🌐_Live_Platform-ableai.ai-00C9FF?style=for-the-badge)](https://ableai.ai)
[![Admin Dashboard](https://img.shields.io/badge/📊_Admin_Dashboard-dashboard.ableai.ai-FF6B6B?style=for-the-badge)](https://dashboard.ableai.ai)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [📁 Repository Structure](#-repository-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [📊 Data Models](#-data-models)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. AI Service](#1-ai-service-health_lumenaai_ai-main)
  - [2. Backend API](#2-backend-api-health_lumenaai_backend-main)
  - [3. Patient Frontend](#3-patient-frontend-health_lumenaai_frontend-main)
  - [4. Admin Dashboard](#4-admin-dashboard-health_lumenaai_dashboard-main)
- [🔑 Environment Variables](#-environment-variables)
- [🐳 Docker Deployment](#-docker-deployment)
- [📡 API Overview](#-api-overview)
- [🤖 AI Capabilities](#-ai-capabilities)
- [🔐 Roles & Permissions](#-roles--permissions)
- [🔔 Notification System](#-notification-system)
- [💳 Payment & NDIS Integration](#-payment--ndis-integration)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Care
- **Shift Note Summarization** — Converts raw staff notes into professional, NDIS-compliant summaries using GPT-4
- **Incident Report Generation** — Automated structured incident reports from freeform staff input
- **Image Summary Analysis** — AI image-to-text processing for visual incident documentation

### 📅 Shift & Roster Management
- Weekly & one-off care plan scheduling
- Automatic shift assignment and staffing gap detection
- Staff shift request & approval workflow
- 1-hour pre-shift push notifications via FCM

</td>
<td width="50%">

### 🏥 Patient & Care Plan Management
- Full patient profile management with risk factors, goals, and medical records
- Support for **Aged Care** and **Disability Care** service categories
- Care goals, support activities, and service category tracking
- Geo-location-based staff matching via Haversine distance

### 💬 Real-Time Communication
- WebSocket-powered chat rooms
- Multi-participant room support with role-based access
- Message threading, read status, and editing
- Server-Sent Events (SSE) for live dashboard updates

</td>
</tr>
<tr>
<td width="50%">

### 📑 NDIS Claims & Compliance
- Draft → Submit → Validate → Approve/Reject claim lifecycle
- Automated validation with error and warning reports
- Staff reviewer assignment
- Claim period and service line tracking

### 📁 Document Management
- Categorized document uploads (Medical Records, Care Plans, NDIS Claims, Legal, Daily Logs, Incident Reports)
- AWS S3 storage integration via `multer-s3`
- Per-patient and per-user document scoping

</td>
<td width="50%">

### 🔔 Notification Engine
- Priority-based notifications (LOW → URGENT)
- Categories: Shift Reminder, Incident Alert, Claim Status, Messages, Care Alert
- BullMQ-powered async notification worker
- Firebase push notifications (FCM) + in-app delivery

### 💳 Payments & Billing
- Stripe payment gateway with webhook verification
- Per-booking payment tracking (PENDING → PAID → REFUNDED)
- Twilio SMS integration for transactional communication

</td>
</tr>
</table>

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LumenaAI Platform                           │
│                                                                     │
│  ┌────────────────────┐         ┌────────────────────────────────┐  │
│  │  Patient Frontend  │         │      Admin Dashboard           │  │
│  │  (Next.js 15)      │◄───────►│      (Next.js 15)              │  │
│  │  Port: 4031        │         │      Port: 4032                │  │
│  └────────┬───────────┘         └──────────────┬─────────────────┘  │
│           │                                    │                    │
│           └────────────────────┬───────────────┘                    │
│                                │ REST API / WebSocket               │
│                    ┌───────────▼──────────────┐                    │
│                    │   Backend API Server      │                    │
│                    │   (Node.js + Express)     │                    │
│                    │   Port: 5001              │                    │
│                    │                           │                    │
│                    │  ┌──────────┐  ┌───────┐  │                    │
│                    │  │ Prisma   │  │ Redis │  │                    │
│                    │  │ MongoDB  │  │BullMQ │  │                    │
│                    │  └──────────┘  └───────┘  │                    │
│                    └───────────┬──────────────┘                    │
│                                │ HTTP                               │
│                    ┌───────────▼──────────────┐                    │
│                    │   AI Microservice         │                    │
│                    │   (Python + FastAPI)      │                    │
│                    │   Port: 8000              │                    │
│                    │   GPT-4 · Uvicorn · Nginx │                    │
│                    └──────────────────────────┘                    │
│                                                                     │
│         External: AWS S3 · Stripe · Firebase · Twilio              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
Healthcare-System-Management-AI/
│
├── 🤖 Health_LumenaAI_ai-main/          # AI Microservice (Python / FastAPI)
│   ├── com/                             # Application core
│   ├── summarizer.py                    # GPT-4 shift note & incident report generator
│   ├── requirements.txt                 # Python dependencies
│   ├── Dockerfile                       # Container definition
│   ├── docker-compose.yml               # Compose orchestration
│   ├── nginx/                           # Nginx reverse proxy config
│   └── .env.example                     # Environment template
│
├── 🔧 Health_LumenaAI_backend-main/     # Backend REST API (Node.js / Express / TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/                 # Feature modules
│   │   │   │   ├── admin/               # Admin management
│   │   │   │   ├── auth/                # Authentication & OTP
│   │   │   │   ├── carePlan/            # Care plan CRUD & scheduling
│   │   │   │   ├── chat/                # Real-time messaging
│   │   │   │   ├── chatRoom/            # Chat room management
│   │   │   │   ├── contact/             # Contact & support tickets
│   │   │   │   ├── document/            # Document management
│   │   │   │   ├── notification/        # Notification engine + worker
│   │   │   │   ├── patient/             # Patient profiles
│   │   │   │   ├── shift/               # Shift scheduling
│   │   │   │   ├── shift-note/          # AI-enhanced shift notes
│   │   │   │   ├── staff/               # Staff management
│   │   │   │   └── user/                # User account management
│   │   │   ├── middlewares/             # Auth, validation, error handling
│   │   │   ├── routes/                  # Route aggregation
│   │   │   ├── webhooks/                # Stripe webhook handler
│   │   │   └── utils/                   # Helper utilities
│   │   ├── app.ts                       # Express app bootstrap
│   │   └── server.ts                    # Server entrypoint
│   ├── prisma/
│   │   └── schema.prisma                # MongoDB database schema (Prisma ORM)
│   └── package.json
│
├── 🖥️ Health_LumenaAI_frontend-main/    # Patient Portal (Next.js 15 / React 19)
│   ├── src/                             # Application source
│   ├── schema.prisma                    # Shared schema reference
│   └── package.json
│
└── 📊 Health_LumenaAI_dashboard-main/   # Admin Dashboard (Next.js 15 / React 19)
    ├── src/                             # Application source
    └── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Patient Frontend** | Next.js 15, React 19, TypeScript | Patient-facing portal |
| **Admin Dashboard** | Next.js 15, React 19, TypeScript | Admin & staff management |
| **Backend API** | Node.js, Express, TypeScript | REST API + WebSocket server |
| **AI Microservice** | Python 3.12, FastAPI, Uvicorn | GPT-4 AI summarization service |
| **Database** | MongoDB (via Prisma ORM) | Primary data store |
| **Queue/Jobs** | Redis + BullMQ | Async notification processing |
| **AI Model** | OpenAI GPT-4 | Shift note & incident summarization |
| **File Storage** | AWS S3 (via `multer-s3`) | Document & image storage |
| **Payments** | Stripe | Booking payments & webhooks |
| **Push Notifications** | Firebase Admin (FCM) | Mobile push notifications |
| **SMS** | Twilio | Transactional SMS messages |
| **UI Components** | Radix UI, Tailwind CSS v4 | Accessible component primitives |
| **Charts** | Recharts, ECharts | Data visualizations |
| **Animations** | Framer Motion | UI transitions & micro-animations |
| **Forms** | React Hook Form + Zod | Form handling & validation |
| **Auth** | JWT + NextAuth.js | Session & token management |
| **ORM** | Prisma v6 | Type-safe database access |
| **Cron** | node-cron | Scheduled background tasks |
| **Reverse Proxy** | Nginx | AI service gateway |
| **Containerization** | Docker | Service isolation & deployment |

---

## 📊 Data Models

The platform uses **MongoDB** as its primary database, managed through **Prisma ORM**. Key models:

| Model | Description |
|---|---|
| `User` | Core identity model for all roles (Admin, Customer, Staff) |
| `Customer` | Extended profile for patients' families or self-managing participants |
| `Patient` | Care recipient with risk factors, goals, and address |
| `Staff` | Care worker profile with certifications, skills, availability, and hourly rate |
| `CarePlan` | Scheduled care arrangement linking a patient, customer, and staff |
| `Shift` | Individual shift instances within a care plan |
| `ShiftRequest` | Staff-requested shifts awaiting customer approval |
| `ShiftNote` | Raw + AI-summarized notes and incident reports per shift |
| `NDISClaim` | NDIS funding claim with validation lifecycle |
| `Document` | Uploaded files categorized by type (Medical, Legal, NDIS, etc.) |
| `ChatRoom` | Multi-participant real-time messaging rooms |
| `Chat` | Individual messages with threading and read receipts |
| `Notification` | Priority-based in-app and push notifications |
| `Booking` | Payment-linked service bookings |
| `Review` | Star ratings and comments for staff members |
| `OTP` | Time-limited one-time passwords for secure auth |

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed:

- **Node.js** `>= 20.x`
- **npm** `>= 10.x`
- **Python** `>= 3.12`
- **Docker** & **Docker Compose** (for AI service)
- **MongoDB** instance (local or Atlas)
- **Redis** instance (local or managed)

---

### 1. AI Service (`Health_LumenaAI_ai-main`)

```bash
cd Health_LumenaAI_ai-main

# Copy environment template
cp .env.example .env
# Add your OpenAI API key to .env

# Option A — Run locally
pip install -r requirements.txt
uvicorn com.mhire.app.main:app --host 0.0.0.0 --port 8000 --reload

# Option B — Run with Docker
docker-compose up --build
```

> The AI service will be available at `http://localhost:8000`

---

### 2. Backend API (`Health_LumenaAI_backend-main`)

```bash
cd Health_LumenaAI_backend-main

# Install dependencies
npm install

# Set up environment variables
# Create a .env file — see Environment Variables section below

# Generate Prisma client
npm run prisma:gen

# Push database schema
npm run prisma:push

# Start development server
npm run dev

# Start notification worker (separate terminal)
npm run worker
```

> The API server will be available at `http://localhost:5001`

---

### 3. Patient Frontend (`Health_LumenaAI_frontend-main`)

```bash
cd Health_LumenaAI_frontend-main

# Install dependencies
npm install

# Set up environment variables
# Create .env.local — see Environment Variables section below

# Start development server (port 4031)
npm run dev
```

> The patient portal will be available at `http://localhost:4031`

---

### 4. Admin Dashboard (`Health_LumenaAI_dashboard-main`)

```bash
cd Health_LumenaAI_dashboard-main

# Install dependencies
npm install

# Set up environment variables
# Create .env.local — see Environment Variables section below

# Start development server (port 4032)
npm run dev
```

> The admin dashboard will be available at `http://localhost:4032`

---

## 🔑 Environment Variables

### Backend API (`.env`)

```env
# Application
NODE_ENV=development
PORT=5001

# Database
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# Auth
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET_NAME=your_bucket_name

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AI Microservice
AI_SERVICE_URL=http://localhost:8000
```

### AI Microservice (`.env`)

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL_NAME=gpt-4
```

### Frontend & Dashboard (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:5001/api/v1

# NextAuth (Frontend only)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:4031

# Google reCAPTCHA (Frontend only)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

---

## 🐳 Docker Deployment

The AI microservice is fully containerized:

```bash
cd Health_LumenaAI_ai-main

# Build and start all services (AI + Nginx)
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Exposed ports:**
| Service | Port |
|---|---|
| AI FastAPI | `8000` |
| Nginx Gateway | `80` / `443` |

---

## 📡 API Overview

All backend routes are prefixed with `/api/v1`:

| Resource | Endpoint | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Login, register, OTP verification, password reset |
| Users | `/api/v1/users` | User profile management |
| Patients | `/api/v1/patients` | Patient CRUD |
| Staff | `/api/v1/staff` | Staff profile, availability, certifications |
| Care Plans | `/api/v1/care-plans` | Create and manage care plans |
| Shifts | `/api/v1/shifts` | Shift scheduling and status updates |
| Shift Notes | `/api/v1/shift-notes` | Create notes with AI summarization |
| Chat Rooms | `/api/v1/chat-rooms` | Create and manage message rooms |
| Chat | `/api/v1/chats` | Send and retrieve messages |
| Documents | `/api/v1/documents` | Upload and categorize documents |
| NDIS Claims | `/api/v1/ndis-claims` | Claim lifecycle management |
| Notifications | `/api/v1/notifications` | Fetch and mark notifications |
| Admin | `/api/v1/admin` | Platform administration |
| Contact | `/api/v1/contact` | Support contact submissions |
| Stripe Webhook | `/api/v1/stripe/payment-webhook` | Payment event processing |

---

## 🤖 AI Capabilities

The Python AI microservice (`Health_LumenaAI_ai-main`) uses **OpenAI GPT-4** to:

### 📝 Shift Note Summarization
Transforms free-form raw shift notes into structured, professional care summaries:
- Chronological activity narration
- Emotional and behavioral observations
- Medical and care event documentation
- NDIS-compliant professional tone

### 🚨 Incident Report Generation
Converts raw incident notes into formal reports with:
- Incident description (what, when, where, who)
- Immediate actions taken
- Injury or concern documentation
- Follow-up action recommendations

### 🖼️ Image Summary Analysis
AI-powered interpretation of uploaded images for visual incident documentation, stored in `ShiftNote.aiImageSummary`.

---

## 🔐 Roles & Permissions

| Role | Portal | Capabilities |
|---|---|---|
| **Admin** | Dashboard (`4032`) | Full platform access — users, staff, patients, reports, system config |
| **Customer** | Frontend (`4031`) | Manage patients, view care plans, track shifts, access chat, submit NDIS claims |
| **Staff** | Frontend (`4031`) | View assigned shifts, submit shift notes, access chat, manage availability |

---

## 🔔 Notification System

The platform uses a **dual-delivery notification system**:

1. **In-App Notifications** — Stored in MongoDB, fetched by the frontend
2. **Push Notifications** — Delivered via Firebase Cloud Messaging (FCM) to mobile devices

**Notification categories:**

| Category | Trigger |
|---|---|
| `SHIFT_REMINDER` | 1 hour before a scheduled shift (cron job) |
| `INCIDENT_ALERT` | Incident report submitted |
| `CLAIM_STATUS` | NDIS claim status change |
| `MESSAGE` | New chat message |
| `CARE_ALERT` | Urgent care plan changes |
| `SYSTEM` | Platform-level system alerts |

Notifications are processed asynchronously using **BullMQ** with Redis as the queue backend. Run the worker separately:

```bash
npm run worker
```

---

## 💳 Payment & NDIS Integration

### Stripe
- Stripe is integrated for booking payments
- Webhook endpoint at `/api/v1/stripe/payment-webhook` handles payment events
- Payment statuses: `PENDING` → `PAID` → `REFUNDED` / `FAILED`

### NDIS Claims
The NDIS claim lifecycle:

```
DRAFT → SUBMITTED → VALIDATED → APPROVED → PAID
                         ↓
                      REJECTED
```

- Automated validation with error and warning arrays
- Staff reviewer assignment for human review
- Validation reports stored per claim

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to the branch: `git push origin feature/your-feature-name`
5. **Open** a Pull Request

Please follow the existing code conventions and ensure all TypeScript types are correctly defined.

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ for healthcare professionals and those they serve.**

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-istiakahasan-181717?style=for-the-badge&logo=github)](https://github.com/istiakahasan/Healthcare-System-Management-AI)

</div>
