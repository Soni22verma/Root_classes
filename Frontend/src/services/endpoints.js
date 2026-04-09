const Base_Url = import.meta.env.VITE_BASE_URL

const api = {
    student:{
        register:Base_Url+"/student/student-register",
        login:Base_Url+"/student/student-login",
        getStudent:Base_Url+"/student/get-student",
        editProfile:Base_Url+"/student/std-profile-img",
        editprofiledetails:Base_Url+"/student/edit-profile-details"
    },
    course:{
        getcourses:Base_Url+"/course/get_courses",
    },
    enrollment:{
        enrollcourse:Base_Url+"/enroll/enroll_course"
    },
     onlineClass:{
           getallclass:Base_Url+"/onlineClass/get_all_classes",
     },
      joinClass:{
        joinClasses:Base_Url+"/joinclass/join_class"
    },
    topic:{
        gettopicbyclass:Base_Url+"/topic/get_topicbyclass",
        //  gettopic:Base_Url+"/topic/get_topic",
    },
    blog:{
        getblog:Base_Url+"/blog/get_blogs",
    },
    slider:{
        getSlider:Base_Url+"/slider/get_slider"
    },
    testimonial:{
        getTestimonial:Base_Url+"/testimonial/get_testimonial",
    }
}

export default api