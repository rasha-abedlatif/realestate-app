# Real Estate Management System

## Project Overview

This project is a full-stack web application developed using **Flask, MySQL (XAMPP), and Angular**. It implements a role-based access control system for managing residential complexes, buildings, and administrative users.

---

## Technologies Used

### Backend

* Python
* Flask
* MySQL (XAMPP)
* JWT Authentication
* Bcrypt
* Flask-CORS

### Frontend

* Angular
* TypeScript
* HTML
* Tailwind CSS

### Testing

* Postman

---

## System Rules & Relationships

For this implementation, a hierarchical role model was adopted:
1- Each Residential Complex has one Complex Admin
2- Each Complex Admin manages only one Residential Complex
3- Each Complex Admin can create multiple Buildings within their complex
4- Each Building belongs to one Residential Complex
5- Each Building has one Building Admin
6- Each Building Admin manages only one Building
7- Super Admin has full system control

---

## User Roles

## Super Admin

The highest-level user in the system.

### Permissions:

* Login to the system
* View all admins
* Search and paginate admins
* View admin details
* Create:

  * Complex Admins
  * Building Admins
  * Residential Complexes
  * Buildings
* Assign Complex Admins to complexes
* Assign Building Admins to buildings
* Delete any building

---

## Complex Admin

Assigned to exactly one residential complex.

### Permissions:

* View all residential complexes (read-only)
* View all buildings (read-only)
* Create buildings only inside their assigned complex
* Assign a Building Admin when creating a building
* Delete buildings only within their assigned complex

### Rules:

* Each Complex Admin belongs to **one complex only**
* A Complex Admin can create **multiple buildings**
* But ONLY inside their assigned complex
* Cannot modify complexes
* Cannot access data outside their assigned complex scope

---

## Building Admin

Assigned to exactly one building.

### Permissions:

* View residential complexes (read-only)
* View buildings (read-only)
* No create, update, or delete permissions

### Rules:

* Each Building Admin is assigned to **exactly one building**
* Each building has **exactly one Building Admin**
* Cannot manage multiple buildings
* Cannot modify any data

---

## Main Features

### Authentication

* Login using email and password
* JWT token generation
* Role-based route protection (Angular Guards)

---

### Admin Management

* List all admins (search + pagination)
* Create admins (Super Admin only)
* View admin details

---

### Residential Complex Management

* Create residential complexes (Super Admin only)
* Assign Complex Admin automatically or during creation
* View complexes and their buildings

---

### Building Management

* Create buildings (Super Admin or Complex Admin)
* Each building is linked to:

  * one residential complex
  * one building admin
* Delete buildings (based on role permissions)
* Filter buildings by complex

---

## Form Validation

All forms include:

* Required field validation
* API error handling
* Phone validation (+961 default)
* Numeric-only inputs
* Prevent submission if invalid

---

## Project Structure

### Backend

```
app/
├── auth.py
├── admins.py
├── complexes.py
├── buildings.py
└── __init__.py

app.py
config.py
```

---

### Frontend

```
src/app/
├── components/
│   ├── login
│   ├── dashboard
│   ├── admins
│   ├── complexes
│   └── buildings
├── services
├── guards
└── interceptors
```

---

## Running the Project

### Backend

1. Start MySQL + Apache (XAMPP)
2. Import database
3. Configure `config.py`
4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Run server:

```bash
python app.py
```

Backend:

```
http://localhost:5000
```

---

### Frontend

```bash
npm install
ng serve
```

Frontend:

```
http://localhost:4200
```

---

## API Testing

All endpoints tested using Postman:

* Auth APIs
* Admin APIs
* Complex APIs
* Building APIs

---

## Design Decisions

* JWT used for authentication and authorization
* Passwords hashed using Bcrypt
* Email must be unique
* Strict hierarchical role system:

  * Super Admin → Full control
  * Complex Admin → One complex, multiple buildings inside it
  * Building Admin → Exactly one building only
* Every building is linked to:

  * one complex
  * one building admin
