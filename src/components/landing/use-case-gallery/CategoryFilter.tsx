
import React from 'react';
import { cn } from '@/lib/utils';
import { UseCaseCategory } from './types';

interface CategoryFilterProps {
  categories: UseCaseCategory[];
  activeCategory: UseCaseCategory;
  onCategoryChange: (category: UseCaseCategory) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-12">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            activeCategory === category 
              ? "bg-foreground text-background" 
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
