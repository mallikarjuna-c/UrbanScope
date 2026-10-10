import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom"
import './index.css'
import App from './App.jsx'
import Home from "./pages/Home/Home.jsx"
import HeatRisk from "./pages/HeatRisk/HeatRisk.jsx"
import GreenSpace from "./pages/GreenSpace/GreenSpace.jsx"
import Healthcare from "./pages/Healthcare/Healthcare.jsx"
import UrbanVR from "./pages/UrbanVR/UrbanVR.jsx"
import Maps3D from "./pages/Maps3D/Maps3D.jsx"
import About from "./pages/About/About.jsx"
import NotFoundPage from "./pages/404 Page/NotfoundPage.jsx"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index element={<Home />} />
      <Route path='/heat-risk' element={<HeatRisk />} />
      <Route path='/green-space' element={<GreenSpace />} />
      <Route path='/healthcare' element={<Healthcare />} />
      <Route path='/urban-vr' element={<UrbanVR />} />
      <Route path='/maps-3d' element={<Maps3D />} />
      <Route path='/about' element={<About />} />
      <Route path='*' element={<NotFoundPage />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}>

  </RouterProvider>
)
