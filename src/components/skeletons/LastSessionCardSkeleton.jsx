// src/components/history/LastSessionCardSkeleton.jsx

export default function LastSessionCardSkeleton() {
    return (
        <div className="bg-surfaceDarkGray rounded-2xl shadow-lg p-6 animate-pulse">
            {/* Nagłówek */}
            <div className="flex justify-between items-center mb-4">
                <div className="h-6 w-3/5 bg-borderGrayHover/30 rounded"></div>
                <div className="h-4 w-1/4 bg-borderGrayHover/30 rounded"></div>
            </div>
            
            {/* Notatki */}
            <div className="h-4 w-full bg-borderGrayHover/30 rounded mb-4"></div>
            
            {/* Statystyki */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-borderGrayHover/30 rounded-full"></div>
                    <div className="h-5 w-24 bg-borderGrayHover/30 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-borderGrayHover/30 rounded-full"></div>
                    <div className="h-5 w-24 bg-borderGrayHover/30 rounded"></div>
                </div>
            </div>

            {/* Tytuł podsumowania */}
            <div className="h-5 w-1/3 bg-borderGrayHover/30 rounded mb-3"></div>
            
            {/* Lista podsumowania */}
            <div className="space-y-2">
                <div className="h-4 w-3/4 bg-borderGrayHover/30 rounded"></div>
                <div className="h-4 w-2/3 bg-borderGrayHover/30 rounded"></div>
                <div className="h-4 w-3/4 bg-borderGrayHover/30 rounded"></div>
            </div>
        </div>
    );
}