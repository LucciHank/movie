import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Grid, Pagination, Stack, Typography, TextField, InputAdornment, Card, CardMedia, CardContent, useTheme, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';
import personApi from '../api/modules/person.api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setGlobalLoading } from '../redux/features/globalLoadingSlice';
import tmdbConfigs from '../api/configs/tmdb.configs';
import uiConfigs from '../configs/ui.configs';
import { routesGen } from '../routes/routes';
import LoadingButton from '@mui/lab/LoadingButton';

const ActorsList = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [actors, setActors] = useState([]);
  const [filteredActors, setFilteredActors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const getActors = async () => {
      setLoading(true);
      dispatch(setGlobalLoading(true));
      
      try {
        // Sử dụng API TMDB để lấy danh sách diễn viên phổ biến
        const { response, err } = await personApi.list({ page });
        
        if (err) {
          toast.error(err.message);
        } else if (response) {
          setActors(response.results);
          setFilteredActors(response.results);
          setTotalPages(response.total_pages > 100 ? 100 : response.total_pages);
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải danh sách diễn viên");
      } finally {
        setLoading(false);
        setInitialLoading(false);
        dispatch(setGlobalLoading(false));
      }
    };

    getActors();
  }, [page, dispatch]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredActors(actors);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const { response, err } = await personApi.search({ 
        query: searchQuery, 
        page: 1 
      });
      
      if (err) {
        toast.error(err.message);
      } else if (response && response.results) {
        setFilteredActors(response.results);
        setTotalPages(response.total_pages > 100 ? 100 : response.total_pages);
        setPage(1); // Reset về trang đầu tiên khi tìm kiếm
      } else {
        toast.error("Không thể tải kết quả tìm kiếm");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (!value.trim()) {
      setFilteredActors(actors);
      setIsSearching(false);
    }
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
          Danh sách diễn viên
        </Typography>

        {/* Search bar */}
        <Box 
          component="form"
          onSubmit={handleSearch}
          sx={{ 
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <TextField
            fullWidth
            placeholder="Tìm kiếm diễn viên..."
            value={searchQuery}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <LoadingButton
            variant="contained"
            type="submit"
            loading={loading}
            sx={{ 
              minWidth: '120px',
              height: '56px',
              fontWeight: 600
            }}
          >
            Tìm kiếm
          </LoadingButton>
        </Box>

        {initialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredActors.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy diễn viên nào
            </Typography>
          </Box>
        ) : (
          <>
            {/* Actors grid */}
            <Grid container spacing={3}>
              {filteredActors.map((actor) => (
                <Grid item key={actor.id} xs={6} sm={4} md={3} lg={2.4}>
                  <Card 
                    component={Link}
                    to={routesGen.person(actor.id)}
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      textDecoration: 'none',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={actor.profile_path ? tmdbConfigs.posterPath(actor.profile_path) : '/default-avatar.png'}
                      alt={actor.name}
                      sx={{ 
                        aspectRatio: '2/3',
                        objectFit: 'cover',
                        backgroundColor: 'background.paper'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography 
                        variant="subtitle1" 
                        fontWeight={600} 
                        sx={{ 
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'text.primary'
                        }}
                      >
                        {actor.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {actor.known_for_department || 'Diễn viên'}
                      </Typography>
                      {actor.known_for && actor.known_for.length > 0 && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Nổi tiếng với: {actor.known_for.map(item => item.title || item.name).join(', ')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Stack spacing={2} alignItems="center" sx={{ mt: 5, mb: 3 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  siblingCount={1}
                  boundaryCount={1}
                />
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default ActorsList; 