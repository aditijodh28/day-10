# Smart Facility Management Dashboard

## Project Overview

Smart Facility Management Dashboard is a responsive web application developed as the final project of the 10-Day Intern Technical Training and Domain Assessment Program.

The system helps organizations monitor facilities, hygiene inspections and complaints through a centralized dashboard.

The application provides facility management, inspection tracking, complaint management and REST API integration.

## Problem Statement

Managing multiple facilities manually can make it difficult to monitor cleanliness, inspections and complaints.

The objective of this project is to provide a centralized digital platform where facility information, hygiene inspections and complaints can be managed efficiently.

## Features

* Responsive dashboard
* Facility management
* Facility search
* Cleanliness score monitoring
* Inspection management
* Complaint management
* Complaint priority tracking
* REST API integration
* PostgreSQL database
* Form validation
* API error handling
* Reusable React components
* Angular API integration
* Responsive UI
* Cloud deployment using Vercel

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* REST API

### Database

* PostgreSQL
* Neon

### Additional Technology

* Angular
* Git
* GitHub
* Vercel

## Architecture

```text
                    User
                     |
                     v
              Next.js Frontend
                     |
        +------------+------------+
        |            |            |
        v            v            v
   Facilities   Inspections   Complaints
        |            |            |
        +------------+------------+
                     |
                     v
              REST API Routes
                     |
                     v
              PostgreSQL
                 Neon DB
```

## Project Structure

```text
day-10/
└── final-project/
    ├── frontend/
    │   ├── app/
    │   │   ├── api/
    │   │   ├── facilities/
    │   │   ├── inspections/
    │   │   ├── complaints/
    │   │   └── page.tsx
    │   ├── components/
    │   └── lib/
    │
    ├── backend/
    │   └── README.md
    │
    ├── database/
    │   └── schema.sql
    │
    ├── ml/
    │   └── README.md
    │
    └── README.md
```

## Database Design

### Facilities

| Column            | Type      | Description            |
| ----------------- | --------- | ---------------------- |
| id                | SERIAL    | Primary key            |
| name              | VARCHAR   | Facility name          |
| location          | VARCHAR   | Facility location      |
| type              | VARCHAR   | Facility type          |
| cleanliness_score | INTEGER   | Cleanliness percentage |
| status            | VARCHAR   | Facility status        |
| created_at        | TIMESTAMP | Creation timestamp     |

### Inspections

| Column             | Type    | Description        |
| ------------------ | ------- | ------------------ |
| id                 | SERIAL  | Primary key        |
| facility_id        | INTEGER | Foreign key        |
| inspection_date    | DATE    | Inspection date    |
| cleanliness_score  | INTEGER | Cleanliness score  |
| odor_score         | INTEGER | Odor score         |
| waste_level        | INTEGER | Waste level        |
| water_availability | BOOLEAN | Water availability |
| inspector          | VARCHAR | Inspector name     |
| remarks            | TEXT    | Inspection remarks |

### Complaints

| Column         | Type    | Description           |
| -------------- | ------- | --------------------- |
| id             | SERIAL  | Primary key           |
| facility_id    | INTEGER | Foreign key           |
| title          | VARCHAR | Complaint title       |
| description    | TEXT    | Complaint description |
| priority       | VARCHAR | Complaint priority    |
| status         | VARCHAR | Complaint status      |
| complaint_date | DATE    | Complaint date        |

## Relationships

```text
Facilities
    |
    +----< Inspections
    |
    +----< Complaints
```

One facility can have multiple inspections and multiple complaints.

## API Documentation

### Get Facilities

```http
GET /api/facilities
```

Returns all facilities.

### Create Facility

```http
POST /api/facilities
Content-Type: application/json
```

Example:

```json
{
  "name": "Community Hall",
  "location": "Nagpur",
  "type": "Community",
  "cleanliness_score": 82,
  "status": "Active"
}
```

### Get Inspections

```http
GET /api/inspections
```

### Create Inspection

```http
POST /api/inspections
```

### Get Complaints

```http
GET /api/complaints
```

### Create Complaint

```http
POST /api/complaints
```

## Environment Variables

Create `.env.local`:

```env
DATABASE_URL=your_postgresql_connection_string
```

The database connection string must not be committed to GitHub.

## Installation

Clone the repository:

```bash
git clone https://github.com/aditijodh28/day-10
```

Move into the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

## How to Run

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Angular Integration

The project includes a functional Angular module/page that consumes the facility API.

The Angular module demonstrates:

* Angular components
* TypeScript
* HTTP Client
* API integration
* Facility data display
* Error handling

## Testing

The following application flows were tested:

* Dashboard loading
* Facility API request
* Inspection API request
* Complaint API request
* Facility search
* Database connection
* Responsive interface
* API error handling

## Challenges Faced

### Database Integration

Connecting the web application to a cloud PostgreSQL database required environment configuration.

### API Error Handling

API endpoints were implemented with validation and error responses to handle invalid requests.

### Responsive Design

The interface was designed using Tailwind CSS responsive utility classes.

### Angular Integration

An Angular module was connected to the same REST API to demonstrate interoperability between frontend technologies.

## Solutions

* Used Neon PostgreSQL for cloud database hosting.
* Used environment variables for secure database configuration.
* Added validation to API requests.
* Added error handling to API routes.
* Used reusable React components.
* Used responsive Tailwind CSS classes.
* Connected Angular HTTP Client to the REST API.

## Deployment

The application is deployed using Vercel.

Production URL:

```text
[YOUR_VERCEL_URL](https://day-10-3kjo-5njor1ew3-aditijodh28s-projects.vercel.app/)
```

## Future Improvements

* Authentication and role-based access
* Advanced analytics
* Hygiene risk prediction using machine learning
* Interactive charts
* Automated inspection scheduling
* Email notifications
* Complaint assignment
* Image upload for inspection reports
* Mobile application using Ionic/Angular
* Advanced facility risk scoring
