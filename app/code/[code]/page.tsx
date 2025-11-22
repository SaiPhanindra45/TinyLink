'use client';
import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Define the Link data type
interface LinkData {
  id: number;
  short_code: string;
  target_url: string;
  total_clicks: number;
  last_clicked_time: string | null;
  createdAt: string;
}

// Converts ISO date string to a human-readable format
const formatTimestamp = (isoDate: string | null) => {
  if (!isoDate) return 'Never';
  return new Date(isoDate).toLocaleString();
};

export default function StatsPage({ params }: { params: { code: string } }) {
  const { code } = params;
  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Calls GET /api/links/:code
        const response = await fetch(`/api/links/${code}`);
        if (response.status === 404) {
          // If the link is not found, trigger the not-found page
          notFound(); 
          return;
        }
        if (response.ok) {
          const data: LinkData = await response.json();
          setLinkData(data);
        } else {
          setError('Failed to load stats.');
        }
      } catch (err) {
        setError('Network error while fetching stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [code]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-blue-600">Loading statistics for /{code}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-xl border border-red-200">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-lg text-red-800">{error}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Displaying the statistics
  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block font-medium">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold text-zinc-800 break-words">
            Stats for: <span className="font-mono text-blue-600">/{linkData?.short_code}</span>
          </h1>
        </header>

        <section className="p-8 bg-white shadow-2xl rounded-xl border border-zinc-200 space-y-6">
          {/* Target URL */}
          <div>
            <h2 className="text-lg font-semibold text-zinc-600">Target URL</h2>
            <p className="text-blue-800 text-xl break-all font-mono mt-1">
              {linkData?.target_url}
            </p>
          </div>

          {/* Total Clicks Card */}
          <div className="p-5 bg-indigo-100 rounded-lg border border-indigo-300">
            <h2 className="text-2xl font-bold text-indigo-800">Total Clicks</h2>
            <p className="text-4xl font-extrabold text-indigo-900 mt-1">
              {linkData?.total_clicks}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="p-4 bg-zinc-100 rounded-lg border border-zinc-200">
              <h3 className="text-sm font-semibold text-zinc-600">Created At</h3>
              <p className="text-base text-zinc-800 mt-1">{formatTimestamp(linkData?.createdAt || null)}</p>
            </div>
            <div className="p-4 bg-zinc-100 rounded-lg border border-zinc-200">
              <h3 className="text-sm font-semibold text-zinc-600">Last Clicked</h3>
              <p className="text-base text-zinc-800 mt-1">{formatTimestamp(linkData?.last_clicked_time || null)}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}