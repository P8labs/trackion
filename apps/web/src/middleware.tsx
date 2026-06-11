import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useGlobalStore } from "./store";
import { Loader } from "@mantine/core";

const VERIFY_EMAIL_PATH = "/auth/email/verify";
const SUBSCRIPTION_PATH = "/subscriptions";
const DASHBOARD_PATH = "/projects";

const protectedRoutePrefixes = [
  "/projects",
  "/settings",
  "/usage",
  "/subscriptions",
];
const publicOnlyRoutePrefixes = ["/auth"];

export function RouteMiddleware({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // 1. Add a loading state to block rendering while checking auth
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 2. Extract necessary state and actions individually to prevent infinite re-renders
  const user = useGlobalStore((state) => state.user);
  const authToken = useGlobalStore((state) => state.authToken);
  const fetchCurrentUser = useGlobalStore(
    (state) => state.actions.fetchCurrentUser,
  );

  // 3. Run the auth check on mount or when the token changes
  useEffect(() => {
    const initAuth = async () => {
      // Only attempt to fetch if we have an authentication token
      if (authToken) {
        // Your store handles the caching/staling logic automatically
        // If the user is fresh, this returns immediately. If stale, it fetches.
        await fetchCurrentUser();
      }
      // Release the UI block once the check is done
      setIsCheckingAuth(false);
    };

    initAuth();
  }, [authToken, fetchCurrentUser]);

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader type="bars" size="lg" />
      </div>
    );
  }

  const isLoggedIn = !!user;

  const isProtectedRoute = protectedRoutePrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  const isAuthRoute = publicOnlyRoutePrefixes.some((prefix) =>
    location.pathname.startsWith(prefix),
  );

  const isVerifyEmailRoute = location.pathname.startsWith(VERIFY_EMAIL_PATH);
  const isSubscriptionRoute = location.pathname.startsWith(SUBSCRIPTION_PATH);

  // --------------------------------------------------------
  // Unauthenticated Flow
  // --------------------------------------------------------
  if (!isLoggedIn) {
    if (isProtectedRoute) {
      return <Navigate to="/auth" replace state={{ from: location }} />;
    }
    // Allow access to public/auth routes for guests
    return <>{children}</>;
  }

  // --------------------------------------------------------
  // Authenticated Priority Flow
  // --------------------------------------------------------

  // if subscribed but trying to access subscription page, redirect to dashboard
  if (user.is_active_subscription && isSubscriptionRoute) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

  // Priority 1: Email Verification
  if (!user.is_email_verified) {
    if (!isVerifyEmailRoute) {
      return <Navigate to={VERIFY_EMAIL_PATH} replace />;
    }
    return <>{children}</>;
  }

  // Priority 2: Active Subscription
  if (!user.is_active_subscription) {
    if (!isSubscriptionRoute) {
      return <Navigate to={SUBSCRIPTION_PATH} replace />;
    }
    return <>{children}</>;
  }

  // Priority 3: Authenticated user trying to visit Auth pages (Login/Register)
  if (isAuthRoute && !isVerifyEmailRoute) {
    return <Navigate to={DASHBOARD_PATH} replace />;
  }

  // --------------------------------------------------------
  // Fully Authenticated, Verified, and Subscribed User
  // --------------------------------------------------------
  return <>{children}</>;
}
