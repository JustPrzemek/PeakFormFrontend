function IconButton({ children, text, ...props }) {
    return (
        <button
            {...props}
            className="text-lg border text-stone-600 flex justify-center items-center gap-x-2 w-1/2 py-3 my-3 rounded-lg cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
            {children}
            <div className="font-semibold text-base text-gray-500">{text}</div>
        </button>
    );
}

export default IconButton;