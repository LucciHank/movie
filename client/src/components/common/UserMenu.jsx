import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { ListItemButton, ListItemIcon, ListItemText, Menu, Typography, Divider, Box } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import menuConfigs from "../../configs/menu.configs";
import { setUser } from "../../redux/features/userSlice";
import TextAvatar from "./TextAvatar";

const UserMenu = () => {
  const { user } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);

  const toggleMenu = (e) => setAnchorEl(e.currentTarget);

  return (
    <>
      {user && (
        <>
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              cursor: "pointer" 
            }} 
            onClick={toggleMenu}
          >
            {user.avatar ? (
              <Box 
                component="img"
                src={user.avatar}
                alt={user.displayName}
                sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: (theme) => `2px solid ${theme.palette.primary.main}`
                }}
              />
            ) : (
              <TextAvatar text={user.displayName} />
            )}
          </Box>
          <Menu
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ 
              sx: { 
                padding: 0,
                minWidth: 200,
                mt: 1,
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 20,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0
                }
              } 
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Chào {user.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
            </Box>
          
            {menuConfigs.user.map((item, index) => (
              <ListItemButton
                component={Link}
                to={item.path}
                key={index}
                onClick={() => setAnchorEl(null)}
                sx={{ borderRadius: "0" }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText disableTypography primary={
                  <Typography textTransform="capitalize">{item.display}</Typography>
                } />
              </ListItemButton>
            ))}
            <Divider />
            <ListItemButton
              sx={{ borderRadius: "0" }}
              onClick={() => {
                dispatch(setUser(null));
                setAnchorEl(null);
              }}
            >
              <ListItemIcon><LogoutOutlinedIcon /></ListItemIcon>
              <ListItemText disableTypography primary={
                <Typography textTransform="capitalize">Đăng xuất</Typography>
              } />
            </ListItemButton>
          </Menu>
        </>
      )}
    </>
  );
};

export default UserMenu;