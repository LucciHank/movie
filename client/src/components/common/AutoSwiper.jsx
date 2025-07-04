import { Box, IconButton } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { useRef } from "react";

const AutoSwiper = ({ children }) => {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <Box sx={{
      position: "relative",
      "& .swiper-slide": {
        width: {
          xs: "50%",
          sm: "35%",
          md: "25%",
          lg: "20.5%"
        },
        padding: "0 8px",
        boxSizing: "border-box",
        "& > div": {
          borderRadius: "12px",
          overflow: "hidden"
        }
      },
      "& .swiper-button-prev, & .swiper-button-next": {
        color: "primary.main"
      }
    }}>
      <Swiper
        modules={[Navigation]}
        slidesPerView="auto"
        grabCursor={true}
        spaceBetween={8}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = navigationPrevRef.current;
          swiper.params.navigation.nextEl = navigationNextRef.current;
        }}
        style={{ width: "100%", height: "max-content" }}
      >
        {children}
      </Swiper>
      
      {/* Navigation buttons */}
      <IconButton
        ref={navigationPrevRef}
        sx={{
          position: "absolute",
          top: "50%",
          left: { xs: "-5px", md: "-15px" },
          transform: "translateY(-50%)",
          zIndex: 2,
          bgcolor: "background.paper",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          "&:hover": { bgcolor: "background.paper" },
          width: { xs: "36px", md: "48px" },
          height: { xs: "36px", md: "48px" }
        }}
      >
        <NavigateBeforeIcon fontSize="medium" />
      </IconButton>
      
      <IconButton
        ref={navigationNextRef}
        sx={{
          position: "absolute",
          top: "50%",
          right: { xs: "-5px", md: "-15px" },
          transform: "translateY(-50%)",
          zIndex: 2,
          bgcolor: "background.paper",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          "&:hover": { bgcolor: "background.paper" },
          width: { xs: "36px", md: "48px" },
          height: { xs: "36px", md: "48px" }
        }}
      >
        <NavigateNextIcon fontSize="medium" />
      </IconButton>
    </Box>
  );
};

export default AutoSwiper;