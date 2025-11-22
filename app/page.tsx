'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Define the Link data type
interface LinkData {
  id: number;
  short_code: string;
  target_url: string;
  total_clicks: number;
  last_clicked_time: string | null;
}

// --- Helper Functions and Components ---

const truncateUrl = (url: string, maxLength: number = 50) => {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
};

const formatTimestamp = (isoDate: string | null) => {
  if (!isoDate) return 'Never';
  return new Date(isoDate).toLocaleString();
};

function CreateLinkFormComponent({ onLinkCreated }: { onLinkCreated: () => void }) {
  const [targetUrl, setTargetUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic URL format validation
    try {
        new URL(targetUrl);
    } catch (e) {
        setError("Please enter a valid URL (e.g., https://example.com)");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target_url: targetUrl, 
          custom_code: customCode 
        }),
      });

      if (response.status === 409) {
        // Handle 409 Conflict (Duplicate Code) - Required check
        const data = await response.json();
        setError(data.error); 
      } else if (response.ok) {
        // Handle 201 Success
        const data: LinkData = await response.json();
        setSuccess(`Link created! Short code: ${data.short_code}`);
        setTargetUrl('');
        setCustomCode('');
        onLinkCreated(); 
      } else {
        setError('An unexpected server error occurred.');
      }
    } catch (err) {
      setError('Network connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-xl rounded-xl w-full max-w-2xl border border-zinc-200">
      <h2 className="text-xl font-bold text-zinc-800 mb-4">Create New TinyLink</h2>
      
      {/* Target URL Input */}
      <div className="mb-4">
        <label htmlFor="targetUrl" className="block text-sm font-medium text-zinc-700 mb-1">
          Long URL
        </label>
        <input
          id="targetUrl"
          type="text"
          value={targetUrl}
          onChange={(e) => {
            setTargetUrl(e.target.value);
            setError(null); 
          }}
          placeholder="https://www.example.com/very-long-path"
          required
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
        />
      </div>

      {/* Custom Code Input */}
      <div className="mb-6">
        <label htmlFor="customCode" className="block text-sm font-medium text-zinc-700 mb-1">
          Custom Code (Optional, 6-8 alphanumeric chars)
        </label>
        <input
          id="customCode"
          type="text"
          value={customCode}
          onChange={(e) => {
            // Enforce the rule: Codes follow [A-Za-z0-9]{6,8}.
            const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').substring(0, 8);
            setCustomCode(value);
            setError(null); 
          }}
          placeholder="e.g., docs"
          className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150"
        />
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          **Error:** {error}
        </div>
      )}
      {success && (
        <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
          **Success!** Short link: <a href={`${window.location.origin}/${success.split(': ')[1]}`} target="_blank" className="font-mono underline text-green-800">{success.split(': ')[1]}</a>
          <div className="mt-2 text-xs">
            <Link 
                href={`/code/${success.split(': ')[1]}`} 
                className="font-semibold text-blue-600 hover:text-blue-700 underline" 
            >
                View Stats Page
            </Link>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !targetUrl}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors duration-200 ${
          loading || !targetUrl
            ? 'bg-blue-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 shadow-md'
        }`}
      >
        {loading ? 'Creating...' : 'Shorten URL'}
      </button>
    </form>
  );
}

// --- Main Dashboard Component ---

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      // Calls GET /api/links
      const response = await fetch('/api/links');
      if (response.ok) {
        const data: LinkData[] = await response.json();
        setLinks(data);
      } else {
        setError('Failed to load links from the server.');
      }
    } catch (err) {
      setError('Network error while fetching links.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    // NOTE: In a production app, use a custom modal for confirmation!
    if (!window.confirm(`Are you sure you want to delete the link: /${code}? This action cannot be undone.`)) {
        return;
    }
    
    try {
        // Calls DELETE /api/links/:code
        const response = await fetch(`/api/links/${code}`, {
            method: 'DELETE',
        });

        if (response.status === 204) {
            // 204 No Content is success
            fetchLinks(); 
        } else {
            alert('Failed to delete link or link was already deleted.'); 
        }
    } catch (err) {
        alert('Network error during deletion.');
    }
  };

  const copyShortUrl = (code: string) => {
    const shortUrl = `${window.location.origin}/${code}`;
    const tempInput = document.createElement('input');
    tempInput.value = shortUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Short URL copied to clipboard!');
  };


  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        {/* Header/Title */}
        <header className="mb-8 text-center sm:text-left max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-blue-600 rounded-lg p-2 inline-block">TinyLink Dashboard</h1>
            <p className="text-lg text-zinc-500 mt-2">Table of all links, their statistics, and actions.</p>
        </header>

        {/* Link Creation Form */}
        <div className="mb-10 flex justify-center">
            <CreateLinkFormComponent onLinkCreated={fetchLinks} />
        </div>

        {/* Link Table */}
        <section className="p-6 bg-white shadow-2xl rounded-xl border border-zinc-200 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-zinc-800 mb-4">All Links</h2>
            
            {/* States: Loading, Error, Empty */}
            {loading && <div className="text-center py-8 text-blue-500">Loading links...</div>}
            {error && <div className="text-center py-8 text-red-500">Error: {error}</div>}
            {!loading && !error && links.length === 0 && (
                <div className="text-center py-8 text-zinc-500">No links created yet. Start shortening URLs!</div>
            )}

            {/* Table Content */}
            {!loading && links.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200">
                        <thead className="bg-zinc-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider rounded-tl-lg">
                                    Short Code
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                                    Target URL
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                                    Clicks
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider">
                                    Last Clicked
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-600 uppercase tracking-wider rounded-tr-lg">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-zinc-200">
                            {links.map((link) => (
                                <tr key={link.id} className="hover:bg-blue-50/50 transition duration-100">
                                    {/* Short Code (Linked to Stats page) */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                        <Link href={`/code/${link.short_code}`} className="font-mono hover:underline">
                                            {link.short_code}
                                        </Link>
                                    </td>
                                    {/* Target URL (Truncated with Ellipsis) */}
                                    <td className="px-4 py-4 text-sm text-zinc-700 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={link.target_url}>
                                        {truncateUrl(link.target_url)}
                                    </td>
                                    {/* Total Clicks */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-500">
                                        {link.total_clicks}
                                    </td>
                                    {/* Last Clicked Time */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-zinc-500">
                                        {formatTimestamp(link.last_clicked_time)}
                                    </td>
                                    {/* Actions: Copy and Delete */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                        <button
                                            onClick={() => copyShortUrl(link.short_code)}
                                            className="text-indigo-600 hover:text-indigo-900 text-xs font-semibold p-2 rounded-md bg-indigo-100/70 hover:bg-indigo-100 transition shadow-sm"
                                        >
                                            Copy
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link.short_code)}
                                            className="text-red-600 hover:text-red-900 text-xs font-semibold p-2 rounded-md bg-red-100/70 hover:bg-red-100 transition shadow-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    </div>
  );
}