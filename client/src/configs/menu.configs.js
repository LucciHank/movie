import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

const main = [
  {
    display: "Trang chủ",
    path: "/",
    icon: <HomeOutlinedIcon />,
    state: "home"
  },
  {
    display: "Thể loại",
    path: "/genre",
    icon: <CategoryOutlinedIcon />,
    state: "genre"
  },
  {
    display: "Phim lẻ",
    path: "/movie",
    icon: <SlideshowOutlinedIcon />,
    state: "movie"
  },
  {
    display: "Phim bộ",
    path: "/tv",
    icon: <LiveTvOutlinedIcon />,
    state: "tv"
  },
  {
    display: "Diễn viên",
    path: "/actors",
    icon: <PeopleOutlineIcon />,
    state: "actors"
  }
];

const user = [
  {
    display: "Tài khoản",
    path: "/profile",
    icon: <AccountCircleOutlinedIcon />,
    state: "profile"
  },
  {
    display: "Yêu thích",
    path: "/favorites",
    icon: <FavoriteBorderOutlinedIcon />,
    state: "favorite"
  },
  {
    display: "Đánh giá",
    path: "/reviews",
    icon: <RateReviewOutlinedIcon />,
    state: "reviews"
  },
  {
    display: "Đổi mật khẩu",
    path: "/password-update",
    icon: <LockResetOutlinedIcon />,
    state: "password.update"
  }
];

const menuConfigs = { main, user };

export default menuConfigs;