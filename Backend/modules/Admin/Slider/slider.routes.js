import { Router } from "express"
import { CreateSlider, DeleteSlider , GetSlider, UpdateSlider } from "./slider.controller.js"
import multer from "multer";

const sliderRouter = Router()
const Upload = multer({ dest: "uploads/" });
sliderRouter.post("/create_slider",Upload.single("image"),CreateSlider)
sliderRouter.post("/get_slider",GetSlider)
sliderRouter.post("/edit_slider",Upload.single("image"),UpdateSlider)
sliderRouter.post("/delete_slider",DeleteSlider)

export default sliderRouter
