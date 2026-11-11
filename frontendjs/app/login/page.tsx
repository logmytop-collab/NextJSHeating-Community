"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { userAgentFromString } from "next/server";

//import { signIn, signOut, useSession } from "next-auth/react";

//const handleSignOut = () => signOut();

export default function LoginPage() {
  const router = useRouter();
  //const { data: session } = useSession();
  const username: string =
    typeof window !== "undefined"
      ? localStorage.getItem("heating-name") || ""
      : "";
  const password: string =
    typeof window !== "undefined"
      ? localStorage.getItem("heating-password") || ""
      : "";
  const [formData, setFormData] = useState({
    username: username,
    password: password,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {}, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Express Login : ");
      //const url = "http://localhost:5000/gipfelbuch/GipfelStuermer?login";
      const url = "/api/heating/login";
      //const url = "/api/auth/login";
      //const url = "/api/auth/login";
      //const response = await fetch("/api/GipfelStuermer?login", {
      const response = await fetch(url, {
        //const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Login data : ", data);

      if (data.success) {
        window.localStorage.setItem("heating-name", formData.username);
        window.localStorage.setItem("heating-password", formData.password);
        console.log("goto dashboard : ");
        router.push("/dashboard");
        //window.location.href = '/dashboard';
      } else {
        setError(data.message || "Login failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("An error occurred. Please try again." + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
