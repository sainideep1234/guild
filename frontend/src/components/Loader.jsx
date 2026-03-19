import React from "react";

const Loader = ({ fullScreen = false, text = "Loading..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* BSG-themed spinning loader */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#1D57A5]/20"></div>
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#1D57A5] border-r-[#FFDA00]"></div>
        <div
          className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-b-[#1D57A5]/60"
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
        ></div>
      </div>
      {text && (
        <p className="animate-pulse text-sm font-semibold tracking-wide text-[#1D57A5]">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F4F7FE]/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] w-full items-center justify-center">
      {content}
    </div>
  );
};

export default Loader;
