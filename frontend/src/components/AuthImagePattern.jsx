import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

const AuthImagePattern = ({ title, subtitle }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 9);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md">
        <div className="grid grid-cols-3 gap-4 mb-8 mt-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                relative aspect-square rounded-2xl
                bg-primary/10 backdrop-blur-sm
                transition-all duration-300 ease-out
                group cursor-pointer
                ${hoveredIndex === i ? "scale-105 z-10" : "scale-100"}
                ${
                  hoveredIndex !== null && hoveredIndex !== i
                    ? "opacity-50"
                    : "opacity-100"
                }
                ${activeIndex === i ? "ring-2 ring-primary/20" : ""}
                hover:bg-primary/15
                ${i % 2 === 0 ? "animate-pulse" : ""}
              `}
            >
              <MessageSquare
                className={`
                  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-6 h-6 opacity-0 group-hover:opacity-70
                  transition-all duration-300 rotate-12 group-hover:rotate-0
                `}
              />
              {activeIndex === i && (
                <div className="absolute bottom-2 left-2 flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce" />
                  <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce delay-75" />
                  <div className="w-1 h-1 rounded-full bg-primary/40 animate-bounce delay-150" />
                </div>
              )}
              <div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 
                transition-all duration-300"
              />
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-3 tracking-tight">
            {title}
          </h2>
          <p className="text-base-content/60">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
