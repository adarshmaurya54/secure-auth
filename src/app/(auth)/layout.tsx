export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container relative flex min-h-screen items-center justify-center px-4">
        {/* Background blur effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[-10%] top-[10%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-[-10%] bottom-[10%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* Auth Card Container */}
        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>
    </main>
  );
}