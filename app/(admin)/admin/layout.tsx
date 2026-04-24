import "./admin.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <NuqsAdapter>
            <div className="admin-theme min-h-screen flex w-full">
                {children}
            </div>
        </NuqsAdapter>
    );
}

export default AdminLayout;

