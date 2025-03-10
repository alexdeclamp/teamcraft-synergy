
import React, { useState } from 'react';
import { UseCaseCategory } from './use-case-gallery/types';
import { useCasesData, categories } from './use-case-gallery/use-cases-data';
import CategoryFilter from './use-case-gallery/CategoryFilter';
import UseCaseGrid from './use-case-gallery/UseCaseGrid';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UseCaseGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<UseCaseCategory>('Featured');
  
  // Filter use cases based on active category
  const filteredUseCases = useCasesData.filter(useCase => 
    useCase.categories.includes(activeCategory)
  );

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="use-cases">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-medium mb-6">Use cases</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn how Bra3n handles real-world information management through practical examples.
        </p>
      </div>
      
      {/* Category Filter */}
      <CategoryFilter 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      {/* Use Cases Grid */}
      <UseCaseGrid useCases={filteredUseCases} />
      
      {/* Explore more button - in Manus.im style */}
      <div className="flex justify-center mt-12">
        <Button 
          variant="outline"
          className="rounded-full border-2 border-black text-black hover:bg-black/5 font-medium px-8 py-6 h-auto flex items-center gap-2"
          onClick={() => {}}
        >
          Explore more use cases
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default UseCaseGallery;
