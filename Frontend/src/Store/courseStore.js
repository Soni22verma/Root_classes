import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCourseStore = create(
  persist(
    (set) => ({
      courseId: null,
      classId: null,   

      setCourseId: (id) => set({ courseId: id }),
      setClassId: (id) => set({ classId: id }),
      
      clearCourseId: () => set({ courseId: null }),
      clearClassId: () => set({ classId: null }), 
    }),
    {
      name: "course-storage",
    }
  )   
);