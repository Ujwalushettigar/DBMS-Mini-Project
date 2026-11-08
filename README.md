# Government Recruitment Examination Management System (GREMS)
### College DBMS Mini Project • Full-Stack Web Application

---

## 📌 1. Project Overview

The **Government Recruitment Examination Management System (GREMS)** is a comprehensive, production-ready full-stack database management application designed for public service commission examination operations. It models the end-to-end recruitment lifecycle from notification publishing to final merit list publication.

### Key Functional Capabilities:
- **Candidate Portal**: Registration, personal profiles, multi-tier educational qualifications, examination browsing, eligibility verification, one-click online application, official admit card downloading, and scorecard viewing.
- **Administrative Portal**: Complete examination lifecycle control, test center capacity management, candidate scrutinies, application acceptance/rejection, roll number generation, official hall ticket issuance, marks evaluation, and merit ranking publication.
- **Relational Integrity**: Built on PostgreSQL with 9 normalized relational tables (3NF), UUID primary keys, composite keys, check constraints, foreign key cascades, dynamic calculation triggers, and Row Level Security (RLS) policies.
- **Zero-Setup Evaluation Mode**: Built-in in-memory fallback store seeded with realistic data enables immediate professor evaluation and local testing even before configuring Supabase credentials.

---

## 🛠️ 2. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, React Router DOM v6, Axios, Lucide React icons |
| **Backend** | Node.js, Express.js REST API, `@supabase/supabase-js`, JSON Web Tokens (JWT), Bcrypt.js, CORS, Dotenv |
| **Database** | PostgreSQL via Supabase Cloud, Row Level Security (RLS), PL/pgSQL triggers, B-Tree indexes |
| **Styling** | Government portal slate/navy palette, responsive tables, printable admit card media queries |

---

## 🏛️ 3. Relational Database Design (9 Tables)

The database strictly complies with Third Normal Form (3NF) to eliminate data redundancy and ensure relational integrity:

```
+--------------------------------------------------------------------------------------------------+
|                                    GREMS RELATIONAL SCHEMA                                       |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   [ auth.users ] (Supabase Auth)                                                                 |
|         | 1:1                                                                                    |
|         v                                                                                        |
|   [ profiles ] ──(1:1)──> [ candidates ] ──(1:N)──> [ educational_qualifications ]               |
|                                |                                                                 |
|                                | 1:N                                                             |
|                                v                                                                 |
|   [ examinations ] ──(1:N)──> [ applications ] <──(N:1)── [ exam_centers ]                       |
|         |                            |                           |                               |
|         +──────(1:N)──────┐          | 1:1                       | 1:N                           |
|                           v          v                           v                               |
|                [ examination_centers ]     [ admit_cards ]  [ examination_centers ]              |
|                                      | 1:1                                                       |
|                                      v                                                           |
|                                 [ results ]                                                      |
+--------------------------------------------------------------------------------------------------+
```

### Table Summary:
1. **`profiles`**: User credentials and system roles (`admin`, `candidate`). Connected to Supabase Auth.
2. **`candidates`**: Personal details (`candidate_code`, name, DOB, category, phone, address).
3. **`educational_qualifications`**: Academic records (`10th`, `12th`, `diploma`, `bachelors`, `masters`, `doctorate`) with percentage and passing year.
4. **`examinations`**: Government recruitment notices (`exam_code`, age cutoffs, vacancy count, application windows, exam date).
5. **`exam_centers`**: Physical examination venues (`center_code`, address, city, state, total capacity).
6. **`examination_centers`**: Composite join table `(examination_id, center_id)` linking approved venues and allocated seat counts per test.
7. **`applications`**: Candidate examination submissions (`application_number`, status, scrutiny remarks).
8. **`admit_cards`**: Official hall tickets (`roll_number`, reporting time, examination instructions).
9. **`results`**: Evaluation scorecards (`marks_obtained`, `maximum_marks`, calculated `percentage`, `rank`, `result_status`, `is_published`).

---

## 🚀 4. Quick Start & Local Execution

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 3: Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=grems_academic_super_secret_jwt_key_2026
NODE_ENV=development
```
*(If Supabase credentials are left default or unconfigured, the backend automatically runs in **Academic In-Memory Evaluation Mode** with full CRUD persistence during the session).*

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=/api
```

### Step 4: Run the Application

In terminal 1 (Backend API):
```bash
cd backend
npm start
# Server listens at http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
cd frontend
npm run dev
# Vite runs at http://localhost:3000
```

---

## 🔐 5. Default Demonstration Accounts

Use these pre-configured credentials to evaluate both administrative and candidate workflows:

| Role | Email | Password | Candidate / Admin Identifier |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gov.in` | `Admin@123` | Senior Recruitment Officer |
| **Candidate 1** | `rahul.sharma@example.com` | `Candidate@123` | `CND-2026-00101` (Rahul Sharma) |
| **Candidate 2** | `priya.patel@example.com` | `Candidate@123` | `CND-2026-00102` (Priya Patel) |
| **Candidate 3** | `amit.kumar@example.com` | `Candidate@123` | `CND-2026-00103` (Amit Kumar) |

---

## 🗄️ 6. Supabase PostgreSQL Setup Instructions

To deploy the schema to your live Supabase cloud database:

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to the **SQL Editor** tab from the left sidebar.
3. Open [`database/schema/schema.sql`](./database/schema/schema.sql) from this repository.
4. Copy the entire contents of `schema.sql` and paste them into the Supabase SQL Editor.
5. Click **Run** to execute the script.
6. The script will automatically:
   - Enable the `pgcrypto` extension for UUID generation.
   - Create all 9 normalized relational tables with check constraints and foreign keys.
   - Establish B-Tree performance indexes on foreign keys and frequently queried fields.
   - Install automated PL/pgSQL triggers (`update_updated_at_column`, `validate_center_allocation_capacity`, `handle_new_user`).
   - Enable Row Level Security (RLS) policies for secure role-based isolation.
7. Retrieve your project's **API URL**, **anon key**, and **service_role key** from *Project Settings -> API* and insert them into `backend/.env`.

---

## 📂 7. Project Folder Structure

```
government-recruitment-management-system/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/       # Badge, Modal, StatsCard, LoadingSpinner, Alert, EmptyState
│   │   │   ├── layout/       # Navbar, Footer, CandidateSidebar, AdminSidebar, DashboardLayout
│   │   │   ├── dashboard/
│   │   │   └── forms/
│   │   ├── pages/            # 18 pages (Candidate portal, Admin portal, Public pages)
│   │   ├── services/         # api.js with Axios interceptors
│   │   ├── hooks/
│   │   ├── context/          # AuthContext with role-based auth state
│   │   ├── routes/           # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── utils/            # helpers.js (formatting, badge variants)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css         # Tailwind & printable hall ticket styles
│   ├── .env.example
│   ├── .env
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── supabase.js       # Supabase client initializer with connection fallback
│   ├── controllers/          # 9 modular REST API controllers
│   ├── routes/               # 9 Express route definitions
│   ├── middleware/           # authMiddleware (JWT & RBAC), errorHandler
│   ├── services/             # supabaseService.js with dual Supabase/In-Memory store
│   ├── utils/                # responseHelper.js, generators.js (CND-, APP-, AC-, ROLL-)
│   ├── server.js             # Express application entrypoint
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── database/
│   ├── schema/
│   │   └── schema.sql        # Complete 9-table PostgreSQL schema, triggers & RLS
│   ├── queries/
│   │   └── queries.sql       # Academic query repository (reserved)
│   └── sample_data/
│
├── docs/
│   ├── database-design.md    # Data dictionary, 3NF normalization, referential integrity
│   ├── er-diagram.md         # Mermaid ER diagram & cardinality specifications
│   ├── api-documentation.md  # Exhaustive REST API specification
│   └── project-architecture.md# 3-tier architecture, RBAC model & data flow diagrams
│
├── .gitignore
└── README.md
```

---

## 📡 8. REST API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new candidate account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session and profile |
| `GET` | `/api/candidates` | Admin | Retrieve all registered candidates |
| `GET` | `/api/candidates/me` | Candidate | Retrieve authenticated candidate profile |
| `PUT` | `/api/candidates/:id` | Authenticated | Update candidate profile |
| `GET` | `/api/qualifications` | Authenticated | List candidate educational records |
| `POST` | `/api/qualifications` | Candidate | Add qualification record |
| `DELETE` | `/api/qualifications/:id` | Candidate | Delete qualification record |
| `GET` | `/api/examinations` | Public | List active government examinations |
| `POST` | `/api/examinations` | Admin | Publish new recruitment examination notice |
| `PUT` | `/api/examinations/:id` | Admin | Update examination details / dates |
| `GET` | `/api/centers` | Authenticated | List all physical examination venues |
| `POST` | `/api/centers` | Admin | Register new examination center |
| `POST` | `/api/centers/assign` | Admin | Map center to examination with quota |
| `GET` | `/api/applications` | Authenticated | List applications (filtered by role) |
| `POST` | `/api/applications` | Candidate | Submit application for an examination |
| `PUT` | `/api/applications/:id/status`| Admin | Scrutinize application (accept/reject) |
| `GET` | `/api/admit-cards` | Authenticated | List admit cards (filtered by role) |
| `POST` | `/api/admit-cards/generate` | Admin | Issue admit card with roll number |
| `GET` | `/api/results` | Authenticated | List examination results |
| `POST` | `/api/results` | Admin | Enter candidate marks & ranking |
| `PUT` | `/api/results/:id/publish` | Admin | Publish scorecard to candidate |
| `GET` | `/api/dashboard/candidate` | Candidate | Candidate dashboard analytics |
| `GET` | `/api/dashboard/admin` | Admin | High-level administrative KPIs & stats |

---

## 📄 9. Academic Project Submission Details

- **Project Title**: Government Recruitment Examination Management System (GREMS)
- **Domain**: Database Management Systems (DBMS) / Full-Stack Web Development
- **Database Engine**: PostgreSQL (Supabase Cloud)
- **Normalization Level**: Third Normal Form (3NF)
- **Architecture**: 3-Tier Client-Server REST Architecture with Role-Based Access Control
