import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Edit, ChevronDown, ChevronUp, Loader, X, CheckCircle, Radio, BookOpen, Clock, Percent, AlertCircle } from 'lucide-react';
import axios from 'axios';
import api from '../../services/adminendpoint';

const AdminTestCreator = () => {
  const [allTests, setAllTests] = useState([]);
  const [expandedTest, setExpandedTest] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [publishingTestId, setPublishingTestId] = useState(null);
  const [deletingTestId, setDeletingTestId] = useState(null);

  // New Test Form
  const [newTest, setNewTest] = useState({
    title: '',
    passingPercentage: 70,
    duration: 60,
    isPublished: 'draft'
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1
  });

  useEffect(() => {
    fetchAllTests();
  }, []);

  const fetchAllTests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(api.test.getQuestion, {});
      console.log("API Response:", response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const tests = response.data.data.map(item => ({
          _id: item._id,
          title: item.title,
          questions: item.questions || [],
          isPublished: item.isPublished || false,
          passingPercentage: item.passingPercentage || 70,
          duration: item.duration || 60
        }));
        setAllTests(tests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      alert('Failed to load tests');
    } finally {
      setIsLoading(false);
    }
  };

  const createTest = async () => {
    if (!newTest.title.trim()) {
      alert('Please enter test title');
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post(api.test.createTest, {
        title: newTest.title,
        duration: newTest.duration,
        passingPercentage: newTest.passingPercentage,
        isPublished: newTest.isPublished === 'published'
      });
      
      if (response.data.success) {
        setNewTest({ title: '', passingPercentage: 70, duration: 60, isPublished: 'draft' });
        await fetchAllTests();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        alert('Test created successfully!');
      }
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Failed to create test');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTest = async (testId, testTitle) => {
    if (window.confirm(`Are you sure you want to delete the test "${testTitle}"? This action cannot be undone and will delete all questions in this test.`)) {
      setDeletingTestId(testId);
      try {
        const response = await axios.post(api.test.deleteTest, {
          testId: testId
        });
        
        if (response.data.success) {
          await fetchAllTests();
          alert('Test deleted successfully!');
          if (expandedTest === testId) {
            setExpandedTest(null);
          }
        } else {
          alert('Failed to delete test');
        }
      } catch (error) {
        console.error('Error deleting test:', error);
        alert('Failed to delete test');
      } finally {
        setDeletingTestId(null);
      }
    }
  };

  const addQuestion = async (testId, questionData) => {
    try {
      const response = await axios.post(api.test.addQuestion, {
        testId: testId,
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        marks: questionData.marks
      });
      
      if (response.data.success) {
        await fetchAllTests();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  };

  const updateQuestion = async (testId, questionId, questionData) => {
    try {
      const response = await axios.post(api.test.editQuestion, {
        testId: testId,
        questionId: questionId,
        question: questionData.question,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        marks: questionData.marks
      });
      
      if (response.data.success) {
        await fetchAllTests(); 
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  };

  const deleteQuestion = async (testId, questionId) => {
    try {
      console.log(testId, questionId);
      const response = await axios.post(api.test.deleteQuestion, {
        testId: testId, 
        questionId: questionId 
      });
      console.log(response);
      if (response.data.success) {
        await fetchAllTests(); 
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  };

  const updatePublishStatus = async (testId, isPublished) => {
    setPublishingTestId(testId);
    try {
      const response = await axios.post(api.test.isPublished, {
        testId: testId,
        isPublished: isPublished
      });
      console.log(response);
      if (response.data.success) {
        await fetchAllTests();
        alert(`Test ${isPublished ? 'published' : 'unpublished'} successfully!`);
      }
    } catch (error) {
      console.error('Error updating publish status:', error);
      alert('Failed to update test status');
    } finally {
      setPublishingTestId(null);
    }
  };

  const openQuestionModal = (test = null, question = null) => {
    if (question && test) {
      setQuestionForm({
        question: question.question,
        options: [...question.options],
        correctAnswer: question.correctAnswer,
        marks: question.marks
      });
      setEditingQuestion({ testId: test._id, questionId: question._id });
    } else if (test) {
      setQuestionForm({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        marks: 1
      });
      setEditingQuestion({ testId: test._id, questionId: null });
    }
    setIsQuestionModalOpen(true);
  };

  const saveQuestion = async () => {
    if (!questionForm.question.trim()) {
      alert('Please enter a question');
      return;
    }
    if (questionForm.options.some(opt => !opt.trim())) {
      alert('Please fill all options');
      return;
    }
    if (!questionForm.correctAnswer) {
      alert('Please select the correct answer');
      return;
    }

    const questionData = {
      question: questionForm.question,
      options: questionForm.options,
      correctAnswer: questionForm.correctAnswer,
      marks: questionForm.marks
    };

    setIsSaving(true);
    try {
      if (editingQuestion?.questionId) {
        await updateQuestion(editingQuestion.testId, editingQuestion.questionId, questionData);
        alert('Question updated successfully!');
      } else if (editingQuestion?.testId) {
        await addQuestion(editingQuestion.testId, questionData);
        alert('Question added successfully!');
      }
      
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      alert('Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (testId, questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(testId, questionId);
        alert('Question deleted successfully!');
      } catch (error) {
        alert('Failed to delete question');
      }
    }
  };

  const toggleTest = (testId) => {
    setExpandedTest(expandedTest === testId ? null : testId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-3 text-gray-600">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Test Creator</h1>
          </div>
          <p className="text-gray-600 ml-11">Create and manage your assessments with ease</p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle size={20} />
            <span className="font-medium">Test created successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create New Test Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Create New Test</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Test Title *</label>
                <input
                  type="text"
                  value={newTest.title}
                  onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  placeholder="e.g., JavaScript Fundamentals Quiz"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-1">
                      <Percent size={14} />
                      Passing Percentage
                    </div>
                  </label>
                  <input
                    type="number"
                    value={newTest.passingPercentage}
                    onChange={(e) => setNewTest({ ...newTest, passingPercentage: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      Duration (minutes)
                    </div>
                  </label>
                  <input
                    type="number"
                    value={newTest.duration}
                    onChange={(e) => setNewTest({ ...newTest, duration: Number(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Radio Buttons for Publish Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Publish Status</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="publishStatus"
                      value="draft"
                      checked={newTest.isPublished === 'draft'}
                      onChange={(e) => setNewTest({ ...newTest, isPublished: e.target.value })}
                      className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                    />
                    <span className="text-sm text-gray-700">Save as Draft</span>
                    <span className="text-xs text-gray-400 ml-1">(Not visible to users)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="publishStatus"
                      value="published"
                      checked={newTest.isPublished === 'published'}
                      onChange={(e) => setNewTest({ ...newTest, isPublished: e.target.value })}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Publish Immediately</span>
                    <span className="text-xs text-green-600 ml-1">(Visible to users)</span>
                  </label>
                </div>
              </div>

              <button
                onClick={createTest}
                disabled={isSaving || !newTest.title.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isSaving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                Create Test
              </button>
            </div>
          </div>

          {/* All Tests Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">All Tests</h2>
              <span className="ml-auto text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {allTests.length} {allTests.length === 1 ? 'Test' : 'Tests'}
              </span>
            </div>
            
            {allTests.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No tests created yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first test using the form</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {allTests.map((test) => (
                  <div key={test._id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition-all">
                    {/* Test Header */}
                    <div className="bg-white">
                      <div 
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => toggleTest(test._id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-800">{test.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              test.isPublished 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {test.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {test.duration || 60} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Percent size={12} />
                              {test.passingPercentage || 70}% to pass
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                            {test.questions?.length || 0} Qs
                          </span>
                          
                          {/* Publish Toggle Buttons */}
                          <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-1">
                            {publishingTestId === test._id ? (
                              <Loader className="animate-spin h-4 w-4 text-gray-500" />
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!test.isPublished) {
                                      updatePublishStatus(test._id, true);
                                    }
                                  }}
                                  className={`px-2 py-1 text-xs rounded-lg transition ${
                                    test.isPublished
                                      ? 'bg-green-100 text-green-700 cursor-default'
                                      : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                                  }`}
                                  disabled={test.isPublished}
                                >
                                  Publish
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (test.isPublished) {
                                      updatePublishStatus(test._id, false);
                                    }
                                  }}
                                  className={`px-2 py-1 text-xs rounded-lg transition ${
                                    !test.isPublished
                                      ? 'bg-yellow-100 text-yellow-700 cursor-default'
                                      : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-700'
                                  }`}
                                  disabled={!test.isPublished}
                                >
                                  Draft
                                </button>
                              </>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuestionModal(test, null);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Add Question"
                          >
                            <Plus size={18} />
                          </button>

                          {/* Delete Test Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTest(test._id, test.title);
                            }}
                            disabled={deletingTestId === test._id}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Test"
                          >
                            {deletingTestId === test._id ? (
                              <Loader className="animate-spin" size={18} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                          
                          {expandedTest === test._id ? (
                            <ChevronUp size={18} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Questions Section */}
                    {expandedTest === test._id && (
                      <div className="border-t border-gray-100 bg-gray-50 p-4">
                        {!test.questions || test.questions.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-gray-400">No questions added yet</p>
                            <button
                              onClick={() => openQuestionModal(test, null)}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              + Add your first question
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {test.questions.map((q, idx) => (
                              <div key={q._id || idx} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        Q{idx + 1}
                                      </span>
                                      <span className="text-xs text-gray-500">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                                    </div>
                                    <p className="text-sm text-gray-800 font-medium mb-3">{q.question}</p>
                                    <div className="flex flex-wrap gap-2">
                                      {q.options?.map((opt, optIdx) => (
                                        <span
                                          key={optIdx}
                                          className={`text-xs px-3 py-1.5 rounded-full transition ${
                                            opt === q.correctAnswer
                                              ? 'bg-green-100 text-green-700 border border-green-200'
                                              : 'bg-gray-100 text-gray-600'
                                          }`}
                                        >
                                          {opt}
                                          {opt === q.correctAnswer && ' ✓'}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex gap-1 ml-3">
                                    <button
                                      onClick={() => openQuestionModal(test, q)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                      title="Edit"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(test._id, q._id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title="Delete"
                                    >
                                      <Trash2 size={14} />
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
        </div>

        {/* Question Modal */}
        {isQuestionModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingQuestion?.questionId ? 'Edit Question' : 'Add New Question'}
                </h2>
                <button 
                  onClick={() => setIsQuestionModalOpen(false)} 
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                  <textarea
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    rows="3"
                    placeholder="Enter your question..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                  <div className="space-y-2">
                    {questionForm.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-8 text-sm font-medium text-gray-500">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[idx] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {questionForm.options.length > 2 && (
                          <button
                            onClick={() => {
                              const newOptions = questionForm.options.filter((_, i) => i !== idx);
                              setQuestionForm({ ...questionForm, options: newOptions });
                            }}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {questionForm.options.length < 6 && (
                    <button
                      onClick={() => setQuestionForm({
                        ...questionForm,
                        options: [...questionForm.options, '']
                      })}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Option
                    </button>
                  )}
                </div>

                {/* Correct Answer & Marks */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
                    <select
                      value={questionForm.correctAnswer}
                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select correct answer</option>
                      {questionForm.options.map((opt, idx) => (
                        opt && <option key={idx} value={opt}>Option {String.fromCharCode(65 + idx)} - {opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marks *</label>
                    <input
                      type="number"
                      value={questionForm.marks}
                      onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                      min="1"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveQuestion}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 shadow-md"
                >
                  {isSaving && <Loader className="animate-spin inline-block mr-2" size={16} />}
                  Save Question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default AdminTestCreator;