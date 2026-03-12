"use client";

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function AuthError() {
  return(
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold">Authentication Error</h1>
      <p className="mt-4 text-muted-foreground">
        An error occurred during authentication. Please try again.
      </p>
      <Button className="mt-6" onClick={() => redirect("/auth/login")}>
        &larr;&nbsp;Back to Login
      </Button>
    </div>
  )
}