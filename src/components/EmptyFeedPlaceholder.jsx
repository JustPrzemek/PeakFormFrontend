import React from 'react';
import { FaUsers, FaSearch  } from "react-icons/fa";
import { Link } from 'react-router-dom';

const EmptyFeedPlaceholder = () => {
    return (
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg p-8 my-4 shadow-md">
            <FaUsers className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">Your feed is empty</h3>
            <p className="mt-1 text-md text-gray-500 dark:text-gray-400">
                Follow other users to see their posts.
            </p>
            {/* <div className="mt-6">
                <Link
                    to="/explore/users"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FaSearch className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Znajdź znajomych
                </Link>
            </div> */}
        </div>
    );
};

export default EmptyFeedPlaceholder;