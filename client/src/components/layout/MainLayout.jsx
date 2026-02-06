import { Box, Dialog, DialogContent, IconButton, Typography, Stack, Zoom } from "@mui/material";
import { Outlet } from "react-router-dom";
import Footer from "../common/Footer";
import GlobalLoading from "../common/GlobalLoading";
import Topbar from "../common/Topbar";
import AuthModal from "../common/AuthModal";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import userApi from "../../api/modules/user.api";
import favoriteApi from "../../api/modules/favorite.api";
import { setListFavorites, setUser } from "../../redux/features/userSlice";
import CloseIcon from "@mui/icons-material/Close";
import analyticsApi from "../../api/modules/analytics.api";

const WelcomePopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenWelcomePopup");
    if (!hasSeenPopup) {
      // Delay popup slightly for better UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("hasSeenWelcomePopup", "true");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          boxShadow: 24,
          overflow: 'hidden'
        }
      }}
      TransitionComponent={Zoom}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            zIndex: 1
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          component="img"
          src="https://i.pinimg.com/736x/71/d1/52/71d152ce8cb328ac5ab8c575d1dc635c.jpg"
          alt="Welcome"
          sx={{
            width: '100%',
            maxHeight: '400px',
            objectFit: 'cover'
          }}
        />
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
            Chào mừng đến với TomFlix!
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.6 }}>
            "Định mở web phim cho anh chị em cày dịp tết nhưng Hoàng Anh sợ bị bớ nên khả lăngggg là chỉ mở 1-2 hôm nghịch nghịch thôi =))) chúc cả nhà xem phim vui vẻ =))) web này hầu như phim rạp hay phim gì mới ra cũng có hết nhé!!!"
          </Typography>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

const MainLayout = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    // Track page view
    if (process.env.NODE_ENV !== 'development') {
      analyticsApi.track({ eventType: 'page_view' });
    }
  }, []);

  useEffect(() => {
    const authUser = async () => {
      const { response, err } = await userApi.getInfo();

      if (response) dispatch(setUser(response));
      if (err) dispatch(setUser(null));
    };

    authUser();
  }, [dispatch]);

  useEffect(() => {
    const getFavorites = async () => {
      const { response, err } = await favoriteApi.getList();

      if (response) dispatch(setListFavorites(response));
      if (err) toast.error(err.message);
    };

    if (user) getFavorites();
    if (!user) dispatch(setListFavorites([]));
  }, [user, dispatch]);

  // Security features: Block F12, Right Click, etc.
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') return;

  //   const handleContextMenu = (e) => {
  //     e.preventDefault();
  //   };

  //   const handleKeyDown = (e) => {
  //     // F12
  //     if (e.keyCode === 123) {
  //       e.preventDefault();
  //     }
  //     // Ctrl+Shift+I
  //     if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
  //       e.preventDefault();
  //     }
  //     // Ctrl+Shift+J
  //     if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
  //       e.preventDefault();
  //     }
  //     // Ctrl+U
  //     if (e.ctrlKey && e.keyCode === 85) {
  //       e.preventDefault();
  //     }
  //   };

  //   document.addEventListener('contextmenu', handleContextMenu);
  //   document.addEventListener('keydown', handleKeyDown);

  //   return () => {
  //     document.removeEventListener('contextmenu', handleContextMenu);
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, []);

  return (
    <>
      {/* global loading */}
      <GlobalLoading />
      {/* global loading */}

      {/* login modal */}
      <AuthModal />
      {/* login modal */}

      {/* Welcome Popup */}
      <WelcomePopup />

      <Box display="flex" minHeight="100vh">
        {/* header */}
        <Topbar />
        {/* header */}

        {/* main */}
        <Box
          component="main"
          flexGrow={1}
          overflow="hidden"
          minHeight="100vh"
        >
          <Outlet />
        </Box>
        {/* main */}
      </Box>

      {/* footer */}
      <Footer />
      {/* footer */}
    </>
  );
};

export default MainLayout;