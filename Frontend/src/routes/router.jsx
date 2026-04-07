import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Studentroutes from "../routes/Studentroutes";
import Adminroutes from '../routes/Adminroutes'

const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      ...Studentroutes,   
      ...Adminroutes,     
    ],
  },
]);

export default route;