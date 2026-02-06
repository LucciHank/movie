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
    <Box sx={{ ...uiConfigs.style.mainContent, pt: { xs: 10, md: 12 } }}>
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 3,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: 'center',
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          Khám phá theo thể loại
        </Typography>

        {/* Genres grid - responsive with no wasted space */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(5, 1fr)',
              xl: 'repeat(6, 1fr)'
            },
            gap: { xs: 1.5, sm: 2 }
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
                height: { xs: 80, sm: 100, md: 110 },
                borderRadius: 2,
                background: getGradientBackground(index),
                transition: 'all 0.25s ease',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.15)',
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
                    p: 1.5
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    component="div"
                    color="white"
                    fontWeight={700}
                    textAlign="center"
                    sx={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                      fontSize: { xs: '0.85rem', sm: '1rem', md: '1.1rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {genre.name_vi}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default GenreList; 