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
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Image as ImageIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Menu,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Image from '@tiptap/extension-image';
import UnderlineExtension from '@tiptap/extension-underline';

// Custom YouTube icon component
const YoutubeIcon = ({ size = 16 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    style={{ display: 'inline-block' }}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Menu Button Component for TipTap
const MenuButton = ({ onClick, isActive, children, title }) => (
  <button
    onClick={onClick}
    className={`p-1.5 sm:p-2 rounded-lg transition-all ${
      isActive 
        ? 'bg-indigo-100 text-indigo-700' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
    title={title}
    type="button"
  >
    {children}
  </button>
);

const CourseContentManager = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    order: 0,
    videoType: 'upload',
    youtubeUrl: ''
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

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline hover:text-indigo-700',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Typography,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      UnderlineExtension,
    ],
    content: topicData.description,
    onUpdate: ({ editor }) => {
      setTopicData({ ...topicData, description: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[150px] sm:min-h-[200px] p-3 sm:p-4',
      },
    },
  });

  // Update editor content when topicData.description changes
  useEffect(() => {
    if (editor && topicData.description !== editor.getHTML()) {
      editor.commands.setContent(topicData.description);
    }
  }, [topicData.description, editor]);

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

  const handleAddTopic = async () => {
    if (!topicData.title.trim()) {
      toast.error('Topic title is required');
      return;
    }

    if (topicData.videoType === 'youtube' && !topicData.youtubeUrl?.trim()) {
      toast.error('YouTube URL is required');
      return;
    }

    if (topicData.videoType === 'upload' && !videoFile && !editingItem) {
      toast.error('Please upload a video file or select YouTube option');
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
    formData.append('title', topicData.title.trim());
    formData.append('description', topicData.description || '');
    formData.append('isPreviewFree', String(topicData.isPreviewFree));
    formData.append('order', topicData.order || 0);
    formData.append('videoType', topicData.videoType);

    if (topicData.videoType === 'youtube') {
      formData.append('youtubeUrl', topicData.youtubeUrl.trim());
    }

    if (topicData.videoType === 'upload' && videoFile) {
      formData.append('video', videoFile);
    }

    if (notesFile) {
      formData.append('notes', notesFile);
    }

    try {
      const url = editingItem?.type === 'topic'
        ? api.course.updateTopic
        : api.course.addTopic;

      await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(
        editingItem?.type === 'topic'
          ? 'Topic updated successfully'
          : 'Topic added successfully'
      );

      await fetchCourseData();
      closeModal();
    } catch (error) {
      console.error(error);
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
        });
        toast.success('Topic deleted successfully');
        await fetchCourseData();
      } catch (error) {
        console.error('Error deleting topic:', error);
        toast.error(error.response?.data?.message || 'Error deleting topic');
      }
    }
  };

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
        order: topic.order || 0,
        videoType: topic.videoType || 'upload',
        youtubeUrl: topic.youtubeUrl || ''
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
        order: chapter.topics?.length || 0,
        videoType: 'upload',
        youtubeUrl: ''
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
    setTopicData({ 
      title: '', 
      description: '', 
      isPreviewFree: false, 
      order: 0,
      videoType: 'upload',
      youtubeUrl: ''
    });
    setVideoFile(null);
    setNotesFile(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
    setNotesPreview(null);
    setUploading(false);
    if (editor) {
      editor.commands.setContent('');
    }
  };

  const totalModules = course?.modules?.length || 0;
  const totalChapters = course?.modules?.reduce((sum, module) => sum + (module.chapters?.length || 0), 0) || 0;
  const totalTopics = course?.modules?.reduce((sum, module) => 
    sum + (module.chapters?.reduce((chapSum, chapter) => chapSum + (chapter.topics?.length || 0), 0) || 0), 0) || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading course content...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="text-center bg-white p-6 sm:p-10 rounded-2xl shadow-xl max-w-md w-full">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 text-base sm:text-lg font-semibold mb-4">Course not found</p>
          <button 
            onClick={() => navigate('/admin/allcourses')} 
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={18} />
            Go Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const stripHtmlTags = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <button 
            onClick={() => navigate(-1)} 
            className="text-indigo-600 hover:text-indigo-700 mb-3 sm:mb-4 inline-flex items-center gap-1.5 sm:gap-2 font-medium transition-all hover:gap-2 sm:hover:gap-3 text-sm sm:text-base"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex-1 w-full">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent break-words">
                {course.title}
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base lg:text-lg">{course.description}</p>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium">
                  <Layers size={12} className="sm:w-[14px] sm:h-[14px]" />
                  {course.category?.name || 'No Category'}
                </span>
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-medium capitalize">
                  <BookOpen size={12} className="sm:w-[14px] sm:h-[14px]" />
                  {course.level}
                </span>
              </div>
            </div>

            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full lg:w-auto">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 shadow-sm">
                <div className="flex items-center gap-1 sm:gap-2 text-blue-600 mb-1">
                  <FolderTree size={12} className="sm:w-[16px] sm:h-[16px]" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Modules</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{totalModules}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 shadow-sm">
                <div className="flex items-center gap-1 sm:gap-2 text-emerald-600 mb-1">
                  <Grid3x3 size={12} className="sm:w-[16px] sm:h-[16px]" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Chapters</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{totalChapters}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl px-3 sm:px-5 py-2 sm:py-3 shadow-sm">
                <div className="flex items-center gap-1 sm:gap-2 text-amber-600 mb-1">
                  <Sparkles size={12} className="sm:w-[16px] sm:h-[16px]" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Topics</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-800">{totalTopics}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Add Module Button - Responsive */}
        <div className="sticky top-16 sm:top-24 z-10 mb-6 sm:mb-8">
          <button
            onClick={() => openModuleModal()}
            className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <Plus size={18} className="sm:w-[20px] sm:h-[20px] group-hover:rotate-90 transition-transform duration-200" />
            Add New Module
          </button>
        </div>

        {/* Course Structure */}
        {!course.modules || course.modules.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-16 text-center border-2 border-dashed border-indigo-200">
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 animate-bounce">📚</div>
            <p className="text-slate-500 text-lg sm:text-xl mb-2 font-medium">No modules yet.</p>
            <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">Start building your course by adding your first module.</p>
            <button
              onClick={() => openModuleModal()}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium text-sm sm:text-base"
            >
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
              Create First Module
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {course.modules.map((module, moduleIndex) => (
              <div key={module._id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl border border-slate-200">
                {/* Module Header - Responsive */}
                <div className="bg-gradient-to-r from-slate-50 to-white p-4 sm:p-6 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 cursor-pointer w-full" onClick={() => toggleModule(module._id)}>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="text-indigo-600 transition-transform duration-200 mt-0.5">
                          {expandedModules[module._id] ? <ChevronDown size={18} className="sm:w-[24px] sm:h-[24px]" /> : <ChevronRight size={18} className="sm:w-[24px] sm:h-[24px]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs sm:text-sm font-semibold">
                              Module {moduleIndex + 1}
                            </span>
                            <h2 className="text-base sm:text-xl font-bold text-slate-800 break-words flex-1">
                              {module.title}
                            </h2>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                              {module.chapters?.length || 0} {module.chapters?.length === 1 ? 'Chapter' : 'Chapters'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => openChapterModal(module)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 sm:gap-2 transition-all hover:shadow-md"
                      >
                        <Plus size={12} className="sm:w-[16px] sm:h-[16px]" />
                        <span className="hidden xs:inline">Add Chapter</span>
                        <span className="xs:hidden">Chapter</span>
                      </button>
                      <button
                        onClick={() => openModuleModal(module)}
                        className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-1 sm:gap-2 transition-all"
                      >
                        <Edit size={12} className="sm:w-[16px] sm:h-[16px]" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module._id)}
                        className="border border-red-600 text-red-600 hover:bg-red-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-1 sm:gap-2 transition-all"
                      >
                        <Trash2 size={12} className="sm:w-[16px] sm:h-[16px]" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chapters List */}
                {expandedModules[module._id] && (
                  <div className="p-3 sm:p-6 bg-slate-50">
                    {!module.chapters || module.chapters.length === 0 ? (
                      <div className="text-center py-8 sm:py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
                        <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">📖</div>
                        <p className="text-slate-400 text-sm sm:text-base mb-2 sm:mb-3">No chapters yet.</p>
                        <button
                          onClick={() => openChapterModal(module)}
                          className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1.5 text-sm"
                        >
                          <Plus size={14} />
                          Add First Chapter
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {module.chapters.map((chapter, chapterIndex) => (
                          <div key={chapter._id} className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            {/* Chapter Header - Responsive */}
                            <div className="p-3 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                                <div className="flex-1 cursor-pointer w-full" onClick={() => toggleChapter(chapter._id)}>
                                  <div className="flex items-start gap-2 sm:gap-3">
                                    <span className="text-slate-500 transition-transform mt-0.5">
                                      {expandedChapters[chapter._id] ? <ChevronDown size={14} className="sm:w-[18px] sm:h-[18px]" /> : <ChevronRight size={14} className="sm:w-[18px] sm:h-[18px]" />}
                                    </span>
                                    <div className="flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="px-1.5 sm:px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md text-[10px] sm:text-xs font-semibold">
                                          Ch {chapterIndex + 1}
                                        </span>
                                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base break-words flex-1">
                                          {chapter.title}
                                        </h3>
                                        <span className="px-1.5 sm:px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md text-[10px] sm:text-xs font-medium">
                                          {chapter.topics?.length || 0} Topics
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
                                  <button
                                    onClick={() => openTopicModal(module, chapter)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium inline-flex items-center gap-1 sm:gap-1.5 transition-all"
                                  >
                                    <Plus size={10} className="sm:w-[14px] sm:h-[14px]" />
                                    <span className="hidden xs:inline">Add Topic</span>
                                    <span className="xs:hidden">Topic</span>
                                  </button>
                                  <button
                                    onClick={() => openChapterModal(module, chapter)}
                                    className="text-indigo-600 hover:text-indigo-700 p-1 sm:p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                    title="Edit Chapter"
                                  >
                                    <Edit size={12} className="sm:w-[16px] sm:h-[16px]" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteChapter(module._id, chapter._id)}
                                    className="text-red-600 hover:text-red-700 p-1 sm:p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete Chapter"
                                  >
                                    <Trash2 size={12} className="sm:w-[16px] sm:h-[16px]" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Topics List */}
                            {expandedChapters[chapter._id] && (
                              <div className="p-3 sm:p-5 bg-slate-50/50">
                                {!chapter.topics || chapter.topics.length === 0 ? (
                                  <div className="text-center py-8 sm:py-12 bg-white rounded-lg border-2 border-dashed border-slate-200">
                                    <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">✨</div>
                                    <p className="text-slate-400 text-xs sm:text-sm mb-1 sm:mb-2">No topics yet.</p>
                                    <button
                                      onClick={() => openTopicModal(module, chapter)}
                                      className="text-indigo-600 hover:text-indigo-700 text-xs sm:text-sm font-medium inline-flex items-center gap-1"
                                    >
                                      <Plus size={12} />
                                      Add First Topic
                                    </button>
                                  </div>
                                ) : (
                                  <div className="grid gap-2 sm:gap-3">
                                    {chapter.topics.map((topic, topicIndex) => (
                                      <div key={topic._id} className="group bg-white rounded-lg sm:rounded-xl border border-slate-200 p-3 sm:p-4 hover:shadow-md transition-all hover:border-indigo-200">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                          <div className="flex-1 w-full">
                                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1.5 sm:mb-2">
                                              <span className="text-slate-400 text-[10px] sm:text-xs font-mono font-medium">#{String(topicIndex + 1).padStart(2, '0')}</span>
                                              <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm sm:text-base break-words">
                                                {topic.title}
                                              </h4>
                                              {topic.isPreviewFree && (
                                                <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] sm:text-xs font-medium">
                                                  <Eye size={10} className="sm:w-[12px] sm:h-[12px]" />
                                                  Free
                                                </span>
                                              )}
                                              {!topic.isPreviewFree && (
                                                <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] sm:text-xs font-medium">
                                                  <Lock size={10} className="sm:w-[12px] sm:h-[12px]" />
                                                  Paid
                                                </span>
                                              )}
                                              {topic.videoType === 'youtube' && (
                                                <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] sm:text-xs font-medium">
                                                  <YoutubeIcon size={10} className="sm:w-[12px] sm:h-[12px]" />
                                                  YouTube
                                                </span>
                                              )}
                                            </div>
                                            {topic.description && (
                                              <div className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3 ml-0 sm:ml-7 line-clamp-2">
                                                <div dangerouslySetInnerHTML={{ __html: stripHtmlTags(topic.description) }} />
                                              </div>
                                            )}
                                            <div className="flex flex-wrap gap-2 sm:gap-4 ml-0 sm:ml-7">
                                              {topic.videoUrl && (
                                                <a
                                                  href={topic.videoUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                                                >
                                                  {topic.videoType === 'youtube' ? <YoutubeIcon size={10} className="sm:w-[14px] sm:h-[14px]" /> : <Video size={10} className="sm:w-[14px] sm:h-[14px]" />}
                                                  {topic.videoType === 'youtube' ? 'Watch' : 'Video'}
                                                </a>
                                              )}
                                              {topic.notesUrl && (
                                                <a
                                                  href={topic.notesUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                                >
                                                  <Download size={10} className="sm:w-[14px] sm:h-[14px]" />
                                                  Notes
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-full sm:w-auto justify-end">
                                            <button
                                              onClick={() => openTopicModal(module, chapter, topic)}
                                              className="text-indigo-600 hover:text-indigo-700 p-1 sm:p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                              title="Edit Topic"
                                            >
                                              <Edit size={12} className="sm:w-[16px] sm:h-[16px]" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteTopic(module._id, chapter._id, topic._id)}
                                              className="text-red-600 hover:text-red-700 p-1 sm:p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                              title="Delete Topic"
                                            >
                                              <Trash2 size={12} className="sm:w-[16px] sm:h-[16px]" />
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

      {/* Modal with TipTap Editor - Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn" onClick={closeModal}>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl z-10">
              <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {modalType === 'module' && (editingItem?.type === 'module' ? 'Edit Module' : 'Create New Module')}
                {modalType === 'chapter' && (editingItem?.type === 'chapter' ? 'Edit Chapter' : 'Create New Chapter')}
                {modalType === 'topic' && (editingItem?.type === 'topic' ? 'Edit Topic' : 'Create New Topic')}
              </h2>
            </div>
            
            <div className="p-4 sm:p-6">
              {modalType === 'module' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Module Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Introduction to Programming"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                      value={moduleTitle}
                      onChange={(e) => setModuleTitle(e.target.value)}
                      autoFocus
                    />
                    <p className="text-xs text-slate-400 mt-1">Give your module a clear and descriptive title</p>
                  </div>
                </div>
              )}

              {modalType === 'chapter' && (
                <div className="space-y-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <p className="text-xs sm:text-sm text-slate-700 flex items-center gap-2">
                      <FolderTree size={12} className="sm:w-[14px] sm:h-[14px] text-indigo-600" />
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
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {modalType === 'topic' && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl">
                    <p className="text-xs sm:text-sm text-slate-700 mb-1 flex items-center gap-2">
                      <FolderTree size={12} className="sm:w-[14px] sm:h-[14px] text-indigo-600" />
                      <span>Module: <span className="font-semibold text-indigo-700">{selectedModule?.title}</span></span>
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 flex items-center gap-2">
                      <Grid3x3 size={12} className="sm:w-[14px] sm:h-[14px] text-emerald-600" />
                      <span>Chapter: <span className="font-semibold text-emerald-700">{selectedChapter?.title}</span></span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Topic Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter topic title"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                      value={topicData.title}
                      onChange={(e) => setTopicData({ ...topicData, title: e.target.value })}
                    />
                  </div>

                  {/* TipTap Rich Text Editor - Responsive Toolbar */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description (Rich Text)
                    </label>
                    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                      {/* Toolbar - Horizontal scroll on mobile */}
                      <div className="border-b border-slate-200 p-1 sm:p-2 bg-slate-50 overflow-x-auto whitespace-nowrap scrollbar-thin">
                        <div className="inline-flex gap-0.5 sm:gap-1">
                          <MenuButton
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                            isActive={editor?.isActive('bold')}
                            title="Bold"
                          >
                            <Bold size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          <MenuButton
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                            isActive={editor?.isActive('italic')}
                            title="Italic"
                          >
                            <Italic size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          <MenuButton
                            onClick={() => editor?.chain().focus().toggleUnderline().run()}
                            isActive={editor?.isActive('underline')}
                            title="Underline"
                          >
                            <Underline size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          <MenuButton
                            onClick={() => editor?.chain().focus().toggleStrike().run()}
                            isActive={editor?.isActive('strike')}
                            title="Strikethrough"
                          >
                            <Strikethrough size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          
                          <div className="w-px h-6 bg-slate-300 mx-0.5 sm:mx-1" />
                          
                          <MenuButton
                            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                            isActive={editor?.isActive('heading', { level: 1 })}
                            title="Heading 1"
                          >
                            <Heading1 size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          <MenuButton
                            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                            isActive={editor?.isActive('heading', { level: 2 })}
                            title="Heading 2"
                          >
                            <Heading2 size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          
                          <div className="w-px h-6 bg-slate-300 mx-0.5 sm:mx-1" />
                          
                          <MenuButton
                            onClick={() => editor?.chain().focus().toggleBulletList().run()}
                            isActive={editor?.isActive('bulletList')}
                            title="Bullet List"
                          >
                            <List size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          <MenuButton
                            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                            isActive={editor?.isActive('orderedList')}
                            title="Numbered List"
                          >
                            <ListOrdered size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          
                          <div className="w-px h-6 bg-slate-300 mx-0.5 sm:mx-1" />
                          
                          <MenuButton
                            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                            isActive={editor?.isActive({ textAlign: 'left' })}
                            title="Align Left"
                          >
                            <AlignLeft size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          <MenuButton
                            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                            isActive={editor?.isActive({ textAlign: 'center' })}
                            title="Align Center"
                          >
                            <AlignCenter size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          <MenuButton
                            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                            isActive={editor?.isActive({ textAlign: 'right' })}
                            title="Align Right"
                          >
                            <AlignRight size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          
                          <div className="w-px h-6 bg-slate-300 mx-0.5 sm:mx-1" />
                          
                          <MenuButton
                            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                            isActive={editor?.isActive('blockquote')}
                            title="Quote"
                          >
                            <Quote size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                          <MenuButton
                            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                            isActive={editor?.isActive('codeBlock')}
                            title="Code Block"
                          >
                            <Code size={14} className="sm:w-[18px] sm:h-[18px]" />
                          </MenuButton>
                        </div>
                      </div>
                      
                      <EditorContent editor={editor} className="prose max-w-none" />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      You can format text, add lists, headings, and more to make your description engaging
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      placeholder="Topic order"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                      value={topicData.order}
                      onChange={(e) => setTopicData({ ...topicData, order: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-slate-400 mt-1">Lower numbers appear first</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Video Source <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setTopicData({ ...topicData, videoType: 'upload', youtubeUrl: '' });
                          setVideoFile(null);
                          if (videoPreview) {
                            URL.revokeObjectURL(videoPreview);
                            setVideoPreview(null);
                          }
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          topicData.videoType === 'upload'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Video size={16} />
                        Upload Video
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTopicData({ ...topicData, videoType: 'youtube' });
                          setVideoFile(null);
                          if (videoPreview) {
                            URL.revokeObjectURL(videoPreview);
                            setVideoPreview(null);
                          }
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          topicData.videoType === 'youtube'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <YoutubeIcon size={16} />
                        YouTube URL
                      </button>
                    </div>
                  </div>

                  {topicData.videoType === 'youtube' ? (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        YouTube URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base"
                        value={topicData.youtubeUrl}
                        onChange={(e) => setTopicData({ ...topicData, youtubeUrl: e.target.value })}
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Enter the full YouTube video URL
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Video File <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-6 hover:border-indigo-400 transition-all hover:bg-indigo-50/20">
                        {!videoPreview ? (
                          <label className="cursor-pointer block text-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                              <Upload size={20} className="sm:w-[28px] sm:h-[28px] text-indigo-600" />
                            </div>
                            <p className="text-slate-600 mb-1 font-medium text-sm">Click to upload video</p>
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
                              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {topicData.isPreviewFree ? (
                        <Unlock size={16} className="sm:w-[20px] sm:h-[20px] text-emerald-600" />
                      ) : (
                        <Lock size={16} className="sm:w-[20px] sm:h-[20px] text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-800 text-sm sm:text-base">
                          {topicData.isPreviewFree ? 'Free Preview Available' : 'Paid Content'}
                        </p>
                        <p className="text-xs text-slate-500 hidden sm:block">
                          {topicData.isPreviewFree 
                            ? 'Students can preview this topic before enrollment' 
                            : 'Students must enroll to access this content'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTopicData({ ...topicData, isPreviewFree: !topicData.isPreviewFree })}
                      className={`relative inline-flex h-5 sm:h-6 w-9 sm:w-11 items-center rounded-full transition-all ${
                        topicData.isPreviewFree ? 'bg-emerald-600' : 'bg-red-500'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                          topicData.isPreviewFree ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Notes (PDF) - Optional
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 sm:p-6 hover:border-purple-400 transition-all hover:bg-purple-50/20">
                      {!notesPreview ? (
                        <label className="cursor-pointer block text-center">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                            <FileText size={20} className="sm:w-[28px] sm:h-[28px] text-purple-600" />
                          </div>
                          <p className="text-slate-600 mb-1 font-medium text-sm">Click to upload notes</p>
                          <p className="text-xs text-slate-400">PDF only (Max 10MB)</p>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={handleNotesChange}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FileText size={16} className="sm:w-[20px] sm:h-[20px] text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-slate-700">{notesPreview}</p>
                              <p className="text-[10px] sm:text-xs text-slate-400">PDF Document</p>
                            </div>
                          </div>
                          <button
                            onClick={removeNotes}
                            className="text-red-600 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <X size={14} className="sm:w-[16px] sm:h-[16px]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 sm:mt-8 pt-4 border-t border-slate-200">
                <button 
                  onClick={closeModal} 
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm sm:text-base order-2 sm:order-1"
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
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm sm:text-base order-1 sm:order-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px]" />
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
        
        /* TipTap Editor Styles */
        .ProseMirror {
          min-height: 150px;
          padding: 0.75rem;
          outline: none;
          font-size: 14px;
        }
        @media (min-width: 640px) {
          .ProseMirror {
            min-height: 200px;
            padding: 1rem;
            font-size: 16px;
          }
        }
        .ProseMirror p {
          margin-bottom: 0.75rem;
        }
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        @media (min-width: 640px) {
          .ProseMirror h1 {
            font-size: 1.875rem;
          }
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
        }
        @media (min-width: 640px) {
          .ProseMirror h2 {
            font-size: 1.5rem;
          }
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror li {
          margin-bottom: 0.25rem;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #475569;
          font-style: italic;
        }
        .ProseMirror code {
          background-color: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        .ProseMirror pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .ProseMirror pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
        .ProseMirror a {
          color: #6366f1;
          text-decoration: underline;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        /* Custom scrollbar for toolbar */
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        /* Hide scrollbar on mobile but keep functionality */
        @media (max-width: 640px) {
          .scrollbar-thin {
            scrollbar-width: thin;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseContentManager;