import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShareIcon from "@mui/icons-material/Share";
import StarIcon from "@mui/icons-material/Star";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { LoadingButton } from "@mui/lab";
import { Box, Button, Chip, Divider, Stack, Typography, Grid, Container as MuiContainer, Paper, useTheme, Avatar, Menu, MenuItem, ListItemText } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import CircularRate from "../components/common/CircularRate";
import Container from "../components/common/Container";
import ImageHeader from "../components/common/ImageHeader";

import uiConfigs from "../configs/ui.configs";
import tmdbConfigs from "../api/configs/tmdb.configs";
import mediaApi from "../api/modules/media.api";
import favoriteApi from "../api/modules/favorite.api";

import { setGlobalLoading } from "../redux/features/globalLoadingSlice";
import { setAuthModalOpen } from "../redux/features/authModalSlice";
import { addFavorite, removeFavorite } from "../redux/features/userSlice";

import CastSlide from "../components/common/CastSlide";
import MediaVideosSlide from "../components/common/MediaVideosSlide";
import BackdropSlide from "../components/common/BackdropSlide";
import PosterSlide from "../components/common/PosterSlide";
import RecommendSlide from "../components/common/RecommendSlide";
import MediaSlide from "../components/common/MediaSlide";
import MediaReview from "../components/common/MediaReview";

const MediaDetail = () => {
  const { mediaType, mediaId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { user, listFavorites } = useSelector((state) => state.user);

  const [media, setMedia] = useState();
  const [isFavorite, setIsFavorite] = useState(false);
  const [onRequest, setOnRequest] = useState(false);
  const [genres, setGenres] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodeMenuAnchorEl, setEpisodeMenuAnchorEl] = useState(null);

  const dispatch = useDispatch();

  const videoRef = useRef(null);

  // Kiểm tra xem phim có nhiều phần hay không
  const hasMultipleSeasons = mediaType === tmdbConfigs.mediaType.tv && media?.number_of_seasons > 1;
  const isSquidGame = media?.id === 93405; // ID của Squid Game

  useEffect(() => {
    window.scrollTo(0, 0);
    const getMedia = async () => {
      dispatch(setGlobalLoading(true));
      const { response, err } = await mediaApi.getDetail({ mediaType, mediaId });
      dispatch(setGlobalLoading(false));

      if (response) {
        setMedia(response);
        setIsFavorite(response.isFavorite);
        setGenres(response.genres.splice(0, 2));

        // Nếu là phim bộ, thiết lập danh sách mùa và tập
        if (mediaType === tmdbConfigs.mediaType.tv) {
          const seasonsList = [];
          for (let i = 1; i <= response.number_of_seasons; i++) {
            seasonsList.push({
              season_number: i,
              name: `Phần ${i}`
            });
          }
          setSeasons(seasonsList);

          // Thiết lập danh sách tập cho mùa đầu tiên
          if (response.seasons && response.seasons.length > 0) {
            const firstSeason = response.seasons.find(s => s.season_number === 1) || response.seasons[0];
            const episodesList = [];
            for (let i = 1; i <= firstSeason.episode_count; i++) {
              episodesList.push({
                episode_number: i,
                name: `Tập ${i}`
              });
            }
            setEpisodes(episodesList);
          }
        }
      }

      if (err) toast.error(err.message);
    };

    getMedia();
  }, [mediaType, mediaId, dispatch]);

  const onFavoriteClick = async () => {
    if (!user) return dispatch(setAuthModalOpen(true));

    if (onRequest) return;

    if (isFavorite) {
      onRemoveFavorite();
      return;
    }

    setOnRequest(true);

    const body = {
      mediaId: media.id,
      mediaTitle: media.title || media.name,
      mediaType: mediaType,
      mediaPoster: media.poster_path,
      mediaRate: media.vote_average
    };

    const { response, err } = await favoriteApi.add(body);

    setOnRequest(false);

    if (err) toast.error(err.message);
    if (response) {
      dispatch(addFavorite(response));
      setIsFavorite(true);
      toast.success("Đã thêm vào mục yêu thích");
    }
  };

  const onRemoveFavorite = async () => {
    if (onRequest) return;
    setOnRequest(true);

    const favorite = listFavorites.find(e => e.mediaId.toString() === media.id.toString());

    const { response, err } = await favoriteApi.remove({ favoriteId: favorite.id });

    setOnRequest(false);

    if (err) toast.error(err.message);
    if (response) {
      dispatch(removeFavorite(favorite));
      setIsFavorite(false);
      toast.success("Đã xóa khỏi mục yêu thích");
    }
  };

  const onWatchClick = () => {
    if (mediaType === tmdbConfigs.mediaType.tv) {
      navigate(`/${mediaType}/${mediaId}/watch?season=${selectedSeason}&episode=${selectedEpisode}`);
    } else {
      navigate(`/${mediaType}/${mediaId}/watch`);
    }
  };

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleSeasonMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSeasonMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSeasonSelect = (seasonNumber) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(1); // Reset episode selection when changing season

    // Update episodes list for the selected season
    if (media?.seasons) {
      const season = media.seasons.find(s => s.season_number === seasonNumber);
      if (season) {
        const episodesList = [];
        for (let i = 1; i <= season.episode_count; i++) {
          episodesList.push({
            episode_number: i,
            name: `Tập ${i}`
          });
        }
        setEpisodes(episodesList);
      }
    }

    handleSeasonMenuClose();
  };

  const handleEpisodeMenuClick = (event) => {
    setEpisodeMenuAnchorEl(event.currentTarget);
  };

  const handleEpisodeMenuClose = () => {
    setEpisodeMenuAnchorEl(null);
  };

  const handleEpisodeSelect = (episodeNumber) => {
    setSelectedEpisode(episodeNumber);
    handleEpisodeMenuClose();
  };

  return (
    media ? (
      <>
        {/* Hero section with backdrop */}
        <Box sx={{
          position: "relative",
          height: { xs: "70vh", md: "80vh", lg: "90vh" },
          width: "100%",
          overflow: "hidden"
        }}>
          {/* Background image */}
          <Box sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${tmdbConfigs.backdropPath(media.backdrop_path || media.poster_path)})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, ${theme.palette.background.default} 100%)`
            }
          }} />

          {/* Content overlay */}
          <MuiContainer maxWidth="xl" sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "flex-end",
            paddingBottom: { xs: "2rem", md: "4rem" }
          }}>
            <Grid container spacing={4} alignItems="flex-end">
              {/* Poster */}
              <Grid item xs={12} sm={5} md={4} lg={3}>
                <Box sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 5px 30px rgba(0,0,0,0.3)",
                  position: "relative",
                  transformOrigin: "bottom",
                  transform: { xs: "translateY(30%)", sm: "translateY(25%)" }
                }}>
                  <Box
                    component="img"
                    src={tmdbConfigs.posterPath(media.poster_path || media.backdrop_path)}
                    alt={media.title || media.name}
                    sx={{
                      width: "100%",
                      display: "block",
                      objectFit: "cover",
                      aspectRatio: "2/3"
                    }}
                  />
                </Box>
              </Grid>

              {/* Movie info */}
              <Grid item xs={12} sm={7} md={8} lg={9}>
                <Stack spacing={2}>
                  {/* Title */}
                  <Typography
                    variant="h2"
                    fontWeight="700"
                    sx={{
                      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                      fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem", lg: "3.5rem" },
                      textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                      color: "#fff"
                    }}
                  >
                    {media.title || media.name}
                  </Typography>

                  {/* Year, runtime, rating */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                      label={mediaType === tmdbConfigs.mediaType.movie ? "Phim lẻ" : "Phim bộ"}
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: "#fff",
                        fontWeight: 600,
                        borderRadius: 1,
                        fontSize: "0.75rem"
                      }}
                    />

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        fontSize: "0.9rem",
                        fontWeight: 500
                      }}
                    >
                      <CalendarTodayOutlinedIcon fontSize="small" />
                      {(media.release_date || media.first_air_date || "").split("-")[0]}
                    </Typography>

                    {media.runtime && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          fontSize: "0.9rem",
                          fontWeight: 500
                        }}
                      >
                        <AccessTimeOutlinedIcon fontSize="small" />
                        {formatRuntime(media.runtime)}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <StarIcon sx={{ color: "#FFD700", fontSize: "1.2rem" }} />
                      <Typography
                        variant="body2"
                        fontWeight="600"
                        sx={{ color: "#fff" }}
                      >
                        {media.vote_average.toFixed(1)}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Genres */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                    {media.genres.map((genre, index) => (
                      <Chip
                        key={index}
                        label={genre.name}
                        size="small"
                        sx={{
                          borderRadius: 1,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          backdropFilter: 'blur(10px)',
                          marginBottom: 1
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </MuiContainer>
        </Box>

        {/* Main content */}
        <MuiContainer maxWidth="xl" sx={{ pt: { xs: 6, sm: 8 }, pb: 6 }}>
          <Grid container spacing={4}>
            {/* Main info column */}
            <Grid item xs={12} sm={7} md={8} lg={9} order={{ xs: 2, sm: 1 }}>
              {/* Overview */}
              <Typography
                variant="h5"
                fontWeight="600"
                sx={{
                  mb: 2,
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Nội dung phim
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  color: "text.primary",
                  lineHeight: 1.8,
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {media.overview}
              </Typography>

              {/* Buttons */}
              <Stack direction="row" spacing={2} sx={{ mb: 5 }}>
                {hasMultipleSeasons || isSquidGame ? (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrowIcon />}
                      onClick={onWatchClick}
                      sx={{
                        px: 3,
                        py: 1.2,
                        fontWeight: 600,
                        fontSize: "1rem",
                        borderRadius: 2,
                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                      }}
                    >
                      Xem phim
                    </Button>

                    {/* Season selector */}
                    <Button
                      variant="outlined"
                      endIcon={<KeyboardArrowDownIcon />}
                      onClick={handleSeasonMenuClick}
                      sx={{
                        px: 2,
                        py: 1.2,
                        fontWeight: 500,
                        borderRadius: 2
                      }}
                    >
                      {isSquidGame ? (selectedSeason === 1 ? "Phần 3" : "Phần 2") : `Phần ${selectedSeason}`}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleSeasonMenuClose}
                    >
                      {isSquidGame ? (
                        [1, 2, 3].map((season) => (
                          <MenuItem
                            key={season}
                            onClick={() => handleSeasonSelect(season)}
                            selected={selectedSeason === season}
                          >
                            <ListItemText>Phần {season}</ListItemText>
                          </MenuItem>
                        ))
                      ) : (
                        seasons.map((season) => (
                          <MenuItem
                            key={season.season_number}
                            onClick={() => handleSeasonSelect(season.season_number)}
                            selected={selectedSeason === season.season_number}
                          >
                            <ListItemText>{season.name}</ListItemText>
                          </MenuItem>
                        ))
                      )}
                    </Menu>

                    {/* Episode selector */}
                    <Button
                      variant="outlined"
                      endIcon={<KeyboardArrowDownIcon />}
                      onClick={handleEpisodeMenuClick}
                      sx={{
                        px: 2,
                        py: 1.2,
                        fontWeight: 500,
                        borderRadius: 2
                      }}
                    >
                      Tập {selectedEpisode}
                    </Button>
                    <Menu
                      anchorEl={episodeMenuAnchorEl}
                      open={Boolean(episodeMenuAnchorEl)}
                      onClose={handleEpisodeMenuClose}
                      sx={{
                        maxHeight: '300px'
                      }}
                    >
                      {episodes.map((episode) => (
                        <MenuItem
                          key={episode.episode_number}
                          onClick={() => handleEpisodeSelect(episode.episode_number)}
                          selected={selectedEpisode === episode.episode_number}
                        >
                          <ListItemText>{episode.name}</ListItemText>
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrowIcon />}
                    onClick={onWatchClick}
                    sx={{
                      px: 4,
                      py: 1.2,
                      fontWeight: 600,
                      fontSize: "1rem",
                      borderRadius: 2,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                    }}
                  >
                    Xem phim
                  </Button>
                )}

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={isFavorite ? <FavoriteIcon color="primary" /> : <FavoriteBorderOutlinedIcon />}
                  onClick={onFavoriteClick}
                  sx={{
                    px: 3,
                    py: 1.2,
                    fontWeight: 500,
                    borderRadius: 2
                  }}
                >
                  {isFavorite ? "Đã thích" : "Yêu thích"}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ShareIcon />}
                  sx={{
                    px: 3,
                    py: 1.2,
                    fontWeight: 500,
                    borderRadius: 2
                  }}
                >
                  Chia sẻ
                </Button>
              </Stack>

              {/* Cast */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  sx={{
                    mb: 3,
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Diễn viên
                </Typography>
                <CastSlide casts={media.credits.cast} />
              </Box>

              {/* Videos */}
              <Box ref={videoRef} sx={{ mb: 5 }}>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  sx={{
                    mb: 3,
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Trailer & Video
                </Typography>
                <MediaVideosSlide videos={[...media.videos.results].splice(0, 5)} />
              </Box>

              {/* Media reviews */}
              <Box sx={{ mb: 5 }}>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  sx={{
                    mb: 3,
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Đánh giá từ người xem
                </Typography>
                <MediaReview reviews={media.reviews} media={media} mediaType={mediaType} />
              </Box>
            </Grid>

            {/* Side info column */}
            <Grid item xs={12} sm={5} md={4} lg={3} order={{ xs: 1, sm: 2 }}>
              <Paper sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 4px 20px rgba(0,0,0,0.5)'
                  : '0 4px 20px rgba(0,0,0,0.1)',
                mb: 4
              }}>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  sx={{
                    mb: 2,
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Thông tin chi tiết
                </Typography>

                <Stack spacing={2} divider={<Divider flexItem />}>
                  {/* Original title */}
                  {media.original_title !== media.title && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Tên gốc
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {media.original_title}
                      </Typography>
                    </Box>
                  )}

                  {/* Status */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Trạng thái
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {media.status === "Released" ? "Đã phát hành" : media.status}
                    </Typography>
                  </Box>

                  {/* Release date */}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Ngày phát hành
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(media.release_date || media.first_air_date).toLocaleDateString("vi-VN")}
                    </Typography>
                  </Box>

                  {/* Language */}
                  {media.spoken_languages && media.spoken_languages.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Ngôn ngữ
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {media.spoken_languages.map(lang => lang.name).join(", ")}
                      </Typography>
                    </Box>
                  )}

                  {/* Production countries */}
                  {media.production_countries && media.production_countries.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Quốc gia
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {media.production_countries.map(country => country.name).join(", ")}
                      </Typography>
                    </Box>
                  )}

                  {/* Budget and revenue for movies */}
                  {mediaType === tmdbConfigs.mediaType.movie && media.budget > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Ngân sách
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(media.budget)}
                      </Typography>
                    </Box>
                  )}

                  {mediaType === tmdbConfigs.mediaType.movie && media.revenue > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Doanh thu
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(media.revenue)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>

              {/* Production companies */}
              {media.production_companies && media.production_companies.length > 0 && (
                <Paper sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0,0,0,0.5)'
                    : '0 4px 20px rgba(0,0,0,0.1)',
                }}>
                  <Typography
                    variant="h6"
                    fontWeight="600"
                    sx={{
                      mb: 2,
                      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    Nhà sản xuất
                  </Typography>

                  <Stack spacing={2}>
                    {media.production_companies.slice(0, 3).map((company, index) => (
                      <Stack key={index} direction="row" spacing={2} alignItems="center">
                        {company.logo_path ? (
                          <Box
                            component="img"
                            src={tmdbConfigs.posterPath(company.logo_path)}
                            alt={company.name}
                            sx={{ width: 60, height: 30, objectFit: "contain" }}
                          />
                        ) : (
                          <Box sx={{ width: 60, height: 30, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "background.paper", borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">No logo</Typography>
                          </Box>
                        )}
                        <Typography variant="body1">{company.name}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Grid>
          </Grid>

          {/* Recommendations */}
          <Box sx={{ mt: 6 }}>
            <Typography
              variant="h5"
              fontWeight="600"
              sx={{
                mb: 3,
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              Có thể bạn cũng thích
            </Typography>
            {media.recommend.length > 0 ? (
              <RecommendSlide medias={media.recommend} mediaType={mediaType} />
            ) : (
              <MediaSlide
                mediaType={mediaType}
                mediaCategory={tmdbConfigs.mediaCategory.top_rated}
              />
            )}
          </Box>
        </MuiContainer>
      </>
    ) : null
  );
};

export default MediaDetail;