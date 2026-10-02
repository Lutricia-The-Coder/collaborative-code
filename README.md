# Collaborative Code Review Platform

A REST API-driven collaborative code review platform built with **Node.js, TypeScript, Express.js, PostgreSQL, JWT, and WebSockets**.

The platform allows users to create projects, submit code, request and perform reviews, add inline comments, track review history, receive notifications, and receive real-time review updates.

---

# 1. Technologies Used

* Node.js
* TypeScript
* Express.js
* PostgreSQL
* JWT
* bcryptjs
* WebSocket (`ws`)
* dotenv
* pg (PostgreSQL Node.js driver)

---

# 2. Requirements

Before running the project, install:

* Node.js
* npm
* PostgreSQL
* pgAdmin 4
* Git

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

Check PostgreSQL:

```bash
psql --version
```

---

# 3. Clone the Project

Clone the repository:

```bash
git clone code-collaborative
```

Enter the project directory:

```bash
cd code-collaborative
```

---

# 4. Install Dependencies

Install all project dependencies:

```bash
npm install
```

The project uses the following main dependencies:

```text
express
pg
dotenv
bcryptjs
jsonwebtoken
ws
```

Development dependencies include:

```text
typescript
ts-node-dev
@types/node
@types/express
@types/pg
@types/jsonwebtoken
@types/ws
```

---

# 5. Create the PostgreSQL Database

Open PostgreSQL using pgAdmin 4 or the PostgreSQL command line.

Create a database named:

```text
code_review_db
```

For example, using PostgreSQL:

```sql
CREATE DATABASE code_review_db;
```

Connect to the database before running the schema.

---

# 6. Create the Database Tables

The database schema is located at:

```text
database/schema.sql
```

Run the contents of `schema.sql` against the `code_review_db` database.

The schema creates the following tables:

```text
users
projects
project_members
submissions
comments
review_history
activity_feed
```

## Database Schema

### users

Stores registered users.

| Column          | Type                | Description               |
| --------------- | ------------------- | ------------------------- |
| id              | SERIAL PRIMARY KEY  | Unique user ID            |
| name            | VARCHAR(100)        | User name                 |
| email           | VARCHAR(255) UNIQUE | User email                |
| password_hash   | TEXT                | Hashed password           |
| role            | VARCHAR(20)         | `reviewer` or `submitter` |
| profile_picture | TEXT                | Profile picture path/URL  |

---

### projects

Stores code review projects.

| Column      | Type               | Description               |
| ----------- | ------------------ | ------------------------- |
| id          | SERIAL PRIMARY KEY | Unique project ID         |
| name        | VARCHAR(150)       | Project name              |
| description | TEXT               | Project description       |
| owner_id    | INTEGER            | User who owns the project |

`owner_id` references:

```text
users(id)
```

---

### project_members

Associates users with projects.

| Column     | Type    | Description |
| ---------- | ------- | ----------- |
| project_id | INTEGER | Project ID  |
| user_id    | INTEGER | User ID     |

The combination of `project_id` and `user_id` is the primary key.

Both columns reference their respective tables.

---

### submissions

Stores submitted code.

| Column       | Type               | Description                 |
| ------------ | ------------------ | --------------------------- |
| id           | SERIAL PRIMARY KEY | Submission ID               |
| project_id   | INTEGER            | Associated project          |
| submitter_id | INTEGER            | User who submitted the code |
| title        | VARCHAR(255)       | Submission title            |
| filename     | VARCHAR(255)       | Submitted filename          |
| code         | TEXT               | Code contents               |
| language     | VARCHAR(50)        | Programming language        |
| status       | VARCHAR(30)        | Submission status           |
| created_at   | TIMESTAMP          | Creation time               |

Supported statuses:

```text
pending
in_review
approved
changes_requested
```

---

### comments

Stores reviewer comments.

| Column        | Type               | Description                      |
| ------------- | ------------------ | -------------------------------- |
| id            | SERIAL PRIMARY KEY | Comment ID                       |
| submission_id | INTEGER            | Submission being commented on    |
| user_id       | INTEGER            | Reviewer who created the comment |
| content       | TEXT               | Comment text                     |
| line_number   | INTEGER            | Code line number, nullable       |

If `line_number` is `NULL`, the comment is a general comment.

---

### review_history

Stores the history of reviews performed on submissions.

| Column        | Type               | Description                       |
| ------------- | ------------------ | --------------------------------- |
| id            | SERIAL PRIMARY KEY | Review history ID                 |
| submission_id | INTEGER            | Reviewed submission               |
| reviewer_id   | INTEGER            | Reviewer who performed the review |
| status        | VARCHAR(30)        | Review result                     |
| created_at    | TIMESTAMP          | Review time                       |

Review statuses include:

```text
approved
changes_requested
```

---

### activity_feed

Stores user notifications/activity.

| Column     | Type               | Description                     |
| ---------- | ------------------ | ------------------------------- |
| id         | SERIAL PRIMARY KEY | Activity ID                     |
| user_id    | INTEGER            | User receiving the notification |
| message    | TEXT               | Notification message            |
| created_at | TIMESTAMP          | Notification time               |

---

# 7. Database Relationships

The main relationships are:

```text
users
  |
  ├── projects.owner_id
  |
  ├── project_members.user_id
  |
  ├── submissions.submitter_id
  |
  ├── comments.user_id
  |
  ├── review_history.reviewer_id
  |
  └── activity_feed.user_id


projects
  |
  ├── project_members.project_id
  |
  └── submissions.project_id


submissions
  |
  ├── comments.submission_id
  |
  └── review_history.submission_id
```

Several relationships use `ON DELETE CASCADE` so related records are automatically removed when their parent record is deleted.

---

# 8. Configure Environment Variables

Create a `.env` file in the project root.

The project structure should contain:

```text
code-collaborative/
├── database/
├── src/
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

Add the following to `.env`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=code_review_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

JWT_SECRET=my_super_secret_key_123
```

Replace:

```text
YOUR_POSTGRES_PASSWORD
```

with your PostgreSQL password.

Do not commit `.env` to Git.

---

# 9. Project Structure

```text
code-collaborative/
├── database/
│   └── schema.sql
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── db.ts
│   ├── auth.ts
│   ├── middleware.ts
│   ├── users.ts
│   ├── projects.ts
│   ├── submissions.ts
│   ├── comments.ts
│   ├── reviews.ts
│   ├── notifications.ts
│   ├── stats.ts
│   ├── webserver.ts
│   └── validation.ts
│
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

---

# 10. Run the Application

## Development Mode

From the project root:

```bash
npm run dev
```

The REST API runs on:

```text
http://localhost:5000
```

The WebSocket server runs on:

```text
ws://localhost:5001
```

When the server starts successfully, you should see messages similar to:

```text
Database connected
Server running on http://localhost:5000
WebSocket server running on ws://localhost:5001
```

---

# 11. Build the Project

To compile the TypeScript project:

```bash
npm run build
```

The compiled JavaScript files are generated in:

```text
dist/
```

A successful build should finish without TypeScript errors.

---

# 12. Run the Production Build

After building:

```bash
npm start
```

This runs:

```text
dist/server.js
```

---

# 13. Test the API

The API can be tested using:

* Postman
* Insomnia
* Thunder Client
* curl

The examples below use HTTP requests.

---

# 14. Authentication

## Register

```http
POST http://localhost:5000/api/auth/register
```

Body:

```json
{
  "name": "Alice Reviewer",
  "email": "alice@example.com",
  "password": "password123",
  "role": "reviewer"
}
```

A submitter can be registered using:

```json
{
  "name": "Bob Submitter",
  "email": "bob@example.com",
  "password": "password123",
  "role": "submitter"
}
```

---

## Login

```http
POST http://localhost:5000/api/auth/login
```

Example:

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

The response contains a JWT token.

Use the token for protected endpoints:

```text
Authorization: Bearer YOUR_TOKEN
```

Do not commit JWT tokens to the repository.

---

# 15. User Endpoints

## Get Current User

```http
GET http://localhost:5000/api/auth/me
```

## Get User Profile

```http
GET http://localhost:5000/api/users/:id
```

Users can only access their own profile.

## Update User Profile

```http
PUT http://localhost:5000/api/users/:id
```

Example:

```json
{
  "name": "Alice Updated",
  "email": "alice@example.com",
  "profile_picture": "alice.png"
}
```

## Delete User

```http
DELETE http://localhost:5000/api/users/:id
```

---

# 16. Project Endpoints

## Create Project

```http
POST http://localhost:5000/api/projects
```

Example:

```json
{
  "name": "Code Review Platform",
  "description": "Collaborative code review project"
}
```

## List Projects

```http
GET http://localhost:5000/api/projects
```

## Add Project Member

```http
POST http://localhost:5000/api/projects/:id/members
```

Example:

```json
{
  "userId": 2
}
```

## Remove Project Member

```http
DELETE http://localhost:5000/api/projects/:id/members/:userId
```

---

# 17. Submission Endpoints

## Create Submission

```http
POST http://localhost:5000/api/projects/:projectId/submissions
```

Example:

```json
{
  "title": "Login Function",
  "filename": "login.ts",
  "code": "function login(user) {\n    return user.isValid;\n}",
  "language": "typescript"
}
```

## List Project Submissions

```http
GET http://localhost:5000/api/projects/:projectId/submissions
```

## Get Submission

```http
GET http://localhost:5000/api/submissions/:id
```

## Update Submission Status

```http
PUT http://localhost:5000/api/submissions/:id/status
```

Example:

```json
{
  "status": "pending"
}
```

## Delete Submission

```http
DELETE http://localhost:5000/api/submissions/:id
```

---

# 18. Comment Endpoints

Only reviewers can create comments.

## Add Comment

```http
POST http://localhost:5000/api/submissions/:submissionId/comments
```

Example:

```json
{
  "content": "Please improve the error handling.",
  "line_number": 2
}
```

For a general comment:

```json
{
  "content": "Please improve the overall implementation.",
  "line_number": null
}
```

## List Comments

```http
GET http://localhost:5000/api/submissions/:submissionId/comments
```

## Update Comment

```http
PUT http://localhost:5000/api/comments/:id
```

## Delete Comment

```http
DELETE http://localhost:5000/api/comments/:id
```

---

# 19. Review Endpoints

Only reviewers can review submissions.

## Review Submission

```http
PUT http://localhost:5000/api/submissions/:id/review
```

Approve:

```json
{
  "status": "approved"
}
```

Request changes:

```json
{
  "status": "changes_requested"
}
```

## Review History

```http
GET http://localhost:5000/api/submissions/:id/reviews
```

---

# 20. Notification Endpoints

## Create Notification

```http
POST http://localhost:5000/api/notifications
```

Example:

```json
{
  "message": "Submission 2 was reviewed."
}
```

## Get User Notifications

```http
GET http://localhost:5000/api/users/:id/notifications
```

Example:

```http
GET http://localhost:5000/api/users/1/notifications
```

---

# 21. Statistics Endpoint

Get project analytics:

```http
GET http://localhost:5000/api/projects/:projectId/stats
```

Example:

```http
GET http://localhost:5000/api/projects/1/stats
```

The response contains:

```text
average_review_time
review_results
reviewer_activity
most_commented_submission
```

---

# 22. WebSocket

The WebSocket server runs on:

```text
ws://localhost:5001
```

When a client connects, it receives:

```json
{
  "message": "Connected to code review updates"
}
```

When a review is performed, a review update is broadcast:

```json
{
  "type": "review_update",
  "submission_id": 2,
  "reviewer_id": 1,
  "status": "approved"
}
```

---

# 23. Validation and Authorization

The application validates required request fields.

For example, registration requires:

```text
name
email
password
```

Missing fields return a `400` response.

Example:

```json
{
  "message": "password is required"
}
```

Authentication errors return `401`.

Example:

```json
{
  "message": "Invalid or expired token"
}
```

Role restrictions include:

* Only reviewers can comment.
* Only reviewers can review submissions.
* Submitters cannot review submissions.
* Users can only access their own profiles.
* Users can update/delete their own comments.

---

# 24. Example Test Users

The project was tested with the following users:

### Reviewer

```text
Name: Alice Reviewer
Email: alice@example.com
Role: reviewer
Password: password123
```

### Submitter

```text
Name: Bob Submitter
Email: bob@example.com
Role: submitter
Password: password123
```

These credentials are intended for local development/testing only.

---

# 25. Testing Completed

The following functionality has been tested:

### Authentication

* User registration
* User login
* JWT authentication
* Current user endpoint
* Invalid JWT handling

### Users

* Get own profile
* Update profile
* Profile authorization
* Delete user endpoint

### Projects

* Create project
* List projects
* Add project member
* Remove project member

### Submissions

* Create submission
* List project submissions
* Get submission by ID
* Update submission status
* Delete submission
* Verify deleted submission cannot be retrieved

### Comments

* Create comment
* List comments
* Update comment
* Delete comment
* Reviewer authorization
* Submitter comment restriction

### Reviews

* Approve submission
* Request changes
* Review history
* Submitter review restriction

### Notifications

* Create notification
* Get user notification feed

### Statistics

* Average review time
* Review results
* Reviewer activity
* Most-commented submission

### WebSockets

* WebSocket server connection
* Initial connection message
* Review update broadcasting

### Validation

* Required fields
* Invalid JWT
* Invalid review status
* Role-based authorization

---

# 26. Quick Start

For a new machine, the basic process is:

### Step 1 — Clone

```bash
git clone <YOUR_REPOSITORY_URL>
cd code-collaborative
```

### Step 2 — Install packages

```bash
npm install
```

### Step 3 — Create PostgreSQL database

Create:

```text
code_review_db
```

### Step 4 — Run the schema

Execute:

```text
database/schema.sql
```

against `code_review_db`.

### Step 5 — Create `.env`

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=code_review_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD

JWT_SECRET=my_super_secret_key_123
```

### Step 6 — Build

```bash
npm run build
```

### Step 7 — Start development server

```bash
npm run dev
```

### Step 8 — Test the API

Open:

```text
http://localhost:5000
```

The WebSocket server is available at:

```text
ws://localhost:5001
```

---

# 27. Security Notes

* Passwords are hashed using bcrypt.
* Passwords are never stored as plain text.
* JWT is used for protected API endpoints.
* JWT secrets are stored in `.env`.
* `.env` is excluded from Git.
* SQL queries use parameterized values.
* Users are restricted from accessing other users' profiles.
* Reviewer-only functionality is protected by role checks.

---

# 28. Author

Collaborative Code Review Platform

Built using:

```text
Node.js
TypeScript
Express.js
PostgreSQL
JWT
WebSockets
```
