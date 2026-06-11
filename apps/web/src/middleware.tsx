import { useLocation, Navigate } from "react-router-dom";
import { useGlobalStore } from "./store";

// Define these paths to match your actual application setup
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
  const user = useGlobalStore((state) => state.user);

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
  // to match the exact property names in your User type.
  // --------------------------------------------------------

  // Priority 1: Email Verification
  if (!user.is_email_verified) {
    if (!isVerifyEmailRoute) {
      return <Navigate to={VERIFY_EMAIL_PATH} replace />;
    }
    // Allow them to render the verification page
    return <>{children}</>;
  }

  // Priority 2: Active Subscription
  if (!user.has_active_subscription) {
    if (!isSubscriptionRoute) {
      return <Navigate to={SUBSCRIPTION_PATH} replace />;
    }
    // Allow them to render the subscription page
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
