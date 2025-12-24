import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Gamepad2, BookOpen } from "lucide-react";
import FoodMascot from "@/components/FoodMascot";
import AgeSelector from "@/components/AgeSelector";
import BottomNav from "@/components/BottomNav";
import CategoryPill from "@/components/CategoryPill";
import FoodCard from "@/components/FoodCard";
import RecipeCard from "@/components/RecipeCard";
import FoodFactBubble from "@/components/FoodFactBubble";
import AchievementBadge from "@/components/AchievementBadge";
import RecipeDetail from "@/components/RecipeDetail";
import WeatherFoodSuggestion from "@/components/WeatherFoodSuggestion";
import GamesHub from "@/components/GamesHub";
import ComicStories from "@/components/ComicStories";
import NarutoCursor from "@/components/NarutoCursor";
import VoiceBot from "@/components/VoiceBot";
import { foodCategories, healthyFoods, recipes, foodFacts, achievements } from "@/data/foodData";

const Index = () => {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState("fruits");
  const [currentFact, setCurrentFact] = useState(foodFacts[0]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showGames, setShowGames] = useState(false);
  const [showComics, setShowComics] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact(foodFacts[Math.floor(Math.random() * foodFacts.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentFoods = selectedAge
    ? healthyFoods[selectedAge as keyof typeof healthyFoods] || []
    : [];
  const currentRecipes = selectedAge
    ? recipes[selectedAge as keyof typeof recipes] || []
    : [];

  const getAgeLabel = () => {
    switch (selectedAge) {
      case "kids": return "Little Chef";
      case "tweens": return "Junior Cook";
      case "teens": return "Teen Chef";
      default: return "Chef";
    }
  };

  if (showWelcome && !selectedAge) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-sm"
        >
          <FoodMascot mood="waving" size="lg" />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome to <span className="text-primary">Yummy</span>
              <span className="text-secondary">Learn!</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Your fun food adventure starts here! 🎉
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AgeSelector selectedAge={selectedAge} onSelect={(age) => {
              setSelectedAge(age);
              setShowWelcome(false);
            }} />
          </motion.div>
        </motion.div>
        <NarutoCursor />
        <VoiceBot />
      </div>
    );
  }

  if (selectedRecipe) {
    return (
      <>
        <RecipeDetail
          recipe={selectedRecipe}
          onBack={() => setSelectedRecipe(null)}
          ageGroup={getAgeLabel()}
        />
        <NarutoCursor />
        <VoiceBot />
      </>
    );
  }

  if (showGames) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <header className="sticky top-0 bg-background/95 backdrop-blur-lg z-40 px-4 py-3 border-b border-border">
          <button
            onClick={() => setShowGames(false)}
            className="text-muted-foreground hover:text-foreground transition-colors font-semibold"
          >
            ← Back to Home
          </button>
        </header>
        <main className="px-4 py-4">
          <GamesHub ageGroup={selectedAge || "kids"} />
        </main>
      </div>
    );
  }

  if (showComics) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <header className="sticky top-0 bg-background/95 backdrop-blur-lg z-40 px-4 py-3 border-b border-border">
          <button
            onClick={() => setShowComics(false)}
            className="text-muted-foreground hover:text-foreground transition-colors font-semibold"
          >
            ← Back to Home
          </button>
        </header>
        <main className="px-4 py-4">
          <ComicStories ageGroup={selectedAge || "kids"} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-lg z-40 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FoodMascot mood="happy" size="sm" />
            <div>
              <p className="text-xs text-muted-foreground">Hello, {getAgeLabel()}!</p>
              <h2 className="font-display font-bold text-foreground">YummyLearn</h2>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowWelcome(true)}
            className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold"
          >
            Change Age
          </motion.button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Weather-based Food Suggestions */}
              <WeatherFoodSuggestion />

              {/* Quick Actions - Games & Comics */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowGames(true)}
                  className="bg-gradient-to-br from-kawaii-pink to-accent rounded-2xl p-4 text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl" />
                  <Gamepad2 className="w-8 h-8 text-primary-foreground mb-2" />
                  <p className="font-display font-bold text-primary-foreground">Play Games</p>
                  <p className="text-xs text-primary-foreground/80">Learn while having fun!</p>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowComics(true)}
                  className="bg-gradient-to-br from-kawaii-yellow to-primary rounded-2xl p-4 text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-xl" />
                  <BookOpen className="w-8 h-8 text-primary-foreground mb-2" />
                  <p className="font-display font-bold text-primary-foreground">Read Comics</p>
                  <p className="text-xs text-primary-foreground/80">Fun food stories!</p>
                </motion.button>
              </div>

              {/* Fun Fact */}
              <FoodFactBubble fact={currentFact} />

              {/* Daily Challenge */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-secondary to-kawaii-mint rounded-3xl p-5 text-foreground relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-semibold opacity-90">Daily Challenge</span>
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">
                    Try a new veggie today! 🥦
                  </h3>
                  <p className="text-sm opacity-80 mb-3">
                    Earn 10 points by trying a vegetable you&apos;ve never had before!
                  </p>
                  <button className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-white/30 transition-colors">
                    Accept Challenge <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Quick Recipes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg font-bold text-foreground">Quick Recipes</h3>
                  <button 
                    onClick={() => setActiveTab("recipes")}
                    className="text-primary text-sm font-semibold"
                  >
                    See all
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentRecipes.slice(0, 2).map((recipe, i) => (
                    <RecipeCard
                      key={i}
                      {...recipe}
                      ageGroup={getAgeLabel()}
                      onClick={() => setSelectedRecipe(recipe)}
                    />
                  ))}
                </div>
              </div>

              {/* Healthy Foods */}
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">
                  Healthy Food Heroes
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {currentFoods.slice(0, 4).map((food, i) => (
                    <FoodCard key={i} {...food} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "discover" && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  Discover Foods
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn about amazing foods and their superpowers!
                </p>
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {foodCategories.map((cat) => (
                  <CategoryPill
                    key={cat.id}
                    {...cat}
                    active={activeCategory === cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                  />
                ))}
              </div>

              {/* Food Grid */}
              <div className="grid grid-cols-2 gap-3">
                {currentFoods.map((food, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <FoodCard {...food} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "recipes" && (
            <motion.div
              key="recipes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  Recipe Collection
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Yummy recipes perfect for your age!
                </p>
              </div>

              <div className="space-y-4">
                {currentRecipes.map((recipe, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <RecipeCard 
                      {...recipe} 
                      ageGroup={getAgeLabel()}
                      onClick={() => setSelectedRecipe(recipe)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  Your Badges
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Collect badges as you learn and cook!
                </p>
              </div>

              {/* Points Card */}
              <div className="bg-gradient-to-r from-kawaii-yellow/40 to-primary/30 rounded-3xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-3xl">⭐</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Points</p>
                    <p className="font-display text-3xl font-bold text-foreground">250</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <AchievementBadge {...achievement} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="text-center py-6">
                <FoodMascot mood="excited" size="lg" />
                <h3 className="font-display text-2xl font-bold text-foreground mt-4">
                  {getAgeLabel()}
                </h3>
                <p className="text-muted-foreground">Food Explorer Level 3</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Recipes", value: "12", emoji: "📖" },
                  { label: "Foods", value: "28", emoji: "🥗" },
                  { label: "Badges", value: "4", emoji: "🏅" },
                ].map((stat, i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 text-center shadow-card">
                    <span className="text-2xl">{stat.emoji}</span>
                    <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGames(true)}
                  className="bg-card rounded-2xl p-4 shadow-card text-center"
                >
                  <span className="text-3xl block mb-1">🎮</span>
                  <span className="font-semibold text-foreground text-sm">Play Games</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComics(true)}
                  className="bg-card rounded-2xl p-4 shadow-card text-center"
                >
                  <span className="text-3xl block mb-1">📖</span>
                  <span className="font-semibold text-foreground text-sm">Read Comics</span>
                </motion.button>
              </div>

              {/* Settings */}
              <div className="space-y-2">
                <h4 className="font-display font-bold text-foreground">Settings</h4>
                {[
                  { label: "Change Age Group", icon: "👤" },
                  { label: "Notifications", icon: "🔔" },
                  { label: "About YummyLearn", icon: "ℹ️" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (item.label === "Change Age Group") {
                        setShowWelcome(true);
                        setSelectedAge(null);
                      }
                    }}
                    className="w-full bg-card rounded-2xl p-4 flex items-center gap-3 shadow-card hover:shadow-float transition-shadow"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-semibold text-foreground">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <NarutoCursor />
      <VoiceBot />
    </div>
  );
};

export default Index;