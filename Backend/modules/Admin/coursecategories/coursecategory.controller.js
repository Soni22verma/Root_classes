import { CourseCategory } from "./coursecategory.model.js";
export const createFullCourse = async (req, res, next) => {
  try {
    const { category, coursecategoryName, moduleName, chapterName, topicName } = req.body;

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const video = req.files?.video?.[0]
      ? `${baseUrl}/uploads/${req.files.video[0].filename}`
      : "";

    const notes = req.files?.notes?.[0]
      ? `${baseUrl}/uploads/${req.files.notes[0].filename}`
      : "";

    let coursecategory = await CourseCategory.findOne({ title: coursecategoryName });

    if (!coursecategory) {
      coursecategory = await CourseCategory.create({
        category,
        title: coursecategoryName,
        modules: []
      });
    }

    let moduleIndex = coursecategory.modules.findIndex(
      (m) => m.title === moduleName
    );

    if (moduleIndex === -1) {
      coursecategory.modules.push({
        title: moduleName,
        chapters: []
      });
      moduleIndex = coursecategory.modules.length - 1;
    }

    let module = coursecategory.modules[moduleIndex];

    let chapterIndex = module.chapters.findIndex(
      (c) => c.title === chapterName
    );

    if (chapterIndex === -1) {
      module.chapters.push({
        title: chapterName,
        topics: []
      });
      chapterIndex = module.chapters.length - 1;
    }

    let chapter = module.chapters[chapterIndex];

    chapter.topics.push({
      title: topicName,
      video,
      notes
    });

    await coursecategory.save();

    return res.status(200).json({
      message: "course with category wise created",
      error: false,
      success: true,
      data: coursecategory
    });

  } catch (error) {
    next(error);
  }
};