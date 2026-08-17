# Task Manager

A simple Vanilla JavaScript task manager with local task storage in the browser.

## Features

- Add tasks with a title, description, and deadline.
- Mark tasks as completed.
- Edit tasks in a modal window.
- Delete a single task or clear the whole list.
- Filter tasks by all, active, or completed.
- View task statistics: total, active, and completed.
- Save tasks and the selected filter in `localStorage`.
- Show toast messages for main actions.

## Technologies

- HTML
- SCSS
- CSS
- Vanilla JavaScript
- `localStorage`

## Project Structure

```text
.
├── index.html
├── app.js
├── styles.scss
└── styles.css
```

`styles.scss` is the main stylesheet source file.

`styles.css` is the compiled CSS file linked in `index.html`.

`simple-task-manager/` contains a simplified learning version of the project.

## How to Run

Open `index.html` in your browser.

The project does not require a server or dependency installation.

## Working With SCSS

After editing `styles.scss`, compile it to CSS:

```bash
sass styles.scss styles.css --no-source-map
```

## What I Practiced

- Working with the DOM.
- Handling form, button, and checkbox events.
- Using a task array as the main source of data.
- Rendering HTML with JavaScript.
- Saving data in `localStorage`.
- Filtering with `filter`.
- Finding tasks with `find`.
- Safely inserting user text with `escapeHtml`.
- Splitting styles into SCSS source and compiled CSS.
