import React from "react";
import Navbar from "./components/mainLayout/Navbar";
import Footer from "./components/mainLayout/Footer";
import { Outlet } from "react-router-dom";

const Layout = ({children}) => {
  return (
    <div>
   <Navbar />
      <main className="flex-grow">
        <Outlet /> 
        {children}  
      </main>
      <Footer />
    </div>
  )
}

export default Layout