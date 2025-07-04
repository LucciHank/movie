import React, { useEffect, useState, useRef } from 'react';
import { Box, Container, Typography, Card, CardActionArea, useTheme, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import genreApi from '../api/modules/genre.api';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setGlobalLoading } from '../redux/features/globalLoadingSlice';
import tmdbConfigs from '../api/configs/tmdb.configs';
import uiConfigs from '../configs/ui.configs';

// Bảng dịch thể loại từ tiếng Anh sang tiếng Việt
const genreTranslations = {
  'Action': 'Hành Động',
  'Adventure': 'Phiêu Lưu',
  'Animation': 'Hoạt Hình',
  'Comedy': 'Hài Hước',
  'Crime': 'Tội Phạm',
  'Documentary': 'Tài Liệu',
  'Drama': 'Chính Kịch',
  'Family': 'Gia Đình',
  'Fantasy': 'Giả Tưởng',
  'History': 'Lịch Sử',
  'Horror': 'Kinh Dị',
  'Music': 'Âm Nhạc',
  'Mystery': 'Bí Ẩn',
  'Romance': 'Lãng Mạn',
  'Science Fiction': 'Khoa Học Viễn Tưởng',
  'TV Movie': 'Phim Truyền Hình',
  'Thriller': 'Giật Gân',
  'War': 'Chiến Tranh',
  'Western': 'Cao Bồi',
  'Action & Adventure': 'Hành Động & Phiêu Lưu',
  'Kids': 'Thiếu Nhi',
  'News': 'Tin Tức',
  'Reality': 'Thực Tế',
  'Sci-Fi & Fantasy': 'Khoa Học & Giả Tưởng',
  'Soap': 'Tâm Lý Xã Hội',
  'Talk': 'Talkshow',
  'War & Politics': 'Chiến Tranh & Chính Trị'
};

const GenreList = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [allGenres, setAllGenres] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const getGenres = async () => {
      dispatch(setGlobalLoading(true));
      
      try {
        // Lấy thể loại phim lẻ
        const { response: movieResponse, err: movieErr } = await genreApi.getList({ 
          mediaType: tmdbConfigs.mediaType.movie 
        });
        
        if (movieErr) toast.error(movieErr.message);
        
        // Lấy thể loại phim bộ
        const { response: tvResponse, err: tvErr } = await genreApi.getList({ 
          mediaType: tmdbConfigs.mediaType.tv 
        });
        
        if (tvErr) toast.error(tvErr.message);
        
        if (movieResponse && tvResponse) {
          // Gộp và loại bỏ trùng lặp
          const movieGenres = movieResponse.genres.map(genre => ({
            ...genre,
            name_vi: genreTranslations[genre.name] || genre.name,
            mediaTypes: [tmdbConfigs.mediaType.movie]
          }));
          
          const tvGenres = tvResponse.genres.map(genre => ({
            ...genre,
            name_vi: genreTranslations[genre.name] || genre.name,
            mediaTypes: [tmdbConfigs.mediaType.tv]
          }));
          
          // Gộp các thể loại và xử lý trùng lặp
          const mergedGenres = [...movieGenres];
          
          tvGenres.forEach(tvGenre => {
            const existingIndex = mergedGenres.findIndex(g => 
              g.name === tvGenre.name || 
              g.name_vi === tvGenre.name_vi
            );
            
            if (existingIndex >= 0) {
              // Thêm mediaType nếu thể loại đã tồn tại
              mergedGenres[existingIndex].mediaTypes.push(...tvGenre.mediaTypes);
            } else {
              // Thêm thể loại mới
              mergedGenres.push(tvGenre);
            }
          });
          
          // Sắp xếp theo tên tiếng Việt
          mergedGenres.sort((a, b) => a.name_vi.localeCompare(b.name_vi));
          
          setAllGenres(mergedGenres);
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải danh sách thể loại");
      } finally {
        dispatch(setGlobalLoading(false));
      }
    };

    getGenres();
  }, [dispatch]);

  // Tạo background gradient cho cards
  const getGradientBackground = (index) => {
    const gradients = [
      'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 100%)',
      'linear-gradient(135deg, #FCCF31 0%, #F55555 100%)',
      'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)',
      'linear-gradient(135deg, #5EFCE8 0%, #736EFE 100%)',
      'linear-gradient(135deg, #FAD7A1 0%, #E96D71 100%)',
      'linear-gradient(135deg, #FFD26F 0%, #3677FF 100%)',
      'linear-gradient(135deg, #A0FE65 0%, #FA016D 100%)',
      'linear-gradient(135deg, #0BA360 0%, #3CBA92 100%)',
      'linear-gradient(135deg, #FFAA85 0%, #B3315F 100%)',
      'linear-gradient(135deg, #FFF720 0%, #3CD500 100%)',
      'linear-gradient(135deg, #FF6FD8 0%, #3813C2 100%)',
      'linear-gradient(135deg, #EE9AE5 0%, #5961F9 100%)',
      'linear-gradient(135deg, #FFC371 0%, #FF5F6D 100%)',
      'linear-gradient(135deg, #C2E59C 0%, #64B3F4 100%)',
      'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)'
    ];
    
    return gradients[index % gradients.length];
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ ...uiConfigs.style.mainContent, pt: 8 }}>
      <Container>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          sx={{ 
            mb: 5, 
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          Bạn đang muốn xem thể loại gì?
        </Typography>

        {/* Genres carousel with navigation buttons */}
        <Box sx={{ position: 'relative' }}>
          {/* Left navigation button */}
          <IconButton
            onClick={handleScrollLeft}
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
              },
              display: { xs: 'none', md: 'flex' }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          {/* Genres row */}
          <Box 
            ref={scrollContainerRef}
            sx={{ 
              display: 'flex',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              pb: 2,
              gap: 3,
              px: { xs: 0, md: 5 },
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            {allGenres.map((genre, index) => (
              <Card 
                key={genre.id}
                component={Link}
                to={genre.mediaTypes.length > 1 
                  ? `/movie?genre=${genre.id}` 
                  : `/${genre.mediaTypes[0]}?genre=${genre.id}`
                }
                sx={{ 
                  width: 280,
                  height: 140,
                  borderRadius: 4,
                  flexShrink: 0,
                  background: getGradientBackground(index),
                  transition: 'all 0.3s ease',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.2)',
                    zIndex: 1
                  }
                }}
              >
                <CardActionArea sx={{ height: '100%', width: '100%', zIndex: 2 }}>
                  <Box 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      component="div" 
                      color="white"
                      fontWeight={700}
                      textAlign="center"
                      sx={{ 
                        mb: 1,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      {genre.name_vi}
                    </Typography>
                    
                    <Typography 
                      variant="subtitle2" 
                      color="white" 
                      textAlign="center"
                      sx={{
                        opacity: 0.9,
                        fontWeight: 500,
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      {genre.mediaTypes.length > 1 
                        ? 'Phim lẻ & Phim bộ' 
                        : genre.mediaTypes[0] === tmdbConfigs.mediaType.movie 
                          ? 'Phim lẻ' 
                          : 'Phim bộ'
                      }
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            ))}
          </Box>

          {/* Right navigation button */}
          <IconButton
            onClick={handleScrollRight}
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
              },
              display: { xs: 'none', md: 'flex' }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default GenreList; 