# Contacts Address Book

A full-stack contacts CRUD application built with vanilla JavaScript, FastAPI, SQLAlchemy, and SQLite.

## Features

- View all contacts
- Create new contacts
- Edit existing contacts
- Delete contacts
- Add multiple email addresses per contact
- Remove email addresses
- Search contacts by name
- Alphabetical contact sorting
- Client-side validation
- Server-side validation
- Duplicate email detection
- Delete confirmation
- Responsive layout
- Persistent data storage with SQLite

## Tech Stack

### Frontend

- HTML
- CSS
- Vanilla JavaScript

### Backend

- Python
- FastAPI
- SQLAlchemy

### Database

- SQLite

## Project Structure

```text
contacts-address-book/
│
├── backend/
│   ├── __init__.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── .gitignore
├── query_db.py
├── requirements.txt
└── README.md