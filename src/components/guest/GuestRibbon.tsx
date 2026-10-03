import React from "react";

interface GuestRibbonProps {
  onSignIn: () => void;
  onHowItWorks: () => void;
}

export const GuestRibbon: React.FC<GuestRibbonProps> = ({ onSignIn, onHowItWorks }) => (
  <div className="border-b border-indigo-500/15 bg-indigo-950/30 backdrop-blur-sm px-4 py-2 text-center">
    <p className="text-xs sm:text-sm text-slate-300">
      <span className="inline-flex items-center rounded-md bg-indigo-500/20 border border-indigo-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-200 mr-1.5">
        Guest
      </span>
      Browse curriculum and practice free.{" "}
      <button
        type="button"
        onClick={onSignIn}
        className="text-indigo-300 font-semibold hover:text-indigo-200 underline-offset-2 hover:underline cursor-pointer"
      >
        Sign in to save progress
      </button>
      {" · "}
      <button
        type="button"
        onClick={onHowItWorks}
        className="text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline cursor-pointer"
      >
        How it works
      </button>
    </p>
  </div>
);
