'use client'

import { login } from './actions'

export default function LoginPage() {
  return (
    <div className="relative flex h-screen w-screen">
      {/* Full Background Image */}
      <img
        src="https://images.stockcake.com/public/a/2/4/a249d22a-a432-497e-8dad-0f4717362b13_large/stethoscope-on-desk-stockcake.jpg"
        alt="Background"
        className="absolute inset-0 object-cover w-full h-full z-0"
      />

      {/* Right: Login Form */}
      <div className="relative z-10 flex flex-col justify-center lg:ml-auto w-full lg:w-1/2 h-full bg-white bg-opacity-80 p-8 lg:p-36">
        <h1 className="text-2xl font-semibold mb-2">Doctor Portal</h1>
        <p className="text-gray-600 mb-6">Secure access for medical professionals</p>

        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="doctor@hospital.com"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <button
              formAction={login}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md py-2 px-4 w-full"
            >
              Sign In
            </button>
          </div>

          <div className="mt-6 text-center">
            <a href="/request-for-acc" className="text-blue-500 hover:text-blue-700 text-sm">
              Need access? Request an account →
            </a>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              First time logging in? You'll need to set up 2FA after sign in.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}