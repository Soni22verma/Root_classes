import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../src/components/mainLayout/Navbar";
import Footer from "../src/components/mainLayout/Footer";

const StudentLayout = () => {
  const location = useLocation();

  const hideLayoutRoutes = ["/purchescourse"];

  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideLayout && <Navbar />}

      <Outlet />

      {!shouldHideLayout && <Footer />}
    </>
  );
};

export default StudentLayout;