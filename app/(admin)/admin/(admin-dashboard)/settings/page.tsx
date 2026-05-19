import { requireAdmin } from "@/lib/auth";
import { getAppSettings } from "@/actions/admin.actions";
import { DeliverySettingsForm } from "@/components/admin/settings/delivery-settings-form";
import { Truck } from "lucide-react";

export const metadata = {
  title: "Settings | Admin",
};

export default async function AdminSettingsPage() {
  const [, settings] = await Promise.all([requireAdmin(), getAppSettings()]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 border border-primary/20">
          <Truck size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-foreground">Settings</h1>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
            Manage delivery fees and store configuration
          </p>
        </div>
      </div>

      <div className="border border-border bg-card p-8">
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Delivery Charges</h2>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">
            These values apply to new orders and rentals immediately after saving.
          </p>
        </div>
        <DeliverySettingsForm
          defaultValues={{
            store_delivery_fee: settings.store_delivery_fee,
            store_free_delivery_threshold: settings.store_free_delivery_threshold,
            rental_delivery_fee: settings.rental_delivery_fee,
          }}
        />
      </div>
    </div>
  );
}
