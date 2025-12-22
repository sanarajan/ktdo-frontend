# Driver Membership App - Frontend

Independent frontend application for the Driver Membership Application.

## Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

For production, update to your deployed backend URL:
```env
VITE_API_URL=https://your-backend-url.com/api
```

## Development

```bash
npm run dev
```

Application will start on `http://localhost:5173`

## Build

```bash
npm run build
```

Output will be in the `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- React PDF Renderer

## Features

- User Authentication (Login/Register)
- Role-based Access Control (Main Admin, District Admin, Member)
- Member Management
- District Admin Management
- ID Card Generation (PDF)
- State and District Selection
- Responsive Design

## Default Admin Credentials

- Email: `admin@gmail.com`
- Password: `123456`
