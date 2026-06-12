# Trackion Dashboard

A minimalistic analytics dashboard inspired by Pi-hole, built with React (Vite), TailwindCSS, and Zustand.

## Features

- 🔐 **Authentication**: GitHub OAuth and Admin Token login
- 📊 **Dashboard**: Real-time analytics with charts and stats
- 🎯 **Projects**: Create and manage multiple analytics projects
- ⚙️ **Settings**: Customize tracking features per project
- 🌑 **Dark Theme**: Clean, minimal Pi-hole inspired design
- 📱 **Responsive**: Desktop-first, mobile-friendly

## Tech Stack

- **React 19** with TypeScript
- **Vite** for blazing fast development
- **TailwindCSS 4** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Recharts** for data visualization
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:

```bash
npm install react-router-dom zustand recharts lucide-react --legacy-peer-deps
```

2. Create a `.env` file (optional):

```bash
cp .env.example .env
```

Edit `.env` to enable GitHub login:

```env
VITE_ENABLE_GITHUB_LOGIN=true
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── StatCard.tsx
│   └── Layout.tsx
├── pages/           # Page components
│   ├── AuthPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ProjectDetailPage.tsx
│   └── SettingsPage.tsx
├── lib/            # API layer and utilities
│   └── api.ts
├── store/          # Zustand store
│   └── index.ts
├── types/          # TypeScript types
│   └── index.ts
├── App.tsx         # Main app component with routing
└── main.tsx        # Entry point
```

## Authentication

### Admin Token Login

1. Enter your server URL (default: `http://localhost:8080`)
2. Enter your admin token
3. Click "Login with Token"

### GitHub OAuth (Optional)

1. Set `VITE_ENABLE_GITHUB_LOGIN=true` in `.env`
2. Click "Login with GitHub"
3. Redirects to `${serverUrl}/auth/github/login?client=web`

## Mock Data

The app currently uses mock data for all API calls. This allows you to:

- Explore the full UI without a backend
- Test all features and interactions
- Understand the expected API structure

To switch to real API calls:

1. Update `USE_MOCK = false` in `src/lib/api.ts`
2. Ensure your backend is running and accessible

## API Structure

All API calls are centralized in `src/lib/api.ts`. The following endpoints are expected:

### Authentication

- `POST /api/auth/verify` - Verify admin token
- `GET /auth/github/login?client=web` - GitHub OAuth redirect

### Projects

- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Dashboard

- `GET /api/projects/:id/dashboard` - Get dashboard data
- `GET /api/projects/:id/events` - Get recent events

## Color Palette

The design uses a Pi-hole inspired color scheme:

- **Background**: Slate 900 (`#0f172a`)
- **Cards**: Slate 800 (`#1e293b`)
- **Primary**: Teal 600 (`#14b8a6`)
- **Amber**: Amber 400 (`#fbbf24`)
- **Red**: Red 600 (`#dc2626`)
- **Green**: Green 600 (`#16a34a`)

## Features per Page

### 1. Auth Page

- Server URL input
- GitHub OAuth button (toggleable)
- Admin token input
- Token-based login

### 2. Dashboard

- 4 stat cards (Total Events, Page Views, Avg Time, Custom Events)
- Line chart for events over time
- Pie chart for event breakdown
- Recent events table

### 3. Projects

- Project list with cards
- Create new project modal
- Delete projects
- View project details

### 4. Project Details

- Project information
- API key with copy button
- Feature toggles (page.view, time spent, campaign, clicks)
- Danger zone with delete

### 5. Settings

- Theme toggle (light/dark)
- Resources section
- Legal links
- App version

## State Management

Global state (Zustand) includes:

- `authToken` - Authentication token
- `serverUrl` - API base URL
- `currentProject` - Currently selected project
- `user` - User information
- `isAuthenticated` - Auth status
- `theme` - UI theme

All state is persisted to localStorage.

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Environment Variables

- `VITE_ENABLE_GITHUB_LOGIN` - Enable GitHub OAuth (default: false)

## Contributing

This is part of the Trackion analytics platform. Contributions are welcome!

## License

MIT License - see the LICENSE file for details

---

**Trackion v1.0** - Open Source Analytics Platform
