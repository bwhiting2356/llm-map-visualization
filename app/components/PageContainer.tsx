import { useRouter } from 'next/navigation';
import { UserButton, SignedIn } from '@clerk/nextjs';

export const PageContainer = ({
    children,
    title,
}: {
    children: React.ReactNode;
    title: string;
}) => {
    const router = useRouter();
    return (
        <div className=" lg:px-8 xl:px-24 px-4 py-16 mx-auto">
            <div className="flex mb-8 justify-between items-center">
                <div className="flex gap-4 items-center">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <button
                        className="bg-gray-800 text-white px-4 py-2 rounded-md"
                        onClick={() => {
                            router.push('/map');
                        }}
                    >
                        Create map
                    </button>
                </div>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
            {children}
        </div>
    );
};
