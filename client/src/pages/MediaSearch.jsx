import { LoadingButton } from "@mui/lab";
import { Box, Button, Stack, TextField, Toolbar, Typography, Container, Grid, Chip, InputAdornment, Select, MenuItem, FormControl, InputLabel, useTheme, Paper } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import mediaApi from "../api/modules/media.api";
import genreApi from "../api/modules/genre.api";
import MediaGrid from "../components/common/MediaGrid";
import uiConfigs from "../configs/ui.configs";
import tmdbConfigs from "../api/configs/tmdb.configs";
import { getGenreVietnamese } from "../utils/genreVietnamese";

const MediaSearch = () => {
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [onSearch, setOnSearch] = useState(false);
  const [mediaType, setMediaType] = useState("movie");
  const [medias, setMedias] = useState([]);
  const [page, setPage] = useState(1);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [totalResults, setTotalResults] = useState(0);

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      const { response } = await genreApi.getList({ mediaType });
      if (response) {
        setGenres(response.genres);
      }
    };
    fetchGenres();
  }, [mediaType]);

  // Search function
  const search = useCallback(
    async () => {
      if (!query.trim() && !selectedGenre) {
        setMedias([]);
        return;
      }

      setOnSearch(true);

      let response, err;

      if (query.trim()) {
        // Normal search
        const result = await mediaApi.search({
          mediaType,
          query,
          page
        });
        response = result.response;
        err = result.err;
      } else if (selectedGenre) {
        // Search by genre using discover
        const result = await mediaApi.getList({
          mediaType,
          mediaCategory: "popular",
          page
        });
        response = result.response;
        err = result.err;

        // Filter by genre client-side (simpler approach)
        if (response) {
          response.results = response.results.filter(m =>
            m.genre_ids && m.genre_ids.includes(parseInt(selectedGenre))
          );
        }
      }

      setOnSearch(false);

      if (err) toast.error(err.message);
      if (response) {
        setTotalResults(response.total_results || response.results.length);
        if (page > 1) setMedias(m => [...m, ...response.results]);
        else setMedias([...response.results]);
      }
    },
    [mediaType, query, page, selectedGenre],
  );

  // Trigger search on dependencies change
  useEffect(() => {
    search();
  }, [search, query, mediaType, page, selectedGenre]);

  // Reset when changing type
  useEffect(() => {
    setMedias([]);
    setPage(1);
    setSelectedGenre("");
  }, [mediaType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(inputValue);
    setPage(1);
  };

  const handleGenreSelect = (genreId) => {
    setSelectedGenre(genreId);
    setQuery("");
    setInputValue("");
    setPage(1);
  };

  const mediaTypeLabels = {
    movie: "Phim lẻ",
    tv: "Phim bộ",
    people: "Diễn viên"
  };

  return (
    <>
      <Toolbar />
      <Box sx={{
        ...uiConfigs.style.mainContent,
        pt: { xs: 10, md: 12 }
      }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 3,
              textAlign: 'center',
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
            }}
          >
            Tìm kiếm
          </Typography>

          {/* Search Box */}
          <Paper
            component="form"
            onSubmit={handleSearch}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Stack spacing={3}>
              {/* Search input */}
              <TextField
                fullWidth
                placeholder="Nhập tên phim, diễn viên..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    fontSize: '1.1rem'
                  }
                }}
              />

              {/* Filters row */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                {/* Media type buttons */}
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Object.entries(mediaTypeLabels).map(([type, label]) => (
                    <Chip
                      key={type}
                      label={label}
                      clickable
                      color={mediaType === type ? "primary" : "default"}
                      variant={mediaType === type ? "filled" : "outlined"}
                      onClick={() => setMediaType(type)}
                      sx={{ fontWeight: 500 }}
                    />
                  ))}
                </Stack>

                {/* Genre filter */}
                {mediaType !== "people" && genres.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Thể loại</InputLabel>
                    <Select
                      value={selectedGenre}
                      label="Thể loại"
                      onChange={(e) => handleGenreSelect(e.target.value)}
                    >
                      <MenuItem value="">Tất cả</MenuItem>
                      {genres.map((genre) => (
                        <MenuItem key={genre.id} value={genre.id}>
                          {getGenreVietnamese(genre.id, genre.name)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Search button */}
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={onSearch}
                  sx={{
                    px: 4,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600
                  }}
                >
                  Tìm kiếm
                </LoadingButton>
              </Stack>
            </Stack>
          </Paper>

          {/* Results header */}
          {(query || selectedGenre) && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="text.secondary">
                {totalResults > 0 ? (
                  <>
                    Tìm thấy <strong style={{ color: theme.palette.primary.main }}>{totalResults}</strong> kết quả
                    {query && <> cho "<strong>{query}</strong>"</>}
                    {selectedGenre && (
                      <> trong thể loại <strong>
                        {getGenreVietnamese(parseInt(selectedGenre), genres.find(g => g.id === parseInt(selectedGenre))?.name)}
                      </strong></>
                    )}
                  </>
                ) : (
                  <>Không tìm thấy kết quả {query && `cho "${query}"`}</>
                )}
              </Typography>
            </Box>
          )}

          {/* Genre chips for quick filter */}
          {!query && !selectedGenre && mediaType !== "people" && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Duyệt theo thể loại
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {genres.slice(0, 12).map((genre) => (
                  <Chip
                    key={genre.id}
                    label={getGenreVietnamese(genre.id, genre.name)}
                    clickable
                    variant="outlined"
                    onClick={() => handleGenreSelect(genre.id)}
                    sx={{
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        borderColor: 'primary.main'
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Results grid */}
          <MediaGrid medias={medias} mediaType={mediaType} />

          {/* Load more */}
          {medias.length > 0 && medias.length < totalResults && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <LoadingButton
                variant="outlined"
                loading={onSearch}
                onClick={() => setPage(page + 1)}
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Tải thêm
              </LoadingButton>
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
};

export default MediaSearch;