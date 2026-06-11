// src/app/(dashboard)/layout.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div>
      <nav className="border-b p-4 flex justify-between">
        <h1>Dashboard</h1>

        <button onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main>{children}</main>
    </div>
  );
}