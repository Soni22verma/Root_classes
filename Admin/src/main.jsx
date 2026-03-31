import { StrictMode , React} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router'
import route from '../src/routes/router'

createRoot(document.getElementById('root')).render(
  
    <RouterProvider router={route} />
   
  ,
)
