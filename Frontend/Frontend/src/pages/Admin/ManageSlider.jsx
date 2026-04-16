import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { Pencil, Trash2, Plus, X, Eye } from 'lucide-react';
import api from '../../services/adminendpoint';

const ManageSlider = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    classText: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState('');

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const response = await axios.post(api.slider.getSlider);
      if (response.data.success) {
        setSliders(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch sliders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      buttonText: '',
      classText: '',
      image: null
    });
    setImagePreview('');
    setIsEditing(false);
    setSelectedSlider(null);
  };

  const handleCreateClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (slider) => {
    setIsEditing(true);
    setSelectedSlider(slider);
    setFormData({
      title: slider.title || '',
      subtitle: slider.subtitle || '',
      buttonText: slider.buttonText || '',
      classText: slider.classText || '',
      image: null 
    });
    setImagePreview(slider.image); 
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subtitle) {
      toast.error('Title and subtitle are required');
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('buttonText', formData.buttonText);
      formDataToSend.append('classText', formData.classText);
      formDataToSend.append("sliderId", selectedSlider?._id);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (isEditing) {
        response = await axios.post(
          api.slider.editSlider, 
          formDataToSend
        );
        if (response.data.success) {
          toast.success('Slider updated successfully');
        }
      } else {
        response = await axios.post(api.slider.createSlider, formDataToSend);
        if (response.data.success) {
          toast.success('Slider created successfully');
        }
      }

      setShowModal(false);
      resetForm();
      fetchSliders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
const handleDelete = async (slider) => {
  if (window.confirm(`Are you sure you want to delete "${slider.title}"?`)) {
    setLoading(true);
    try {
      const response = await axios.post(api.slider.deleteSlider,{
        sliderId:slider._id
      });
     console.log(response)
    } catch (error) {
      toast.error('Failed to delete slider');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
};

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Sliders</h1>
              <p className="text-gray-600 mt-1">Create, edit, and manage homepage sliders</p>
            </div>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <Plus size={20} />
              Add New Slider
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sliders Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtitle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Text
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Button Text
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && sliders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : sliders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <p className="text-lg">No sliders found</p>
                        <button
                          onClick={handleCreateClick}
                          className="mt-2 text-blue-600 hover:text-blue-700"
                        >
                          Create your first slider
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sliders.map((slider) => (
                    <tr key={slider._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          {slider.image ? (
                            <img
                              src={slider.image}
                              alt={slider.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Eye size={24} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{slider.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">{slider.subtitle}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {slider.classText ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {slider.classText}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{slider.buttonText || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(slider.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(slider)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(slider)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? 'Edit Slider' : 'Create New Slider'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter slider title"
                  required
                />
              </div>

              {/* Subtitle */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle *
                </label>
                <textarea
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter slider subtitle"
                  required
                />
              </div>

              {/* Class Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Text
                </label>
                <input
                  type="text"
                  name="classText"
                  value={formData.classText}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Featured, New, Popular, Limited Time"
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be displayed as a badge on the slider (e.g., "New", "Featured", "Special Offer")
                </p>
              </div>

              {/* Button Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Learn More, Get Started"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slider Image {!isEditing && '*'}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-32 w-auto object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="image-upload"
                              name="image"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <p className="mt-2 text-xs text-gray-500">
                    Leave empty to keep the current image
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    isEditing ? 'Update Slider' : 'Create Slider'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSlider;