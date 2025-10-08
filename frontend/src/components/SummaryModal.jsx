import React from "react";

const SummaryModal = ({ isOpen, onClose, summary, loading, messageCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-gray-600 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Chat Summary
            {messageCount && (
              <span className="text-sm text-gray-300 ml-2">
                ({messageCount} messages analyzed)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] bg-black/10 rounded-xl p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
              <span className="ml-2 text-gray-300">Generating summary...</span>
            </div>
          ) : summary ? (
            <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
              {summary}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No summary available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-violet-600/80 text-white rounded-lg hover:bg-violet-700/90 transition-colors backdrop-blur-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;