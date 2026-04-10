import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/instructorendpoint';
import { useEffect, useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Video,
  FileText,
  Lock,
  Unlock,
  Upload,
  X,
  Save,
} from 'lucide-react';

const CourseContentManager = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});

  // Modal states
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [moduleTitle, setModuleTitle] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [topicData, setTopicData] = useState({ 
    title: '', 
    description: '', 
    isPreviewFree: false,
    order: 0
  });
  
  // File states
  const [videoFile, setVideoFile] = useState(null);
  const [notesFile, setNotesFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [notesPreview, setNotesPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id;

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(api.course.getCourseById, { courseId: courseId });
      if (response.data?.success && response.data?.data) {
        setCourse(response.data.data);
        if (response.data.data.modules?.length > 0) {
          setExpandedModules({ [response.data.data.modules[0]._id]: true });
        }
      } else {
        toast.error('Invalid course data received');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error(error.response?.data?.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  // ========== MODULE FUNCTIONS ==========
  const handleAddModule = async () => {
    if (!moduleTitle.trim()) {
      toast.error('Module title is required');
      return;
    }

    try {
      if (editingItem?.type === 'module') {
        await axios.post(api.course.editModule, {
          courseId: courseId,
          moduleId: editingItem.id,
          title: moduleTitle
        });
        toast.success('Module updated successfully');
      } else {
        await axios.post(api.course.addModule, {
          courseId: courseId,
          title: moduleTitle
        });
        toast.success('Module added successfully');
      }
      await fetchCourseData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving module');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Delete this module? All chapters and topics will be deleted!')) {
      try {
        await axios.post(api.course.deleteModule, {
          courseId: courseId,
          moduleId: moduleId
        });
        toast.success('Module deleted successfully');
        await fetchCourseData();
      } catch (error) {
        console.error(error);
        toast.error('Error deleting module');
      }
    }
  };

  // ========== CHAPTER FUNCTIONS ==========
  const handleAddChapter = async () => {
    if (!chapterTitle.trim()) {
      toast.error('Chapter title is required');
      return;
    }

    try {
      if (editingItem?.type === 'chapter') {
        await axios.post(api.course.editChapter, {
          courseId: courseId,
          moduleId: selectedModule._id,
          chapterId: editingItem.id,
          title: chapterTitle
        });
        toast.success('Chapter updated successfully');
      } else {
        await axios.post(api.course.addchapter, {
          courseId: courseId,
          moduleId: selectedModule._id,
          title: chapterTitle
        });
        toast.success('Chapter added successfully');
      }
      await fetchCourseData();
      closeModal();
    } catch (error) {
      toast.error('Error saving chapter');
    }
  };

  const handleDeleteChapter = async (moduleId, chapterId) => {
    if (window.confirm('Delete this chapter? All topics will be deleted!')) {
      try {
        await axios.post(api.course.deleteChapter, {
          courseId: courseId,
          moduleId: moduleId,
          chapterId: chapterId
        });
        toast.success('Chapter deleted successfully');
        await fetchCourseData();
      } catch (error) {
        console.error(error);
        toast.error('Error deleting chapter');
      }
    }
  };

  // ========== TOPIC FUNCTIONS ==========
  const handleAddTopic = async () => {
    if (!topicData.title.trim()) {
      toast.error('Topic title is required');
      return;
    }

    setUploading(true);
    
    const formData = new FormData();
    
    // Only append topicId if we're editing an existing topic
    if (editingItem?.type === 'topic' && selectedTopic?._id) {
      formData.append('topicId', selectedTopic._id);
    }
    
    formData.append('courseId', courseId);
    formData.append('moduleId', selectedModule._id);
    formData.append('chapterId', selectedChapter._id);
    formData.append('title', topicData.title);
    formData.append('description', topicData.description || '');
    formData.append('isPreviewFree', topicData.isPreviewFree);
    formData.append('order', topicData.order);
    
    if (videoFile) {
      formData.append('video', videoFile);
    }
    
    if (notesFile) {
      formData.append('notes', notesFile);
    }

    try {
      if (editingItem?.type === 'topic') {
        await axios.post(api.course.updateTopic, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Topic updated successfully');
      } else {
        await axios.post(api.course.addTopic, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Topic added successfully');
      }
      await fetchCourseData();
      closeModal();
    } catch (error) {
      console.error('Error saving topic:', error);
      toast.error(error.response?.data?.message || 'Error saving topic');
    } finally {
      setUploading(false);
    }
  };
const handleDeleteTopic = async (moduleId, chapterId, topicId) => {
  if (window.confirm('Delete this topic?')) {
    try {
      await axios.delete(api.course.deleteTopic, {
        data: {
          courseId: courseId,
          moduleId: moduleId,
          chapterId: chapterId,
          topicId: topicId
        }
      });

      toast.success('Topic deleted successfully');
      await fetchCourseData();

    } catch (error) {
      toast.error('Error deleting topic');
    }
  }
};

  // File handlers
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video file size should be less than 100MB');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleNotesChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        toast.error('Notes must be a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Notes file size should be less than 10MB');
        return;
      }
      setNotesFile(file);
      setNotesPreview(file.name);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
  };

  const removeNotes = () => {
    setNotesFile(null);
    setNotesPreview(null);
  };

  // ========== MODAL CONTROLS ==========
  const openModuleModal = (module = null) => {
    setModalType('module');
    if (module) {
      setEditingItem({ type: 'module', id: module._id });
      setModuleTitle(module.title);
    } else {
      setEditingItem(null);
      setModuleTitle('');
    }
    setIsModalOpen(true);
  };

  const openChapterModal = (module, chapter = null) => {
    setModalType('chapter');
    setSelectedModule(module);
    if (chapter) {
      setEditingItem({ type: 'chapter', id: chapter._id });
      setChapterTitle(chapter.title);
    } else {
      setEditingItem(null);
      setChapterTitle('');
    }
    setIsModalOpen(true);
  };

  const openTopicModal = (module, chapter, topic = null) => {
    setModalType('topic');
    setSelectedModule(module);
    setSelectedChapter(chapter);
    
    if (topic) {
      // Editing existing topic
      setEditingItem({ type: 'topic', id: topic._id });
      setSelectedTopic(topic); // IMPORTANT: Set the selected topic
      setTopicData({
        title: topic.title,
        description: topic.description || '',
        isPreviewFree: topic.isPreviewFree || false,
        order: topic.order || 0
      });
      // Reset file inputs for edit mode
      setVideoFile(null);
      setNotesFile(null);
      setVideoPreview(null);
      setNotesPreview(null);
    } else {
      // Adding new topic
      setEditingItem(null);
      setSelectedTopic(null);
      setTopicData({ 
        title: '', 
        description: '', 
        isPreviewFree: false,
        order: chapter.topics?.length || 0
      });
      setVideoFile(null);
      setNotesFile(null);
      setVideoPreview(null);
      setNotesPreview(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingItem(null);
    setSelectedModule(null);
    setSelectedChapter(null);
    setSelectedTopic(null); // Reset selected topic
    setModuleTitle('');
    setChapterTitle('');
    setTopicData({ title: '', description: '', isPreviewFree: false, order: 0 });
    setVideoFile(null);
    setNotesFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
    setNotesPreview(null);
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-red-500 text-lg mb-4">Course not found</p>
          <button onClick={() => navigate('/admin/allcourses')} className="text-blue-600 hover:text-blue-700 font-medium">
            ← Go Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button 
            onClick={() => navigate(-1)} 
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2 font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {course.title}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">{course.description}</p>
          <div className="flex gap-3 mt-4">
            <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {course.category?.name || 'No Category'}
            </span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
              {course.level}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Module Button */}
        <div className="sticky top-24 z-10 mb-6">
          <button
            onClick={() => openModuleModal()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Module
          </button>
        </div>

        {/* Course Structure */}
        {!course.modules || course.modules.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="text-8xl mb-6">📚</div>
            <p className="text-gray-500 text-xl mb-2">No modules yet.</p>
            <p className="text-gray-400">Click "Add New Module" to start building your course.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {course.modules.map((module, moduleIndex) => (
              <div key={module._id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
                {/* Module Header */}
                <div className="bg-gradient-to-r from-blue-50 to-white p-5 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 cursor-pointer" onClick={() => toggleModule(module._id)}>
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600">
                          {expandedModules[module._id] ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                        </span>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Module {moduleIndex + 1}: {module.title}
                        </h2>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                          {module.chapters?.length || 0} chapters
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openChapterModal(module)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors"
                      >
                        <Plus size={16} />
                        Add Chapter
                      </button>
                      <button
                        onClick={() => openModuleModal(module)}
                        className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module._id)}
                        className="border border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chapters List */}
                {expandedModules[module._id] && (
                  <div className="p-6 bg-gray-50">
                    {!module.chapters || module.chapters.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-400 text-lg mb-3">No chapters yet.</p>
                        <button
                          onClick={() => openChapterModal(module)}
                          className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add First Chapter
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {module.chapters.map((chapter, chapterIndex) => (
                          <div key={chapter._id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                            {/* Chapter Header */}
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                              <div className="flex-1 cursor-pointer" onClick={() => toggleChapter(chapter._id)}>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">
                                    {expandedChapters[chapter._id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                  </span>
                                  <h3 className="font-semibold text-gray-800 text-lg">
                                    Chapter {chapterIndex + 1}: {chapter.title}
                                  </h3>
                                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-md text-xs font-medium">
                                    {chapter.topics?.length || 0} topics
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openTopicModal(module, chapter)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                                >
                                  <Plus size={14} />
                                  Add Topic
                                </button>
                                <button
                                  onClick={() => openChapterModal(module, chapter)}
                                  className="text-blue-600 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteChapter(module._id, chapter._id)}
                                  className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Topics List */}
                            {expandedChapters[chapter._id] && (
                              <div className="p-4">
                                {!chapter.topics || chapter.topics.length === 0 ? (
                                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <p className="text-gray-400 text-sm mb-2">No topics yet.</p>
                                    <button
                                      onClick={() => openTopicModal(module, chapter)}
                                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center gap-1"
                                    >
                                      <Plus size={14} />
                                      Add First Topic
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {chapter.topics.map((topic, topicIndex) => (
                                      <div key={topic._id} className="border rounded-lg p-4 hover:shadow-md transition-all bg-white">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                              <span className="text-gray-400 text-sm font-medium">#{topicIndex + 1}</span>
                                              <h4 className="font-semibold text-gray-800">{topic.title}</h4>
                                              {topic.isPreviewFree && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                                                  <Unlock size={12} />
                                                  Free Preview
                                                </span>
                                              )}
                                            </div>
                                            {topic.description && (
                                              <p className="text-sm text-gray-600 mb-3 ml-7 line-clamp-2">
                                                {topic.description}
                                              </p>
                                            )}
                                            <div className="flex gap-3 ml-7">
                                              {topic.videoUrl && (
                                                <a
                                                  href={topic.videoUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                                >
                                                  <Video size={14} />
                                                  Watch Video
                                                </a>
                                              )}
                                              {topic.notesUrl && (
                                                <a
                                                  href={topic.notesUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
                                                >
                                                  <FileText size={14} />
                                                  Download Notes
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex gap-1 ml-4">
                                            <button
                                              onClick={() => openTopicModal(module, chapter, topic)}
                                              className="text-blue-600 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                            >
                                              <Edit size={16} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteTopic(module._id, chapter._id, topic._id)}
                                              className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL - Enhanced Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Module Modal */}
            {modalType === 'module' && (
              <>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {editingItem?.type === 'module' ? 'Edit Module' : 'Add New Module'}
                </h2>
                <input
                  type="text"
                  placeholder="Enter module title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  autoFocus
                />
              </>
            )}

            {/* Chapter Modal */}
            {modalType === 'chapter' && (
              <>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {editingItem?.type === 'chapter' ? 'Edit Chapter' : 'Add New Chapter'}
                </h2>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">Module: <span className="font-semibold">{selectedModule?.title}</span></p>
                </div>
                <input
                  type="text"
                  placeholder="Enter chapter title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  autoFocus
                />
              </>
            )}

            {/* Enhanced Topic Modal */}
            {modalType === 'topic' && (
              <>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {editingItem?.type === 'topic' ? 'Edit Topic' : 'Add New Topic'}
                </h2>
                
                <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Module:</span> {selectedModule?.title}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Chapter:</span> {selectedChapter?.title}
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Topic Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter topic title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={topicData.title}
                      onChange={(e) => setTopicData({ ...topicData, title: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Enter topic description (optional)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      value={topicData.description}
                      onChange={(e) => setTopicData({ ...topicData, description: e.target.value })}
                    />
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      placeholder="Topic order"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={topicData.order}
                      onChange={(e) => setTopicData({ ...topicData, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  {/* Free Preview Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {topicData.isPreviewFree ? <Unlock size={20} className="text-green-600" /> : <Lock size={20} className="text-gray-600" />}
                      <div>
                        <p className="font-semibold text-gray-800">Free Preview</p>
                        <p className="text-xs text-gray-500">Allow students to preview this topic before enrollment</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTopicData({ ...topicData, isPreviewFree: !topicData.isPreviewFree })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        topicData.isPreviewFree ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          topicData.isPreviewFree ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Video Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Video Content
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                      {!videoPreview ? (
                        <label className="cursor-pointer block text-center">
                          <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600 mb-1">Click to upload video</p>
                          <p className="text-xs text-gray-400">MP4, MOV, AVI (Max 100MB)</p>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="relative">
                          <video src={videoPreview} className="w-full rounded-lg max-h-48" controls />
                          <button
                            onClick={removeVideo}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes (PDF)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 transition-colors">
                      {!notesPreview ? (
                        <label className="cursor-pointer block text-center">
                          <FileText size={40} className="mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600 mb-1">Click to upload notes</p>
                          <p className="text-xs text-gray-400">PDF only (Max 10MB)</p>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleNotesChange}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText size={24} className="text-purple-600" />
                            <span className="text-sm text-gray-700">{notesPreview}</span>
                          </div>
                          <button
                            onClick={removeNotes}
                            className="text-red-600 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 mt-8">
              <button 
                onClick={closeModal} 
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalType === 'module') handleAddModule();
                  else if (modalType === 'chapter') handleAddChapter();
                  else if (modalType === 'topic') handleAddTopic();
                }}
                disabled={uploading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContentManager;