export default function ProfilePageSkeleton() {
    return (
        <div className="bg-backgoudBlack min-h-screen">
            <div className="container pt-8 max-w-5xl animate-pulse">
                {/* Skeleton Nagłówka */}
                <div className="bg-surfaceDarkGray rounded-2xl p-6 flex flex-col md:flex-row gap-8">
                    <div className="mx-auto md:mx-0 h-36 w-36 bg-borderGrayHover/30 rounded-full flex-shrink-0"></div>
                    <div className="w-full">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-48 bg-borderGrayHover/30 rounded"></div>
                            <div className="h-9 w-24 bg-borderGrayHover/30 rounded-lg"></div>
                        </div>
                        <div className="flex gap-8 my-4">
                            <div className="h-6 w-20 bg-borderGrayHover/30 rounded"></div>
                            <div className="h-6 w-20 bg-borderGrayHover/30 rounded"></div>
                            <div className="h-6 w-20 bg-borderGrayHover/30 rounded"></div>
                        </div>
                        <div className="h-5 w-32 bg-borderGrayHover/30 rounded mb-2"></div>
                        <div className="h-4 w-full bg-borderGrayHover/30 rounded"></div>
                        <div className="h-4 w-3/4 bg-borderGrayHover/30 rounded mt-1.5"></div>
                    </div>
                </div>

                {/* Skeleton Siatki Postów */}
                <div className="mt-10">
                    <div className="h-px bg-borderGrayHover w-full mb-4"></div>
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        <div className="aspect-square bg-surfaceDarkGray rounded"></div>
                        <div className="aspect-square bg-surfaceDarkGray rounded"></div>
                        <div className="aspect-square bg-surfaceDarkGray rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}