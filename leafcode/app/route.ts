import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (session) {
        redirect("/dashboard");
    } else {
        redirect("/auth/login");
    }
}