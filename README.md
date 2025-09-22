Upaay Assessment – Task Dashboard
📌 Project Overview

This is a Task Dashboard (Kanban-style) built with React.js and Tailwind CSS, designed to help users manage tasks efficiently. The dashboard allows users to:

Add, move, and delete tasks

Categorize tasks into To Do, In Progress, and Done

Filter tasks by title or description

Persist tasks using Local Storage for state retention

🛠 Technology Stack

Frontend: React.js (Functional Components, Hooks, Context API, useReducer)

Styling: Tailwind CSS

State Management: Redux-like pattern using React Context and useReducer

Persistence: Local Storage

Build Tool: Vite

⚡ Features

Add Tasks – Add new tasks with title, description, category, and priority.

Move Tasks – Move tasks between columns dynamically.

Delete Tasks – Delete any task with a single click.

Search/Filter Tasks – Search tasks by title or description using a live filter.

State Persistence – All tasks persist even after page refresh via Local Storage.

Responsive Design – Fully responsive Kanban layout for desktop and mobile.

📂 Folder Structure
task-dashboard/
│── package.json
│── vite.config.js
│── tailwind.config.js
│── postcss.config.js
│── index.html
└── src/
    │── main.jsx
    │── App.jsx          <-- Dashboard code
    │── index.css

🚀 Installation & Setup

Clone the repository:

git clone <your-repo-url>
cd task-dashboard


Install dependencies:

npm install


Run the development server:

npm run dev


Open the app at http://localhost:5173 (or the port Vite provides).

🎯 Usage

Use the Add a Task button to create new tasks.

Move tasks between columns using the dropdown inside each task card.

Delete tasks with the delete (×) button.

Filter tasks using the search bar at the top.
