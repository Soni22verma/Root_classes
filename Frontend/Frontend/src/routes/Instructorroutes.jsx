import { Children } from "react";
import AdminLayout from "../../AdminLayout";
import AllCourse from "../pages/Instructor/courses/AllCourse";
import CourseContentManager from "../pages/Instructor/courses/CourseContentManager";

const Instructorroutes = [
{
    path:"/instructor",
    element:<AdminLayout/>,
    children:[
       {
        path:"allcourses",
        element:<AllCourse/>
       }
       ,{
        path:"allcourses/:id",
        element:<CourseContentManager/>
       }
    ]
} 
]

export default Instructorroutes