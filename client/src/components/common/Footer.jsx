import { Paper, Stack, Button, Box, Typography, Divider, Grid, Container as MuiContainer } from '@mui/material';
import React from 'react';
import Container from './Container';
import Logo from './Logo';
import menuConfigs from "../../configs/menu.configs";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <Paper square={true} sx={{ 
      backgroundImage: "unset", 
      padding: { xs: "2rem 1rem", md: "3rem 2rem" },
      borderTop: '1px solid',
      borderColor: 'divider'
    }}>
      <MuiContainer maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Logo />
            </Box>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              TomOi.vn là nền tảng xem phim trực tuyến hàng đầu Việt Nam, cung cấp kho phim đa dạng với chất lượng cao.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              © {new Date().getFullYear()} TomOi.vn. Tất cả quyền được bảo lưu.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Khám Phá
            </Typography>
            <Stack spacing={1}>
              {menuConfigs.main.map((item, index) => (
                <Button
                  key={index}
                  component={Link}
                  to={item.path}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    color: 'text.secondary', 
                    fontWeight: 400,
                    padding: '4px 0',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  {item.display}
                </Button>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Tài Khoản
            </Typography>
            <Stack spacing={1}>
              {menuConfigs.user.map((item, index) => (
                <Button
                  key={index}
                  component={Link}
                  to={item.path}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    color: 'text.secondary', 
                    fontWeight: 400,
                    padding: '4px 0',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  {item.display}
                </Button>
              ))}
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Về Chúng Tôi
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              TomOi.vn cung cấp trải nghiệm xem phim tuyệt vời với giao diện người dùng hiện đại và thân thiện.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Liên hệ: contact@tomoi.vn
            </Typography>
          </Grid>
        </Grid>
      </MuiContainer>
    </Paper>
  );
};

export default Footer;