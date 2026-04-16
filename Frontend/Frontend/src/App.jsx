import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";


function App() {
  return (
    <>
      <Outlet />
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
}

export default App;