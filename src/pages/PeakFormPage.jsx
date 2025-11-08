



export default function PeakFormPage() {
    return (
        <main className="w-full min-h-screen bg-gray-50 flex flex-col">
            <section className="w-full p-6 pt-12 flex flex-col items-center text-center space-y-5 ">
                <h1 className="text-3xl font-bold text-gray-900">LET'S START THE JURNEY WITH PEAKFORM</h1>
                <p className="text-lg text-gray-700">Login on sign up to atchieve yorur goals</p>
                <div className="flex flex-row gap-3">
                    <button className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg">sign up</button>
                    <button className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg">sign in</button>
                </div>
            </section>
        </main>
    );
}