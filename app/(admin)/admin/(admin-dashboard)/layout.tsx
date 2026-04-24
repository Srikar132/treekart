import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden bg-background">
                <AdminNavbar />
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default DashboardLayout;
