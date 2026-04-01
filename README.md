# Mini Event Management System

A RESTful API built with Node.js, Express.js, and MySQL for managing events, booking tickets, and tracking attendance.

## Features

- **Database Design**: Normalized MySQL schema with `Users`, `Events`, `Bookings`, and `Event_Attendance` tables enforcing referential integrity.
- **Race Condition Prevention**: Employs SQL Transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) and `SELECT ... FOR UPDATE` row-level locks to ensure tickets are never overbooked during concurrent requests.
- **Robust Validation**: Custom manual input validation covering data types, boundaries, and required fields.
- **Interactive Documentation**: Full OpenAPI specification accessible via Swagger UI.
- **Production Ready**: Includes centralized global error handling and graceful terminal shutdown.

## Prerequisites

- **Node.js** (v18 or newer recommended)
- **MySQL Server** (Running locally or remotely)

## Getting Started

### 1. Install Dependencies

Navigate to the project root and install the required NPM packages:
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

The application uses a `.env` file to manage secrets and configurations.
Ensure your `.env` file exists in the root directory (you can copy `.env.example` if needed) and update it with your MySQL credentials:
\`\`\`env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=event_management
PORT=3000
NODE_ENV=development
\`\`\`

### 3. Initialize the Database

Once your MySQL server is running and the `.env` file is properly configured, run the database initialization script. This will automatically create the `event_management` database and scaffold all necessary tables (Users, Events, Bookings, Event_Attendance).

\`\`\`bash
node src/init-db.js
\`\`\`

_Note: You only need to run this command once._

### 4. Run the Server

To start the application natively:
\`\`\`bash
npm start
\`\`\`

For development (auto-restarts on file changes using `nodemon`):
\`\`\`bash
npm run dev
\`\`\`

The server will start on `http://localhost:3000`.

## API Documentation (Swagger)

Interactive OpenAPI documentation is built into the server. Once the server is running, open your browser and navigate to:
**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

From there, you can view the request/response schemas and test out the endpoints directly in your browser.

## Core API Endpoints

- \`GET /events\` - List all upcoming events.
- \`POST /events\` - Create a new event.
- \`POST /bookings\` - Book a ticket for an event. Generates a unique booking code.
- \`GET /users/:id/bookings\` - Retrieve all bookings made by a specific user.
- \`POST /events/:id/attendance\` - Mark attendance using the unique booking code.
