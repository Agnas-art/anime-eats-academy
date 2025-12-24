import { motion } from "framer-motion";
import { Home, Search, BookOpen, Trophy, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "discover", icon: Search, label: "Discover" },
  { id: "recipes", icon: BookOpen, label: "Recipes" },
  { id: "achievements", icon: Trophy, label: "Badges" },
  { id: "profile", icon: User, label: "Profile" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 px-3 py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors relative z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs font-semibold transition-colors relative z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;