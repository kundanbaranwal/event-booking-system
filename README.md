# Mini Event Management System

A RESTful API built with Node.js, Express.js, and MySQL for managing events, booking tickets, and tracking attendance.

## Prerequisites

- **Node.js** (v18 or newer recommended)
- **MySQL Server** (Running locally or remotely)

## Setup & Running the Server

### 1. Install Dependencies

Navigate to the project root and install the required NPM packages:

```bash
npm install
```

### 2. Configure Environment Variables

Ensure your `.env` file exists in the root directory (you can copy `.env.example` if needed) and update it with your actual MySQL database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=event_management
PORT=3000
NODE_ENV=development
```

### 3. Initialize the Database Schema

Ensure your MySQL server is currently running. Instead of manually importing the `schema.sql` file, you can run the automated initialization script which creates the database and populates the required tables automatically:

```bash
node src/init-db.js
```

_(You only need to run this command once.)_

### 4. Start the Application

To start the application natively:

```bash
npm start
```

The server will start and remain active in the terminal on `http://localhost:3000`.

_(To view the interactive API Documentation, navigate to **http://localhost:3000/api-docs** in your browser while the server is running.)_
