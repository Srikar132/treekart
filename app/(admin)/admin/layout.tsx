import "./admin.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/providers/theme-provider";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
                <NuqsAdapter>
                    <div className="admin-theme min-h-screen flex w-full">
                        <AdminSidebar />
                        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden bg-background">
                            <AdminNavbar />
                            <main className="flex-1 overflow-y-auto">
                                <div className="max-w-7xl mx-auto p-4 md:p-8">
                                    {children}
                                </div>
                            </main>
                        </SidebarInset>
                    </div>
                </NuqsAdapter>
            </SidebarProvider>
        </ThemeProvider>
    );
}

export default AdminLayout;

