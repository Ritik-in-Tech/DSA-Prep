import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn, auth } from "@/auth";
import { hasGithubAuth, hasGoogleAuth } from "@/lib/env";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Sign in — DSA Prep",
};

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await auth();
  const { from } = await searchParams;
  if (session?.user) {
    redirect(from || "/dashboard");
  }
  const callbackUrl = from || "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to track your DSA streak across LeetCode and Codeforces.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasGoogleAuth && (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: callbackUrl });
              }}
            >
              <Button type="submit" variant="outline" className="w-full">
                <GoogleIcon /> Continue with Google
              </Button>
            </form>
          )}
          {hasGithubAuth && (
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: callbackUrl });
              }}
            >
              <Button type="submit" variant="outline" className="w-full">
                <GitHubIcon /> Continue with GitHub
              </Button>
            </form>
          )}
          {!hasGoogleAuth && !hasGithubAuth && (
            <p className="text-sm text-muted-foreground">
              No OAuth providers are configured. Set{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                AUTH_GOOGLE_ID
              </code>
              /{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                AUTH_GITHUB_ID
              </code>{" "}
              in <code>.env</code>.
            </p>
          )}
          <p className="pt-3 text-center text-xs text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.7 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.84 0 3.07.78 3.78 1.46l2.58-2.49C16.7 4.05 14.55 3.1 12 3.1 7 3.1 3 7.1 3 12s4 8.9 9 8.9c5.18 0 8.6-3.64 8.6-8.76 0-.59-.06-1.04-.15-1.04Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.95.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.99 0 1.97.13 2.9.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.21 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z"
      />
    </svg>
  );
}
