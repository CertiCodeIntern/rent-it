import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from './ClientShellLayout';
import './css/ClientProfilePage.css';

const API_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';
const PUBLIC_BASE = '/rent-it';

function ClientProfilePage() {
  const { setUser: setShellUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [memberSince, setMemberSince] = useState('');

  useEffect(() => {
    let mounted = true;

    fetch(`${API_BASE}/client/dashboard/dashboard.php?format=json`, {
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data?.user) return;
        const u = data.user;
        setFormData({
          full_name: u.full_name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: u.address || '',
        });
        setMemberSince(u.member_since || '');

        const profilePic = u.profile_picture
          ? `${PUBLIC_BASE}/assets/profile/${u.profile_picture}`
          : `${PUBLIC_BASE}/assets/images/default-avatar.png`;
        setAvatarPreview(profilePic);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load profile information.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const formEl = e.target;
      const fd = new FormData(formEl);

      const res = await fetch(`${API_BASE}/shared/php/update_profile.php`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data?.message || 'Update failed.');
        setSaving(false);
        return;
      }

      const updated = {
        ...formData,
      };
      const newProfilePic = data.profile_picture || null;
      if (newProfilePic) {
        updated.profile_picture = newProfilePic;
        setAvatarPreview(`${PUBLIC_BASE}/assets/profile/${newProfilePic}`);
      }
      // sync user info in localStorage and update shell avatar
      const existing = JSON.parse(localStorage.getItem('user') || '{}');
      const nextUser = {
        ...existing,
        full_name: updated.full_name,
        email: updated.email,
        phone: updated.phone,
        profile_picture: newProfilePic || existing.profile_picture,
      };
      localStorage.setItem('user', JSON.stringify(nextUser));
      setShellUser((prev) => ({ ...prev, ...nextUser }));

      setSuccess('Your profile has been updated.');
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayMemberSince = memberSince ? `Member since ${memberSince}` : '';

  return (
    <div className="content-area client-profile-page">
      <div className="page-header-dashboard">
        <div className="page-header-info">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your personal information and account settings</p>
        </div>
      </div>

      {error && (
        <div className="client-profile-alert client-profile-alert-error">
          {error}
        </div>
      )}
      {success && (
        <div className="client-profile-alert client-profile-alert-success">
          {success}
        </div>
      )}

      {loading ? (
        <p>Loading profile...</p>
      ) : (
        <div className="client-profile-grid">
          <div className="client-profile-sidebar-card">
            <div className="client-profile-avatar-wrapper">
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="client-profile-avatar-img"
                />
              )}
              <label
                htmlFor="client-profile-pic"
                className="client-profile-avatar-upload"
                title="Change Photo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </label>
            </div>
            <div className="client-profile-sidebar-name">
              {formData.full_name || 'User'}
            </div>
            <div className="client-profile-sidebar-role">Customer</div>

            <div className="client-profile-sidebar-meta">
              <div className="client-profile-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>{formData.email || 'Not set'}</span>
              </div>
              <div className="client-profile-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{formData.phone || 'Not set'}</span>
              </div>
              {displayMemberSince && (
                <div className="client-profile-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{displayMemberSince}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="client-profile-form-card">
              <div className="client-profile-form-header">
                <h2>Personal Information</h2>
                <p>Update your personal details below</p>
              </div>

              <form onSubmit={handleSubmit}>
                <input
                  type="file"
                  id="client-profile-pic"
                  name="profile_pic"
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleAvatarChange}
                />

                <div className="client-profile-form-grid">
                  <div className="client-profile-form-group">
                    <label htmlFor="full_name">Full Name</label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="client-profile-form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="client-profile-form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="client-profile-form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="client-profile-form-actions">
                  <button
                    type="button"
                    className="client-profile-btn-secondary"
                    onClick={() => window.location.reload()}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="client-profile-btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            <div className="client-profile-security-card">
              <h2>Security</h2>
              <p>Manage your account security settings</p>
              <div className="client-profile-security-item">
                <div className="client-profile-security-info">
                  <h4>Password</h4>
                  <p>Change your account password</p>
                </div>
                <button
                  type="button"
                  className="client-profile-btn-security"
                  onClick={() => window.alert('Password change feature coming soon.')}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientProfilePage;
