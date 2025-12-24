import { motion } from "framer-motion";

interface CategoryPillProps {
  emoji: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const CategoryPill = ({ emoji, label, active = false, onClick }: CategoryPillProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${
        active
          ? "bg-primary text-primary-foreground shadow-kawaii"
          : "bg-card text-foreground shadow-card hover:shadow-float"
      }`}
    >
      <span className="text-lg">{emoji}</span>
      <span className="text-sm">{label}</span>
    </motion.button>
  );
};

export default CategoryPill;