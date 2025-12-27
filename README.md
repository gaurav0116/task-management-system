# Task Management System

## Prerequisites
- Node.js (v24+ recommended)
- MongoDB (v8 recommended)

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd task-management-system
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure environment variables.

```bash
cd backend
npm install
```

#### Configuration
Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5001
MONGO_URI=mongodb://username:password@localhost:27022/task-management-db
JWT_SECRET=your_super_secret_key_here
# Optional: Set default passwords for seeder (fallback is admin123/user123)
ADMIN_PASSWORD=admin123
USER_PASSWORD=user123
```
> **Note**: Update `MONGO_URI` with your actual MongoDB credentials.

#### Database Seeding
**Before starting the server**, you must seed the database with initial roles and users.

```bash
# Run the seeder script
npm run seed

# To destroy all data (reset db):
# npm run seed-destroy
```

#### Run Server
```bash
# Start in development mode (with hot reload)
npm run dev

# Or start in production mode
npm start
```
The backend server will start on `http://localhost:5001`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies.

```bash
cd frontend
npm install
```

#### Run Application
```bash
npm run dev
```
The frontend application will start on `http://localhost:5173`.

## Default Credentials
After running the seeder, you can log in with the following accounts:

| Role  | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` (or ENV value) |
| **User** | `user1@example.com` | `user123` (or ENV value) |