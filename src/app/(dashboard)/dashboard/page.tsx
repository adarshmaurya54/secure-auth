"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  console.log(user, loading)

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <div className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold">
          User Info
        </h2>

        <p>Name: {user?.name}</p>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
        <p>
          Verified:{" "}
          {user?.isVerified
            ? "Yes"
            : "No"}
        </p>
      </div>
    </div>
  );
}