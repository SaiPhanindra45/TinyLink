import Link from 'next/link';

// This component handles 404 errors for pages, and is specifically triggered 
// when the StatsPage calls notFound() for a non-existent link code.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-6xl font-extrabold text-red-600">404</h1>
      <h2 className="text-3xl font-semibold text-zinc-800 mt-4">Link Not Found</h2>
      <p className="text-lg text-zinc-600 mt-2">
        We couldn't find a TinyLink matching this short code. It may have been deleted.
      </p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}