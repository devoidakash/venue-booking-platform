import HomePage from "@/pages/user/HomePage";
import AllVenuesPage from "@/pages/user/AllVenuesPage";
import LoginPage from "@/pages/user/LoginPage";
import VenueBookingPage from "@/pages/user/VenueBookingPage";
import VenueBookingHistory from "@/pages/user/VenueBookingHistory";
import VenuePaymentConfirmationPage from "@/pages/user/VenuePaymentConfirmationPage";

export const userRoutes = [
  {
    path: "/",
    element: (
      <HomePage>
        <AllVenuesPage />
      </HomePage>
    ),
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
  {
    path: "/bookings",
    element: (
      <HomePage>
        <VenueBookingHistory />
      </HomePage>
    ),
  },
  {
    path: "/bookings/:bookingId/confirmation",
    element: <VenuePaymentConfirmationPage />,
  },
];
