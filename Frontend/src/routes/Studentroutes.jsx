import Home from "../components/Home/Home";
import StudentLogin from "../components/Student/StudentLogin";
import StudentRegister from "../components/Student/StudentRegister";
import OnlineCourse from "../pages/Student/OnlineCourse";
import Schollarship from "../pages/Student/Schollarship";
import Career from "../pages/Student/Career";
import Blog from "../pages/Student/Blog";
import Contact from "../pages/Student/Contact";
import StudentProfile from "../components/Student/StudentProfile";
import Courses from "../pages/Student/Courses"
import Layout from "../Layout"

const StudentRoutes = [
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "",
                element: <Home />,
            },
            {
                path: "/stdlogin",
                element: <StudentLogin />,
            },
            {
                path: "/register",
                element: <StudentRegister />,
            },
            {
                path: "/course",
                element: <Courses />,
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
                path: "/career",
                element: <Career />,
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
        ]
    }

];

export default StudentRoutes;