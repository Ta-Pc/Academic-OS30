"use client";
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded-lg p-6">
        <h1 className="text-xl font-semibold mb-4">Log in</h1>
        <form className="space-y-4" action="#" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              type="email"
              name="email"
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="Basic Student@Gmail.com"
            />
          </label>
          <button className="w-full bg-black text-white rounded px-3 py-2">Log In</button>
        </form>
      </div>
    </main>
  );
}


