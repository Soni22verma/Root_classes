const Base_Url = import.meta.env.VITE_BASE_URL

const api = {
    createCourse:{
        getCategory:Base_Url+"/createCourse/get_category",
        createCourse:Base_Url+"/createCourse/create_course",
        getCourse:Base_Url+"/createCourse/get_course"
    }
}

export default api