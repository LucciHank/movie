import { LoadingButton } from "@mui/lab";
import { Box, Button, Divider, Stack, Typography, Paper, Avatar, Rating, Grid, Card, CardContent, Chip, IconButton } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import tmdbConfigs from "../api/configs/tmdb.configs";
import reviewApi from "../api/modules/review.api";
import Container from "../components/common/Container";
import uiConfigs from "../configs/ui.configs";
import { setGlobalLoading } from "../redux/features/globalLoadingSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import MovieIcon from "@mui/icons-material/Movie";
import StarIcon from "@mui/icons-material/Star";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { routesGen } from "../routes/routes";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const ReviewItem = ({ review, onRemoved }) => {
  const [onRequest, setOnRequest] = useState(false);

  const onRemove = async () => {
    if (onRequest) return;
    setOnRequest(true);
    const { response, err } = await reviewApi.remove({ reviewId: review.id });
    setOnRequest(false);

    if (err) toast.error(err.message);
    if (response) {
      toast.success("Đã xóa đánh giá thành công");
      onRemoved(review.id);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        opacity: onRequest ? 0.6 : 1,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.2)'
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Grid container>
          {/* Poster */}
          <Grid item xs={12} sm={3} md={2}>
            <Link
              to={routesGen.mediaDetail(review.mediaType || review.media_type, review.mediaId || review.media_id)}
              style={{ textDecoration: "none" }}
            >
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: { xs: '56.25%', sm: '150%' },
                  backgroundImage: `url(${tmdbConfigs.posterPath(review.mediaPoster || review.media_poster)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                  }
                }}
              />
            </Link>
          </Grid>

          {/* Content */}
          <Grid item xs={12} sm={9} md={10}>
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Link
                      to={routesGen.mediaDetail(review.mediaType || review.media_type, review.mediaId || review.media_id)}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="700"
                        sx={{
                          mb: 0.5,
                          transition: 'color 0.2s',
                          '&:hover': { color: 'primary.main' }
                        }}
                      >
                        {review.mediaTitle || review.media_title}
                      </Typography>
                    </Link>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Chip
                        icon={<MovieIcon sx={{ fontSize: 16 }} />}
                        label={(review.mediaType || review.media_type) === 'movie' ? 'Phim lẻ' : 'Phim bộ'}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: 'text.secondary',
                          fontSize: '0.75rem'
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(review.createdAt || review.created_at).fromNow()}
                      </Typography>
                    </Stack>
                  </Box>

                  <IconButton
                    onClick={onRemove}
                    disabled={onRequest}
                    sx={{
                      color: 'error.main',
                      '&:hover': { bgcolor: 'rgba(244,67,54,0.1)' }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>

                {/* Rating */}
                {(review.rating !== undefined) && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Rating
                      value={review.rating}
                      readOnly
                      size="medium"
                      icon={<StarIcon sx={{ color: '#FFD700' }} />}
                      emptyIcon={<StarIcon sx={{ color: 'rgba(255,255,255,0.2)' }} />}
                    />
                    <Typography variant="body2" fontWeight="600" color="primary.main">
                      {review.rating}/5
                    </Typography>
                  </Stack>
                )}

                {/* Review Content */}
                <Box sx={{ position: 'relative', pl: 4 }}>
                  <FormatQuoteIcon
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: -8,
                      fontSize: 32,
                      color: 'primary.main',
                      opacity: 0.5,
                      transform: 'rotate(180deg)'
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      color: 'text.secondary',
                      fontStyle: 'italic'
                    }}
                  >
                    {review.content}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  const skip = 5;

  useEffect(() => {
    const getReviews = async () => {
      dispatch(setGlobalLoading(true));
      setIsLoading(true);
      const { response, err } = await reviewApi.getList();
      dispatch(setGlobalLoading(false));
      setIsLoading(false);

      if (err) toast.error(err.message);
      if (response) {
        setCount(response.length);
        setReviews([...response]);
        setFilteredReviews([...response].splice(0, skip));
      }
    };

    getReviews();
  }, [dispatch]);

  const onLoadMore = () => {
    setFilteredReviews([...filteredReviews, ...[...reviews].splice(page * skip, skip)]);
    setPage(page + 1);
  };

  const onRemoved = (id) => {
    const newReviews = [...reviews].filter(e => e.id !== id);
    setReviews(newReviews);
    setFilteredReviews([...newReviews].splice(0, page * skip));
    setCount(count - 1);
  };

  return (
    <Box sx={{ ...uiConfigs.style.mainContent }}>
      <Container header={`Đánh giá của bạn (${count})`}>
        {/* Stats */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center" alignItems="center">
            <Stack alignItems="center" spacing={1}>
              <Typography variant="h3" fontWeight="800" color="primary.main">
                {count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng đánh giá
              </Typography>
            </Stack>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Stack alignItems="center" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <StarIcon sx={{ color: '#FFD700', fontSize: 32 }} />
                <Typography variant="h3" fontWeight="800" color="warning.main">
                  {reviews.length > 0
                    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
                    : '0.0'
                  }
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Điểm trung bình
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Reviews List */}
        <Stack spacing={3}>
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography color="text.secondary">Đang tải đánh giá...</Typography>
            </Box>
          ) : filteredReviews.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 3,
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}
            >
              <MovieIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Bạn chưa có đánh giá nào
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Hãy xem phim và để lại đánh giá của bạn
              </Typography>
            </Paper>
          ) : (
            filteredReviews.map((item) => (
              <ReviewItem key={item.id} review={item} onRemoved={onRemoved} />
            ))
          )}

          {filteredReviews.length < reviews.length && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                onClick={onLoadMore}
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  borderColor: 'rgba(255,255,255,0.2)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(99,102,241,0.1)'
                  }
                }}
              >
                Tải thêm đánh giá
              </Button>
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default ReviewList;