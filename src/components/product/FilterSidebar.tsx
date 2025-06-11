import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSidebarProps {
  priceRange: [number, number];
  selectedBrands: string[];
  onPriceRangeChange: (range: [number, number]) => void;
  onBrandChange: (brand: string, checked: boolean) => void;
  onClearAll: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  priceRange,
  selectedBrands,
  onPriceRangeChange,
  onBrandChange,
  onClearAll
}) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    brand: true,
    discount: true,
    customerRatings: true,
  });
  
  // Mock brands for demo
  const brands = [
    { id: 'brand1', name: 'Nike' },
    { id: 'brand2', name: 'Adidas' },
    { id: 'brand3', name: 'Puma' },
    { id: 'brand4', name: 'Reebok' },
    { id: 'brand5', name: 'Under Armour' },
    { id: 'brand6', name: 'H&M' },
    { id: 'brand7', name: 'Zara' },
    { id: 'brand8', name: 'Levis' },
  ];
  
  // Pre-defined price ranges
  const priceRanges = [
    { min: 0, max: 1000, label: 'Under ₹1,000' },
    { min: 1000, max: 5000, label: '₹1,000 - ₹5,000' },
    { min: 5000, max: 10000, label: '₹5,000 - ₹10,000' },
    { min: 10000, max: 20000, label: '₹10,000 - ₹20,000' },
    { min: 20000, max: 100000, label: 'Over ₹20,000' },
  ];
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };
  
  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        <button 
          onClick={onClearAll}
          className="text-flipkart-blue text-sm hover:underline"
        >
          Clear All
        </button>
      </div>
      
      {/* Price Filter */}
      <div className="border-b pb-4 mb-4">
        <button 
          className="flex justify-between items-center w-full text-left font-medium mb-3"
          onClick={() => toggleSection('price')}
        >
          <span>Price</span>
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.price && (
          <div className="space-y-2">
            {priceRanges.map((range, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`price-range-${index}`}
                  name="price-range"
                  className="mr-2"
                  checked={priceRange[0] === range.min && priceRange[1] === range.max}
                  onChange={() => onPriceRangeChange([range.min, range.max])}
                />
                <label htmlFor={`price-range-${index}`} className="text-sm cursor-pointer">
                  {range.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Brand Filter */}
      <div className="border-b pb-4 mb-4">
        <button 
          className="flex justify-between items-center w-full text-left font-medium mb-3"
          onClick={() => toggleSection('brand')}
        >
          <span>Brand</span>
          {expandedSections.brand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.brand && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={brand.id}
                  checked={selectedBrands.includes(brand.name)}
                  onChange={(e) => onBrandChange(brand.name, e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={brand.id} className="text-sm cursor-pointer">
                  {brand.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Discount Filter */}
      <div className="border-b pb-4 mb-4">
        <button 
          className="flex justify-between items-center w-full text-left font-medium mb-3"
          onClick={() => toggleSection('discount')}
        >
          <span>Discount</span>
          {expandedSections.discount ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.discount && (
          <div className="space-y-2">
            {[10, 20, 30, 40, 50].map((discount) => (
              <div key={discount} className="flex items-center">
                <input
                  type="checkbox"
                  id={`discount-${discount}`}
                  className="mr-2"
                />
                <label htmlFor={`discount-${discount}`} className="text-sm cursor-pointer">
                  {discount}% or more
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Customer Ratings */}
      <div>
        <button 
          className="flex justify-between items-center w-full text-left font-medium mb-3"
          onClick={() => toggleSection('customerRatings')}
        >
          <span>Customer Ratings</span>
          {expandedSections.customerRatings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expandedSections.customerRatings && (
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <input
                  type="checkbox"
                  id={`rating-${rating}`}
                  className="mr-2"
                />
                <label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer">
                  {rating} ★ & above
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;