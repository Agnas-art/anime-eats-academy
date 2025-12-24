import { motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";

interface FoodFactBubbleProps {
  fact: string;
  onDismiss?: () => void;
}

const FoodFactBubble = ({ fact, onDismiss }: FoodFactBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="bg-gradient-to-r from-kawaii-yellow/30 to-primary/20 rounded-3xl p-4 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-kawaii-yellow/30 rounded-full blur-2xl" />
      <div className="relative flex gap-3">
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-10 h-10 bg-kawaii-yellow rounded-full flex items-center justify-center flex-shrink-0"
        >
          <Lightbulb className="w-5 h-5 text-foreground" />
        </motion.div>
        <div className="flex-1">
          <p className="font-display font-bold text-sm text-foreground mb-1">
            Did You Know?
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {fact}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-foreground/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default FoodFactBubble;