import { motion } from "framer-motion";
import { Clock, ChefHat, Star, Users } from "lucide-react";

interface RecipeCardProps {
  title: string;
  emoji: string;
  time: string;
  difficulty: "easy" | "medium" | "challenging";
  servings: number;
  ageGroup: string;
  image?: string;
  onClick?: () => void;
}

const difficultyConfig = {
  easy: { label: "Easy Peasy", stars: 1, color: "text-secondary" },
  medium: { label: "Getting Good", stars: 2, color: "text-kawaii-yellow" },
  challenging: { label: "Chef Mode", stars: 3, color: "text-primary" },
};

const RecipeCard = ({
  title,
  emoji,
  time,
  difficulty,
  servings,
  ageGroup,
  onClick,
}: RecipeCardProps) => {
  const config = difficultyConfig[difficulty];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card rounded-3xl shadow-card overflow-hidden cursor-pointer"
    >
      <div className="bg-gradient-to-br from-kawaii-yellow/40 to-primary/30 p-6 flex items-center justify-center relative">
        <motion.span
          className="text-6xl"
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {emoji}
        </motion.span>
        <span className="absolute top-2 right-2 text-xs bg-card/90 backdrop-blur px-2 py-1 rounded-full font-semibold text-foreground">
          {ageGroup}
        </span>
      </div>
      
      <div className="p-4 space-y-3">
        <h4 className="font-display font-bold text-lg text-foreground leading-tight">
          {title}
        </h4>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{servings}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < config.stars
                    ? `${config.color} fill-current`
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className={`text-xs font-semibold ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;