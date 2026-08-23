import React, { useRef, useState } from 'react';
import {
  Award, Download, CheckCircle, ShieldCheck, Lock, Star,
  Sparkles, ArrowRight, Trophy, BookOpen, Target
} from 'lucide-react';
import { jsPDF } from "jspdf";

interface CertificateGeneratorProps {
  userName?: string;
  completionDate?: string;
  isSample?: boolean;
  totalLessons?: number;
  completedLessons?: number;
  onStartLearning?: () => void;
}

const CERT_WIDTH = 1000;
const CERT_HEIGHT = 700;

const buildSvgString = (userName: string, completionDate: string, isSample: boolean) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${CERT_WIDTH}" height="${CERT_HEIGHT}" viewBox="0 0 ${CERT_WIDTH} ${CERT_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020817"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="blue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="nameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${CERT_WIDTH}" height="${CERT_HEIGHT}" fill="url(#bg)"/>

  <!-- Decorative corner glow -->
  <circle cx="0" cy="0" r="300" fill="#3b82f6" opacity="0.04"/>
  <circle cx="${CERT_WIDTH}" cy="${CERT_HEIGHT}" r="300" fill="#8b5cf6" opacity="0.04"/>

  <!-- Outer gold border -->
  <rect x="16" y="16" width="${CERT_WIDTH - 32}" height="${CERT_HEIGHT - 32}" fill="none" stroke="url(#gold)" stroke-width="3" rx="16"/>
  <!-- Inner blue border -->
  <rect x="28" y="28" width="${CERT_WIDTH - 56}" height="${CERT_HEIGHT - 56}" fill="none" stroke="url(#blue)" stroke-width="1" rx="10" opacity="0.5"/>

  <!-- Corner ornaments -->
  <path d="M40 40 L80 40 L80 44 L44 44 L44 80 L40 80 Z" fill="url(#gold)" opacity="0.9"/>
  <path d="M${CERT_WIDTH - 40} 40 L${CERT_WIDTH - 80} 40 L${CERT_WIDTH - 80} 44 L${CERT_WIDTH - 44} 44 L${CERT_WIDTH - 44} 80 L${CERT_WIDTH - 40} 80 Z" fill="url(#gold)" opacity="0.9"/>
  <path d="M40 ${CERT_HEIGHT - 40} L80 ${CERT_HEIGHT - 40} L80 ${CERT_HEIGHT - 44} L44 ${CERT_HEIGHT - 44} L44 ${CERT_HEIGHT - 80} L40 ${CERT_HEIGHT - 80} Z" fill="url(#gold)" opacity="0.9"/>
  <path d="M${CERT_WIDTH - 40} ${CERT_HEIGHT - 40} L${CERT_WIDTH - 80} ${CERT_HEIGHT - 40} L${CERT_WIDTH - 80} ${CERT_HEIGHT - 44} L${CERT_WIDTH - 44} ${CERT_HEIGHT - 44} L${CERT_WIDTH - 44} ${CERT_HEIGHT - 80} L${CERT_WIDTH - 40} ${CERT_HEIGHT - 80} Z" fill="url(#gold)" opacity="0.9"/>

  <!-- Stars decoration -->
  <text x="500" y="90" font-family="serif" font-size="22" fill="#f59e0b" text-anchor="middle" opacity="0.7">★ ★ ★ ★ ★</text>

  <!-- Ecorp Academy header -->
  <text x="500" y="135" font-family="monospace" font-size="13" fill="#64748b" text-anchor="middle" letter-spacing="6">ECORP ACADEMY</text>

  <!-- Main Title -->
  <text x="500" y="200" font-family="serif" font-size="42" fill="#f8fafc" font-weight="bold" text-anchor="middle" letter-spacing="3" filter="url(#glow)">CERTIFICATE</text>
  <text x="500" y="248" font-family="serif" font-size="22" fill="#94a3b8" text-anchor="middle" letter-spacing="8">OF COMPLETION</text>

  <!-- Divider line -->
  <line x1="200" y1="268" x2="800" y2="268" stroke="url(#gold)" stroke-width="1" opacity="0.5"/>

  <!-- "This certifies that" -->
  <text x="500" y="310" font-family="sans-serif" font-size="15" fill="#94a3b8" text-anchor="middle" letter-spacing="1">This is to certify that</text>

  <!-- Name -->
  <text x="500" y="390" font-family="serif" font-size="52" fill="url(#nameGrad)" font-weight="bold" text-anchor="middle" filter="url(#glow)">${isSample ? 'Your Name Here' : userName}</text>

  <!-- Underline for name -->
  <line x1="200" y1="408" x2="800" y2="408" stroke="url(#blue)" stroke-width="1.5" opacity="0.6"/>

  <!-- "has successfully completed" -->
  <text x="500" y="445" font-family="sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">has successfully completed the comprehensive training curriculum in</text>

  <!-- Course name -->
  <text x="500" y="488" font-family="serif" font-size="26" fill="#f8fafc" font-weight="bold" text-anchor="middle">Advanced Prompt Engineering &amp; AI Systems</text>

  <!-- Course details -->
  <text x="500" y="520" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">including 10 interactive modules · 5 graded missions · red-teaming CTF lab validation</text>

  <!-- Gold separator -->
  <line x1="150" y1="548" x2="850" y2="548" stroke="url(#gold)" stroke-width="1" opacity="0.3"/>

  <!-- Badges row -->
  <rect x="180" y="562" width="110" height="24" rx="12" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1"/>
  <text x="235" y="578" font-family="sans-serif" font-size="10" fill="#60a5fa" text-anchor="middle" font-weight="bold">✓ 10 LESSONS</text>

  <rect x="305" y="562" width="110" height="24" rx="12" fill="#1a3a2a" stroke="#22c55e" stroke-width="1"/>
  <text x="360" y="578" font-family="sans-serif" font-size="10" fill="#4ade80" text-anchor="middle" font-weight="bold">✓ 5 MISSIONS</text>

  <rect x="430" y="562" width="120" height="24" rx="12" fill="#2d1b69" stroke="#8b5cf6" stroke-width="1"/>
  <text x="490" y="578" font-family="sans-serif" font-size="10" fill="#a78bfa" text-anchor="middle" font-weight="bold">✓ CTF LAB</text>

  <rect x="565" y="562" width="130" height="24" rx="12" fill="#3d1f00" stroke="#f59e0b" stroke-width="1"/>
  <text x="630" y="578" font-family="sans-serif" font-size="10" fill="#fbbf24" text-anchor="middle" font-weight="bold">✓ CERTIFIED</text>

  <!-- Bottom section -->
  <!-- Date -->
  <text x="220" y="638" font-family="sans-serif" font-size="15" fill="#f8fafc" text-anchor="middle" font-weight="bold">${isSample ? 'January 1, 2025' : completionDate}</text>
  <line x1="100" y1="648" x2="340" y2="648" stroke="#475569" stroke-width="1"/>
  <text x="220" y="664" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Date Issued</text>

  <!-- Logo center -->
  <circle cx="500" cy="635" r="28" fill="none" stroke="url(#gold)" stroke-width="2"/>
  <circle cx="500" cy="635" r="22" fill="#0f172a"/>
  <text x="500" y="643" font-family="monospace" font-size="16" fill="#f59e0b" text-anchor="middle" font-weight="bold">EA</text>

  <!-- Signature -->
  <text x="780" y="638" font-family="serif" font-size="18" fill="#f8fafc" text-anchor="middle" font-style="italic">Ecorp Academy</text>
  <line x1="660" y1="648" x2="900" y2="648" stroke="#475569" stroke-width="1"/>
  <text x="780" y="664" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Authorized Issuer</text>

  ${isSample ? `
  <!-- SAMPLE watermark -->
  <text x="500" y="380" font-family="sans-serif" font-size="110" fill="#ef4444" text-anchor="middle" opacity="0.07" font-weight="bold" transform="rotate(-30, 500, 350)">SAMPLE</text>
  ` : ''}
</svg>`;

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  userName = 'Ecorp Scholar',
  completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  isSample = false,
  totalLessons = 10,
  completedLessons = 0,
  onStartLearning,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    const svgStr = buildSvgString(userName, completionDate, isSample);
    
    // Convert SVG to data URL
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const svgDataUrl = e.target?.result as string;
      
      // Create PDF
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [CERT_WIDTH, CERT_HEIGHT]
      });
      
      // Add SVG to PDF
      doc.addImage(svgDataUrl, 'SVG', 0, 0, CERT_WIDTH, CERT_HEIGHT);
      
      // Download
      doc.save(isSample
        ? 'Ecorp_Academy_Sample_Certificate.pdf'
        : `Ecorp_Academy_Certificate_${userName.replace(/\s+/g, '_')}.pdf`);
        
      setIsDownloading(false);
    };
    
    reader.readAsDataURL(svgBlob);
  };

  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-950/20 via-slate-900/90 to-slate-950 overflow-hidden shadow-2xl">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-amber-950/60 via-yellow-900/30 to-amber-950/60 border-b border-amber-500/20 px-6 py-5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.07),transparent_70%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-900/40">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                {isSample ? 'Your Certificate Awaits' : '🎉 Congratulations!'}
              </h2>
              <p className="text-xs text-amber-300/80 font-medium">
                {isSample
                  ? `Complete all ${totalLessons} lessons to earn yours`
                  : 'You have mastered Prompt Engineering & AI Systems'}
              </p>
            </div>
          </div>
          {isSample && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 border border-slate-700 px-4 py-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">Progress</div>
                <div className="text-sm font-bold text-white">{completedLessons}/{totalLessons} Lessons</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Certificate Preview */}
        <div className="relative">
          {/* Glow effect behind cert */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 blur-xl scale-95" />

          {/* Certificate visual */}
          <div className="relative rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-[#0a0f2e] to-[#1e1b4b] overflow-hidden shadow-2xl">
            {/* Top gold border */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />

            <div className="px-6 sm:px-12 py-8 text-center relative">
              {/* Background watermark */}
              {isSample && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <span className="text-[80px] sm:text-[120px] font-black text-red-500/[0.04] rotate-[-30deg] tracking-widest">SAMPLE</span>
                </div>
              )}

              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Ecorp label */}
              <p className="text-[10px] font-mono tracking-[6px] text-slate-500 uppercase mb-1">Ecorp Academy</p>

              {/* Title */}
              <h3 className="text-xl sm:text-3xl font-black tracking-wide text-white mb-0.5">CERTIFICATE</h3>
              <p className="text-[10px] sm:text-xs tracking-[5px] text-slate-400 uppercase mb-4">of Completion</p>

              <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mx-auto mb-4" />

              <p className="text-xs text-slate-400 mb-2">This is to certify that</p>

              {/* Name */}
              <div className="relative inline-block mb-2">
                <p className={`text-2xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent ${isSample ? 'opacity-50' : ''}`}>
                  {isSample ? 'Your Name Here' : userName}
                </p>
                {isSample && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-slate-500" />
                  </div>
                )}
              </div>

              <div className="w-48 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent mx-auto mb-3" />

              <p className="text-xs text-slate-400 mb-1">has successfully completed the curriculum in</p>
              <p className="text-sm sm:text-base font-bold text-white mb-4">Advanced Prompt Engineering & AI Systems</p>

              {/* Achievement badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                {[
                  { label: '10 Lessons', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
                  { label: '5 Missions', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
                  { label: 'CTF Lab', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
                  { label: 'Certified', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
                ].map((b) => (
                  <span key={b.label} className={`rounded-full border px-3 py-0.5 text-[10px] font-bold ${b.color} ${isSample ? 'opacity-50' : ''}`}>
                    ✓ {b.label}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <div className="text-left">
                  <p className={`text-xs font-bold text-white ${isSample ? 'opacity-40' : ''}`}>
                    {isSample ? 'MM / DD / YYYY' : completionDate}
                  </p>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">Date Issued</p>
                </div>

                <div className="h-10 w-10 rounded-full border-2 border-amber-500/50 flex items-center justify-center bg-slate-950">
                  <ShieldCheck className="h-5 w-5 text-amber-400" />
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-white font-serif italic">Ecorp Academy</p>
                  <p className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">Authorized Issuer</p>
                </div>
              </div>
            </div>

            {/* Bottom gold border */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
          </div>
        </div>

        {/* Progress section (for sample) */}
        {isSample && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                Your Progress to Earning This Certificate
              </span>
              <span className="font-mono font-bold text-blue-400">{progressPercent}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{completedLessons} of {totalLessons} lessons completed</span>
              <span>{totalLessons - completedLessons} lessons remaining</span>
            </div>

            {/* What you unlock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              {[
                { icon: <Award className="h-4 w-4 text-amber-400" />, label: "Official Certificate", desc: "Downloadable PDF" },
                { icon: <Target className="h-4 w-4 text-emerald-400" />, label: "Verified Credential", desc: "Shareable badge" },
                { icon: <Sparkles className="h-4 w-4 text-purple-400" />, label: "Expert Status", desc: "Prompt Engineer" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 flex items-center gap-2">
                  {item.icon}
                  <div>
                    <p className="text-[11px] font-bold text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-900/30 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
          >
            <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            {isDownloading ? 'Generating PDF...' : isSample ? 'Download Sample Certificate (PDF)' : 'Download My Certificate (PDF)'}
          </button>

          {isSample && onStartLearning && (
            <button
              onClick={onStartLearning}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              Start Learning Now
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {isSample && (
          <p className="text-center text-[11px] text-slate-600">
            Download a sample preview now — your personalized certificate will be unlocked when you complete all lessons.
          </p>
        )}
      </div>
    </div>
  );
};
