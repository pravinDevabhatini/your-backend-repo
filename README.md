# Car Cart Partners — Backend API v2

## Tech Stack
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB (Mongoose) — falls back to in-memory if not connected
- **Auth**: JWT (jsonwebtoken)
- **Uploads**: Multer — car photos (max 5), purchase/service bills, deposit proofs, profit credit proofs
- **Timestamps**: All in IST (Asia/Kolkata) via moment-timezone

---

## Quick Start

```bash
cd backend
npm install
# Edit .env with your values
npm run dev    # development (nodemon)
npm start      # production
```

---

## Directory Structure

```
backend/
├── src/
│   ├── server.js                  ← Express app entry point
│   ├── config/
│   │   ├── db.js                  ← MongoDB connection
│   │   └── constants.js           ← Roles, permissions, series, limits
│   ├── middleware/
│   │   ├── authMiddleware.js      ← JWT protect + restrictTo + hasPerm
│   │   ├── uploadMiddleware.js    ← Multer for photos/bills/proofs
│   │   └── errorMiddleware.js     ← Global error handler
│   ├── models/
│   │   ├── User.js                ← User with refund requests embedded
│   │   ├── Car.js                 ← Car with photos, bills, commission%, investors
│   │   ├── Deposit.js             ← Deposit transactions
│   │   ├── Profit.js              ← Profit distribution records per car/user
│   │   ├── Investment.js          ← Self-invest requests (pending approval)
│   │   └── Settings.js            ← Platform settings (commission %, etc.)
│   ├── controllers/
│   │   ├── authController.js      ← Login (demo accounts)
│   │   ├── userController.js      ← CRUD + refund request endpoint
│   │   ├── carController.js       ← CRUD + mark sold + upload photos/bills + commission edit
│   │   ├── depositController.js   ← Transactions with proof upload (admin only)
│   │   ├── profitController.js    ← Profit records + credit endpoint (accountant)
│   │   ├── investmentController.js← Assign (admin) + request (user) + approve/reject
│   │   ├── reportController.js    ← 5 report types
│   │   ├── settingsController.js  ← Platform settings
│   │   └── whatsappController.js  ← Send + log
│   ├── routes/
│   │   ├── authRoutes.js          POST /login, GET /me
│   │   ├── userRoutes.js          CRUD + /refund-request
│   │   ├── carRoutes.js           CRUD + /sold + /photos + /bill + visibility toggles
│   │   ├── depositRoutes.js       GET + POST /transaction (admin only, with proof)
│   │   ├── profitRoutes.js        GET + POST /:id/credit (accountant, with proof)
│   │   ├── investmentRoutes.js    /assign + /request + /approve + /reject
│   │   ├── reportRoutes.js        /overview /groups /users /cars /months
│   │   ├── groupRoutes.js         GET / and /:id
│   │   ├── whatsappRoutes.js      POST /send, GET /log
│   │   └── settingsRoutes.js      GET + PUT /
│   └── utils/
│       ├── helpers.js             IST(), calcProfit(), carAgeDays(), canInvest(), autoDistribute()
│       └── whatsapp.js            WA Business API sender
└── uploads/
    ├── car-photos/                Max 5 per car
    ├── documents/                 Purchase/service docs
    ├── proofs/                    Deposit & profit credit proofs
    └── bills/                     Purchase bills & service bills
```

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/login | Public | Login → JWT token |
| GET  | /api/auth/me    | All    | Current user info |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | /api/users | Admin/SA/Acct | All users |
| GET    | /api/users/:id | Own or Admin | Single user |
| POST   | /api/users | Admin | Create user (Partners, Accountant) — Admin/SA/Accountant do NOT have group |
| PUT    | /api/users/:id | Admin | Update user |
| PATCH  | /api/users/:id/status | Admin | Toggle active/disabled |
| POST   | /api/users/:id/refund-request | User (own) | Request deposit refund (3-month window) |

### Cars
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | /api/cars?status=sold\|available\|all | All | List (profit formula hidden from users) |
| GET    | /api/cars/:id | All | Single car |
| POST   | /api/cars | Admin | Add car (capture uploadedAt IST timestamp) |
| PUT    | /api/cars/:id | Admin | Edit car (always available to admin) |
| PATCH  | /api/cars/:id/commission | Admin | Edit commission % per car |
| PATCH  | /api/cars/:id/sold | Admin | Mark sold (auto-calc profit, create profit records) |
| POST   | /api/cars/:id/photos | Admin | Upload photos (max 5, mobile multipart) |
| POST   | /api/cars/:id/bill | Admin | Upload purchase/service bill |
| PATCH  | /api/cars/:id/dealer-visibility | Admin | Show/hide dealer info to partners |
| PATCH  | /api/cars/:id/buyer-visibility | Admin | Show/hide buyer info to partners |

### Deposits (Admin only for adding)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | /api/deposits | Admin/SA/Acct | All transactions |
| GET    | /api/deposits/summary | Admin/SA/Acct | Balances summary |
| GET    | /api/deposits/balance/:userId | Own/Admin | User balance + history |
| POST   | /api/deposits/transaction | **Admin only** | Add with IST timestamp + proof upload |

### Profits
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | /api/profits | Admin/SA/Acct | All profit records (pending/credited) |
| GET    | /api/profits/user/:userId | Own/Admin | User's profit records |
| POST   | /api/profits/sync | Admin/Acct | Re-sync from sold cars |
| POST   | /api/profits/:id/credit | **Accountant/Admin** | Credit profit with proof + IST timestamp |

### Investments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST   | /api/investments/assign | Admin | Assign investors, auto-distribute, validate balance |
| POST   | /api/investments/request | User | Self-invest request (balance validated) |
| GET    | /api/investments/requests | Admin | View pending requests |
| POST   | /api/investments/approve/:id | Admin | Approve request |
| POST   | /api/investments/reject/:id | Admin | Reject request |

### Reports
| GET /api/reports/overview | GET /api/reports/groups | GET /api/reports/users |
| GET /api/reports/cars | GET /api/reports/months |
All require Admin/SuperAdmin/Accountant role.

### Settings
| GET /api/settings | Admin/SA/Acct | PUT /api/settings | Admin only |

---

## Roles & Permissions

| Permission | Super Admin | Admin | Accountant | Partner |
|------------|:-----------:|:-----:|:----------:|:-------:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ (own) |
| Add/Edit Cars | ❌ | ✅ | ❌ | ❌ |
| Upload Photos/Bills | ❌ | ✅ | ❌ | ❌ |
| Edit Commission % | ❌ | ✅ | ❌ | ❌ |
| Mark Sold | ❌ | ✅ | ❌ | ❌ |
| Add Deposits | ❌ | ✅ | ❌ | ❌ |
| Credit Profits | ❌ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ❌ |
| View Profit Formula | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ❌ | ✅ | ❌ | ❌ |
| Assign Investments | ❌ | ✅ | ❌ | ❌ |
| Self-Invest Request | ❌ | ❌ | ❌ | ✅ |
| Request Deposit Refund | ❌ | ❌ | ❌ | ✅ |
| Send WhatsApp | ❌ | ✅ | ❌ | ❌ |
| Edit Settings | ❌ | ✅ | ❌ | ❌ |

---

## Key Business Rules

1. **Commission %** — Default 2.5%, editable per car by Admin. Auto-applied on sale.
2. **Car Age** — Tracked from uploadedAt. Shown in days everywhere. Freezes on sold date.
3. **Profit Formula** — Hidden from Partners. Visible only to Admin/SA/Accountant.
4. **Balance Validation** — Investment blocked if partner's available balance < required amount. Available = Deposited − Active Investments. Sold car investments return to balance.
5. **Profit Distribution** — Auto-calculated on mark-sold. Accountant credits with proof within 24 working hours.
6. **Deposit Refund** — Partner requests from their panel. Processed within 90 days (3 months).
7. **Admin/SA/Accountant** — Do NOT belong to groups. Only Partners (role=user) have group assignments.
8. **Max Investors** — 5 per car. System blocks 6th investor.
9. **All Timestamps** — IST (Asia/Kolkata).

---

## Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| superadmin | super123 | Super Admin |
| admin | admin123 | Admin |
| accountant | acct123 | Accountant |
| rajesh | user123 | Partner T1 |
| priya | user123 | Partner T1 |
| venkat | user123 | Partner T1 |
| anil | user123 | Partner T2 |
| meena | user123 | Partner CR1 |
