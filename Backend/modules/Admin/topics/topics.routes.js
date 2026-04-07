import express, { Router } from 'express'
import { addTopic, DeleteTopic, getClassTopic, getTopicsByClass, UpdateTopic } from './topics.controller.js';
import multer from 'multer';

const topicRouter = Router();
const upload = multer({ dest: "uploads/" });
topicRouter.post("/create_topic",upload.fields([
    {name:"videos",maxCount:5},
    {name:"notes",maxCount:5}
]),addTopic);

topicRouter.post("/get_topicbyclass",getTopicsByClass)
topicRouter.post("/update_topic",upload.fields([
    {name:"videos",maxCount:5},
    {name:"notes",maxCount:5}
]),UpdateTopic)

topicRouter.post("/delete_topic",DeleteTopic)
topicRouter.post("/get_topic",getClassTopic)

export default topicRouter

