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
    enroll:{
        enrollcourse:Base_Url+"/enroll/enroll_course"
    }
}

export default api