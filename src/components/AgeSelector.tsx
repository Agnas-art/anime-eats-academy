import { motion } from "framer-motion";

interface AgeSelectorProps {
  selectedAge: string | null;
  onSelect: (age: string) => void;
}

const ageGroups = [
  {
    id: "kids",
    label: "Little Chefs",
    ages: "5-8 years",
    emoji: "🍎",
    color: "bg-kawaii-pink",
    description: "Fun & easy recipes!",
  },
  {
    id: "tweens",
    label: "Junior Cooks",
    ages: "9-12 years",
    emoji: "🍕",
    color: "bg-kawaii-yellow",
    description: "Level up your skills!",
  },
  {
    id: "teens",
    label: "Teen Chefs",
    ages: "13-17 years",
    emoji: "🍳",
    color: "bg-kawaii-mint",
    description: "Master the kitchen!",
  },
];

const AgeSelector = ({ selectedAge, onSelect }: AgeSelectorProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-bold text-center text-foreground">
        Choose Your Chef Level!
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {ageGroups.map((group, index) => (
          <motion.button
            key={group.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(group.id)}
            className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all ${
              selectedAge === group.id
                ? "ring-4 ring-primary ring-offset-2 ring-offset-background"
                : "hover:shadow-float"
            }`}
          >
            <div className={`absolute inset-0 ${group.color} opacity-20`} />
            <div className="relative flex items-center gap-4">
              <motion.span
                className="text-4xl"
                animate={{ rotate: selectedAge === group.id ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                {group.emoji}
              </motion.span>
              <div className="flex-1">
                <p className="font-display font-bold text-foreground">{group.label}</p>
                <p className="text-sm text-muted-foreground">{group.ages}</p>
                <p className="text-xs text-secondary font-semibold mt-1">
                  {group.description}
                </p>
              </div>
              {selectedAge === group.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                >
                  <span className="text-primary-foreground text-lg">✓</span>
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default AgeSelector;