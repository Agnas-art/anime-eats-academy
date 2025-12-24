import { motion } from "framer-motion";
import { useState } from "react";
import FoodMatchGame from "./games/FoodMatchGame";
import FoodQuizGame from "./games/FoodQuizGame";
import CookingCatchGame from "./games/CookingCatchGame";
import { Gamepad2, Brain, Target, Sparkles } from "lucide-react";

interface GamesHubProps {
  ageGroup: string;
  onBack?: () => void;
}

type GameType = "hub" | "match" | "quiz" | "catch";

const games = [
  {
    id: "match" as const,
    title: "Food Match",
    emoji: "🎴",
    description: "Find matching food pairs!",
    icon: Gamepad2,
    color: "from-kawaii-pink to-accent",
    difficulty: "Easy",
  },
  {
    id: "quiz" as const,
    title: "Food Quiz",
    emoji: "🧠",
    description: "Test your food knowledge!",
    icon: Brain,
    color: "from-kawaii-yellow to-primary",
    difficulty: "Medium",
  },
  {
    id: "catch" as const,
    title: "Healthy Catch",
    emoji: "🧺",
    description: "Catch healthy foods!",
    icon: Target,
    color: "from-kawaii-mint to-secondary",
    difficulty: "Fun",
  },
];

const GamesHub = ({ ageGroup, onBack }: GamesHubProps) => {
  const [currentGame, setCurrentGame] = useState<GameType>("hub");
  const [totalPoints, setTotalPoints] = useState(0);

  const handleGameComplete = (score: number) => {
    setTotalPoints(p => p + score);
  };

  if (currentGame === "match") {
    return (
      <FoodMatchGame
        onComplete={handleGameComplete}
        onBack={() => setCurrentGame("hub")}
      />
    );
  }

  if (currentGame === "quiz") {
    return (
      <FoodQuizGame
        onComplete={handleGameComplete}
        onBack={() => setCurrentGame("hub")}
        ageGroup={ageGroup}
      />
    );
  }

  if (currentGame === "catch") {
    return (
      <CookingCatchGame
        onComplete={handleGameComplete}
        onBack={() => setCurrentGame("hub")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-2"
        >
          <span className="text-5xl">🎮</span>
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Fun Food Games!
        </h2>
        <p className="text-sm text-muted-foreground">
          Learn about food while having fun!
        </p>
      </div>

      {/* Points Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-kawaii-yellow/40 to-primary/30 rounded-2xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Today's Points</p>
            <p className="font-display text-2xl font-bold text-foreground">{totalPoints}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Streak</p>
          <p className="font-display text-lg font-bold text-primary">🔥 3 days</p>
        </div>
      </motion.div>

      {/* Games Grid */}
      <div className="space-y-3">
        {games.map((game, index) => {
          const Icon = game.icon;
          return (
            <motion.button
              key={game.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentGame(game.id)}
              className="w-full bg-card rounded-3xl p-4 shadow-card text-left overflow-hidden relative"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${game.color} opacity-20 rounded-full blur-2xl`} />
              
              <div className="relative flex items-center gap-4">
                <motion.div
                  animate={{ y: [0, -5, 0], rotate: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center`}
                >
                  <span className="text-3xl">{game.emoji}</span>
                </motion.div>
                
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-foreground">
                    {game.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {game.description}
                  </p>
                  <span className="inline-block mt-1 text-xs bg-muted px-2 py-0.5 rounded-full font-medium">
                    {game.difficulty}
                  </span>
                </div>
                
                <Icon className="w-6 h-6 text-muted-foreground" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Daily Challenge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-accent to-primary rounded-3xl p-5 text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        <div className="relative">
          <span className="text-sm font-semibold opacity-80">🎯 Daily Challenge</span>
          <h4 className="font-display text-xl font-bold mt-1">
            Play 3 games today!
          </h4>
          <div className="flex gap-2 mt-3">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  i < 1 ? "bg-white/30" : "bg-white/10"
                }`}
              >
                {i < 1 ? "✓" : i + 1}
              </div>
            ))}
          </div>
          <p className="text-xs mt-2 opacity-70">Reward: +50 bonus points!</p>
        </div>
      </motion.div>
    </div>
  );
};

export default GamesHub;