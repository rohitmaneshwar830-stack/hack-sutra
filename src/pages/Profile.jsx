import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, CheckCircle, Save, Languages } from 'lucide-react';
import { api } from '../utils/api';

export default function Profile() {
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState('Kanpur Nagar');
  const [lang, setLang] = useState('English');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setDistrict(user?.department || 'Kanpur Nagar');
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) return;

    setIsSaving(true);
    try {
      if (user?.id) {
        await api.put(`/users/${user.id}`, { name, phone, department: district, language: lang });
      }

      const saved = localStorage.getItem('ganga_guardian_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.name = name;
        parsed.phone = phone;
        parsed.department = district;
        parsed.language = lang;
        localStorage.setItem('ganga_guardian_user', JSON.stringify(parsed));
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-left min-h-[calc(100vh-200px)]">
      <div className="border-b pb-4 mb-8">
        <h1 className="text-2xl font-black text-primary font-outfit uppercase">
          My Account Profile
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
          Manage your personal citizen identity and telemetry preferences
        </p>
      </div>

      <div className="bg-white border border-gray-200 shadow-xl p-8 rounded-sm">
        
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 p-4 mb-6 rounded flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-safe-green shrink-0" />
            <p className="text-xs font-bold text-safe-green uppercase tracking-wide">
              Profile updated successfully!
            </p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          
          {/* Email (Readonly) */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Registered Email (Security ID)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                readOnly
                value={user?.email || ''}
                className="w-full pl-10.5 pr-4 py-2.5 border border-gray-200 rounded-sm text-sm bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10.5 pr-4 py-2.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50/30"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Mobile Contact Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Phone className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765-43210"
                className="w-full pl-10.5 pr-4 py-2.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50/30"
              />
            </div>
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Primary Monitoring District
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white cursor-pointer"
            >
              <option>Kanpur Nagar</option>
              <option>Prayagraj</option>
              <option>Varanasi</option>
              <option>Haridwar</option>
              <option>Patna</option>
            </select>
          </div>

          {/* Language Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Preferred Language
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Languages className="h-4.5 w-4.5" />
              </span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full pl-10.5 pr-4 py-2.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white cursor-pointer"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Marathi</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-3 rounded-sm shadow-md transition-colors uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 text-accent" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Account Settings'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
