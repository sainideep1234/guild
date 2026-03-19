import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageCarousel from "../components/ImageCarousel";
import MarqueeDemo from "../components/Marquee";
import rashtrapatiscout from "../assets/rashtrapatiscout.png";
import rashtrapatirover from "../assets/rashtrapatirover.png";
import rashtrapatiranger from "../assets/rashtrapatiranger.png";
import rashtrapatiguide from "../assets/rashtrapatiguide.png";

const badges = [
  { image: rashtrapatiscout, label: "Rashtrapati Scout" },
  { image: rashtrapatiguide, label: "Rashtrapati Guide" },
  { image: rashtrapatirover, label: "Rashtrapati Rover" },
  { image: rashtrapatiranger, label: "Rashtrapati Ranger" },
];

const BadgeCard = ({ image, label, delay }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xl transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-16 opacity-0"
      }`}
    >
      <img
        src={image}
        alt={label}
        className="w-24 shrink-0 drop-shadow-md sm:w-28 md:w-32"
      />
      <p className="text-center text-sm font-bold tracking-wide text-[#1D57A5] sm:text-base">
        {label}
      </p>
    </div>
  );
};

const InfoCard = ({ image, text, reverse = false }) => (
  <div
    className={`flex items-center gap-4 rounded-xl border-2 border-slate-200 bg-white p-4 shadow-xl sm:gap-6 sm:p-6 md:gap-8 md:px-12 lg:px-20 ${
      reverse ? "flex-col-reverse sm:flex-row-reverse" : "flex-col sm:flex-row"
    }`}
  >
    <img
      src={image}
      alt="rashtrapati-badge"
      className="w-24 shrink-0 sm:w-32 md:w-40"
    />
    <p className="text-center text-sm font-[550] sm:text-left sm:text-base md:text-lg lg:text-xl">
      The Bharat Scouts and Guides (BSG) is India's national voluntary,
      non-political, and educational scouting and guiding association, founded on
      November 7, 1950. It aims to develop young people's physical, intellectual,
      social, and spiritual potentials to be responsible citizens. BSG is
      recognized by WOSM and WAGGGS.
    </p>
  </div>
);

const LandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-200">
      <Navbar title={"rastrapati guild"} />

      {/* Carousel Section */}
      <div className="mx-4 mt-6 max-w-7xl sm:mx-auto sm:w-full sm:px-4 md:px-8">
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <ImageCarousel />
        </div>
      </div>

      {/* Badges — drop from top animation */}
      {/* <div className="mx-4 my-6 max-w-7xl sm:mx-auto sm:w-full sm:px-4 md:px-8">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {badges.map((badge, i) => (
            <BadgeCard
              key={badge.label}
              image={badge.image}
              label={badge.label}
              delay={200 + i * 250}
            />
          ))}
        </div>
      </div> */}

      {/* Info Cards with descriptions */}
      <div className="mx-4 my-6 max-w-7xl space-y-6 sm:mx-auto sm:w-full sm:px-4 md:px-8 md:my-10 md:space-y-8">
        <InfoCard image={rashtrapatiscout} text="" />
        <InfoCard image={rashtrapatiguide} text="" reverse />
        <InfoCard image={rashtrapatirover} text="" />
        <InfoCard image={rashtrapatiranger} text="" reverse />
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
        <MarqueeDemo />
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
