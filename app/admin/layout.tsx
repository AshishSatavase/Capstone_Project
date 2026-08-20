import { AdminNavbar } from "@/components/layout/AdminNavbar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Admin Header - darker styling */}
      <AdminNavbar />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="w-56 flex-shrink-0 border-r border-border overflow-y-auto bg-faint/5">
          <AdminSidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
