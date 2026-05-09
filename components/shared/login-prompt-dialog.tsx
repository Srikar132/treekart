"use client";

import { useLoginPrompt } from "@/store/use-login-prompt";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AnimatedButton } from "@/components/shared/animated-button";
import { LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginPromptDialog() {
  const { isOpen, closeLoginPrompt, redirectTo } = useLoginPrompt();
  const router = useRouter();

  const handleLogin = () => {
    closeLoginPrompt();
    router.push(`/auth/signin?next=${encodeURIComponent(redirectTo)}`);
  };

  const handleSignup = () => {
    closeLoginPrompt();
    router.push(`/auth/signup?next=${encodeURIComponent(redirectTo)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeLoginPrompt}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold text-center">Sign in to continue</DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            You need to be logged in to proceed to checkout. Please sign in or create an account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-2">
          <AnimatedButton
            onClick={handleLogin}
            label="Sign In"
            icon={<LogIn size={18} />}
            className="w-full h-12 text-base font-bold bg-primary text-white border-transparent tracking-wide"
            fillClassName="bg-white"
            hoverTextClassName="hover:text-primary"
          />
          <AnimatedButton
            onClick={handleSignup}
            label="Create Account"
            icon={<UserPlus size={18} />}
            className="w-full h-12 text-base font-bold bg-secondary text-secondary-foreground border-transparent tracking-wide"
            fillClassName="bg-primary"
            hoverTextClassName="hover:text-white"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
