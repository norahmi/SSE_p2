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

export default function AuthLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProviderLogin = async (
    providerId: "google" | "github" | "microsoft",
  ) => {
    try {
      await authClient.signIn.social(
        {
          provider: providerId,
          callbackURL: "/dashboard",
          errorCallbackURL: "/auth/error",
          newUserCallbackURL: "/auth/welcome",
          disableRedirect: false,
        },
        {
          onRequest: (ctx) => {
            setIsLoading(true);
          },
          onSuccess: (ctx) => {
            // redirect to the callback URL
          },
          onError: (ctx) => {
            setError(
              ctx.error.message ||
                `An error occurred during social sign in. Please try again.`,
            );
            setIsLoading(false);
          },
        },
      );
    } catch (error) {
      console.error(`Error during ${providerId} sign in:`, error);
      setError(`An error occurred during social sign in. Please try again.`);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await authClient.signIn.email(
        {
          email,
          password,
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
      console.error("Error during sign in:", error);
      setError("An error occurred during sign in. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form className="p-6 md:p-8" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <p className="text-balance text-muted-foreground">
            Sign In to LeafCode
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-2 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" name="password" type="password" required />
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </Field>
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          Or continue with
        </FieldSeparator>
        <Field className="grid grid-cols-3 gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => handleProviderLogin("google")}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height={24}
              viewBox="0 0 24 24"
              width={24}
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span className="sr-only">Login with Google</span>
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleProviderLogin("github")}
            disabled={isLoading}
          >
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
          <Button
            variant="outline"
            type="button"
            onClick={() => handleProviderLogin("microsoft")}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
              <path fill="#f35325" d="M0 0h10v10H0z" />
              <path fill="#81bc06" d="M11 0h10v10H11z" />
              <path fill="#05a6f0" d="M0 11h10v10H0z" />
              <path fill="#ffba08" d="M11 11h10v10H11z" />
            </svg>
            <span className="sr-only">Login with Microsoft</span>
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Don&apos;t have an account? <Link href="/auth/register">Sign Up</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
