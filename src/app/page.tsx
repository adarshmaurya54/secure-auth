import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  RefreshCcw,
  Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const features = [
  {
    title: "Secure Authentication",
    description:
      "JWT authentication with refresh token rotation and secure session handling.",
    icon: ShieldCheck,
  },
  {
    title: "Email Verification",
    description:
      "OTP-based email verification with expiry and resend support.",
    icon: Lock,
  },
  {
    title: "Session Management",
    description:
      "Manage active sessions across devices and revoke access anytime.",
    icon: Smartphone,
  },
  {
    title: "Auto Token Refresh",
    description:
      "Stay signed in securely with silent access token refresh.",
    icon: RefreshCcw,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />

        <div className="container relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
          <div className="inline-flex items-center rounded-full border bg-background px-4 py-1 text-sm text-muted-foreground shadow-sm">
            Secure Authentication System
          </div>

          <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
            Authentication Built
            <span className="text-primary">
              {" "}Securely
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            A production-ready authentication
            system with email verification,
            session management, refresh token
            rotation, and modern security
            practices.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">
            Everything You Need
          </h2>

          <p className="mt-3 text-muted-foreground">
            Built with security, scalability,
            and modern UX in mind.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map(
            (feature) => {
              const Icon =
                feature.icon;

              return (
                <Card
                  key={
                    feature.title
                  }
                  className="transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <h3 className="mb-2 text-lg font-semibold">
                      {
                        feature.title
                      }
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {
                        feature.description
                      }
                    </p>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto flex flex-col items-center px-6 py-20 text-center">
          <h2 className="text-3xl font-bold">
            Ready to get started?
          </h2>

          <p className="mt-3 max-w-xl text-muted-foreground">
            Create an account and
            experience a secure
            authentication system with
            modern features.
          </p>

          <Link
            href="/register"
            className="mt-6"
          >
            <Button size="lg">
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
