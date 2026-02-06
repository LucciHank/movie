import jsonwebtoken from "jsonwebtoken";
import responseHandler from "../handlers/response.handler.js";
import supabase from "../supabase.js";

const tokenDecode = (req) => {
  try {
    const bearerHeader = req.headers["authorization"];

    if (bearerHeader) {
      const token = bearerHeader.split(" ")[1];

      return jsonwebtoken.verify(
        token,
        process.env.TOKEN_SECRET
      );
    }

    return false;
  } catch {
    return false;
  }
};

const auth = async (req, res, next) => {
  const tokenDecoded = tokenDecode(req);

  if (!tokenDecoded) return responseHandler.unauthorize(res);

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, display_name, role')
    .eq('id', tokenDecoded.data)
    .single();

  if (error || !user) return responseHandler.unauthorize(res);

  req.user = {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role
  };

  next();
};

const decodeToken = async (req, res, next) => {
  try {
    const tokenDecoded = tokenDecode(req);

    if (tokenDecoded) {
      const { data: user } = await supabase
        .from('users')
        .select('id, username, display_name, role')
        .eq('id', tokenDecoded.data)
        .single();

      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          role: user.role
        };
      }
    }
  } catch {
    // Ignore error for optional decoding
  }

  next();
};

export default { auth, tokenDecode, decodeToken };