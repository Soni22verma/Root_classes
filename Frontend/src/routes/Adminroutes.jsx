import AllStudents from "../pages/Admin/StudentManagement/AllStudents";
import Enrollment from "../pages/Admin/Courses/Enrollment";
import AdminLayout from "../../AdminLayout";
import ClassShadule from "../pages/Admin/OnlineClasses/ClassShadule"
import Topics from "../pages/Admin/OnlineClasses/Topics";
import AllBlogs from "../pages/Admin/BlogManagement/AllBlogs";
import ManageSlider from "../pages/Admin/ManageSlider";
import Testimonials from "../pages/Admin/Testimonials";
import CourseCategory from "../pages/Admin/Courses/CourseCategory";

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
      },
      {
        path:"slider",
        element:<ManageSlider/>
      },
      {
        path:"testimonial",
        element:<Testimonials/>
      },
      {
        path:"coursecategory",
        element:<CourseCategory/>
      }
    ],
  },
];

export default Adminroutes;