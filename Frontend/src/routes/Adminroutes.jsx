import AllStudents from "../pages/Admin/StudentManagement/AllStudents";
import CreateCourse from "../pages/Admin/Courses/CreateCourse";
import AllCourses from "../pages/Admin/Courses/AllCourses";
import Enrollment from "../pages/Admin/Courses/Enrollment";
import AdminLayout from "../../AdminLayout";
import ClassShadule from "../pages/Admin/OnlineClasses/ClassShadule"
import Topics from "../pages/Admin/OnlineClasses/Topics";
import AllBlogs from "../pages/Admin/BlogManagement/AllBlogs";

const Adminroutes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "allstudent",
        element: <AllStudents />,
      },
      {
        path: "createcourse",
        element: <CreateCourse />,
      },
      {
        path: "allcourses",
        element: <AllCourses />,
      },
      {
        path: "enrollment",
        element: <Enrollment />,
      },
      {
        path:"classshadule",
        element:<ClassShadule/>
      },
      {
        path:"topics",
        element:<Topics/>
      },
      {
        path:"blog",
        element:<AllBlogs/>
      }
    ],
  },
];

export default Adminroutes;