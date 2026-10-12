import React from "react";

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#DCE3EB]" />
        <div className="absolute inset-0 rounded-full border-4 border-[#E87832] border-t-transparent animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
          The Print Planet
        </p>
        <p className="text-[11px] text-[#687586]">
          Loading industrial assets & inventory...
        </p>
      </div>
    </div>
  );
}
