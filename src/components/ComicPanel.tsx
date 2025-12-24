import { motion } from "framer-motion";

interface ComicPanelProps {
  panels: {
    image: string;
    dialogue: string;
    character?: "mascot" | "veggie" | "fruit";
    position?: "left" | "right";
  }[];
  title: string;
  onComplete?: () => void;
}

const ComicPanel = ({ panels, title, onComplete }: ComicPanelProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl font-bold text-foreground text-center">
        📖 {title}
      </h3>
      
      <div className="grid gap-3">
        {panels.map((panel, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: panel.position === "right" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.3 }}
            className={`relative ${panel.position === "right" ? "ml-8" : "mr-8"}`}
          >
            {/* Comic panel frame */}
            <div className="bg-card rounded-2xl border-4 border-foreground/20 overflow-hidden shadow-card">
              {/* Character area */}
              <div className="bg-gradient-to-br from-kawaii-yellow/30 to-kawaii-pink/30 p-4 flex items-center justify-center">
                <motion.span 
                  className="text-6xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {panel.image}
                </motion.span>
              </div>
              
              {/* Dialogue bubble */}
              <div className="relative p-3">
                <div className={`bg-background rounded-2xl p-3 relative ${
                  panel.position === "right" ? "rounded-tr-none" : "rounded-tl-none"
                }`}>
                  {/* Speech bubble tail */}
                  <div 
                    className={`absolute -top-2 w-4 h-4 bg-background transform rotate-45 ${
                      panel.position === "right" ? "right-4" : "left-4"
                    }`}
                  />
                  <p className="text-sm font-semibold text-foreground relative z-10">
                    {panel.dialogue}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Panel number */}
            <div className="absolute -top-2 -left-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm border-2 border-background">
              {index + 1}
            </div>
          </motion.div>
        ))}
      </div>
      
      {onComplete && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: panels.length * 0.3 }}
          onClick={onComplete}
          className="w-full bg-secondary text-secondary-foreground py-3 rounded-2xl font-bold"
        >
          Continue Adventure! →
        </motion.button>
      )}
    </div>
  );
};

export default ComicPanel;