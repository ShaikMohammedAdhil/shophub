import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Plus, Minus, AlertCircle } from 'lucide-react';
import { Product } from '../../types/product';
import toast from 'react-hot-toast';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onClose, isOpen }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(['']);
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' }
  ]);
  const [error, setError] = useState<string>('');
  
  // New state for custom charges
  const [hasCustomDeliveryCharge, setHasCustomDeliveryCharge] = useState(false);
  const [hasCustomPackageCharge, setHasCustomPackageCharge] = useState(false);
  const [customDeliveryCharge, setCustomDeliveryCharge] = useState<number>(0);
  const [customPackageCharge, setCustomPackageCharge] = useState<number>(0);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<Product, 'id'>>();

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        category: product.category,
        brand: product.brand,
        stock: product.stock,
        featured: product.featured || false,
        tags: product.tags?.join(', ') || '',
      });
      setImages(product.images || [product.image]);
      setSpecifications(
        Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value }))
      );
      
      // Set custom charges if they exist
      if (product.customDeliveryCharge !== undefined) {
        setHasCustomDeliveryCharge(true);
        setCustomDeliveryCharge(product.customDeliveryCharge);
      }
      if (product.customPackageCharge !== undefined) {
        setHasCustomPackageCharge(true);
        setCustomPackageCharge(product.customPackageCharge);
      }
    } else {
      reset();
      setImages(['']);
      setSpecifications([{ key: '', value: '' }]);
      setHasCustomDeliveryCharge(false);
      setHasCustomPackageCharge(false);
      setCustomDeliveryCharge(0);
      setCustomPackageCharge(0);
    }
    setError('');
  }, [product, reset]);

  const onFormSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    
    try {
      // Validate required fields
      if (!data.name?.trim()) {
        throw new Error('Product name is required');
      }
      if (!data.description?.trim()) {
        throw new Error('Product description is required');
      }
      if (!data.price || data.price <= 0) {
        throw new Error('Valid price is required');
      }
      if (!data.stock || data.stock < 0) {
        throw new Error('Valid stock quantity is required');
      }
      if (!data.category) {
        throw new Error('Category is required');
      }

      const filteredImages = images.filter(img => img.trim() !== '');
      if (filteredImages.length === 0) {
        throw new Error('At least one product image is required');
      }

      const formattedData = {
        ...data,
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        stock: Number(data.stock),
        image: filteredImages[0], // First image as main image
        images: filteredImages,
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
        specifications: specifications.reduce((acc, spec) => {
          if (spec.key.trim() && spec.value.trim()) {
            acc[spec.key.trim()] = spec.value.trim();
          }
          return acc;
        }, {} as Record<string, string>),
        ratingCount: product?.ratingCount || 0,
        rating: product?.rating || 0,
        inStock: Number(data.stock) > 0,
        brand: data.brand?.trim() || undefined,
        // Add custom charges if enabled
        ...(hasCustomDeliveryCharge && { customDeliveryCharge: Number(customDeliveryCharge) }),
        ...(hasCustomPackageCharge && { customPackageCharge: Number(customPackageCharge) }),
      };

      console.log('📤 Submitting product data:', formattedData);
      
      await onSubmit(formattedData);
      toast.success(product ? 'Product updated successfully!' : 'Product added successfully!');
      onClose();
    } catch (error: any) {
      console.error('❌ Product form error:', error);
      const errorMessage = error.message || 'Failed to save product';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addImageField = () => {
    setImages([...images, '']);
  };

  const removeImageField = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
    if (index === 0) {
      setValue('image', value);
    }
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      setSpecifications(specifications.filter((_, i) => i !== index));
    }
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle size={20} className="text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-800 font-medium">Error saving product</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                {...register('name', { required: 'Product name is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                {...register('brand')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter brand name"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter product description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Pricing and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price * (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('price', { required: 'Price is required', min: 0.01 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('originalPrice', { min: 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                {...register('stock', { required: 'Stock is required', min: 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="clothes">Clothes</option>
                <option value="shoes">Shoes</option>
                <option value="watches">Watches</option>
                <option value="groceries">Groceries</option>
                <option value="electronics">Electronics</option>
                <option value="mobiles">Mobiles</option>
                <option value="home">Home</option>
                <option value="appliances">Appliances</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Custom Charges Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Charges (Optional)</h3>
            <p className="text-sm text-gray-600 mb-6">
              Override default delivery and packaging charges for this product. Leave unchecked to use system defaults.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom Delivery Charge */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasCustomDeliveryCharge"
                    checked={hasCustomDeliveryCharge}
                    onChange={(e) => setHasCustomDeliveryCharge(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="hasCustomDeliveryCharge" className="ml-2 text-sm font-medium text-gray-700">
                    Custom Delivery Charge
                  </label>
                </div>
                
                {hasCustomDeliveryCharge && (
                  <div className="ml-6">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setCustomDeliveryCharge(Math.max(0, customDeliveryCharge - 10))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={customDeliveryCharge}
                        onChange={(e) => setCustomDeliveryCharge(Number(e.target.value))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomDeliveryCharge(customDeliveryCharge + 10)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                      <span className="text-sm text-gray-600">₹</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Set to 0 for free delivery. Default system charge is ₹40.
                    </p>
                  </div>
                )}
              </div>

              {/* Custom Package Charge */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasCustomPackageCharge"
                    checked={hasCustomPackageCharge}
                    onChange={(e) => setHasCustomPackageCharge(e.target.checked)}
                    className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="hasCustomPackageCharge" className="ml-2 text-sm font-medium text-gray-700">
                    Custom Secure Package Charge
                  </label>
                </div>
                
                {hasCustomPackageCharge && (
                  <div className="ml-6">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setCustomPackageCharge(Math.max(0, customPackageCharge - 5))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={customPackageCharge}
                        onChange={(e) => setCustomPackageCharge(Number(e.target.value))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomPackageCharge(customPackageCharge + 5)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                      <span className="text-sm text-gray-600">₹</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Set to 0 for no packaging charge. Default system charge is ₹49.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Charges Preview */}
            {(hasCustomDeliveryCharge || hasCustomPackageCharge) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Charge Preview for this Product:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  {hasCustomDeliveryCharge && (
                    <p>• Delivery Charge: ₹{customDeliveryCharge} {customDeliveryCharge === 0 && '(Free Delivery)'}</p>
                  )}
                  {hasCustomPackageCharge && (
                    <p>• Secure Package Charge: ₹{customPackageCharge} {customPackageCharge === 0 && '(No Charge)'}</p>
                  )}
                  {!hasCustomDeliveryCharge && (
                    <p>• Delivery Charge: ₹40 (System Default)</p>
                  )}
                  {!hasCustomPackageCharge && (
                    <p>• Secure Package Charge: ₹49 (System Default)</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images *
            </label>
            <div className="space-y-3">
              {images.map((image, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => updateImage(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={index === 0 ? "Main image URL (required)" : "Additional image URL"}
                    required={index === 0}
                  />
                  {index === 0 ? (
                    <button
                      type="button"
                      onClick={addImageField}
                      className="p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specifications
            </label>
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Specification name (e.g., Material)"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Specification value (e.g., Cotton)"
                  />
                  {index === specifications.length - 1 ? (
                    <button
                      type="button"
                      onClick={addSpecification}
                      className="p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              {...register('tags')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., summer, casual, cotton"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('featured')}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Mark as featured product
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;