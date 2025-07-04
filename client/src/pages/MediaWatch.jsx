import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Box, Typography, Paper, Grid, Stack, IconButton, Button, Avatar, TextField, Chip, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import SendIcon from "@mui/icons-material/Send";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import HLS from "hls.js";

import tmdbConfigs from "../api/configs/tmdb.configs";
import mediaApi from "../api/modules/media.api";
import favoriteApi from "../api/modules/favorite.api";
import { setGlobalLoading } from "../redux/features/globalLoadingSlice";
import { setAuthModalOpen } from "../redux/features/authModalSlice";
import { addFavorite, removeFavorite } from "../redux/features/userSlice";
import MediaSlide from "../components/common/MediaSlide";

const MediaWatch = () => {
  const { mediaType, mediaId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);

  const [media, setMedia] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [onRequest, setOnRequest] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      user: { displayName: "Nguyễn Văn A", username: "nguyenvana" },
      text: "Phim rất hay, đặc biệt là diễn xuất của các diễn viên chính!",
      timestamp: new Date(Date.now() - 86400000) // 1 ngày trước
    },
    {
      id: 2,
      user: { displayName: "Trần Thị B", username: "tranthib" },
      text: "Cốt truyện hấp dẫn, tôi rất thích những cảnh quay hoành tráng.",
      timestamp: new Date(Date.now() - 43200000) // 12 giờ trước
    }
  ]);

  // Lấy thông tin season và episode từ URL query params
  const queryParams = new URLSearchParams(location.search);
  const season = parseInt(queryParams.get('season') || '1');
  const episode = parseInt(queryParams.get('episode') || '1');

  // Kiểm tra xem có phải là Squid Game không
  const isSquidGame = mediaId === "93405"; // ID của Squid Game

  // Mô hình dữ liệu chi tiết cho Squid Game
  // Trong thực tế, dữ liệu này sẽ được lưu trong database và quản lý bởi admin
  const squidGameData = {
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
            hls_url: "https://vz-968cfbf9-496.b-cdn.net/e8d995ea-b56c-40d0-be54-711fb171a655/playlist.m3u8",
            air_date: "2021-09-17"
          },
          {
            episode_number: 2,
            name: "Địa Ngục",
            overview: "Người chơi phải đưa ra quyết định khó khăn sau khi trò chơi đầu tiên. Gi-hun và những người khác tìm cách đối phó với những gì đang chờ đợi họ.",
            runtime: 63,
            still_path: "/mGUjlV9fsXgwKYlqgwgvbv6QhCL.jpg",
            hls_url: "https://vz-968cfbf9-496.b-cdn.net/dfb71d2b-4afc-4758-b390-67b06e8ec4fe/playlist.m3u8",
            air_date: "2021-09-17"
          },
          {
            episode_number: 3,
            name: "Người đàn ông có chiếc ô",
            overview: "Một số người chơi tìm cách giành lợi thế trong trò chơi tiếp theo. Gi-hun đối mặt với kẻ thù cũ.",
            runtime: 54,
            still_path: "/squidgame3_ep3.jpg",
            hls_url: "https://vz-968cfbf9-496.b-cdn.net/36d30849-cb4e-445f-be93-1628c314a04e/playlist.m3u8",
            air_date: "2021-09-17"
          },
          {
            episode_number: 4,
            name: "Đừng chuyển động",
            overview: "Các đội hình thành cho trò chơi tiếp theo. Nhưng sự bất hòa và nghi ngờ đe dọa một số đội từ bên trong.",
            runtime: 55,
            still_path: "/squidgame3_ep4.jpg",
            hls_url: "https://vz-968cfbf9-496.b-cdn.net/c03cc24f-bf74-42af-b235-c0a9d324ec2e/playlist.m3u8",
            air_date: "2021-09-17"
          },
          {
            episode_number: 5,
            name: "Người công bằng",
            overview: "Gi-hun và nhóm của anh ta đối mặt với một thách thức khó khăn và một quyết định đạo đức. Cảnh sát Hwang Jun-ho tiếp tục tìm kiếm người anh trai mất tích của mình.",
            runtime: 52,
            still_path: "/squidgame3_ep5.jpg",
            hls_url: "https://vz-968cfbf9-496.b-cdn.net/46b01994-5f77-487c-b2ba-ee72dc1e96b0/playlist.m3u8",
            air_date: "2021-09-17"
          },
          {
            episode_number: 6,
            name: "Gganbu",
            overview: "Các cầu thủ kết đôi cho trò chơi tiếp theo. Nhưng đối tác lý tưởng phụ thuộc vào trò chơi. Trong khi đó, Jun-ho ẩn nấp, tiếp tục nhiệm vụ của mình.",
            runtime: 62,
            still_path: "/squidgame3_ep6.jpg",
            hls_url: "https://vz-968cfbf9-496.b-cdn.net/ee2b0be9-71ff-4be0-a8b9-0028f8516f3e/playlist.m3u8",
            air_date: "2021-09-17"
          }
        ]
      }
    ]
  };

  // Danh sách các phần và tập của Squid Game
  const squidGameSeasons = squidGameData.seasons.map(season => ({
    season: season.season_number,
    episodes: season.episodes.length
  }));

  // Lấy thông tin tập hiện tại
  const getCurrentEpisodeData = () => {
    if (!isSquidGame) return null;
    
    const currentSeason = squidGameData.seasons.find(s => s.season_number === season);
    if (!currentSeason) return null;
    
    const currentEpisode = currentSeason.episodes.find(e => e.episode_number === episode);
    return currentEpisode;
  };

  // Lấy URL video cho tập hiện tại
  const getCurrentHlsUrl = () => {
    const episodeData = getCurrentEpisodeData();
    return episodeData ? episodeData.hls_url : null;
  };

  // Video player ref
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const getMedia = async () => {
      dispatch(setGlobalLoading(true));
      const { response, err } = await mediaApi.getDetail({ mediaType, mediaId });
      dispatch(setGlobalLoading(false));

      if (response) {
        setMedia(response);
        setIsFavorite(response.isFavorite);
        
        if (isSquidGame) {
          // Sử dụng dữ liệu từ mô hình quản lý
          const hlsUrl = getCurrentHlsUrl();
          if (hlsUrl) {
            setCurrentVideo({
              key: `squid_game_s${season}_e${episode}`,
              name: `Squid Game Phần ${season} Tập ${episode}`,
              type: "HLS",
              site: "Custom",
              isHlsVideo: true,
              hlsUrl: hlsUrl
            });
          }
        } else if (response.videos && response.videos.results.length > 0) {
          const trailer = response.videos.results.find(video => video.type === "Trailer") || response.videos.results[0];
          setCurrentVideo(trailer);
        }
      }

      if (err) toast.error(err.message);
    };

    getMedia();
  }, [mediaType, mediaId, dispatch, isSquidGame, season, episode]);

  // Xử lý video HLS
  useEffect(() => {
    if (currentVideo?.isHlsVideo && videoRef.current) {
      const video = videoRef.current;
      const hlsUrl = currentVideo.hlsUrl;
      
      console.log("Attempting to play HLS video:", hlsUrl);
      
      // Destroy any existing hls instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // Safari supports HLS natively
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("Using native HLS support");
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(e => console.log("Play prevented:", e));
        });
      } 
      // For other browsers, use hls.js
      else if (HLS.isSupported()) {
        console.log("Using HLS.js");
        const hls = new HLS({
          debug: true,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        
        hlsRef.current = hls;
        
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        
        hls.on(HLS.Events.MEDIA_ATTACHED, () => {
          console.log("HLS media attached");
        });
        
        hls.on(HLS.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed");
          video.play().catch(e => console.log("Play prevented:", e));
        });
        
        hls.on(HLS.Events.ERROR, (event, data) => {
          console.log("HLS error:", data);
          if (data.fatal) {
            switch (data.type) {
              case HLS.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case HLS.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal HLS error:', data);
                hls.destroy();
                break;
            }
          }
        });
      } else {
        console.error("Browser does not support HLS");
        toast.error("Trình duyệt của bạn không hỗ trợ phát video HLS");
      }
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentVideo]);

  const renderFavoriteButton = () => {
    if (!user) {
      return (
        <Button
          variant="contained"
          startIcon={<FavoriteBorderOutlinedIcon />}
          onClick={() => dispatch(setAuthModalOpen(true))}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          Đăng nhập để thêm vào yêu thích
        </Button>
      );
    }

    return (
      <LoadingButton
        variant={isFavorite ? "contained" : "outlined"}
        startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderOutlinedIcon />}
        onClick={onFavoriteClick}
        sx={{
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {isFavorite ? "Đã yêu thích" : "Thêm vào yêu thích"}
      </LoadingButton>
    );
  };

  const onFavoriteClick = async () => {
    if (!user) return dispatch(setAuthModalOpen(true));

    if (isFavorite) {
      const { response, err } = await favoriteApi.remove({ favoriteId: media.id });

      if (err) toast.error(err.message);
      if (response) {
        dispatch(removeFavorite({ mediaId: media.id }));
        setIsFavorite(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      }
    } else {
      const { response, err } = await favoriteApi.add({
        mediaId: media.id,
        mediaTitle: media.title || media.name,
        mediaType: mediaType,
        mediaPoster: media.poster_path,
        mediaRate: media.vote_average
      });

      if (err) toast.error(err.message);
      if (response) {
        dispatch(addFavorite(response));
        setIsFavorite(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const goBack = () => {
    navigate(`/${mediaType}/${mediaId}`);
  };

  const handleCommentSubmit = () => {
    if (!user) {
      dispatch(setAuthModalOpen(true));
      return;
    }
    
    if (!commentText.trim()) return;
    
    const newComment = {
      id: comments.length + 1,
      user: { displayName: user.displayName, username: user.username },
      text: commentText,
      timestamp: new Date()
    };
    
    setComments([...comments, newComment]);
    setCommentText("");
    toast.success("Bình luận của bạn đã được đăng");
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  // Xử lý chọn phần phim
  const handleSeasonChange = (e) => {
    const newSeason = e.target.value;
    navigate(`/${mediaType}/${mediaId}/watch?season=${newSeason}&episode=1`);
  };

  // Xử lý chọn tập phim
  const handleEpisodeChange = (episodeNum) => {
    navigate(`/${mediaType}/${mediaId}/watch?season=${season}&episode=${episodeNum}`);
  };

  // Trong phần hiển thị thông tin tập phim
  const renderEpisodeInfo = () => {
    if (!isSquidGame) return null;
    
    const episodeData = getCurrentEpisodeData();
    if (!episodeData) return null;
    
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          {episodeData.name}
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {episodeData.air_date}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {episodeData.runtime} phút
          </Typography>
        </Stack>
        
        <Typography variant="body1" sx={{ mt: 2 }}>
          {episodeData.overview}
        </Typography>
      </Box>
    );
  };

  return (
    <>
      {media && (
        <Box sx={{
          position: "relative",
          minHeight: "100vh",
          bgcolor: "background.default",
          pt: { xs: "56px", sm: "64px" } // Thêm padding-top để tránh header đè lên nội dung
        }}>
          {/* Video Player Section */}
          <Paper 
            sx={{ 
              position: "relative",
              width: "100%", 
              height: { xs: "40vh", sm: "60vh", md: "80vh" },
              bgcolor: "#000",
              overflow: "hidden",
              transition: "all 0.3s ease",
              borderRadius: 0,
              boxShadow: "none"
            }}
          >
            {currentVideo && (
              <Box 
                sx={{ 
                  width: "100%", 
                  height: "100%", 
                  position: "relative", 
                  borderRadius: 0, 
                  overflow: "hidden",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {currentVideo.isHlsVideo ? (
                  // Sử dụng HTML5 video player với hỗ trợ HLS.js
                  <video
                    ref={videoRef}
                    controls
                    playsInline
                    style={{ 
                      width: '100%',
                      height: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                  >
                    Your browser does not support HTML5 video.
                  </video>
                ) : (
                  // YouTube player cho các video khác
                  <iframe
                    src={`${tmdbConfigs.youtubePath(currentVideo.key)}?autoplay=1&mute=0`}
                    title={currentVideo.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ 
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%", 
                      height: "100%", 
                      border: "none"
                    }}
                  ></iframe>
                )}
              </Box>
            )}
          </Paper>
          
          {/* Episode Selection */}
          {isSquidGame && (
            <Box sx={{ 
              py: 3, 
              px: { xs: 2, md: 4 }, 
              bgcolor: 'background.paper',
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4} md={3}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Phần</InputLabel>
                    <Select
                      value={season}
                      onChange={handleSeasonChange}
                      label="Phần"
                    >
                      {squidGameSeasons.map((s) => (
                        <MenuItem key={s.season} value={s.season}>
                          Phần {s.season}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={8} md={9}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.from({ length: squidGameSeasons.find(s => s.season === season)?.episodes || 0 }, (_, i) => (
                      <Chip
                        key={i}
                        label={`Tập ${i + 1}`}
                        onClick={() => handleEpisodeChange(i + 1)}
                        variant={episode === i + 1 ? "filled" : "outlined"}
                        color={episode === i + 1 ? "primary" : "default"}
                        sx={{ 
                          borderRadius: '8px',
                          fontWeight: episode === i + 1 ? 'bold' : 'normal'
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Episode Info */}
          {isSquidGame && (
            <Box sx={{ 
              py: 3, 
              px: { xs: 2, md: 4 },
              bgcolor: 'background.paper'
            }}>
              {renderEpisodeInfo()}
            </Box>
          )}
          
          {/* Media Info */}
          <Box sx={{ 
            p: { xs: 2, md: 4 }, 
            bgcolor: 'background.paper',
            borderRadius: '16px',
            mx: { xs: 2, md: 4 },
            mt: { xs: 2, md: 4 },
            boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {media && (
              <>
                <Typography variant="h4" fontWeight="700" sx={{ 
                  mb: 2,
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}>
                  {media.title || media.name}
                </Typography>
                
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthOutlinedIcon fontSize="small" />
                    <Typography variant="body1" sx={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {media.release_date?.split("-")[0] || media.first_air_date?.split("-")[0]}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeOutlinedIcon fontSize="small" />
                    <Typography variant="body1" sx={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {media.runtime || media.episode_run_time?.[0] || "N/A"} phút
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FavoriteIcon fontSize="small" color={isFavorite ? "error" : "inherit"} />
                    <Typography variant="body1" sx={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                      {media.vote_count} lượt thích
                    </Typography>
                  </Stack>
                </Stack>
                
                <Typography variant="body1" sx={{ 
                  mb: 3,
                  fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
                  lineHeight: 1.6
                }}>
                  {media.overview}
                </Typography>
                
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                  {renderFavoriteButton()}
                </Stack>
                
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                  {media.genres.map((genre) => (
                    <Chip
                      key={genre.id}
                      label={genre.name}
                      variant="outlined"
                      sx={{ 
                        borderRadius: '16px',
                        fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
                      }}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Box>
          
          {/* Có thể bạn cũng thích */}
          <Box sx={{ 
            p: { xs: 2, md: 4 }, 
            bgcolor: 'background.paper',
            borderRadius: '16px',
            mx: { xs: 2, md: 4 },
            mt: { xs: 2, md: 4 },
            mb: { xs: 2, md: 4 },
            boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h5" fontWeight="700" sx={{ 
              mb: 3,
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              Có thể bạn cũng thích
            </Typography>
            
            {media && (
              <MediaSlide 
                mediaType={mediaType}
                mediaCategory={tmdbConfigs.mediaCategory.similar}
                mediaId={media.id}
              />
            )}
          </Box>
          
          {/* Comments */}
          <Box sx={{ 
            p: { xs: 2, md: 4 }, 
            bgcolor: 'background.paper',
            borderRadius: '16px',
            mx: { xs: 2, md: 4 },
            mb: { xs: 4, md: 6 },
            boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h5" fontWeight="700" sx={{ 
              mb: 3,
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              Bình luận
            </Typography>
            
            {user && (
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Viết bình luận của bạn..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  multiline
                  rows={3}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
                
                <Button 
                  variant="contained" 
                  startIcon={<SendIcon />}
                  onClick={handleCommentSubmit}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  Gửi bình luận
                </Button>
              </Box>
            )}
            
            {/* Comment List */}
            <Stack spacing={2}>
              {comments.map(comment => (
                <Paper key={comment.id} sx={{ 
                  p: 2, 
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: theme => theme.palette.primary.main }}>
                      {comment.user.displayName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium" sx={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                          {comment.user.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                          {formatTimeAgo(comment.timestamp)}
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        {comment.text}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MediaWatch; 