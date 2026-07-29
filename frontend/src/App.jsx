import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Search, 
  Plus, 
  LogOut, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  DollarSign, 
  Layers, 
  User, 
  Lock, 
  SlidersHorizontal,
  X,
  AlertCircle,
  CheckCircle2,
  Shield,
  HelpCircle,
  Tag
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('aura_drive_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regRole, setRegRole] = useState('USER'); // 'USER' | 'ADMIN'
  const [authError, setAuthError] = useState('');

  // Vehicles State
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter State
  const [searchMake, setSearchMake] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchMinPrice, setSearchMinPrice] = useState('');
  const [searchMaxPrice, setSearchMaxPrice] = useState('');

  // Modal & Admin State
  const [activeModal, setActiveModal] = useState(null); // null | 'add' | 'edit' | 'restock'
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // Form States (for Add / Edit / Restock)
  const [formMake, setFormMake] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formRestockAmount, setFormRestockAmount] = useState('');
  const [formError, setFormError] = useState('');

  // Notification Toast State
  const [notification, setNotification] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Fetch Vehicles
  const fetchVehicles = async (isSearch = false) => {
    if (!user) return;
    setIsLoading(true);
    try {
      let url = '/api/vehicles';
      if (isSearch) {
        const queryParams = new URLSearchParams();
        if (searchMake) queryParams.append('make', searchMake);
        if (searchModel) queryParams.append('model', searchModel);
        if (searchCategory) queryParams.append('category', searchCategory);
        if (searchMinPrice) queryParams.append('minPrice', searchMinPrice);
        if (searchMaxPrice) queryParams.append('maxPrice', searchMaxPrice);
        url = `/api/vehicles/search?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      } else {
        showToast('Failed to fetch vehicles', 'error');
      }
    } catch (err) {
      showToast('Network error fetching vehicles', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on login
  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  // Auth: Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!username || !password) {
      setAuthError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('aura_drive_user', JSON.stringify(data));
        setUser(data);
        showToast(`Welcome back, ${data.username}!`);
        // Clear auth inputs
        setUsername('');
        setPassword('');
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Network error connecting to auth server');
    }
  };

  // Auth: Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!username || !password) {
      setAuthError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: regRole })
      });
      const data = await response.json();
      if (response.ok) {
        showToast('Registration successful! Please login.');
        setAuthView('login');
        setAuthError('');
      } else {
        setAuthError(data.error || 'Registration failed');
      }
    } catch (err) {
      setAuthError('Network error connecting to auth server');
    }
  };

  // Auth: Logout
  const handleLogout = () => {
    localStorage.removeItem('aura_drive_user');
    setUser(null);
    setVehicles([]);
    showToast('Logged out successfully');
  };

  // Reset Search Filters
  const handleResetFilters = () => {
    setSearchMake('');
    setSearchModel('');
    setSearchCategory('');
    setSearchMinPrice('');
    setSearchMaxPrice('');
    // Proactively fetch all vehicles immediately
    setTimeout(() => {
      fetchVehicles();
    }, 50);
  };

  // Actions: Purchase
  const handlePurchase = async (vehicleId) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        showToast('Purchase completed! Stock updated.');
        // Update local list state directly or refetch
        setVehicles(prev => prev.map(v => v.id === vehicleId ? data : v));
      } else {
        showToast(data.error || 'Failed to complete purchase', 'error');
      }
    } catch (err) {
      showToast('Network error processing purchase', 'error');
    }
  };

  // Modals Open handlers
  const openAddModal = () => {
    setFormMake('');
    setFormModel('');
    setFormCategory('');
    setFormPrice('');
    setFormQuantity('');
    setFormError('');
    setActiveModal('add');
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormMake(vehicle.make);
    setFormModel(vehicle.model);
    setFormCategory(vehicle.category);
    setFormPrice(vehicle.price.toString());
    setFormQuantity(vehicle.quantity.toString());
    setFormError('');
    setActiveModal('edit');
  };

  const openRestockModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormRestockAmount('');
    setFormError('');
    setActiveModal('restock');
  };

  // Admin Actions: Create
  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formMake || !formModel || !formCategory || !formPrice || !formQuantity) {
      setFormError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          make: formMake,
          model: formModel,
          category: formCategory,
          price: parseFloat(formPrice),
          quantity: parseInt(formQuantity)
        })
      });
      const data = await response.json();
      if (response.ok) {
        showToast('Vehicle added to inventory!');
        setActiveModal(null);
        fetchVehicles(); // Refresh list
      } else {
        setFormError(data.error || 'Failed to add vehicle');
      }
    } catch (err) {
      setFormError('Network error adding vehicle');
    }
  };

  // Admin Actions: Edit
  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formMake || !formModel || !formCategory || !formPrice || !formQuantity) {
      setFormError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch(`/api/vehicles/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          make: formMake,
          model: formModel,
          category: formCategory,
          price: parseFloat(formPrice),
          quantity: parseInt(formQuantity)
        })
      });
      const data = await response.json();
      if (response.ok) {
        showToast('Vehicle details updated!');
        setActiveModal(null);
        setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? data : v));
      } else {
        setFormError(data.error || 'Failed to update vehicle');
      }
    } catch (err) {
      setFormError('Network error updating vehicle');
    }
  };

  // Admin Actions: Delete
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to delete this vehicle from inventory?')) return;
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        showToast('Vehicle deleted successfully');
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      } else {
        showToast('Failed to delete vehicle', 'error');
      }
    } catch (err) {
      showToast('Network error deleting vehicle', 'error');
    }
  };

  // Admin Actions: Restock
  const handleRestockVehicle = async (e) => {
    e.preventDefault();
    setFormError('');
    const amount = parseInt(formRestockAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Please enter a positive restock quantity');
      return;
    }
    try {
      const response = await fetch(`/api/vehicles/${selectedVehicle.id}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ quantity: amount })
      });
      const data = await response.json();
      if (response.ok) {
        showToast('Vehicle stock replenished!');
        setActiveModal(null);
        setVehicles(prev => prev.map(v => v.id === selectedVehicle.id ? data : v));
      } else {
        setFormError(data.error || 'Failed to restock vehicle');
      }
    } catch (err) {
      setFormError('Network error restocking vehicle');
    }
  };

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-100 flex flex-col">
      {/* Background Aura Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(139,92,246,0.18),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="absolute top-[400px] left-[-200px] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_60%)] pointer-events-none z-0" />
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-lg animate-bounce-short ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500/30 text-rose-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Auth Screen (Login / Register) */}
      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-violet-600/20">
              <Car className="w-8 h-8 text-white animate-pulse" />
            </div>
            <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-violet-400 via-indigo-200 to-white bg-clip-text text-transparent">AURA DRIVE</span>
          </div>

          <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative">
            <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
            
            <h2 className="text-2xl font-bold text-center text-white mb-2">
              {authView === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-slate-400 text-sm text-center mb-6">
              {authView === 'login' ? 'Enter credentials to manage and browse inventory' : 'Choose a role and register your user'}
            </p>

            {authError && (
              <div className="bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={authView === 'login' ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-slate-950/80 border border-slate-800/60 focus:border-violet-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950/80 border border-slate-800/60 focus:border-violet-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              {authView === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assign Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegRole('USER')}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                        regRole === 'USER'
                          ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-md shadow-violet-500/10'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Customer (USER)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('ADMIN')}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                        regRole === 'ADMIN'
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Dealership (ADMIN)
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-600/25 transition-all mt-6 cursor-pointer"
              >
                {authView === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-slate-800/50 pt-4">
              <span className="text-xs text-slate-400">
                {authView === 'login' ? "Don't have an account?" : "Already registered?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAuthView(authView === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 ml-1 underline cursor-pointer"
              >
                {authView === 'login' ? 'Create one now' : 'Sign in instead'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Main Application Dashboard */
        <div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-900 backdrop-blur-md px-6 py-4 rounded-3xl mb-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-md">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-wider text-white">AURA DRIVE</span>
                <span className="text-xs text-slate-500 block">Car Dealership System</span>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="flex items-center gap-2.5 bg-slate-950/60 border border-slate-800/80 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-slow" />
                <span className="text-sm font-medium text-slate-300">{user.username}</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                  user.role === 'ADMIN' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                    : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                }`}>
                  {user.role}
                </span>
              </div>

              {user.role === 'ADMIN' && (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-violet-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* Filters Panel */}
          <section className="bg-slate-900/30 border border-slate-900 backdrop-blur-md p-6 rounded-3xl mb-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Filter Inventory</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Make</label>
                <input 
                  type="text"
                  value={searchMake}
                  onChange={(e) => setSearchMake(e.target.value)}
                  placeholder="e.g. Toyota"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-violet-500/60 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Model</label>
                <input 
                  type="text"
                  value={searchModel}
                  onChange={(e) => setSearchModel(e.target.value)}
                  placeholder="e.g. Camry"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-violet-500/60 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
                <input 
                  type="text"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  placeholder="e.g. Sedan, SUV"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-violet-500/60 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Min Price</label>
                <input 
                  type="number"
                  value={searchMinPrice}
                  onChange={(e) => setSearchMinPrice(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-violet-500/60 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Price</label>
                <input 
                  type="number"
                  value={searchMaxPrice}
                  onChange={(e) => setSearchMaxPrice(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-950 border border-slate-900 focus:border-violet-500/60 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-sm font-semibold transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => fetchVehicles(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-violet-600/10 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </section>

          {/* Vehicle Inventory Grid */}
          <main className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Available Vehicles</span>
                <span className="bg-slate-900 text-slate-400 text-xs px-2.5 py-1 rounded-md font-medium border border-slate-800">
                  {vehicles.length} listing{vehicles.length !== 1 ? 's' : ''}
                </span>
              </h2>

              <button 
                onClick={() => fetchVehicles(true)} 
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
                title="Refresh inventory"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-violet-500 animate-spin mb-3" />
                <span className="text-slate-400 text-sm">Loading inventory...</span>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl">
                <Car className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No vehicles found matching your criteria</p>
                <p className="text-slate-650 text-xs mt-1">Try resetting the filters or adding a new vehicle</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id} 
                    className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-900/80 hover:border-violet-500/20 backdrop-blur-sm rounded-2xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between relative group"
                  >
                    <div>
                      {/* Badge / Pill */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/10">
                          <Layers className="w-3.5 h-3.5" />
                          <span>{vehicle.category}</span>
                        </span>

                        <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                          vehicle.quantity > 0 
                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10'
                            : 'text-rose-400 bg-rose-500/10 border border-rose-500/10'
                        }`}>
                          {vehicle.quantity > 0 ? `${vehicle.quantity} in stock` : 'Out of Stock'}
                        </span>
                      </div>

                      {/* Make & Model */}
                      <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                        {vehicle.make} <span className="text-slate-400 font-medium">{vehicle.model}</span>
                      </h3>
                      
                      {/* Price tag */}
                      <div className="flex items-baseline gap-1 mt-3">
                        <span className="text-2xl font-extrabold text-white tracking-tight">
                          {formatCurrency(vehicle.price)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-900/60 flex flex-col gap-3">
                      {/* Action buttons */}
                      <button
                        onClick={() => handlePurchase(vehicle.id)}
                        disabled={vehicle.quantity <= 0}
                        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          vehicle.quantity > 0 
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/10' 
                            : 'bg-slate-950 border border-slate-900 text-slate-650 cursor-not-allowed'
                        }`}
                      >
                        <Tag className="w-4 h-4" />
                        <span>{vehicle.quantity > 0 ? 'Purchase Vehicle' : 'Sold Out'}</span>
                      </button>

                      {/* Admin-only options */}
                      {user.role === 'ADMIN' && (
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => openRestockModal(vehicle)}
                            className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            title="Restock"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Stock</span>
                          </button>
                          <button
                            onClick={() => openEditModal(vehicle)}
                            className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/30 text-slate-400 hover:text-rose-350 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-650 relative z-10 border-t border-slate-900/40">
        <p>&copy; {new Date().getFullYear()} Aura Drive Dealership Systems. Premium Responsive Workspace.</p>
        <p className="mt-1 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-violet-600/60" />
          <span>Stateless JWT Authentication Guard active.</span>
        </p>
      </footer>

      {/* ADMIN MODALS (Add / Edit / Restock) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-slate-950/70">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1.5">
              {activeModal === 'add' && 'Add New Vehicle'}
              {activeModal === 'edit' && 'Edit Vehicle Details'}
              {activeModal === 'restock' && 'Replenish Vehicle Stock'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {activeModal === 'add' && 'Create a new catalog listing in the inventory database.'}
              {activeModal === 'edit' && 'Modify core characteristics, pricing, or basic specs.'}
              {activeModal === 'restock' && `Increase current stock levels for ${selectedVehicle?.make} ${selectedVehicle?.model}`}
            </p>

            {formError && (
              <div className="bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            {/* Restock Form */}
            {activeModal === 'restock' ? (
              <form onSubmit={handleRestockVehicle} className="space-y-4">
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl mb-4">
                  <span className="text-xs text-slate-450 block mb-1">Current Stock Level</span>
                  <span className="text-sm font-bold text-white">{selectedVehicle?.quantity} units</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Restock Quantity</label>
                  <input 
                    type="number"
                    value={formRestockAmount}
                    onChange={(e) => setFormRestockAmount(e.target.value)}
                    placeholder="Enter additional stock amount"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-sm font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
                  >
                    Replenish Stock
                  </button>
                </div>
              </form>
            ) : (
              /* Add & Edit Forms */
              <form onSubmit={activeModal === 'add' ? handleCreateVehicle : handleUpdateVehicle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Make</label>
                    <input 
                      type="text"
                      value={formMake}
                      onChange={(e) => setFormMake(e.target.value)}
                      placeholder="e.g. Ford, BMW"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Model</label>
                    <input 
                      type="text"
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      placeholder="e.g. Mustang, M3"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <input 
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Sports, Sedan, Electric"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price ($ USD)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="e.g. 45000"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Initial Quantity</label>
                    <input 
                      type="number"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-sm font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
                  >
                    {activeModal === 'add' ? 'Create Listing' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
