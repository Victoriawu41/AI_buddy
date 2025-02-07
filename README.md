# AI Buddy

## Setup Guide

### Backend

1. Navigate to the Backend directory:

   ```sh
   cd Backend
   ```

2. Install the required dependencies:

   ```sh
   pip install -r requirements.txt
   ```

3. Run the backend server:
   ```sh
   python ./Services/AI/gateway.py
   python ./Services/AI/ai_server.py
   python login_app.py
   ```

### Frontend

1. Navigate to the Frontend directory:

   ```sh
   cd Frontend
   ```

2. Install the required dependencies:

   ```sh
   npm install
   ```

3. Run the frontend server:
   ```sh
   npm run dev
   ```

### Database Setup

Before running the backend, ensure the PostgreSQL database is set up. Follow these steps:

1. **Open a terminal** and switch to the `postgres` user:
   ```
   sudo -i -u postgres
   ```

2. Open the PostgreSQL shell:
   ```
   psql
   ```

3. Create the database:
   ```sql
   CREATE DATABASE account_db;
   ```

4. Create the user for Flask and set a password:
   ```sql
   CREATE USER flask_user WITH PASSWORD 'password';
   ```

5. Grant privileges to the user on the database:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE account_db TO flask_user;
   ```

6. Exit the PostgreSQL shell:
   ``` sql
   \q
   ```

---

Now, the database `account_db` and user `flask_user` are ready to be used with the Flask backend
