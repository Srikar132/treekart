import { AppSidebar } from "@/components/storefront/app-sidebar";
import { CartSidebar } from "@/components/storefront/cart-sidebar";
import { Footer } from "@/components/storefront/footer";
import { Navbar } from "@/components/storefront/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function StorefrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider defaultOpen={false}>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col overflow-x-hidden max-w-full">
                    <Navbar />
                    <main className="flex-1">
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>

            <CartSidebar />
        </SidebarProvider>
    );
}