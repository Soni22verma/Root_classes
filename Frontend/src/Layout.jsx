import { Outlet } from "react-router-dom";
import Navbar from "../src/components/mainLayout/Navbar"
import Footer from "../src/components/mainLayout/Footer"

const StudentLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default StudentLayout;