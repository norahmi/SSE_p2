import { Card, CardContent } from "@/components/ui/card";
import {
  FieldDescription,
} from "@/components/ui/field";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (session) {
        redirect("/");
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <div className="flex flex-col gap-6">
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                        {children}
                        <div className="relative hidden bg-muted md:block">
                            <img
                            src="/assets/img/ui/auth-side.jpg"
                            alt="Deep forest of dark-colored trees with a lake reflecting the scenery."
                            // className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                            className="absolute inset-0 h-full w-full object-cover"
                            />
                        </div>
                        </CardContent>
                    </Card>
                    <FieldDescription className="px-6 text-center">
                        By continuing, you agree to our <a href="/legal/terms-of-service">Terms of Service</a>{" "}
                        and <a href="/legal/privacy-policy">Privacy Policy</a>.
                    </FieldDescription>
                </div>
            </div>
        </div>
    );
}