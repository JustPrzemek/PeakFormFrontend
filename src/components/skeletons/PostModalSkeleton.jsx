export default function PostModalSkeleton() {
    return (
        <div className="bg-surfaceDarkGray rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col lg:flex-row overflow-hidden animate-pulse">
            {/* Lewa strona - Media */}
            <div className="w-full lg:w-3/5 bg-borderGrayHover/30 h-1/2 lg:h-full"></div>

            {/* Prawa strona - Info */}
            <div className="w-full lg:w-2/5 flex flex-col h-1/2 lg:h-full">
                {/* Header */}
                <div className="p-4 flex items-center border-b border-borderGrayHover/30">
                    <div className="w-10 h-10 rounded-full bg-borderGrayHover/30 mr-3"></div>
                    <div className="h-5 w-32 bg-borderGrayHover/30 rounded"></div>
                </div>
                {/* Komentarze (przewijalna część) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-borderGrayHover/30 mr-3"></div>
                        <div className="flex-1">
                            <div className="h-4 w-24 bg-borderGrayHover/30 rounded mb-1.5"></div>
                            <div className="h-3 w-3/4 bg-borderGrayHover/30 rounded"></div>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-borderGrayHover/30 mr-3"></div>
                        <div className="flex-1">
                            <div className="h-4 w-20 bg-borderGrayHover/30 rounded mb-1.5"></div>
                            <div className="h-3 w-1/2 bg-borderGrayHover/30 rounded"></div>
                        </div>
                    </div>
                </div>
                {/* Stopka */}
                <div className="p-4 border-t border-borderGrayHover/30 mt-auto">
                    <div className="h-6 w-24 bg-borderGrayHover/30 rounded mb-2"></div>
                    <div className="h-4 w-16 bg-borderGrayHover/30 rounded"></div>
                </div>
            </div>
        </div>
    );
}