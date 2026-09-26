import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Globe, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import StatusBadge from '../components/StatusBadge';

export function Round4Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await adminRoundService.getSubmissions();
      setSubmissions(list);
    } catch (err) {
      console.error(err);
      setError('Failed to load team project submissions.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1EA7FF] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Collecting Final Builds...</p>
      </div>
    );
  }

  const filteredSubmissions = submissions.filter((s) =>
    (s.teamName || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1EA7FF] font-semibold">
            Round 4 Controls // Finale Deliverables
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#1EA7FF] font-mono">[ </span>
            TEAM SUBMISSIONS REPOSITORY
            <span className="text-[#1EA7FF] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Review final vibe-coded website deliverables, source code repositories, and deployed live preview URLs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-[#0d0f14] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Submissions
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 bg-[#0d0f14] border border-gray-800 rounded-xl flex items-center justify-between gap-4">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Search by team name..."
          className="bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 w-full max-w-xs focus:outline-none"
        />

        <span className="text-xs font-mono text-gray-400">
          Showing <strong className="text-white">{filteredSubmissions.length}</strong> submitted builds
        </span>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center bg-[#0d0f14] border border-gray-800 rounded-xl text-gray-400 text-xs">
            No submissions matched your filter. Final builds will populate as teams submit from their portal.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-[#0d0f14] border border-gray-800 hover:border-gray-700 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
              >
                {/* Team Info & Timestamps */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white tracking-wide">{sub.teamName}</h3>
                    <StatusBadge status="safe" text="SUBMITTED" />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#1EA7FF]" />
                      Submitted: {new Date(sub.submittedAt).toLocaleTimeString()} (
                      {new Date(sub.submittedAt).toLocaleDateString()})
                    </span>
                  </div>
                </div>

                {/* Build URLs & External Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {sub.repoUrl && (
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#050506] hover:bg-gray-800 border border-gray-700 text-xs font-mono text-gray-200 transition-colors"
                    >
                      <Github className="w-4 h-4 text-gray-400" />
                      Source Code
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </a>
                  )}

                  {sub.liveDemoUrl && (
                    <a
                      href={sub.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1EA7FF]/15 hover:bg-[#1EA7FF]/25 border border-[#1EA7FF]/40 text-xs font-bold text-[#1EA7FF] transition-all shadow-[0_0_15px_rgba(30,167,255,0.2)]"
                    >
                      <Globe className="w-4 h-4" />
                      Live Demo Website
                      <ExternalLink className="w-3 h-3 text-[#1EA7FF]" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Round4Submissions;
