import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Studentroutes from "../routes/Studentroutes";
import Adminroutes from '../routes/Adminroutes'
import Instructorroutes from '../routes/Instructorroutes'

const route = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      ...Studentroutes,   
      ...Adminroutes,
      ...Instructorroutes,     
    ],
  },
]);

export default route;