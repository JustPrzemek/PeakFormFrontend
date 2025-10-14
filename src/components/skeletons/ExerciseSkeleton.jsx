export default function ExerciseSkeleton() {
    return (
        <div className="relative bg-surfaceDarkGray rounded-2xl p-5 animate-pulse overflow-hidden">
            <div className="absolute top-0 left-0 h-6 w-24 bg-borderGrayHover/30 rounded-br-lg"></div>

            <div className="absolute top-4 right-4 h-9 w-9 bg-borderGrayHover/30 rounded-full"></div>

             <div className="mt-8">
                <div className="h-6 w-3/4 bg-borderGrayHover/30 rounded"></div>
                <div className="h-4 w-1/2 bg-borderGrayHover/30 rounded mt-2"></div>
            </div>
        </div>
    );
}