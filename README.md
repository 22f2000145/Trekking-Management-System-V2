# Trekking Management System (V2)

A comprehensive, responsive web application for managing mountain trekking bookings, guide assignments, payment verifications, and reporting. Built using a modern, decoupled stack featuring **Flask (Python)**, **Flask-RESTful**, **Vue.js**, **Celery**, **Redis**, and **Flask-Security-Too**.

---

## 🌟 Core Features

###  User Roles & Workflows

1. **Trekker (User)**
   * View, search, and filter available treks by difficulty, location, and duration.
   * Book treks and view booking histories.
   * Secure payment flow: submit payments for review (booking enters "Pending Verification" state).

2. **Guide (Staff)**
   * View all treks assigned to them by the Admin.
   * Monitor slot counts and update trek statuses (Open, Closed, Completed).
   * View lists of trekkers registered for their assigned treks.
   * Account registration is subject to Admin approval before activation.

3. **Administrator (Admin)**
   * Complete CRUD controls on Treks (Create, Read, Update, Delete).
   * Manage user and guide accounts (activate/deactivate or approve pending staff).
   * **Payment Approval Panel**: review pending trekker payments and approve them (transitions status to "Paid", registers the booking, and decrements slots).
   * Export trek bookings lists to downloadable CSV files asynchronously.

###  Performance & Integrations
* **Redis Caching**: Trek list queries are cached in Redis memory with a timeout of 50s. Cache invalidations occur automatically on database writes (trek creation, edits, deletions, and booking slot updates) to ensure data integrity.
* **Google Chat Webhooks**: Asynchronous notifications are sent to Google Chat spaces via incoming webhooks when payments are confirmed.
* **Asynchronous Tasks**: Background task execution handled by Celery workers to keep web-server operations non-blocking.
* **Periodic Jobs**: Celery Beat schedules periodic email reports detailing trekker booking activities.

---

##  Installation & Setup Instructions

Follow these step-by-step instructions to get the application running locally. All services should run inside a Linux/WSL environment.

### Step 1: Create a Python Virtual Environment
Open a terminal inside the project root directory and create a new virtual environment:
```bash
python3 -m venv .env
```

### Step 2: Activate the Virtual Environment
Activate the environment to ensure Python packages are installed locally:
```bash
source .env/bin/activate
```

### Step 3: Install Dependencies
Install all required libraries listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### Step 4: Start the Redis Server
Start the Redis service, which is used as the caching storage database and the Celery broker:
```bash
sudo service redis-server start
```
*(Verify it's running by executing `redis-cli ping` - it should return `PONG`)*

### Step 5: Start the Local Mail/SMTP Server
Start MailHog (or your local SMTP provider) on port `1025` to intercept outbound emails:
```bash
mailhog
```
*(If you do not have MailHog installed, you can run Python's debugging SMTP server in a terminal)*:
```bash
python3 -m smtpd -c DebuggingServer -n localhost:1025
```

### Step 6: Start the Celery Worker & Beat Scheduler
Open two new terminal windows (make sure to navigate to the project root and run `source .env/bin/activate` in both).

* **In Terminal 2 (Start worker)**:
  ```bash
  celery -A app:celery worker --loglevel=info
  ```
* **In Terminal 3 (Start Beat scheduler)**:
  ```bash
  celery -A app:celery beat --loglevel=info
  ```

### Step 7: Run the Flask Application
In your main terminal window, start the Flask development server:
```bash
python3 app.py
```
The application will create the database tables (`trek.db` inside `instance/`) automatically, pre-populate security roles, create a default administrator, and start serving on **`http://127.0.0.1:5000`**.

---

##  Default Administrator Credentials

Use these credentials to log in as the default Administrator:
* **Email:** `admin01@trek.com`
* **Password:** `1234`

---

## 📁 Directory Layout

```text
Trekking-Management-System-V2/
│
├── app.py                      # Application Entry Point & Extension Initialization
├── celery_config.py            # Celery Configuration for Background Tasks
├── requirements.txt            # Python Packages & Dependencies
│
├── application/                # Core Application Logic
│   ├── config.py               # Local Development Configurations
│   ├── database.py             # SQLAlchemy Database Object Initialization
│   ├── models.py               # Database Models (User, Role, Trek, Booking)
│   ├── resources.py            # Flask-RESTful API Resource Classes (TrekApi, BookingApi)
│   ├── routes.py               # Flask View Routes (Login, Register, Admin, Staff approvals)
│   ├── task.py                 # Celery Tasks (CSV Export, Monthly Reports, Webhooks)
│   └── utils.py                # Helper Functions (Email Sending, Role checking, etc.)
│
├── static/                     # Frontend Assets (Vue Components & Styles)
│   ├── script.js               # Vue Router Setup & Core Application Instantiation
│   └── component/
│       ├── Admin.js            # Admin Dashboard Component & Actions
│       ├── Dashboard.js        # Trekker / Guide Dashboard Component
│       ├── Login.js            # User Sign In & Session Handler
│       └── Register.js         # New Trekker & Staff Registration
```
