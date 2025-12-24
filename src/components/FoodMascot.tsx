import { motion } from "framer-motion";

interface FoodMascotProps {
  mood?: "happy" | "excited" | "thinking" | "waving";
  size?: "sm" | "md" | "lg";
  message?: string;
}

const FoodMascot = ({ mood = "happy", size = "md", message }: FoodMascotProps) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const getMoodAnimation = () => {
    switch (mood) {
      case "excited":
        return { y: [0, -8, 0], rotate: [-3, 3, -3] };
      case "thinking":
        return { rotate: [0, -5, 0] };
      case "waving":
        return { rotate: [0, -10, 10, -10, 0] };
      default:
        return { y: [0, -4, 0] };
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={getMoodAnimation()}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Main body - cute onigiri/rice ball character */}
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          {/* Body */}
          <path
            d="M50 10 C20 10, 10 45, 10 60 C10 85, 30 95, 50 95 C70 95, 90 85, 90 60 C90 45, 80 10, 50 10"
            fill="hsl(var(--card))"
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          
          {/* Nori wrap */}
          <path
            d="M15 55 C15 70, 25 90, 50 90 C75 90, 85 70, 85 55 L85 65 C85 80, 70 95, 50 95 C30 95, 15 80, 15 65 Z"
            fill="hsl(var(--foreground))"
          />
          
          {/* Eyes */}
          <ellipse cx="35" cy="50" rx="5" ry="6" fill="hsl(var(--foreground))" />
          <ellipse cx="65" cy="50" rx="5" ry="6" fill="hsl(var(--foreground))" />
          
          {/* Eye sparkles */}
          <circle cx="33" cy="48" r="2" fill="white" />
          <circle cx="63" cy="48" r="2" fill="white" />
          
          {/* Blush */}
          <ellipse cx="25" cy="58" rx="6" ry="4" fill="hsl(var(--kawaii-pink))" opacity="0.6" />
          <ellipse cx="75" cy="58" rx="6" ry="4" fill="hsl(var(--kawaii-pink))" opacity="0.6" />
          
          {/* Mouth */}
          {mood === "happy" && (
            <path d="M45 62 Q50 68, 55 62" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
          )}
          {mood === "excited" && (
            <ellipse cx="50" cy="64" rx="6" ry="5" fill="hsl(var(--primary))" />
          )}
          {mood === "thinking" && (
            <circle cx="50" cy="64" r="3" fill="hsl(var(--foreground))" />
          )}
          {mood === "waving" && (
            <path d="M42 62 Q50 70, 58 62" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
          )}
          
          {/* Chef hat */}
          <ellipse cx="50" cy="12" rx="20" ry="8" fill="white" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
          <path d="M30 12 Q30 0, 50 0 Q70 0, 70 12" fill="white" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
        </svg>
      </motion.div>
      
      {/* Speech bubble */}
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute -top-2 left-full ml-2 bg-card rounded-2xl rounded-bl-none px-3 py-2 shadow-card max-w-[150px]"
        >
          <p className="text-xs font-semibold text-foreground">{message}</p>
        </motion.div>
      )}
    </div>
  );
};

export default FoodMascot;