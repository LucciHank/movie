// Vietnamese genre name mapping
// Used across the app for consistent Vietnamese genre names

const genreVietnamese = {
    // Movie genres
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
    37: "Miền Tây",

    // TV genres (some overlap with movie)
    10759: "Hành Động & Phiêu Lưu",
    10762: "Trẻ Em",
    10763: "Tin Tức",
    10764: "Thực Tế",
    10765: "Khoa Học Viễn Tưởng & Giả Tưởng",
    10766: "Phim Dài Tập",
    10767: "Talk Show",
    10768: "Chiến Tranh & Chính Trị"
};

// Get Vietnamese name for a genre ID
export const getGenreVietnamese = (genreId, fallbackName = "") => {
    return genreVietnamese[genreId] || fallbackName;
};

// Map an array of genres to include Vietnamese names
export const mapGenresVietnamese = (genres) => {
    return genres.map(genre => ({
        ...genre,
        name_vi: genreVietnamese[genre.id] || genre.name
    }));
};

export default genreVietnamese;
