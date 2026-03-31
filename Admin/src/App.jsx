
import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/Admin/AdminLogin";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AllStudents from "./pages/StudentManagement/AllStudents";
import CreateCourse from "./pages/Courses/CreateCourse";
import AllCourses from "./pages/Courses/AllCourses";
import AdminLayout from "../AdminLayout";
import Enrollment from "./pages/Courses/Enrollment";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          
          <Route path="/admin/allstudent" element={<AllStudents />} />
          <Route path="/admin/createcourse" element={<CreateCourse />} />
          <Route path="/admin/allcourses" element={<AllCourses />} />
          <Route path="/admin/enrollment" element={<Enrollment/>}/>
   
        </Route>
      </Routes>
      
      <main>
        <ToastContainer position="top-right" autoClose={2000} />
      </main>
    </>
  );
}

export default App;