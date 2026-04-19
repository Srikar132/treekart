import { PackageOpen } from "lucide-react";
import { Button } from "./button";

interface NoResultsProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function NoResults({ 
  title = "No products found", 
  description = "Use fewer filters or remove all",
  actionText,
  onAction
}: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
        <PackageOpen size={32} className="text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="link" onClick={onAction} className="text-primary underline-offset-4 hover:underline">
          {actionText}
        </Button>
      )}
    </div>
  );
}
