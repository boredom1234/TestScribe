import React from "react";
import { Category } from '../../types/chat';
import { categoryPrompts } from '../../constants/prompts';
import { CategoryButton } from './CategoryButton';
import { IconPlusSparkles, IconCompass, IconCode, IconHat } from '../ui/icons';

interface WelcomeScreenProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  onSuggestionClick: (prompt: string) => void;
  hasMessages: boolean;
}

export function WelcomeScreen({ 
  selectedCategory, 
  onCategoryChange, 
  onSuggestionClick,
  hasMessages
}: WelcomeScreenProps) {
  const categoryIcons: Record<Category, React.ReactNode> = {
    create: <IconPlusSparkles />,
    explore: <IconCompass />,
    code: <IconCode />,
    learn: <IconHat />
  };

  const categoryLabels: Record<Category, string> = {
    create: "Create",
    explore: "Explore", 
    code: "Code",
    learn: "Learn"
  };

  return (
    <section className="mx-auto mt-8 w-full max-w-2xl text-left">
      <h1 className="text-2xl font-semibold font-weight-600 tracking-tight sm:text-[30px] pb-6 pt-12 justify-left text-[#4e2a58]">
        How can I help you?
      </h1>

      <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
        {(Object.keys(categoryIcons) as Category[]).map((category) => (
          <CategoryButton
            key={category}
            category={category}
            selectedCategory={selectedCategory}
            icon={categoryIcons[category]}
            label={categoryLabels[category]}
            onClick={onCategoryChange}
          />
        ))}
      </div>

      {!hasMessages && (
        <div className="mx-auto mt-4 w-full max-w-2xl divide-y divide-rose-100 overflow-hidden rounded-2xl text-left pt-1">
          {categoryPrompts[selectedCategory].map((prompt: string) => (
            <button
              key={prompt}
              onClick={() => onSuggestionClick(prompt)}
              className="block w-full px-5 py-3 text-left text-rose-900/90 transition hover:bg-[#ed78c6]/20 text-font-10px"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
