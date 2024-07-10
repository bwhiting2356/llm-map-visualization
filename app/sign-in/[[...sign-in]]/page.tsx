import { SignIn } from '@clerk/nextjs';

export default function Page() {
    return (
        <div className="flex h-screen items-center justify-center">
            <SignIn forceRedirectUrl="/map" signUpUrl="/sign-up" path="/sign-in" />
        </div>
    );
}
