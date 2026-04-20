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
      image: null
    });

    setImagePreview(slider.image);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      const formDataToSend = new FormData();
      formDataToSend.append("sliderId", selectedSlider?._id);


      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (isEditing) {
        response = await axios.post(api.slider.editSlider, formDataToSend);
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
    if (window.confirm(`Are you sure you want to delete this slider?`)) {

      setLoading(true);
      try {
        const response = await axios.post(api.slider.deleteSlider, {
          sliderId: slider._id
        });
        console.log(response);
        if (response.data.success) {
          toast.success('Slider deleted successfully');
          fetchSliders();
        }
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

      {/* Header - Responsive */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Sliders</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Create, edit, and manage homepage sliders</p>
            </div>
            <button
              onClick={handleCreateClick}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
            >
              <Plus size={18} />
              <span className="hidden xs:inline">Add New Slider</span>
              <span className="xs:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Mobile Card View - For screens below 768px */}
        <div className="block md:hidden space-y-3 sm:space-y-4">
          {loading && sliders.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : sliders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
              <div className="text-gray-500">
                <Eye size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-base sm:text-lg">No sliders found</p>
                <button
                  onClick={handleCreateClick}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                >
                  Create your first slider
                </button>
              </div>
            </div>
          ) : (
            sliders.map((slider) => (
              <div key={slider._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-4">
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100">
                        {slider.image ? (
                          <img
                            src={slider.image}
                            alt={slider.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Eye size={24} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(slider.createdAt).toLocaleDateString()}
                      </p>
                    </div>


                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleEditClick(slider)}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(slider)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View - For screens 768px and above */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slider Preview
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && sliders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : sliders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="text-gray-500">
                        <Eye size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-base sm:text-lg">No sliders found</p>
                        <button
                          onClick={handleCreateClick}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Create your first slider
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sliders.map((slider) => (
                    <tr key={slider._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100">
                          {slider.image ? (
                            <img
                              src={slider.image}
                              alt={slider.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/56x56?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Eye size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">Slider Image</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(slider.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(slider)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(slider)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Create/Edit Modal - Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                {isEditing ? 'Edit Slider' : 'Create New Slider'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6">


              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Slider Image {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <div className="mt-1 flex justify-center px-4 sm:px-6 pt-4 pb-5 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto h-28 sm:h-32 w-auto object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
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
                        <div className="flex justify-center text-xs sm:text-sm text-gray-600">

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
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
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