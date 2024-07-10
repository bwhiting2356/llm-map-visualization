import { SignUp } from '@clerk/nextjs';

export default function Page() {
    return (
        <div className="flex h-screen items-center justify-center">
            <SignUp forceRedirectUrl="/map" signInUrl="/sign-in" path="/sign-up" />
        </div>
    );
}
