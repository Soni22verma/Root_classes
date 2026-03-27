import { Route, Routes } from 'react-router-dom';
import './App.css'
import Layout from './Layout';
import Home from './components/Home/Home'
import StudentRegistration from './components/Student/StudentRegister';
import StudentLogin from './components/Student/StudentLogin';
import Courses from './pages/Courses';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OnlineCourse from './pages/OnlineCourse';
import Schollarship from './pages/Schollarship';
import Career from './pages/Career';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import StudentProfile from './components/Student/StudentProfile';


function App() {
  return (
   <>
    <Routes>
      <Route element={<Layout/>}>
        <Route path="/" element={<Home/>}/>
        <Route path='/stdregister' element={<StudentRegistration/>}/>
        <Route path='/stdlogin' element={<StudentLogin/>}/>
        <Route path='/course' element={<Courses/>}/>
        <Route path='/onlinecourse' element={<OnlineCourse/>}/>
        <Route path='/schollarship' element={<Schollarship/>}/>
        <Route path='/career' element={<Career/>}/>
        <Route path='/blog' element={<Blog/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path = '/stdprofile' element={<StudentProfile/>}/>
      </Route>
    </Routes>
   <main>
      <ToastContainer position="top-right" autoClose={2000} />
   </main>
   </>
  )
}

export default App;