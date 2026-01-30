import React, { useState, useEffect } from 'react';

const studentArchetypes: Record<string, string> = {
  "Academic Scholar":
    "Excels in rigorous coursework and intellectual pursuits, demonstrating deep analytical thinking, academic discipline, and a love of learning.",
  "Researcher":
    "Engages in original research through labs, mentorships, or independent study, contributing new knowledge and demonstrating scholarly focus.",
  "STEM Builder":
    "Applies technical skills to build tangible solutions through coding, engineering, robotics, or product development.",
  "Entrepreneur":
    "Launches ventures, nonprofits, or initiatives with real-world impact, showing initiative, risk-taking, and execution.",
  "Leader":
    "Guides and inspires others through formal or informal leadership roles, shaping communities and driving collective action.",
  "Community Advocate":
    "Commits to service and social impact through sustained community engagement and mission-driven work.",
  "Artist":
    "Expresses ideas and emotions through visual art, music, film, or design, demonstrating originality and creative depth.",
  "Writer / Storyteller":
    "Uses language to explore ideas and narratives through journalism, creative writing, or long-form reflection.",
  "Performer":
    "Demonstrates discipline and excellence in performance-based arts such as theater, dance, or music.",
  "Athlete":
    "Balances physical excellence with teamwork and leadership through sustained commitment to competitive sports.",
  "Global Citizen":
    "Engages meaningfully with different cultures, languages, or international experiences, offering a global perspective.",
  "Humanitarian":
    "Shows deep empathy and compassion through long-term service, caregiving, or humanitarian-focused initiatives.",
  "Activist":
    "Advocates for change through organizing, awareness campaigns, or policy-focused efforts around social or political causes.",
  "Innovator":
    "Identifies novel problems and creates original solutions, often operating at the intersection of multiple disciplines.",
  "Professional-in-Training":
    "Pursues early professional experiences through internships or work aligned with a clear career direction.",
  "Mentor / Teacher":
    "Supports the growth of others through tutoring, coaching, or mentorship, demonstrating patience and leadership.",
  "Family Pillar":
    "Takes on significant family or household responsibilities, showing maturity, resilience, and quiet leadership.",
  "Self-Starter":
    "Independently acquires skills and completes projects without formal structure, driven by intrinsic motivation.",
  "Interdisciplinary Thinker":
    "Integrates multiple academic or creative fields to approach problems holistically and synthesize ideas.",
  "Late Bloomer / Upward Climber":
    "Demonstrates significant growth over time, reflecting resilience, self-awareness, and an upward academic or personal trajectory."
};

const colors = [
  "#60A5FA", // Blue
  "#34D399", // Green
  "#FBBF24", // Amber
  "#F472B6", // Pink
  "#A78BFA", // Purple
  "#2DD4BF", // Teal
  "#F87171", // Red
  "#FB923C"  // Orange
];

interface ArchetypeGraphProps {
  className?: string;
}

export default function ArchetypeGraph({ className }: ArchetypeGraphProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [data, setData] = useState<{labels: string[], scores: number[]} | null>(null);
  const [mounted, setMounted] = useState(false);
  const [graphProgress, setGraphProgress] = useState(0);

  useEffect(() => {
    // Generate random data
    const keys = Object.keys(studentArchetypes);
    const shuffled = [...keys].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 8);
    // Random scores between 30 and 95
    const scores = Array.from({length: 8}, () => Math.floor(Math.random() * 65) + 30);
    setData({ labels: selected, scores });

    // Start the entry animation sequence
    const mountTimer = setTimeout(() => setMounted(true), 100);

    // Start graph expansion after the environment is built
    // Timing: 
    // Circles: 0-800ms
    // Center Dot: 800ms
    // Labels: 1000ms - 2200ms (staggered)
    // Graph starts growing: ~2200ms
    const expansionDelay = 2400;

    const graphTimer = setTimeout(() => {
        let startTime: number | null = null;
        // Total duration for the whole staggered sequence
        const duration = 2500;
        
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const pct = Math.min(progress / duration, 1);
            
            // Just store linear progress
            setGraphProgress(pct);
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, expansionDelay);

    return () => {
        clearTimeout(mountTimer);
        clearTimeout(graphTimer);
    };
  }, []);

  if (!data) return null;

  const { labels: selectedArchetypes, scores: dummyScores } = data;

  const radius = 120; // Internal coordinate system radius
  const center = 150; // Internal coordinate system center
  const totalPoints = 8;
  
  // Calculate ranks for animation order (highest score first)
  // map index -> animation sequence rank (0 = first/highest score, 1 = second...)
  const animationRanks = dummyScores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .reduce((acc, item, rank) => {
          acc[item.index] = rank;
          return acc;
      }, new Array(dummyScores.length).fill(0));

  // Helper to calculate individual point progress
  const getPointScale = (index: number) => {
    // These constants should align with the total duration in useEffect
    const totalDuration = 2500;
    const stagger = 150; // Delay between each point
    const pointDuration = 1000; // Duration for one point to fully expand
    
    // Scale graphProgress (0-1) back to milliseconds (approximate for render)
    const currentTime = graphProgress * totalDuration;
    
    // Use the score-based rank for stagger delay instead of geometric index
    const start = animationRanks[index] * stagger;
    
    const p = Math.min(Math.max((currentTime - start) / pointDuration, 0), 1);
    
    // Use the smooth easing
    const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5);
    return easeOutQuint(p);
  };

  // Calculate polygon points with animation progress
  const points = selectedArchetypes.map((_, i) => {
    const angle = (i * (360 / totalPoints) - 90) * (Math.PI / 180);
    const score = dummyScores[i];
    // Scale r by individual point scale
    const r = (score / 100) * radius * getPointScale(i);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');


  return (
    <div className={`relative flex items-center justify-center w-full h-full mx-auto select-none ${className}`}>
      <style>{`
        @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes glowPulse {
            0% { filter: drop-shadow(0 0 2px rgba(167, 139, 250, 0.4)); }
            50% { filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.8)); }
            100% { filter: drop-shadow(0 0 2px rgba(167, 139, 250, 0.4)); }
        }
        .archetype-label-enter {
            opacity: 0;
            transform: translateY(10px) scale(0.9);
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .archetype-label-enter-active {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
      `}</style>
      
      {/* Container for the graph - Maintains square aspect ratio */}
      <div className="relative w-full max-w-[80vh] aspect-square flex items-center justify-center">
        
        {/* Background Haze/Glow */}
        <div className={`absolute inset-0 bg-blue-900/10 blur-[60px] rounded-full transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`} />

        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">
            {/* Grid Circles - animating from inside out */}
            {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                <circle 
                    key={i}
                    cx={center} 
                    cy={center} 
                    r={radius * scale} 
                    fill="none" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="origin-center transition-all duration-700 ease-out"
                    style={{
                        opacity: mounted ? 1 : 0,
                        transform: mounted ? 'scale(1)' : 'scale(0.5)',
                        transitionDelay: `${i * 200}ms`
                    }}
                />
            ))}

            {/* Axes */}
            {selectedArchetypes.map((_, i) => {
                const angle = (i * (360 / totalPoints) - 90) * (Math.PI / 180);
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return (
                    <line 
                        key={i}
                        x1={center} y1={center} 
                        x2={x} y2={y} 
                        stroke="rgba(255,255,255,0.1)" 
                        strokeWidth="1" 
                        style={{
                            opacity: mounted ? 1 : 0,
                            transition: 'opacity 1s ease-out',
                            transitionDelay: '800ms'
                        }}
                    />
                );
            })}

            {/* Radar Polygon Filled Area */}
            <polygon 
                points={points} 
                fill="rgba(139, 92, 246, 0.3)" 
                stroke="#A78BFA" 
                strokeWidth="2"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_10px_rgba(167,139,250,0.5)] transition-all duration-75"
                style={{
                  opacity: graphProgress > 0.01 ? 1 : 0,
                  filter: `drop-shadow(0 0 ${gridGlow(graphProgress)}px rgba(167,139,250,0.5))`
                }}
            />
            
            {/* Small dots at vertices */}
             {selectedArchetypes.map((_, i) => {
                const angle = (i * (360 / totalPoints) - 90) * (Math.PI / 180);
                const score = dummyScores[i];
                // Use individual point scale here too
                const scale = getPointScale(i);
                const r = (score / 100) * radius * scale; 
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                
                return (
                    <circle 
                        key={i}
                        cx={x} cy={y} r={scale > 0.1 ? 3 : 0} 
                        fill={colors[i]} 
                        className="animate-pulse"
                        style={{
                            opacity: scale > 0.01 ? 1 : 0,
                        }}
                    />
                );
            })}

            {/* Central Orb "You" */}
            <g style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.5s ease-out', transitionDelay: '800ms' }}>
                <circle cx={center} cy={center} r={4} fill="white" className="blur-[1px]" />
                <circle cx={center} cy={center} r={2} fill="white" />
            </g>
        </svg>

        {/* Outer Labels (Interactive) */}
        {selectedArchetypes.map((archetype, i) => {
            const angle = (i * (360 / totalPoints) - 90) * (Math.PI / 180);
            
            // Position for the label node (at full radius)
            const x = 50 + (radius / 300) * 100 * Math.cos(angle); 
            const y = 50 + (radius / 300) * 100 * Math.sin(angle);
            
            const isHovered = hoveredIndex === i;
            
            // Staggered entry delay calculation:
            // Starts after circles (800ms) + center dot (200ms) = 1000ms base
            const delay = 1000 + (i * 150);

            return (
                <div 
                    key={archetype}
                    className={`absolute w-4 h-4 md:w-8 md:h-8 -ml-2 -mt-2 md:-ml-4 md:-mt-4 rounded-full border-2 cursor-pointer transition-all duration-300 z-10 flex items-center justify-center group
                        ${mounted ? 'archetype-label-enter-active' : 'archetype-label-enter'}
                    `}
                    style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        borderColor: colors[i],
                        backgroundColor: isHovered ? colors[i] : 'rgba(0,0,0,0.8)',
                        boxShadow: isHovered ? `0 0 15px ${colors[i]}` : 'none',
                        transform: isHovered ? 'scale(1.2)' : (mounted ? 'scale(1)' : 'scale(0.5)'),
                        transitionDelay: isHovered ? '0ms' : `${delay}ms`
                    }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <div 
                      className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-white transition-opacity" 
                      style={{ opacity: isHovered ? 1 : 0.6 }}
                    />
                    
                    {/* Label */}
                    <div 
                        className={`absolute whitespace-nowrap text-[10px] md:text-xs font-medium px-2 py-1 rounded backdrop-blur-md transition-all duration-300 pointer-events-none border border-white/10
                        ${isHovered ? 'bg-white/10 text-white z-20 scale-110' : 'bg-black/40 text-gray-400 z-0'}
                        `}
                        style={{
                            // Simplified positioning to avoid overlap
                            transform: `translate(${Math.cos(angle) * 30}px, ${Math.sin(angle) * 30}px)`
                        }}
                    >
                        {archetype}
                    </div>
                </div>
            )
        })}
      </div>

      {/* Description Panel */}
      <div className="absolute top-0 right-0 bottom-0 w-96 flex flex-col justify-center px-8 pointer-events-none">
        {hoveredIndex !== null ? (
            <div className="bg-black/80 border border-white/10 p-6 rounded-xl backdrop-blur-xl animate-in fade-in slide-in-from-right-4 shadow-2xl text-left">
                <h3 className="text-xl font-bold mb-2" style={{ color: colors[hoveredIndex] }}>
                    {selectedArchetypes[hoveredIndex]}
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed">
                    {studentArchetypes[selectedArchetypes[hoveredIndex]]}
                </p>
            </div>
        ) : null}
      </div>
    </div>
  );
}

// Helper to make the glow pulse with the expansion
function gridGlow(progress: number) {
    // Pulse effect during expansion
    if (progress < 1) {
        return 10 + Math.sin(progress * Math.PI * 4) * 5;
    }
    return 10;
}
