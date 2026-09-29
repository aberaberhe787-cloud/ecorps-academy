import React from "react";

interface GuestRibbonProps {
  onSignIn: () => void;
  onHowItWorks: () => void;
}

export const GuestRibbon: React.FC<GuestRibbonProps> = ({ onSignIn, onHowItWorks }) => (
  <div className="border-b border-indigo-500/20 bg-indigo-950/40 px-4 py-2 text-center">
    <p className="text-xs sm:text-sm text-slate-300">
      <span className="font-semibold text-indigo-200">Guest mode</span>
      {" — "}
      browse curriculum and practice free.{" "}
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
