// src/components/skeletons/SessionDetailPageSkeleton.jsx

// Skeleton dla pojedynczego bloku ćwiczeń
const ExerciseLogGroupSkeleton = () => (
    <div className="bg-surfaceDarkGray rounded-2xl p-5">
        {/* Tytuł ćwiczenia */}
        <div className="h-6 w-3/4 bg-borderGrayHover/30 rounded mb-4"></div>
        {/* Fałszywe wiersze logów */}
        <div className="space-y-3">
            <div className="h-8 w-full bg-backgoudBlack rounded-lg"></div>
            <div className="h-8 w-full bg-backgoudBlack rounded-lg"></div>
            <div className="h-8 w-full bg-backgoudBlack rounded-lg"></div>
        </div>
    </div>
);


export default function SessionDetailPageSkeleton() {
    return (
        <div className="min-h-screen bg-backgoudBlack text-whitePrimary p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto">
                
                {/* 1. Przycisk Wstecz */}
                <div className="h-10 w-10 bg-borderGrayHover/30 rounded-lg mb-8  animate-pulse"></div>

                {/* 2. Skeleton Nagłówka (SessionDetailHeader) */}
                <div className="mb-8 p-6 bg-surfaceDarkGray rounded-2xl  animate-pulse">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div className="h-8 w-1/2 bg-borderGrayHover/30 rounded"></div>
                        <div className="h-5 w-1/4 bg-borderGrayHover/30 rounded mt-1 md:mt-0"></div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-7 w-16 bg-borderGrayHover/30 rounded-full"></div>
                        <div className="h-6 w-24 bg-borderGrayHover/30 rounded"></div>
                    </div>
                </div>

                {/* 3. Skeleton Notatek (SessionNotesEditor) */}
                <div className="mb-8  animate-pulse">
                    <div className="h-6 w-1/3 bg-borderGrayHover/30 rounded mb-3"></div>
                    <div className="w-full h-28 bg-surfaceDarkGray rounded-lg border border-borderGrayHover/30"></div>
                </div>

                {/* 4. Skeleton Listy Ćwiczeń (ExerciseLogGroup) */}
                <section>
                    <div className="h-6 w-48 bg-borderGrayHover/30 rounded mb-4  animate-pulse"></div>
                    <div className="space-y-6">
                        {/* Renderujemy kilka fałszywych grup */}
                        <ExerciseLogGroupSkeleton />
                        <ExerciseLogGroupSkeleton />
                    </div>
                </section>

                {/* 5. Skeleton Stopki (Przycisk Zapisu) */}
                <footer className="mt-10 flex justify-end  animate-pulse">
                    <div className="h-14 w-48 bg-borderGrayHover/30 rounded-lg"></div>
                </footer>

            </div>
        </div>
    );
}