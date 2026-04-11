const Base_Url = import.meta.env.VITE_BASE_URL

const api = {
    course:{
        getCategory:Base_Url+"/course/get_category",
        createCourse:Base_Url+"/course/create_course",
        getCourse:Base_Url+"/course/get_course",

        getCourseById:Base_Url+"/course/get-course-by-id",
        addModule:Base_Url+"/course/add-module",
        editModule:Base_Url+"/course/edit-module",
        deleteModule:Base_Url+"/course/delete-module",

        addchapter:Base_Url+"/course/add-chapter",
        editChapter:Base_Url+"/course/edit-chapter",
        deleteChapter:Base_Url+"/course/delete-chapter",

        addTopic:Base_Url+"/course/add-topic",
        updateTopic:Base_Url+"/course/edit-topic",
        deleteTopic:Base_Url+"/course/delete-topic"
    },
      createCourse:{
        getCategory:Base_Url+"/createCourse/get_category",
        createCourse:Base_Url+"/createCourse/create_course",
        getCourse:Base_Url+"/createCourse/get_course",
        editCourse:Base_Url+"/createCourse/edit_course",
        deleteCourse:Base_Url+"/createCourse/delete_course",
 


}
}

export default api