import Home from "../components/Home/Home";
import StudentLogin from "../components/Student/StudentLogin";
import StudentRegister from "../components/Student/StudentRegister";
import OnlineCourse from "../pages/Student/OnlineCourse";
import Schollarship from "../pages/Student/Schollarship";
import TestList from "../pages/Student/TestList";
import Blog from "../pages/Student/Blog";
import Contact from "../pages/Student/Contact";
import StudentProfile from "../components/Student/StudentProfile";
import Layout from "../Layout"
import Courses from "../pages/Student/Course/Courses";
import CourseDetails from "../pages/Student/Course/CourseDetails"
import PurchesCourses from "../components/Student/PurchesCourses";

const StudentRoutes = [

    {
        path: "/stdlogin",
        element: <StudentLogin />,
    },
    {
        path: "/register",
        element: <StudentRegister />,
    },

    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "/course",
                element: <Courses />,
            },
            {
                path:"/coursedetails",
                element: <CourseDetails/>
            },
            {
                path: "/onlinecourse",
                element: <OnlineCourse />,
            },
            {
                path: "/schollarship",
                element: <Schollarship />,
            },
            {
                path: "/test",
                element: <TestList />,
            },
            {
                path: "/blog",
                element: <Blog />,
            },
            {
                path: "/contact",
                element: <Contact />,
            },
            {
                path: "/stdprofile",
                element: <StudentProfile />,
            },
            {
                path:"/purchescourse",
                element:<PurchesCourses/>
            }
        ]
    }

];

export default StudentRoutes;