import React from "react";
import { Category } from "../../types/chat";

interface CategoryButtonProps {
  category: Category;
  selectedCategory: Category;
  icon: React.ReactNode;
  label: string;
  onClick: (category: Category) => void;
}

export function CategoryButton({
  category,
  selectedCategory,
  icon,
  label,
  onClick,
}: CategoryButtonProps) {
  const isSelected = selectedCategory === category;

  return (
    <button
      onClick={() => onClick(category)}
      className={`justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full ${
        isSelected
          ? "bg-[#2563eb] text-primary-foreground shadow hover:bg-[#2563eb]/90"
          : "bg-secondary/30 text-secondary-foreground/90 outline hover:bg-secondary"
      }`}
    >
      {icon}
      <div>{label}</div>
    </button>
  );
}
