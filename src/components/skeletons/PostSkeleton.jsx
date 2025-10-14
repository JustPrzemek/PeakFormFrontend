export default function PostSkeleton() {
    return (
        <div className="bg-surfaceDarkGray rounded-2xl p-4 animate-pulse">
            {/* Nagłówek posta */}
            <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-borderGrayHover/30 rounded-full"></div>
                <div className="ml-3">
                    <div className="h-4 w-32 bg-borderGrayHover/30 rounded"></div>
                    <div className="h-3 w-20 bg-borderGrayHover/30 rounded mt-1.5"></div>
                </div>
            </div>

            {/* Placeholder na media */}
            <div className="aspect-square bg-borderGrayHover/30 rounded-lg mb-4"></div>

            {/* Placeholder na tekst i akcje */}
            <div className="h-4 w-full bg-borderGrayHover/30 rounded mb-2"></div>
            <div className="h-4 w-3/4 bg-borderGrayHover/30 rounded"></div>
            <div className="flex justify-between items-center mt-4">
                <div className="h-6 w-24 bg-borderGrayHover/30 rounded"></div>
                <div className="h-6 w-20 bg-borderGrayHover/30 rounded"></div>
            </div>
        </div>
    );
}