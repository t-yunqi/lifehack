'use client'

import { signup } from './actions'

export default function SignupPage() {
  return (
    <div className="relative flex h-screen w-screen">
      {/* Full Background Image */}
      <img
        src="https://images.stockcake.com/public/a/2/4/a249d22a-a432-497e-8dad-0f4717362b13_large/stethoscope-on-desk-stockcake.jpg"
        alt="Background"
        className="absolute inset-0 object-cover w-full h-full z-0"
      />

      {/* Right: Signup Form */}
      <div className="relative z-10 flex flex-col justify-center lg:ml-auto w-full lg:w-1/2 h-full bg-white bg-opacity-80 p-8 lg:p-36">
        <h1 className="text-2xl font-semibold mb-4">Create Account</h1>

        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <button
              formAction={signup}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md py-2 px-4 w-full"
            >
              Create Account
            </button>
          </div>

          <div className="mt-6 text-center">
            <a href="/login" className="text-blue-500 hover:text-blue-700">
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}