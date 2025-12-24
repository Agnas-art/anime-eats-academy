import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Star, ArrowRight } from "lucide-react";

interface Question {
  question: string;
  emoji: string;
  options: string[];
  correct: number;
  funFact: string;
}

const quizQuestions: Question[] = [
  {
    question: "Which vitamin is carrots famous for?",
    emoji: "🥕",
    options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin B"],
    correct: 0,
    funFact: "Vitamin A helps your eyes see better, especially at night!",
  },
  {
    question: "Which fruit floats in water?",
    emoji: "🍎",
    options: ["Grapes", "Banana", "Apple", "Orange"],
    correct: 2,
    funFact: "Apples float because they're 25% air!",
  },
  {
    question: "What color were carrots originally?",
    emoji: "🥕",
    options: ["Orange", "Purple", "Green", "Yellow"],
    correct: 1,
    funFact: "Carrots were originally purple! Orange carrots were created in the 1600s.",
  },
  {
    question: "Which food gives you the most energy for sports?",
    emoji: "⚡",
    options: ["Candy", "Banana", "Soda", "Chips"],
    correct: 1,
    funFact: "Bananas have natural sugars and potassium - perfect for energy!",
  },
  {
    question: "What percent of a watermelon is water?",
    emoji: "🍉",
    options: ["50%", "70%", "92%", "30%"],
    correct: 2,
    funFact: "Watermelons are 92% water - great for staying hydrated!",
  },
  {
    question: "Which vegetable is actually a flower?",
    emoji: "🌸",
    options: ["Carrot", "Potato", "Broccoli", "Spinach"],
    correct: 2,
    funFact: "Broccoli is a flower that hasn't bloomed yet!",
  },
  {
    question: "How many types of cheese exist in the world?",
    emoji: "🧀",
    options: ["About 100", "About 500", "Over 2000", "About 50"],
    correct: 2,
    funFact: "There are over 2,000 varieties of cheese worldwide!",
  },
  {
    question: "Which food helps build strong bones?",
    emoji: "🦴",
    options: ["Candy", "Milk", "Soda", "Chips"],
    correct: 1,
    funFact: "Milk has calcium which makes your bones and teeth super strong!",
  },
];

interface FoodQuizGameProps {
  onComplete?: (score: number) => void;
  onBack?: () => void;
  ageGroup?: string;
}

const FoodQuizGame = ({ onComplete, onBack, ageGroup }: FoodQuizGameProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [streak, setStreak] = useState(0);

  const question = quizQuestions[currentQuestion];
  const isCorrect = selectedAnswer === question.correct;

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === question.correct) {
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
      onComplete?.(score);
    }
  };

  const restart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setStreak(0);
    setIsComplete(false);
  };

  const getStars = () => {
    const percentage = score / (quizQuestions.length * 10);
    if (percentage >= 0.8) return 3;
    if (percentage >= 0.5) return 2;
    return 1;
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
          {streak > 1 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-sm font-bold text-primary"
            >
              🔥 {streak} streak!
            </motion.span>
          )}
          <span className="bg-kawaii-yellow/30 px-3 py-1 rounded-full text-sm font-bold">
            ⭐ {score}
          </span>
        </div>
      </div>

      {!isComplete ? (
        <>
          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1}/{quizQuestions.length}</span>
            </div>
            <div className="bg-muted rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                animate={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-3xl p-6 shadow-card"
          >
            <motion.span
              className="text-6xl block text-center mb-4"
              animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {question.emoji}
            </motion.span>
            
            <h3 className="font-display text-xl font-bold text-center text-foreground mb-6">
              {question.question}
            </h3>

            <div className="space-y-2">
              {question.options.map((option, index) => {
                let bgClass = "bg-muted hover:bg-muted/80";
                
                if (showResult) {
                  if (index === question.correct) {
                    bgClass = "bg-secondary/30 ring-2 ring-secondary";
                  } else if (index === selectedAnswer && !isCorrect) {
                    bgClass = "bg-destructive/30 ring-2 ring-destructive";
                  }
                } else if (selectedAnswer === index) {
                  bgClass = "bg-primary/20 ring-2 ring-primary";
                }

                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: showResult ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-2xl text-left font-semibold transition-all ${bgClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">{option}</span>
                      {showResult && index === question.correct && (
                        <CheckCircle2 className="w-5 h-5 text-secondary" />
                      )}
                      {showResult && index === selectedAnswer && !isCorrect && (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Fun Fact & Next */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <div className={`rounded-2xl p-4 ${isCorrect ? "bg-secondary/20" : "bg-accent/20"}`}>
                  <p className="font-display font-bold text-foreground mb-1">
                    {isCorrect ? "🎉 Correct!" : "😅 Not quite!"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    💡 {question.funFact}
                  </p>
                </div>
                
                <button
                  onClick={nextQuestion}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  {currentQuestion < quizQuestions.length - 1 ? (
                    <>Next Question <ArrowRight className="w-5 h-5" /></>
                  ) : (
                    "See Results"
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Results Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl p-6 shadow-card text-center"
        >
          <motion.span
            className="text-6xl block mb-4"
            animate={{ rotate: [0, -10, 10, 0], y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🏆
          </motion.span>
          
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Quiz Complete!
          </h3>
          
          <p className="text-4xl font-display font-bold text-primary mb-4">
            {score} points
          </p>

          <div className="flex justify-center gap-1 mb-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.2 }}
              >
                <Star
                  className={`w-10 h-10 ${
                    i < getStars()
                      ? "text-kawaii-yellow fill-kawaii-yellow"
                      : "text-muted"
                  }`}
                />
              </motion.div>
            ))}
          </div>

          <p className="text-muted-foreground mb-6">
            You got {Math.round((score / (quizQuestions.length * 10)) * quizQuestions.length)} out of {quizQuestions.length} correct!
          </p>

          <div className="flex gap-3">
            <button
              onClick={restart}
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
      )}
    </div>
  );
};

export default FoodQuizGame;