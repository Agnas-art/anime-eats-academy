import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Snowflake, Wind, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherData {
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "windy";
  temperature: number;
  location: string;
  country: string;
}

interface FoodSuggestion {
  food: string;
  emoji: string;
  reason: string;
  recipe?: string;
}

const weatherFoods: Record<string, FoodSuggestion[]> = {
  sunny: [
    { food: "Watermelon", emoji: "🍉", reason: "Stay cool and hydrated!", recipe: "Watermelon Pops" },
    { food: "Ice Cream", emoji: "🍦", reason: "A refreshing treat!", recipe: "Frozen Yogurt Bites" },
    { food: "Salad", emoji: "🥗", reason: "Light and fresh!", recipe: "Rainbow Salad" },
  ],
  cloudy: [
    { food: "Sandwich", emoji: "🥪", reason: "Perfect for a cozy day!", recipe: "Veggie Club" },
    { food: "Smoothie", emoji: "🥤", reason: "Boost your energy!", recipe: "Berry Blast Smoothie" },
    { food: "Pasta", emoji: "🍝", reason: "Comfort food time!", recipe: "Veggie Pasta" },
  ],
  rainy: [
    { food: "Hot Soup", emoji: "🍜", reason: "Warm up from inside!", recipe: "Vegetable Soup" },
    { food: "Hot Cocoa", emoji: "☕", reason: "Cozy drink for rainy days!", recipe: "Healthy Hot Cocoa" },
    { food: "Grilled Cheese", emoji: "🧀", reason: "Ultimate comfort food!", recipe: "Cheesy Delight" },
  ],
  snowy: [
    { food: "Hot Oatmeal", emoji: "🥣", reason: "Start your day warm!", recipe: "Apple Cinnamon Oatmeal" },
    { food: "Stew", emoji: "🥘", reason: "Hearty and warming!", recipe: "Veggie Stew" },
    { food: "Baked Potato", emoji: "🥔", reason: "Filling and delicious!", recipe: "Loaded Baked Potato" },
  ],
  windy: [
    { food: "Energy Bars", emoji: "🍫", reason: "Stay energized!", recipe: "Homemade Granola Bars" },
    { food: "Warm Milk", emoji: "🥛", reason: "Soothing and nutritious!", recipe: "Golden Milk" },
    { food: "Rice Bowl", emoji: "🍚", reason: "Filling and grounding!", recipe: "Teriyaki Rice Bowl" },
  ],
};

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake,
  windy: Wind,
};

const weatherColors = {
  sunny: "from-kawaii-yellow to-primary",
  cloudy: "from-muted to-kawaii-blue/50",
  rainy: "from-kawaii-blue to-kawaii-purple",
  snowy: "from-white to-kawaii-blue/30",
  windy: "from-kawaii-mint to-kawaii-blue",
};

const WeatherFoodSuggestion = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState<FoodSuggestion | null>(null);

  useEffect(() => {
    // Simulate getting location and weather
    const getWeatherData = async () => {
      setLoading(true);
      
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Simulate weather based on time and random factors
            const hour = new Date().getHours();
            const conditions: WeatherData["condition"][] = ["sunny", "cloudy", "rainy", "snowy", "windy"];
            let condition: WeatherData["condition"];
            
            // More realistic weather simulation
            if (hour >= 6 && hour < 18) {
              condition = Math.random() > 0.5 ? "sunny" : "cloudy";
            } else {
              condition = Math.random() > 0.7 ? "rainy" : "cloudy";
            }
            
            // Simulate temperature based on latitude
            const baseTemp = 20 - Math.abs(position.coords.latitude - 40) * 0.5;
            const temp = Math.round(baseTemp + (Math.random() * 10 - 5));
            
            if (temp < 5) condition = "snowy";
            if (temp > 30) condition = "sunny";
            
            setWeather({
              condition,
              temperature: temp,
              location: "Your Area",
              country: "Local",
            });
            setLoading(false);
          },
          () => {
            // Default weather if location denied
            setWeather({
              condition: "sunny",
              temperature: 22,
              location: "Unknown",
              country: "World",
            });
            setLoading(false);
          }
        );
      } else {
        setWeather({
          condition: "sunny",
          temperature: 22,
          location: "Unknown",
          country: "World",
        });
        setLoading(false);
      }
    };

    getWeatherData();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-3xl p-6 shadow-card animate-pulse">
        <div className="h-20 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = weatherIcons[weather.condition];
  const suggestions = weatherFoods[weather.condition];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Weather Card */}
      <div className={`bg-gradient-to-br ${weatherColors[weather.condition]} rounded-3xl p-5 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-foreground/70 text-sm mb-1">
              <MapPin className="w-4 h-4" />
              <span>{weather.location}</span>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">
              {weather.temperature}°C
            </p>
            <p className="text-foreground/80 capitalize font-medium">
              {weather.condition}
            </p>
          </div>
          
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              rotate: weather.condition === "windy" ? [0, 10, -10, 0] : 0
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <WeatherIcon className="w-16 h-16 text-foreground/80" />
          </motion.div>
        </div>
      </div>

      {/* Food Suggestions */}
      <div>
        <h4 className="font-display font-bold text-foreground mb-3">
          🍽️ Perfect Foods for Today!
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {suggestions.map((food, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFood(food)}
              className={`bg-card rounded-2xl p-3 shadow-card text-center ${
                selectedFood?.food === food.food ? "ring-2 ring-primary" : ""
              }`}
            >
              <motion.span
                className="text-3xl block mb-1"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              >
                {food.emoji}
              </motion.span>
              <p className="text-xs font-semibold text-foreground">{food.food}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Food Detail */}
      {selectedFood && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-secondary/10 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-4xl">{selectedFood.emoji}</span>
            <div>
              <p className="font-display font-bold text-foreground">{selectedFood.food}</p>
              <p className="text-sm text-muted-foreground">{selectedFood.reason}</p>
              {selectedFood.recipe && (
                <p className="text-xs text-secondary font-semibold mt-1">
                  Try: {selectedFood.recipe}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WeatherFoodSuggestion;