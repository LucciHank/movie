import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  OutlinedInput,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';

import uiConfigs from '../configs/ui.configs';
import tmdbConfigs from '../api/configs/tmdb.configs';
import mediaApi from '../api/modules/media.api';
import genreApi from '../api/modules/genre.api';
import { setGlobalLoading } from '../redux/features/globalLoadingSlice';

const AdminPanel = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  
  const [tabValue, setTabValue] = useState(0);
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [genres, setGenres] = useState({
    movie: [],
    tv: []
  });
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [openMovieDialog, setOpenMovieDialog] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieFormData, setMovieFormData] = useState({
    title: '',
    overview: '',
    poster_path: '',
    backdrop_path: '',
    release_date: '',
    genres: []
  });
  
  // Check if user is admin
  useEffect(() => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để truy cập trang này');
      navigate('/');
      return;
    }
    
    // Cho phép tài khoản admin2004 truy cập
    if (user.username === 'admin2004' || user.role === 'admin') {
      // Đã có quyền admin, không làm gì cả
    } else {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/');
    }
  }, [user, navigate]);
  
  // Load movies and TV shows
  useEffect(() => {
    const loadMedias = async () => {
      dispatch(setGlobalLoading(true));
      
      try {
        // Load movies
        const { response: movieResponse, err: movieErr } = await mediaApi.getList({
          mediaType: tmdbConfigs.mediaType.movie,
          mediaCategory: tmdbConfigs.mediaCategory.popular,
          page: 1
        });
        
        if (movieErr) toast.error(movieErr.message);
        if (movieResponse) setMovies(movieResponse.results);
        
        // Load TV shows
        const { response: tvResponse, err: tvErr } = await mediaApi.getList({
          mediaType: tmdbConfigs.mediaType.tv,
          mediaCategory: tmdbConfigs.mediaCategory.popular,
          page: 1
        });
        
        if (tvErr) toast.error(tvErr.message);
        if (tvResponse) setTvShows(tvResponse.results);
        
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
      } catch (error) {
        toast.error('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        dispatch(setGlobalLoading(false));
      }
    };
    
    loadMedias();
  }, [dispatch]);
  
  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
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
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    dispatch(setGlobalLoading(true));
    
    try {
      const mediaType = tabValue === 0 ? tmdbConfigs.mediaType.movie : tmdbConfigs.mediaType.tv;
      
      const { response, err } = await mediaApi.search({
        mediaType,
        query: searchQuery,
        page: 1
      });
      
      if (err) toast.error(err.message);
      if (response) {
        if (mediaType === tmdbConfigs.mediaType.movie) {
          setMovies(response.results);
        } else {
          setTvShows(response.results);
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tìm kiếm');
    } finally {
      setIsSearching(false);
      dispatch(setGlobalLoading(false));
    }
  };
  
  // Movie dialog handlers
  const handleOpenMovieDialog = (movie = null) => {
    if (movie) {
      setSelectedMovie(movie);
      setMovieFormData({
        title: movie.title || movie.name,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date || movie.first_air_date,
        genres: movie.genre_ids || []
      });
    } else {
      setSelectedMovie(null);
      setMovieFormData({
        title: '',
        overview: '',
        poster_path: '',
        backdrop_path: '',
        release_date: '',
        genres: []
      });
    }
    setOpenMovieDialog(true);
  };
  
  const handleCloseMovieDialog = () => {
    setOpenMovieDialog(false);
    setSelectedMovie(null);
  };
  
  const handleMovieFormChange = (e) => {
    const { name, value } = e.target;
    setMovieFormData({ ...movieFormData, [name]: value });
  };
  
  const handleGenreChange = (event) => {
    const { value } = event.target;
    setMovieFormData({ ...movieFormData, genres: value });
  };
  
  const handleSaveMovie = async () => {
    // In a real application, this would save to your backend
    toast.success(`Đã ${selectedMovie ? 'cập nhật' : 'thêm'} phim thành công`);
    handleCloseMovieDialog();
  };
  
  // Get current media list based on active tab
  const getCurrentMedia = () => {
    const mediaList = tabValue === 0 ? movies : tvShows;
    return mediaList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };
  
  // Get genre names by IDs
  const getGenreNamesByIds = (genreIds, mediaType) => {
    if (!genreIds || !genres[mediaType]) return [];
    return genreIds.map(id => {
      const genre = genres[mediaType].find(g => g.id === id);
      return genre ? genre.name : '';
    }).filter(name => name);
  };
  
  return (
    <Box sx={{ ...uiConfigs.style.mainContent, pt: 8 }}>
      <Container maxWidth="xl">
        <Typography 
          variant="h4" 
          fontWeight={700} 
          sx={{ 
            mb: 4, 
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          Quản lý phim
        </Typography>
        
        {/* Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: 120
              }
            }}
          >
            <Tab icon={<MovieIcon />} iconPosition="start" label="Phim lẻ" />
            <Tab icon={<TvIcon />} iconPosition="start" label="Phim bộ" />
            <Tab icon={<CategoryIcon />} iconPosition="start" label="Thể loại" />
          </Tabs>
        </Paper>
        
        {/* Search and Add buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' }
          }}>
            <TextField
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ width: { xs: '100%', sm: 300 } }}
            />
            <LoadingButton
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              loading={isSearching}
              sx={{ ml: 1 }}
            >
              Tìm
            </LoadingButton>
          </Box>
          
          {tabValue !== 2 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenMovieDialog()}
            >
              Thêm mới
            </Button>
          )}
        </Box>
        
        {/* Movies and TV Shows Tab Content */}
        {(tabValue === 0 || tabValue === 1) && (
          <>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Poster</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Ngày phát hành</TableCell>
                    <TableCell>Thể loại</TableCell>
                    <TableCell>Đánh giá</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentMedia().map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box
                          component="img"
                          src={tmdbConfigs.posterPath(item.poster_path)}
                          alt={item.title || item.name}
                          sx={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 1 }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-movie-poster.png';
                          }}
                        />
                      </TableCell>
                      <TableCell>{item.title || item.name}</TableCell>
                      <TableCell>{item.release_date || item.first_air_date}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {getGenreNamesByIds(
                            item.genre_ids, 
                            tabValue === 0 ? 'movie' : 'tv'
                          ).map((genre, index) => (
                            <Chip 
                              key={index} 
                              label={genre} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{item.vote_average}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleOpenMovieDialog(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={tabValue === 0 ? movies.length : tvShows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />
          </>
        )}
        
        {/* Genres Tab Content */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Thể loại phim lẻ
                </Typography>
                <Grid container spacing={1}>
                  {genres.movie.map((genre) => (
                    <Grid item key={genre.id}>
                      <Chip 
                        label={genre.name} 
                        color="primary" 
                        onDelete={() => {}}
                        sx={{ m: 0.5 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Thể loại phim bộ
                </Typography>
                <Grid container spacing={1}>
                  {genres.tv.map((genre) => (
                    <Grid item key={genre.id}>
                      <Chip 
                        label={genre.name} 
                        color="primary" 
                        onDelete={() => {}}
                        sx={{ m: 0.5 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Movie Dialog */}
        <Dialog open={openMovieDialog} onClose={handleCloseMovieDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="title"
                  label="Tên phim"
                  fullWidth
                  value={movieFormData.title}
                  onChange={handleMovieFormChange}
                  margin="normal"
                />
                <TextField
                  name="release_date"
                  label="Ngày phát hành"
                  type="date"
                  fullWidth
                  value={movieFormData.release_date}
                  onChange={handleMovieFormChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Thể loại</InputLabel>
                  <Select
                    multiple
                    value={movieFormData.genres}
                    onChange={handleGenreChange}
                    input={<OutlinedInput label="Thể loại" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const genre = genres[tabValue === 0 ? 'movie' : 'tv'].find(g => g.id === value);
                          return (
                            <Chip 
                              key={value} 
                              label={genre ? genre.name : value} 
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {genres[tabValue === 0 ? 'movie' : 'tv'].map((genre) => (
                      <MenuItem key={genre.id} value={genre.id}>
                        {genre.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  name="poster_path"
                  label="Đường dẫn poster"
                  fullWidth
                  value={movieFormData.poster_path}
                  onChange={handleMovieFormChange}
                  margin="normal"
                />
                <TextField
                  name="backdrop_path"
                  label="Đường dẫn backdrop"
                  fullWidth
                  value={movieFormData.backdrop_path}
                  onChange={handleMovieFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="overview"
                  label="Mô tả"
                  multiline
                  rows={4}
                  fullWidth
                  value={movieFormData.overview}
                  onChange={handleMovieFormChange}
                  margin="normal"
                />
                
                {/* Preview */}
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Xem trước
                </Typography>
                <Card sx={{ maxWidth: 345, mx: 'auto' }}>
                  <CardMedia
                    component="img"
                    height="194"
                    image={movieFormData.poster_path ? tmdbConfigs.posterPath(movieFormData.poster_path) : '/default-movie-poster.png'}
                    alt={movieFormData.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-movie-poster.png';
                    }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="div">
                      {movieFormData.title || 'Tên phim'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {movieFormData.overview || 'Mô tả phim'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMovieDialog}>Hủy</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveMovie}
            >
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminPanel; 