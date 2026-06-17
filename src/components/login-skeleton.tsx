// components/login-skeleton.tsx
export default function LoginSkeleton() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-sm border rounded-xl p-8 space-y-4 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto" />
        <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto" />
        <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}