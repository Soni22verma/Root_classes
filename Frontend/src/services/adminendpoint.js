const Base_Url = import.meta.env.VITE_BASE_URL

const api ={
    admin:{
        getStudents:Base_Url+"/admin/getall_student"
    },
    course:{
        createcourse:Base_Url+"/course/create_course",
        getcourses:Base_Url+"/course/get_courses",
        editcourse:Base_Url+"/course/edit_course",
        deletecourse:Base_Url+"/course/delete_course"
    },
    enroll:{
        getenrollment:Base_Url+"/enroll/get_enrollment",
        getAllenrollment:Base_Url+"/enroll/all_enrollment"
    },
    onlineClass:{
        createclass:Base_Url+"/onlineClass/create_class",
        getclass:Base_Url+"/onlineClass/get_class",
        editclass:Base_Url+"/onlineClass/edit_class",
        deleteclass:Base_Url+"/onlineClass/delete_class",
    },
    joinclass:{
        getstdcount:Base_Url+"/joinclass/get_stdcount"
        
    },
    topic:{
        createTopic:Base_Url+"/topic/create_topic",
        gettopicbyclass:Base_Url+"/topic/get_topicbyclass",
        updateTopic:Base_Url+"/topic/update_topic",
        deletetopic:Base_Url+"/topic/delete_topic"
    },
    blog:{
        createblog:Base_Url+"/blog/create_blog",
        getblog:Base_Url+"/blog/get_blogs",
        editblog:Base_Url+"/blog/update_blog",
        deleteblog:Base_Url+"/blog/delete_blog"
    }
    
}
export default api