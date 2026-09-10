import HomePage from "@/pages/user/HomePage";
import LoginPage from "@/pages/user/LoginPage";

export const userRoutes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
];
