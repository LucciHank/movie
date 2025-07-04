import HomePage from "../pages/HomePage";
import PersonDetail from "../pages/PersonDetail";
import FavoriteList from "../pages/FavoriteList";
import MediaDetail from "../pages/MediaDetail";
import MediaList from "../pages/MediaList";
import MediaSearch from "../pages/MediaSearch";
import PasswordUpdate from "../pages/PasswordUpdate";
import ReviewList from "../pages/ReviewList";
import MediaWatch from "../pages/MediaWatch";
import ActorsList from "../pages/ActorsList";
import GenreList from "../pages/GenreList";
import AdminDashboard from "../pages/AdminDashboard";
import UserProfile from "../pages/UserProfile";
import ProtectedPage from "../components/common/ProtectedPage";

export const routesGen = {
  home: "/",
  mediaList: (type) => `/${type}`,
  mediaDetail: (type, id) => `/${type}/${id}`,
  mediaWatch: (type, id) => `/${type}/${id}/watch`,
  mediaSearch: "/search",
  person: (id) => `/person/${id}`,
  favoriteList: "/favorites",
  reviewList: "/reviews",
  passwordUpdate: "password-update",
  actorsList: "/actors",
  genreList: "/genre",
  adminPanel: "/admin",
  userProfile: "/profile"
};

const routes = [
  {
    index: true,
    element: <HomePage />,
    state: "home"
  },
  {
    path: "/person/:personId",
    element: <PersonDetail />,
    state: "person.detail"
  },
  {
    path: "/actors",
    element: <ActorsList />,
    state: "actors"
  },
  {
    path: "/genre",
    element: <GenreList />,
    state: "genre"
  },
  {
    path: "/admin",
    element: (
      <ProtectedPage>
        <AdminDashboard />
      </ProtectedPage>
    ),
    state: "admin"
  },
  {
    path: "/profile",
    element: (
      <ProtectedPage>
        <UserProfile />
      </ProtectedPage>
    ),
    state: "profile"
  },
  {
    path: "/search",
    element: <MediaSearch />,
    state: "search"
  },
  {
    path: "/password-update",
    element: (
      <ProtectedPage>
        <PasswordUpdate />
      </ProtectedPage>
    ),
    state: "password.update"
  },
  {
    path: "/favorites",
    element: (
      <ProtectedPage>
        <FavoriteList />
      </ProtectedPage>
    ),
    state: "favorites"
  },
  {
    path: "/reviews",
    element: (
      <ProtectedPage>
        <ReviewList />
      </ProtectedPage>
    ),
    state: "reviews"
  },
  {
    path: "/:mediaType",
    element: <MediaList />
  },
  {
    path: "/:mediaType/:mediaId",
    element: <MediaDetail />
  },
  {
    path: "/:mediaType/:mediaId/watch",
    element: <MediaWatch />
  }
];

export default routes;