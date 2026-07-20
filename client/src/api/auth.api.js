import api from "./axios";

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  verifyOTP: (data) => api.post("/auth/verify-otp", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (email, newPassword) =>
    api.post("/auth/reset-password", { email, newPassword }),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),

  updateProfile: async (data) => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },

  changePassword: (data) => api.put("/auth/change-password", data),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/auth/avatar", formData, {
      headers: { "Content-Type": undefined },
    });
  },

  removeAvatar: () => api.delete("/auth/avatar"),

  // Reuses the existing public /send-otp endpoint to resend a
  // verification email for the current user.
  resendVerificationEmail: (email) => api.post("/auth/send-otp", { email }),
};