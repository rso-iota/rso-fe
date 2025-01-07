import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import "dayjs/locale/sl";
import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { AuthProvider } from "react-oidc-context";
import { onSigninCallback, userManager } from "./auth/authConfig";

// Only used in when NODE_ENV == 'development'
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { theme } from "./theme";
import { queryClient } from "./queryClient";
import { ModalsProvider } from "@mantine/modals";

function App() {
  return (
    <AuthProvider userManager={userManager} onSigninCallback={onSigninCallback}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <DatesProvider settings={{ locale: "sl-SI" }}>
              <Notifications position="bottom-right" zIndex={10000000000000} />
              <Suspense fallback={<></>}>
                <RouterProvider router={router} />
              </Suspense>
            </DatesProvider>
          </ModalsProvider>
        </MantineProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
