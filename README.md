# Task Manager

Simple task manager built with Vanilla JavaScript. Tasks are stored locally in the browser, so the app works without a server or third-party dependencies.

## Features

- Add tasks with a title, description, and deadline.
- Edit tasks in a modal window.
- Mark tasks as completed or delete individual tasks.
- Clear the complete list with confirmation.
- Filter tasks by all, active, or completed.
- View total, active, and completed task statistics.
- Save tasks and the selected filter in `localStorage`.
- Receive toast feedback and contextual empty states.
- Use the app with a keyboard: visible focus, Escape to close the editor, and focus trapping in the modal.

## Technologies

- HTML5
- SCSS and CSS
- Vanilla JavaScript
- `localStorage`

## Project Structure

```text
.
├── index.html      # application markup
├── app.js          # task and localStorage logic
├── styles.scss     # source styles
├── styles.css      # stylesheet used by the app
├── favicon.svg     # checklist-style favicon
└── README.md
```

## How to Run

Open [index.html](index.html) in a browser. No server or dependency installation is required.

## Working With Styles

After updating `styles.scss`, regenerate the CSS file:

```bash
sass styles.scss styles.css --no-source-map
```

## What This Project Demonstrates

- DOM manipulation, forms, events, and event delegation.
- Safe rendering of user-supplied text with `escapeHtml`.
- CRUD operations on a task array.
- Filtering and statistics calculations.
- `localStorage` persistence with read and write error handling.
- Responsive styling and baseline accessibility for keyboard and screen-reader users.
