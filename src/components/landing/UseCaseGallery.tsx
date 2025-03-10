
import React, { useState } from 'react';
import { UseCaseCategory } from './use-case-gallery/types';
import { categories } from './use-case-gallery/categories';
import { useCasesData } from './use-case-gallery/use-cases-data';
import CategoryFilter from './use-case-gallery/CategoryFilter';
import UseCaseGrid from './use-case-gallery/UseCaseGrid';

const UseCaseGallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<UseCaseCategory>('Featured');
  
  // Filter use cases based on active category
  const filteredUseCases = useCasesData.filter(useCase => 
    useCase.categories.includes(activeCategory)
  );

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="use-cases">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4">Use case gallery</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
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
    </section>
  );
};

export default UseCaseGallery;
