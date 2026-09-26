import React from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-lg bg-[#0d0f14] border ${
          isDanger ? 'border-danger-red/60 shadow-glow-red' : 'border-accent-blue/40 shadow-glow-blue'
        } rounded-xl p-6 text-text-primary shadow-2xl transition-all`}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-lg flex-shrink-0 ${
            isDanger ? 'bg-danger-red/10 text-danger-red border border-danger-red/30' :
            isWarning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
            'bg-accent-blue/10 text-accent-blue border border-accent-blue/30'
          }`}>
            {isDanger ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-wide text-text-primary font-sans flex items-center gap-2">
              <span className="text-accent-blue">[CONFIRM]</span> {title}
            </h3>
            <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Warning Banner for Destructive Actions */}
        {isDanger && (
          <div className="mb-5 p-3 rounded-lg bg-danger-red/10 border border-danger-red/20 text-xs text-danger-red flex items-center gap-2 font-mono">
            <span className="font-bold">⚠️ CRITICAL:</span> This operation will immediately affect all live participants and cannot be undone.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-bg-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary bg-[#161a23] hover:bg-[#1f2430] border border-bg-border transition-all disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isDanger
                ? 'bg-danger-red hover:bg-red-600 text-white shadow-glow-red'
                : isWarning
                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                : 'bg-accent-blue hover:bg-sky-400 text-black font-bold shadow-glow-blue'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
