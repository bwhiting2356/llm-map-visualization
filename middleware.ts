import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

export default clerkMiddleware(
    (auth, req) => {
        if (isProtectedRoute(req)) auth().protect();
    },
    {
        signInUrl: '/sign-in',
        signUpUrl: '/sign-up',
    },
);

const isProtectedRoute = createRouteMatcher(['/saved-maps']);

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
