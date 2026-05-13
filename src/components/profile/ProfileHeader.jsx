import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, Edit3, Settings, MessageSquare, Users, Camera, X, FileText, Mail, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const ProfileHeader = ({ user, isOwnProfile, onUpdateUser }) => {
  const { updateUser: updateGlobalUser } = useAuthStore();
  
  // File inputs
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user.DisplayName || '',
    homeCity: user.HomeCity || '',
    bio: user.Bio || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // --- Handlers ---

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.put('/users/me/profile', editForm);
      
      // Safely handle server response
      const updatedUser = res.data?.user;
      if (updatedUser) {
        onUpdateUser({
          DisplayName: updatedUser.displayName || editForm.displayName,
          HomeCity: updatedUser.homeCity || editForm.homeCity,
          Bio: updatedUser.bio || editForm.bio
        });
        updateGlobalUser({
          displayName: updatedUser.displayName || editForm.displayName,
          homeCity: updatedUser.homeCity || editForm.homeCity,
          bio: updatedUser.bio || editForm.bio
        });
      } else {
        // Server returned success but no user data — update with local form values
        onUpdateUser({
          DisplayName: editForm.displayName,
          HomeCity: editForm.homeCity,
          Bio: editForm.bio
        });
        updateGlobalUser({
          displayName: editForm.displayName,
          homeCity: editForm.homeCity,
          bio: editForm.bio
        });
      }
      
      toast.success('Profile updated successfully');
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Profile update error:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      toast.error(serverMsg || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    const isAvatar = type === 'avatar';
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 5MB.');
      if (e.target) e.target.value = null;
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      if (e.target) e.target.value = null;
      return;
    }

    const formData = new FormData();
    formData.append(type, file);

    const setUploading = isAvatar ? setUploadingAvatar : setUploadingCover;
    const endpoint = `/users/me/${type}`;

    try {
      setUploading(true);
      const res = await api.put(endpoint, formData, {
        headers: { 'Content-Type': undefined }
      });
      
      const newUrl = isAvatar ? res.data.avatarURL : res.data.coverPhotoURL;
      
      onUpdateUser(isAvatar ? { AvatarURL: newUrl } : { CoverPhotoURL: newUrl });
      if (isAvatar) {
        updateGlobalUser({ avatarURL: newUrl });
      }
      
      toast.success(`${isAvatar ? 'Avatar' : 'Cover photo'} updated successfully`);
    } catch (err) {
      console.error('Upload error:', err);
      if (err.response?.status === 501) {
        toast.error('Cloudinary keys are missing in backend .env', { duration: 4000 });
      } else {
        const msg = err.response?.data?.error || `Failed to upload ${type}`;
        toast.error(msg);
      }
    } finally {
      setUploading(false);
      if (e.target) e.target.value = null; // reset input
    }
  };

  // Sync edit form when modal opens
  const openEditModal = () => {
    setEditForm({
      displayName: user.DisplayName || '',
      homeCity: user.HomeCity || '',
      bio: user.Bio || ''
    });
    setIsEditModalOpen(true);
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', background: 'var(--ink)', 
    border: '1px solid var(--border)', borderRadius: 8, color: 'var(--paper)', fontSize: 14,
    fontFamily: 'inherit', transition: 'border-color 0.2s',
    outline: 'none',
  };

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: 6,
    marginBottom: 6, fontSize: 12, color: 'var(--muted)',
    fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.3px'
  };

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #0d1a2e 0%, #1a2744 50%, #0a0e1a 100%)',
        padding: 'clamp(90px, 10vw, 120px) 0 0',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background Cover Image */}
        {user.CoverPhotoURL && (
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.3, zIndex: 0,
            backgroundImage: `url(${user.CoverPhotoURL})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            mixBlendMode: 'overlay'
          }} />
        )}
        
        {/* Decorative background */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,84,26,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,253,248,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,253,248,0.02) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

        {isOwnProfile && (
          <button 
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            style={{
              position: 'absolute', top: 20, right: 20, zIndex: 2,
              background: 'rgba(0,0,0,0.5)', color: 'white',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20,
              padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer', backdropFilter: 'blur(4px)'
            }}
          >
            <Camera size={14} />
            {uploadingCover ? 'Uploading...' : 'Change Cover'}
          </button>
        )}

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap', paddingBottom: 28 }}>
              
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                {user.AvatarURL ? (
                  <img src={user.AvatarURL} alt={user.DisplayName} style={{
                    width: 100, height: 100, borderRadius: '50%',
                    border: '4px solid rgba(232,84,26,0.4)',
                    objectFit: 'cover', opacity: uploadingAvatar ? 0.5 : 1
                  }} />
                ) : (
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'rgba(232,84,26,0.15)',
                    border: '4px solid rgba(232,84,26,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 46, opacity: uploadingAvatar ? 0.5 : 1
                  }}>{user.Avatar || '🌍'}</div>
                )}
                
                {isOwnProfile && (
                  <button 
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    style={{
                      position: 'absolute', bottom: 2, right: 2,
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--accent)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #0a0e1a', cursor: 'pointer',
                    }}>
                    <Camera size={13} />
                  </button>
                )}
              </div>

              {/* Name block */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: 'var(--paper)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {user.DisplayName}
                  </h1>
                  {user.Role === 'creator' && (
                    <span style={{ background: 'rgba(129,236,255,0.15)', color: 'var(--accent)', fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: 1, padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(129,236,255,0.3)' }}>CREATOR</span>
                  )}
                </div>
                
                {/* Bio / tagline */}
                {user.Bio && (
                  <p style={{ color: 'rgba(247,244,238,0.6)', fontSize: 13, marginBottom: 8, lineHeight: 1.4, maxWidth: 500 }}>
                    {user.Bio}
                  </p>
                )}
                {!user.Bio && (
                  <p style={{ color: 'rgba(247,244,238,0.45)', fontSize: 13, marginBottom: 8 }}>Traveller</p>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  {user.HomeCity && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(247,244,238,0.5)', fontSize: 12 }}>
                      <MapPin size={12} /> {user.HomeCity}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(247,244,238,0.5)', fontSize: 12 }}>
                    <Globe size={12} /> Joined {formatDate(user.CreatedAt)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {isOwnProfile ? (
                  <>
                    <button onClick={openEditModal} className="btn btn-outline" style={{ fontSize: 12, padding: '9px 18px' }}>
                      <Edit3 size={13} /> Edit Profile
                    </button>
                    <button onClick={() => toast('Settings panel coming soon!', { icon: '⚙️' })} className="btn btn-ghost" style={{ width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid rgba(255,253,248,0.15)' }}>
                      <Settings size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/messages" className="btn btn-outline" style={{ fontSize: 12, padding: '9px 18px' }}>
                      <MessageSquare size={13} /> Message
                    </Link>
                    <button className="btn btn-primary" style={{ fontSize: 12, padding: '9px 18px' }}>
                      <Users size={13} /> Connect
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hidden File Inputs */}
        <input type="file" ref={avatarInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
        <input type="file" ref={coverInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'var(--surface2)', padding: 32, borderRadius: 16, width: '90%', maxWidth: 440,
                border: '1px solid var(--border)', boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
                maxHeight: '90vh', overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--paper)', fontSize: 20, fontWeight: 700 }}>Edit Profile</h2>
                <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                {/* Display Name */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>
                    <Edit3 size={11} /> Display Name
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={editForm.displayName}
                    onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
                    style={inputStyle}
                    placeholder="Your display name"
                  />
                </div>

                {/* Email (read-only) */}
                {user.Email && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>
                      <Mail size={11} /> Email
                    </label>
                    <input 
                      type="email" 
                      value={user.Email}
                      readOnly
                      style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                    />
                    <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, opacity: 0.7 }}>
                      Email cannot be changed here
                    </p>
                  </div>
                )}

                {/* Home City */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>
                    <Home size={11} /> Home City
                  </label>
                  <input 
                    type="text" 
                    value={editForm.homeCity}
                    onChange={e => setEditForm({ ...editForm, homeCity: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. London, UK"
                  />
                </div>

                {/* Bio / About Me */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>
                    <FileText size={11} /> About Me
                  </label>
                  <textarea 
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    maxLength={500}
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: 72,
                    }}
                    placeholder="Tell fellow travellers about yourself..."
                  />
                  <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>
                    {editForm.bio.length}/500
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-ghost">Cancel</button>
                  <button type="submit" disabled={isSaving} className="btn btn-primary">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileHeader;
