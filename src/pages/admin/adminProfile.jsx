import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/layout/AdminLayout";
import { Check, User, Loader2 } from "lucide-react"; 
import { toast } from "react-toastify";
import { apiCall } from "../../utils/api.js";
import "./adminProfile.css"; 

const AdminProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    title: '',
    language: 'English'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await apiCall('/admin/profile');
        if (data.success && data.data) {
          setFormData({
            username: user.username || user.name || '',
            email: data.data.email || '',
            password: '',
            fullName: data.data.name || '',
            title: data.data.title || '',
            language: data.data.language || 'English'
          });
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName) {
      toast.error('Email and Full Name are required');
      return;
    }

    try {
      setIsSaving(true);
      const updateData = {
        name: formData.fullName,
        phone: formData.phone || '',
        title: formData.title,
        language: formData.language
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }

      const data = await apiCall('/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (data.success) {
        toast.success('Profile updated successfully!');
        // Update global auth state if needed
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="userprofile-page">
          <div className="userprofile-container">
            <div style={{display: 'flex', justifyContent: 'center', padding: '40px'}}>
              <Loader2 className="animate-spin" size={32} />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <AdminLayout>
        <div className="userprofile-page">
          <div className="userprofile-container">
            <h2>Access Denied</h2>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="userprofile-page">
        <div className="userprofile-container">
          <div className="userprofile-header">
            <h2 className="userprofile-username">{formData.username || 'Admin'}</h2>
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="userprofile-save-btn"
            >
              {isSaving ? <Loader2 className="animate-spin userprofile-save-icon" size={18} /> : <Check className="userprofile-save-icon" />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div className="userprofile-profile">
            <div className="userprofile-avatar">
              <User className="userprofile-avatar-icon" />
            </div>

            <div className="userprofile-info">
              <h3 className="userprofile-name">{formData.fullName}</h3>
              <a href={`mailto:${formData.email}`} className="userprofile-email">
                {formData.email}
              </a>
            </div>
          </div>

          <div className="userprofile-form-section">
            <h3 className="userprofile-form-title">Account</h3>
            <hr className="userprofile-divider" />

            <form className="userprofile-form" onSubmit={(e) => e.preventDefault()}>
              <label>Username</label>
              <input 
                name="username" 
                type="text" 
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
              />

              <label>Email <span>*</span></label>
              <input 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />

              <label>Password</label>
              <input 
                name="password" 
                type="password" 
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password (leave blank to keep current)"
              />

              <label>Full Name <span>*</span></label>
              <input 
                name="fullName" 
                type="text" 
                value={formData.fullName}
                onChange={handleInputChange}
                required 
              />

              <label>Title</label>
              <input 
                name="title" 
                type="text" 
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Title"
              />

              <label>Language</label>
              <select 
                name="language"
                value={formData.language}
                onChange={handleInputChange}
              >
                <option>English</option>
                <option>Arabic</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;

