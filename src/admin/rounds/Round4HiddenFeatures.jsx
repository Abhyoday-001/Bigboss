import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Edit2, Trash2, CheckCircle, RefreshCw, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';
import adminRoundService from '../services/adminRoundService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusBadge from '../components/StatusBadge';

export function Round4HiddenFeatures() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal state
  const [isEditing, setIsEditing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState({
    id: null,
    title: '',
    description: '',
    category: 'required',
    points: 25,
    revealed: false,
  });

  // Delete modal state
  const [featureToDelete, setFeatureToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await adminRoundService.getHiddenFeatures();
      setFeatures(list);
    } catch (err) {
      console.error(err);
      setError('Failed to load hidden features.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentFeature({
      id: null,
      title: '',
      description: '',
      category: 'required',
      points: 20,
      revealed: false,
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (feat) => {
    setIsEditing(true);
    setCurrentFeature({ ...feat });
    setShowFormModal(true);
  };

  const handleSaveFeature = async (e) => {
    e.preventDefault();
    if (!currentFeature.title.trim()) {
      alert('Feature title is required.');
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing && currentFeature.id) {
        await adminRoundService.updateHiddenFeature(currentFeature.id, currentFeature);
      } else {
        await adminRoundService.createHiddenFeature(currentFeature);
      }
      setShowFormModal(false);
      await loadData();
    } catch (err) {
      alert('Failed to save feature: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleReveal = async (id, currentRevealed) => {
    try {
      const nextState = !currentRevealed;
      await adminRoundService.toggleFeatureReveal(id, nextState);
      setFeatures((prev) =>
        prev.map((f) => (f.id === id ? { ...f, revealed: nextState, revealedAt: nextState ? new Date().toISOString() : null } : f))
      );
    } catch (err) {
      alert('Error updating reveal state: ' + err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!featureToDelete) return;
    setSubmitting(true);
    try {
      await adminRoundService.deleteHiddenFeature(featureToDelete.id);
      setFeatureToDelete(null);
      await loadData();
    } catch (err) {
      alert('Failed to delete feature: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#1EA7FF] mb-3" />
        <p className="font-mono text-xs uppercase tracking-widest">Loading Hidden Requirements Chamber...</p>
      </div>
    );
  }

  const revealedCount = features.filter((f) => f.revealed).length;
  const totalPoints = features.reduce((sum, f) => sum + (f.points || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#1EA7FF] font-semibold">
            Round 4 Controls // Finale Spec Injection
          </span>
          <h2 className="text-2xl font-black tracking-wide text-white mt-1">
            <span className="text-[#1EA7FF] font-mono">[ </span>
            HIDDEN FEATURE MANAGEMENT
            <span className="text-[#1EA7FF] font-mono"> ]</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Add and reveal website feature requirements. Revealed features immediately appear on participant build dashboards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#1EA7FF] hover:bg-[#4FC3FF] text-[#050506] rounded-lg transition-all shadow-[0_0_15px_rgba(30,167,255,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Add Feature Spec
          </button>
          <button
            onClick={loadData}
            className="p-2 text-gray-400 hover:text-white border border-gray-800 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-[#FF3B4E]" />
          {error}
        </div>
      )}

      {/* Feature Metrics Banner */}
      <div className="p-5 bg-[#0d0f14] border border-gray-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-950/40 text-[#1EA7FF] border border-blue-900/40">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-gray-400 uppercase">Total Specifications:</span>
            <span className="text-lg font-bold text-white block">{features.length} Features Loaded</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-950/40 text-[#2ED67B] border border-emerald-900/40">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-gray-400 uppercase">Revealed to Teams:</span>
            <span className="text-lg font-bold text-[#2ED67B] block">
              {revealedCount} of {features.length} Unlocked
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-950/40 text-purple-400 border border-purple-900/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-gray-400 uppercase">Maximum Available Points:</span>
            <span className="text-lg font-bold text-purple-300 block">{totalPoints} Points</span>
          </div>
        </div>
      </div>

      {/* Features List Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Feature Catalog & Live Reveal Toggles
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {features.map((feat) => {
            const isRevealed = feat.revealed;

            return (
              <div
                key={feat.id}
                className={`p-5 bg-[#0d0f14] border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
                  isRevealed
                    ? 'border-[#1EA7FF]/40 shadow-[0_0_15px_rgba(30,167,255,0.1)]'
                    : 'border-gray-800 opacity-90'
                }`}
              >
                {/* Feature Description */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                        feat.category === 'required'
                          ? 'bg-blue-950/60 text-[#1EA7FF] border-[#1EA7FF]/40'
                          : 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                      }`}
                    >
                      {feat.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#2ED67B]">
                      +{feat.points} Pts
                    </span>
                    {isRevealed ? (
                      <StatusBadge status="immune" text="UNLOCKED & REVEALED" />
                    ) : (
                      <StatusBadge status="nominated" text="HIDDEN SECRET" />
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white tracking-wide">{feat.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{feat.description}</p>

                  {feat.revealedAt && (
                    <span className="text-[10px] font-mono text-gray-500 block pt-1">
                      Revealed timestamp: {new Date(feat.revealedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {/* Actions / Toggles */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggleReveal(feat.id, isRevealed)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                      isRevealed
                        ? 'bg-[#050506] hover:bg-gray-800 text-gray-300 border border-gray-700'
                        : 'bg-[#1EA7FF] hover:bg-[#4FC3FF] text-[#050506] shadow-[0_0_15px_rgba(30,167,255,0.3)]'
                    }`}
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Conceal Feature
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Reveal Live to Teams
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(feat)}
                    className="p-2 text-gray-400 hover:text-white bg-[#050506] hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors"
                    title="Edit Feature"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setFeatureToDelete(feat)}
                    className="p-2 text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/50 border border-red-900/40 rounded-lg transition-colors"
                    title="Delete Feature"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Feature Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0d0f14] border border-gray-800 rounded-xl shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white tracking-wide mb-4">
              <span className="text-[#1EA7FF] font-mono">[ </span>
              {isEditing ? 'EDIT HIDDEN SPECIFICATION' : 'NEW HIDDEN SPECIFICATION'}
              <span className="text-[#1EA7FF] font-mono"> ]</span>
            </h3>

            <form onSubmit={handleSaveFeature} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Feature Requirement Title
                </label>
                <input
                  type="text"
                  required
                  value={currentFeature.title}
                  onChange={(e) => setCurrentFeature({ ...currentFeature, title: e.target.value })}
                  placeholder="e.g. WebSocket Live Ticker Component"
                  className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Detailed Implementation Specs
                </label>
                <textarea
                  rows={3}
                  required
                  value={currentFeature.description}
                  onChange={(e) => setCurrentFeature({ ...currentFeature, description: e.target.value })}
                  placeholder="Specify exact behavior, animations, API contracts..."
                  className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Category</label>
                  <select
                    value={currentFeature.category}
                    onChange={(e) => setCurrentFeature({ ...currentFeature, category: e.target.value })}
                    className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="required">Required (Core)</option>
                    <option value="bonus">Bonus / Stretch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Points Value</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={currentFeature.points}
                    onChange={(e) => setCurrentFeature({ ...currentFeature, points: Number(e.target.value) })}
                    className="w-full bg-[#050506] border border-gray-800 focus:border-[#1EA7FF] rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="revealedCheckbox"
                  checked={currentFeature.revealed}
                  onChange={(e) => setCurrentFeature({ ...currentFeature, revealed: e.target.checked })}
                  className="rounded border-gray-700 text-[#1EA7FF] focus:ring-0"
                />
                <label htmlFor="revealedCheckbox" className="text-xs text-gray-300 font-mono">
                  Immediately reveal to participant dashboards on save
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#1EA7FF] hover:bg-[#4FC3FF] text-[#050506] rounded-lg shadow-[0_0_15px_rgba(30,167,255,0.3)]"
                >
                  {submitting ? 'Saving...' : 'Save Specification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(featureToDelete)}
        onClose={() => setFeatureToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="DELETE FEATURE SPECIFICATION"
        message={`Are you sure you want to delete "${featureToDelete?.title}"? Any points or grading associated with this feature will be affected.`}
        confirmText="Delete Feature"
        isDestructive={true}
        isLoading={submitting}
      />
    </div>
  );
}

export default Round4HiddenFeatures;
