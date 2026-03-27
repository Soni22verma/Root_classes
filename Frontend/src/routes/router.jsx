import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from '../components/Home/Home'
import StudentLogin from '../components/Student/StudentLogin';
import StudentRegister from '../components/Student/StudentRegister';
import Courses from '../pages/Courses';
import OnlineCourse from "../pages/OnlineCourse";
import Schollarship from "../pages/Schollarship";
import Career from "../pages/Career";
import Blog from "../pages/Blog";
import Contact from "../pages/Contact";
import StudentProfile from "../components/Student/StudentProfile";

const route = createBrowserRouter([
    {
        path:"/",
        element:<App/>,
        children:[
            {
                path:"",
                element:<Home/>
            },
            {
                path:'/stdlogin',
                element:<StudentLogin/>
            },
            {
                path:'/stdregister',
                element:<StudentRegister/>
            },
            {
                path:'/course',
                element:<Courses/>
            },
            {
                path:'/onlinecourse',
                element:<OnlineCourse/>
            },
            {
                path:"/schollarship",
                element:<Schollarship/>
            },
            {
                path:"/career",
                element:<Career/>
            },
            {
                path:"/blog",
                element:<Blog/>
            },
            {
                path:"/contact",
                element:<Contact/>
            },
            {
                path:"/stdprofile",
                element:<StudentProfile/>
            }
        ]
    }
])
export default route