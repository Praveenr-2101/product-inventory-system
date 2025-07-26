Product Inventory System with Stock Management

This is a full-stack inventory management system built using:

- Backend: Django + Django REST Framework (managed with Poetry)
- Frontend: React.js + Tailwind CSS

---

Project Structure

Product_Inventory/
├── Frontend/ # React frontend
└── Server/ # Django backend (Poetry managed)

---

Backend Setup (Django with Poetry)

Prerequisites:

- Python 3.10+
- Poetry installed: https://python-poetry.org/docs/#installation

Steps:

1. Navigate to the backend folder:

   cd Server

2. Install dependencies:

   poetry install

3. Create a `.env` file inside the `Server` folder with the following content:

   SECRET_KEY=your-secret-key
   DEBUG=True

4. Run migrations:

   poetry run python manage.py migrate

5. Create superuser:

   poetry run python manage.py createsuperuser

6. Run the backend server:

   poetry run python manage.py runserver

   Server runs at: http://localhost:8000

---

Frontend Setup (React + Vite + Tailwind CSS)

Prerequisites:

- Node.js 16+
- npm

Steps:

1. Navigate to the frontend folder:

   cd Frontend

2. Install dependencies:

   npm install

3. Create a `.env` file in the `Frontend` folder:

   VITE_API_BASE_URL=http://localhost:8000/api

4. Start the frontend development server:

   npm run dev

   Frontend runs at: http://localhost:5173

---

Features

- Product creation with multiple variants
- Add or remove stock by product variant
- Stock transaction report with date filters
- Paginated, filterable list view
- Clean UI built with Tailwind CSS
- RESTful API with proper validations
- Secure and optimized backend architecture

---

API Endpoints Overview

| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| POST   | /api/products/register/  | Create a new product    |
| GET    | /api/products/list/      | List all products       |
| POST   | /api/stock/add-stock/    | Add stock               |
| POST   | /api/stock/remove-stock/ | Remove stock            |
| GET    | /api/stock/stock-report/ | View stock transactions |

---

Production Build

To create a frontend production build:

npm run build

---

.env. - Frontend

VITE_API_BASE_URL=http://localhost:8000/api
