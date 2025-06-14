import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf } from 'lucide-react';

const categories = [
  {
    id: 'cat1',
    name: 'Sustainable Fashion',
    slug: 'clothes',
    image: 'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg?auto=compress&cs=tinysrgb&w=400',
    icon: '👗',
    description: 'Eco-friendly clothing',
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'cat2',
    name: 'Green Electronics',
    slug: 'electronics',
    image: 'https://images.pexels.com/photos/343457/pexels-photo-343457.jpeg?auto=compress&cs=tinysrgb&w=400',
    icon: '📱',
    description: 'Energy-efficient tech',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'cat3',
    name: 'Eco Footwear',
    slug: 'shoes',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    icon: '👟',
    description: 'Sustainable shoes',
    color: 'from-purple-400 to-indigo-500'
  },
  {
    id: 'cat4',
    name: 'Natural Watches',
    slug: 'watches',
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400',
    icon: '⌚',
    description: 'Eco-conscious timepieces',
    color: 'from-amber-400 to-orange-500'
  },
  {
    id: 'cat5',
    name: 'Green Home',
    slug: 'home',
    image: 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg?auto=compress&cs=tinysrgb&w=400',
    icon: '🏠',
    description: 'Sustainable living',
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'cat6',
    name: 'Organic Groceries',
    slug: 'groceries',
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
    icon: '🛒',
    description: 'Fresh & organic',
    color: 'from-teal-400 to-cyan-500'
  },
  {
    id: 'cat7',
    name: 'Eco Appliances',
    slug: 'appliances',
    image: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=400',
    icon: '🔌',
    description: 'Energy-saving appliances',
    color: 'from-red-400 to-pink-500'
  },
  {
    id: 'cat8',
    name: 'Green Mobiles',
    slug: 'mobiles',
    image: 'https://images.pexels.com/photos/50614/pexels-photo-50614.jpeg?auto=compress&cs=tinysrgb&w=400',
    icon: '📱',
    description: 'Sustainable smartphones',
    color: 'from-violet-400 to-purple-500'
  },
];

const CategorySection: React.FC = () => {
  return (
    <div className="py-20 bg-gradient-light">
      <div className="container-custom">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="eco-badge text-lg">
              <Leaf size={20} className="mr-2" />
              Eco-Friendly Categories
            </div>
          </div>
          <h2 className="section-title text-gradient">Shop Sustainably</h2>
          <p className="section-subtitle">
            Discover our curated collections of eco-friendly products across various categories, 
            each offering premium quality while caring for our planet.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/products/${category.slug}`}
              className="category-card group"
            >
              <div className="relative overflow-hidden rounded-2xl mb-4">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-40 transition-opacity duration-300`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl group-hover:scale-125 transition-transform duration-300">
                    {category.icon}
                  </span>
                </div>
                
                {/* Eco Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Leaf size={16} className="text-primary-600" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4 group-hover:text-gray-700 transition-colors">
                {category.description}
              </p>
              
              <div className="flex items-center text-primary-600 group-hover:text-primary-700 transition-colors">
                <span className="text-sm font-medium">Explore</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;