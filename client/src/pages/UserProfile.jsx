import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Grid, Avatar, Paper, Stack, IconButton, CircularProgress } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';

import Container from '../components/common/Container';
import uiConfigs from '../configs/ui.configs';
import { setUser } from '../redux/features/userSlice';
import userApi from '../api/modules/user.api';
import { setGlobalLoading } from '../redux/features/globalLoadingSlice';
import TextAvatar from '../components/common/TextAvatar';

const UserProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [onRequest, setOnRequest] = useState(false);
  const [userInfo, setUserInfo] = useState({
    displayName: '',
    username: '',
    email: '',
    phone: '',
    address: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState('');

  useEffect(() => {
    if (user) {
      setUserInfo({
        displayName: user.displayName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      setPreviewAvatar(user.profilePicture || '');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onRequest) return;
    
    setOnRequest(true);
    dispatch(setGlobalLoading(true));
    
    // Tạo FormData để gửi thông tin và avatar
    const formData = new FormData();
    formData.append('displayName', userInfo.displayName);
    formData.append('phone', userInfo.phone);
    formData.append('address', userInfo.address);
    if (avatar) formData.append('profilePicture', avatar);
    
    // Gọi API cập nhật thông tin người dùng
    const { response, err } = await userApi.updateProfile(formData);
    
    setOnRequest(false);
    dispatch(setGlobalLoading(false));
    
    if (err) {
      toast.error(err.message);
      return;
    }
    
    if (response) {
      // Cập nhật thông tin người dùng trong Redux store
      dispatch(setUser(response));
      
      // Lưu thông tin mới vào localStorage để giữ nguyên sau khi reload
      const userData = JSON.parse(localStorage.getItem("actkn")) || {};
      userData.user = response;
      localStorage.setItem("actkn", JSON.stringify(userData));
      
      toast.success("Cập nhật thông tin thành công!");
    }
  };

  return (
    <Box sx={{ ...uiConfigs.style.mainContent }}>
      <Container header="Thông tin cá nhân">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', mb: 3 }}>
                  {previewAvatar ? (
                    <Avatar
                      src={previewAvatar}
                      alt={userInfo.displayName}
                      sx={{ width: 150, height: 150, boxShadow: 3 }}
                    />
                  ) : (
                    <TextAvatar text={userInfo.displayName} size={150} />
                  )}
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark'
                      }
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <PhotoCameraIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                  Nhấp vào biểu tượng máy ảnh để thay đổi ảnh đại diện
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="displayName"
                      label="Tên hiển thị"
                      fullWidth
                      value={userInfo.displayName}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="username"
                      label="Tên đăng nhập"
                      fullWidth
                      value={userInfo.username}
                      disabled
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="email"
                      label="Email"
                      fullWidth
                      value={userInfo.email}
                      disabled
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="phone"
                      label="Số điện thoại"
                      fullWidth
                      value={userInfo.phone}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="address"
                      label="Địa chỉ"
                      fullWidth
                      value={userInfo.address}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={onRequest}
                  startIcon={<SaveIcon />}
                  sx={{
                    borderRadius: '8px',
                    px: 3,
                    py: 1
                  }}
                >
                  Lưu thay đổi
                </LoadingButton>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default UserProfile; 