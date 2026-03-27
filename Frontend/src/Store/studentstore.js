import { create } from "zustand";

const useStudentStore = create((set) => ({
  student: null,
  token: null,
  setStudent: (data) => {
    set({
      student: data.user,
      token: data.token,
    });

    // save token
    localStorage.setItem("token", data.token);
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ student: null, token: null });
  },
}));

export default useStudentStore;