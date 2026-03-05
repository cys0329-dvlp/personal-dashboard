import { useAuth } from "@/_core/hooks/useAuth";

// This file is intentionally empty - routing is handled in App.tsx
export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return null;
}
