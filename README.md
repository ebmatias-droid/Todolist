# To-Do List

A lightweight task manager built with vanilla JavaScript, Vite, and Supabase.

## Features

- Create tasks
- Mark tasks as completed
- Filter all, active, and completed tasks
- Remove individual tasks
- Clear completed tasks
- Store tasks in a Supabase database

## Requirements

- Node.js
- A Supabase project with a `todos` table configured for the application

## Setup

Install dependencies:

```sh
npm install
```

Create a `.env` file in the project root and configure the Supabase project URL and anonymous key using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, as read by `src/main.js`.

Start the development server:

```sh
npm run dev
```

Create a production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Database

The client expects a `todos` table with task text, completion state, and creation timestamp fields. Configure appropriate Supabase Row Level Security policies before deploying; never expose a service-role key in client-side environment variables.

## License

This repository is marked as proprietary. See [LICENSE](LICENSE) for the applicable terms.
