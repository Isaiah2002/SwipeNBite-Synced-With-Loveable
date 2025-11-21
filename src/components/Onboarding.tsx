import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Heart, Filter, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to SwipeN'Bite! 🍕",
    description: "Discover your next favorite restaurant by swiping through personalized recommendations",
    icon: "👋",
    highlight: null
  },
  {
    id: 2,
    title: "Swipe to Discover",
    description: "Swipe right ❤️ on restaurants you like, or swipe left 👋 to pass. It's that simple!",
    icon: "👆",
    highlight: "swipe"
  },
  {
    id: 3,
    title: "Customize Your Feed",
    description: "Use filters to set your preferences - distance, price range, dietary needs, and minimum ratings",
    icon: <Filter className="w-12 h-12 text-primary" />,
    highlight: "filters"
  },
  {
    id: 4,
    title: "View Your Matches",
    description: "Check your liked restaurants anytime, order food, make reservations, or share with friends",
    icon: <Heart className="w-12 h-12 text-accent fill-current" />,
    highlight: "matches"
  },
  {
    id: 5,
    title: "Set Your Location",
    description: "Add your delivery address in your profile to get accurate restaurant recommendations near you",
    icon: <MapPin className="w-12 h-12 text-primary" />,
    highlight: "profile"
  }
];

export const Onboarding = ({ onComplete, onSkip }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
      aria-modal="true"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-md mx-4 bg-card border border-border rounded-3xl shadow-2xl p-8 space-y-6"
        >
          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>

          {/* Icon/Emoji */}
          <div className="flex justify-center" aria-hidden="true">
            {typeof step.icon === 'string' ? (
              <div className="text-6xl">{step.icon}</div>
            ) : (
              step.icon
            )}
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            <h2 id="onboarding-title" className="text-2xl font-bold text-card-foreground">
              {step.title}
            </h2>
            <p id="onboarding-description" className="text-muted-foreground text-base leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div 
            className="flex justify-center gap-2 pt-4" 
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={onboardingSteps.length}
            aria-label={`Tutorial progress: step ${currentStep + 1} of ${onboardingSteps.length}`}
          >
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to step ${index + 1}`}
                aria-current={index === currentStep ? 'step' : undefined}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <nav className="flex gap-3 pt-2" aria-label="Tutorial navigation">
            {!isFirstStep && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1"
                aria-label="Go to previous step"
              >
                <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 gradient-primary text-primary-foreground border-0"
              aria-label={isLastStep ? "Complete tutorial and get started" : "Go to next step"}
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />}
            </Button>
          </nav>

          {/* Step counter */}
          <p className="text-center text-sm text-muted-foreground pt-2" aria-hidden="true">
            Step {currentStep + 1} of {onboardingSteps.length}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
