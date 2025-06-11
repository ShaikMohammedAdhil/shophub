import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingBag,
  AlertCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Eye,
  BarChart3,
  Download,
  RefreshCw,
  Settings,
  Bell,
  Star,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/product';
import { Order } from '../types/order';
import { getProducts, deleteProduct, addProduct, updateProduct, getOrders } from '../services/firebaseService';
import ProductForm from '../components/admin/ProductForm';
import OrderManagement from '../components/admin/OrderManagement';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, ordersData] = await Promise.all([
        getProducts(),
        getOrders()
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const productId = await addProduct(productData);
      const newProduct = { ...productData, id: productId };
      setProducts([...products, newProduct]);
      setShowAddProduct(false);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const handleUpdateProduct = async (productData: Omit<Product, 'id'>) => {
    if (!selectedProduct) return;
    
    try {
      await updateProduct(selectedProduct.id, productData);
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...productData, id: selectedProduct.id } : p
      ));
      setShowProductModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate statistics
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'confirmed': return <CheckCircle size={14} />;
      case 'processing': return <RefreshCw size={14} />;
      case 'shipped': return <Package size={14} />;
      case 'delivered': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen fixed">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">ShopHub Management</p>
          </div>
          
          <nav className="p-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`admin-sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} className="mr-3" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('products')}
              className={`admin-sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
            >
              <Package size={18} className="mr-3" />
              <span>Products</span>
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`admin-sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <ShoppingBag size={18} className="mr-3" />
              <span>Orders</span>
            </button>
            
            <button
              onClick={() => setActiveTab('customers')}
              className={`admin-sidebar-item ${activeTab === 'customers' ? 'active' : ''}`}
            >
              <Users size={18} className="mr-3" />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`admin-sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 size={18} className="mr-3" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`admin-sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={18} className="mr-3" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className="text-gray-600 mt-1">
                {activeTab === 'dashboard' && 'Overview of your store performance'}
                {activeTab === 'products' && 'Manage your product inventory'}
                {activeTab === 'orders' && 'Track and manage customer orders'}
                {activeTab === 'customers' && 'View and manage customer information'}
                {activeTab === 'analytics' && 'Detailed insights and reports'}
                {activeTab === 'settings' && 'Configure your store settings'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-500 hover:text-primary-500 transition-colors">
                <Bell size={20} />
              </button>
              <button 
                onClick={fetchData}
                className="btn-primary flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh Data
              </button>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card border-l-primary-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-success flex items-center mt-1">
                        <TrendingUp size={14} className="mr-1" />
                        +12.5% from last month
                      </p>
                    </div>
                    <div className="p-3 bg-primary-100 rounded-lg">
                      <DollarSign className="text-primary-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="stat-card border-l-secondary-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                      <p className="text-sm text-success flex items-center mt-1">
                        <TrendingUp size={14} className="mr-1" />
                        +8.2% from last month
                      </p>
                    </div>
                    <div className="p-3 bg-secondary-100 rounded-lg">
                      <ShoppingBag className="text-secondary-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="stat-card border-l-accent-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                      <p className="text-sm text-gray-500 mt-1">{outOfStock} out of stock</p>
                    </div>
                    <div className="p-3 bg-accent-100 rounded-lg">
                      <Package className="text-accent-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="stat-card border-l-success">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                      <p className="text-sm text-warning mt-1">Needs attention</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Clock className="text-success" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-card">
                  <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">#{order.id.slice(-8)}</p>
                          <p className="text-xs text-gray-500">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">₹{order.totalAmount.toLocaleString()}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-card">
                  <h3 className="text-lg font-semibold mb-4">Alerts & Notifications</h3>
                  <div className="space-y-4">
                    {outOfStock > 0 && (
                      <div className="flex items-start p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                        <AlertCircle size={20} className="mr-3 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">Out of Stock Alert</p>
                          <p className="text-sm text-red-600">{outOfStock} products are currently out of stock</p>
                        </div>
                      </div>
                    )}
                    {lowStock > 0 && (
                      <div className="flex items-start p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <AlertCircle size={20} className="mr-3 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">Low Stock Warning</p>
                          <p className="text-sm text-yellow-600">{lowStock} products are running low on stock</p>
                        </div>
                      </div>
                    )}
                    {pendingOrders > 0 && (
                      <div className="flex items-start p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <AlertCircle size={20} className="mr-3 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">Pending Orders</p>
                          <p className="text-sm text-blue-600">{pendingOrders} orders pending processing</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Add Product
                </button>
              </div>

              <div className="admin-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Product</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Category</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Price</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Stock</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Rating</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold">₹{product.price.toLocaleString()}</div>
                            {product.originalPrice && (
                              <div className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.stock === 0 
                                  ? 'bg-red-100 text-red-800' 
                                  : product.stock <= 10
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {product.stock} units
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {product.rating && (
                              <div className="flex items-center">
                                <Star size={14} className="text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm font-medium">{product.rating}</span>
                                <span className="ml-1 text-xs text-gray-500">({product.ratingCount})</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowProductModal(true);
                                }}
                                className="text-secondary-600 hover:text-secondary-800 p-1"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && <OrderManagement />}

          {activeTab === 'customers' && (
            <div className="admin-card">
              <h3 className="text-lg font-semibold mb-4">Customer Management</h3>
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Management</h3>
                <p className="text-gray-500">Customer management features will be implemented here.</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-card">
                  <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chart placeholder - Sales data visualization</p>
                  </div>
                </div>
                <div className="admin-card">
                  <h3 className="text-lg font-semibold mb-4">Top Products</h3>
                  <div className="space-y-3">
                    {products.slice(0, 5).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">₹{product.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{product.stock} in stock</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="admin-card">
                <h3 className="text-lg font-semibold mb-4">Store Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <input type="text" className="input-field" defaultValue="ShopHub" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                    <textarea className="input-field" rows={3} defaultValue="Your one-stop shopping destination"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input type="email" className="input-field" defaultValue="admin@shophub.com" />
                  </div>
                  <div className="flex justify-end">
                    <button className="btn-primary">Save Settings</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modals */}
      <ProductForm
        product={null}
        onSubmit={handleAddProduct}
        onClose={() => setShowAddProduct(false)}
        isOpen={showAddProduct}
      />

      <ProductForm
        product={selectedProduct}
        onSubmit={handleUpdateProduct}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        isOpen={showProductModal}
      />
    </div>
  );
};

export default AdminDashboard;