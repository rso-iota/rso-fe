import { Alert, Box, Center, LoadingOverlay } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { hasAuthParams, useAuth } from "react-oidc-context";
import { useOutlet } from "react-router-dom";

const AuthLayout = () => {
  const outlet = useOutlet();

  const auth = useAuth();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);

  // automatically sign-in
  useEffect(() => {
    if (
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading &&
      !hasTriedSignin
    ) {
      auth.signinRedirect();
      setHasTriedSignin(true);
    }
  }, [auth, hasTriedSignin]);

  if (auth.error) {
    return <ErrorBox message={auth.error?.message} />;
  }

  if (auth.isLoading) {
    return <Loading />;
  }

  if (!auth.isAuthenticated) {
    return <ErrorBox message="You are not authenticated" />;
  }

  return <Box h="100%">{outlet}</Box>;
};

const Loading = () => {
  return <LoadingOverlay visible zIndex={1000} />;
};

const ErrorBox = ({ message = "An error occured." }: { message?: string }) => {
  const auth = useAuth();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("An error occured", auth.error, message);
    const timeout = setTimeout(() => {
      auth.signoutRedirect();
    }, 105000);

    return () => {
      clearTimeout(timeout);
    };
  }, [auth, message]);

  return (
    <Center w="100%" h="100vh">
      <Alert
        variant="error"
        title="We've hit a snag"
        icon={<IconLock />}
        color="red"
      >
        Error.
      </Alert>
    </Center>
  );
};

export default AuthLayout;
