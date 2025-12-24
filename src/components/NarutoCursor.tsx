import { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const NarutoCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExcited, setIsExcited] = useState(false);
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleClick = () => {
      setIsExcited(true);
      setTimeout(() => setIsExcited(false), 500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      style={{
        x,
        y,
        translateX: 20,
        translateY: -60,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0,
        rotateY: isExcited ? [0, 15, -15, 0] : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* 3D Popup Container */}
      <div 
        className="relative"
        style={{
          perspective: '500px',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Shadow */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-black/20 rounded-full blur-sm"
          style={{ transform: 'translateZ(-20px) rotateX(90deg)' }}
        />
        
        {/* Naruto Character */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -5, 0],
            rotateZ: isExcited ? [0, -10, 10, 0] : 0,
          }}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            rotateZ: { duration: 0.3 },
          }}
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(-5deg)',
          }}
        >
          <svg 
            width="70" 
            height="90" 
            viewBox="0 0 70 90"
            className="drop-shadow-lg"
            style={{
              filter: 'drop-shadow(3px 5px 4px rgba(0,0,0,0.3))',
            }}
          >
            {/* Hair - Spiky blonde */}
            <g>
              {/* Back spikes */}
              <polygon points="10,25 5,8 18,22" fill="#FFD93D" />
              <polygon points="15,22 12,5 25,18" fill="#FFD93D" />
              <polygon points="25,18 25,2 35,15" fill="#FFD93D" />
              <polygon points="35,15 38,0 45,15" fill="#FFD93D" />
              <polygon points="45,18 50,5 55,22" fill="#FFD93D" />
              <polygon points="55,22 60,8 60,25" fill="#FFD93D" />
              
              {/* Main hair */}
              <ellipse cx="35" cy="28" rx="28" ry="18" fill="#FFD93D" />
              
              {/* Front spikes */}
              <polygon points="20,30 15,22 28,28" fill="#FFEC5C" />
              <polygon points="50,30 55,22 42,28" fill="#FFEC5C" />
            </g>
            
            {/* Headband */}
            <rect x="8" y="26" width="54" height="10" rx="2" fill="#2C3E50" />
            <rect x="25" y="27" width="20" height="8" rx="1" fill="#95A5A6" />
            {/* Konoha symbol */}
            <path d="M35,29 L33,33 L35,32 L37,33 Z" fill="#2C3E50" />
            <circle cx="35" cy="31" r="1.5" fill="none" stroke="#2C3E50" strokeWidth="0.5" />
            
            {/* Face */}
            <ellipse cx="35" cy="45" rx="22" ry="20" fill="#FFE4C4" />
            
            {/* Whisker marks */}
            <g stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round">
              <line x1="15" y1="42" x2="22" y2="43" />
              <line x1="15" y1="46" x2="22" y2="46" />
              <line x1="15" y1="50" x2="22" y2="49" />
              <line x1="55" y1="42" x2="48" y2="43" />
              <line x1="55" y1="46" x2="48" y2="46" />
              <line x1="55" y1="50" x2="48" y2="49" />
            </g>
            
            {/* Eyes */}
            <g>
              {/* Left eye */}
              <ellipse cx="27" cy="43" rx="5" ry="6" fill="white" />
              <ellipse cx="28" cy="43" rx="3" ry="4" fill="#3498DB" />
              <ellipse cx="29" cy="42" rx="1" ry="1.5" fill="white" />
              
              {/* Right eye */}
              <ellipse cx="43" cy="43" rx="5" ry="6" fill="white" />
              <ellipse cx="42" cy="43" rx="3" ry="4" fill="#3498DB" />
              <ellipse cx="43" cy="42" rx="1" ry="1.5" fill="white" />
              
              {/* Eyebrows */}
              <path d="M22,36 Q27,34 32,36" fill="none" stroke="#CC9933" strokeWidth="2" strokeLinecap="round" />
              <path d="M38,36 Q43,34 48,36" fill="none" stroke="#CC9933" strokeWidth="2" strokeLinecap="round" />
            </g>
            
            {/* Nose */}
            <ellipse cx="35" cy="49" rx="1.5" ry="1" fill="#E8C4A0" />
            
            {/* Mouth */}
            <motion.path
              d={isExcited 
                ? "M28,55 Q35,62 42,55" 
                : "M30,55 Q35,58 40,55"
              }
              fill="none"
              stroke="#D35400"
              strokeWidth="2"
              strokeLinecap="round"
            />
            
            {/* Orange jacket collar */}
            <path d="M15,62 Q35,70 55,62 L58,75 Q35,80 12,75 Z" fill="#FF6B35" />
            <path d="M30,65 L35,75 L40,65" fill="#2C3E50" />
            
            {/* Jacket details */}
            <rect x="18" y="68" width="3" height="5" rx="1" fill="white" />
            <rect x="49" y="68" width="3" height="5" rx="1" fill="white" />
          </svg>
          
          {/* Speech bubble on excitement */}
          {isExcited && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-lg px-2 py-1 shadow-lg text-xs font-bold text-orange-500 whitespace-nowrap"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'translateZ(20px)',
              }}
            >
              Dattebayo! 🍜
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white" />
            </motion.div>
          )}
        </motion.div>
        
        {/* Sparkle effects */}
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-lg">✨</span>
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 -left-3"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          <span className="text-sm">⭐</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NarutoCursor;
