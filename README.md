# TravelBuddy

TravelBuddy is a multipurpose travel assistant for discovering places, planning trips, sharing expenses, and coordinating the pieces of a real trip in one place.

## At a Glance

- **Frontend:** React + Vite for the UI, planner, social, and profile experiences
- **Backend:** Node/Express for APIs, auth, background jobs, and database access
- **Data:** SQL schema and seed scripts live in `server/sql` and `server/seed.js`

## Quick Start

Install dependencies in the root project and the backend server:

```bash
npm install
cd server
npm install
cd ..
```

Start the frontend dev server:

```bash
npm run dev
```

Start the backend server from `server/`:

```bash
node app.js
```

## Environment

- Do not commit secrets. Use `server/.env.example` and `.env.example` as templates.
- Keep `.env` and `server/.env` ignored by git. That is already covered in `.gitignore`.

## Repository Notes

- This fork contains a single consolidated commit titled `Final project`.
- `.gitignore` excludes local artifacts such as `server/scratch/`, `server/node_modules/`, `.vscode/`, timestamp files, and logs.


## Contributors

- Primary committer: `aliamirchoudhary`
- Co-authors included in the consolidated commit: `HassanNawaz14`, `zohaib-mzg`, `Aayanahmad06`

## Next Steps

- Review `server/.env.example` and populate secrets in your local `server/.env` without committing them.
- Open a PR from your fork, `aliamirchoudhary/TravelBuddy:main`, to the upstream repo when ready.
- If you want a PR draft, send me the upstream target and the title/description you want.



