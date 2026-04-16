const Base_Url = import.meta.env.VITE_BASE_URL

const api = {
    student:{
        register:Base_Url+"/student/register",
        login:Base_Url+"/student/login",
        getStudent:Base_Url+"/student/get-student",
        editProfile:Base_Url+"/student/std-profile-img",
        editprofiledetails:Base_Url+"/student/edit-profile-details",
        sendOtp:Base_Url+"/student/send-otp",
        verifyOTP:Base_Url+"/student/verify-otp",
        resetPassword:Base_Url+"/student/reset-password"
    },
    course:{
        getcourses:Base_Url+"/course/get_courses",
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
    },
     fullcourse:{
        getfullcourse:Base_Url+"/course/get-full-course"
    },
    test:{
      publishTest:Base_Url+"/test/get_isPublish",
      getQuestion:Base_Url+"/test/get_questions"
     },
     result:{
        submitTest:Base_Url+"/result/submit_test"
     },
     enrollment:{
       enrollCourse:Base_Url+"/student/enroll-course"
     },
     scholarship:{
        apply:Base_Url+"/scholarship/apply",
       enrollCourse:Base_Url+"/student/enroll-course",

     },
     payment:{
       createPayment:Base_Url+"/payment/create-payment",
       verifyPayment:Base_Url+"/payment/verify-payment"
     }
}

export default api