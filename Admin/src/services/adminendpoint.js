const Base_Url = import.meta.env.VITE_BASE_URL

const api ={
    admin:{
        login:Base_Url+"/admin/admin-login",
        getStudents:Base_Url+"/admin/getall_student"
    },
    course:{
        createcourse:Base_Url+"/course/create_course",
        getcourses:Base_Url+"/course/get_courses",
        editcourse:Base_Url+"/course/edit_course",
        deletecourse:Base_Url+"/course/delete_course"
    },
    enroll:{
        getenrollment:Base_Url+"/enroll/get_enrollment"
    }
}
export default api