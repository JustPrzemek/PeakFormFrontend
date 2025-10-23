// ProfilePageSkeleton.jsx

export default function ProfilePageSkeleton() {
    return (
        <div className="bg-backgoudBlack min-h-screen">
            {/* Zwiększamy do max-w-6xl */}
            <div className="container pt-8 max-w-6xl animate-pulse">
                {/* Dodajemy nowy layout flex */}
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* 1. SKELETON LEWEJ KOLUMNY (Zakładki) */}
                    <div className="w-full md:w-1/4 order-2 md:order-1">
                        <div className="bg-surfaceDarkGray rounded-2xl p-4 flex flex-col gap-2">
                            <div className="h-12 w-full bg-borderGrayHover/30 rounded-lg"></div>
                            <div className="h-12 w-full bg-borderGrayHover/30 rounded-lg"></div>
                            <div className="h-12 w-full bg-borderGrayHover/30 rounded-lg"></div>
                        </div>
                    </div>

                    {/* 2. SKELETON PRAWEJ KOLUMNY (Header + Posty) */}
                    <div className="w-full md:w-3/4 order-1 md:order-2">
                        {/* Skeleton Nagłówka (dodajemy mb-10) */}
                        <div className="bg-surfaceDarkGray rounded-2xl p-6 flex flex-col md:flex-row gap-8 mb-10">
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

                        {/* Skeleton Siatki Postów (usuwamy mt-10 i border-t) */}
                        <div>
                            <div className="grid grid-cols-3 gap-1 md:gap-4">
                                <div className="aspect-square bg-surfaceDarkGray rounded"></div>
                                <div className="aspect-square bg-surfaceDarkGray rounded"></div>
                                <div className="aspect-square bg-surfaceDarkGray rounded"></div>
                                <div className="aspect-square bg-surfaceDarkGray rounded"></div>
                                <div className="aspect-square bg-surfaceDarkGray rounded"></div>
                                <div className="aspect-square bg-surfaceDarkGray rounded"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}