"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full neu-flat p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto neu-flat rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-neu-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-700">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 mt-2 text-sm">ระบบลงเวลาทำงาน Time Tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2 px-2">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 placeholder-gray-400"
              placeholder="employee@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2 px-2">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neu-bg shadow-neu-pressed rounded-xl focus:outline-none text-gray-700 placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium px-4 py-2 neu-flat text-neu-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full neu-btn text-neu-blue font-bold py-4 px-4 mt-4 tracking-wide"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
