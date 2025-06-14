import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Leaf, ShoppingBag, ArrowRight, Star, Sparkles } from 'lucide-react';

const bannerData = [
  {
    id: 1,
    title: "Eco-Friendly Fashion",
    subtitle: "Sustainable style that doesn't compromise on quality",
    image: 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    cta: "Shop Sustainable",
    badge: "100% Organic",
    discount: "Up to 40% Off"
  },
  {
    id: 2,
    title: "Green Technology",
    subtitle: "Energy-efficient electronics for a better tomorrow",
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    cta: "Explore Tech",
    badge: "Energy Star",
    discount: "Save 25%"
  },
  {
    id: 3,
    title: "Natural Home & Garden",
    subtitle: "Transform your space with eco-conscious products",
    image: 'https://images.pexels.com/photos/4123897/pexels-photo-4123897.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    cta: "Shop Home",
    badge: "Eco-Certified",
    discount: "Free Shipping"
  },
];

const Banner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === bannerData.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerData.length - 1 : prev - 1));
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden rounded-3xl mx-4 my-6 shadow-large">
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {bannerData.map((banner, index) => (
          <div key={banner.id} className="min-w-full h-full relative">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.image})` }}
            />
            
            {/* Green Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/80 via-primary-500/70 to-accent-600/80" />
            
            {/* Content */}
            <div className="relative h-full flex items-center justify-center text-center px-6">
              <div className="max-w-4xl mx-auto animate-fade-in">
                {/* Badge */}
                <div className="flex items-center justify-center mb-6">
                  <div className="eco-badge animate-bounce-in">
                    <Leaf size={16} className="mr-2" />
                    {banner.badge}
                  </div>
                </div>
                
                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight font-display">
                  {banner.title}
                </h1>
                
                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
                  {banner.subtitle}
                </p>
                
                {/* Discount Badge */}
                <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-3 rounded-full text-lg mb-8 animate-float">
                  <Sparkles size={20} className="mr-2" />
                  {banner.discount}
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <button className="btn-primary px-8 py-4 text-lg font-semibold flex items-center group">
                    <ShoppingBag size={20} className="mr-2" />
                    {banner.cta}
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="flex items-center text-white/90">
                    <div className="flex items-center mr-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm">Trusted by 50K+ customers</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-20 left-10 opacity-30">
              <div className="w-20 h-20 bg-white/20 rounded-full blur-xl animate-float"></div>
            </div>
            <div className="absolute bottom-20 right-10 opacity-30">
              <div className="w-32 h-32 bg-white/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <button 
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md p-4 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 z-10"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md p-4 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110 z-10"
      >
        <ChevronRight size={24} className="text-white" />
      </button>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {bannerData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div 
          className="h-full bg-gradient-to-r from-primary-400 to-accent-500 transition-all duration-6000 ease-linear"
          style={{ width: `${((currentSlide + 1) / bannerData.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Banner;