import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contracts/AuthContext';
import { fetchSubmissionStatus, submitFinalBuild, SubmissionStatusResponse, HttpError } from '../../contracts/mockApi';

export const Round4Submission: React.FC = () => {
  const { team } = useAuth();
  const [data, setData] = useState<SubmissionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HttpError | null>(null);
  
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!team) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchSubmissionStatus(team.id);
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) setError(err instanceof HttpError ? err : new HttpError(500, 'Unknown error'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !url) return;
    
    // Basic URL validation
    try {
      new URL(url);
    } catch (_) {
      alert("Please enter a valid URL (e.g., https://github.com/...)");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFinalBuild(team.id, url);
      setData({ submitted: true, url, status: 'SUBMITTED' });
    } catch (err) {
      alert('Failed to transmit deployment vector. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-accent-blue">
        <div className="w-6 h-6 rounded-full border-2 border-accent-blue border-t-transparent animate-spin mr-3"></div>
        <span className="uppercase tracking-widest text-sm">Initializing Submission Protocol...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="panel border-danger-red/50 text-center">
        <h2 className="text-danger-red mb-2">COMMUNICATION FAILURE</h2>
        <p className="text-sm text-text-secondary">{error?.message}</p>
      </div>
    );
  }

  if (data.submitted) {
    return (
      <div className="flex flex-col items-center">
        <div className="bracket-frame mb-8">
          <h2 className="text-3xl text-success-green font-display tracking-widest text-center">TRANSMISSION SUCCESSFUL</h2>
        </div>
        
        <div className="panel max-w-xl w-full border-success-green/30 text-center">
          <div className="w-16 h-16 rounded-full border border-success-green flex items-center justify-center mx-auto mb-6 shadow-glow">
            <svg className="w-8 h-8 text-success-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          
          <h3 className="uppercase tracking-widest text-text-primary mb-2">Build Submitted</h3>
          <p className="text-text-secondary font-body mb-6 text-sm">
            The Judges Panel has received your deployment vector.
          </p>
          
          <div className="bg-bg-primary rounded p-4 border border-accent-blue/20 text-left">
            <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Provided URL:</div>
            <a href={data.url} target="_blank" rel="noreferrer" className="text-accent-blue hover:underline break-all">
              {data.url}
            </a>
            
            <div className="mt-4 text-xs uppercase tracking-widest text-text-secondary mb-1">Status:</div>
            <div className="font-bold text-accent-blue">{data.status?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bracket-frame mb-8">
        <h2 className="text-3xl text-text-primary font-display tracking-widest text-center">FINAL BUILD SUBMISSION</h2>
      </div>

      <div className="panel max-w-xl w-full border-accent-blue/30 shadow-glow relative">
        <div className="absolute top-0 right-0 w-16 h-16 bg-accent-blue/5 border-b border-l border-accent-blue/20 rounded-bl-3xl pointer-events-none"></div>
        
        <p className="text-text-secondary font-body mb-8">
          Submit the final deployment URL for your project. Ensure the application is live and accessible.
          <br /><br />
          <strong className="text-danger-red uppercase tracking-widest text-xs">Warning:</strong> Once submitted, you cannot change this URL.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-xs uppercase tracking-widest text-accent-blue mb-2 font-bold">
              Deployment Vector (URL)
            </label>
            <input
              type="url"
              id="url"
              required
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-bg-primary border border-accent-blue/50 rounded p-3 text-text-primary outline-none focus:border-accent-blue-glow focus:shadow-glow transition-all font-body"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-accent-blue/20">
            <button 
              type="submit" 
              className="btn-primary w-full sm:w-auto"
              disabled={isSubmitting || !url}
            >
              {isSubmitting ? 'TRANSMITTING...' : 'INITIATE TRANSFER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
