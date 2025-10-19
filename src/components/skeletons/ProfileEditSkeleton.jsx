export default function ProfileEditSkeleton() {
    return (
        <div className="bg-backgoudBlack min-h-screen text-whitePrimary animate-pulse">
            <div className="container max-w-3xl mx-auto py-12 px-4">
                <div className="h-9 w-48 bg-surfaceDarkGray rounded-lg mb-10"></div>
                
                {/* Avatar Section */}
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-full bg-surfaceDarkGray"></div>
                    <div className="flex-grow">
                        <div className="h-5 w-32 bg-surfaceDarkGray rounded"></div>
                        <div className="h-8 w-48 bg-surfaceDarkGray rounded-lg mt-2"></div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                    <div className="h-5 w-40 bg-surfaceDarkGray rounded mb-4"></div>
                    <div className="space-y-4">
                        <div className="h-14 w-full bg-surfaceDarkGray rounded-lg"></div>
                        <div className="h-24 w-full bg-surfaceDarkGray rounded-lg"></div>
                    </div>
                    <div className="h-5 w-40 bg-surfaceDarkGray rounded mt-8 mb-4"></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-14 w-full bg-surfaceDarkGray rounded-lg"></div>
                        <div className="h-14 w-full bg-surfaceDarkGray rounded-lg"></div>
                        <div className="h-14 w-full bg-surfaceDarkGray rounded-lg"></div>
                        <div className="h-14 w-full bg-surfaceDarkGray rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}