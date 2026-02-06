import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Stack,
    Rating,
    Paper,
    Divider,
    Skeleton
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import { toast } from 'react-toastify';
import { setAuthModalOpen } from '../../redux/features/authModalSlice';
import reviewApi from '../../api/modules/review.api';

const MediaReviews = ({ mediaId, mediaType, mediaTitle, mediaPoster }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newReview, setNewReview] = useState('');
    const [rating, setRating] = useState(5);

    // Fetch reviews on mount
    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const { response } = await reviewApi.getList({ mediaId });
                if (response) {
                    setReviews(response);
                }
            } catch (e) {
                console.log('Failed to fetch reviews');
            }
            setLoading(false);
        };

        if (mediaId) {
            fetchReviews();
        }
    }, [mediaId]);

    const handleSubmit = async () => {
        if (!user) {
            dispatch(setAuthModalOpen(true));
            toast.info('Vui lòng đăng nhập để bình luận');
            return;
        }

        if (!newReview.trim()) {
            toast.warning('Vui lòng nhập nội dung bình luận');
            return;
        }

        setSubmitting(true);

        try {
            const { response, err } = await reviewApi.add({
                mediaId,
                mediaType,
                mediaTitle,
                mediaPoster,
                content: newReview,
                rating
            });

            if (err) {
                toast.error(err.message || 'Không thể gửi bình luận');
            }

            if (response) {
                setReviews([response, ...reviews]);
                setNewReview('');
                setRating(5);
                toast.success('Đã gửi bình luận');
            }
        } catch (e) {
            toast.error('Lỗi khi gửi bình luận');
        }

        setSubmitting(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                Bình luận ({reviews.length})
            </Typography>

            {/* Add new review */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                {user ? (
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {user.displayName?.charAt(0).toUpperCase() || <PersonIcon />}
                            </Avatar>
                            <Typography fontWeight={600}>{user.displayName}</Typography>
                        </Stack>

                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Đánh giá của bạn
                            </Typography>
                            <Rating
                                value={rating}
                                onChange={(event, newValue) => setRating(newValue || 5)}
                                size="large"
                            />
                        </Box>

                        <TextField
                            multiline
                            rows={3}
                            placeholder="Chia sẻ suy nghĩ của bạn về phim này..."
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            fullWidth
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <LoadingButton
                                variant="contained"
                                loading={submitting}
                                endIcon={<SendIcon />}
                                onClick={handleSubmit}
                            >
                                Gửi bình luận
                            </LoadingButton>
                        </Box>
                    </Stack>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            Đăng nhập để bình luận về phim này
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => dispatch(setAuthModalOpen(true))}
                        >
                            Đăng nhập
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Reviews list */}
            <Stack spacing={3}>
                {loading ? (
                    // Loading skeleton
                    [...Array(3)].map((_, i) => (
                        <Paper key={i} sx={{ p: 2, borderRadius: 2 }}>
                            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                <Skeleton variant="circular" width={40} height={40} />
                                <Box>
                                    <Skeleton width={100} />
                                    <Skeleton width={60} />
                                </Box>
                            </Stack>
                            <Skeleton />
                            <Skeleton width="80%" />
                        </Paper>
                    ))
                ) : reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <Paper
                            key={review.id || index}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    boxShadow: 3
                                }
                            }}
                        >
                            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                    {review.user?.displayName?.charAt(0).toUpperCase() || <PersonIcon />}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={600}>
                                        {review.user?.displayName || 'Người dùng'}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Rating value={review.rating || 5} size="small" readOnly />
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(review.createdAt)}
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>

                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                {review.content}
                            </Typography>
                        </Paper>
                    ))
                ) : (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                        <Typography color="text.secondary">
                            Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!
                        </Typography>
                    </Paper>
                )}
            </Stack>
        </Box>
    );
};

export default MediaReviews;
