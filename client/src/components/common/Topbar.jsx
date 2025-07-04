import { useSelector, useDispatch } from "react-redux";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import MovieIcon from "@mui/icons-material/Movie";
import TvIcon from "@mui/icons-material/Tv";
import PersonIcon from "@mui/icons-material/Person";
import { AppBar, Box, Button, IconButton, Stack, Toolbar, useScrollTrigger, InputBase, Container, alpha, Paper, Typography, ClickAwayListener, CircularProgress, Divider, ListItemAvatar, ListItemText, Avatar, MenuItem } from "@mui/material";
import { cloneElement, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import menuConfigs from "../../configs/menu.configs";
import { themeModes } from "../../configs/theme.configs";
import { setAuthModalOpen } from "../../redux/features/authModalSlice";
import { setThemeMode } from "../../redux/features/themeModeSlice";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import Sidebar from "./Sidebar";
import mediaApi from "../../api/modules/media.api";
import personApi from "../../api/modules/person.api";
import tmdbConfigs from "../../api/configs/tmdb.configs";
import { routesGen } from "../../routes/routes";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const ScrollAppBar = ({ children, window }) => {
  const { themeMode } = useSelector((state) => state.themeMode);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
    target: window ? window() : undefined
  });

  return cloneElement(children, {
    sx: {
      color: trigger ? "text.primary" : themeMode === themeModes.dark ? "primary.contrastText" : "text.primary",
      backgroundColor: trigger ? "background.paper" : themeMode === themeModes.dark ? "transparent" : "background.paper"
    }
  });
};

const Topbar = () => {
  const { user } = useSelector((state) => state.user);
  const { appState } = useSelector((state) => state.appState);
  const { themeMode } = useSelector((state) => state.themeMode);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    movies: [],
    tvShows: [],
    people: []
  });
  const [searchFocused, setSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSwitchTheme = () => {
    const theme = themeMode === themeModes.dark ? themeModes.light : themeModes.dark;
    dispatch(setThemeMode(theme));
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      performSearch(query);
    } else {
      setSearchResults({
        movies: [],
        tvShows: [],
        people: []
      });
    }
  };

  const performSearch = async (query) => {
    setIsSearching(true);
    
    try {
      // Search movies
      const movieResponse = await mediaApi.search({
        mediaType: tmdbConfigs.mediaType.movie,
        query,
        page: 1
      });
      
      // Search TV shows
      const tvResponse = await mediaApi.search({
        mediaType: tmdbConfigs.mediaType.tv,
        query,
        page: 1
      });
      
      // Search people
      const personResponse = await personApi.search({
        query,
        page: 1
      });
      
      setSearchResults({
        movies: movieResponse.response ? movieResponse.response.results.slice(0, 3) : [],
        tvShows: tvResponse.response ? tvResponse.response.results.slice(0, 3) : [],
        people: personResponse.response ? personResponse.response.results.slice(0, 3) : []
      });
    } catch (error) {
      console.error("Search error:", error);
    }
    
    setIsSearching(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (type, id) => {
    setSearchFocused(false);
    setSearchQuery("");
    
    if (type === "person") {
      navigate(routesGen.person(id));
    } else {
      navigate(routesGen.mediaDetail(type, id));
    }
  };

  const hasResults = searchResults.movies.length > 0 || 
                     searchResults.tvShows.length > 0 || 
                     searchResults.people.length > 0;

  return (
    <>
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
      <ScrollAppBar>
        <AppBar 
          elevation={0} 
          sx={{ 
            zIndex: 9999, 
            borderRadius: 0,
            '& .MuiPaper-root': {
              borderRadius: 0
            }
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters sx={{ 
              minHeight: { xs: '64px', sm: '70px' },
              justifyContent: "space-between",
              px: 2
            }}>
              {/* Mobile menu button */}
              <IconButton
                color="inherit"
                sx={{ display: { md: "none" } }}
                onClick={toggleSidebar}
              >
                <MenuIcon />
              </IconButton>

              {/* Logo */}
              <Box sx={{ 
                display: "flex", 
                alignItems: "center",
                mr: { md: 4 }
              }}>
                <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <Logo />
                </Link>
              </Box>

              {/* Main menu - Desktop */}
              <Stack 
                direction="row" 
                spacing={1} 
                alignItems="center" 
                sx={{ 
                  display: { xs: "none", md: "flex" },
                  flexGrow: 1
                }}
              >
              {menuConfigs.main.map((item, index) => (
                <Button
                  key={index}
                  sx={{
                    color: appState.includes(item.state) ? "primary.contrastText" : "inherit",
                      mr: 1,
                      px: 1.5,
                      fontWeight: 500,
                      textTransform: "none",
                      fontSize: "0.95rem"
                  }}
                  component={Link}
                  to={item.path}
                  variant={appState.includes(item.state) ? "contained" : "text"}
                >
                  {item.display}
                </Button>
              ))}
              </Stack>

              {/* Search Bar */}
              <Box 
                ref={searchRef}
                component="form" 
                onSubmit={handleSearchSubmit}
                sx={{ 
                  position: 'relative',
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: (theme) => alpha(theme.palette.common.white, themeMode === "dark" ? 0.15 : 0.1),
                  borderRadius: 2,
                  px: 2,
                  mx: { xs: 1, md: 2 },
                  flexGrow: { xs: 1, md: 0 },
                  width: { md: '280px' },
                  transition: 'all 0.3s ease',
                  ...(searchFocused && {
                    width: { xs: '100%', md: '400px' },
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  })
                }}
              >
                <InputBase
                  placeholder="Tìm kiếm phim..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  sx={{ 
                    color: 'inherit',
                    '& .MuiInputBase-input': {
                      p: '8px 0',
                      width: '100%',
                      transition: 'width 0.2s',
                      fontSize: '0.9rem',
                      fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif'
                    },
                    flexGrow: 1
                  }}
                />
                <IconButton 
                  type="submit"
                  sx={{ 
                    p: '5px',
                    color: 'inherit',
                    ml: 1,
                    position: 'absolute',
                    right: 8
                  }}
                >
                  <SearchIcon />
              </IconButton>
                
                {/* Search Results Dropdown */}
                {searchFocused && searchQuery.length >= 2 && (
                  <Paper
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      mt: 1,
                      zIndex: 9999,
                      maxHeight: '80vh',
                      width: '100%',
                      minWidth: { xs: '100%', md: '400px' },
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      boxShadow: 3,
                      borderRadius: 2,
                      '&::-webkit-scrollbar': {
                        display: 'none'
                      },
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                  >
                    {isSearching ? (
                      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : !hasResults ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Không tìm thấy kết quả
                        </Typography>
            </Box>
                    ) : (
                      <>
                        {searchResults.movies.length > 0 && (
                          <>
                            <Typography variant="subtitle2" sx={{ px: 2, py: 1, backgroundColor: 'background.paper' }}>
                              Phim lẻ
                            </Typography>
                            <Divider />
                            {searchResults.movies.map(movie => (
                              <MenuItem 
                                key={movie.id}
                                onClick={() => handleItemClick(tmdbConfigs.mediaType.movie, movie.id)}
                                sx={{ py: 1.5 }}
                              >
                                <ListItemAvatar>
                                  <Avatar 
                                    variant="rounded"
                                    src={movie.poster_path ? tmdbConfigs.posterPath(movie.poster_path) : ''}
                                    alt={movie.title}
                                    sx={{ width: 40, height: 60, borderRadius: 1 }}
                                  >
                                    <MovieIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={movie.title} 
                                  secondary={movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                                  primaryTypographyProps={{
                                    noWrap: true,
                                    fontWeight: 500
                                  }}
                                />
                              </MenuItem>
                            ))}
                          </>
                        )}
                        
                        {searchResults.tvShows.length > 0 && (
                          <>
                            <Typography variant="subtitle2" sx={{ px: 2, py: 1, backgroundColor: 'background.paper' }}>
                              Phim bộ
                            </Typography>
                            <Divider />
                            {searchResults.tvShows.map(show => (
                              <MenuItem 
                                key={show.id}
                                onClick={() => handleItemClick(tmdbConfigs.mediaType.tv, show.id)}
                                sx={{ py: 1.5 }}
                              >
                                <ListItemAvatar>
                                  <Avatar 
                                    variant="rounded"
                                    src={show.poster_path ? tmdbConfigs.posterPath(show.poster_path) : ''}
                                    alt={show.name}
                                    sx={{ width: 40, height: 60, borderRadius: 1 }}
                                  >
                                    <TvIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={show.name} 
                                  secondary={show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
                                  primaryTypographyProps={{
                                    noWrap: true,
                                    fontWeight: 500
                                  }}
                                />
                              </MenuItem>
                            ))}
                          </>
                        )}
                        
                        {searchResults.people.length > 0 && (
                          <>
                            <Typography variant="subtitle2" sx={{ px: 2, py: 1, backgroundColor: 'background.paper' }}>
                              Diễn viên
                            </Typography>
                            <Divider />
                            {searchResults.people.map(person => (
                              <MenuItem 
                                key={person.id}
                                onClick={() => handleItemClick("person", person.id)}
                                sx={{ py: 1.5 }}
                              >
                                <ListItemAvatar>
                                  <Avatar 
                                    src={person.profile_path ? tmdbConfigs.posterPath(person.profile_path) : ''}
                                    alt={person.name}
                                  >
                                    <PersonIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={person.name} 
                                  secondary={person.known_for_department || 'Diễn viên'}
                                  primaryTypographyProps={{
                                    noWrap: true,
                                    fontWeight: 500
                                  }}
                                />
                              </MenuItem>
                            ))}
                          </>
                        )}
                        
                        <Box sx={{ p: 1, textAlign: 'center' }}>
                          <Button 
                            size="small" 
                            onClick={handleSearchSubmit}
                            endIcon={<ArrowForwardIcon />}
                          >
                            Xem tất cả kết quả
                          </Button>
                        </Box>
                      </>
                    )}
                  </Paper>
                )}
              </Box>

              {/* Theme toggle and user controls */}
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  sx={{ color: "inherit" }}
                  onClick={onSwitchTheme}
                >
                  {themeMode === themeModes.dark ? <DarkModeOutlinedIcon /> : <WbSunnyOutlinedIcon />}
                </IconButton>

                {!user ? (
                  <Button
                variant="contained"
                onClick={() => dispatch(setAuthModalOpen(true))}
                    sx={{ 
                      display: { xs: 'none', sm: 'flex' },
                      borderRadius: 1,
                      px: 2
                    }}
                  >
                    Đăng nhập
                  </Button>
                ) : (
                  <UserMenu />
                )}
            </Stack>
          </Toolbar>
          </Container>
        </AppBar>
      </ScrollAppBar>
    </>
  );
};

export default Topbar;