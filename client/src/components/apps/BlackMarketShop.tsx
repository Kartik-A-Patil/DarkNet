import React, { useState, useEffect } from 'react';
import { useOS } from '../../contexts/OSContext';

// Product types
type ProductCategory = 'hardware' | 'software' | 'data' | 'services';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  image: string;
  inStock: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

// Mock user balance/inventory
interface UserInventory {
  balance: number;
  ownedItems: { [id: string]: number };
}

const BlackMarketShop: React.FC = () => {
  const { isSudoMode } = useOS();
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userInventory, setUserInventory] = useState<UserInventory>({
    balance: 12500,
    ownedItems: {}
  });
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Generate mock products
  useEffect(() => {
    const mockProducts: Product[] = [
      // Hardware
      {
        id: 'hw001',
        name: 'Quantum Cryptography Interceptor',
        description: 'Advanced hardware device capable of intercepting and decoding quantum-encrypted communications.',
        price: 25000,
        category: 'hardware',
        rarity: 'legendary',
        image: 'fa-microchip',
        inStock: true
      },
      {
        id: 'hw002',
        name: 'Ghost Network Adapter',
        description: 'Network adapter that makes your connections invisible to most detection systems.',
        price: 5500,
        category: 'hardware',
        rarity: 'rare',
        image: 'fa-network-wired',
        inStock: true
      },
      {
        id: 'hw003',
        name: 'RF Signal Jammer',
        description: 'Blocks wireless communications in a 100-meter radius.',
        price: 2800,
        category: 'hardware',
        rarity: 'uncommon',
        image: 'fa-broadcast-tower',
        inStock: true
      },
      {
        id: 'hw004',
        name: 'RFID Cloner Pro',
        description: 'Scan and clone RFID cards and fobs within seconds.',
        price: 1200,
        category: 'hardware',
        rarity: 'common',
        image: 'fa-id-card',
        inStock: true
      },
      {
        id: 'hw005',
        name: 'Covert Surveillance Kit',
        description: 'Complete set of miniature cameras and microphones with remote access capabilities.',
        price: 8500,
        category: 'hardware',
        rarity: 'rare',
        image: 'fa-camera',
        inStock: false
      },
      
      // Software
      {
        id: 'sw001',
        name: 'Deep Web Crawler',
        description: 'AI-powered software for navigating and indexing deep web content automatically.',
        price: 15000,
        category: 'software',
        rarity: 'legendary',
        image: 'fa-spider',
        inStock: true
      },
      {
        id: 'sw002',
        name: 'Zero-Day Exploit Pack',
        description: 'Collection of unreported vulnerabilities for major operating systems and applications.',
        price: 22000,
        category: 'software',
        rarity: 'legendary',
        image: 'fa-bug',
        inStock: false
      },
      {
        id: 'sw003',
        name: 'Cipher Master',
        description: 'Advanced encryption and decryption suite with brute force capabilities.',
        price: 3500,
        category: 'software',
        rarity: 'uncommon',
        image: 'fa-key',
        inStock: true
      },
      {
        id: 'sw004',
        name: 'Stealth Backdoor Kit',
        description: 'Create undetectable backdoors in target systems that survive even OS reinstalls.',
        price: 7800,
        category: 'software',
        rarity: 'rare',
        image: 'fa-door-open',
        inStock: true
      },
      {
        id: 'sw005',
        name: 'Traffic Anonymizer',
        description: 'Masks your internet traffic and provides untraceable browsing.',
        price: 1800,
        category: 'software',
        rarity: 'common',
        image: 'fa-mask',
        inStock: true
      },
      
      // Data
      {
        id: 'dt001',
        name: 'Corporate Email Database',
        description: 'Complete email directory for Fortune 500 companies with validation status.',
        price: 4500,
        category: 'data',
        rarity: 'uncommon',
        image: 'fa-envelope',
        inStock: true
      },
      {
        id: 'dt002',
        name: 'Payment System Vulnerability Report',
        description: 'Detailed analysis of security weaknesses in major payment processors.',
        price: 18000,
        category: 'data',
        rarity: 'rare',
        image: 'fa-credit-card',
        inStock: true
      },
      {
        id: 'dt003',
        name: 'Government Personnel Records',
        description: 'Database of government employees including classified departments.',
        price: 9500,
        category: 'data',
        rarity: 'rare',
        image: 'fa-user-secret',
        inStock: false
      },
      {
        id: 'dt004',
        name: 'Password Database',
        description: 'Collection of leaked username/password combinations from various data breaches.',
        price: 3200,
        category: 'data',
        rarity: 'common',
        image: 'fa-list',
        inStock: true
      },
      {
        id: 'dt005',
        name: 'Cryptocurrency Wallet Seeds',
        description: 'Collection of potentially valid wallet seeds for various cryptocurrencies.',
        price: 12500,
        category: 'data',
        rarity: 'rare',
        image: 'fa-coins',
        inStock: true
      },
      
      // Services
      {
        id: 'sv001',
        name: 'Custom Malware Development',
        description: 'Have malware tailored to your specific needs and target environment.',
        price: 30000,
        category: 'services',
        rarity: 'legendary',
        image: 'fa-virus',
        inStock: true
      },
      {
        id: 'sv002',
        name: 'DDoS Attack Service',
        description: 'Distributed denial of service attacks on request. Pricing is per hour of attack.',
        price: 5000,
        category: 'services',
        rarity: 'uncommon',
        image: 'fa-server',
        inStock: true
      },
      {
        id: 'sv003',
        name: 'Physical Security Penetration',
        description: 'Physical access services including lockpicking, social engineering, and covert entry.',
        price: 15000,
        category: 'services',
        rarity: 'rare',
        image: 'fa-user-ninja',
        inStock: false
      },
      {
        id: 'sv004',
        name: 'Anonymous Hosting',
        description: 'Untraceable server hosting with encrypted connections and no logging.',
        price: 2000,
        category: 'services',
        rarity: 'common',
        image: 'fa-shield-alt',
        inStock: true
      },
      {
        id: 'sv005',
        name: 'Dark Web Identity Package',
        description: 'Complete set of documentation and online personas with established history.',
        price: 8500,
        category: 'services',
        rarity: 'rare',
        image: 'fa-id-badge',
        inStock: true
      }
    ];
    
    setProducts(mockProducts);
  }, []);
  
  // Filtered products
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (activeCategory !== 'all' && product.category !== activeCategory) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Add to cart
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { product, quantity: 1 }]);
    }
  };
  
  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };
  
  // Update cart quantity
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity } 
        : item
    ));
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  );
  
  // Checkout 
  const handleCheckout = () => {
    if (cartTotal > userInventory.balance) {
      alert('Insufficient funds to complete this purchase.');
      return;
    }
    
    // Update user inventory and balance
    const updatedOwnedItems = { ...userInventory.ownedItems };
    cart.forEach(item => {
      const productId = item.product.id;
      updatedOwnedItems[productId] = (updatedOwnedItems[productId] || 0) + item.quantity;
    });
    
    setUserInventory({
      balance: userInventory.balance - cartTotal,
      ownedItems: updatedOwnedItems
    });
    
    // Clear cart
    setCart([]);
    setShowCart(false);
    
    alert('Purchase completed successfully!');
  };
  
  // View product details
  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Render rarity badge
  const renderRarityBadge = (rarity: Product['rarity']) => {
    let bgColor = '';
    let textColor = '';
    
    switch (rarity) {
      case 'common':
        bgColor = 'bg-gray-600';
        textColor = 'text-gray-200';
        break;
      case 'uncommon':
        bgColor = 'bg-green-800';
        textColor = 'text-green-200';
        break;
      case 'rare':
        bgColor = 'bg-blue-800';
        textColor = 'text-blue-200';
        break;
      case 'legendary':
        bgColor = 'bg-purple-800';
        textColor = 'text-purple-200';
        break;
    }
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs ${bgColor} ${textColor} uppercase`}>
        {rarity}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-black p-3 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          <i className="fa fa-store text-red-600 text-xl mr-2"></i>
          <h1 className="text-xl font-bold">Black Market</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-green-400 font-mono">
            <i className="fa fa-wallet mr-1"></i>
            {formatPrice(userInventory.balance)}
          </div>
          <button 
            className="relative bg-gray-800 hover:bg-gray-700 p-2 rounded-full"
            onClick={() => setShowCart(true)}
          >
            <i className="fa fa-shopping-cart"></i>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-gray-800 p-3 flex items-center space-x-4">
        <div className="flex-grow flex bg-gray-900 rounded p-1">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="bg-transparent border-none px-2 py-1 flex-grow focus:outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="bg-red-900 hover:bg-red-800 px-3 rounded">
            <i className="fa fa-search"></i>
          </button>
        </div>
        
        <div className="flex space-x-1">
          <button 
            className={`px-3 py-1 rounded text-sm ${activeCategory === 'all' ? 'bg-red-800' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${activeCategory === 'hardware' ? 'bg-red-800' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setActiveCategory('hardware')}
          >
            <i className="fa fa-microchip mr-1"></i>
            Hardware
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${activeCategory === 'software' ? 'bg-red-800' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setActiveCategory('software')}
          >
            <i className="fa fa-code mr-1"></i>
            Software
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${activeCategory === 'data' ? 'bg-red-800' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setActiveCategory('data')}
          >
            <i className="fa fa-database mr-1"></i>
            Data
          </button>
          <button 
            className={`px-3 py-1 rounded text-sm ${activeCategory === 'services' ? 'bg-red-800' : 'bg-gray-700 hover:bg-gray-600'}`}
            onClick={() => setActiveCategory('services')}
          >
            <i className="fa fa-concierge-bell mr-1"></i>
            Services
          </button>
        </div>
      </div>
      
      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center mr-3">
                    <i className={`fa ${product.image} text-lg ${
                      product.category === 'hardware' ? 'text-blue-400' :
                      product.category === 'software' ? 'text-green-400' :
                      product.category === 'data' ? 'text-yellow-400' :
                      'text-purple-400'
                    }`}></i>
                  </div>
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="flex items-center mt-1">
                      {renderRarityBadge(product.rarity)}
                      {!product.inStock && (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs bg-red-900 text-red-200 uppercase">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-mono text-green-400">
                  {formatPrice(product.price)}
                </div>
              </div>
              
              <div className="px-4 pb-2">
                <p className="text-sm text-gray-400 line-clamp-2 h-10">{product.description}</p>
              </div>
              
              <div className="flex border-t border-gray-700">
                <button 
                  className="flex-1 py-2 text-center hover:bg-gray-700 text-sm"
                  onClick={() => viewProductDetails(product)}
                >
                  <i className="fa fa-info-circle mr-1"></i>
                  Details
                </button>
                <button 
                  className={`flex-1 py-2 text-center text-sm ${
                    product.inStock ? 'bg-red-900 hover:bg-red-800' : 'bg-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => product.inStock && addToCart(product)}
                  disabled={!product.inStock}
                >
                  <i className="fa fa-cart-plus mr-1"></i>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <i className="fa fa-search text-4xl mb-4"></i>
            <p>No products found matching your criteria.</p>
          </div>
        )}
      </div>
      
      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-end z-50">
          <div className="bg-gray-900 w-full max-w-md flex flex-col h-full">
            <div className="p-4 bg-black flex items-center justify-between border-b border-gray-800">
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowCart(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <i className="fa fa-shopping-cart text-3xl text-gray-600"></i>
                </div>
                <p className="text-gray-400 text-center">Your cart is empty</p>
                <button 
                  className="mt-4 px-4 py-2 bg-red-900 hover:bg-red-800 rounded"
                  onClick={() => setShowCart(false)}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto p-4">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center py-3 border-b border-gray-800">
                      <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center mr-3">
                        <i className={`fa ${item.product.image} ${
                          item.product.category === 'hardware' ? 'text-blue-400' :
                          item.product.category === 'software' ? 'text-green-400' :
                          item.product.category === 'data' ? 'text-yellow-400' :
                          'text-purple-400'
                        }`}></i>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-gray-400">{formatPrice(item.product.price)} each</div>
                      </div>
                      
                      <div className="flex items-center">
                        <button 
                          className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-l"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        >
                          <i className="fa fa-minus text-xs"></i>
                        </button>
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-800">
                          {item.quantity}
                        </div>
                        <button 
                          className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-r"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        >
                          <i className="fa fa-plus text-xs"></i>
                        </button>
                      </div>
                      
                      <div className="w-20 text-right font-mono text-green-400 ml-3">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                      
                      <button 
                        className="ml-3 text-gray-400 hover:text-red-500"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-gray-800 border-t border-gray-700">
                  <div className="flex justify-between mb-2">
                    <div className="text-gray-400">Subtotal</div>
                    <div className="font-mono">{formatPrice(cartTotal)}</div>
                  </div>
                  <div className="flex justify-between mb-4">
                    <div className="text-gray-400">Black Market Tax</div>
                    <div className="font-mono">$0</div>
                  </div>
                  <div className="flex justify-between text-lg font-semibold mb-4">
                    <div>Total</div>
                    <div className="font-mono text-green-400">{formatPrice(cartTotal)}</div>
                  </div>
                  
                  <button 
                    className={`w-full py-3 rounded text-white font-medium ${
                      cartTotal <= userInventory.balance 
                        ? 'bg-red-800 hover:bg-red-700' 
                        : 'bg-gray-800 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={handleCheckout}
                    disabled={cartTotal > userInventory.balance}
                  >
                    {cartTotal <= userInventory.balance ? (
                      <>
                        <i className="fa fa-lock mr-2"></i>
                        Checkout Securely
                      </>
                    ) : (
                      <>
                        <i className="fa fa-exclamation-circle mr-2"></i>
                        Insufficient Funds
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Product Detail Modal */}
      {showProductDetail && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setShowProductDetail(false)}
        >
          <div 
            className="bg-gray-900 rounded-lg w-full max-w-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 bg-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedProduct.name}</h2>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowProductDetail(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center mr-4">
                  <i className={`fa ${selectedProduct.image} text-3xl ${
                    selectedProduct.category === 'hardware' ? 'text-blue-400' :
                    selectedProduct.category === 'software' ? 'text-green-400' :
                    selectedProduct.category === 'data' ? 'text-yellow-400' :
                    'text-purple-400'
                  }`}></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {renderRarityBadge(selectedProduct.rarity)}
                    <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 uppercase">
                      {selectedProduct.category}
                    </span>
                    {!selectedProduct.inStock && (
                      <span className="ml-2 px-2 py-0.5 rounded text-xs bg-red-900 text-red-200 uppercase">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 mb-4">{selectedProduct.description}</p>
                  
                  <div className="bg-black bg-opacity-50 p-3 rounded">
                    <div className="text-sm text-gray-400 mb-1">Risk Assessment</div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Detection Risk</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i 
                              key={i}
                              className={`fa ${i < 2 ? 'fa-shield-alt text-green-500' : 'fa-shield-alt text-gray-600'} mr-1`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Legal Risk</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i 
                              key={i}
                              className={`fa ${i < 4 ? 'fa-gavel text-red-500' : 'fa-gavel text-gray-600'} mr-1`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Technical Difficulty</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i 
                              key={i}
                              className={`fa ${i < 3 ? 'fa-cog text-yellow-500' : 'fa-cog text-gray-600'} mr-1`}
                            ></i>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 italic">
                      * All transactions are conducted through encrypted channels and cannot be traced back to you.
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-400">Price</div>
                  <div className="text-2xl font-mono text-green-400">{formatPrice(selectedProduct.price)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Availability</div>
                  <div className={selectedProduct.inStock ? 'text-green-400' : 'text-red-400'}>
                    {selectedProduct.inStock ? 'In Stock' : 'Currently Unavailable'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Owned</div>
                  <div>{userInventory.ownedItems[selectedProduct.id] || 0}</div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded"
                  onClick={() => setShowProductDetail(false)}
                >
                  Cancel
                </button>
                <button 
                  className={`flex-1 py-2 rounded ${
                    selectedProduct.inStock ? 'bg-red-800 hover:bg-red-700' : 'bg-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (selectedProduct.inStock) {
                      addToCart(selectedProduct);
                      setShowProductDetail(false);
                    }
                  }}
                  disabled={!selectedProduct.inStock}
                >
                  <i className="fa fa-cart-plus mr-1"></i>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Status footer */}
      <div className="bg-black bg-opacity-80 p-2 text-xs text-gray-500 flex justify-between">
        <div className="flex items-center">
          <i className="fa fa-shield-alt mr-1"></i>
          <span>Connection: Encrypted</span>
        </div>
        <div className="flex items-center">
          <i className="fa fa-eye-slash mr-1"></i>
          <span>Tracking Protection: Active</span>
        </div>
        <div className="flex items-center">
          <i className="fa fa-user-secret mr-1"></i>
          <span>Identity: Anonymous</span>
        </div>
      </div>
    </div>
  );
};

export default BlackMarketShop;