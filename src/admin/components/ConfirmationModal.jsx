import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmationModal
 * Handles high-stakes and destructive admin actions per PRD.md §7 & DESIGN.md §6
 * Includes bracket-motif header treatment and danger styling.
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0d0f14] border border-gray-800 rounded-xl shadow-2xl p-6 relative overflow-hidden transition-all"
        style={{
          boxShadow: isDestructive
            ? '0 0 25px rgba(255, 59, 78, 0.25)'
            : '0 0 25px rgba(30, 167, 255, 0.2)',
          borderColor: isDestructive ? 'rgba(255, 59, 78, 0.4)' : 'rgba(30, 167, 255, 0.4)',
        }}
      >
        {/* Top glow accent line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isDestructive ? 'bg-[#FF3B4E]' : 'bg-[#1EA7FF]'
          }`}
        />

        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {isDestructive ? (
              <div className="p-2 rounded-lg bg-red-950/50 text-[#FF3B4E] border border-red-800/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-blue-950/50 text-[#1EA7FF] border border-blue-800/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <h3
              className={`text-lg font-bold tracking-wide ${
                isDestructive ? 'text-[#FF3B4E]' : 'text-[#F2F3F5]'
              }`}
            >
              <span className="text-gray-400 font-mono">[ </span>
              {title}
              <span className="text-gray-400 font-mono"> ]</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm text-gray-300 mb-6 leading-relaxed">
          {message}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800/60 hover:bg-gray-800 rounded-lg transition-colors border border-gray-700/50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              isDestructive
                ? 'bg-[#FF3B4E] hover:bg-red-600 text-white shadow-[0_0_15px_rgba(255,59,78,0.4)]'
                : 'bg-[#1EA7FF] hover:bg-[#4FC3FF] text-[#050506] shadow-[0_0_15px_rgba(30,167,255,0.4)]'
            }`}
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
