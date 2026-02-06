import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Card, CardActionArea, CardMedia, CardContent, IconButton, Tooltip, LinearProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import tmdbConfigs from '../../api/configs/tmdb.configs';
import { getWatchHistory, removeFromHistory } from '../../utils/watchHistory';

const ContinueWatching = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const watchHistory = getWatchHistory();
        // Only show items that are not finished (< 90%)
        const unfinished = watchHistory.filter(item => item.percentage < 90);
        setHistory(unfinished.slice(0, 8));
    }, []);

    const handleRemove = (e, mediaId) => {
        e.preventDefault();
        e.stopPropagation();
        const updatedHistory = removeFromHistory(mediaId);
        setHistory(updatedHistory.filter(item => item.percentage < 90).slice(0, 8));
    };

    const getWatchUrl = (item) => {
        let url = `/${item.mediaType}/${item.mediaId}/watch`;
        if (item.mediaType === 'tv' && item.season && item.episode) {
            url += `?season=${item.season}&episode=${item.episode}`;
        }
        return url;
    };

    const formatTime = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days} ngày trước`;
        if (hours > 0) return `${hours} giờ trước`;
        if (minutes > 0) return `${minutes} phút trước`;
        return 'Vừa xong';
    };

    if (history.length === 0) return null;

    return (
        <Box sx={{ mb: 4 }}>
            <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                    mb: 2,
                    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif'
                }}
            >
                Tiếp tục xem
            </Typography>

            <Box sx={{
                display: 'flex',
                overflowX: 'auto',
                gap: 2,
                pb: 2,
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 3 }
            }}>
                {history.map((item) => (
                    <Card
                        key={`${item.mediaId}-${item.season}-${item.episode}`}
                        sx={{
                            minWidth: 220,
                            maxWidth: 220,
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: 'background.paper',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.03)',
                                '& .remove-btn': { opacity: 1 }
                            }
                        }}
                    >
                        <CardActionArea component={Link} to={getWatchUrl(item)}>
                            {/* Poster */}
                            <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
                                <CardMedia
                                    component="img"
                                    image={tmdbConfigs.posterPath(item.poster)}
                                    alt={item.title}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />

                                {/* Play icon overlay */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    '&:hover': { opacity: 1 }
                                }}>
                                    <PlayArrowIcon sx={{ fontSize: 50, color: 'white' }} />
                                </Box>

                                {/* Progress bar */}
                                <LinearProgress
                                    variant="determinate"
                                    value={item.percentage}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: 4,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: 'primary.main'
                                        }
                                    }}
                                />
                            </Box>

                            <CardContent sx={{ py: 1.5, px: 1.5 }}>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    noWrap
                                    sx={{ lineHeight: 1.3 }}
                                >
                                    {item.title}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                    {item.mediaType === 'tv' && (
                                        <Typography variant="caption" color="text.secondary">
                                            S{item.season} E{item.episode}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                        • {formatTime(item.lastWatched)}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </CardActionArea>

                        {/* Remove button */}
                        <Tooltip title="Xóa khỏi danh sách">
                            <IconButton
                                className="remove-btn"
                                size="small"
                                onClick={(e) => handleRemove(e, item.mediaId)}
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    '&:hover': { bgcolor: 'rgba(255,0,0,0.8)' }
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default ContinueWatching;
