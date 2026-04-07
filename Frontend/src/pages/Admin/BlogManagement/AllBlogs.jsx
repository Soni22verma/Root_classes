import axios from 'axios';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../../services/adminendpoint';
import { toast } from 'react-toastify';
import { useBlogStore } from '../../../Store/blogStore';

const AdminBlogPanel = () => {
    const { setBlogId, blogId } = useBlogStore();
    const [blogs, setBlogs] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        category: '',
        content: '',
        imageUrl: '',
        status: 'draft'
    });
    const [deletingBlogId, setDeletingBlogId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingBlog, setEditingBlog] = useState(null);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const isMounted = useRef(true);

    useEffect(() => {
        if (isFormOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isFormOpen]);

    const GetBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.post(api.blog.getblog);
            console.log(res, "this is All blogs");

            if (res.data && res.data.data && res.data.data.data) {
                const blogsData = res.data.data.data.map(blog => ({
                    id: blog._id,
                    title: blog.title,
                    author: blog.author,
                    category: blog.category,
                    content: blog.content,
                    imageUrl: blog.image,
                    status: blog.status,
                    createdAt: blog.createdAt,
                    updatedAt: blog.updatedAt
                }));
                if (isMounted.current) {
                    setBlogs(blogsData);
                }
                console.log('Blogs loaded:', blogsData);
            } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                const blogsData = res.data.data.map(blog => ({
                    id: blog._id,
                    title: blog.title,
                    author: blog.author,
                    category: blog.category,
                    content: blog.content,
                    imageUrl: blog.image,
                    status: blog.status,
                    createdAt: blog.createdAt,
                    updatedAt: blog.updatedAt
                }));
                if (isMounted.current) {
                    setBlogs(blogsData);
                }
            } else {
                console.warn('Unexpected data structure:', res.data);
                if (isMounted.current) {
                    setBlogs([]);
                }
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            if (isMounted.current) {
                setErrors({ fetch: 'Failed to load blogs. Please try again.' });
                setBlogs([]);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        GetBlogs();
        return () => {
            isMounted.current = false;
        };
    }, [GetBlogs]);

    const CreateBlog = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("author", formData.author);
            formDataToSend.append("category", formData.category);
            formDataToSend.append("content", formData.content);
            formDataToSend.append("status", formData.status);

            if (selectedFile) {
                formDataToSend.append("image", selectedFile);
            } else if (formData.imageUrl && formData.imageUrl.startsWith('http')) {
                formDataToSend.append("imageUrl", formData.imageUrl);
            }

             await axios.post(api.blog.createblog, formDataToSend);
            toast.success("Blog created successfully");
            await GetBlogs();

            resetForm();
            closeModal();
            setSuccessMessage('Blog created successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error creating blog:', error);
            setErrors({ submit: error.response?.data?.message || 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    const UpdateBlog = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        const blogIdToUpdate = editingId || editingBlog?._id;
        
        if (!blogIdToUpdate) {
            console.error("No blog ID found for update");
            setErrors({ submit: 'Blog ID is missing' });
            return;
        }

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("blogId",blogIdToUpdate)
            formDataToSend.append("author", formData.author);
            formDataToSend.append("category", formData.category);
            formDataToSend.append("content", formData.content);
            formDataToSend.append("status", formData.status);

            if (selectedFile) {
                formDataToSend.append("image", selectedFile);
            } else if (formData.imageUrl && formData.imageUrl.startsWith('http')) {
                formDataToSend.append("imageUrl", formData.imageUrl);
            }

            console.log(blogIdToUpdate, "Blog ID for update");
            
            const response = await axios.post(api.blog.editblog, formDataToSend);
            console.log(response, "Blog updated successfully");
            toast.success("Blog updated successfully");

            await GetBlogs();

            resetForm();
            closeModal();
            setSuccessMessage('Blog updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error updating blog:', error);
            setErrors({ submit: error.response?.data?.message || 'Something went wrong' });
            toast.error(error.response?.data?.message || 'Failed to update blog');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if (editingId || editingBlog) {
            UpdateBlog(e);
        } else {
            CreateBlog(e);
        }
    };

    const handleDelete = async (id) => {
            if (!deletingBlogId) {
        alert('BlogId is messing');
        return;
    }

        if (window.confirm('Are you sure you want to delete this blog?')) {
            setLoading(true);
            try {
                   console.log("Deleting blog with ID:", deletingBlogId);
                await axios.post(api.blog.deleteblog,{blogId:deletingBlogId});
                setSuccessMessage('Blog deleted successfully!');
                toast.success('Blog deleted successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                setDeletingBlogId(null);
            } catch (error) {
                console.error('Error deleting blog:', error);
                setErrors({ submit: 'Failed to delete blog' });
                toast.error('Failed to delete blog');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'imageUrl') {
            setImagePreview(value);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData(prev => ({ ...prev, imageUrl: '' }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.author.trim()) newErrors.author = 'Author is required';
        if (!formData.category.trim()) newErrors.category = 'Category is required';
        if (!formData.content.trim()) newErrors.content = 'Content is required';
        if (!formData.status) newErrors.status = 'Status is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            category: '',
            content: '',
            imageUrl: '',
            status: 'draft'
        });
        setImagePreview('');
        setSelectedFile(null);
        setErrors({});
        setEditingId(null);
        setEditingBlog(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setEditingBlog(null);
        resetForm();
        setIsFormOpen(true);
    };

    const openEditModal = (blog) => {
        setEditingId(blog.id);
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            author: blog.author,
            category: blog.category,
            content: blog.content,
            imageUrl: blog.imageUrl || '',
            status: blog.status || 'draft'
        });
        setImagePreview(blog.imageUrl || '');
        setSelectedFile(null);
        setIsFormOpen(true);
    };

    const closeModal = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setEditingBlog(null);
        resetForm();
    };

    const handleStatusChange = async (id, newStatus) => {
        setLoading(true);
        try {
            await axios.patch(`${api.blog.updateBlogStatus}/${id}`, { status: newStatus });
            await GetBlogs();
            setSuccessMessage(`Blog status updated to ${newStatus}!`);
            toast.success(`Blog status updated to ${newStatus}!`);
            setTimeout(() => setSuccessMessage(''), 2000);
        } catch (error) {
            console.error('Error updating status:', error);
            // Optimistic update
            const updatedBlogs = blogs.map(blog =>
                blog.id === id ? { ...blog, status: newStatus } : blog
            );
            setBlogs(updatedBlogs);
            setSuccessMessage(`Blog status updated to ${newStatus}!`);
            setTimeout(() => setSuccessMessage(''), 2000);
        } finally {
            setLoading(false);
        }
    };

    const clearImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        setImagePreview('');
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const filteredBlogs = statusFilter === 'all'
        ? blogs
        : blogs.filter(blog => blog.status === statusFilter);

    const getStatusBadge = (status) => {
        if (status === 'published') {
            return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Published</span>;
        }
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">Draft</span>;
    };

    const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 overflow-x-hidden">
            {/* Admin Header */}
            <header className="bg-indigo-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-5">
                    <h1 className="text-2xl font-bold">Blog Admin Panel</h1>
                    <p className="text-indigo-200 text-sm mt-0.5">Manage your blog posts</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                            <span className="text-sm text-gray-700">Processing...</span>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-5 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between text-sm">
                        <span>{successMessage}</span>
                        <button onClick={() => setSuccessMessage('')} className="text-green-700 hover:text-green-900">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {errors.fetch && (
                    <div className="mb-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {errors.fetch}
                        <button
                            onClick={() => GetBlogs()}
                            className="ml-3 text-red-700 underline hover:text-red-900"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {errors.submit && (
                    <div className="mb-5 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {errors.submit}
                    </div>
                )}

                {/* Header with Create Button and Filter */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium text-sm shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Blog
                    </button>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Filter by status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                        >
                            <option value="all">All ({blogs.length})</option>
                            <option value="published">Published ({blogs.filter(b => b.status === 'published').length})</option>
                            <option value="draft">Draft ({blogs.filter(b => b.status === 'draft').length})</option>
                        </select>
                    </div>
                </div>

                {/* Modal Overlay */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={closeModal}
                        ></div>

                        {/* Modal Content */}
                        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-5">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.title ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter blog title"
                                            autoFocus
                                        />
                                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                                    </div>

                                    {/* Author and Category Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Author *
                                            </label>
                                            <input
                                                type="text"
                                                name="author"
                                                value={formData.author}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.author ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="Author name"
                                            />
                                            {errors.author && <p className="mt-1 text-xs text-red-500">{errors.author}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category *
                                            </label>
                                            <input
                                                type="text"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.category ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder="e.g., Technology, Lifestyle"
                                            />
                                            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                                        </div>
                                    </div>

                                    {/* Status Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status *
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="draft"
                                                    checked={formData.status === 'draft'}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                                                />
                                                <span className="text-sm text-gray-700">Draft</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="published"
                                                    checked={formData.status === 'published'}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                                                />
                                                <span className="text-sm text-gray-700">Published</span>
                                            </label>
                                        </div>
                                        {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
                                    </div>

                                    {/* Image Upload Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Featured Image
                                        </label>

                                        {/* Image Preview */}
                                        {imagePreview && (
                                            <div className="mb-3 relative inline-block">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                                                    onError={(e) => { e.target.src = fallbackImage; }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={clearImage}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {/* Two Column Layout for Upload Options */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-400 transition">
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                        id="image-upload"
                                                    />
                                                    <label
                                                        htmlFor="image-upload"
                                                        className="cursor-pointer flex flex-col items-center"
                                                    >
                                                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-sm text-gray-600">Browse from computer</span>
                                                        <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* URL Upload */}
                                            <div>
                                                <div className="border border-gray-300 rounded-lg p-3">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                                        Or enter image URL
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="imageUrl"
                                                        value={formData.imageUrl}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                                        placeholder="https://example.com/image.jpg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Content *
                                        </label>
                                        <textarea
                                            name="content"
                                            value={formData.content}
                                            onChange={handleInputChange}
                                            rows="6"
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none ${errors.content ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="Write your blog content here..."
                                        />
                                        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
                                    </div>
                                </div>

                                {/* Form Buttons */}
                                <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Processing...' : (editingId ? 'Update Blog' : 'Create Blog')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Blogs Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">All Blog Posts</h2>
                        <span className="text-sm text-gray-500">
                            Showing {filteredBlogs.length} of {blogs.length} blogs
                        </span>
                    </div>

                    {filteredBlogs.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            <p className="mt-4 text-gray-500">
                                {statusFilter !== 'all'
                                    ? `No ${statusFilter} blog posts found.`
                                    : 'No blog posts yet. Click "Create New Blog" to get started!'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredBlogs.map((blog) => (
                                        <tr key={blog.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {blog.imageUrl ? (
                                                    <img
                                                        src={blog.imageUrl}
                                                        alt={blog.title}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = fallbackImage;
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="max-w-xs">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{blog.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{blog.content?.substring(0, 60) || ''}...</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{blog.author}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700">
                                                    {blog.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(blog.status)}
                                                    <select
                                                        value={blog.status}
                                                        onChange={(e) => handleStatusChange(blog.id, e.target.value)}
                                                        className="text-xs border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                                                    >
                                                        <option value="draft">Draft</option>
                                                        <option value="published">Published</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                                {formatDate(blog.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(blog)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() =>{ handleDelete(blog.id), setDeletingBlogId(blog._id || blog.id);}}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Blog Statistics Summary */}
                {blogs.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Blogs</p>
                                    <p className="text-2xl font-bold text-gray-800">{blogs.length}</p>
                                </div>
                                <div className="bg-indigo-100 rounded-full p-3">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Published</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {blogs.filter(b => b.status === 'published').length}
                                    </p>
                                </div>
                                <div className="bg-green-100 rounded-full p-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Drafts</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {blogs.filter(b => b.status === 'draft').length}
                                    </p>
                                </div>
                                <div className="bg-yellow-100 rounded-full p-3">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminBlogPanel;