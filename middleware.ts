import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { ensureUserProfile } from "./lib/ensure-profile";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
    
    // After successful authentication, ensure user profile exists in Supabase
    const { userId } = await auth();
    
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

