# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `npm run dev` - Start development server with HMR at http://localhost:5173
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking with React Router typegen

### No Testing Framework

Currently no testing framework is configured. Tests need to be set up before implementing test commands.

## Project Overview

This is a **React Router v7** scheduler application POC for appointment booking with Slack authentication. The app manages appointment scheduling with admin and user roles.

### Technology Stack

- **Frontend**: React Router v7 + TypeScript
- **Authentication**: Slack OAuth
- **Database**: Firestore
- **Deployment**: Firebase Hosting
- **Styling**: TailwindCSS v4 with shadcn/ui components
- **Build Tool**: Vite

### Project Structure

```
app/
├── components/
│   ├── admin/           # Admin dashboard components
│   ├── schedule/        # Schedule management components
│   └── ui/             # shadcn/ui reusable components
├── lib/                # Utilities and TypeScript type definitions
├── routes/             # File-based routing (React Router v7)
└── root.tsx           # App root component
```

### Routing System

File-based routing with these main routes:

- `_index` (/) - Main dashboard
- `admin._index` (/admin) - Admin dashboard
- `admin.users` (/admin/users) - User management
- `login` (/login) - Login page
- `register` (/register) - Registration page
- `schedule.$id` (/schedule/:id) - Individual schedule view

### Data Architecture

Planned data structure for Firestore:

- **User**: Slack user information, admin flag
- **ScheduleFrame**: Schedule frame templates
- **ScheduleDate**: Individual bookable time slots
- **Appointment**: Confirmed bookings

Currently uses mock data in `app/lib/types.ts` - Firestore integration pending.

### Component Architecture

- **UI Components**: shadcn/ui components with consistent styling
- **Forms**: React Hook Form with Zod validation
- **State Management**: Local React state only (no global state management)
- **Styling**: TailwindCSS with CSS variables and OKLCH color space

### Key Dependencies

- **Forms**: `react-hook-form` + `@hookform/resolvers` + `zod`
- **UI**: `@radix-ui/*` + `class-variance-authority` + `clsx`
- **Icons**: `lucide-react`
- **Dates**: `date-fns` with Japanese locale support
- **Notifications**: `sonner`

## Development Notes

### Language Support

The application includes Japanese text and is likely intended for Japanese users.

## Main Features

### Admin Functions

#### Schedule Frame Management

- Create meeting/interview time frame templates
- Set date/time, duration (30min/60min), description
- Edit/delete existing frames
- Bulk apply to multiple dates

#### Booking Management

- View all user bookings in list format
- View booking details
- Cancel/modify bookings as needed
- View booking history

### User Functions

#### Authentication & Login

- Simple login using Slack account
- Auto-retrieve user info (name, avatar)

#### Booking Functions

- Display available time slots in calendar format
- Filter by date/time period
- Select desired time slot and make booking

#### Personal Management

- Display personal booking list (upcoming/past)
- View/modify booking details
- Self-cancel bookings

### Current Implementation Status

#### ✅ Implemented
- **UI/UX Components**: Complete shadcn/ui component library with TailwindCSS v4
- **Routing**: Full React Router v7 file-based routing system
- **Admin Interface**: Dashboard with tabs for appointment management and user management
- **User Interface**: Schedule dashboard with booking flow UI
- **Responsive Design**: Mobile and desktop optimized layouts
- **Dark Mode**: Theme support with next-themes

#### 🟡 Partially Implemented  
- **Admin Functions**: UI components exist but lack backend integration
- **User Booking**: Frontend booking flow exists but no database persistence
- **Schedule Management**: Display components ready but no CRUD operations

#### ❌ Not Implemented
- **Authentication**: No Slack OAuth integration (login/register routes are placeholders)
- **Database**: Using mock data only, no Firestore integration
- **API Layer**: No data fetching or mutation logic
- **Error Handling**: No network error or validation handling
- **Testing**: No testing framework configured
- **Security**: No input validation or data protection beyond TypeScript

#### 🎯 Priority Implementation Tasks
1. Firebase/Firestore setup and integration
2. Slack OAuth authentication implementation  
3. API layer for CRUD operations
4. Error handling and validation
5. Data migration from mock to Firestore

### Security

- Slack OAuth authentication only
- Basic HTTPS communication
- Simple input validation

### Configuration Files

- `vite.config.ts` - Vite configuration with React Router and TailwindCSS
- `react-router.config.ts` - React Router configuration (SPA mode)
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript strict configuration with path aliases
