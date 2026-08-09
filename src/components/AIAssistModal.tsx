import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight, Check, RefreshCw, Wand2 } from 'lucide-react';
import { CollageItem } from '../types';

interface AIAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGeneratedItem: (item: Omit<CollageItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AIAssistModal: React.FC<AIAssistModalProps> = ({
  isOpen,
  onClose,
  onAddGeneratedItem,
}) => {
  const [topic, setTopic] = useState('');
  const [action, setAction] = useState<'generate' | 'summarize'>('generate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setGeneratedData(null);

    try {
      const res = await fetch('/api/ai/article-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicOrUrl: topic.trim(), action }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setGeneratedData(json.data);
      } else {
        setError(json.error || 'Failed to generate content via Gemini.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error connecting to Gemini AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!generatedData) return;

    const newItem: Omit<CollageItem, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'article',
      title: generatedData.title || topic,
      category: generatedData.category || 'Design & Editorial',
      tags: generatedData.tags || ['AI Generated', 'Editorial'],
      summary: generatedData.summary || '',
      content: generatedData.content || '',
      author: generatedData.author || 'AI Studio Curator',
      readTimeMinutes: generatedData.readTimeMinutes || 3,
      coverImageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1000&auto=format&fit=crop',
      pinned: true,
      rotationDegrees: Math.floor(Math.random() * 7) - 3,
    };

    onAddGeneratedItem(newItem);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl overflow-hidden text-[#1A1F2B] my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#EBF8FF] border border-[#BEE3F8] flex items-center justify-center text-[#4A90E2]">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1A1F2B]">
                  Gemini AI Article Curator
                </h2>
                <p className="text-xs text-[#64748B]">
                  Generate editorial articles & summaries for your collage
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#64748B] hover:text-[#1A1F2B] hover:bg-[#F1F5F9] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Action selector */}
            <div className="flex p-1 bg-[#F1F5F9] rounded-2xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setAction('generate')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  action === 'generate'
                    ? 'bg-white text-[#4A90E2] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1A1F2B]'
                }`}
              >
                ✨ Write Article Draft from Topic
              </button>
              <button
                type="button"
                onClick={() => setAction('summarize')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  action === 'summarize'
                    ? 'bg-white text-[#4A90E2] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1A1F2B]'
                }`}
              >
                📝 Extract Hook from Text
              </button>
            </div>

            {/* Prompt input */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">
                {action === 'generate'
                  ? 'Describe a topic, trend, or theme'
                  : 'Paste article text or notes'}
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={
                  action === 'generate'
                    ? 'e.g. Japanese Wabi-Sabi interior architecture, sustainable material craft, or jazz revival in modern vinyl bars'
                    : 'Paste article paragraphs here...'
                }
                className="w-full px-3 py-2 text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] focus:outline-none focus:border-[#4A90E2]"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#4A90E2] to-[#7B61FF] hover:opacity-95 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Curating with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Article Snippet</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* Generated Preview Card */}
            {generatedData && (
              <div className="p-4 bg-[#F8FAFC] border border-[#BEE3F8] rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs text-[#4A90E2] font-semibold">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> AI Draft Preview
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#EBF8FF] border border-[#BEE3F8] rounded-full">
                    {generatedData.category || 'Editorial'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-[#1A1F2B]">
                  {generatedData.title}
                </h3>

                {generatedData.summary && (
                  <p className="text-xs text-[#475569] italic border-l-2 border-[#4A90E2] pl-2 font-medium">
                    "{generatedData.summary}"
                  </p>
                )}

                {generatedData.content && (
                  <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed">
                    {generatedData.content}
                  </p>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="px-4 py-2 bg-gradient-to-r from-[#4A90E2] to-[#7B61FF] hover:opacity-95 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" /> Add to Collage Board
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
