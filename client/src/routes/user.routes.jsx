import HomePage from "@/pages/user/HomePage";
import LoginPage from "@/pages/user/LoginPage";
import VenueBookingPage from "@/pages/user/VenueBookingPage";

export const userRoutes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/venues/:venueId",
    element: (
      <HomePage>
        <VenueBookingPage />
      </HomePage>
    ),
  },
];
