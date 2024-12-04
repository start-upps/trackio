# Trackio - Habit Tracking Application

A modern, full-stack habit tracking application built with Next.js 14, featuring a calendar-style interface for tracking daily habits with real-time updates and user authentication.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Component Architecture](#component-architecture)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features
- **Calendar View**
  - Weekly habit tracking interface
  - Visual representation of habit completion
  - Today-only habit marking
  - Week navigation
  - Color-coded habit status

### Habit Management
- Create new habits with customizable:
  - Names and descriptions
  - Colors
  - Icons
- Edit existing habits
- Delete habits
- Archive/restore habits

### User Features
- Secure authentication
- Personal habit tracking
- Progress visualization
- Real-time updates

### Technical Features
- Optimistic updates for better UX
- Server-side rendering
- API rate limiting
- Error handling
- Form validation
- Responsive design
- Dark mode by default

## Tech Stack

### Frontend
- **Next.js 14**: React framework
- **React**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **date-fns**: Date manipulation
- **Framer Motion**: Animations

### Backend
- **Next.js API Routes**: Server endpoints
- **Prisma**: ORM
- **PostgreSQL**: Database
- **JWT**: Authentication
- **bcrypt**: Password hashing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static typing
- **Prisma Studio**: Database management

## Project Structure

```
.
├── README.md
├── next-env.d.ts                 # Next.js TypeScript declarations
├── next.config.mjs               # Next.js configuration
├── package.json                  # Project dependencies
├── postcss.config.mjs           # PostCSS configuration
├── prisma/                      # Database configuration
│   ├── migrations/              # Database migrations
│   │   ├── 20241128123955_your_migration_name
│   │   ├── 20241130212958_add_cascading_deletes
│   │   ├── 20241202030404_add_soft_delete
│   │   └── migration_lock.toml
│   └── schema.prisma           # Prisma schema
├── public/                     # Static files
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── actions.ts        # Server actions
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   └── habits/      # Habit CRUD endpoints
│   │   ├── auth/            # Auth pages
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── CalendarHabitView.tsx   # Main calendar view
│   │   ├── ClientPage.tsx          # Client-side wrapper
│   │   ├── DeleteHabitDialog.tsx   # Delete confirmation
│   │   ├── EditHabitDialog.tsx     # Habit editing
│   │   ├── HabitCard.tsx          # Individual habit display
│   │   ├── HabitCharts.tsx        # Analytics charts
│   │   ├── HabitGridView.tsx      # Grid layout view
│   │   ├── HabitList.tsx          # Habit list view
│   │   ├── HabitRow.tsx           # List item view
│   │   ├── HabitStats.tsx         # Statistics display
│   │   ├── NewHabitButton.tsx     # Create habit button
│   │   ├── NewHabitForm.tsx       # Create habit form
│   │   ├── SignOutButton.tsx      # Logout button
│   │   ├── auth/                  # Auth components
│   │   ├── providers/             # Context providers
│   │   └── ui/                    # Shared UI components
│   ├── lib/                      # Utility functions
│   │   ├── actions.ts            # Server actions
│   │   ├── auth.ts              # Auth utilities
│   │   ├── db.ts               # Database client
│   │   ├── stats.ts           # Statistics calculations
│   │   └── utils.ts          # Helper functions
│   ├── middleware.ts        # Auth middleware
│   └── types/              # TypeScript types
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## Environment Setup

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=

# Authentication Configuration
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

## Getting Started

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/trackio.git
cd trackio
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Database**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Run Development Server**
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

`POST /api/auth/signup`
```typescript
// Request
{
  email: string;
  password: string;
}
// Response
{
  user: { id: string; email: string; }
}
```

`POST /api/auth/login`
```typescript
// Request
{
  email: string;
  password: string;
}
// Response
{
  user: { id: string; email: string; }
}
```

### Habit Endpoints

`POST /api/habits`
```typescript
// Request
{
  name: string;
  description: string;
  color: string;
  icon: string;
}
```

`PATCH /api/habits/[id]`
```typescript
// Request
{
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}
```

`POST /api/habits/[id]/entries`
```typescript
// Request
{
  date: string; // ISO date string
}
```

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  habits    Habit[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Habit {
  id          String       @id @default(cuid())
  name        String
  description String
  color       String
  icon        String
  isDeleted   Boolean      @default(false)
  deletedAt   DateTime?
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  entries     HabitEntry[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model HabitEntry {
  id        String   @id @default(cuid())
  date      DateTime
  completed Boolean
  habitId   String
  habit     Habit    @relation(fields: [habitId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([habitId, date])
}
```

## Authentication Flow

1. **Registration**
   - Password hashing with bcrypt
   - Unique email validation
   - User record creation

2. **Login**
   - Password verification
   - JWT token generation
   - HTTP-only cookie setting

3. **Authorization**
   - JWT verification middleware
   - Protected route handling
   - Token refresh logic

## Development Guide

### Code Style
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Testing
```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Run migrations
npx prisma migrate dev
```

## Deployment

1. **Database Setup**
   - Set up PostgreSQL database
   - Run migrations
   - Configure connection URL

2. **Environment Configuration**
   - Set production environment variables
   - Configure domain settings
   - Set up SSL certificates

3. **Build and Deploy**
```bash
# Build application
npm run build

# Start production server
npm start
```

## Security Considerations

1. **Authentication**
   - HTTP-only cookies
   - JWT token encryption
   - Password hashing
   - CSRF protection

2. **Database**
   - Prepared statements
   - Input validation
   - SSL connections
   - User data isolation

3. **API Security**
   - Rate limiting
   - Input sanitization
   - Error handling
   - CORS configuration

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request