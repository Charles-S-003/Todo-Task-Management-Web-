Prerequisites

Node.js (v16 or higher)
npm or yarn
Git
MongoDB/PostgreSQL database

Local Development Setup

1 )Clone the Repository
bashgit clone https://github.com/yourusername/todo-task-management-web.git
cd todo-task-management-web

2)Install Dependencies
# Install frontend dependencies

# Install backend dependencies
cd ../backend
npm install
cd frontend
npm install



Database Setup
bash# If using MongoDB
npm run db:seed

# If using PostgreSQL
npm run db:migrate
npm run db:seed

Run the Application
bash# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

Access the Application

Frontend: http://localhost:5173
Backend API: http://localhost:5000
