import HomePage from "@/pages/user/HomePage";
import LoginPage from "@/pages/user/LoginPage";
import VenueBookingPage from "@/pages/user/VenueBookingPage";
import VenuePaymentConfirmationPage from "@/pages/user/VenuePaymentConfirmationPage";

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
  {
    path: "/bookings/:bookingId/confirmation",
    element: <VenuePaymentConfirmationPage />,
  },
];
