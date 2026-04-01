"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  account_not_linked:
    "This email is already linked to another sign-in method. Please sign in with the originally connected provider.",
  unable_to_link_account:
    "This email is already linked to another sign-in method. Please sign in with the originally connected provider.",
  account_already_linked_to_different_user:
    "This sign-in method is already linked to another account. Please sign in to the original account and unlink the provider before trying again.",
  signup_disabled:
    "You cannot sign up with this provider. Please try using another provider."
};

const FALLBACK_AUTH_ERROR_MESSAGE =
  "An error occurred during authentication. Please try again.";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error")?.toLowerCase() ?? "";

  const message = AUTH_ERROR_MESSAGES[error] ?? FALLBACK_AUTH_ERROR_MESSAGE;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold">Authentication Error</h1>
      <p className="mt-4 text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <Link href="/auth/login">&larr;&nbsp;Back to Login</Link>
      </Button>
    </div>
  );
}