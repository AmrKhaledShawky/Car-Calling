# 🚗 Car Calling Platform – Frontend

A multi-role car rental web application built with React.

This platform allows tenants to rent cars, landlords to list vehicles, delivery personnel to manage deliveries, and admins to manage the entire system.

This repository contains the **frontend application only**.

---

## 📌 Project Overview

Car Calling is a role-based car rental platform that supports:

- Visitors (browse only)
- Tenants (rent cars)
- Landlords (list cars)
- Delivery Personnel
- Admins
- Premium Users

The system is designed with scalability, modularity, and clean architecture in mind.

---

## 🏗️ Tech Stack

- React (Vite)
- React Router DOM
- Context API (Authentication & Role Management)
- Axios (API communication)
- TailwindCSS (optional styling)
- JavaScript (ES6+)

---

## 📁 Project Structure

```
src/
│
├── app/
├── assets/
├── components/
├── context/
├── hooks/
├── pages/
├── routes/
├── services/
└── utils/
```

The project follows a feature-based and role-based architecture to support growth and maintainability.

---

## 👥 System User Roles

### 🔹 Visitor
- Browse available cars
- View car details
- Cannot rent cars

### 🔹 Tenant
- Complete profile verification
- Search and filter cars
- Schedule rentals
- Apply promo codes
- Upload car condition photos (before/after)
- Chat with car owners
- Manage rentals
- Subscribe to premium

### 🔹 Landlord
- Add cars
- Manage listings
- Track cars
- Block users
- View rental requests

### 🔹 Delivery Personnel
- View assigned deliveries
- Upload before/after delivery photos

### 🔹 Admin
- View analytics dashboard
- Manage users
- View reports
- Send system notifications

---

## 🔐 Authentication & Security

- Role-based routing
- Protected routes
- Password complexity validation
- Account lock after multiple failed login attempts
- Verification required before renting or listing cars
- Payment method required before rental

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/car-calling-frontend.git
cd car-calling-frontend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Start Development Server

```bash
npm run dev
```

---

## 🛣️ Routing Structure

- `/` → Public pages
- `/auth/*` → Authentication pages
- `/tenant/*` → Tenant dashboard
- `/landlord/*` → Landlord dashboard
- `/delivery/*` → Delivery dashboard
- `/admin/*` → Admin dashboard

---

## 👨‍💻 Team Members

| Name                          | Role in Project |
|-------------------------------|------------------|
| Amr Khaled Mohamed Shawky     | __________________________ |
| Maryam Gomaa                  | __________________________ |
| Hoda Mahmoud                  | __________________________ |
| Jowairya Kassem               | __________________________ |
| Basmala Elkady                | __________________________ |

---

## 🎯 Development Roadmap

### Phase 1
- Project setup
- Routing structure
- Authentication UI

### Phase 2
- Car browsing
- Tenant rental flow

### Phase 3
- Landlord dashboard
- Admin panel

### Phase 4
- Chat system
- Delivery system
- Premium features

---

## 📌 Future Improvements

- Real-time chat with WebSockets
- Advanced analytics dashboard
- Payment integration (Stripe/PayPal)
- Mobile responsiveness optimization
- Progressive Web App (PWA) support

---

## 📄 License

This project is for educational and development purposes.

---

🔥 Built with scalability and clean architecture in mind.
