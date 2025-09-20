import { FaEye, FaEyeSlash } from 'react-icons/fa';

function IconInput({ children, placeholder, type, value, onChange, name, error, isPassword = false, onToggleVisibility }) {
    return (
        <div className="w-full mt-4">
            <div className={`flex justify-left items-center w-full relative h-12 border shadow-xl rounded-md overflow-hidden ${error ? 'border-red-500' : 'border-gray-200'}`}>
                <div className="icon__wrapper w-14 absolute flex justify-center items-center">
                    <span className="text-xl opacity-80 text-gray-500">{children}</span>
                </div>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    name={name}
                    className="w-full h-full pl-14 pr-12 outline-none"
                />
                {isPassword && (
                    <div 
                        className="absolute right-0 flex items-center justify-center w-12 h-full cursor-pointer"
                        onClick={onToggleVisibility}
                    >
                        <span className="text-xl opacity-80 text-gray-500">
                            {type === 'password' ? <FaEye /> : <FaEyeSlash />}
                        </span>
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1 pl-1">{error}</p>}
        </div>
    );
}

export default IconInput;