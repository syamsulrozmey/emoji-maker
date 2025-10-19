import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureUserProfile } from "./lib/ensure-profile";

const isPublicRoute = createRouteMatcher([
  '/',  // Landing page is public
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/stripe/webhook'  // Stripe webhooks don't have user auth - secured via signature verification
]);

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const url = request.nextUrl;

  // Redirect authenticated users from landing page to dashboard
  if (userId && url.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard routes
  if (isProtectedRoute(request)) {
    await auth.protect();
    
    // After successful authentication, ensure user profile exists in Supabase
    if (userId) {
      try {
        await ensureUserProfile(userId);
      } catch (error) {
        console.error('Failed to ensure user profile:', error);
        // Continue processing - don't block the request
        // The profile sync endpoint can be used as a fallback
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

