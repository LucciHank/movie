import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import LaunchIcon from "@mui/icons-material/Launch";
import Hls from "hls.js";

import mediaApi from "../api/modules/media.api";
import watchSourceApi from "../api/modules/watchSource.api";
import tmdbConfigs from "../api/configs/tmdb.configs";
import { setGlobalLoading } from "../redux/features/globalLoadingSlice";
import { useDispatch } from "react-redux";
import MediaSlide from "../components/common/MediaSlide";
import analyticsApi from "../api/modules/analytics.api";

// Generate source label - hide provider names for privacy
const getSourceLabel = (source, index) => {
  const quality = source.quality && source.quality !== "unknown" ? source.quality : "HD";

  // For torrent sources, show size info
  if (source.sourceType === "torrent") {
    return `Link ${index + 1} (${quality}) • ${source.size || ""}`.trim();
  }

  return `Link ${index + 1} (${quality})`;
};

const MediaWatch = () => {
  const { mediaType, mediaId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Parse season/episode from URL params (for TV shows)
  const urlSeason = parseInt(searchParams.get("season")) || 1;
  const urlEpisode = parseInt(searchParams.get("episode")) || 1;

  const [media, setMedia] = useState(null);
  const [sources, setSources] = useState([]);
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [trailer, setTrailer] = useState(null);

  // Season/Episode state for TV shows
  const [currentSeason, setCurrentSeason] = useState(urlSeason);
  const [currentEpisode, setCurrentEpisode] = useState(urlEpisode);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const isTvShow = mediaType === "tv";

  const selectedSource = useMemo(
    () => {
      const sourceList = Array.isArray(sources) ? sources : [];
      return sourceList.find((source) => source.id === selectedSourceId) || null;
    },
    [sources, selectedSourceId]
  );

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadData = async () => {
      dispatch(setGlobalLoading(true));

      const [{ response: mediaResponse, err: mediaErr }, { response: sourceResponse, err: sourceErr }] = await Promise.all([
        mediaApi.getDetail({ mediaType, mediaId }),
        watchSourceApi.getByMedia({
          mediaType,
          mediaId,
          season: isTvShow ? currentSeason : undefined,
          episode: isTvShow ? currentEpisode : undefined
        })
      ]);

      dispatch(setGlobalLoading(false));

      if (mediaErr) {
        toast.error(mediaErr.message || "Không thể tải nội dung phim");
        return;
      }

      if (mediaResponse) {
        setMedia(mediaResponse);
        const nextTrailer = mediaResponse.videos?.results?.find((item) => item.type === "Trailer")
          || mediaResponse.videos?.results?.[0]
          || null;
        setTrailer(nextTrailer);

        // Track media view
        if (process.env.NODE_ENV !== 'development') {
          analyticsApi.track({
            eventType: 'media_view',
            mediaId: mediaId,
            mediaTitle: mediaResponse.title || mediaResponse.name,
            duration: mediaResponse.runtime || 0
          });
        }

        // Populate seasons for TV shows
        if (isTvShow && mediaResponse.seasons) {
          const availableSeasons = mediaResponse.seasons
            .filter(s => s.season_number > 0) // Exclude specials (season 0)
            .map(s => ({
              season_number: s.season_number,
              name: s.name,
              episode_count: s.episode_count
            }));
          setSeasons(availableSeasons);

          // Set episodes for current season
          const currentSeasonData = availableSeasons.find(s => s.season_number === currentSeason);
          if (currentSeasonData) {
            const episodeList = Array.from({ length: currentSeasonData.episode_count }, (_, i) => i + 1);
            setEpisodes(episodeList);
          }
        }
      }

      // Don't show warning if we have embed sources (they work without DB)

      // Combine all source types from new API response format
      const allSources = [];

      // Add embed sources (streaming via iframe)
      if (sourceResponse?.embedSources) {
        sourceResponse.embedSources.forEach(s => {
          allSources.push({
            ...s,
            url: s.embedUrl,
            playbackType: "embed"
          });
        });
      }

      // Add DB sources (manual entries)
      if (sourceResponse?.dbSources) {
        allSources.push(...sourceResponse.dbSources);
      }

      // Add torrent sources (magnet links - external playback)
      if (sourceResponse?.torrentSources) {
        sourceResponse.torrentSources.forEach(s => {
          allSources.push({
            ...s,
            url: s.magnetLink,
            playbackType: "external"
          });
        });
      }

      setSources(allSources);
      setSelectedSourceId(allSources[0]?.id || null);
    };

    loadData();
  }, [dispatch, mediaId, mediaType, isTvShow, currentSeason, currentEpisode]);

  useEffect(() => {
    if (!selectedSource || selectedSource.playbackType !== "hls") return undefined;
    if (!videoRef.current) return undefined;

    const video = videoRef.current;
    const hlsUrl = selectedSource.url;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      return undefined;
    }

    if (!Hls.isSupported()) {
      toast.error("Trình duyệt không hỗ trợ HLS");
      return undefined;
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hlsRef.current = hls;
    hls.loadSource(hlsUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data?.fatal) return;

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
      else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
      else hls.destroy();
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedSource]);

  const renderPlayer = () => {
    if (selectedSource?.playbackType === "embed") {
      return (
        <iframe
          src={selectedSource.url}
          title={selectedSource.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      );
    }

    if (selectedSource?.playbackType === "hls") {
      return (
        <video
          ref={videoRef}
          controls
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        >
          Trình duyệt không hỗ trợ video.
        </video>
      );
    }

    if (selectedSource?.playbackType === "external") {
      return (
        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ color: "#fff" }}>
          <PlayCircleFilledWhiteOutlinedIcon sx={{ fontSize: 64 }} />
          <Typography variant="h6">Nguồn phát bên ngoài</Typography>
          <Button
            variant="contained"
            endIcon={<LaunchIcon />}
            href={selectedSource.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Mở nguồn phát
          </Button>
        </Stack>
      );
    }

    if (trailer) {
      return (
        <iframe
          src={`${tmdbConfigs.youtubePath(trailer.key)}?autoplay=1`}
          title={trailer.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: 0 }}
        />
      );
    }

    return (
      <Typography variant="h6" sx={{ color: "#fff", textAlign: "center" }}>
        Đang tải nguồn phát...
      </Typography>
    );
  };

  return (
    <Box sx={{ pt: { xs: "56px", sm: "64px" }, pb: 4 }}>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/${mediaType}/${mediaId}`)}>
          Quay lại chi tiết
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 0, bgcolor: "#000", width: "100%", height: { xs: "38vh", md: "70vh" } }}>
        <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {renderPlayer()}
        </Box>
      </Paper>

      <Box sx={{ px: { xs: 2, md: 4 }, mt: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={700}>
            {media?.title || media?.name || "Đang tải..."}
            {isTvShow && ` - Phần ${currentSeason} Tập ${currentEpisode}`}
          </Typography>

          {/* Season/Episode Selector for TV Shows */}
          {isTvShow && seasons.length > 0 && (
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Phần</InputLabel>
                <Select
                  value={currentSeason}
                  label="Phần"
                  onChange={(e) => {
                    const newSeason = e.target.value;
                    setCurrentSeason(newSeason);
                    setCurrentEpisode(1);
                    setSearchParams({ season: newSeason, episode: 1 });
                    // Update episodes for new season
                    const seasonData = seasons.find(s => s.season_number === newSeason);
                    if (seasonData) {
                      setEpisodes(Array.from({ length: seasonData.episode_count }, (_, i) => i + 1));
                    }
                  }}
                >
                  {seasons.map((s) => (
                    <MenuItem key={s.season_number} value={s.season_number}>
                      {s.name || `Phần ${s.season_number}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Tập</InputLabel>
                <Select
                  value={currentEpisode}
                  label="Tập"
                  onChange={(e) => {
                    const newEpisode = e.target.value;
                    setCurrentEpisode(newEpisode);
                    setSearchParams({ season: currentSeason, episode: newEpisode });
                  }}
                >
                  {episodes.map((ep) => (
                    <MenuItem key={ep} value={ep}>
                      Tập {ep}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {sources.map((source, index) => (
              <Chip
                key={source.id}
                label={getSourceLabel(source, index)}
                color={selectedSourceId === source.id ? "primary" : "default"}
                variant={selectedSourceId === source.id ? "filled" : "outlined"}
                onClick={() => setSelectedSourceId(source.id)}
              />
            ))}
          </Stack>



          <Typography variant="body1" color="text.secondary">
            {media?.overview}
          </Typography>
        </Stack>
      </Box>

      {media && (
        <Box sx={{ px: { xs: 2, md: 4 }, mt: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            Có thể bạn cũng thích
          </Typography>
          <MediaSlide mediaType={mediaType} mediaCategory={tmdbConfigs.mediaCategory.top_rated} />
        </Box>
      )}


    </Box>
  );
};

export default MediaWatch;
