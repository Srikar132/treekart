import "./admin.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import NextTopLoader from "nextjs-toploader";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <NuqsAdapter>
            <NextTopLoader color="var(--primary)" showSpinner={false} />
            <div className="admin-theme min-h-screen flex w-full">
                {children}
            </div>
        </NuqsAdapter>
    );
}

export default AdminLayout;

