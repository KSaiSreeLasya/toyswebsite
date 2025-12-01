import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, SalesData, UserRole, AdminPermission, User } from '../types';
import { CATEGORIES } from '../constants';
import { generateProductDescription } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Trash2, Plus, Wand2, PackageOpen, DollarSign, Users, Settings, Save, ShieldCheck, Lock, UserPlus, X, Edit, RotateCcw, AlertTriangle, CreditCard, Key } from 'lucide-react';

// Mock Sales Data
const MOCK_SALES_DATA: SalesData[] = [
  { name: 'Mon', sales: 12000 },
  { name: 'Tue', sales: 19000 },
  { name: 'Wed', sales: 3000 },
  { name: 'Thu', sales: 25000 },
  { name: 'Fri', sales: 42000 },
  { name: 'Sat', sales: 60000 },
  { name: 'Sun', sales: 55000 },
];

const AdminPanel: React.FC = () => {
  const { user, products, addProduct, updateProduct, deleteProduct, orders, shippingPolicy, setShippingPolicy, returnsPolicy, setReturnsPolicy, teamMembers, addTeamMember, removeTeamMember, paymentConfig, updatePaymentConfig } = useStore();
  
  // Determine start tab based on permissions
  const initialTab = user?.permissions?.includes('DASHBOARD') ? 'dashboard' : 
                     user?.permissions?.includes('PRODUCTS') ? 'products' :
                     user?.permissions?.includes('TEAM') ? 'team' : 'policies';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'policies' | 'team'>(initialTab as any);
  
  // Local state for policy editing
  const [tempShipping, setTempShipping] = useState(shippingPolicy);
  const [tempReturns, setTempReturns] = useState(returnsPolicy);
  const [tempPaymentConfig, setTempPaymentConfig] = useState(paymentConfig);

  // New Team Member State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPermissions, setNewMemberPermissions] = useState<AdminPermission[]>([]);

  // Form State for Products
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: '',
    name: '',
    price: 0,
    stock: 0,
    description: '',
    imageUrl: 'https://picsum.photos/400/400'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const hasPermission = (perm: AdminPermission) => user?.permissions?.includes(perm) || false;

  const handleGenerateDesc = async () => {
    if (!newProduct.name || !newProduct.category) return;
    setIsGenerating(true);
    const desc = await generateProductDescription(newProduct.name, newProduct.category);
    setNewProduct(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    
    if (editingId) {
      // Update Existing Product
      updateProduct({
        id: editingId,
        name: newProduct.name,
        description: newProduct.description || '',
        price: Number(newProduct.price),
        category: newProduct.category || 'General',
        stock: Number(newProduct.stock) || 0,
        imageUrl: newProduct.imageUrl || `https://picsum.photos/400/400?random=${Date.now()}`,
        rating: (products.find(p => p.id === editingId)?.rating || 5.0)
      } as Product);
      setEditingId(null);
    } else {
      // Create New Product
      addProduct({
        id: Date.now().toString(),
        name: newProduct.name,
        description: newProduct.description || '',
        price: Number(newProduct.price),
        category: newProduct.category || 'General',
        stock: Number(newProduct.stock) || 0,
        imageUrl: `https://picsum.photos/400/400?random=${Date.now()}`,
        rating: 5.0
      } as Product);
    }

    // Reset Form
    setNewProduct({
      category: '',
      name: '',
      price: 0,
      stock: 0,
      description: '',
      imageUrl: 'https://picsum.photos/400/400'
    });
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description,
      imageUrl: product.imageUrl
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewProduct({
      category: 'Construction',
      name: '',
      price: 0,
      stock: 0,
      description: '',
      imageUrl: 'https://picsum.photos/400/400'
    });
  };

  const saveSettings = () => {
    setShippingPolicy(tempShipping);
    setReturnsPolicy(tempReturns);
    updatePaymentConfig(tempPaymentConfig);
    alert("Settings & Keys updated successfully!");
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberName) return;

    const newMember: User = {
        id: Date.now().toString(),
        name: newMemberName,
        email: newMemberEmail,
        role: UserRole.ADMIN,
        permissions: newMemberPermissions.length > 0 ? newMemberPermissions : ['DASHBOARD'] // Default to at least dashboard
    };

    addTeamMember(newMember);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberPermissions([]);
    alert("Team member added!");
  };

  const togglePermission = (perm: AdminPermission) => {
    if (newMemberPermissions.includes(perm)) {
        setNewMemberPermissions(prev => prev.filter(p => p !== perm));
    } else {
        setNewMemberPermissions(prev => [...prev, perm]);
    }
  };
  
  const confirmDelete = () => {
    if (deleteConfirmationId) {
        deleteProduct(deleteConfirmationId);
        setDeleteConfirmationId(null);
    }
  };

  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

  return (
    <div className="space-y-8 relative">
      {/* Header Tabs - Permission Gated */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border-2 border-gray-100 flex gap-2 overflow-x-auto">
        {hasPermission('DASHBOARD') && (
            <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-primary-500 text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-50'}`}
            >
            <DollarSign size={18} /> Dashboard
            </button>
        )}
        {hasPermission('PRODUCTS') && (
            <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-secondary-500 text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-50'}`}
            >
            <PackageOpen size={18} /> Products
            </button>
        )}
        {hasPermission('POLICIES') && (
            <button
            onClick={() => {
                setActiveTab('policies');
                setTempShipping(shippingPolicy);
                setTempReturns(returnsPolicy);
                setTempPaymentConfig(paymentConfig);
            }}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'policies' ? 'bg-accent-500 text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-50'}`}
            >
            <Settings size={18} /> Settings
            </button>
        )}
        {hasPermission('TEAM') && (
            <button
            onClick={() => setActiveTab('team')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'team' ? 'bg-blue-500 text-white shadow-md transform scale-105' : 'text-gray-500 hover:bg-gray-50'}`}
            >
            <ShieldCheck size={18} /> Team Access
            </button>
        )}
      </div>

      {activeTab === 'dashboard' && hasPermission('DASHBOARD') && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-green-100 flex items-center gap-4 card-pop">
              <div className="p-4 bg-green-100 text-green-600 rounded-2xl">
                <DollarSign size={32} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
                <p className="text-3xl font-heading font-black text-gray-800">₹{totalRevenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-blue-100 flex items-center gap-4 card-pop">
               <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
                <PackageOpen size={32} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Orders</p>
                <p className="text-3xl font-heading font-black text-gray-800">{orders.length}</p>
              </div>
            </div>
             <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-purple-100 flex items-center gap-4 card-pop">
               <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl">
                <Users size={32} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Active Products</p>
                <p className="text-3xl font-heading font-black text-gray-800">{products.length}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-100">
              <h3 className="text-xl font-heading font-bold text-gray-800 mb-6">Weekly Sales Fun (₹)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_SALES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#fdf2f8'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="sales" fill="#8b5cf6" radius={[8, 8, 8, 8]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-gray-100">
              <h3 className="text-xl font-heading font-bold text-gray-800 mb-6">Revenue Rainbow (₹)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_SALES_DATA}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                     <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Line type="monotone" dataKey="sales" stroke="#ec4899" strokeWidth={4} dot={{r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#fff'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && hasPermission('PRODUCTS') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-4 duration-500">
          {/* Add/Edit Product Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border-2 border-primary-100 h-fit sticky top-24">
            <h3 className="text-xl font-heading font-bold text-gray-800 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                    {editingId ? <Edit size={20} /> : <Plus size={20} />}
                 </div>
                 {editingId ? 'Edit Toy' : 'New Toy Creator'}
              </div>
              {editingId && (
                <button onClick={cancelEditing} className="text-sm text-red-500 flex items-center gap-1 hover:underline">
                    <X size={14} /> Cancel
                </button>
              )}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input
                  required
                  type="text"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:outline-none transition-all"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="e.g. Super Robot 3000"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:outline-none transition-all"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:outline-none transition-all"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category (Collection)</label>
                <input
                  list="category-options"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:outline-none transition-all"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  placeholder="Select or Type New Collection"
                />
                <datalist id="category-options">
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <p className="text-xs text-gray-400 mt-1">Type a new name to create a new collection!</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex justify-between items-center">
                  Description
                  <button
                    type="button"
                    onClick={handleGenerateDesc}
                    disabled={isGenerating || !newProduct.name}
                    className="text-xs bg-gradient-to-r from-secondary-500 to-primary-500 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Wand2 size={12} /> {isGenerating ? 'Magic...' : 'AI Fun-ify!'}
                  </button>
                </label>
                <textarea
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:outline-none text-sm transition-all"
                  rows={4}
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>

              <button
                type="submit"
                className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-all btn-funky ${editingId ? 'bg-orange-500 hover:bg-orange-600 border-orange-700' : 'bg-secondary-600 hover:bg-secondary-700 border-secondary-800'}`}
              >
                {editingId ? 'Save Changes' : 'Add to Shelf'}
              </button>
            </form>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100">
             <h3 className="text-xl font-heading font-bold text-gray-800 mb-6">Current Inventory ({products.length})</h3>
             <div className="overflow-y-auto max-h-[600px] pr-2 space-y-4">
                 {products.map(p => (
                   <div key={p.id} className={`flex items-center justify-between p-4 border-2 rounded-2xl transition-all bg-white ${editingId === p.id ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100 hover:border-primary-200'}`}>
                      <div className="flex items-center gap-4">
                        <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-200" />
                        <div>
                          <p className="font-heading font-bold text-gray-800 text-lg">{p.name}</p>
                          <p className="text-sm text-gray-500 font-medium">{p.category} • <span className="text-green-600">₹{p.price.toFixed(2)}</span> • Stock: {p.stock}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                            onClick={() => startEditing(p)}
                            className="text-gray-400 hover:text-orange-500 p-2 rounded-xl hover:bg-orange-50 transition-colors"
                            title="Edit"
                        >
                            <Edit size={20} />
                        </button>
                        <button 
                            onClick={() => setDeleteConfirmationId(p.id)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={20} />
                        </button>
                      </div>
                   </div>
                 ))}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'policies' && hasPermission('POLICIES') && (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-sm border-2 border-accent-100 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-accent-100 text-accent-600 rounded-2xl">
                    <Settings size={28} />
                 </div>
                 <div>
                     <h3 className="text-2xl font-heading font-black text-gray-800">Store Settings Manager</h3>
                     <p className="text-gray-500">Edit policies and configure integrations.</p>
                 </div>
            </div>

            <div className="space-y-12">
                {/* Policies Section */}
                <div className="space-y-6">
                    <h4 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2">Store Policies</h4>
                    <div>
                        <label className="block text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span>🚀</span> Shipping Policy
                        </label>
                        <textarea 
                            className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-accent-100 focus:border-accent-400 focus:outline-none transition-all text-gray-700 leading-relaxed"
                            rows={3}
                            value={tempShipping}
                            onChange={(e) => setTempShipping(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span>🌈</span> Returns & Exchanges Policy
                        </label>
                        <textarea 
                            className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-4 focus:ring-accent-100 focus:border-accent-400 focus:outline-none transition-all text-gray-700 leading-relaxed"
                            rows={3}
                            value={tempReturns}
                            onChange={(e) => setTempReturns(e.target.value)}
                        />
                    </div>
                </div>

                {/* Payment Configuration Section */}
                <div className="space-y-6">
                    <h4 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <CreditCard size={20} className="text-gray-500"/> Payment Gateway Configuration
                    </h4>
                    <p className="text-sm text-gray-500">Securely add API keys here to enable real payments in future updates.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                                Stripe Publishable Key <Key size={14} className="text-gray-400"/>
                            </label>
                            <input 
                                type="text"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-accent-100 focus:border-accent-400 focus:outline-none transition-all font-mono text-sm"
                                placeholder="pk_test_..."
                                value={tempPaymentConfig.stripePublishableKey}
                                onChange={(e) => setTempPaymentConfig({...tempPaymentConfig, stripePublishableKey: e.target.value})}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                                Razorpay Key ID <Key size={14} className="text-gray-400"/>
                            </label>
                            <input 
                                type="text"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-accent-100 focus:border-accent-400 focus:outline-none transition-all font-mono text-sm"
                                placeholder="rzp_test_..."
                                value={tempPaymentConfig.razorpayKeyId}
                                onChange={(e) => setTempPaymentConfig({...tempPaymentConfig, razorpayKeyId: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                                PayPal Client ID <Key size={14} className="text-gray-400"/>
                            </label>
                            <input 
                                type="text"
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-accent-100 focus:border-accent-400 focus:outline-none transition-all font-mono text-sm"
                                placeholder="Client ID"
                                value={tempPaymentConfig.paypalClientId}
                                onChange={(e) => setTempPaymentConfig({...tempPaymentConfig, paypalClientId: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button 
                        onClick={saveSettings}
                        className="flex items-center gap-2 bg-accent-500 text-white px-8 py-3 rounded-full font-bold hover:bg-accent-600 btn-funky border-accent-700"
                    >
                        <Save size={20} /> Save All Settings
                    </button>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'team' && hasPermission('TEAM') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4">
             {/* Add Team Member */}
             <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border-2 border-blue-100 h-fit">
                <h3 className="text-xl font-heading font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><UserPlus size={20} /></div>
                    Add Team Member
                </h3>
                <form onSubmit={handleAddTeamMember} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                        <input
                        required
                        type="text"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-all"
                        value={newMemberName}
                        onChange={e => setNewMemberName(e.target.value)}
                        placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email (Login ID)</label>
                        <input
                        required
                        type="email"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-all"
                        value={newMemberEmail}
                        onChange={e => setNewMemberEmail(e.target.value)}
                        placeholder="john@wonderland.com"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Module Access</label>
                        <div className="space-y-2">
                             {(['DASHBOARD', 'PRODUCTS', 'POLICIES', 'TEAM'] as AdminPermission[]).map((perm) => (
                                 <div key={perm} className="flex items-center gap-2 cursor-pointer" onClick={() => togglePermission(perm)}>
                                     <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${newMemberPermissions.includes(perm) ? 'bg-blue-500 border-blue-600' : 'border-gray-300 bg-gray-50'}`}>
                                         {newMemberPermissions.includes(perm) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                     </div>
                                     <span className="text-sm font-medium text-gray-600 capitalize">{perm.toLowerCase()}</span>
                                 </div>
                             ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all btn-funky border-blue-800"
                    >
                        Create Account
                    </button>
                </form>
             </div>

             {/* Team List */}
             <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-100">
                <h3 className="text-xl font-heading font-bold text-gray-800 mb-6">Current Team ({teamMembers.length})</h3>
                <div className="overflow-y-auto max-h-[600px] space-y-4">
                    {teamMembers.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No team members added yet.</p>
                    ) : (
                        teamMembers.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-200 transition-colors bg-white">
                                <div className="flex flex-col">
                                    <p className="font-heading font-bold text-gray-800 text-lg">{member.name}</p>
                                    <p className="text-sm text-gray-500">{member.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        {member.permissions?.map(p => (
                                            <span key={p} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-bold">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeTeamMember(member.id)}
                                    className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors"
                                    title="Revoke Access"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
             </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-red-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                    <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-gray-800">Delete Toy? 😢</h3>
                </div>
                <p className="text-gray-600 mb-6 font-medium">
                    Are you sure you want to delete <span className="font-bold text-red-500">{products.find(p => p.id === deleteConfirmationId)?.name}</span>? This magic cannot be undone!
                </p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setDeleteConfirmationId(null)}
                        className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 btn-funky border-red-700"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
