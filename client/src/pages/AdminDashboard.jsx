import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Stack, Tabs, Tab, Card, CardContent, IconButton, Divider, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, InputAdornment, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CategoryIcon from '@mui/icons-material/Category';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TheatersIcon from '@mui/icons-material/Theaters';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import Chart from 'react-apexcharts';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { TreeView, TreeItem } from '@mui/lab';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

import tmdbConfigs from '../api/configs/tmdb.configs';
import mediaApi from '../api/modules/media.api';
import genreApi from '../api/modules/genre.api';
import userApi from '../api/modules/user.api';
import { setGlobalLoading } from '../redux/features/globalLoadingSlice';
import uiConfigs from '../configs/ui.configs';
import Container from '../components/common/Container';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const theme = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dashboard data
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalTVShows: 0,
    todayViews: 0,
    weeklyViews: 0,
    topMovies: []
  });
  
  // Media management data
  const [movies, setMovies] = useState([]);
  const [tvShows, setTVShows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Genre management data
  const [genres, setGenres] = useState({
    movie: [],
    tv: []
  });
  
  // User management data
  const [users, setUsers] = useState([]);
  
  // Subscription plans data
  const [plans, setPlans] = useState([
    { id: 1, name: 'Miễn phí', price: 0, features: ['Xem phim SD', 'Có quảng cáo', 'Giới hạn nội dung'] },
    { id: 2, name: 'Premium', price: 149000, features: ['Xem phim HD/4K', 'Không quảng cáo', 'Tất cả nội dung', 'Tải về để xem offline'] }
  ]);
  
  // Orders data
  const [orders, setOrders] = useState([]);
  
  // Squid Game data
  const [squidGameData, setSquidGameData] = useState({
    id: 93405,
    title: "Squid Game Phần 3",
    overview: "Hàng trăm người chơi khánh kiệt nhận lời mời tham gia một trò chơi sinh tồn bí ẩn. Đón chờ họ là giải thưởng 45,6 tỉ won – và cái chết.",
    seasons: [
      {
        season_number: 1,
        name: "Phần 3",
        overview: "Mùa đầu tiên của Squid Game",
        episodes: [
          {
            episode_number: 1,
            name: "Đèn Đỏ, Đèn Xanh",
            overview: "Đang gặp khó khăn về tài chính, Seong Gi-hun được mời tham gia một trò chơi bí ẩn. Tham gia cùng 455 người khác, anh phát hiện ra trò chơi này có phần thưởng lớn – và cái giá phải trả còn lớn hơn.",
            runtime: 60,
            still_path: "/pc7a2qrIkIvzqYPVsxUYh5xRaFm.jpg",
            video_url: "https://www.youtube.com/embed/oqxAJKy0ii4",
            air_date: "2021-09-17"
          },
          {
            episode_number: 2,
            name: "Địa Ngục",
            overview: "Người chơi phải đưa ra quyết định khó khăn sau khi trò chơi đầu tiên. Gi-hun và những người khác tìm cách đối phó với những gì đang chờ đợi họ.",
            runtime: 63,
            still_path: "/mGUjlV9fsXgwKYlqgwgvbv6QhCL.jpg",
            video_url: "https://www.youtube.com/embed/oqxAJKy0ii4",
            air_date: "2021-09-17"
          }
        ]
      },
      {
        season_number: 2,
        name: "Phần 2",
        overview: "Mùa thứ hai của Squid Game",
        episodes: [
          {
            episode_number: 1,
            name: "Người đàn ông mặc đồ đen",
            overview: "Ba năm sau trò chơi đẫm máu, người chiến thắng với mái tóc đỏ rực vẫn bị ám ảnh bởi quá khứ và quyết định tìm kiếm những người đứng sau trò chơi.",
            runtime: 60,
            still_path: "/pc7a2qrIkIvzqYPVsxUYh5xRaFm.jpg",
            video_url: "https://www.youtube.com/embed/oqxAJKy0ii4",
            air_date: "2023-12-25"
          },
          {
            episode_number: 2,
            name: "Trò chơi mới",
            overview: "Những người chơi mới tham gia vào một loạt trò chơi mới với những thử thách khốc liệt hơn.",
            runtime: 58,
            still_path: "/mGUjlV9fsXgwKYlqgvbv6QhCL.jpg",
            video_url: "https://www.youtube.com/embed/oqxAJKy0ii4",
            air_date: "2023-12-25"
          }
        ]
      },
      {
        season_number: 3,
        name: "Phần 3",
        overview: "Mùa thứ ba của Squid Game",
        episodes: [
          {
            episode_number: 1,
            name: "Sự trở lại",
            overview: "Trò chơi con mực trở lại với quy mô toàn cầu, thu hút người chơi từ khắp nơi trên thế giới.",
            runtime: 62,
            still_path: "/squidgame3_ep1.jpg",
            video_url: "https://iframe.mediadelivery.net/play/463498/e8d995ea-b56c-40d0-be54-711fb171a655",
            air_date: "2024-06-01"
          },
          {
            episode_number: 2,
            name: "Đồng minh và kẻ thù",
            overview: "Các liên minh được hình thành khi người chơi phải đối mặt với thử thách mới.",
            runtime: 59,
            still_path: "/squidgame3_ep2.jpg",
            video_url: "https://iframe.mediadelivery.net/play/463498/dfb71d2b-4afc-4758-b390-67b06e8ec4fe",
            air_date: "2024-06-01"
          },
          {
            episode_number: 3,
            name: "Bí mật hé lộ",
            overview: "Những bí mật về nguồn gốc của trò chơi dần được tiết lộ.",
            runtime: 65,
            still_path: "/squidgame3_ep3.jpg",
            video_url: "https://iframe.mediadelivery.net/play/463498/36d30849-cb4e-445f-be93-1628c314a04e",
            air_date: "2024-06-08"
          },
          {
            episode_number: 4,
            name: "Không lối thoát",
            overview: "Người chơi phải đưa ra những quyết định khó khăn khi không còn đường lui.",
            runtime: 58,
            still_path: "/squidgame3_ep4.jpg",
            video_url: "https://iframe.mediadelivery.net/play/463498/c03cc24f-bf74-42af-b235-c0a9d324ec2e",
            air_date: "2024-06-08"
          },
          {
            episode_number: 5,
            name: "Cuộc chiến cuối cùng",
            overview: "Những người chơi còn sống sót bước vào thử thách cuối cùng.",
            runtime: 67,
            still_path: "/squidgame3_ep5.jpg",
            video_url: "https://iframe.mediadelivery.net/play/463498/46b01994-5f77-487c-b2ba-ee72dc1e96b0",
            air_date: "2024-06-15"
          },
          {
            episode_number: 6,
            name: "Kết thúc hay bắt đầu",
            overview: "Kết thúc của trò chơi và sự thật được phơi bày.",
            runtime: 72,
            still_path: "/squidgame3_ep6.jpg",
            video_url: "https://iframe.mediadelivery.net/play/463498/ee2b0be9-71ff-4be0-a8b9-0028f8516f3e",
            air_date: "2024-06-15"
          }
        ]
      }
    ]
  });
  
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [episodeFormData, setEpisodeFormData] = useState({
    episode_number: 1,
    name: "",
    overview: "",
    runtime: 60,
    still_path: "",
    video_url: "",
    air_date: ""
  });
  const [episodeDialogOpen, setEpisodeDialogOpen] = useState(false);
  const [episodeDialogMode, setEpisodeDialogMode] = useState('add'); // 'add' or 'edit'
  
  // Kiểm tra quyền admin
  useEffect(() => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để truy cập trang này');
      navigate('/');
      return;
    }
    
    if (user.username === 'admin2004' || user.role === 'admin') {
      // Đã có quyền admin, không làm gì cả
    } else {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
    }
  }, [user, navigate]);
  
  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      dispatch(setGlobalLoading(true));
      setIsLoading(true);
      
      try {
        // Load movies
        const { response: movieResponse } = await mediaApi.getList({
          mediaType: tmdbConfigs.mediaType.movie,
          mediaCategory: tmdbConfigs.mediaCategory.popular,
          page: 1
        });
        
        // Load TV shows
        const { response: tvResponse } = await mediaApi.getList({
          mediaType: tmdbConfigs.mediaType.tv,
          mediaCategory: tmdbConfigs.mediaCategory.popular,
          page: 1
        });
        
        // Load top movies
        const { response: topMoviesResponse } = await mediaApi.getList({
          mediaType: tmdbConfigs.mediaType.movie,
          mediaCategory: tmdbConfigs.mediaCategory.top_rated,
          page: 1
        });
        
        // Set dashboard stats
        if (movieResponse && tvResponse && topMoviesResponse) {
          setMovies(movieResponse.results);
          setTVShows(tvResponse.results);
          
          setStats({
            totalMovies: movieResponse.total_results || movieResponse.results.length,
            totalTVShows: tvResponse.total_results || tvResponse.results.length,
            todayViews: Math.floor(Math.random() * 5000) + 1000, // Giả lập dữ liệu lượt xem
            weeklyViews: Math.floor(Math.random() * 20000) + 10000, // Giả lập dữ liệu lượt xem
            topMovies: topMoviesResponse.results.slice(0, 5).map(movie => ({
              ...movie,
              views: Math.floor(Math.random() * 5000) + 500 // Giả lập dữ liệu lượt xem
            }))
          });
        }
        
        // Load genres
        const { response: movieGenresResponse } = await genreApi.getList({
          mediaType: tmdbConfigs.mediaType.movie
        });
        
        const { response: tvGenresResponse } = await genreApi.getList({
          mediaType: tmdbConfigs.mediaType.tv
        });
        
        if (movieGenresResponse && tvGenresResponse) {
          setGenres({
            movie: movieGenresResponse.genres,
            tv: tvGenresResponse.genres
          });
        }
        
        // Giả lập dữ liệu người dùng
        setUsers([
          { id: 1, username: 'user1', displayName: 'Người dùng 1', email: 'user1@example.com', status: 'active', registeredDate: '2023-01-15' },
          { id: 2, username: 'user2', displayName: 'Người dùng 2', email: 'user2@example.com', status: 'active', registeredDate: '2023-02-20' },
          { id: 3, username: 'user3', displayName: 'Người dùng 3', email: 'user3@example.com', status: 'blocked', registeredDate: '2023-03-10' },
          { id: 4, username: 'admin2004', displayName: 'Admin', email: 'admin@example.com', status: 'active', registeredDate: '2023-01-01' }
        ]);
        
        // Giả lập dữ liệu đơn hàng
        setOrders([
          { id: 'ORD001', userId: 1, username: 'user1', planId: 2, planName: 'Premium', amount: 149000, date: '2023-05-15', status: 'completed' },
          { id: 'ORD002', userId: 2, username: 'user2', planId: 2, planName: 'Premium', amount: 149000, date: '2023-06-20', status: 'completed' },
          { id: 'ORD003', userId: 3, username: 'user3', planId: 2, planName: 'Premium', amount: 149000, date: '2023-06-25', status: 'failed' }
        ]);
      } catch (err) {
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
        console.error(err);
      } finally {
        dispatch(setGlobalLoading(false));
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [dispatch]);
  
  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Search handler
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Xử lý chọn season trong tree view
  const handleSelectSeason = (season) => {
    setSelectedSeason(season);
    setSelectedEpisode(null);
  };

  // Xử lý chọn episode trong tree view
  const handleSelectEpisode = (season, episode) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
  };

  // Xử lý mở dialog thêm/sửa episode
  const handleOpenEpisodeDialog = (mode, season, episode = null) => {
    setEpisodeDialogMode(mode);
    setSelectedSeason(season);
    
    if (mode === 'edit' && episode) {
      setSelectedEpisode(episode);
      setEpisodeFormData({
        episode_number: episode.episode_number,
        name: episode.name,
        overview: episode.overview,
        runtime: episode.runtime,
        still_path: episode.still_path,
        video_url: episode.video_url,
        air_date: episode.air_date
      });
    } else {
      // Tìm số tập lớn nhất trong season và tăng thêm 1
      const maxEpisode = Math.max(
        ...squidGameData.seasons
          .find(s => s.season_number === season.season_number)
          .episodes.map(e => e.episode_number),
        0
      );
      
      setEpisodeFormData({
        episode_number: maxEpisode + 1,
        name: "",
        overview: "",
        runtime: 60,
        still_path: "",
        video_url: "",
        air_date: new Date().toISOString().split('T')[0]
      });
    }
    
    setEpisodeDialogOpen(true);
  };

  // Xử lý đóng dialog
  const handleCloseEpisodeDialog = () => {
    setEpisodeDialogOpen(false);
  };

  // Xử lý thay đổi form data
  const handleEpisodeFormChange = (e) => {
    const { name, value } = e.target;
    setEpisodeFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý lưu episode
  const handleSaveEpisode = () => {
    const updatedData = { ...squidGameData };
    const seasonIndex = updatedData.seasons.findIndex(
      s => s.season_number === selectedSeason.season_number
    );
    
    if (episodeDialogMode === 'add') {
      // Thêm episode mới
      updatedData.seasons[seasonIndex].episodes.push(episodeFormData);
      // Sắp xếp lại episodes theo số tập
      updatedData.seasons[seasonIndex].episodes.sort((a, b) => a.episode_number - b.episode_number);
    } else {
      // Cập nhật episode hiện có
      const episodeIndex = updatedData.seasons[seasonIndex].episodes.findIndex(
        e => e.episode_number === selectedEpisode.episode_number
      );
      updatedData.seasons[seasonIndex].episodes[episodeIndex] = episodeFormData;
    }
    
    setSquidGameData(updatedData);
    setEpisodeDialogOpen(false);
    toast.success(episodeDialogMode === 'add' ? 'Đã thêm tập phim mới' : 'Đã cập nhật tập phim');
  };

  // Xử lý xóa episode
  const handleDeleteEpisode = () => {
    if (!selectedSeason || !selectedEpisode) return;
    
    const updatedData = { ...squidGameData };
    const seasonIndex = updatedData.seasons.findIndex(
      s => s.season_number === selectedSeason.season_number
    );
    
    updatedData.seasons[seasonIndex].episodes = updatedData.seasons[seasonIndex].episodes.filter(
      e => e.episode_number !== selectedEpisode.episode_number
    );
    
    setSquidGameData(updatedData);
    setSelectedEpisode(null);
    toast.success('Đã xóa tập phim');
  };
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Dashboard
        return (
          <Box>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="text.secondary">Tổng số phim lẻ</Typography>
                      <TheatersIcon color="primary" fontSize="large" />
                    </Stack>
                    <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                      {isLoading ? <CircularProgress size={30} /> : stats.totalMovies.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Từ TMDB API
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="text.secondary">Tổng số phim bộ</Typography>
                      <LiveTvIcon color="secondary" fontSize="large" />
                    </Stack>
                    <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                      {isLoading ? <CircularProgress size={30} /> : stats.totalTVShows.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Từ TMDB API
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="text.secondary">Lượt xem hôm nay</Typography>
                      <VisibilityIcon color="info" fontSize="large" />
                    </Stack>
                    <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                      {isLoading ? <CircularProgress size={30} /> : stats.todayViews.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      +12% so với hôm qua
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="text.secondary">Lượt xem tuần này</Typography>
                      <AssessmentIcon color="warning" fontSize="large" />
                    </Stack>
                    <Typography variant="h3" fontWeight="bold" sx={{ my: 2 }}>
                      {isLoading ? <CircularProgress size={30} /> : stats.weeklyViews.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      +8% so với tuần trước
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={8}>
                <Card sx={{ 
                  borderRadius: 2,
                  boxShadow: 3,
                  p: 2,
                  height: '100%'
                }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Lượt xem theo ngày
                  </Typography>
                  
                  {!isLoading ? (
                    <Chart 
                      options={{
                        chart: {
                          id: 'views-chart',
                          toolbar: {
                            show: false
                          },
                          background: 'transparent'
                        },
                        xaxis: {
                          categories: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                        },
                        stroke: {
                          curve: 'smooth',
                          width: 3
                        },
                        colors: [theme.palette.primary.main, theme.palette.secondary.main],
                        fill: {
                          type: 'gradient',
                          gradient: {
                            shade: 'light',
                            type: 'vertical',
                            shadeIntensity: 0.5,
                            opacityFrom: 0.7,
                            opacityTo: 0.2,
                            stops: [0, 100]
                          }
                        },
                        dataLabels: {
                          enabled: false
                        },
                        grid: {
                          borderColor: theme.palette.divider,
                          strokeDashArray: 4
                        },
                        legend: {
                          position: 'top',
                          horizontalAlign: 'right'
                        }
                      }}
                      series={[
                        {
                          name: 'Phim lẻ',
                          data: [1200, 1900, 1500, 2500, 3200, 2800, 3800]
                        },
                        {
                          name: 'Phim bộ',
                          data: [800, 1100, 1300, 1700, 2100, 1900, 2300]
                        }
                      ]}
                      type="area"
                      height={350}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                      <CircularProgress />
                    </Box>
                  )}
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  borderRadius: 2,
                  boxShadow: 3,
                  p: 2,
                  height: '100%'
                }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Phân bố thể loại phim
                  </Typography>
                  
                  {!isLoading && genres.movie.length > 0 ? (
                    <Chart 
                      options={{
                        chart: {
                          id: 'genre-chart',
                          toolbar: {
                            show: false
                          }
                        },
                        labels: genres.movie.slice(0, 5).map(genre => genre.name),
                        legend: {
                          position: 'bottom'
                        },
                        colors: [
                          theme.palette.primary.main,
                          theme.palette.secondary.main,
                          theme.palette.success.main,
                          theme.palette.warning.main,
                          theme.palette.error.main
                        ],
                        responsive: [{
                          breakpoint: 480,
                          options: {
                            chart: {
                              height: 280
                            },
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }]
                      }}
                      series={[25, 20, 18, 15, 22]} // Giả lập phần trăm phân bố
                      type="pie"
                      height={350}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                      <CircularProgress />
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
            
            {/* Top Movies Table */}
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: 3,
              mb: 4,
              overflow: 'hidden'
            }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                  5 Phim được xem nhiều nhất
                </Typography>
                
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Phim</TableCell>
                          <TableCell>Thể loại</TableCell>
                          <TableCell>Năm phát hành</TableCell>
                          <TableCell align="right">Lượt xem</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.topMovies.map((movie) => (
                          <TableRow key={movie.id} hover>
                            <TableCell>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                  component="img"
                                  src={tmdbConfigs.posterPath(movie.poster_path)}
                                  alt={movie.title}
                                  sx={{ 
                                    width: 40, 
                                    height: 60, 
                                    borderRadius: 1,
                                    objectFit: 'cover'
                                  }}
                                />
                                <Typography variant="body1" fontWeight="medium">
                                  {movie.title}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              {movie.genre_ids && movie.genre_ids.slice(0, 2).map(genreId => {
                                const genre = genres.movie.find(g => g.id === genreId);
                                return genre ? genre.name : '';
                              }).join(', ')}
                            </TableCell>
                            <TableCell>
                              {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight="bold">
                                {movie.views.toLocaleString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Box>
        );
        
      case 1: // Movies
        return (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Quản lý phim
              </Typography>
              
              <Stack direction="row" spacing={2}>
                <TextField
                  placeholder="Tìm kiếm phim..."
                  size="small"
                  value={searchQuery}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{ minWidth: 250 }}
                />
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: '8px' }}
                >
                  Thêm phim
                </Button>
              </Stack>
            </Stack>
            
            <Tabs
              value={tabValue === 1 ? 0 : 1}
              onChange={(e, val) => {
                // Chỉ xử lý tab phim lẻ/phim bộ, không đổi tab chính
                // Giữ nguyên tabValue = 1 (Movies tab)
              }}
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Phim lẻ" icon={<MovieIcon />} iconPosition="start" />
              <Tab label="Phim bộ" icon={<TvIcon />} iconPosition="start" />
            </Tabs>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Poster</TableCell>
                        <TableCell>Tên phim</TableCell>
                        <TableCell>Thể loại</TableCell>
                        <TableCell>Ngày phát hành</TableCell>
                        <TableCell>Đánh giá</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(tabValue === 1 ? movies : tvShows)
                        .filter(item => {
                          const searchTerm = searchQuery.toLowerCase();
                          const title = (item.title || item.name || '').toLowerCase();
                          return title.includes(searchTerm);
                        })
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              <Box
                                component="img"
                                src={tmdbConfigs.posterPath(item.poster_path)}
                                alt={item.title || item.name}
                                sx={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 1 }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/60x90?text=No+Image';
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body1" fontWeight="medium">
                                {item.title || item.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {item.genre_ids && item.genre_ids.slice(0, 2).map(genreId => {
                                const genreList = tabValue === 1 ? genres.movie : genres.tv;
                                const genre = genreList.find(g => g.id === genreId);
                                return genre ? genre.name : '';
                              }).join(', ')}
                            </TableCell>
                            <TableCell>
                              {item.release_date || item.first_air_date || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <StarIcon sx={{ color: '#FFD700', fontSize: '1rem' }} />
                                <Typography variant="body2">
                                  {item.vote_average?.toFixed(1)}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <IconButton size="small" color="primary">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error">
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  component="div"
                  count={tabValue === 1 ? movies.length : tvShows.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </>
            )}
          </Box>
        );
        
      case 2: // Genres
        return (
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Quản lý thể loại
            </Typography>
            <Typography variant="body1">
              Tại đây bạn có thể xem, thêm, sửa, xóa thể loại.
            </Typography>
          </Box>
        );
        
      case 3: // Users
        return (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Quản lý người dùng
              </Typography>
              
              <Stack direction="row" spacing={2}>
                <TextField
                  placeholder="Tìm kiếm người dùng..."
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{ minWidth: 250 }}
                />
              </Stack>
            </Stack>
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên hiển thị</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Ngày đăng ký</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Typography variant="body1" fontWeight="medium">
                              {user.displayName}
                            </Typography>
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.registeredDate}</TableCell>
                          <TableCell>
                            <Chip 
                              label={user.status === 'active' ? 'Hoạt động' : 'Bị khóa'} 
                              color={user.status === 'active' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                              >
                                Đặt lại mật khẩu
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color={user.status === 'active' ? 'error' : 'success'}
                              >
                                {user.status === 'active' ? 'Khóa' : 'Mở khóa'}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        );
      
      case 4: // Subscription plans
        return (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Gói dịch vụ
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ borderRadius: '8px' }}
              >
                Thêm gói mới
              </Button>
            </Stack>
            
            <Grid container spacing={3} sx={{ mb: 5 }}>
              {plans.map(plan => (
                <Grid item xs={12} md={6} key={plan.id}>
                  <Card sx={{ 
                    borderRadius: 2,
                    boxShadow: 3,
                    position: 'relative',
                    overflow: 'visible'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold">
                          {plan.name}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                          {plan.price === 0 ? 'Miễn phí' : `${plan.price.toLocaleString()}đ/tháng`}
                        </Typography>
                      </Stack>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Stack spacing={1.5}>
                        {plan.features.map((feature, index) => (
                          <Stack key={index} direction="row" spacing={1} alignItems="center">
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography variant="body1">{feature}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                      
                      <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                        >
                          Sửa
                        </Button>
                        {plan.id !== 1 && (
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                          >
                            Xóa
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Đơn hàng gần đây
            </Typography>
            
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mã đơn hàng</TableCell>
                    <TableCell>Người dùng</TableCell>
                    <TableCell>Gói dịch vụ</TableCell>
                    <TableCell>Số tiền</TableCell>
                    <TableCell>Ngày thanh toán</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {order.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.username}</TableCell>
                      <TableCell>{order.planName}</TableCell>
                      <TableCell>{order.amount.toLocaleString()}đ</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status === 'completed' ? 'Thành công' : 'Thất bại'} 
                          color={order.status === 'completed' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
        
      case 5: // Reports
        return (
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Báo cáo
            </Typography>
            <Typography variant="body1">
              Tại đây bạn có thể xem các báo cáo về lượt xem và doanh thu.
            </Typography>
          </Box>
        );
        
      case 6: // Squid Game Manager
        return (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Quản lý chi tiết phim Squid Game
              </Typography>
            </Stack>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, height: '100%', borderRadius: 2, boxShadow: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Cấu trúc phim
                  </Typography>
                  
                  <TreeView
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    sx={{ 
                      height: 'auto', 
                      maxHeight: 600, 
                      overflowY: 'auto',
                      '& .MuiTreeItem-root': {
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.04)'
                        }
                      }
                    }}
                  >
                    <TreeItem 
                      nodeId="squid_game" 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                          <MovieIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body1" fontWeight="medium">
                            Squid Game Phần 3
                          </Typography>
                        </Box>
                      }
                    >
                      {squidGameData.seasons.map(season => (
                        <TreeItem
                          key={`season_${season.season_number}`}
                          nodeId={`season_${season.season_number}`}
                          label={
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              py: 0.5,
                              backgroundColor: selectedSeason?.season_number === season.season_number && !selectedEpisode ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                              borderRadius: 1,
                              px: 1
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSeason(season);
                            }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TvIcon color="secondary" sx={{ mr: 1 }} />
                                <Typography variant="body1">
                                  {season.name}
                                </Typography>
                              </Box>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEpisodeDialog('add', season);
                                }}
                              >
                                + Tập
                              </Button>
                            </Box>
                          }
                        >
                          {season.episodes.map(episode => (
                            <TreeItem
                              key={`episode_${season.season_number}_${episode.episode_number}`}
                              nodeId={`episode_${season.season_number}_${episode.episode_number}`}
                              label={
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  py: 0.5,
                                  backgroundColor: selectedEpisode?.episode_number === episode.episode_number && selectedSeason?.season_number === season.season_number ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                  borderRadius: 1,
                                  px: 1
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectEpisode(season, episode);
                                }}
                                >
                                  <VideoLibraryIcon fontSize="small" sx={{ mr: 1 }} />
                                  <Typography variant="body2">
                                    Tập {episode.episode_number}: {episode.name}
                                  </Typography>
                                </Box>
                              }
                            />
                          ))}
                        </TreeItem>
                      ))}
                    </TreeItem>
                  </TreeView>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
                  {!selectedSeason && !selectedEpisode ? (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                      <Typography variant="h6" color="text.secondary">
                        Chọn phần hoặc tập phim để xem chi tiết
                      </Typography>
                    </Box>
                  ) : selectedSeason && !selectedEpisode ? (
                    // Hiển thị thông tin season
                    <Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                        {selectedSeason.name}
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            label="Tóm tắt"
                            value={selectedSeason.overview}
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Số phần"
                            value={selectedSeason.season_number}
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Số tập"
                            value={selectedSeason.episodes.length}
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                          Danh sách tập ({selectedSeason.episodes.length})
                        </Typography>
                        
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Tập</TableCell>
                                <TableCell>Tên</TableCell>
                                <TableCell>Thời lượng</TableCell>
                                <TableCell>Ngày phát hành</TableCell>
                                <TableCell align="right">Thao tác</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedSeason.episodes.map(episode => (
                                <TableRow key={episode.episode_number} hover>
                                  <TableCell>{episode.episode_number}</TableCell>
                                  <TableCell>{episode.name}</TableCell>
                                  <TableCell>{episode.runtime} phút</TableCell>
                                  <TableCell>{episode.air_date}</TableCell>
                                  <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={() => handleOpenEpisodeDialog('edit', selectedSeason, episode)}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton 
                                        size="small" 
                                        color="error"
                                        onClick={() => {
                                          handleSelectEpisode(selectedSeason, episode);
                                          handleDeleteEpisode();
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  ) : (
                    // Hiển thị thông tin episode
                    <Box>
                      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                        {selectedSeason.name} - Tập {selectedEpisode.episode_number}: {selectedEpisode.name}
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            label="Tên tập"
                            value={selectedEpisode.name}
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            label="Tóm tắt"
                            value={selectedEpisode.overview}
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Thời lượng (phút)"
                            value={selectedEpisode.runtime}
                            fullWidth
                            variant="outlined"
                            type="number"
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Ngày phát hành"
                            value={selectedEpisode.air_date}
                            fullWidth
                            variant="outlined"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            label="URL Video"
                            value={selectedEpisode.video_url}
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            label="URL Ảnh thu nhỏ"
                            value={selectedEpisode.still_path}
                            fullWidth
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      
                      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleDeleteEpisode}
                        >
                          Xóa tập
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEpisodeDialog('edit', selectedSeason, selectedEpisode)}
                        >
                          Chỉnh sửa
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
            
            {/* Episode Dialog */}
            <Dialog 
              open={episodeDialogOpen} 
              onClose={handleCloseEpisodeDialog}
              fullWidth
              maxWidth="md"
            >
              <DialogTitle>
                {episodeDialogMode === 'add' ? 'Thêm tập phim mới' : 'Chỉnh sửa tập phim'}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="episode_number"
                      label="Số tập"
                      value={episodeFormData.episode_number}
                      onChange={handleEpisodeFormChange}
                      fullWidth
                      variant="outlined"
                      type="number"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="name"
                      label="Tên tập"
                      value={episodeFormData.name}
                      onChange={handleEpisodeFormChange}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name="overview"
                      label="Tóm tắt"
                      value={episodeFormData.overview}
                      onChange={handleEpisodeFormChange}
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="runtime"
                      label="Thời lượng (phút)"
                      value={episodeFormData.runtime}
                      onChange={handleEpisodeFormChange}
                      fullWidth
                      variant="outlined"
                      type="number"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="air_date"
                      label="Ngày phát hành"
                      value={episodeFormData.air_date}
                      onChange={handleEpisodeFormChange}
                      fullWidth
                      variant="outlined"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name="video_url"
                      label="URL Video"
                      value={episodeFormData.video_url}
                      onChange={handleEpisodeFormChange}
                      fullWidth
                      variant="outlined"
                      helperText="Nhập URL iframe hoặc YouTube embed"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      name="still_path"
                      label="URL Ảnh thu nhỏ"
                      value={episodeFormData.still_path}
                      onChange={handleEpisodeFormChange}
                      fullWidth
                      variant="outlined"
                      helperText="Nhập đường dẫn ảnh thu nhỏ cho tập phim"
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseEpisodeDialog}>Hủy</Button>
                <Button 
                  variant="contained" 
                  onClick={handleSaveEpisode}
                  disabled={!episodeFormData.name || !episodeFormData.video_url}
                >
                  Lưu
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        );
        
      case 7: // Settings
        return (
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Thiết lập
            </Typography>
            <Typography variant="body1">
              Tại đây bạn có thể cấu hình SMTP gửi mail và API key.
            </Typography>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  // Render tabs
  const tabs = [
    { icon: <DashboardIcon />, label: "Dashboard" },
    { icon: <MovieIcon />, label: "Phim" },
    { icon: <CategoryIcon />, label: "Thể loại" },
    { icon: <PeopleAltIcon />, label: "Người dùng" },
    { icon: <SubscriptionsIcon />, label: "Gói dịch vụ" },
    { icon: <AssessmentIcon />, label: "Báo cáo" },
    { icon: <VideoLibraryIcon />, label: "Squid Game" },
    { icon: <SettingsIcon />, label: "Thiết lập" }
  ];
  
  return (
    <Box sx={{ ...uiConfigs.style.mainContent, pt: 8 }}>
      <Container header="Trang quản trị">
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3} lg={2}>
            <Paper sx={{ 
              borderRadius: 2, 
              boxShadow: 3,
              overflow: 'hidden',
              height: '100%'
            }}>
              <Tabs
                orientation="vertical"
                value={tabValue}
                onChange={handleTabChange}
                aria-label="admin navigation tabs"
                sx={{
                  borderRight: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    py: 2,
                    minHeight: 'auto',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem'
                  },
                  '& .Mui-selected': {
                    fontWeight: 700,
                    color: 'primary.main'
                  }
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab key={index} icon={tab.icon} label={tab.label} />
                ))}
              </Tabs>
            </Paper>
          </Grid>
          
          {/* Content */}
          <Grid item xs={12} md={9} lg={10}>
            <Paper sx={{ 
              p: 4, 
              borderRadius: 2, 
              boxShadow: 3,
              minHeight: '70vh'
            }}>
              {renderTabContent()}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 