import { create } from "zustand";

const useStudentStore = create((set) => ({
  student: JSON.parse(localStorage.getItem("student")) || null,
  token: localStorage.getItem("token") || null,

  setStudent: (data) => {
    set({
      student: data.user,
      token: data.token,
    });

    // ✅ save both
    localStorage.setItem("token", data.token);
    localStorage.setItem("student", JSON.stringify(data.user));
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");

    set({ student: null, token: null });
  },
}));

export default useStudentStore;