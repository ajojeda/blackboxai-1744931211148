import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ColorInput = ({ label, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="flex items-center space-x-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-20 p-1 rounded border border-gray-300"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-2 border border-gray-300 rounded"
        placeholder="#000000"
      />
    </div>
  </div>
);

const SiteAppearanceSettings = () => {
  const { theme, updateTheme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState(theme);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setFormData(theme);
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateTheme(formData);
      setSuccessMessage('Site appearance updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update site appearance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Here you would typically upload the file to your server
    // and get back the URL. This is a placeholder for that logic.
    setFormData({
      ...formData,
      logoUrl: URL.createObjectURL(file),
    });
  };

  if (!user?.isAdmin) {
    return (
      <div className="p-4">
        <p className="text-red-600">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Appearance Settings</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <ColorInput
            label="Primary Color"
            value={formData.primary}
            onChange={(value) => setFormData({ ...formData, primary: value })}
          />
          
          <ColorInput
            label="Secondary Color"
            value={formData.secondary}
            onChange={(value) => setFormData({ ...formData, secondary: value })}
          />
          
          <ColorInput
            label="Main Grey"
            value={formData.mainGrey}
            onChange={(value) => setFormData({ ...formData, mainGrey: value })}
          />
          
          <ColorInput
            label="Accent Grey"
            value={formData.accentGrey}
            onChange={(value) => setFormData({ ...formData, accentGrey: value })}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo
            </label>
            <div className="flex items-center space-x-4">
              <img
                src={formData.logoUrl}
                alt="Site Logo"
                className="h-16 w-auto object-contain border border-gray-200 rounded p-2"
              />
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recommended size: 200x50 pixels
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded bg-blue-600 text-white font-medium
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
        <div className="p-4 border rounded-lg">
          <div className="space-y-4">
            <div className="h-8 rounded" style={{ backgroundColor: formData.primary }}></div>
            <div className="h-8 rounded" style={{ backgroundColor: formData.secondary }}></div>
            <div className="h-8 rounded" style={{ backgroundColor: formData.mainGrey }}></div>
            <div className="h-8 rounded" style={{ backgroundColor: formData.accentGrey }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteAppearanceSettings;
