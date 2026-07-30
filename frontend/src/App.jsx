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
  Tag,
  Sun,
  Moon
} from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
export default function App() {
  // Theme State (defaults to false / Light mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('aura_drive_dark_mode');
    return savedTheme !== null ? JSON.parse(savedTheme) : false; // Default to false (white theme)
  });

  // Authentication State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('aura_drive_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  // Toggle Theme handler
  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('aura_drive_dark_mode', JSON.stringify(nextMode));
  };

  // Sync dark class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
      let url = `${API_BASE_URL}/api/vehicles`;
      if (isSearch) {
        const queryParams = new URLSearchParams();
        if (searchMake) queryParams.append('make', searchMake);
        if (searchModel) queryParams.append('model', searchModel);
        if (searchCategory) queryParams.append('category', searchCategory);
        if (searchMinPrice) queryParams.append('minPrice', searchMinPrice);
        if (searchMaxPrice) queryParams.append('maxPrice', searchMaxPrice);
       url = `${API_BASE_URL}/api/vehicles/search?${queryParams.toString()}`;
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
     const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
     const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
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
     const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/purchase`, {

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
     const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
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
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${selectedVehicle.id}`, {
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
     const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
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
     const response = await fetch(`${API_BASE_URL}/api/vehicles/${selectedVehicle.id}/restock`, {
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
    <div className={`min-h-screen relative flex flex-col transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`} style={{ backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }}>
      
      {/* Background Aura Gradients */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none z-0 transition-opacity duration-300 ${
        isDarkMode 
          ? 'bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(139,92,246,0.18),rgba(255,255,255,0))]'
          : 'bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(139,92,246,0.08),rgba(255,255,255,0))]'
      }`} />
      <div className={`absolute top-[400px] left-[-200px] w-[600px] h-[600px] pointer-events-none z-0 transition-opacity duration-300 ${
        isDarkMode 
          ? 'bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_60%)]'
          : 'bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.02),transparent_60%)]'
      }`} />

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-lg animate-bounce-short transition-colors duration-300 ${
          notification.type === 'success' 
            ? isDarkMode ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : isDarkMode ? 'bg-rose-950/80 border-rose-500/30 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
          ) : (
            <AlertCircle className={`w-5 h-5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Auth Screen (Login / Register) */}
      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-10 relative z-10">
          
          {/* Top-Right Theme Toggle Button (Auth screen) */}
          <button
            onClick={toggleTheme}
            className={`absolute top-6 right-6 p-3 rounded-2xl border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-3 rounded-2xl shadow-lg shadow-violet-650/15">
              <Car className="w-8 h-8 text-white animate-pulse" />
            </div>

            <span className={`text-2xl font-bold tracking-wider bg-gradient-to-r bg-clip-text text-transparent ${
              isDarkMode ? 'from-violet-400 via-indigo-200 to-white' : 'from-violet-700 via-indigo-600 to-slate-900'
            }`}>
              AURA DRIVE
            </span>
          </div>

          {/* Login / Register Card */}
          <div className={`w-full max-w-md border p-8 rounded-3xl shadow-xl relative transition-all duration-300 ${
            isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'
          }`}>

            {/* Small top accent */}
            <div className={`absolute top-0 right-8 left-8 h-[2px] bg-gradient-to-r from-transparent to-transparent ${
              isDarkMode ? 'via-violet-500/40' : 'via-violet-500/20'
            }`} />

            {/* Heading */}
            <h2 className={`text-2xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {authView === 'login' ? 'Sign In' : 'Create Account'}
            </h2>

            {/* Description */}
            <p className={`text-sm text-center mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {authView === 'login'
                ? 'Enter your credentials to access the dealership'
                : 'Create a customer account to browse and purchase vehicles'}
            </p>

            {/* Authentication Error */}
            {authError && (
              <div className={`border text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2 ${
                isDarkMode ? 'bg-rose-950/40 border-rose-800/50 text-rose-300' : 'bg-rose-50 border-rose-205 text-rose-700'
              }`}>
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={authView === 'login' ? handleLogin : handleRegister}
              className="space-y-5"
            >

              {/* Username */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-455' : 'text-slate-500'}`}>
                  Username
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className={`w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950/80 border-slate-800/60 focus:border-violet-500 text-slate-100 placeholder-slate-600'
                        : 'bg-slate-50 border-slate-205 focus:border-violet-500 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-455' : 'text-slate-500'}`}>
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={`w-full border rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950/80 border-slate-800/60 focus:border-violet-500 text-slate-100 placeholder-slate-600'
                        : 'bg-slate-50 border-slate-205 focus:border-violet-500 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-600/20 transition-all mt-2 cursor-pointer"
              >
                {authView === 'login' ? 'Sign In' : 'Register Account'}
              </button>

            </form>

            {/* Login / Register Switch */}
            <div className={`mt-6 text-center border-t pt-5 ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'}`}>

              <span className="text-xs text-slate-500">
                {authView === 'login'
                  ? "Don't have an account?"
                  : 'Already registered?'}
              </span>

              <button
                type="button"
                onClick={() => {
                  setAuthView(authView === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-xs font-semibold text-violet-500 hover:text-violet-400 ml-1 underline cursor-pointer"
              >
                {authView === 'login'
                  ? 'Create one now'
                  : 'Sign in instead'}
              </button>

            </div>

            {/* Registration Information */}
            {authView === 'register' && (
              <div className={`mt-5 border rounded-xl px-4 py-3 flex items-start gap-2 ${
                isDarkMode ? 'bg-violet-955/20 border-violet-900/30' : 'bg-violet-50 border-violet-100'
              }`}>

                <Shield className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />

                <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  New accounts are registered as
                  <span className="font-semibold text-violet-500"> Customer </span>
                  accounts.
                </p>

              </div>
            )}

          </div>

        </div>
      ) : (
        /* Main Application Dashboard */
        <div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <header className={`flex flex-col sm:flex-row items-center justify-between gap-4 border px-6 py-4 rounded-3xl mb-6 transition-all duration-300 ${
            isDarkMode ? 'bg-slate-900/40 border-slate-900 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            
            {/* Logo + Brand */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-violet-600/20">
                <Car className="w-6 h-6 text-white" />
              </div>

              <div>
                <span className={`text-lg font-bold tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  AURA DRIVE
                </span>
                <span className="text-xs text-slate-505 block">
                  Car Dealership System
                </span>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-850 text-amber-400 hover:text-amber-300 hover:bg-slate-900'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-850 hover:bg-slate-50'
                }`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Logged-in User */}
              <div className={`flex items-center gap-2.5 border px-4 py-2 rounded-xl ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-slow" />

                <span className="text-sm font-semibold">
                  {user.username}
                </span>

                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                    user.role === 'ADMIN'
                      ? isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-205'
                      : isDarkMode ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-violet-50 text-violet-600 border border-violet-205'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              {/* Admin Add Vehicle Button */}
              {user.role === 'ADMIN' && (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-violet-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle</span>
                </button>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 border text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>

            </div>
          </header>

          {/* Filters Panel */}
          <section className={`border p-6 rounded-3xl mb-6 shadow-sm transition-all duration-300 ${
            isDarkMode ? 'bg-slate-900/30 border-slate-900' : 'bg-white border-slate-200'
          }`}>
            
            {/* Heading */}
            <div className="flex items-center gap-2 mb-5">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-violet-955/40' : 'bg-violet-55'}`}>
                <SlidersHorizontal className="w-4 h-4 text-violet-500" />
              </div>

              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                Filter Inventory
              </h3>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              
              {/* Make */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Make
                </label>

                <input
                  type="text"
                  value={searchMake}
                  onChange={(e) => setSearchMake(e.target.value)}
                  placeholder="e.g. Toyota"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-955 border-slate-900 focus:bg-slate-950 focus:border-violet-500 text-slate-200 placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Model */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Model
                </label>

                <input
                  type="text"
                  value={searchModel}
                  onChange={(e) => setSearchModel(e.target.value)}
                  placeholder="e.g. Camry"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-955 border-slate-900 focus:bg-slate-950 focus:border-violet-500 text-slate-200 placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Category */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Category
                </label>

                <input
                  type="text"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  placeholder="e.g. Sedan, SUV"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-955 border-slate-900 focus:bg-slate-950 focus:border-violet-500 text-slate-200 placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Min Price */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Min Price
                </label>

                <input
                  type="number"
                  value={searchMinPrice}
                  onChange={(e) => setSearchMinPrice(e.target.value)}
                  placeholder="e.g. 10000"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-955 border-slate-900 focus:bg-slate-950 focus:border-violet-500 text-slate-200 placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Max Price */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Max Price
                </label>

                <input
                  type="number"
                  value={searchMaxPrice}
                  onChange={(e) => setSearchMaxPrice(e.target.value)}
                  placeholder="e.g. 50000"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-slate-955 border-slate-900 focus:bg-slate-950 focus:border-violet-500 text-slate-200 placeholder-slate-600'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-100 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-5">
              
              <button
                type="button"
                onClick={handleResetFilters}
                className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                    : 'border-slate-205 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => fetchVehicles(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-violet-600/20 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>

            </div>
          </section>

          {/* Vehicle Inventory Grid */}
          <main className="flex-1 flex flex-col">

            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Available Vehicles
                </h2>

                <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
                  isDarkMode 
                    ? 'bg-violet-950/20 text-violet-400 border-violet-900/30'
                    : 'bg-violet-50 text-violet-700 border-violet-100'
                }`}>
                  {vehicles.length} listing{vehicles.length !== 1 ? 's' : ''}
                </span>
              </div>

              <button
                onClick={() => fetchVehicles(true)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-violet-400 border-slate-800 bg-slate-900 hover:bg-slate-850'
                    : 'text-slate-500 hover:text-violet-600 border-slate-200 bg-white hover:bg-violet-50 hover:border-violet-200'
                }`}
                title="Refresh inventory"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (

              /* Loading State */
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-violet-600 animate-spin mb-3" />
                <span className="text-slate-505 text-sm">
                  Loading inventory...
                </span>
              </div>

            ) : vehicles.length === 0 ? (

              /* Empty State */
              <div className={`flex-1 flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl ${
                isDarkMode ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-slate-250'
              }`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
                }`}>
                  <Car className="w-7 h-7 text-slate-400" />
                </div>

                <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  No vehicles found matching your criteria
                </p>

                <p className="text-slate-400 text-xs mt-1">
                  Try resetting the filters or adding a new vehicle
                </p>
              </div>

            ) : (

              /* Vehicle Cards */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {vehicles.map((vehicle) => (

                  <div
                    key={vehicle.id}
                    className={`border rounded-2xl p-5 shadow-sm transition-all duration-300 flex flex-col justify-between relative group ${
                      isDarkMode 
                        ? 'bg-slate-900/50 border-slate-900 hover:border-violet-500/30'
                        : 'bg-white border-slate-200 hover:border-violet-200'
                    }`}
                  >

                    {/* Vehicle Information */}
                    <div>

                      {/* Category + Stock */}
                      <div className="flex justify-between items-start gap-2 mb-4">

                        {/* Category */}
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                          isDarkMode 
                            ? 'text-violet-450 bg-violet-955/35 border-violet-900/25'
                            : 'text-violet-700 bg-violet-50 border-violet-100'
                        }`}>
                          <Layers className="w-3.5 h-3.5" />
                          <span>{vehicle.category}</span>
                        </span>

                        {/* Stock */}
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                            vehicle.quantity > 0
                              ? isDarkMode ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/20' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                              : isDarkMode ? 'text-rose-450 bg-rose-955/20 border-rose-900/20' : 'text-rose-700 bg-rose-50 border-rose-100'
                          }`}
                        >
                          {vehicle.quantity > 0
                            ? `${vehicle.quantity} in stock`
                            : 'Out of Stock'}
                        </span>

                      </div>

                      {/* Make + Model */}
                      <h3 className={`text-lg font-bold transition-colors ${
                        isDarkMode ? 'text-white group-hover:text-violet-300' : 'text-slate-900 group-hover:text-violet-750'
                      }`}>
                        {vehicle.make}{' '}
                        <span className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {vehicle.model}
                        </span>
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-1 mt-3">
                        <span className={`text-2xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {formatCurrency(vehicle.price)}
                        </span>
                      </div>

                    </div>

                    {/* Actions */}
                    <div className={`mt-6 pt-4 border-t flex flex-col gap-3 ${
                      isDarkMode ? 'border-slate-800/80' : 'border-slate-100'
                    }`}>

                      {/* Purchase */}
                      <button
                        onClick={() => handlePurchase(vehicle.id)}
                        disabled={vehicle.quantity <= 0}
                        className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                          vehicle.quantity > 0
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/20 cursor-pointer'
                            : isDarkMode ? 'bg-slate-950 border border-slate-900 text-slate-650 cursor-not-allowed' : 'bg-slate-100 border border-slate-205 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Tag className="w-4 h-4" />

                        <span>
                          {vehicle.quantity > 0
                            ? 'Purchase Vehicle'
                            : 'Sold Out'}
                        </span>
                      </button>

                      {/* Admin Controls */}
                      {user.role === 'ADMIN' && (

                        <div className="grid grid-cols-3 gap-2">

                          {/* Stock */}
                          <button
                            onClick={() => openRestockModal(vehicle)}
                            className={`border text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isDarkMode 
                                ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100'
                                : 'bg-white hover:bg-violet-50 border-slate-200 hover:border-violet-200 text-slate-605 hover:text-violet-700'
                            }`}
                            title="Restock"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Stock</span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(vehicle)}
                            className={`border text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isDarkMode 
                                ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100'
                                : 'bg-white hover:bg-violet-50 border-slate-200 hover:border-violet-200 text-slate-605 hover:text-violet-700'
                            }`}
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className={`border text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isDarkMode 
                                ? 'bg-slate-950 hover:bg-rose-950/20 border-slate-800 hover:border-rose-900/30 text-slate-400 hover:text-rose-350'
                                : 'bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-605 hover:text-rose-600'
                            }`}
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
      <footer className={`mt-auto py-8 text-center text-xs relative z-10 border-t ${
        isDarkMode ? 'text-slate-500 border-slate-900/40' : 'text-slate-400 border-slate-200'
      }`}>
        <p>&copy; {new Date().getFullYear()} Aura Drive Dealership Systems. Premium Responsive Workspace.</p>
        <p className="mt-1 flex items-center justify-center gap-1.5">
          <Shield className={`w-3.5 h-3.5 ${isDarkMode ? 'text-violet-600/60' : 'text-violet-500'}`} />
          <span>Stateless JWT Authentication Guard active.</span>
        </p>
      </footer>

      {/* ADMIN MODALS (Add / Edit / Restock) */}
      {activeModal && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md ${
          isDarkMode ? 'bg-slate-955/70' : 'bg-slate-955/20'
        }`} style={{ backgroundColor: 'rgba(2, 6, 17, 0.4)' }}>
          
          <div className={`w-full max-w-lg border rounded-3xl p-6 shadow-2xl relative animate-scale-up ${
            isDarkMode ? 'bg-slate-900 border-slate-850 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            <button
              onClick={() => setActiveModal(null)}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-all cursor-pointer ${
                isDarkMode ? 'text-slate-450 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-605 hover:bg-slate-50'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className={`text-xl font-bold mb-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {activeModal === 'add' && 'Add New Vehicle'}
              {activeModal === 'edit' && 'Edit Vehicle Details'}
              {activeModal === 'restock' && 'Replenish Vehicle Stock'}
            </h3>
            <p className={`text-xs mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {activeModal === 'add' && 'Create a new catalog listing in the inventory database.'}
              {activeModal === 'edit' && 'Modify core characteristics, pricing, or basic specs.'}
              {activeModal === 'restock' && `Increase current stock levels for ${selectedVehicle?.make} ${selectedVehicle?.model}`}
            </p>

            {formError && (
              <div className={`border text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2 ${
                isDarkMode ? 'bg-rose-955/40 border-rose-800/50 text-rose-300' : 'bg-rose-50 border-rose-250 text-rose-700'
              }`}>
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            {/* Restock Form */}
            {activeModal === 'restock' ? (
              <form onSubmit={handleRestockVehicle} className="space-y-4">
                <div className={`border p-4 rounded-xl mb-4 ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'
                }`}>
                  <span className={`text-xs block mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-450'}`}>Current Stock Level</span>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle?.quantity} units</span>
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-550'}`}>Restock Quantity</label>
                  <input 
                    type="number"
                    value={formRestockAmount}
                    onChange={(e) => setFormRestockAmount(e.target.value)}
                    placeholder="Enter additional stock amount"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 focus:border-violet-500 text-slate-200' 
                        : 'bg-slate-50 border-slate-205 focus:border-violet-500 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'border-slate-805 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        : 'border-slate-205 text-slate-550 hover:bg-slate-50'
                    }`}
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
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-455' : 'text-slate-550'}`}>Make</label>
                    <input 
                      type="text"
                      value={formMake}
                      onChange={(e) => setFormMake(e.target.value)}
                      placeholder="e.g. Ford, BMW"
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-slate-955 border-slate-800 focus:border-violet-500 text-slate-200' 
                          : 'bg-slate-50 border-slate-205 focus:border-violet-500 text-slate-850'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-455' : 'text-slate-550'}`}>Model</label>
                    <input 
                      type="text"
                      value={formModel}
                      onChange={(e) => setFormModel(e.target.value)}
                      placeholder="e.g. Mustang, M3"
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-slate-955 border-slate-800 focus:border-violet-500 text-slate-200' 
                          : 'bg-slate-50 border-slate-205 focus:border-violet-500 text-slate-855'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-455' : 'text-slate-550'}`}>Category</label>
                  <input 
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Sports, Sedan, Electric"
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                      isDarkMode 
                        ? 'bg-slate-955 border-slate-800 focus:border-violet-500 text-slate-200' 
                        : 'bg-slate-50 border-slate-205 focus:border-violet-500 text-slate-855'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-455' : 'text-slate-550'}`}>Price ($ USD)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="e.g. 45000"
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-slate-955 border-slate-800 focus:border-violet-500 text-slate-200' 
                          : 'bg-slate-50 border-slate-205 focus:border-violet-500 text-slate-855'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-455' : 'text-slate-550'}`}>Initial Quantity</label>
                    <input 
                      type="number"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      placeholder="e.g. 5"
                      className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        isDarkMode 
                          ? 'bg-slate-955 border-slate-800 focus:border-violet-500 text-slate-200' 
                          : 'bg-slate-50 border-slate-205 focus:border-violet-500 text-slate-855'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      isDarkMode 
                        ? 'border-slate-805 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        : 'border-slate-205 text-slate-550 hover:bg-slate-50'
                    }`}
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
