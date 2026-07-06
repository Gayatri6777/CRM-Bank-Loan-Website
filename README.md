# 🏦 DSA CRM - Loan Management System

A production-ready, full-stack **Direct Selling Agent (DSA) CRM** for managing loan applications end-to-end.

---

## 📋 Features

| Module | Description |
|---|---|
| 🔐 Auth & RBAC | JWT authentication with 4 role levels |
| 👥 Customer Management | Full customer profiles with financial info |
| 🏦 Bank Management | Banks with loan products, rates & commissions |
| 📁 Loan Files | Complete loan lifecycle management |
| 📄 Documents | Upload, track & verify loan documents |
| 🔄 Status Flow | Validated stage progression |
| 💰 Commissions | Auto-generated on disbursement |
| 📊 Reports | Charts, analytics & exports |
| 📝 Audit Logs | Full activity tracking |

---

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt
- **File Upload**: Multer

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone / Extract Project

```bash
cd dsa-crm
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dsa_crm
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

Seed the database:
```bash
npm run seed
```

Start backend:
```bash
npm run dev       # development
npm start         # production
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dsacrm.com | Admin@123 |
| Data Operator | rahul@dsacrm.com | Pass@123 |
| Marketing Executive | priya@dsacrm.com | Pass@123 |
| Bank Executive | amit@dsacrm.com | Pass@123 |

---

## 📁 Project Structure

```
dsa-crm/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Bank.js
│   │   ├── Loan.js
│   │   ├── Document.js
│   │   ├── Commission.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── customers.js
│   │   ├── banks.js
│   │   ├── loans.js
│   │   ├── documents.js
│   │   ├── commissions.js
│   │   ├── reports.js
│   │   ├── dashboard.js
│   │   └── auditLogs.js
│   ├── middleware/
│   │   ├── auth.js       (JWT protect + RBAC authorize)
│   │   └── upload.js     (Multer config)
│   ├── utils/
│   │   └── seed.js
│   ├── uploads/          (auto-created)
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/Layout.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Customers.jsx
    │   │   ├── CustomerForm.jsx
    │   │   ├── Banks.jsx
    │   │   ├── BankForm.jsx
    │   │   ├── Loans.jsx
    │   │   ├── LoanForm.jsx
    │   │   ├── LoanDetail.jsx
    │   │   ├── Documents.jsx
    │   │   ├── Commissions.jsx
    │   │   ├── Reports.jsx
    │   │   ├── Users.jsx
    │   │   ├── AuditLogs.jsx
    │   │   └── Profile.jsx
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🔄 Loan Status Flow

```
draft → submitted → under_review → document_pending → sanctioned → disbursed
                 ↘ rejected ↙
                 ↘ cancelled ↙
```

**Valid Transitions:**
- `draft` → `submitted`, `cancelled`
- `submitted` → `under_review`, `rejected`, `cancelled`
- `under_review` → `document_pending`, `sanctioned`, `rejected`
- `document_pending` → `under_review`, `sanctioned`, `rejected`
- `sanctioned` → `disbursed`, `cancelled`
- `disbursed` → (terminal)

**Auto-Commission:** When status moves to `disbursed`, a commission record is automatically created.

---

## 🔐 Role Permissions

| Feature | Admin | Data Operator | Marketing Exec | Bank Exec |
|---------|-------|---------------|----------------|-----------|
| User Management | ✅ | ❌ | ❌ | ❌ |
| Bank CRUD | ✅ | ❌ | ❌ | ❌ |
| All Customers | ✅ | Own | Own | ✅ |
| All Loans | ✅ | ✅ | Own | Own |
| Verify Documents | ✅ | ❌ | ❌ | ✅ |
| Approve Commission | ✅ | ❌ | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ | ❌ |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/change-password | Change password |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/loans | List loans |
| POST | /api/loans | Create loan |
| GET | /api/loans/:id | Get loan detail |
| PUT | /api/loans/:id | Update loan |
| PUT | /api/loans/:id/status | Update status |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/documents/loan/:loanId | Get docs for loan |
| POST | /api/documents/upload/:loanId | Upload document |
| PUT | /api/documents/:id/verify | Verify document |

---

## 🐳 Docker (Optional)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]
  
  backend:
    build: ./backend
    ports: ["5000:5000"]
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/dsa_crm
    depends_on: [mongodb]
  
  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]

volumes:
  mongo_data:
```

---

## 📝 Validation Rules

- Mobile: Exactly 10 digits
- Loan amount: Within bank product min/max
- Status: Cannot skip stages (validated server-side)
- Document number: Unique per type

---

## 🙌 License
MIT - Free for commercial use.
