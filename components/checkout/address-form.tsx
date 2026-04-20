"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Info } from "lucide-react";
import { type DeliveryAddress, INDIAN_STATES } from "@/types/checkout";
import { cn } from "@/lib/utils";

type Props = {
  value: DeliveryAddress;
  onChange: (v: DeliveryAddress) => void;
  errors?: Partial<Record<keyof DeliveryAddress, string>>;
};

const STORAGE_KEY = "treekart_delivery_address";

export function AddressForm({ value, onChange, errors }: Props) {
  const [saveDetails, setSaveDetails] = useState(false);

  // Load saved address on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only overwrite if the saved data actually has content
        if (parsed.name || parsed.line1) {
          onChange(parsed);
          setSaveDetails(true);
        }
      } catch (e) {
        console.error("Failed to load saved address", e);
      }
    }
  }, []);

  // Save to localStorage if checkbox is checked
  useEffect(() => {
    if (saveDetails) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [value, saveDetails]);

  const set = (key: keyof DeliveryAddress) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...value, [key]: e.target.value } as DeliveryAddress);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Form Section Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
            Delivery Destination
          </h3>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
          The address where your fresh mangoes will be delivered during the harvest season.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={value.name}
            onChange={set("name")}
            className={cn(
              "h-12 rounded-none border-border bg-background text-sm focus-visible:ring-primary transition-all",
              errors?.name && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors?.name && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Phone Number
          </Label>
          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 border-r border-border/50 pointer-events-none">
                <span className="text-xs font-bold text-muted-foreground/60">+91</span>
             </div>
            <Input
              id="phone"
              placeholder="98765 43210"
              value={value.phone}
              onChange={set("phone")}
              className={cn(
                "h-12 rounded-none border-border bg-background pl-16 text-sm focus-visible:ring-primary transition-all",
                errors?.phone && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </div>
          {errors?.phone && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="line1" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
          Street Address
        </Label>
        <Input
          id="line1"
          placeholder="Flat No, Apartment, Street, Landmark"
          value={value.line1}
          onChange={set("line1")}
          className={cn(
            "h-12 rounded-none border-border bg-background text-sm focus-visible:ring-primary transition-all",
            errors?.line1 && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors?.line1 && (
          <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.line1}</p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        <div className="space-y-2.5">
          <Label htmlFor="city" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            City
          </Label>
          <Input
            id="city"
            placeholder="Vijayawada"
            value={value.city}
            onChange={set("city")}
            className={cn(
              "h-12 rounded-none border-border bg-background text-sm focus-visible:ring-primary transition-all",
              errors?.city && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors?.city && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">State</Label>
          <Select
            value={value.state || ""}
            onValueChange={(v) => onChange({ ...value, state: v } as DeliveryAddress)}
          >
            <SelectTrigger className={cn(
              "h-12 rounded-none border-border bg-background text-sm focus:ring-0 focus:border-primary transition-all",
              errors?.state && "border-destructive"
            )}>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border">
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s} className="rounded-none text-xs uppercase tracking-widest">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.state && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="pincode" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Pincode
          </Label>
          <Input
            id="pincode"
            placeholder="520001"
            maxLength={6}
            value={value.pincode}
            onChange={set("pincode")}
            className={cn(
              "h-12 rounded-none border-border bg-background text-sm focus-visible:ring-primary transition-all font-mono",
              errors?.pincode && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors?.pincode && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.pincode}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 pt-4 border-t border-border/40">
        <Checkbox
          id="save"
          checked={saveDetails}
          onCheckedChange={(v) => setSaveDetails(!!v)}
          className="h-5 w-5 rounded-none border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label
          htmlFor="save"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 cursor-pointer select-none"
        >
          Remember this address for future harvests
        </Label>
      </div>

      <div className="flex items-start gap-4 p-6 bg-secondary/20 border border-border/40">
        <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[9px] uppercase tracking-[0.2em] leading-relaxed text-muted-foreground font-medium">
          <span className="text-foreground font-black">Data Privacy:</span> Your delivery coordinates are only shared with our logistics partners during the harvest window. You can modify these anytime via your account dashboard.
        </p>
      </div>
    </div>
  );
}
