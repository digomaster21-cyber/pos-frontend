# Business Dashboard PWA

A modern, production-ready Progressive Web App for business management with React, TypeScript, and PWA capabilities.

## Features

- ✅ **PWA Support** - Installable, offline-first, service worker caching
- ✅ **Authentication** - JWT-based auth with secure token storage
- ✅ **Dashboard** - Real-time KPIs, charts, and metrics
- ✅ **Sales Management** - Create and view sales with filtering
- ✅ **Inventory Management** - Searchable, paginated product list
- ✅ **Expense Tracking** - Categorize and track expenses
- ✅ **Reports** - Sales and profit-loss reports with CSV export
- ✅ **Sync Status** - View and trigger data synchronization
- ✅ **Responsive Design** - Mobile-first, touch-friendly UI
- ✅ **Offline Support** - Cached data, queued actions, offline indicator

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React Icons
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router 6
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library + Playwright (e2e)
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running (FastAPI)

## Quick Start

1. **Clone and install:**
```bash
git clone <repository>
cd business-dashboard-pwa
npm install