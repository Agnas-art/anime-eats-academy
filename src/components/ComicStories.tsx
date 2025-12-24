import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ComicPanel from "./ComicPanel";
import { BookOpen, ChevronRight, Star, Lock } from "lucide-react";

interface Story {
  id: string;
  title: string;
  emoji: string;
  description: string;
  ageGroup: string[];
  unlocked: boolean;
  panels: {
    image: string;
    dialogue: string;
    position?: "left" | "right";
  }[];
}

const stories: Story[] = [
  {
    id: "veggie-heroes",
    title: "The Veggie Heroes",
    emoji: "🦸‍♀️",
    description: "Learn how vegetables give you superpowers!",
    ageGroup: ["kids", "tweens"],
    unlocked: true,
    panels: [
      { image: "🥦", dialogue: "Hi! I'm Broccoli Boy! I give you super strong bones!", position: "left" },
      { image: "🥕", dialogue: "And I'm Carrot Girl! I help you see in the dark like a superhero!", position: "right" },
      { image: "🥬", dialogue: "I'm Spinach Sam! I make your muscles super strong!", position: "left" },
      { image: "🍅", dialogue: "Together, we're the VEGGIE HEROES! Eat us every day!", position: "right" },
    ],
  },
  {
    id: "breakfast-adventure",
    title: "Breakfast Adventure",
    emoji: "🌅",
    description: "Why breakfast is the most important meal!",
    ageGroup: ["kids", "tweens", "teens"],
    unlocked: true,
    panels: [
      { image: "😴", dialogue: "Yawn... I feel so tired and can't focus in class...", position: "left" },
      { image: "🥣", dialogue: "Hey! Did you skip breakfast? That's why you're tired!", position: "right" },
      { image: "🍳", dialogue: "Breakfast gives your brain and body energy to start the day!", position: "left" },
      { image: "😊", dialogue: "Wow! After eating breakfast, I feel amazing and ready to learn!", position: "right" },
    ],
  },
  {
    id: "sugar-detective",
    title: "The Sugar Detective",
    emoji: "🔍",
    description: "Learn to spot hidden sugars in food!",
    ageGroup: ["tweens", "teens"],
    unlocked: true,
    panels: [
      { image: "🕵️", dialogue: "I'm the Sugar Detective! Let's find hidden sugars together!", position: "left" },
      { image: "🥤", dialogue: "This soda has 10 spoons of sugar! That's way too much!", position: "right" },
      { image: "🍎", dialogue: "Natural sugar in fruit comes with vitamins and fiber - much better!", position: "left" },
      { image: "🏃", dialogue: "Reading labels helps you make healthy choices. You're a detective too!", position: "right" },
    ],
  },
  {
    id: "hydration-hero",
    title: "The Hydration Hero",
    emoji: "💧",
    description: "Discover why water is your body's best friend!",
    ageGroup: ["kids", "tweens", "teens"],
    unlocked: false,
    panels: [
      { image: "💧", dialogue: "I'm Water Drop! Your body is 60% water - just like me!", position: "left" },
      { image: "🧠", dialogue: "When you drink water, your brain works better and you think faster!", position: "right" },
      { image: "🏃", dialogue: "Water helps you run, jump, and play without getting tired!", position: "left" },
      { image: "🌟", dialogue: "Drink 6-8 glasses a day to be a Hydration Hero!", position: "right" },
    ],
  },
  {
    id: "rainbow-plate",
    title: "The Rainbow Plate",
    emoji: "🌈",
    description: "Why eating colorful foods matters!",
    ageGroup: ["kids"],
    unlocked: false,
    panels: [
      { image: "🍽️", dialogue: "Let's make your plate look like a rainbow!", position: "left" },
      { image: "🔴", dialogue: "Red foods like tomatoes keep your heart healthy!", position: "right" },
      { image: "🟢", dialogue: "Green foods like broccoli make you super strong!", position: "left" },
      { image: "🌈", dialogue: "The more colors you eat, the more superpowers you get!", position: "right" },
    ],
  },
];

interface ComicStoriesProps {
  ageGroup: string;
}

const ComicStories = ({ ageGroup }: ComicStoriesProps) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [completedStories, setCompletedStories] = useState<string[]>([]);

  const filteredStories = stories.filter(
    story => story.ageGroup.includes(ageGroup)
  );

  const handleComplete = () => {
    if (selectedStory && !completedStories.includes(selectedStory.id)) {
      setCompletedStories([...completedStories, selectedStory.id]);
    }
    setSelectedStory(null);
  };

  if (selectedStory) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedStory(null)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Stories
        </button>
        <ComicPanel
          title={selectedStory.title}
          panels={selectedStory.panels}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-2"
        >
          <BookOpen className="w-12 h-12 text-primary" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Food Comics! 📖
        </h2>
        <p className="text-sm text-muted-foreground">
          Learn about food through fun stories!
        </p>
      </div>

      {/* Progress */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">Stories Completed</span>
          <span className="text-sm text-muted-foreground">
            {completedStories.length}/{filteredStories.filter(s => s.unlocked).length}
          </span>
        </div>
        <div className="bg-muted rounded-full h-3">
          <motion.div
            className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
            animate={{
              width: `${(completedStories.length / filteredStories.filter(s => s.unlocked).length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Stories List */}
      <div className="space-y-3">
        {filteredStories.map((story, index) => {
          const isCompleted = completedStories.includes(story.id);
          
          return (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: story.unlocked ? 1.02 : 1 }}
              whileTap={{ scale: story.unlocked ? 0.98 : 1 }}
              onClick={() => story.unlocked && setSelectedStory(story)}
              disabled={!story.unlocked}
              className={`w-full bg-card rounded-3xl p-4 shadow-card text-left relative overflow-hidden ${
                !story.unlocked ? "opacity-60" : ""
              }`}
            >
              {!story.unlocked && (
                <div className="absolute inset-0 bg-muted/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="bg-foreground/10 rounded-full p-2">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <motion.div
                  animate={story.unlocked ? { rotate: [-5, 5, -5] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-14 h-14 bg-gradient-to-br from-kawaii-yellow/40 to-kawaii-pink/40 rounded-2xl flex items-center justify-center"
                >
                  <span className="text-3xl">{story.emoji}</span>
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-foreground">
                      {story.title}
                    </h3>
                    {isCompleted && (
                      <Star className="w-4 h-4 text-kawaii-yellow fill-kawaii-yellow" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {story.description}
                  </p>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full mt-1 inline-block">
                    {story.panels.length} panels
                  </span>
                </div>
                
                {story.unlocked && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Unlock hint */}
      <div className="bg-accent/10 rounded-2xl p-4 text-center">
        <p className="text-sm text-muted-foreground">
          🔓 Complete quizzes and games to unlock more stories!
        </p>
      </div>
    </div>
  );
};

export default ComicStories;