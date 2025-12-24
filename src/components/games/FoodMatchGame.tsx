import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, RotateCcw, Trophy } from "lucide-react";

interface Card {
  id: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const foodPairs = [
  { emoji: "🍎", name: "Apple" },
  { emoji: "🥕", name: "Carrot" },
  { emoji: "🍌", name: "Banana" },
  { emoji: "🥦", name: "Broccoli" },
  { emoji: "🍇", name: "Grapes" },
  { emoji: "🥑", name: "Avocado" },
];

interface FoodMatchGameProps {
  onComplete?: (score: number) => void;
  onBack?: () => void;
}

const FoodMatchGame = ({ onComplete, onBack }: FoodMatchGameProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [stars, setStars] = useState(3);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...foodPairs, ...foodPairs]
      .sort(() => Math.random() - 0.5)
      .map((food, index) => ({
        id: index,
        emoji: food.emoji,
        name: food.name,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsComplete(false);
    setStars(3);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        // Match found!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setMatches(m => m + 1);
          setFlippedCards([]);

          if (matches + 1 === foodPairs.length) {
            setIsComplete(true);
            // Calculate stars based on moves
            const finalStars = moves < 8 ? 3 : moves < 12 ? 2 : 1;
            setStars(finalStars);
            onComplete?.(finalStars * 10);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
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
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-muted-foreground">
            Moves: {moves}
          </span>
          <button
            onClick={initializeGame}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Game Title */}
      <div className="text-center">
        <h3 className="font-display text-2xl font-bold text-foreground">
          🎮 Food Match!
        </h3>
        <p className="text-sm text-muted-foreground">
          Find all the matching food pairs!
        </p>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`aspect-square rounded-xl relative ${
              card.isMatched ? "opacity-50" : ""
            }`}
            disabled={card.isMatched}
          >
            <motion.div
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card Back */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center ${
                  card.isFlipped || card.isMatched ? "invisible" : ""
                }`}
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className="text-2xl text-primary-foreground">?</span>
              </div>
              
              {/* Card Front */}
              <div
                className={`absolute inset-0 bg-card rounded-xl shadow-card flex items-center justify-center ${
                  card.isFlipped || card.isMatched ? "" : "invisible"
                }`}
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <span className="text-3xl">{card.emoji}</span>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-muted rounded-full h-3">
        <motion.div
          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(matches / foodPairs.length) * 100}%` }}
        />
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-card rounded-3xl p-6 max-w-sm w-full text-center shadow-float"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0], y: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Trophy className="w-16 h-16 text-kawaii-yellow mx-auto mb-4" />
              </motion.div>
              
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                Amazing! 🎉
              </h3>
              <p className="text-muted-foreground mb-4">
                You matched all foods in {moves} moves!
              </p>
              
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 ${
                      i < stars
                        ? "text-kawaii-yellow fill-kawaii-yellow"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={initializeGame}
                  className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-bold"
                >
                  Play Again
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodMatchGame;