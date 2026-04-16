// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import api from '../../../services/adminendpoint';

// const CourseCategory = () => {
//   const [categories, setCategories] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const[categoryId,setCategoryId] = useState("")
//   const [formData, setFormData] = useState({
//     name: '',
//     description: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');

//   // Fetch all categories on component mount
//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(api.category.getcategory);
//       console.log('API Response:', response);
      
//       let categoriesData = [];
//       if (response.data && response.data.data) {
//         categoriesData = response.data.data;
//       } else if (Array.isArray(response.data)) {
//         categoriesData = response.data;
//       } else if (response.data && response.data.categories) {
//         categoriesData = response.data.categories;
//       } else {
//         categoriesData = [];
//       }
      
//       setCategories(categoriesData);
//       setError('');
//     } catch (err) {
//       setError('Failed to fetch categories');
//       console.error('Error fetching categories:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!formData.name.trim()) {
//       setError('Category name is required');
//       return;
//     }

//     try {
//       setLoading(true);
//       let response;
      
//       if (isEditMode && selectedCategory) {
//         const categoryId = selectedCategory._id || selectedCategory.id;
//         console.log(categoryId,"gggggggggggg")
//         response = await axios.post(
//           api.category.UpdateCategory,
//           {
//             categoryId: categoryId,  
//             name: formData.name,
//             description: formData.description
//           },
//           {
//             headers: {
//               'Authorization': `Bearer ${localStorage.getItem('token')}`,
//               'Content-Type': 'application/json'
//             }
//           }
//         );
//         setSuccessMessage('Category updated successfully!');
//       } else {
//         // Create new category
//         response = await axios.post(
//           api.category.createcategory,
//           {
//             name: formData.name,
//             description: formData.description
//           },
//           {
//             headers: {
//               'Authorization': `Bearer ${localStorage.getItem('token')}`,
//               'Content-Type': 'application/json'
//             }
//           }
//         );
//         setSuccessMessage('Category created successfully!');
//       }
      
//       console.log('Response:', response);
      
//       setFormData({ name: '', description: '' });
//       setIsModalOpen(false);
//       setIsEditMode(false);
//       setSelectedCategory(null);
      
//       await fetchCategories();
      
//       setTimeout(() => setSuccessMessage(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
//       console.error(`Error ${isEditMode ? 'updating' : 'creating'} category:`, err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (category) => {
//     setIsEditMode(true);
//     setSelectedCategory(category);
//     setFormData({
//       name: category.name,
//       description: category.description || ''
//     });
//     setIsModalOpen(true);
//     setError('');
//   };

//  const handleDelete = async (categoryId) => {
//   if (window.confirm('Are you sure you want to delete this category?')) {
//     try {
//       setLoading(true);
      
//       const res = await axios.post(
//         api.category.deletecategory,
//         {
//           categoryId: categoryId  
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       console.log('Delete response:', res);
//       setSuccessMessage('Category deleted successfully!');
//       await fetchCategories(); // Refresh the list
//       setTimeout(() => setSuccessMessage(''), 3000);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to delete category');
//       console.error('Error deleting category:', err);
//     } finally {
//       setLoading(false);
//     }
//   }
// };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setIsEditMode(false);
//     setSelectedCategory(null);
//     setFormData({ name: '', description: '' });
//     setError('');
//   };

//   // Format date function
//   const formatDate = (dateString) => {
//     if (!dateString) return '—';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="mb-8 flex justify-between items-center">
//           <div>
//             <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
//               Course Categories
//             </h1>
//             <p className="mt-2 text-sm text-gray-600">
//               Manage and organize your course categories efficiently
//             </p>
//           </div>
//           <button
//             onClick={() => {
//               setIsEditMode(false);
//               setSelectedCategory(null);
//               setFormData({ name: '', description: '' });
//               setIsModalOpen(true);
//               setError('');
//             }}
//             className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//           >
//             <span className="flex items-center gap-2">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//               </svg>
//               Add New Category
//             </span>
//           </button>
//         </div>

//         {/* Success Message */}
//         {successMessage && (
//           <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded shadow-sm">
//             <div className="flex items-center">
//               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <span>{successMessage}</span>
//             </div>
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-sm">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 <span>{error}</span>
//               </div>
//               <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
//                 <span className="text-xl">×</span>
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Loading State */}
//         {loading && categories.length === 0 && (
//           <div className="flex flex-col justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
//             <p className="text-gray-600">Loading categories...</p>
//           </div>
//         )}

//         {/* Categories Table */}
//         {!loading && categories.length > 0 && (
//           <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       S.No
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Category Name
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Description
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Created At
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {categories.map((category, index) => (
//                     <tr key={category._id} className="hover:bg-gray-50 transition duration-150">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {index + 1}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
//                             {category.name.charAt(0).toUpperCase()}
//                           </div>
//                           <div className="ml-3">
//                             <div className="text-sm font-medium text-gray-900">
//                               {category.name}
//                             </div>
//                           </div>
//                         </div>
//                        </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-600 max-w-md">
//                           {category.description || '—'}
//                         </div>
//                        </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {formatDate(category.createdAt)}
//                        </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <button
//                           onClick={() => handleDelete(category._id)}
//                           className="text-red-600 hover:text-red-900 mr-4 transition duration-150 inline-flex items-center gap-1"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                           </svg>
//                           Delete
//                         </button>
//                         <button
//                           onClick={() => handleEdit(category)}
//                           className="text-blue-600 hover:text-blue-900 transition duration-150 inline-flex items-center gap-1"
//                         >
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                           </svg>
//                           Edit
//                         </button>
//                        </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
            
//             {/* Table Footer with Count */}
//             <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
//               <div className="text-sm text-gray-600">
//                 Total Categories: <span className="font-semibold text-gray-900">{categories.length}</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {!loading && categories.length === 0 && (
//           <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
//             <div className="flex flex-col items-center">
//               <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center mb-4">
//                 <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
//               <p className="text-gray-500 mb-6">Get started by creating your first category</p>
//               <button
//                 onClick={() => {
//                   setIsEditMode(false);
//                   setSelectedCategory(null);
//                   setFormData({ name: '', description: '' });
//                   setIsModalOpen(true);
//                 }}
//                 className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                 </svg>
//                 Add New Category
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Modal for Add/Edit Category */}
//         {isModalOpen && (
//           <div className="fixed inset-0 bg-black/60 bg-opacity-50 overflow-y-auto h-full w-full z-50">
//             <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-xl rounded-xl bg-white">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-xl font-bold text-gray-900">
//                   {isEditMode ? 'Edit Category' : 'Create New Category'}
//                 </h3>
//                 <button
//                   onClick={closeModal}
//                   className="text-gray-400 hover:text-gray-600 transition duration-150"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit}>
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Category Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
//                     placeholder="e.g., Web Development, Data Science"
//                     required
//                     autoFocus
//                   />
//                 </div>

//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Description
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleInputChange}
//                     rows="4"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
//                     placeholder="Enter a brief description of the category (optional)"
//                   />
//                 </div>

//                 <div className="flex justify-end space-x-3">
//                   <button
//                     type="button"
//                     onClick={closeModal}
//                     className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150 font-medium"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//                   >
//                     {loading ? (
//                       <span className="flex items-center gap-2">
//                         <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         {isEditMode ? 'Updating...' : 'Creating...'}
//                       </span>
//                     ) : (
//                       isEditMode ? 'Update Category' : 'Create Category'
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CourseCategory;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../services/adminendpoint';

const CourseCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const[categoryId,setCategoryId] = useState("")
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(api.category.getcategory);
      console.log('API Response:', response);
      
      let categoriesData = [];
      if (response.data && response.data.data) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data && response.data.categories) {
        categoriesData = response.data.categories;
      } else {
        categoriesData = [];
      }
      
      setCategories(categoriesData);
      setError('');
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setLoading(true);
      let response;
      
      if (isEditMode && selectedCategory) {
        const categoryId = selectedCategory._id || selectedCategory.id;
        console.log(categoryId,"gggggggggggg")
        response = await axios.post(
          api.category.UpdateCategory,
          {
            categoryId: categoryId,  
            name: formData.name,
            description: formData.description
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSuccessMessage('Category updated successfully!');
      } else {
        // Create new category
        response = await axios.post(
          api.category.createcategory,
          {
            name: formData.name,
            description: formData.description
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSuccessMessage('Category created successfully!');
      }
      
      console.log('Response:', response);
      
      setFormData({ name: '', description: '' });
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedCategory(null);
      
      await fetchCategories();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} category:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setIsEditMode(true);
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setIsModalOpen(true);
    setError('');
  };

 const handleDelete = async (categoryId) => {
  if (window.confirm('Are you sure you want to delete this category?')) {
    try {
      setLoading(true);
      
      const res = await axios.post(
        api.category.deletecategory,
        {
          categoryId: categoryId  
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Delete response:', res);
      setSuccessMessage('Category deleted successfully!');
      await fetchCategories(); // Refresh the list
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
      console.error('Error deleting category:', err);
    } finally {
      setLoading(false);
    }
  }
};

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
    setError('');
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Course Categories
            </h1>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
              Manage and organize your course categories efficiently
            </p>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setSelectedCategory(null);
              setFormData({ name: '', description: '' });
              setIsModalOpen(true);
              setError('');
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-3 sm:py-2.5 sm:px-5 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
          >
            <span className="flex items-center justify-center gap-1 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden xs:inline">Add New Category</span>
              <span className="xs:hidden">Add</span>
            </span>
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded shadow-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm sm:text-base">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm sm:text-base">{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && categories.length === 0 && (
          <div className="flex flex-col justify-center items-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading categories...</p>
          </div>
        )}

        {/* Categories Table */}
        {!loading && categories.length > 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category, index) => (
                    <tr key={category._id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                            {category.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-2 sm:ml-3">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                          </div>
                        </div>
                       </td>
                      <td className="hidden md:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <div className="text-xs sm:text-sm text-gray-600 max-w-xs lg:max-w-md">
                          {category.description || '—'}
                        </div>
                        </td>
                      <td className="hidden lg:table-cell px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {formatDate(category.createdAt)}
                        </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="text-red-600 hover:text-red-900 sm:mr-4 transition duration-150 inline-flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900 transition duration-150 inline-flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                        </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer with Count */}
            <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-3 border-t border-gray-200">
              <div className="text-xs sm:text-sm text-gray-600">
                Total Categories: <span className="font-semibold text-gray-900">{categories.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center mb-4">
                <svg className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">Get started by creating your first category</p>
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedCategory(null);
                  setFormData({ name: '', description: '' });
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Category
              </button>
            </div>
          </div>
        )}

        {/* Modal for Add/Edit Category */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-6 border w-[95%] sm:w-full max-w-md shadow-xl rounded-xl bg-white">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Category' : 'Create New Category'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition duration-150"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                    placeholder="e.g., Web Development, Data Science"
                    required
                    autoFocus
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150"
                    placeholder="Enter a brief description of the category (optional)"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150 font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm sm:text-base"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      isEditMode ? 'Update Category' : 'Create Category'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCategory;