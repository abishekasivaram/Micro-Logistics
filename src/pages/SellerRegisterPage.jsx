import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Store, Eye, EyeOff, Info, CheckSquare } from 'lucide-react';
import './AuthPages.css';

const SellerRegisterPage = () => {
  const navigate = useNavigate();
  const { registerSeller, vendors } = useAppContext();

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessAddress: '',
    cityArea: 'T. Nagar, Chennai',
    category: 'Local Grocery Store',
    description: '',
    logo: '',
    operatingHours: '7:00 AM - 9:00 PM',
    acceptTerms: false,
    agreeNetwork: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showGoogleNotice, setShowGoogleNotice] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.businessName || !formData.ownerName || !formData.username || !formData.email || !formData.password || !formData.phone || !formData.businessAddress) {
      setErrorMsg('Please fill in all required business information fields.');
      return;
    }

    const existingShop = vendors.find(v => (v.shopName || v.name).toLowerCase() === formData.businessName.toLowerCase());
    if (existingShop) {
      setErrorMsg('Shop Name already exists. Please choose a different Shop Name.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!formData.acceptTerms || !formData.agreeNetwork) {
      setErrorMsg('You must accept the Terms & Conditions and agree to participate in the local delivery network.');
      return;
    }

    registerSeller(formData);
    navigate('/vendor-dashboard');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wide">
        <div className="auth-header">
          <Link to="/login" className="back-link-dark">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
          <h2>Seller Business Registration</h2>
          <p>Register your local store to join the Smart Micro-Logistics delivery network.</p>
        </div>

        {errorMsg && (
          <div className="auth-error-banner">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-grid">
          <div className="form-group">
            <label>Business / Store Name *</label>
            <input 
              type="text" 
              name="businessName" 
              className="form-control" 
              placeholder="e.g. Namma Chennai Grocers"
              value={formData.businessName} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Owner / Manager Name *</label>
            <input 
              type="text" 
              name="ownerName" 
              className="form-control" 
              placeholder="e.g. Subramaniam V."
              value={formData.ownerName} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Seller Username *</label>
            <input 
              type="text" 
              name="username" 
              className="form-control" 
              placeholder="e.g. nammachennai"
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Business Email *</label>
            <input 
              type="email" 
              name="email" 
              className="form-control" 
              placeholder="contact@store.com"
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Business Category *</label>
            <select 
              name="category" 
              className="form-control" 
              value={formData.category} 
              onChange={handleChange}
            >
              <option value="Local Grocery Store">Local Grocery Store</option>
              <option value="Fresh Fruits & Vegetables">Fresh Fruits & Vegetables</option>
              <option value="Bakery">Bakery & Confectionery</option>
              <option value="Pharmacy">Pharmacy & Healthcare</option>
              <option value="Electronics Store">Electronics & Accessories</option>
              <option value="Clothing Store">Apparel & Textiles</option>
              <option value="Stationery Shop">Stationery & Bookshop</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contact Phone *</label>
            <input 
              type="tel" 
              name="phone" 
              className="form-control" 
              placeholder="9840123456"
              value={formData.phone} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                className="form-control" 
                placeholder="••••••••"
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input 
              type={showPassword ? "text" : "password"} 
              name="confirmPassword" 
              className="form-control" 
              placeholder="Re-enter password"
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group full-width">
            <label>Business Pickup Address *</label>
            <input 
              type="text" 
              name="businessAddress" 
              className="form-control" 
              placeholder="Store Address, Street Name, Landmark"
              value={formData.businessAddress} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>City / Area Hub *</label>
            <select 
              name="cityArea" 
              className="form-control" 
              value={formData.cityArea} 
              onChange={handleChange}
            >
              <option value="T. Nagar, Chennai">T. Nagar, Chennai</option>
              <option value="Adyar, Chennai">Adyar, Chennai</option>
              <option value="Velachery, Chennai">Velachery, Chennai</option>
              <option value="Mylapore, Chennai">Mylapore, Chennai</option>
              <option value="Anna Nagar, Chennai">Anna Nagar, Chennai</option>
              <option value="Triplicane, Chennai">Triplicane, Chennai</option>
            </select>
          </div>

          <div className="form-group">
            <label>Operating Hours</label>
            <input 
              type="text" 
              name="operatingHours" 
              className="form-control" 
              placeholder="7:00 AM - 9:00 PM"
              value={formData.operatingHours} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group full-width">
            <label>Business Description</label>
            <textarea 
              name="description" 
              className="form-control" 
              rows="2"
              placeholder="Brief description of products sold..."
              value={formData.description} 
              onChange={handleChange} 
            ></textarea>
          </div>

          <div className="form-group full-width">
            <label>Business Logo URL (Optional)</label>
            <input 
              type="url" 
              name="logo" 
              className="form-control" 
              placeholder="https://..."
              value={formData.logo} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group full-width checkboxes-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="acceptTerms" 
                checked={formData.acceptTerms} 
                onChange={handleChange} 
                required
              />
              <span>I accept the Terms & Conditions for micro-logistics sellers *</span>
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="agreeNetwork" 
                checked={formData.agreeNetwork} 
                onChange={handleChange} 
                required
              />
              <span>I agree to participate in the local delivery network coordination *</span>
            </label>
          </div>

          <div className="auth-actions-full full-width">
            <button type="submit" className="btn btn-primary btn-lg w-full">
              <Store size={20} style={{ marginRight: '8px' }} /> Register as Seller
            </button>
          </div>
        </form>

        <div className="auth-footer-text">
          <span>Already registered as a seller? <Link to="/login">Sign In</Link></span>
        </div>
      </div>
    </div>
  );
};

export default SellerRegisterPage;
