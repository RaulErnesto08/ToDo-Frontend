# Todo App Frontend

## Overview
This is the frontend of the Todo App, built using React with Tailwind CSS for styling. The app provides a user-friendly interface for managing todos, filtering by priority and status, and viewing completion metrics.

## Technologies Used
- **React** (JavaScript)
- **Tailwind CSS** for modern styling
- **React-Select** for dropdowns
- **React-Toastify** for notifications
- **React Icons** for icons
- **Axios** for API calls

## Setup and Installation
1. **Clone the repository**:
   ```bash
   https://github.com/RaulErnesto08/ToDo-Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```

4. **Access the app**:
   The frontend will be available at `http://localhost:3000`.

## Features
- **CRUD Operations**: Create, read, update, and delete todos.
- **Filters**: Filter todos by priority and status.
- **Metrics Dashboard**: View average completion times for all tasks and by priority.
- **Notifications**: Instant feedback using `react-toastify`.
- **Responsive Design**: Tailwind CSS ensures the app is mobile-friendly.

## Project Structure
```
frontend/
├── public
│   ├── index.html
│   └── manifest.json
├── src
│   ├── components
│   │   ├── common
│   │   │   ├── InputField.js
│   │   │   └── MetricCard.js
│   │   ├── TodoForm.js
│   │   └── TodoList.js
│   ├── services
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── tailwind.config.js
```

## Styling
- **Tailwind CSS** is used for consistent, responsive design.
- **React-Select** is customized for dropdown menus.
- **React Icons** adds icons for better visual feedback.

## Key Components
- **TodoForm.js**: Modal form for adding or editing todos.
- **TodoList.js**: Main component displaying and managing todos.
- **MetricCard.js**: Reusable card component for displaying metrics.

## Notifications
- Integrated with `react-toastify` for showing success and error messages.
- Notifications provide instant user feedback for actions.

## API Integration
- **Axios** is used for handling HTTP requests to the backend.
- Endpoints are defined in `src/services/api.js`.

## Accessibility
- `aria-*` attributes are used for better screen reader support.
