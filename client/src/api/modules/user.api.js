import privateClient from "../client/private.client";
import publicClient from "../client/public.client";

const userEndpoints = {
  signin: "user/signin",
  signup: "user/signup",
  getInfo: "user/info",
  passwordUpdate: "user/update-password",
  updateProfile: "user/update-profile"
};

const userApi = {
  signin: async ({ username, password }) => {
    try {
      console.log("send request");
      const response = await publicClient.post(
        userEndpoints.signin,
        { username, password }
      );

      return { response };
    } catch (err) { console.log("err"); return { err }; }
  },
  signup: async ({ username, password, confirmPassword, displayName }) => {
    try {
      const response = await publicClient.post(
        userEndpoints.signup,
        { username, password, confirmPassword, displayName }
      );

      return { response };
    } catch (err) { return { err }; }
  },
  getInfo: async () => {
    try {
      const response = await privateClient.get(userEndpoints.getInfo);

      return { response };
    } catch (err) { return { err }; }
  },
  passwordUpdate: async ({ password, newPassword, confirmNewPassword }) => {
    try {
      const response = await privateClient.put(
        userEndpoints.passwordUpdate,
        { password, newPassword, confirmNewPassword }
      );

      return { response };
    } catch (err) { return { err }; }
  },
  updateProfile: async (formData) => {
    try {
      // If formData is FormData, convert to JSON object
      const data = formData instanceof FormData
        ? Object.fromEntries(formData.entries())
        : formData;

      const response = await privateClient.put(
        userEndpoints.updateProfile,
        data
      );

      return { response };
    } catch (err) { return { err }; }
  },
  getAllUsers: async () => {
    try {
      const response = await privateClient.get("user/admin/users");
      return { response };
    } catch (err) { return { err }; }
  },
  updateUserStatus: async (userId, status) => {
    try {
      const response = await privateClient.put(`user/admin/users/${userId}`, { status });
      return { response };
    } catch (err) { return { err }; }
  },
  deleteUser: async (userId) => {
    try {
      const response = await privateClient.delete(`user/admin/users/${userId}`);
      return { response };
    } catch (err) { return { err }; }
  }
};

export default userApi;