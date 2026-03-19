import React, { useState, useEffect } from "react";
import image1 from "../assets/guild1.jpeg";
import image2 from "../assets/guild2.jpeg";
import image3 from "../assets/guild3.jpeg";
import image4 from "../assets/guild4.jpeg";


const images = [image1, image2, image3, image4];

const ImageCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-7xl mx-auto h-[220px] sm:h-[320px] md:h-[420px] lg:h-[520px] xl:h-[600px] my-2 overflow-hidden rounded-xl sm:rounded-2xl group shadow-2xl">
      {/* Images container */}
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Subtle gradient overlay at the bottom for aesthetic indicator visibility */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none"></div>
          
          <img 
            className={`block w-full h-full object-cover transition-transform duration-4000 ease-out leading-none ${
              index === activeIndex ? "scale-105 group-hover:scale-110" : "scale-100"
            }`} 
            src={img} 
            alt={`Slide ${index + 1}`} 
          />
        </div>
      ))}

      {/* Modern aesthetically animated indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            className={`transition-all duration-500 ease-out rounded-full ${
              index === activeIndex 
                ? "w-10 h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                : "w-2 h-2 bg-white/50 hover:bg-white/90 hover:scale-125"
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;

