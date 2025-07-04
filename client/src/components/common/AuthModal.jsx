import { Box, Modal, Typography, Grid, IconButton, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthModalOpen } from "../../redux/features/authModalSlice";
import Logo from "./Logo";
import SigninForm from "./SigninForm";
import SignupForm from "./SignupForm";
import CloseIcon from "@mui/icons-material/Close";

const actionState = {
  signin: "signin",
  signup: "signup"
};

const AuthModal = () => {
  const { authModalOpen } = useSelector((state) => state.authModal);
  const theme = useTheme();
  const dispatch = useDispatch();

  const [action, setAction] = useState(actionState.signin);

  useEffect(() => {
    if (authModalOpen) setAction(actionState.signin);
  }, [authModalOpen]);

  const handleClose = () => dispatch(setAuthModalOpen(false));

  const switchAuthState = (state) => setAction(state);

  // Chọn ngẫu nhiên một trong các hình ảnh phim
  const backgroundImages = [
    "https://image.tmdb.org/t/p/original/rzdPqYx7Um4FUZeD8wpXqjAYcT4.jpg",
    "https://image.tmdb.org/t/p/original/iJQIbOPm3bSkXW3IRdvt4tJBUQZ.jpg",
    "https://image.tmdb.org/t/p/original/628Dep6AxEtDxjZoGP78TsOxYbK.jpg",
    "https://image.tmdb.org/t/p/original/3bhkrj58Vtu7enYsRolD1fZdja1.jpg"
  ];
  
  const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];

  return (
    <Modal open={authModalOpen} onClose={handleClose}>
      <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: "1000px",
        outline: "none",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
      }}>
        <Grid container>
          {/* Phần hình ảnh */}
          <Grid item xs={12} md={6} sx={{
            position: "relative",
            display: { xs: "none", md: "block" },
            backgroundImage: `url(${randomImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "550px",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.3), ${theme.palette.background.paper})`
            }
          }}>
            <Box sx={{ 
              position: "absolute", 
              bottom: "50px", 
              left: "40px", 
              zIndex: 1,
              pr: 5
            }}>
              <Typography variant="h4" fontWeight="700" color="white" sx={{ mb: 2 }}>
                Chào mừng đến với TomOi.vn
              </Typography>
              <Typography variant="body1" color="white" sx={{ opacity: 0.9 }}>
                Khám phá thế giới phim ảnh với kho phim đa dạng và chất lượng cao nhất
              </Typography>
            </Box>
          </Grid>
          
          {/* Phần form */}
          <Grid item xs={12} md={6} sx={{ 
            backgroundColor: "background.paper", 
            position: "relative" 
          }}>
            <IconButton 
              onClick={handleClose}
              sx={{ 
                position: "absolute", 
                right: "16px", 
                top: "16px",
                color: "text.secondary"
              }}
            >
              <CloseIcon />
            </IconButton>
            
            <Box sx={{ 
              padding: { xs: 3, md: 5 }, 
              display: "flex", 
              flexDirection: "column", 
              minHeight: { md: "550px" }
            }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Logo />
              </Box>
              
              <Box sx={{ flexGrow: 1 }}>
                {action === actionState.signin && (
                  <>
                    <Typography 
                      variant="h5" 
                      fontWeight="600" 
                      sx={{ mb: 1, textAlign: "center" }}
                    >
                      Đăng nhập
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 4, textAlign: "center" }}
                    >
                      Đăng nhập để truy cập tài khoản của bạn
                    </Typography>
                    <SigninForm switchAuthState={() => switchAuthState(actionState.signup)} />
                  </>
                )}

                {action === actionState.signup && (
                  <>
                    <Typography 
                      variant="h5" 
                      fontWeight="600" 
                      sx={{ mb: 1, textAlign: "center" }}
                    >
                      Đăng ký
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 4, textAlign: "center" }}
                    >
                      Tạo tài khoản mới để khám phá ngay
                    </Typography>
                    <SignupForm switchAuthState={() => switchAuthState(actionState.signin)} />
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AuthModal;