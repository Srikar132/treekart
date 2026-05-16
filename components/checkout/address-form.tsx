import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { type DeliveryAddress, INDIAN_STATES } from "@/types/checkout";
import { cn } from "@/lib/utils";
import { usePincode, type PostOffice } from "@/hooks/use-pincode";
import { useEffect, useState } from "react";

type Props = {
  value: DeliveryAddress;
  onChange: (v: DeliveryAddress) => void;
  errors?: Partial<Record<keyof DeliveryAddress, string>>;
};

export function AddressForm({ value, onChange, errors }: Props) {
  const { fetchPincodeData, loading } = usePincode();
  const [localities, setLocalities] = useState<PostOffice[]>([]);

  useEffect(() => {
    if (value.pincode.length === 6) {
      fetchPincodeData(value.pincode).then((data) => {
        if (data && data.length > 0) setLocalities(data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key: keyof DeliveryAddress) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [key]: e.target.value });

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange({ ...value, pincode: pin });

    if (pin.length === 6) {
      const data = await fetchPincodeData(pin);
      if (data && data.length > 0) {
        setLocalities(data);
        const first = data[0];
        onChange({
          ...value,
          pincode: pin,
          city: (first.Taluk && first.Taluk !== "NA") ? first.Taluk : first.District,
          district: first.District,
          state: first.State,
          country: "India",
          locality: data.length === 1 ? first.Name : value.locality
        });
      }
    } else {
      setLocalities([]);
    }
  };

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
            // disabled
            className={cn(
              "h-12 rounded-none border-border bg-muted/50 text-sm focus-visible:ring-primary transition-all cursor-not-allowed",
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
            <Input
              id="phone"
              placeholder="98765 43210"
              value={value.phone}
              onChange={set("phone")}
              // disabled
              className={cn(
                "h-12 rounded-none border-border bg-muted/50 text-sm focus-visible:ring-primary transition-all cursor-not-allowed",
                errors?.phone && "border-destructive focus-visible:ring-destructive"
              )}
            />
          </div>
          {errors?.phone && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <Label htmlFor="pincode" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            Pincode
          </Label>
          <div className="relative">
            <Input
              id="pincode"
              placeholder="520001"
              maxLength={6}
              value={value.pincode}
              onChange={handlePincodeChange}
              className={cn(
                "h-12 rounded-none border-border bg-background text-sm focus-visible:ring-primary transition-all font-mono",
                errors?.pincode && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {loading ? (
                <Loader2 size={14} className="animate-spin text-primary" />
              ) : value.pincode.length === 6 && localities.length > 0 ? (
                <CheckCircle2 size={14} className="text-green-500" />
              ) : null}
            </div>
          </div>
          {errors?.pincode && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.pincode}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Locality / Area</Label>
          <Select
            value={value.locality || ""}
            onValueChange={(v) => onChange({ ...value, locality: v })}
            disabled={localities.length === 0}
          >
            <SelectTrigger className={cn(
              "!h-12 !w-full rounded-none border-border bg-background text-sm focus:ring-0 focus:border-primary transition-all",
              errors?.locality && "border-destructive"
            )}>
              <SelectValue placeholder={localities.length > 0 ? "Select Locality" : "Enter PIN first"} />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border">
              {localities.map((po) => (
                <SelectItem key={po.Name} value={po.Name} className="rounded-none text-xs uppercase tracking-widest">
                  {po.Name} {po.BranchType !== "NA" ? `(${po.BranchType})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.locality && (
            <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{errors.locality}</p>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="line1" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
          Street Address / House No.
        </Label>
        <Input
          id="line1"
          placeholder="Flat No, Building Name, Street, Landmark"
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="space-y-2.5">
          <Label htmlFor="city" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            City
          </Label>
          <Input
            id="city"
            placeholder="City"
            value={value.city}
            onChange={set("city")}
            className={cn(
              "h-12 rounded-none border-border bg-background text-sm focus-visible:ring-primary transition-all",
              errors?.city && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="district" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
            District
          </Label>
          <Input
            id="district"
            placeholder="District"
            value={value.district || ""}
            onChange={set("district")}
            className={cn(
              "h-12 rounded-none border-border bg-background text-sm focus-visible:ring-primary transition-all",
              errors?.district && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>

        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">State</Label>
          <Input
            id="state"
            placeholder="State"
            value={value.state || ""}
            onChange={set("state")}
            className={cn(
              "h-12 rounded-none border-border bg-background text-sm focus-visible:ring-primary transition-all",
              errors?.state && "border-destructive focus-visible:ring-destructive"
            )}
          />
        </div>

        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Country</Label>
          <Input
            id="country"
            value={value.country || "India"}
            readOnly
            className="h-12 rounded-none border-border bg-muted/30 text-sm cursor-default"
          />
        </div>
      </div>

      <div className="flex items-start gap-4 p-6 bg-secondary/20 border border-border/40 mt-4">
        <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[9px] uppercase tracking-[0.2em] leading-relaxed text-muted-foreground font-medium">
          <span className="text-foreground font-black">Data Privacy:</span> Your delivery coordinates are only shared with our logistics partners during the harvest window. You can modify these anytime via your account dashboard.
        </p>
      </div>
    </div>
  );
}
