import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCourseStore = create(
  persist(
    (set) => ({
      courseId: null,
      setCourseId: (id) => set({ courseId: id }),
      clearCourseId: () => set({ courseId: null }),
    }),
    {
      name: "course-storage", // localStorage key
    }
  )
);