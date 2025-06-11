import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories';

const CategorySection: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 md:gap-4">
      {categories.map((category) => (
        <Link 
          key={category.id} 
          to={`/products/${category.slug}`}
          className="flex flex-col items-center justify-center p-3 transition-transform hover:scale-105"
        >
          <img 
            src={category.image} 
            alt={category.name} 
            className="w-16 h-16 object-contain mb-2"
          />
          <span className="text-xs md:text-sm font-medium text-center text-gray-800">{category.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default CategorySection;