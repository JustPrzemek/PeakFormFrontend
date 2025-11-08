// src/components/history/AllSessionTileSkeleton.jsx

export default function AllSessionTileSkeleton() {
    return (
        <div className="bg-surfaceDarkGray p-4 rounded-2xl animate-pulse">
            {/* Nagłówek */}
            <div className="flex justify-between items-start mb-3">
                <div className="h-5 w-2/3 bg-borderGrayHover/30 rounded"></div>
                <div className="h-4 w-1/4 bg-borderGrayHover/30 rounded"></div>
            </div>
            {/* Stopka */}
            <div className="flex justify-between items-center">
                <div className="h-6 w-16 bg-borderGrayHover/30 rounded-full"></div>
                <div className="h-5 w-20 bg-borderGrayHover/30 rounded"></div>
            </div>
        </div>
    );
}