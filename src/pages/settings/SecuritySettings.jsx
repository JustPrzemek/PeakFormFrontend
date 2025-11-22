import React from 'react';

export default function SecuritySettings() {
    return (
        <div className="max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Login & Security</h2>
            
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-bluePrimary">Change Password</h3>
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-sm text-borderGrayHover mb-1">Current Password</label>
                            <input type="password" className="w-full p-3 bg-backgoudBlack rounded-lg border border-borderGrayHover focus:border-bluePrimary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-borderGrayHover mb-1">New Password</label>
                            <input type="password" className="w-full p-3 bg-backgoudBlack rounded-lg border border-borderGrayHover focus:border-bluePrimary outline-none" />
                        </div>
                        <button className="bg-bluePrimary px-6 py-2 rounded-lg font-bold hover:bg-blueHover transition">
                            Update Password
                        </button>
                    </form>
                </div>

                <div className="pt-6 border-t border-borderGrayHover/30">
                    <h3 className="text-lg font-semibold mb-2 text-red-400">Delete Account</h3>
                    <p className="text-sm text-borderGrayHover mb-4">Permanently delete your account and all of your content.</p>
                    <button className="text-red-400 border border-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-400/10 transition">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}