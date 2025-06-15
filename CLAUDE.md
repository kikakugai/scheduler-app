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

### Implementation Roadmap

#### Phase 1: Infrastructure

- [ ] Create and configure Firebase project
- [ ] Initialize Firestore database
- [ ] Set up environment variables (.env.local)
- [ ] Install and configure Firebase SDK
- [ ] Implement basic connection tests

#### Phase 2: Authentication

- [ ] Create Slack OAuth application
- [ ] Implement authentication flow (login/logout)
- [ ] Set up user session management
- [ ] Create authentication middleware
- [ ] Implement admin privilege checks

#### Phase 3: Data Layer

- [ ] Design Firestore collections schema
- [ ] Implement User CRUD operations
- [ ] Implement ScheduleFrame CRUD operations
- [ ] Implement Appointment CRUD operations
- [ ] Create mock data migration script

#### Phase 4: Admin Features

- [ ] Schedule frame creation and editing
- [ ] Appointment list and detail views
- [ ] Appointment cancellation and modification
- [ ] User management interface
- [ ] Bulk schedule application

#### Phase 5: User Features

- [ ] Display available time slots
- [ ] Implement booking flow
- [ ] Personal appointment list
- [ ] Appointment modification and cancellation
- [ ] Booking confirmation emails/notifications

#### Phase 6: Quality Improvements

- [ ] Implement error handling
- [ ] Strengthen form validation
- [ ] Set up testing framework
- [ ] Add loading state management
- [ ] Performance optimization

### Current Status

- ✅ **UI/UX Components**: Complete shadcn/ui component library with TailwindCSS v4
- ✅ **Routing**: Full React Router v7 file-based routing system
- ✅ **Frontend Structure**: All major components and pages created
- 🔄 **Backend Integration**: Pending Phase 1-3 implementation

### Security

- Slack OAuth authentication only
- Basic HTTPS communication
- Simple input validation

### Configuration Files

- `vite.config.ts` - Vite configuration with React Router and TailwindCSS
- `react-router.config.ts` - React Router configuration (SPA mode)
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript strict configuration with path aliases
