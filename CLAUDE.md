# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm start                 # Dev server with .env.development
npm run build            # Production build
npm run build:demo       # Demo environment build
npm run build:test       # Test environment build
npm test                 # Run tests in watch mode
```

## Architecture Overview

This is a React 20 + Redux investment platform frontend with TypeScript support. It uses Firebase for authentication/realtime database and communicates with a backend API.

### Key Directories

- `src/api/` - Axios-based HTTP client with repository pattern (`Api.tsx` is the core client)
- `src/firebase/` - Firebase config, database constants, and realtime utilities
- `src/models/` - TypeScript interfaces for User, Project, Group, Pledge, etc.
- `src/pages/` - Page components organized by feature (admin, dashboard-issuer, dashboard-investor, signin, signup, etc.)
- `src/redux-store/actions/` and `src/redux-store/reducers/` - Redux state management
- `src/router/` - React Router v5 configuration with route guards
- `src/shared-components/` - Reusable components (header, footer, tables, dialogs, forms)
- `src/values/` - Constants including Material-UI themes

### Routing Pattern

Routes follow group-scoped pattern: `/groups/:groupUserName/...`

Key route types:
- Super admin: `/admin`, `/signin/super-admin`
- Group admin: `/groups/:groupUserName/admin`
- Issuer dashboard: `/groups/:groupUserName/dashboard/issuer`
- Investor dashboard: `/groups/:groupUserName/dashboard/investor`

`GroupRoute.tsx` is the HOC that handles group URL validation, authentication, and role-based redirects.

### State Management

Redux with redux-thunk. The codebase has both:
- **New TypeScript reducers**: `AuthenticationState`, `ManageGroupUrlState`, `ExploreOffersLocalState`, etc.
- **Legacy JavaScript reducers**: `auth`, `manageClubAttributes`, `createProjectReducer`, etc.

Key authentication flow in `authenticationActions.tsx`:
1. Firebase auth state change triggers `signIn()`
2. User profile fetched from backend API
3. Groups of membership loaded
4. For investors: self-certification status loaded

### API Layer

`src/api/Api.tsx` - Axios client that auto-injects Firebase auth tokens. Repository classes in `src/api/repositories/` encapsulate domain-specific API calls.

Backend base URL from `REACT_APP_BACK_END_BASE_URL` environment variable.

### Firebase Integration

Uses Firebase v8 for:
- Authentication (email/password)
- Realtime Database (user profiles, groups, projects, pledges, forums, activity logs)
- Storage (logos, profile pictures, videos, legal documents)

Database node constants defined in `src/firebase/databaseConsts.jsx`.

### User Types

User `type` field values:
- 1 = Investor
- 2 = Issuer
- 3 = Admin

### Project/Offer Status Values

Project `status` field controls workflow stage (draft, being checked, pitch phase, offer phase, etc.).

Project `visibility` field:
- 1 = Private
- 2 = Restricted
- 3 = Public

### UI Framework

Material-UI v4 with group-specific theming. Each group can have custom primary/secondary colors loaded from group properties.
