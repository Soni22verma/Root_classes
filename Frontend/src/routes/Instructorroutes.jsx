import { Children } from "react";
import AdminLayout from "../../AdminLayout";
import AllCourse from "../pages/Instructor/courses/AllCourse";

const Instructorroutes = [
{
    path:"/admin",
    element:<AdminLayout/>,
    children:[
       {
        path:"/admin/allcourses",
        element:<AllCourse/>
       }
    ]
} 
]

export default Instructorroutes