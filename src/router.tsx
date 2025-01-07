import { createBrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import Game from "./pages/Game";
import Lobby from "./pages/Lobby";
import AuthLayout from "./auth/AuthLayout";
import Callback from "./pages/Callback";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Landing />,
    },
    {
      path: "/callback",
      element: <Callback />,
    },
    {
      path: "/",
      element: <AuthLayout />,
      children: [
        {
          path: "/lobby",
          element: <Lobby />,
        },
        {
          path: "/game/:serverId/:gameId",
          element: <Game />,
        },
      ],
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

export default router;
