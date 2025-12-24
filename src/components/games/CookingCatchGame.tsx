import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Pause, Play } from "lucide-react";

interface FallingItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
  isGood: boolean;
  speed: number;
}

const goodFoods = ["🍎", "🥕", "🥦", "🍌", "🍇", "🥬", "🍊", "🥑"];
const badItems = ["🍭", "🍩", "🍟", "🥤", "🍪"];

interface CookingCatchGameProps {
  onComplete?: (score: number) => void;
  onBack?: () => void;
}

const CookingCatchGame = ({ onComplete, onBack }: CookingCatchGameProps) => {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [basketX, setBasketX] = useState(50);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const spawnItem = useCallback(() => {
    if (isPaused || gameOver) return;
    
    const isGood = Math.random() > 0.3;
    const foods = isGood ? goodFoods : badItems;
    
    const newItem: FallingItem = {
      id: Date.now(),
      emoji: foods[Math.floor(Math.random() * foods.length)],
      x: Math.random() * 80 + 10,
      y: 0,
      isGood,
      speed: 2 + Math.random() * 2 + score / 50,
    };
    
    setItems(prev => [...prev, newItem]);
  }, [isPaused, gameOver, score]);

  useEffect(() => {
    const interval = setInterval(spawnItem, 1500 - Math.min(score * 10, 800));
    return () => clearInterval(interval);
  }, [spawnItem, score]);

  useEffect(() => {
    if (isPaused || gameOver) return;
    
    const gameLoop = setInterval(() => {
      setItems(prev => {
        const updated = prev.map(item => ({
          ...item,
          y: item.y + item.speed,
        }));

        // Check catches and misses
        updated.forEach(item => {
          if (item.y > 85 && item.y < 95) {
            const distance = Math.abs(item.x - basketX);
            if (distance < 15) {
              if (item.isGood) {
                setScore(s => s + 10);
              } else {
                setLives(l => Math.max(0, l - 1));
              }
              item.y = 200; // Mark for removal
            }
          } else if (item.y > 100 && item.isGood) {
            setLives(l => Math.max(0, l - 1));
          }
        });

        return updated.filter(item => item.y < 110);
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [basketX, isPaused, gameOver]);

  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
      }
      onComplete?.(score);
    }
  }, [lives, gameOver, score, highScore, onComplete]);

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (isPaused || gameOver) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(10, Math.min(90, x)));
  };

  const restart = () => {
    setItems([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 ${
                  i < lives ? "text-accent fill-accent" : "text-muted"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 bg-muted rounded-full"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Score */}
      <div className="text-center">
        <p className="font-display text-3xl font-bold text-foreground">
          <Star className="w-6 h-6 inline text-kawaii-yellow fill-kawaii-yellow" /> {score}
        </p>
      </div>

      {/* Game Area */}
      <div
        className="relative bg-gradient-to-b from-kawaii-blue/30 to-kawaii-mint/30 rounded-3xl h-80 overflow-hidden touch-none"
        onMouseMove={handleMove}
        onTouchMove={handleMove}
      >
        {/* Instructions */}
        <div className="absolute top-2 left-0 right-0 text-center">
          <p className="text-xs text-muted-foreground">
            Catch 🍎🥕🥦 | Avoid 🍭🍩🍟
          </p>
        </div>

        {/* Falling Items */}
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute text-4xl"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Basket */}
        <motion.div
          className="absolute bottom-4 text-5xl"
          animate={{ left: `${basketX}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ transform: "translateX(-50%)" }}
        >
          🧺
        </motion.div>

        {/* Pause Overlay */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-foreground">Paused</p>
              <button
                onClick={() => setIsPaused(false)}
                className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold"
              >
                Resume
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/90 flex items-center justify-center"
          >
            <div className="text-center p-6">
              <motion.span
                className="text-6xl block mb-4"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                {score >= 100 ? "🏆" : score >= 50 ? "⭐" : "💪"}
              </motion.span>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                Game Over!
              </h3>
              <p className="text-4xl font-display font-bold text-primary mb-1">
                {score} points
              </p>
              {score >= highScore && score > 0 && (
                <p className="text-sm text-kawaii-yellow font-bold mb-4">
                  🎉 New High Score!
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                Best: {highScore}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={restart}
                  className="bg-secondary text-secondary-foreground px-6 py-2 rounded-xl font-bold"
                >
                  Try Again
                </button>
                <button
                  onClick={onBack}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold"
                >
                  Exit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-kawaii-yellow/20 rounded-2xl p-3 text-center">
        <p className="text-sm text-foreground">
          💡 <strong>Tip:</strong> Healthy foods give you energy to play and learn!
        </p>
      </div>
    </div>
  );
};

export default CookingCatchGame;