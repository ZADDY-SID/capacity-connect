# Capacity Connect — Learn. Grow. Achieve.

Full-Stack Training & Learning Management Platform built with React, Vite, Tailwind CSS, Lucide React, Recharts, and Python Flask with SQLite.

---

## 🚀 How to Run in VS Code

### Step 1: Open the Project in VS Code
1. Open VS Code.
2. Click **File** > **Open Folder...**
3. Select this folder: `c:\Users\Siddharth\Desktop\075`

---

### Step 2: Open Two Terminals in VS Code

In VS Code, press ``Ctrl + ` `` (backtick) or go to **Terminal** > **New Terminal**.

#### Terminal 1 — Start the Backend (Flask API)
```powershell
cd backend
python app.py
```
> Backend runs at: `http://127.0.0.1:5000`

#### Terminal 2 — Start the Frontend (React + Vite)
Click the **`+`** or split icon in the terminal panel to open a second terminal:
```powershell
cd frontend
npm run dev
```
> Frontend runs at: `http://localhost:5173`

---

### Step 3: Open in Browser
Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Trainee** | `trainee@capacityconnect.com` | `trainee123` |
| **Trainer** | `trainer@capacityconnect.com` | `trainer123` |
| **Admin** | `admin@capacityconnect.com` | `admin123` |

*(Tip: In the top navigation bar, you can also click the **"Demo Roles"** button to switch accounts in 1 click).*

---

## 🔄 Resetting the Demo Database
If you want to reset the database back to its clean initial state with demo data:
```powershell
cd backend
python seed.py
```
