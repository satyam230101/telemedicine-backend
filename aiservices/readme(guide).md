# 🚀 SmartCareAI - Setup & Run Guide

This guide will help you run the SmartCareAI project on your system step by step.

---

# 📁 Project Structure

```
SmartCareAI/
│
├── backend/
├── frontend/SmartCareAI/
├── aiservices/
└── data/db/   (MongoDB storage)
```

---

# ⚙️ Prerequisites (Install these first)

Make sure you have:

* Node.js (v18+ recommended)
* Python (v3.9+)
* MongoDB installed

---

# 🧩 Step 1: Setup MongoDB

### 1. Create database folder

```bash
mkdir data
mkdir data\db
```

### 2. Start MongoDB

```bash
mongod --dbpath "D:\projexxa2\SmartCareAI\data\db"
```

👉 Keep this terminal OPEN

---

# 🔐 Step 2: Setup Backend

### Go to backend folder

```bash
cd backend
```

### Install dependencies

```bash
npm install --legacy-peer-deps
```

### Create `.env` file

Add:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smartcare
JWT_SECRET=your_secret_key_here
```

### Generate JWT Secret

If OpenSSL not installed, use Node:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy output → paste as `JWT_SECRET`

---

### Start backend

```bash
npm start
```

👉 Backend runs on:

```
http://localhost:5000
```

---

# 🤖 Step 3: Setup AI Services

### Go to folder

```bash
cd aiservices
```

### Create virtual environment

```bash
python -m venv .venv
```

### Activate it

```bash
.venv\Scripts\activate
```

### Install dependencies

⚠️ Make sure file name is correct:

```
requirements.txt
```

Then run:

```bash
pip install -r requirements.txt
```

---

# 💻 Step 4: Setup Frontend

### Go to frontend folder

```bash
cd frontend/SmartCareAI
```

### Install dependencies

```bash
npm install --legacy-peer-deps
```

### Start frontend

```bash
npm run dev
```

👉 Frontend runs on:

```
http://localhost:5173
```

---

# ✅ Step 5: Verify Everything

### MongoDB

Terminal shows:

```
Waiting for connections on port 27017
```

### Backend

Run:

```bash
curl http://localhost:5000
```

Expected:

* "Backend is running" OR
* "Cannot GET /"

### Frontend

Open:

```
http://localhost:5173
```

---

# ⚠️ Common Errors & Fixes

## ❌ MongoDB error: data\db not found

✔ Fix:

```
mkdir data\db
```

---

## ❌ npm dependency errors

✔ Fix:

```
npm install --legacy-peer-deps
```

---

## ❌ Python requirements file not found

✔ Fix:
Rename:

```
requirment.txt → requirements.txt
```

---

## ❌ OpenSSL not found

✔ Use Node instead:

```
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

# 🚀 How to Run Full Project (Quick)

Open 3 terminals:

### Terminal 1 (MongoDB)

```bash
mongod --dbpath "D:\projexxa2\SmartCareAI\data\db"
```

### Terminal 2 (Backend)

```bash
cd backend
npm start
```

### Terminal 3 (Frontend)

```bash
cd frontend/SmartCareAI
npm run dev
```

---

# 🎯 Done!

Now open:

```
http://localhost:5173
```

👉 Register → Login → Use the app 🎉

---

# 💡 Notes

* Keep MongoDB running always
* Backend must run before frontend
* Do not close terminals while working

---
