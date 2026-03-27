const Base_Url = import.meta.env.VITE_BASE_URL

const api = {
    student:{
        register:Base_Url+"/student/student-register",
        login:Base_Url+"/student/student-login",
        getStudent:Base_Url+"/student/get-student",
        editProfile:Base_Url+"/student/std-profile-img"
    }
}

export default api