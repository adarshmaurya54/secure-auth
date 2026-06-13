export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container relative flex min-h-screen items-center justify-center px-4">
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />

        {/* Auth Card Container */}
        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>
    </main>
  );
}