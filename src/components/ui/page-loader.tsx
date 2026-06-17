// components/ui/page-loader.tsx
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-4 animate-pulse p-8">
        <div className="h-8 bg-muted rounded w-1/2 mx-auto" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  );
}