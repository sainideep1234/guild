import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageCarousel from "../components/ImageCarousel";
import MarqueeDemo from "../components/Marquee";
import rashtrapatiscout from "../assets/rashtrapatiscout.png";
import rashtrapatirover from "../assets/rashtrapatirover.png";
import rashtrapatiranger from "../assets/rashtrapatiranger.png";
import rashtrapatiguide from "../assets/rashtrapatiguide.png";

/* ── DATA ─────────────────────────────────────────────────────────────── */
const badges = [
  {
    image: rashtrapatiscout,
    label: "Rashtrapati Scout",
    color: "#1D57A5",
    desc: "The highest award a Scout can earn, recognizing exemplary leadership, service, and outdoor skills.",
  },
  {
    image: rashtrapatiguide,
    label: "Rashtrapati Guide",
    color: "#2E7D32",
    desc: "Awarded to Guides who demonstrate outstanding commitment to community service and personal development.",
  },
  {
    image: rashtrapatirover,
    label: "Rashtrapati Rover",
    color: "#C62828",
    desc: "Recognizes Rovers for advanced service contributions, adventure activities, and national integration efforts.",
  },
  {
    image: rashtrapatiranger,
    label: "Rashtrapati Ranger",
    color: "#E65100",
    desc: "The pinnacle award for Rangers, celebrating excellence in guiding, community impact, and character building.",
  },
];

const infoTexts = [
  "The Scout section focuses on building character, citizenship, and physical fitness among young boys aged 11–17. Through outdoor activities and community service, Scouts develop teamwork, self-reliance, and leadership skills that last a lifetime.",
  "Guides empower young girls aged 10–17 through a progressive program of personal development. From camps and hikes to service projects, Guides learn practical skills while building confidence and strong moral values.",
  "The Rover section is for young men aged 15–25 who extend scouting ideals into advanced service. Rovers undertake challenging community projects, wilderness expeditions, and contribute to national integration and social development.",
  "Rangers are young women aged 15–25 who carry forward the guiding spirit into higher service. Through adventure, skill training, and leadership programs, Rangers make meaningful contributions to their communities and nation.",
];

/* ── HOOKS ─────────────────────────────────────────────────────────────── */

/** Observe when an element enters viewport (fires once) */
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.1, ...options },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, isInView];
};

/* ── SECTION HEADING ──────────────────────────────────────────────────── */
const SectionHeading = ({ label, title, subtitle }) => {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref}
      className="mx-auto mb-10 max-w-2xl text-center transition-all duration-700"
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(28px)",
      }}
    >
      {label && (
        <span className="mb-2 inline-block px-4 py-1 text-xs font-bold tracking-widest text-[#1D57A5] uppercase">
          {label}
        </span>
      )}
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm text-gray-500 sm:text-base">{subtitle}</p>
      )}
    </div>
  );
};

/* ── BADGE CARD (with hover micro-interactions) ───────────────────────── */
const BadgeCard = ({ image, label, color, desc, delay }) => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [ref, isInView] = useInView();

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [isInView, delay]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex cursor-default flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-500 ease-out sm:p-8"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered
            ? "translateY(-8px) scale(1.02)"
            : "translateY(0) scale(1)"
          : "translateY(40px) scale(0.95)",
        boxShadow: hovered
          ? "0 20px 40px -12px rgba(0,0,0,0.15)"
          : "0 4px 24px -4px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="flex h-28 w-28 items-center justify-center rounded-full transition-all duration-500 sm:h-32 sm:w-32"
          style={{
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          <img
            src={image}
            alt={label}
            className="w-20 drop-shadow-lg transition-transform duration-500 sm:w-24"
            style={{
              transform: hovered ? "scale(1.15) rotate(-3deg)" : "scale(1)",
              filter: hovered
                ? "drop-shadow(0 8px 16px rgba(0,0,0,0.2))"
                : "none",
            }}
          />
        </div>

        <h3
          className="text-center text-base font-bold tracking-wide sm:text-lg"
          style={{ color }}
        >
          {label}
        </h3>
        <p className="text-center text-xs leading-relaxed text-gray-500 sm:text-sm">
          {desc}
        </p>
      </div>
    </div>
  );
};

/* ── INFO CARD (scroll-reveal with unique text) ───────────────────────── */
const InfoCard = ({ image, text, reverse = false, index }) => {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      className={`flex items-center gap-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-lg transition-all duration-700 ease-out sm:gap-8 sm:p-8 md:gap-10 md:p-10 ${
        reverse
          ? "flex-col-reverse sm:flex-row-reverse"
          : "flex-col sm:flex-row"
      }`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView
          ? "translateY(0)"
          : `translateY(40px) translateX(${reverse ? "30px" : "-30px"})`,
      }}
    >
      {/* Badge image with floating bob + glow */}
      <div className="relative shrink-0">
        <img
          src={image}
          alt="rashtrapati-badge"
          className="relative w-24 drop-shadow-xl transition-transform duration-700 hover:scale-110 sm:w-32 md:w-40"
          style={{
            animation: isInView
              ? `float-${index % 2 === 0 ? "a" : "b"} 3s ease-in-out infinite`
              : "none",
          }}
        />
      </div>

      {/* Text block */}
      <div
        className="transition-all delay-200 duration-700"
        style={{
          opacity: isInView ? 1 : 0,
          transform: isInView ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <h3
          className="mb-2 text-lg font-bold sm:text-xl"
          style={{ color: badges[index]?.color || "#1D57A5" }}
        >
          {badges[index]?.label}
        </h3>
        <p className="text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg">
          {text}
        </p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Navbar title={"rastrapati guild"} />

      <section className="relative">
        <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
            <ImageCarousel />
          </div>
        </div>

        {/* Glassmorphism overlay */}
        {/* <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-14 sm:pb-20">
          <div
            className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-center backdrop-blur-md sm:px-10 sm:py-5"
            style={{ animation: "fadeSlideUp 1s ease-out 0.5s both" }}
          >
            <h1 className="text-xl font-black tracking-tight text-white drop-shadow-lg sm:text-3xl md:text-4xl">
              Rashtrapati Guild Portal
            </h1>
            <p className="mt-1 text-xs font-medium text-white/80 sm:text-sm md:text-base">
              The Bharat Scouts and Guides — National Headquarters
            </p>
          </div>
        </div> */}
      </section>

      {/* ── BADGES GRID ─────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <SectionHeading
          label="Awards"
          title="Rashtrapati Awards"
          subtitle="The highest honours conferred upon Scouts and Guides by the President of India"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {badges.map((badge, i) => (
            <BadgeCard
              key={badge.label}
              image={badge.image}
              label={badge.label}
              color={badge.color}
              desc={badge.desc}
              delay={i * 150}
            />
          ))}
        </div>
      </section>

      {/* ── INFO CARDS ──────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-20">
        <SectionHeading
          label="About"
          title="Know the Sections"
          subtitle="Discover the four award categories and what they represent for India's youth"
        />

        <div className="space-y-6 md:space-y-8">
          <InfoCard image={rashtrapatiscout} text={infoTexts[0]} index={0} />
          <InfoCard
            image={rashtrapatiguide}
            text={infoTexts[1]}
            index={1}
            reverse
          />
          <InfoCard image={rashtrapatirover} text={infoTexts[2]} index={2} />
          <InfoCard
            image={rashtrapatiranger}
            text={infoTexts[3]}
            index={3}
            reverse
          />
        </div>
      </section>

      {/* ── PARTNERS MARQUEE ────────────────────────────────────────────── */}
      {/* <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
        <SectionHeading
          label="Affiliated"
          title="Our Partners"
          subtitle="Proudly affiliated with international scouting & guiding organizations"
        />
        <MarqueeDemo />
      </section> */}

      <Footer />

      {/* ── KEYFRAMES ───────────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-a {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes float-b {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
