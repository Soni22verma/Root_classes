import App from "../App";
import {  createBrowserRouter } from "react-router-dom";
import AdminLogin from "../pages/Admin/AdminLogin";
import AdminLayout from "../../AdminLayout";
import AllStudents from "../pages/StudentManagement/AllStudents";
import CreateCourse from "../pages/Courses/CreateCourse";
import AllCourses from "../pages/Courses/AllCourses";
import Enrollment from "../pages/Courses/Enrollment";
const route = createBrowserRouter([
    {
        path:'/',
        element:<App/>,
        children:[
            {
                path:"/",
                element:<AdminLogin/>
            },
           {
            path:"/admin",
            element:<AdminLayout/>
           },
           {
            path:"/admin/allstudent",
            element:<AllStudents/>
           },
           {
            path:"/admin/createcourse",
            element:<CreateCourse/>
           },
           {
            path:"/admin/allcourses",
            element:<AllCourses/>
           },
           {
            path:"/admin/enrollment",
            element:<Enrollment/>
           }
        ]

    }
])
export default route