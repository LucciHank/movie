import axios from "axios";

// Streaming embed sources for movies
// These generate embed URLs directly without requiring external API calls

const EMBED_SOURCES = {
    vidsrc: {
        name: "VidSrc",
        movieUrl: (tmdbId) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
        tvUrl: (tmdbId, season, episode) => `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
        quality: "1080p"
    },
    vidsrcMe: {
        name: "VidSrc.me",
        movieUrl: (tmdbId) => `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
        tvUrl: (tmdbId, season, episode) => `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`,
        quality: "1080p"
    },
    embedsu: {
        name: "Embed.su",
        movieUrl: (tmdbId) => `https://embed.su/embed/movie/${tmdbId}`,
        tvUrl: (tmdbId, season, episode) => `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
        quality: "1080p"
    },
    smashystream: {
        name: "SmashyStream",
        movieUrl: (tmdbId) => `https://player.smashy.stream/movie/${tmdbId}`,
        tvUrl: (tmdbId, season, episode) => `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`,
        quality: "720p"
    },
    multiembed: {
        name: "MultiEmbed",
        movieUrl: (tmdbId) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
        tvUrl: (tmdbId, season, episode) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`,
        quality: "720p"
    },
    "2embed": {
        name: "2Embed",
        movieUrl: (tmdbId) => `https://www.2embed.cc/embed/${tmdbId}`,
        tvUrl: (tmdbId, season, episode) => `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
        quality: "720p"
    }
};

// YTS API for torrent sources (may not work in all regions)
const YTS_API_BASE = "https://yts.mx/api/v2";

// Build magnet link from YTS torrent data
const buildMagnetLink = (hash, title) => {
    const trackers = [
        "udp://open.demonii.com:1337/announce",
        "udp://tracker.openbittorrent.com:80",
        "udp://tracker.coppersurfer.tk:6969",
        "udp://glotorrents.pw:6969/announce",
        "udp://tracker.opentrackr.org:1337/announce"
    ];

    const encodedTitle = encodeURIComponent(title);
    const trackersString = trackers.map(t => `&tr=${encodeURIComponent(t)}`).join("");

    return `magnet:?xt=urn:btih:${hash}&dn=${encodedTitle}${trackersString}`;
};

// Get torrent sources from YTS (may fail in blocked regions)
const getTorrentsByImdbId = async (imdbId) => {
    try {
        const response = await axios.get(`${YTS_API_BASE}/movie_details.json`, {
            params: { imdb_id: imdbId },
            timeout: 10000
        });

        if (response.data.status === "ok" && response.data.data.movie?.torrents) {
            const movie = response.data.data.movie;
            return movie.torrents.map(torrent => ({
                id: `yts-${movie.id}-${torrent.quality}`,
                provider: "YTS",
                title: movie.title,
                quality: torrent.quality,
                size: torrent.size,
                seeds: torrent.seeds,
                peers: torrent.peers,
                magnetLink: buildMagnetLink(torrent.hash, `${movie.title} (${movie.year}) [${torrent.quality}]`),
                torrentUrl: torrent.url,
                sourceType: "torrent"
            }));
        }
        return [];
    } catch (error) {
        console.log("YTS API error (may be blocked):", error.message);
        return [];
    }
};

// Get embed streaming sources for a movie
const getEmbedSources = (mediaType, mediaId, season, episode) => {
    const sources = [];

    Object.entries(EMBED_SOURCES).forEach(([key, source]) => {
        const embedUrl = mediaType === "movie"
            ? source.movieUrl(mediaId)
            : source.tvUrl(mediaId, season, episode);

        sources.push({
            id: `embed-${key}-${mediaId}`,
            provider: source.name,
            title: `Watch on ${source.name}`,
            quality: source.quality,
            embedUrl: embedUrl,
            playbackType: "embed",
            sourceType: "embed"
        });
    });

    return sources;
};

// Main function to get all sources for watching
const getTorrentSources = async ({ mediaType, mediaId, imdbId, title, year, season, episode }) => {
    const results = {
        embedSources: [],
        torrentSources: []
    };

    // Always generate embed sources (work without external API)
    results.embedSources = getEmbedSources(mediaType, mediaId, season, episode);

    // Try to get torrent sources for movies (may fail)
    if (mediaType === "movie" && imdbId) {
        results.torrentSources = await getTorrentsByImdbId(imdbId);
    }

    return results;
};

export default {
    getTorrentSources,
    getEmbedSources,
    getTorrentsByImdbId
};
