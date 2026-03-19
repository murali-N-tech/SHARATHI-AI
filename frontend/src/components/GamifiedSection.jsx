
import { motion } from "framer-motion";
import { Lightbulb, Target, Award, TrendingUp, Sparkles, Star, Zap } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "AI-Generated Hints",
    description: "Get intelligent hints powered by AI that guide you without giving away the answer",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
  },
  {
    icon: TrendingUp,
    title: "Topic Mastery",
    description: "Track your progress through comprehensive mastery levels for every topic",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Award,
    title: "Achievement System",
    description: "Earn badges and unlock achievements progress through your learning journey",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: Target,
    title: "Adaptive Difficulty",
    description: "Questions automatically adjust to your skill level for optimal learning",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
];

const achievements = [
  { label: "7 Day Streak", color: "text-orange-500", bgColor: "bg-orange-50" },
  { label: "Top 10%", color: "text-yellow-500", bgColor: "bg-yellow-50" },
  { label: "Quiz Master", color: "text-primary", bgColor: "bg-blue-50" },
  { label: "Speed Demon", color: "text-purple-500", bgColor: "bg-purple-50" },
  { label: "Perfect Score", color: "text-green-500", bgColor: "bg-green-50" },
];

const GamifiedSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 gradient-radial" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border shadow-md mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground font-medium">Power-Ups & Rewards</span>
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Learn with </span>
            <span className="gradient-text">Purpose & Fun</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our gamification system keeps you motivated and engaged throughout your learning journey
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-card rounded-2xl p-8 border border-border shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                  {feature.icon && <feature.icon className="w-7 h-7 text-white" />}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* XP Progress Demo */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-2xl p-8 border border-border shadow-lg mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* XP Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                  <span className="font-display text-3xl font-bold text-primary-foreground">24</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-card shadow-md">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Level</p>
                <h3 className="font-display text-2xl font-bold text-foreground">Advanced Learner</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">12,450 / 15,000 XP</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 max-w-md w-full">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress to Level 25</span>
                <span className="font-bold text-primary">83%</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "83%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full gradient-primary rounded-full relative overflow-hidden"
                  >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">2,550 XP until next level!</p>
            </div>
          </div>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <h3 className="font-display text-xl font-semibold text-foreground mb-6">Recent Achievements</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className={`${achievement.bgColor} rounded-xl px-5 py-3 flex items-center gap-3 border border-border shadow-md hover:shadow-lg transition-all cursor-pointer`}
              >
                <span className={`w-6 h-6 ${achievement.color}`}>🏅</span>
                <span className="text-sm font-medium text-foreground">{achievement.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GamifiedSection;
