import React from "react";
import logo75 from "../assets/75yearslogo.png";
// import bimstec from "../assets/bimstec.png";
// import bsgbrandinglarge from "../assets/bsgbrandinglogolarge.png";
// import bsgbrandingshort from "../assets/bsgbrandinglogoshort.png";
import bsglogo from "../assets/bsglogo.png";
import goldenarrow from "../assets/goldenarrow.png";
import wagggs from "../assets/wagggslogo.png";
import wosm from "../assets/wosmlogo.png";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export const Marquee = ({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        "group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:3rem]",
        vertical ? "flex-col" : "flex-row",
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex shrink-0 items-center justify-around gap-(--gap)",
              vertical
                ? "animate-marquee-vertical flex-col"
                : "animate-marquee flex-row",
              reverse ? "[animation-direction:reverse]" : "",
              pauseOnHover ? "group-hover:[animation-play-state:paused]" : "",
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
};

const assetImages = [
  { src: logo75, alt: "75 Years Logo" },
  // { src: bimstec, alt: "Bimstec" },
  //   { src: bsgbrandinglarge, alt: "BSG Branding Large" },
  //   { src: bsgbrandingshort, alt: "BSG Branding Short" },
  //   { src: bsglogo, alt: "BSG Logo" },
  //   { src: goldenarrow, alt: "Golden Arrow" },
  { src: wagggs, alt: "WAGGGS" },
  { src: wosm, alt: "WOSM" },
];

export function MarqueeDemo() {
  return (
    <div className="relative mx-4 mb-6 flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-slate-200 bg-white py-6 shadow-xl sm:mx-6 sm:py-8 md:mx-8 md:mb-10">
      <Marquee className="[--duration:3s]">
        {assetImages.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
          className="h-12 w-auto object-contain transition-all duration-500 sm:h-16 md:h-24"
          />
        ))}
      </Marquee>

      {/* Gradient Overlays for smooth entry/exit */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l"></div>
    </div>
  );
}

export default MarqueeDemo;
