"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-7 w-7 rounded bg-ubs-red" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-header text-muted">
                FI Execution
              </p>
              <p className="text-sm font-bold uppercase tracking-header text-ink">
                Client Portal
              </p>
            </div>
          </Link>

          <Link
            href="/signup"
            className="text-xs font-semibold uppercase tracking-label text-ink transition-colors hover:text-ubs-red"
          >
            Create account
          </Link>
        </div>

        <Card className="overflow-hidden border border-border bg-white">
          <div className="border-b border-border bg-[#fafafa] px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-label text-muted">
              Secure access
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
              Login
            </h1>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-label text-muted">
                Username / Client ID
              </label>
              <Input
                type="text"
                placeholder="Enter username or client ID"
                className="h-10 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-label text-muted">
                Password / PIN
              </label>
              <Input
                type="password"
                placeholder="Enter your password or PIN"
                className="h-10 text-sm"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-muted">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-ubs-red"
                />
                <span>Remember me</span>
              </label>

              <Link href="/" className="font-semibold text-ink transition-colors hover:text-ubs-red">
                Forgot PIN?
              </Link>
            </div>

            <Button
              className="w-full"
              size="md"
              onClick={() => router.push("/")}
            >
              Sign In
            </Button>
          </div>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          New to the platform?{" "}
          <Link href="/signup" className="font-semibold text-ink hover:text-ubs-red">
            Start your application
          </Link>
        </p>
      </div>
    </div>
  );
}
