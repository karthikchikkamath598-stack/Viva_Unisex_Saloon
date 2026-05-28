# VIVA Unisex Salon – The Complete Makeover

VIVA Unisex Salon is a premium, fully responsive, and production-ready full-stack salon application designed with a luxurious matte black and gold aesthetic.

---

## 🖤 Design & Branding

*   **Matte Black**: `#0B0B0B` (Primary background, deep cinematic depth)
*   **Gold**: `#D4A437` (Secondary highlight, borders, titles, animations)
*   **Dark Charcoal**: `#151515` (Card backgrounds, menus, overlays)
*   **White Text**: `#F5F5F5` (High legibility contrast)
*   **Typography**: *Cinzel* / *Playfair Display* (Headings), *Poppins* / *Inter* (Body)
*   **UI/UX Details**: High-fidelity custom cursor glow, before-after dragging slider, responsive navigation triggers, and custom SVG metrics charts on the admin panel.

---

## 📂 Project Directory Structure

```
c:\PROJECTS\VIVA_SALOON_AG/
├── backend/                  # Node.js + Express.js API
│   ├── config/               # Database and Local fallback setup
│   ├── controllers/          # API business logic
│   ├── middleware/           # JWT, role validation, error handlers
│   ├── models/               # Mongoose MongoDB schemas
│   ├── routes/               # Express endpoints router
│   ├── server.js             # Main server launcher
│   ├── .env.example          # Environment template
│   └── mock_db.json          # Fallback JSON storage (auto-created)
└── frontend/                 # React.js + Tailwind CSS (Vite build)
    ├── src/
    │   ├── context/          # Globally shared Auth state
    │   ├── components/       # Custom cursor, before-after, header/footer
    │   ├── pages/            # Customers and administrative panels
    │   ├── main.jsx          # React renderer
    │   ├── App.jsx           # Routing configuration
    │   └── index.css         # Tailwinds, variables, custom transitions
    ├── index.html            # Entry layout and Google font imports
    ├── tailwind.config.js    # Styling theme presets
    └── postcss.config.js     # PostCSS configurations
```

---

## ⚡ Quick Start Instructions

You can run both folders locally. Ensure you have Node.js (v18+) installed.

### 1. Launch the Backend API
1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *The server runs on [http://localhost:5000](http://localhost:5000).*

### 2. Launch the Frontend
1. Open a new terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client dev server runs on [http://localhost:5173](http://localhost:5173).*

---

## 💾 Database Fallback Layer (Mock Database Mode)

To make it immediately testable without setting up local MongoDB services, the server connects to MongoDB but **automatically falls back to a local JSON file (`backend/mock_db.json`)** if the database connection fails. 
All CRUD operations, user creations, appointment slots calculations, and admin dashboard metrics updates are fully simulated in this mode.

To connect a production database, update the `MONGODB_URI` environment variable inside `backend/.env` with your **MongoDB Atlas connection string**.

---

## 🔑 Pre-Registered Credentials for Testing

Use these accounts to sign in immediately on the login portal:

### 1. Salon Administrator Portal
*   **Email**: `admin@vivasalon.com`
*   **Password**: `adminpassword123`
*   *Provides full CRUD controls over bookings, services catalog, lookbook gallery, promotions, and analytics graphs.*

### 2. Premium Customer Portal
*   **Email**: `user@vivasalon.com`
*   **Password**: `userpassword123`
*   *Allows browsing the catalog, adding items to the ritual drawer, selecting date/time slot availability, and tracking past appointments.*
