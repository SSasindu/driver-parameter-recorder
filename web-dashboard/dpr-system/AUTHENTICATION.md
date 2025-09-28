# Authentication System

This authentication system provides secure access control for the Driver Parameter Recorder dashboard.

## Features

- **JWT Token-based Authentication**: Secure token-based authentication with expiration
- **Server-side Token Verification**: Tokens are verified on the server for security
- **Protected Routes**: Middleware and components to protect sensitive routes
- **Automatic Token Cleanup**: Invalid or expired tokens are automatically cleared
- **Persistent Sessions**: User sessions persist across browser refreshes

## Components

### 1. **Middleware** (`middleware.ts`)
- Protects routes at the server level
- Automatically redirects unauthenticated users to login
- Verifies JWT tokens for protected routes

### 2. **Auth Utilities** (`lib/auth.ts`)
- Helper functions for authentication management
- Axios interceptors for automatic token handling
- Centralized logout and token management

### 3. **Auth Hook** (`hooks/useAuth.ts`)
- React hook for authentication state management
- Provides user data and authentication status
- Handles login/logout operations

### 4. **Protected Route Component** (`components/ProtectedRoute.tsx`)
- Wrapper component for protecting React components
- Verifies authentication before rendering content
- Shows loading state during verification

### 5. **Auth Wrapper** (`components/AuthWrapper.tsx`)
- Landing page component that checks authentication
- Redirects authenticated users to dashboard
- Shows login/signup forms for unauthenticated users

## API Endpoints

### `/api/auth/verify` (POST)
- Verifies JWT tokens
- Returns user data if token is valid
- Used for server-side authentication checks

### `/api/config/[deviceId]` (POST)
- Login endpoint
- Validates credentials and returns JWT token
- Generates token with user information

## Usage

### Protecting a Page
```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SecurePage() {
    return (
        <ProtectedRoute>
            <YourContent />
        </ProtectedRoute>
    );
}
```

### Using the Auth Hook
```tsx
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
    const { user, isLoading, isAuthenticated, logout } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <div>Please login</div>;

    return <div>Welcome, {user?.firstName}!</div>;
}
```

### Making Authenticated API Calls
```tsx
import apiClient from '@/lib/auth';

// API client automatically includes auth headers
const response = await apiClient.get('/api/dashboard');
```

## Security Features

1. **Token Expiration**: Tokens expire after 24 hours
2. **Server Validation**: All tokens are validated server-side
3. **Automatic Cleanup**: Invalid tokens are automatically removed
4. **Secure Headers**: Authorization headers are automatically added
5. **Route Protection**: Multiple layers of route protection

## Environment Variables

```env
JWT_SECRET=your-jwt-secret-key
```

## Authentication Flow

1. User enters credentials on login form
2. Credentials are sent to `/api/config/[deviceId]`
3. Server validates credentials and returns JWT token
4. Token is stored in localStorage
5. Protected routes verify token on each access
6. Invalid tokens trigger automatic logout

## Testing Authentication

1. Try accessing `/dashboard` without logging in → Should redirect to login
2. Login with valid credentials → Should redirect to dashboard
3. Clear localStorage and refresh → Should redirect to login
4. Use invalid token → Should trigger logout

This system ensures that only authenticated users can access the dashboard while providing a smooth user experience.
