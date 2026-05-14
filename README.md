<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=CAR%20CALLING%20PLATFORM&fontSize=40&fontColor=ffffff&animation=fadeIn" />

  **Scalable Full-Stack Car Rental Solution** 

  <a href="https://github.com/Basmala-ElKady">
    <img src="https://readme-typing-svg.demolab.com/?lines=MERN%20STACK;ROLE-BASED%20ACCESS;LAYERED%20ARCHITECTURE;DOCKER%20READY&font=Fira%20Code&center=true&width=500&height=40&color=36BCF7&vCenter=true&size=24" />
  </a>
</div>

---

# Car Calling Platform

A comprehensive **Full-Stack** car rental ecosystem designed for high scalability and secure role-based operations. The platform bridges the gap between car owners (**Landlords**) and renters (**Tenants**) with dedicated modules for **Delivery** and **Admin** management.

---

## System Architecture

This project follows a **Layered Architecture** (Clean Architecture principles) to ensure separation of concerns and ease of testing.

### Backend (Node.js & Express)
The backend is structured into distinct layers:
- **Routes:** API endpoint definitions.
- **Middlewares:** Authentication (JWT), Authorization (RBAC), and Request Validation.
- **Controllers:** Orchestrating the flow between requests and services.
- **Services:** Housing the core **Business Logic** (Pricing, Booking Rules, Status Management).
- **Models:** MongoDB schemas with Mongoose for data persistence.

### Frontend (React & Vite)
- **State Management:** Context API for Global Auth & User Roles.
- **Routing:** Protected routes based on user permissions.
- **UI:** Modular component structure for high reusability.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), React Router, Axios, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **DevOps** | Docker, Docker Compose |
| **Tools** | Postman (API Testing), Git/GitHub |

---

## User Roles & Features

### Renter
- **Smart Booking:** Real-time availability check and price calculation.
- **Verification:** Mandatory profile verification before renting.
- **Condition Logs:** Upload car photos before/after rental.

### Owner
- **Fleet Management:** Add/Edit cars and track their rental status.
- **User Control:** Ability to block problematic users from renting their cars.

### Delivery Personnel
- **Task Management:** View assigned car delivery tasks.
- **Visual Proof:** Upload handover photos for security.

### Admin
- **Analytics:** Dashboard for system-wide performance and reports.
- **Governance:** Manage users, car listings, and system notifications.

---

## Getting Started

### Prerequisites
- Node.js installed
- Docker (Optional for containerized setup)

### Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AmrKhaledShawky/Car-Calling.git

2. **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Create .env file with your MONGO_URI and JWT_SECRET
    npm start

3. **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev

---

<div align="center">
  <i>Developed with precision and clean code principles.</i>
  <br>
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=footer" />
</div>
