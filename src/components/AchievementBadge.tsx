import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface AchievementBadgeProps {
  title: string;
  emoji: string;
  description: string;
  unlocked?: boolean;
  progress?: number;
}

const AchievementBadge = ({
  title,
  emoji,
  description,
  unlocked = false,
  progress = 0,
}: AchievementBadgeProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-card rounded-3xl p-4 shadow-card overflow-hidden ${
        !unlocked && "opacity-75"
      }`}
    >
      {!unlocked && (
        <div className="absolute inset-0 bg-muted/50 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="bg-foreground/10 rounded-full p-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      )}
      
      <div className="flex flex-col items-center text-center gap-2">
        <motion.div
          animate={unlocked ? { y: [0, -5, 0], rotate: [-5, 5, -5] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            unlocked
              ? "bg-gradient-to-br from-kawaii-yellow to-primary"
              : "bg-muted"
          }`}
        >
          <span className="text-3xl">{emoji}</span>
        </motion.div>
        
        <h4 className="font-display font-bold text-foreground text-sm">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground">{description}</p>
        
        {!unlocked && progress > 0 && (
          <div className="w-full bg-muted rounded-full h-2 mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-secondary h-full rounded-full"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AchievementBadge;