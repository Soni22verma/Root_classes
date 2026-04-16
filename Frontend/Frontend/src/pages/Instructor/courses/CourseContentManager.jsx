// CourseContentManager.jsx
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
  FolderTree,
  BookOpen,
  Sparkles,
  Eye,
  Download,
  ArrowLeft,
  Layers,
  Clock,
  Grid3x3,
  CheckCircle2,
  AlertCircle
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
    
    if (editingItem?.type === 'topic' && selectedTopic?._id) {
      formData.append('topicId', selectedTopic._id);
    }
    
    formData.append('courseId', courseId);
    formData.append('moduleId', selectedModule._id);
    formData.append('chapterId', selectedChapter._id);
    formData.append('title', topicData.title);
    formData.append('description', topicData.description || '');
    // IMPORTANT: Send isPreviewFree as a proper boolean
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
        const response = await axios.post(api.course.updateTopic, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Update response:', response.data);
        toast.success('Topic updated successfully');
      } else {
        const response = await axios.post(api.course.addTopic, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Add response:', response.data);
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
        await axios.post(api.course.deleteTopic, {
            courseId: courseId,
            moduleId: moduleId,
            chapterId: chapterId,
            topicId: topicId
          }
        );
        toast.success('Topic deleted successfully');
        await fetchCourseData();
      } catch (error) {
        console.error('Error deleting topic:', error);
        toast.error(error.response?.data?.message || 'Error deleting topic');
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
      setEditingItem({ type: 'topic', id: topic._id });
      setSelectedTopic(topic);
      setTopicData({
        title: topic.title,
        description: topic.description || '',
        isPreviewFree: topic.isPreviewFree || false,
        order: topic.order || 0
      });
      setVideoFile(null);
      setNotesFile(null);
      setVideoPreview(null);
      setNotesPreview(null);
    } else {
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
    setSelectedTopic(null);
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

  // Calculate total stats
  const totalModules = course?.modules?.length || 0;
  const totalChapters = course?.modules?.reduce((sum, module) => sum + (module.chapters?.length || 0), 0) || 0;
  const totalTopics = course?.modules?.reduce((sum, module) => 
    sum + (module.chapters?.reduce((chapSum, chapter) => chapSum + (chapter.topics?.length || 0), 0) || 0), 0) || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-lg font-semibold mb-4">Course not found</p>
          <button 
            onClick={() => navigate('/admin/allcourses')} 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
          >
            <ArrowLeft size={18} />
            Go Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button 
            onClick={() => navigate(-1)} 
            className="text-indigo-600 hover:text-indigo-700 mb-4 inline-flex items-center gap-2 font-medium transition-all hover:gap-3"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {course.title}
              </h1>
              <p className="text-slate-600 mt-2 text-lg">{course.description}</p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  <Layers size={14} />
                  {course.category?.name || 'No Category'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize">
                  <BookOpen size={14} />
                  {course.level}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl px-5 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <FolderTree size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Modules</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{totalModules}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl px-5 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Grid3x3 size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Chapters</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{totalChapters}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl px-5 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Sparkles size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Topics</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{totalTopics}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Module Button */}
        <div className="sticky top-24 z-10 mb-8">
          <button
            onClick={() => openModuleModal()}
            className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 transform hover:scale-105"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
            Add New Module
          </button>
        </div>

        {/* Course Structure */}
        {!course.modules || course.modules.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border-2 border-dashed border-indigo-200">
            <div className="text-8xl mb-6 animate-bounce">📚</div>
            <p className="text-slate-500 text-xl mb-2 font-medium">No modules yet.</p>
            <p className="text-slate-400 mb-6">Start building your course by adding your first module.</p>
            <button
              onClick={() => openModuleModal()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
            >
              <Plus size={18} />
              Create First Module
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {course.modules.map((module, moduleIndex) => (
              <div key={module._id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl border border-slate-200">
                {/* Module Header */}
                <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 cursor-pointer" onClick={() => toggleModule(module._id)}>
                      <div className="flex items-center gap-3">
                        <div className="text-indigo-600 transition-transform duration-200">
                          {expandedModules[module._id] ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold">
                            Module {moduleIndex + 1}
                          </span>
                          <h2 className="text-xl font-bold text-slate-800">
                            {module.title}
                          </h2>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                            {module.chapters?.length || 0} {module.chapters?.length === 1 ? 'Chapter' : 'Chapters'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openChapterModal(module)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all hover:shadow-md"
                      >
                        <Plus size={16} />
                        Add Chapter
                      </button>
                      <button
                        onClick={() => openModuleModal(module)}
                        className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module._id)}
                        className="border border-red-600 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-all"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chapters List */}
                {expandedModules[module._id] && (
                  <div className="p-6 bg-slate-50">
                    {!module.chapters || module.chapters.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
                        <div className="text-5xl mb-3">📖</div>
                        <p className="text-slate-400 text-base mb-3">No chapters yet.</p>
                        <button
                          onClick={() => openChapterModal(module)}
                          className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Add First Chapter
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {module.chapters.map((chapter, chapterIndex) => (
                          <div key={chapter._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            {/* Chapter Header */}
                            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50 flex justify-between items-center">
                              <div className="flex-1 cursor-pointer" onClick={() => toggleChapter(chapter._id)}>
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-500 transition-transform">
                                    {expandedChapters[chapter._id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                  </span>
                                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md text-xs font-semibold">
                                    Chapter {chapterIndex + 1}
                                  </span>
                                  <h3 className="font-semibold text-slate-800 text-base">
                                    {chapter.title}
                                  </h3>
                                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md text-xs font-medium">
                                    {chapter.topics?.length || 0} {chapter.topics?.length === 1 ? 'Topic' : 'Topics'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openTopicModal(module, chapter)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-all"
                                >
                                  <Plus size={14} />
                                  Add Topic
                                </button>
                                <button
                                  onClick={() => openChapterModal(module, chapter)}
                                  className="text-indigo-600 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                  title="Edit Chapter"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteChapter(module._id, chapter._id)}
                                  className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Delete Chapter"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Topics List */}
                            {expandedChapters[chapter._id] && (
                              <div className="p-5 bg-slate-50/50">
                                {!chapter.topics || chapter.topics.length === 0 ? (
                                  <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-200">
                                    <div className="text-4xl mb-2">✨</div>
                                    <p className="text-slate-400 text-sm mb-2">No topics yet.</p>
                                    <button
                                      onClick={() => openTopicModal(module, chapter)}
                                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center gap-1.5"
                                    >
                                      <Plus size={14} />
                                      Add First Topic
                                    </button>
                                  </div>
                                ) : (
                                  <div className="grid gap-3">
                                    {chapter.topics.map((topic, topicIndex) => (
                                      <div key={topic._id} className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all hover:border-indigo-200">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                              <span className="text-slate-400 text-xs font-mono font-medium">#{String(topicIndex + 1).padStart(2, '0')}</span>
                                              <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {topic.title}
                                              </h4>
                                              {topic.isPreviewFree && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium">
                                                  <Eye size={12} />
                                                  Free Preview
                                                </span>
                                              )}
                                              {!topic.isPreviewFree && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                                                  <Lock size={12} />
                                                  Paid Content
                                                </span>
                                              )}
                                              {topic.order > 0 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs">
                                                  <Clock size={12} />
                                                  Order: {topic.order}
                                                </span>
                                              )}
                                            </div>
                                            {topic.description && (
                                              <p className="text-sm text-slate-600 mb-3 ml-7 line-clamp-2">
                                                {topic.description}
                                              </p>
                                            )}
                                            <div className="flex gap-4 ml-7">
                                              {topic.videoUrl && (
                                                <a
                                                  href={topic.videoUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
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
                                                  className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                                >
                                                  <Download size={14} />
                                                  Download Notes
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              onClick={() => openTopicModal(module, chapter, topic)}
                                              className="text-indigo-600 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                              title="Edit Topic"
                                            >
                                              <Edit size={16} />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteTopic(module._id, chapter._id, topic._id)}
                                              className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                              title="Delete Topic"
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

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {modalType === 'module' && (editingItem?.type === 'module' ? 'Edit Module' : 'Create New Module')}
                {modalType === 'chapter' && (editingItem?.type === 'chapter' ? 'Edit Chapter' : 'Create New Chapter')}
                {modalType === 'topic' && (editingItem?.type === 'topic' ? 'Edit Topic' : 'Create New Topic')}
              </h2>
            </div>
            
            <div className="p-6">
              {/* Module Modal */}
              {modalType === 'module' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Module Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Introduction to Programming"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={moduleTitle}
                      onChange={(e) => setModuleTitle(e.target.value)}
                      autoFocus
                    />
                    <p className="text-xs text-slate-400 mt-1">Give your module a clear and descriptive title</p>
                  </div>
                </div>
              )}

              {/* Chapter Modal */}
              {modalType === 'chapter' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <p className="text-sm text-slate-700 flex items-center gap-2">
                      <FolderTree size={14} className="text-indigo-600" />
                      <span>Module: <span className="font-semibold text-indigo-700">{selectedModule?.title}</span></span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Chapter Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Getting Started"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Enhanced Topic Modal */}
              {modalType === 'topic' && (
                <div className="space-y-5">
                  <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl">
                    <p className="text-sm text-slate-700 mb-1 flex items-center gap-2">
                      <FolderTree size={14} className="text-indigo-600" />
                      <span>Module: <span className="font-semibold text-indigo-700">{selectedModule?.title}</span></span>
                    </p>
                    <p className="text-sm text-slate-700 flex items-center gap-2">
                      <Grid3x3 size={14} className="text-emerald-600" />
                      <span>Chapter: <span className="font-semibold text-emerald-700">{selectedChapter?.title}</span></span>
                    </p>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Topic Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter topic title"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={topicData.title}
                      onChange={(e) => setTopicData({ ...topicData, title: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Enter topic description (optional)"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      value={topicData.description}
                      onChange={(e) => setTopicData({ ...topicData, description: e.target.value })}
                    />
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      placeholder="Topic order"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={topicData.order}
                      onChange={(e) => setTopicData({ ...topicData, order: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-slate-400 mt-1">Lower numbers appear first</p>
                  </div>

                  {/* Free Preview Toggle - Enhanced */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      {topicData.isPreviewFree ? (
                        <Unlock size={20} className="text-emerald-600" />
                      ) : (
                        <Lock size={20} className="text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">
                          {topicData.isPreviewFree ? 'Free Preview Available' : 'Paid Content'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {topicData.isPreviewFree 
                            ? 'Students can preview this topic before enrollment' 
                            : 'Students must enroll to access this content'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTopicData({ ...topicData, isPreviewFree: !topicData.isPreviewFree })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                        topicData.isPreviewFree ? 'bg-emerald-600' : 'bg-red-500'
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Video Content
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-indigo-400 transition-all hover:bg-indigo-50/20">
                      {!videoPreview ? (
                        <label className="cursor-pointer block text-center">
                          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Upload size={28} className="text-indigo-600" />
                          </div>
                          <p className="text-slate-600 mb-1 font-medium">Click to upload video</p>
                          <p className="text-xs text-slate-400">MP4, MOV, AVI (Max 100MB)</p>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="relative">
                          <video src={videoPreview} className="w-full rounded-lg max-h-48 shadow-md" controls />
                          <button
                            onClick={removeVideo}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Notes (PDF)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-purple-400 transition-all hover:bg-purple-50/20">
                      {!notesPreview ? (
                        <label className="cursor-pointer block text-center">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileText size={28} className="text-purple-600" />
                          </div>
                          <p className="text-slate-600 mb-1 font-medium">Click to upload notes</p>
                          <p className="text-xs text-slate-400">PDF only (Max 10MB)</p>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleNotesChange}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FileText size={20} className="text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">{notesPreview}</p>
                              <p className="text-xs text-slate-400">PDF Document</p>
                            </div>
                          </div>
                          <button
                            onClick={removeNotes}
                            className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-200">
                <button 
                  onClick={closeModal} 
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700"
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      {editingItem ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CourseContentManager;