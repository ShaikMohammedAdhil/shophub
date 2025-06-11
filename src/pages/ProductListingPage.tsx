import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';
import { getProductsByCategory } from '../services/productService';
import type { Product } from '../types/product';

const ProductListingPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProductsByCategory(category || 'all', {
          search: searchQuery || '',
          sortBy,
          priceRange,
          brands: selectedBrands
        });
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category, searchQuery, sortBy, priceRange, selectedBrands]);
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
  };
  
  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };
  
  const clearAllFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedBrands([]);
    setSortBy('popular');
  };
  
  const categoryTitle = category ? 
    category.charAt(0).toUpperCase() + category.slice(1) : 
    'All Products';
  
  const searchTitle = searchQuery ? 
    `Search results for "${searchQuery}"` : 
    null;
  
  return (
    <div className="container-custom py-6">
      <h1 className="text-2xl font-bold mb-6">
        {searchTitle || categoryTitle}
      </h1>
      
      {/* Mobile Filters & Sort */}
      <div className="md:hidden flex justify-between items-center mb-4 bg-white p-3 rounded-md shadow-sm">
        <button 
          onClick={toggleFilters}
          className="flex items-center text-gray-700 px-3 py-1 border rounded"
        >
          <Filter size={18} className="mr-1" />
          Filter
        </button>
        
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="appearance-none bg-white border rounded px-3 py-1 pr-8 text-gray-700 cursor-pointer focus:outline-none"
          >
            <option value="popular">Popular</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - Desktop */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar 
            priceRange={priceRange}
            selectedBrands={selectedBrands}
            onPriceRangeChange={handlePriceRangeChange}
            onBrandChange={handleBrandChange}
            onClearAll={clearAllFilters}
          />
        </div>
        
        {/* Mobile Filter Sidebar */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
            <div className="absolute right-0 top-0 h-full w-4/5 max-w-xs bg-white overflow-y-auto animate-slideUp">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={toggleFilters}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4">
                <FilterSidebar 
                  priceRange={priceRange}
                  selectedBrands={selectedBrands}
                  onPriceRangeChange={handlePriceRangeChange}
                  onBrandChange={handleBrandChange}
                  onClearAll={clearAllFilters}
                />
              </div>
              
              <div className="border-t p-4">
                <button 
                  onClick={toggleFilters}
                  className="w-full py-2 bg-flipkart-blue text-white rounded-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Desktop Sort Controls */}
          <div className="hidden md:flex justify-between items-center mb-4 bg-white p-4 rounded-md shadow-sm">
            <div className="text-sm text-gray-600">
              {products.length} products found
            </div>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">Sort By:</span>
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleSortChange('popular')}
                  className={`text-sm ${sortBy === 'popular' ? 'text-flipkart-blue font-medium' : 'text-gray-600'}`}
                >
                  Popularity
                </button>
                <button 
                  onClick={() => handleSortChange('priceLow')}
                  className={`text-sm ${sortBy === 'priceLow' ? 'text-flipkart-blue font-medium' : 'text-gray-600'}`}
                >
                  Price: Low to High
                </button>
                <button 
                  onClick={() => handleSortChange('priceHigh')}
                  className={`text-sm ${sortBy === 'priceHigh' ? 'text-flipkart-blue font-medium' : 'text-gray-600'}`}
                >
                  Price: High to Low
                </button>
                <button 
                  onClick={() => handleSortChange('newest')}
                  className={`text-sm ${sortBy === 'newest' ? 'text-flipkart-blue font-medium' : 'text-gray-600'}`}
                >
                  Newest First
                </button>
              </div>
            </div>
          </div>
          
          {/* Applied Filters */}
          {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 100000) && (
            <div className="bg-white p-3 mb-4 rounded-md shadow-sm">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Applied Filters:</span>
                
                {priceRange[0] > 0 || priceRange[1] < 100000 ? (
                  <div className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
                    <span>₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}</span>
                    <button 
                      onClick={() => setPriceRange([0, 100000])}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null}
                
                {selectedBrands.map(brand => (
                  <div key={brand} className="flex items-center bg-gray-100 px-2 py-1 rounded text-sm">
                    <span>{brand}</span>
                    <button 
                      onClick={() => handleBrandChange(brand, false)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-flipkart-blue hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-md mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2 mb-2"></div>
                  <div className="bg-gray-200 h-8 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-md shadow-sm p-8 text-center">
              <img 
                src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/error-no-search-results_2353c5.png"
                alt="No Results"
                className="w-48 h-48 mx-auto mb-4"
              />
              <h3 className="text-lg font-medium mb-2">No Products Found</h3>
              <p className="text-gray-500">
                We couldn't find any matches for your search.
              </p>
              <p className="text-gray-500 mt-1">
                Please check the spelling or try searching for something else.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;