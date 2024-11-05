import { ConnectButton, useConnection } from "@arweave-wallet-kit/react"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export function LandingPage() {
  const { connected } = useConnection()
  const navigate = useNavigate()

  useEffect(() => {
    if (connected) {
      navigate('/link-generator')
    }
  }, [connected, navigate])

  const handleCreateSpace = () => {
    if (connected) {
      navigate('/link-generator')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <main className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 sm:text-5xl md:text-6xl">
          One permanent link for you to share what you like and create
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your digital space, your rules. Share your content, your way.
        </p>
        <div className="flex flex-col items-center gap-4">
          {!connected ? (
            <>
              <p className="text-gray-600 mb-2">Connect your wallet to get started</p>
              <ConnectButton 
                className="bg-black text-white font-semibold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              />
            </>
          ) : (
            <button
              onClick={handleCreateSpace}
              className="bg-black text-white font-semibold py-3 px-8 rounded-full text-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              Create Your Space Now
            </button>
          )}
        </div>
      </main>
      <footer className="mt-16 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </footer>
    </div>
  )
}