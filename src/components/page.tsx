import {Link} from "react-router-dom"

export function landingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <main className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 sm:text-5xl md:text-6xl">
          One permanent link for you to share what you like and create
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your digital space, your rules. Share your content, your way.
        </p>
        <Link
          to="/create"
          className="inline-block bg-black text-white font-semibold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          Create Your Space Now
        </Link>
      </main>
      <footer className="mt-16 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </footer>
    </div>
  )
}