"use client";

import { useState } from "react";
import { TopTicker } from "@/components/layout/TopTicker";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

type ClientLayoutProps = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Persistent TopTicker */}
      <TopTicker />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - watchlist */}
        {sidebarOpen && (
          <aside className="w-64 flex-shrink-0 border-r border-border overflow-y-auto">
            <Sidebar />
          </aside>
        )}

        {/* Main area with navbar + page content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
