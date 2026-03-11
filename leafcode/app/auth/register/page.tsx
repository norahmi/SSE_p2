"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AuthRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProviderRegister = async (providerId: "google" | "github" | "microsoft") => {
    try {
      await authClient.signIn.social({
        provider: providerId,
        callbackURL: "/dashboard",
        errorCallbackURL: "/auth/error",
        newUserCallbackURL: "/auth/welcome",
        disableRedirect: false,
      }, {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          // redirect to the callback URL
        },
        onError: (ctx) => {
          setError(ctx.error.message || `An error occurred during social sign up. Please try again.`);
          setIsLoading(false);
        },
      }
    );
    } catch (error) {
      console.error(`Error during ${providerId} sign up:`, error);
      setError(`An error occurred during social sign up. Please try again.`);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const { data, error } = await authClient.signUp.email(
        {
          email,
          password,
          name,
          callbackURL: "/dashboard",
        },
        {
          onRequest: (ctx) => {
            setIsLoading(true);
          },
          onSuccess: (ctx) => {
            // redirect to the callback URL
          },
          onError: (ctx) => {
            setError(ctx.error.message);
            setIsLoading(false);
          },
        },
      );
    } catch (error) {
      console.error("Error during registration:", error);
      setError("An error occurred during registration. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Welcome to LeafCode!</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <Field className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" name="confirm-password" type="password" required />
            </Field>
          </Field>
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" type="text" required />
        </Field>
        
        {error && (
          <Field>
            <FieldDescription className="text-destructive">
              {error}
            </FieldDescription>
          </Field>
        )}

        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </Field>
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>
        <Field className="grid grid-cols-3 gap-4">
          <Button variant="outline" type="button" onClick={() => handleProviderRegister("google")} disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            <span className="sr-only">Login with Google</span>
          </Button>
          <Button variant="outline" type="button" onClick={() => handleProviderRegister("github")} disabled={isLoading}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="icon icon-tabler icons-tabler-filled icon-tabler-brand-github"
              viewBox="0 0 24 24"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path d="M5.315 2.1c.791-.113 1.9.145 3.333.966l.272.161.16.1.397-.083a13.3 13.3 0 0 1 4.59-.08l.456.08.396.083.161-.1c1.385-.84 2.487-1.17 3.322-1.148l.164.008.147.017.076.014.05.011.144.047a1 1 0 0 1 .53.514 5.2 5.2 0 0 1 .397 2.91l-.047.267-.046.196.123.163c.574.795.93 1.728 1.03 2.707l.023.295L21 9.5c0 3.855-1.659 5.883-4.644 6.68l-.245.061-.132.029.014.161.008.157.004.365-.002.213L16 21a1 1 0 0 1-.883.993L15 22H9a1 1 0 0 1-.993-.883L8 21v-.734c-1.818.26-3.03-.424-4.11-1.878l-.535-.766c-.28-.396-.455-.579-.589-.644l-.048-.019a1 1 0 0 1 .564-1.918c.642.188 1.074.568 1.57 1.239l.538.769c.76 1.079 1.36 1.459 2.609 1.191L8 17.562l-.018-.168a5 5 0 0 1-.021-.824l.017-.185.019-.12-.108-.024c-2.976-.71-4.703-2.573-4.875-6.139l-.01-.31L3 9.5a5.6 5.6 0 0 1 .908-3.051l.152-.222.122-.163-.045-.196a5.2 5.2 0 0 1 .145-2.642l.1-.282.106-.253a1 1 0 0 1 .529-.514l.144-.047z"></path>
            </svg>
            <span className="sr-only">Login with Github</span>
          </Button>
          <Button variant="outline" type="button" onClick={() => handleProviderRegister("microsoft")} disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4875 4875">
              <path d="M0 0h2311v2310H0zm2564 0h2311v2310H2564zM0 2564h2311v2311H0zm2564 0h2311v2311H2564"></path>
            </svg>
            <span className="sr-only">Login with Microsoft</span>
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Already have an account? <Link href="/auth/login">Sign In</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
