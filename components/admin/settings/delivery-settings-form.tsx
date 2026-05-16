"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Save, Loader2, Truck, ShoppingBag, TreePine } from "lucide-react";
import { adminUpdateDeliverySettings } from "@/actions/admin.actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const deliverySettingsSchema = z.object({
  store_delivery_fee: z.coerce.number().min(0, "Must be 0 or more"),
  store_free_delivery_threshold: z.coerce.number().min(0, "Must be 0 or more"),
  rental_delivery_fee: z.coerce.number().min(0, "Must be 0 or more"),
});

type DeliverySettingsValues = z.infer<typeof deliverySettingsSchema>;

interface DeliverySettingsFormProps {
  defaultValues: DeliverySettingsValues;
}

export function DeliverySettingsForm({ defaultValues }: DeliverySettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<DeliverySettingsValues>({
    resolver: zodResolver(deliverySettingsSchema) as any,
    defaultValues,
  });

  function onSubmit(values: DeliverySettingsValues) {
    startTransition(async () => {
      try {
        await adminUpdateDeliverySettings(values);
        toast.success("Delivery settings updated");
      } catch (err: any) {
        toast.error(err.message ?? "Failed to save settings");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="store_delivery_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <ShoppingBag size={14} className="text-primary" />
                  Store Delivery Fee (₹)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    className="h-11 rounded-none border-border bg-background"
                  />
                </FormControl>
                <FormDescription className="text-[10px] uppercase tracking-widest">
                  Charged on mango store orders below threshold
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="store_free_delivery_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <Truck size={14} className="text-primary" />
                  Free Delivery Threshold (₹)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    className="h-11 rounded-none border-border bg-background"
                  />
                </FormControl>
                <FormDescription className="text-[10px] uppercase tracking-widest">
                  Orders at or above this amount get free delivery
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rental_delivery_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <TreePine size={14} className="text-primary" />
                  Rental Delivery Fee (₹)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    className="h-11 rounded-none border-border bg-background"
                  />
                </FormControl>
                <FormDescription className="text-[10px] uppercase tracking-widest">
                  Harvest delivery fee added to tree rental price. Set 0 for free.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs font-bold"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin mr-2" />
          ) : (
            <Save size={14} className="mr-2" />
          )}
          Save Settings
        </Button>
      </form>
    </Form>
  );
}
