import supabase from "../supabase.js";
import jsonwebtoken from "jsonwebtoken";
import responseHandler from "../handlers/response.handler.js";
import crypto from "crypto";

// Password hashing functions
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { salt, hash };
};

const validPassword = (password, hash, salt) => {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === verifyHash;
};

const signup = async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return responseHandler.badrequest(res, "Tên đăng nhập đã được sử dụng");
    }

    // Hash password
    const { salt, hash } = hashPassword(password);

    // Insert new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        display_name: displayName,
        password: hash,
        salt
      })
      .select()
      .single();

    if (error) {
      console.error("Signup error:", error);
      return responseHandler.error(res);
    }

    const token = jsonwebtoken.sign(
      { data: newUser.id },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    responseHandler.created(res, {
      token,
      id: newUser.id,
      username: newUser.username,
      displayName: newUser.display_name
    });
  } catch (err) {
    console.error("Signup error:", err);
    responseHandler.error(res);
  }
};

const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, display_name, password, salt')
      .eq('username', username)
      .single();

    if (error || !user) {
      return responseHandler.badrequest(res, "Tài khoản không tồn tại");
    }

    // Verify password
    if (!validPassword(password, user.password, user.salt)) {
      return responseHandler.badrequest(res, "Sai mật khẩu");
    }

    const token = jsonwebtoken.sign(
      { data: user.id },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    responseHandler.created(res, {
      token,
      id: user.id,
      username: user.username,
      displayName: user.display_name
    });
  } catch (err) {
    console.error("Signin error:", err);
    responseHandler.error(res);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;

    // Get user with password
    const { data: user, error } = await supabase
      .from('users')
      .select('id, password, salt')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return responseHandler.unauthorize(res);
    }

    if (!validPassword(password, user.password, user.salt)) {
      return responseHandler.badrequest(res, "Sai mật khẩu");
    }

    // Hash new password
    const { salt, hash } = hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hash, salt })
      .eq('id', req.user.id);

    if (updateError) {
      return responseHandler.error(res);
    }

    responseHandler.ok(res);
  } catch {
    responseHandler.error(res);
  }
};

const getInfo = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, display_name, email, phone, address, avatar_url')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return responseHandler.notfound(res);
    }

    responseHandler.ok(res, {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      email: user.email || user.username, // fallback to username if no email
      phone: user.phone || '',
      address: user.address || '',
      profilePicture: user.avatar_url || ''
    });
  } catch {
    responseHandler.error(res);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { displayName, phone, address, email, avatarUrl } = req.body;

    const updateData = {};
    if (displayName) updateData.display_name = displayName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (email !== undefined) updateData.email = email;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, username, display_name, email, phone, address, avatar_url')
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return responseHandler.error(res);
    }

    responseHandler.ok(res, {
      id: updatedUser.id,
      username: updatedUser.username,
      displayName: updatedUser.display_name,
      email: updatedUser.email || updatedUser.username,
      phone: updatedUser.phone || '',
      address: updatedUser.address || '',
      profilePicture: updatedUser.avatar_url || ''
    });
  } catch (err) {
    console.error("Update profile error:", err);
    responseHandler.error(res);
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Check if admin
    if (req.user.username !== "admin2004" && req.user.username !== "hoanganhdo181@gmail.com" && req.user.role !== "admin") {
      return responseHandler.unauthorize(res);
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, display_name, email, phone, address, created_at, status, role')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Get all users error:", error);
      return responseHandler.error(res);
    }

    responseHandler.ok(res, users);
  } catch {
    responseHandler.error(res);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    // Check if admin
    if (req.user.username !== "admin2004" && req.user.username !== "hoanganhdo181@gmail.com" && req.user.role !== "admin") {
      return responseHandler.unauthorize(res);
    }

    const { userId } = req.params;
    const { status } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error("Update user status error:", error);
      return responseHandler.error(res);
    }

    responseHandler.ok(res, user);
  } catch {
    responseHandler.error(res);
  }
};

const deleteUser = async (req, res) => {
  try {
    // Check if admin
    if (req.user.username !== "admin2004" && req.user.username !== "hoanganhdo181@gmail.com" && req.user.role !== "admin") {
      return responseHandler.unauthorize(res);
    }

    const { userId } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error("Delete user error:", error);
      return responseHandler.error(res);
    }

    responseHandler.ok(res, { id: userId });
  } catch {
    responseHandler.error(res);
  }
};

export default {
  signup,
  signin,
  getInfo,
  updatePassword,
  updateProfile,
  getAllUsers,
  updateUserStatus,
  deleteUser
};