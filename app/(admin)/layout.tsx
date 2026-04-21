import "./admin.css";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminNavbar } from "@/components/admin/admin-navbar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="admin-theme min-h-screen">
            <AdminSidebar />
            <div className="admin-main">
                <AdminNavbar />
                <main className="admin-container">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;