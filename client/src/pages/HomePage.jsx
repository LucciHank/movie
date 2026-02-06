import React, { useEffect, useState, useRef } from 'react';
import HeroSlide from '../components/common/HeroSlide';
import tmdbConfigs from "../api/configs/tmdb.configs";
import { Box, Typography, Container as MuiContainer, Grid, Card, CardMedia, CardContent, Stack, Chip, Button, Tabs, Tab, useTheme, IconButton } from '@mui/material';
import uiConfigs from "../configs/ui.configs";
import Container from "../components/common/Container";
import MediaSlide from "../components/common/MediaSlide";
import AutoSwiper from "../components/common/AutoSwiper";
import mediaApi from "../api/modules/media.api";
import genreApi from "../api/modules/genre.api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { routesGen } from "../routes/routes";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { LoadingButton } from "@mui/lab";
import usePrevious from "../hooks/usePrevious";
import { SwiperSlide } from "swiper/react";
import ContinueWatching from "../components/common/ContinueWatching";

const HomePage = () => {
  const theme = useTheme();
  const [topMovies, setTopMovies] = useState([]);
  const [topTVShows, setTopTVShows] = useState([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [countryMovies, setCountryMovies] = useState([]);
  const [collectionImages, setCollectionImages] = useState({
    marvel: null,
    korean: null,
    horror: null
  });

  // Thêm state và ref cho scroll position
  const [topMoviesScrollPosition, setTopMoviesScrollPosition] = useState(0);
  const [topTVShowsScrollPosition, setTopTVShowsScrollPosition] = useState(0);
  const [recentlyUpdatedScrollPosition, setRecentlyUpdatedScrollPosition] = useState(0);
  const [genresScrollPosition, setGenresScrollPosition] = useState(0);

  const topMoviesScrollRef = useRef(null);
  const topTVShowsScrollRef = useRef(null);
  const recentlyUpdatedScrollRef = useRef(null);
  const genresScrollRef = useRef(null);
  const [media, setMedia] = useState([]);
  const [recommendedScrollPosition, setRecommendedScrollPosition] = useState(0);
  const recommendedScrollRef = useRef(null);

  useEffect(() => {
    const getTopMovies = async () => {
      const { response, err } = await mediaApi.getList({
        mediaType: tmdbConfigs.mediaType.movie,
        mediaCategory: tmdbConfigs.mediaCategory.popular,
        page: 1
      });

      if (response && response.results) setTopMovies(response.results.slice(0, 10));
      if (err) toast.error(err.message);
    };

    const getTopTVShows = async () => {
      const { response, err } = await mediaApi.getList({
        mediaType: tmdbConfigs.mediaType.tv,
        mediaCategory: tmdbConfigs.mediaCategory.popular,
        page: 1
      });

      if (response && response.results) setTopTVShows(response.results.slice(0, 10));
      if (err) toast.error(err.message);
    };

    const getRecentlyUpdated = async () => {
      // Dùng now_playing để mô phỏng phim mới cập nhật
      const { response, err } = await mediaApi.getList({
        mediaType: tmdbConfigs.mediaType.movie,
        mediaCategory: tmdbConfigs.mediaCategory.now_playing,
        page: 1
      });

      if (response && response.results) {
        const updatedMedia = response.results.slice(0, 20).map(item => ({
          ...item,
          updateType: Math.random() > 0.5 ? "new" : "updated",
          episodeNumber: Math.floor(Math.random() * 20) + 1
        }));
        setRecentlyUpdated(updatedMedia);
      }
      if (err) toast.error(err.message);
    };

    const getRecommended = async () => {
      // Giả lập đề xuất bằng cách lấy từ top rated
      const { response, err } = await mediaApi.getList({
        mediaType: tmdbConfigs.mediaType.movie,
        mediaCategory: tmdbConfigs.mediaCategory.top_rated,
        page: 1
      });

      if (response && response.results) setRecommended(response.results.slice(0, 10));
      if (err) toast.error(err.message);
    };

    const getComingSoon = async () => {
      const { response, err } = await mediaApi.getList({
        mediaType: tmdbConfigs.mediaType.movie,
        mediaCategory: tmdbConfigs.mediaCategory.upcoming,
        page: 1
      });

      if (response && response.results) {
        const comingSoonMovies = response.results.slice(0, 6).map(item => ({
          ...item,
          release_date: item.release_date || "2023-12-25"
        }));
        setComingSoon(comingSoonMovies);
      }
      if (err) toast.error(err.message);
    };

    const getGenres = async () => {
      const { response, err } = await genreApi.getList({
        mediaType: tmdbConfigs.mediaType.movie
      });

      if (response && response.genres) setGenres(response.genres.slice(0, 10));
      if (err) toast.error(err.message);
    };

    getTopMovies();
    getTopTVShows();
    getRecentlyUpdated();
    getRecommended();
    getComingSoon();
    getGenres();

    // Fetch collection backdrop images
    const getCollectionImages = async () => {
      try {
        // Marvel: Avengers Endgame
        const marvelRes = await mediaApi.getDetail({ mediaType: 'movie', mediaId: 299536 });
        // Korean: Parasite
        const koreanRes = await mediaApi.getDetail({ mediaType: 'movie', mediaId: 496243 });
        // Horror: The Conjuring
        const horrorRes = await mediaApi.getDetail({ mediaType: 'movie', mediaId: 138843 });

        setCollectionImages({
          marvel: marvelRes.response?.backdrop_path,
          korean: koreanRes.response?.backdrop_path,
          horror: horrorRes.response?.backdrop_path
        });
      } catch (e) {
        console.log('Failed to load collection images');
      }
    };
    getCollectionImages();
  }, []);

  // Fetch movies by country when selection changes
  useEffect(() => {
    const getCountryMovies = async () => {
      // Mapping country to params for discover API
      const countryConfig = {
        all: {
          mediaCategory: tmdbConfigs.mediaCategory.popular
        },
        vietnam: {
          with_original_language: 'vi'
        },
        korea: {
          with_original_language: 'ko'
        },
        us: {
          with_original_language: 'en',
          with_origin_country: 'US'
        },
        japan: {
          with_original_language: 'ja'
        },
        china: {
          with_original_language: 'zh'
        }
      };

      const config = countryConfig[selectedCountry] || countryConfig.all;
      let response, err;

      if (selectedCountry === 'all') {
        // Use existing popular list for "all"
        const res = await mediaApi.getList({
          mediaType: tmdbConfigs.mediaType.movie,
          mediaCategory: tmdbConfigs.mediaCategory.popular,
          page: 1
        });
        response = res.response;
        err = res.err;
      } else {
        // Use discover API for specific countries
        const res = await mediaApi.discover({
          mediaType: tmdbConfigs.mediaType.movie,
          ...config,
          page: 1
        });
        response = res.response;
        err = res.err;
      }

      if (response && response.results) {
        setCountryMovies(response.results);
      }
      if (err) toast.error(err.message);
    };

    getCountryMovies();
  }, [selectedCountry]);

  const handleCountryChange = (event, newValue) => {
    setSelectedCountry(newValue);
  };

  const renderGenresSection = () => {
    const handleScroll = (direction) => {
      const container = genresScrollRef.current;
      if (!container) return;

      const scrollAmount = 300; // Khoảng cách scroll mỗi lần nhấn
      const newPosition = direction === 'left'
        ? Math.max(0, genresScrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, genresScrollPosition + scrollAmount);

      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });

      setGenresScrollPosition(newPosition);
    };

    // Ánh xạ ID thể loại sang tên tiếng Việt
    const genreNameMapping = {
      28: "Hành Động",
      12: "Phiêu Lưu",
      16: "Hoạt Hình",
      35: "Hài Kịch",
      80: "Tội Phạm",
      99: "Tài Liệu",
      18: "Chính Kịch",
      10751: "Gia Đình",
      14: "Giả Tưởng",
      36: "Lịch Sử",
      27: "Kinh Dị",
      10402: "Âm Nhạc",
      9648: "Bí Ẩn",
      10749: "Lãng Mạn",
      878: "Khoa Học Viễn Tưởng",
      10770: "Phim Truyền Hình",
      53: "Gây Cấn",
      10752: "Chiến Tranh",
      37: "Miền Tây"
    };

    return (
      <MuiContainer maxWidth="xl" sx={{ mb: 6, pt: { xs: 6, md: 8 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 4,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          Bạn đang muốn xem thể loại gì?
        </Typography>

        <Box sx={{ position: 'relative' }}>
          {/* Scroll container */}
          <Box
            ref={genresScrollRef}
            sx={{
              position: 'relative',
              overflowX: 'auto',
              pb: 4,
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{
                minWidth: 'max-content',
                pb: 1
              }}
            >
              {genres.map((genre) => (
                <Box
                  key={genre.id}
                  component={Link}
                  to={`/movie?genre=${genre.id}`}
                  sx={{
                    width: { xs: 200, sm: 250, md: 300 },
                    height: 100,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                    },
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}80, ${theme.palette.secondary.main}80)`,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      textAlign: 'center',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      zIndex: 2,
                    }}
                  >
                    {genreNameMapping[genre.id] || genre.name}
                  </Typography>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.3)',
                      zIndex: 1
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Navigation buttons */}
          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2,
              display: genresScrollPosition > 0 ? 'flex' : 'none'
            }}
            onClick={() => handleScroll('left')}
          >
            <NavigateBeforeIcon fontSize="large" />
          </IconButton>

          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2
            }}
            onClick={() => handleScroll('right')}
          >
            <NavigateNextIcon fontSize="large" />
          </IconButton>
        </Box>
      </MuiContainer>
    );
  };

  const renderTopMoviesSection = () => {
    const handleScroll = (direction) => {
      const container = topMoviesScrollRef.current;
      if (!container) return;

      const scrollAmount = 250; // Khoảng cách scroll mỗi lần nhấn
      const newPosition = direction === 'left'
        ? Math.max(0, topMoviesScrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, topMoviesScrollPosition + scrollAmount);

      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });

      setTopMoviesScrollPosition(newPosition);
    };

    return (
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 4,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          Top 10 phim lẻ hôm nay
        </Typography>

        <Box sx={{ position: 'relative' }}>
          {/* Scroll container */}
          <Box
            ref={topMoviesScrollRef}
            sx={{
              position: 'relative',
              overflowX: 'auto',
              pb: 4,
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ minWidth: 'max-content' }}
            >
              {topMovies.map((movie, index) => (
                <Box
                  key={movie.id}
                  component={Link}
                  to={routesGen.mediaDetail(tmdbConfigs.mediaType.movie, movie.id)}
                  sx={{
                    position: 'relative',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.03)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={tmdbConfigs.posterPath(movie.poster_path)}
                      alt={movie.title}
                      sx={{
                        width: { xs: 140, sm: 180, md: 200 },
                        height: 'auto',
                        borderRadius: '12px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                      }}
                    />

                    {/* Rank number */}
                    <Typography
                      variant="h1"
                      sx={{
                        position: 'absolute',
                        bottom: { xs: -10, md: -15 },
                        left: { xs: -10, md: -15 },
                        fontSize: { xs: '5rem', md: '7rem' },
                        fontWeight: 800,
                        color: theme.palette.primary.main,
                        textShadow: '0 0 10px rgba(0,0,0,0.5)',
                        opacity: 0.9,
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        lineHeight: 1
                      }}
                    >
                      {index + 1}
                    </Typography>

                    {/* Rating badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderRadius: '6px',
                        padding: '2px 6px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <StarIcon sx={{ color: '#FFD700', fontSize: '0.9rem', mr: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {movie.vote_average?.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, px: 1, maxWidth: { xs: 140, sm: 180, md: 200 } }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {movie.title}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {movie.release_date?.split('-')[0] || 'N/A'}
                      </Typography>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          label="Phim lẻ"
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Navigation buttons */}
          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2,
              display: topMoviesScrollPosition > 0 ? 'flex' : 'none'
            }}
            onClick={() => handleScroll('left')}
          >
            <NavigateBeforeIcon fontSize="large" />
          </IconButton>

          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2
            }}
            onClick={() => handleScroll('right')}
          >
            <NavigateNextIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>
    );
  };

  const renderTopTVShowsSection = () => {
    const handleScroll = (direction) => {
      const container = topTVShowsScrollRef.current;
      if (!container) return;

      const scrollAmount = 250; // Khoảng cách scroll mỗi lần nhấn
      const newPosition = direction === 'left'
        ? Math.max(0, topTVShowsScrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, topTVShowsScrollPosition + scrollAmount);

      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });

      setTopTVShowsScrollPosition(newPosition);
    };

    return (
      <Box sx={{ mb: 8 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 4,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          Top 10 phim bộ hôm nay
        </Typography>

        <Box sx={{ position: 'relative' }}>
          {/* Scroll container */}
          <Box
            ref={topTVShowsScrollRef}
            sx={{
              position: 'relative',
              overflowX: 'auto',
              pb: 4,
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ minWidth: 'max-content' }}
            >
              {topTVShows.map((show, index) => (
                <Box
                  key={show.id}
                  component={Link}
                  to={routesGen.mediaDetail(tmdbConfigs.mediaType.tv, show.id)}
                  sx={{
                    position: 'relative',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.03)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={tmdbConfigs.posterPath(show.poster_path)}
                      alt={show.name}
                      sx={{
                        width: { xs: 140, sm: 180, md: 200 },
                        height: 'auto',
                        borderRadius: '12px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                      }}
                    />

                    {/* Rank number */}
                    <Typography
                      variant="h1"
                      sx={{
                        position: 'absolute',
                        bottom: { xs: -10, md: -15 },
                        left: { xs: -10, md: -15 },
                        fontSize: { xs: '5rem', md: '7rem' },
                        fontWeight: 800,
                        color: theme.palette.primary.main,
                        textShadow: '0 0 10px rgba(0,0,0,0.5)',
                        opacity: 0.9,
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                        lineHeight: 1
                      }}
                    >
                      {index + 1}
                    </Typography>

                    {/* Rating badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderRadius: '6px',
                        padding: '2px 6px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <StarIcon sx={{ color: '#FFD700', fontSize: '0.9rem', mr: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                        {show.vote_average?.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, px: 1, maxWidth: { xs: 140, sm: 180, md: 200 } }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {show.name}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {show.first_air_date?.split('-')[0] || 'N/A'}
                      </Typography>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Chip
                          label="Phim bộ"
                          size="small"
                          sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Navigation buttons */}
          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2,
              display: topTVShowsScrollPosition > 0 ? 'flex' : 'none'
            }}
            onClick={() => handleScroll('left')}
          >
            <NavigateBeforeIcon fontSize="large" />
          </IconButton>

          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2
            }}
            onClick={() => handleScroll('right')}
          >
            <NavigateNextIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>
    );
  };

  const renderRecentlyUpdatedSection = () => {
    const handleScroll = (direction) => {
      const container = recentlyUpdatedScrollRef.current;
      if (!container) return;

      const scrollAmount = 250; // Khoảng cách scroll mỗi lần nhấn
      const newPosition = direction === 'left'
        ? Math.max(0, recentlyUpdatedScrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, recentlyUpdatedScrollPosition + scrollAmount);

      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });

      setRecentlyUpdatedScrollPosition(newPosition);
    };

    return (
      <MuiContainer maxWidth="xl" sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 4,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Mới cập nhật hôm nay
        </Typography>

        <Box sx={{ position: 'relative' }}>
          {/* Scroll container */}
          <Box
            ref={recentlyUpdatedScrollRef}
            sx={{
              position: 'relative',
              overflowX: 'auto',
              pb: 4,
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ minWidth: 'max-content' }}
            >
              {recentlyUpdated.map((media, index) => (
                <Box
                  key={`${media.id}-${index}`}
                  component={Link}
                  to={routesGen.mediaDetail(media.media_type || tmdbConfigs.mediaType.movie, media.id)}
                  sx={{
                    position: 'relative',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.03)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={tmdbConfigs.posterPath(media.poster_path)}
                      alt={media.title || media.name}
                      sx={{
                        width: { xs: 140, sm: 180, md: 200 },
                        height: 'auto',
                        borderRadius: '12px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                      }}
                    />

                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                      }}
                    >
                      <Chip
                        label={media.updateType === "new" ? "Mới" : `Tập ${media.episodeNumber}`}
                        size="small"
                        color={media.updateType === "new" ? "primary" : "secondary"}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2, px: 1, maxWidth: { xs: 140, sm: 180, md: 200 } }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {media.title || media.name}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {(media.release_date || media.first_air_date)?.split('-')[0] || 'N/A'}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <StarIcon sx={{ color: '#FFD700', fontSize: '0.9rem' }} />
                        <Typography variant="caption" fontWeight={500}>
                          {media.vote_average?.toFixed(1)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Navigation buttons */}
          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2,
              display: recentlyUpdatedScrollPosition > 0 ? 'flex' : 'none'
            }}
            onClick={() => handleScroll('left')}
          >
            <NavigateBeforeIcon fontSize="large" />
          </IconButton>

          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2
            }}
            onClick={() => handleScroll('right')}
          >
            <NavigateNextIcon fontSize="large" />
          </IconButton>
        </Box>
      </MuiContainer>
    );
  };

  const renderRecommendedSection = () => {
    const handleScroll = (direction) => {
      const container = recommendedScrollRef.current;
      if (!container) return;

      const scrollAmount = 250; // Khoảng cách scroll mỗi lần nhấn
      const newPosition = direction === 'left'
        ? Math.max(0, recommendedScrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, recommendedScrollPosition + scrollAmount);

      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });

      setRecommendedScrollPosition(newPosition);
    };

    return (
      <MuiContainer maxWidth="xl" sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 4,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Đề xuất cho bạn
        </Typography>

        <Box sx={{ position: 'relative' }}>
          {/* Scroll container */}
          <Box
            ref={recommendedScrollRef}
            sx={{
              position: 'relative',
              overflowX: 'auto',
              pb: 4,
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ minWidth: 'max-content' }}
            >
              {recommended.map((media) => (
                <Box
                  key={media.id}
                  component={Link}
                  to={routesGen.mediaDetail(tmdbConfigs.mediaType.movie, media.id)}
                  sx={{
                    position: 'relative',
                    textDecoration: 'none',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.03)'
                    }
                  }}
                >
                  <Box
                    component="img"
                    src={tmdbConfigs.posterPath(media.poster_path)}
                    alt={media.title}
                    sx={{
                      width: { xs: 140, sm: 180, md: 200 },
                      height: 'auto',
                      borderRadius: '12px',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                    }}
                  />

                  <Box sx={{ mt: 2, px: 1, maxWidth: { xs: 140, sm: 180, md: 200 } }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {media.title}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {media.release_date?.split('-')[0] || 'N/A'}
                      </Typography>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <StarIcon sx={{ color: '#FFD700', fontSize: '0.9rem' }} />
                        <Typography variant="caption" fontWeight={500}>
                          {media.vote_average?.toFixed(1)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Navigation buttons */}
          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2,
              display: recommendedScrollPosition > 0 ? 'flex' : 'none'
            }}
            onClick={() => handleScroll('left')}
          >
            <NavigateBeforeIcon fontSize="large" />
          </IconButton>

          <IconButton
            sx={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              },
              zIndex: 2
            }}
            onClick={() => handleScroll('right')}
          >
            <NavigateNextIcon fontSize="large" />
          </IconButton>
        </Box>
      </MuiContainer>
    );
  };

  const renderComingSoonSection = () => {
    return (
      <MuiContainer maxWidth="xl" sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 4,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          Lịch chiếu sắp tới
        </Typography>

        <Grid container spacing={3}>
          {comingSoon.map((movie) => {
            // Tính số ngày còn lại đến ngày phát hành
            const releaseDate = new Date(movie.release_date);
            const today = new Date();
            const daysLeft = Math.ceil((releaseDate - today) / (1000 * 60 * 60 * 24));

            return (
              <Grid item xs={12} sm={6} md={4} lg={4} key={movie.id}>
                <Card
                  sx={{
                    display: 'flex',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 140 }}
                    image={tmdbConfigs.posterPath(movie.poster_path)}
                    alt={movie.title}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <CardContent sx={{ flex: '1 0 auto', p: 2 }}>
                      <Typography component="div" variant="h6" fontWeight={600}>
                        {movie.title}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Ra mắt: {new Date(movie.release_date).toLocaleDateString('vi-VN')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Chip
                          label={`${daysLeft} ngày nữa`}
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {movie.overview || "Chưa có thông tin chi tiết."}
                      </Typography>
                    </CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PlayArrowIcon />}
                        size="small"
                        sx={{ borderRadius: '12px', textTransform: 'none' }}
                      >
                        Xem ngay
                      </Button>
                      <Button
                        component={Link}
                        to={routesGen.mediaDetail(tmdbConfigs.mediaType.movie, movie.id)}
                        variant="text"
                        sx={{ ml: 'auto', textTransform: 'none' }}
                      >
                        Chi tiết
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </MuiContainer>
    );
  };

  const renderCountrySection = () => {
    return (
      <MuiContainer maxWidth="xl" sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 3,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          Phim nổi bật theo quốc gia
        </Typography>

        <Tabs
          value={selectedCountry}
          onChange={handleCountryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              minWidth: 100
            }
          }}
        >
          <Tab value="all" label="Tất cả" />
          <Tab value="vietnam" label="Việt Nam" />
          <Tab value="korea" label="Hàn Quốc" />
          <Tab value="us" label="Âu Mỹ" />
          <Tab value="japan" label="Nhật Bản" />
          <Tab value="china" label="Trung Quốc" />
        </Tabs>

        {/* Country movies carousel */}
        <Box sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          pb: 2,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 3 }
        }}>
          {countryMovies.length > 0 ? countryMovies.slice(0, 10).map((movie) => (
            <Box
              key={movie.id}
              component={Link}
              to={routesGen.mediaDetail('movie', movie.id)}
              sx={{
                minWidth: 180,
                textDecoration: 'none',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.03)' }
              }}
            >
              <Box
                component="img"
                src={tmdbConfigs.posterPath(movie.poster_path)}
                alt={movie.title}
                sx={{
                  width: 180,
                  borderRadius: 2,
                  boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  mt: 1,
                  fontWeight: 600,
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 180
                }}
              >
                {movie.title}
              </Typography>
            </Box>
          )) : (
            <Typography color="text.secondary">Đang tải...</Typography>
          )}
        </Box>
      </MuiContainer>
    );
  };

  const renderCollectionsSection = () => {
    return (
      <MuiContainer maxWidth="xl" sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            mb: 4,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          Bộ sưu tập theo chủ đề
        </Typography>

        <Grid container spacing={3}>
          {/* Marvel Universe */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              component={Link}
              to="/search?q=avengers"
              sx={{
                position: 'relative',
                height: { xs: 180, md: 240 },
                borderRadius: '24px',
                overflow: 'hidden',
                textDecoration: 'none',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  '& .MuiCardMedia-root': {
                    transform: 'scale(1.05)'
                  },
                  '& .overlay': {
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)'
                  }
                }
              }}
            >
              <CardMedia
                component="img"
                image={collectionImages.marvel ? tmdbConfigs.backdropPath(collectionImages.marvel) : 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg'}
                alt="Marvel Universe"
                sx={{
                  height: '100%',
                  transition: 'transform 0.6s ease'
                }}
              />
              <Box
                className="overlay"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
                  transition: 'all 0.3s ease'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 3,
                zIndex: 2
              }}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="white"
                  sx={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    mb: 1,
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Marvel Universe
                </Typography>
                <Typography
                  variant="body2"
                  color="white"
                  sx={{
                    opacity: 0.9,
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  20+ phim siêu anh hùng
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Phim Hàn Quốc */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              component={Link}
              to="/search?q=korean"
              sx={{
                position: 'relative',
                height: { xs: 180, md: 240 },
                borderRadius: '24px',
                overflow: 'hidden',
                textDecoration: 'none',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  '& .MuiCardMedia-root': {
                    transform: 'scale(1.05)'
                  },
                  '& .overlay': {
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)'
                  }
                }
              }}
            >
              <CardMedia
                component="img"
                image={collectionImages.korean ? tmdbConfigs.backdropPath(collectionImages.korean) : 'https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg'}
                alt="Phim Hàn Quốc"
                sx={{
                  height: '100%',
                  transition: 'transform 0.6s ease'
                }}
              />
              <Box
                className="overlay"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
                  transition: 'all 0.3s ease'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 3,
                zIndex: 2
              }}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="white"
                  sx={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    mb: 1,
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Phim Hàn Quốc
                </Typography>
                <Typography
                  variant="body2"
                  color="white"
                  sx={{
                    opacity: 0.9,
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Những tác phẩm đặc sắc
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Phim Kinh Dị */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              component={Link}
              to="/search?q=horror"
              sx={{
                position: 'relative',
                height: { xs: 180, md: 240 },
                borderRadius: '24px',
                overflow: 'hidden',
                textDecoration: 'none',
                boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  '& .MuiCardMedia-root': {
                    transform: 'scale(1.05)'
                  },
                  '& .overlay': {
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)'
                  }
                }
              }}
            >
              <CardMedia
                component="img"
                image={collectionImages.horror ? tmdbConfigs.backdropPath(collectionImages.horror) : 'https://image.tmdb.org/t/p/original/dLP7T9aVmv8ggp5Gm5xqGfJHefQ.jpg'}
                alt="Phim Kinh Dị"
                sx={{
                  height: '100%',
                  transition: 'transform 0.6s ease'
                }}
              />
              <Box
                className="overlay"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  top: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
                  transition: 'all 0.3s ease'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 3,
                zIndex: 2
              }}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="white"
                  sx={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    mb: 1,
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Phim Kinh Dị
                </Typography>
                <Typography
                  variant="body2"
                  color="white"
                  sx={{
                    opacity: 0.9,
                    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Những bộ phim rùng rợn nhất
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </MuiContainer>
    );
  };

  return (
    <Box sx={{ ...uiConfigs.style.mainContent }}>
      {/* Hero Slide */}
      <HeroSlide
        mediaType={tmdbConfigs.mediaType.movie}
        mediaCategory={tmdbConfigs.mediaCategory.popular}
      />

      <Container>
        {/* Tiếp tục xem */}
        <ContinueWatching />

        {/* Thể loại phim */}
        {renderGenresSection()}

        {/* Top 10 phim lẻ hôm nay */}
        {renderTopMoviesSection()}

        {/* Top 10 phim bộ hôm nay */}
        {renderTopTVShowsSection()}

        {/* Mới cập nhật hôm nay */}
        {renderRecentlyUpdatedSection()}

        {/* Đề xuất cho bạn */}
        {renderRecommendedSection()}

        {/* Lịch chiếu sắp tới */}
        {renderComingSoonSection()}

        {/* Phim theo quốc gia */}
        {renderCountrySection()}

        {/* Bộ sưu tập theo chủ đề */}
        {renderCollectionsSection()}
      </Container>
    </Box>
  );
};

export default HomePage;