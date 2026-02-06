import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Button, Chip, Divider, Stack, Typography, useTheme, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Autoplay, EffectFade, Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { toast } from "react-toastify";

import { setGlobalLoading } from "../../redux/features/globalLoadingSlice";
import { routesGen } from "../../routes/routes";

import uiConfigs from "../../configs/ui.configs";

import CircularRate from "./CircularRate";

import tmdbConfigs from "../../api/configs/tmdb.configs";
import genreApi from "../../api/modules/genre.api";
import mediaApi from "../../api/modules/media.api";

const HeroSlide = ({ mediaType, mediaCategory }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const getMedias = async () => {
      const { response, err } = await mediaApi.getList({
        mediaType,
        mediaCategory,
        page: 1
      });

      if (response) setMovies(response.results.slice(0, 5));
      if (err) toast.error(err.message);
      dispatch(setGlobalLoading(false));
    };

    const getGenres = async () => {
      dispatch(setGlobalLoading(true));
      const { response, err } = await genreApi.getList({ mediaType });

      if (response) {
        setGenres(response.genres);
        getMedias();
      }
      if (err) {
        toast.error(err.message);
        setGlobalLoading(false);
      }
    };

    getGenres();
  }, [mediaType, mediaCategory, dispatch]);

  return (
    <Box sx={{
      position: "relative",
      color: "primary.contrastText",
      width: "100vw",
      marginLeft: "calc(-50vw + 50%)",
      marginRight: "calc(-50vw + 50%)",
      "&::before": {
        content: '""',
        width: "100%",
        height: "30%",
        position: "absolute",
        bottom: 0,
        left: 0,
        zIndex: 2,
        pointerEvents: "none",
        ...uiConfigs.style.gradientBgImage[theme.palette.mode]
      }
    }}>
      <Swiper
        grabCursor={true}
        loop={true}
        modules={[Autoplay, EffectFade, Navigation]}
        style={{ width: "100%", height: "max-content" }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false
        }}
        effect="fade"
        navigation={{
          prevEl: '.swiper-button-prev',
          nextEl: '.swiper-button-next'
        }}
      >
        {/* Custom Navigation Buttons */}
        <Box
          className="swiper-button-prev"
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '80px',
            height: '100%',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            background: 'linear-gradient(to right, rgba(0,0,0,0.5), transparent)',
            cursor: 'pointer',
            '&:hover': {
              opacity: 1
            },
            '&::after': {
              content: '"❮"',
              fontSize: '2rem',
              color: 'white',
              fontWeight: 'bold'
            }
          }}
        />
        <Box
          className="swiper-button-next"
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '80px',
            height: '100%',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            background: 'linear-gradient(to left, rgba(0,0,0,0.5), transparent)',
            cursor: 'pointer',
            '&:hover': {
              opacity: 1
            },
            '&::after': {
              content: '"❯"',
              fontSize: '2rem',
              color: 'white',
              fontWeight: 'bold'
            }
          }}
        />
        {movies.map((movie, index) => (
          <SwiperSlide key={index}>
            <Box sx={{
              paddingTop: {
                xs: "130%",
                sm: "80%",
                md: "60%",
                lg: "45%"
              },
              backgroundPosition: "top",
              backgroundSize: "cover",
              backgroundImage: `url(${tmdbConfigs.backdropPath(movie.backdrop_path || movie.poster_path)})`,
              position: "relative"
            }}>
              {/* Overlay gradient */}
              <Box sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                ...uiConfigs.style.horizontalGradientBgImage[theme.palette.mode]
              }} />

              {/* Content */}
              <Container maxWidth="xl" sx={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
                paddingX: { xs: 4, sm: 8, md: 6, lg: 8 }
              }}>
                <Box sx={{
                  width: { xs: "100%", sm: "80%", md: "50%", lg: "40%" },
                  textAlign: { xs: "center", md: "left" }
                }}>
                  <Stack spacing={{ xs: 2, md: 4 }} direction="column">
                    {/* Title */}
                    <Typography
                      variant="h2"
                      fontSize={{ xs: "2rem", sm: "3rem", md: "3.5rem", lg: "4.5rem" }}
                      fontWeight="700"
                      sx={{
                        ...uiConfigs.style.typoLines(2, { xs: "center", md: "left" }),
                        textShadow: "0 2px 5px rgba(0,0,0,0.3)",
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      {movie.title || movie.name}
                    </Typography>

                    {/* Info */}
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ xs: "center", md: "flex-start" }}>
                      {/* Rating */}
                      <CircularRate value={movie.vote_average} />

                      <Divider orientation="vertical" flexItem sx={{ height: 24 }} />

                      {/* Year */}
                      <Typography variant="body1" fontWeight={500}>
                        {(movie.release_date || movie.first_air_date || "").split("-")[0]}
                      </Typography>

                      <Divider orientation="vertical" flexItem sx={{ height: 24 }} />

                      {/* Media type */}
                      <Chip
                        variant="outlined"
                        label={mediaType === tmdbConfigs.mediaType.movie ? "Phim lẻ" : "Phim bộ"}
                        size="small"
                        sx={{
                          borderColor: "text.primary",
                          color: "text.primary",
                          fontWeight: 500
                        }}
                      />
                    </Stack>

                    {/* Genres */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: "center", md: "flex-start" }}>
                      {[...movie.genre_ids].splice(0, 3).map((genreId, index) => {
                        const genre = genres.find(e => e.id === genreId);
                        if (!genre) return null;
                        return (
                          <Chip
                            key={index}
                            variant="filled"
                            color="primary"
                            label={genre.name}
                            sx={{
                              marginBottom: 1,
                              fontWeight: 500,
                              fontSize: "0.85rem"
                            }}
                          />
                        );
                      })}
                    </Stack>

                    {/* Overview */}
                    <Typography
                      variant="body1"
                      sx={{
                        ...uiConfigs.style.typoLines(3, { xs: "center", md: "left" }),
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        opacity: 0.9,
                        fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    >
                      {movie.overview}
                    </Typography>

                    {/* Buttons */}
                    <Stack
                      direction="row"
                      spacing={2}
                      justifyContent={{ xs: "center", md: "flex-start" }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<PlayArrowIcon />}
                        component={Link}
                        to={routesGen.mediaDetail(mediaType, movie.id)}
                        sx={{
                          px: 4,
                          py: 1,
                          fontWeight: 600,
                          fontSize: "1rem",
                          borderRadius: 2
                        }}
                      >
                        Xem ngay
                      </Button>

                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<InfoOutlinedIcon />}
                        component={Link}
                        to={routesGen.mediaDetail(mediaType, movie.id)}
                        sx={{
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          fontSize: "1rem",
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                          }
                        }}
                      >
                        Chi tiết
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Container>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default HeroSlide;