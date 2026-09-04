import React, { useState } from 'react';
import { Download, Copy, Check, X, Camera, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface ExportModalProps {
  imageSrc: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ imageSrc, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleDownload = () => {
    sound.playCameraShutter();
    const link = document.createElement('a');
    link.download = `gacha-studio-${Date.now()}.png`;
    link.href = imageSrc;
    link.click();
  };

  const handleCopy = async () => {
    try {
      sound.playClick();
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-200 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-pink-600" />
            <h3 className="font-extrabold text-lg text-zinc-900" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Export PNG Snapshot
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-pink-200 bg-zinc-950 flex items-center justify-center max-h-[360px]">
          <img
            src={imageSrc}
            alt="Gacha Studio Snapshot"
            className="w-full h-auto object-contain max-h-[340px]"
          />
          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/90">
            PNG High Quality
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
          </button>

          <button
            id="btn-confirm-download"
            onClick={handleDownload}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-pink-200 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
