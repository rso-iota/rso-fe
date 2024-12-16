import { useCreateLobby, useGetLobbyList } from "@/api/lobby/lobby/lobby";
import { useGetOnlineUsers } from "@/api/users/users/users";
import { queryClient } from "@/queryClient";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Container,
  Flex,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import {
  IconLogout,
  IconPlus,
  IconTopologyRing,
  IconUser,
} from "@tabler/icons-react";
import { useAuth } from "react-oidc-context";

const Lobby = () => {
  const auth = useAuth();

  const theme = useMantineTheme();

  const { data, queryKey } = useGetLobbyList();
  const { mutateAsync: createLobbyApi } = useCreateLobby();
  const { data: usersData } = useGetOnlineUsers();

  const demo = async () => {
    createLobbyApi({
      data: {
        description: "string",
        name: "as",
        maxPlayers: 5,
      },
    })
      .then(() => {
        showNotification({
          title: "Lobby created",
          message: "Lobby created successfully",
        });

        queryClient.invalidateQueries({
          queryKey: queryKey,
        });
      })
      .catch((error) => {
        showNotification({
          title: "Error",
          message: error.message,
          color: "red",
        });
      });
  };

  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      bg={theme.colors.gray[1]}
      padding="md"
    >
      <AppShell.Header>
        <Flex gap="md" p="sm" w="100%" align="center">
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            lineSize={2}
          />
          <Box style={{ flexGrow: 1 }} />
          <ActionIcon
            color="red"
            size="lg"
            onClick={() => {
              auth.signoutRedirect();
            }}
            variant="light"
          >
            <IconLogout />
          </ActionIcon>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md" withBorder={false}>
        <Text size="sm" fw={900} mb="sm">
          Online
        </Text>
        {(usersData || []).map((user) => (
          <Paper bg={theme.colors?.gray[0]} p="sm" px="lg" key={user.username}>
            <Flex justify="space-between" align="center">
              <Avatar color="blue">
                {user.username.charAt(0).toUpperCase()}
              </Avatar>

              <Text size="xl" fw="bold">
                {user.username}
              </Text>
            </Flex>
          </Paper>
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Flex w="100%" direction="column">
          <Container w="100%">
            <Stack>
              <Flex justify="space-between" align="center">
                <Flex direction="row" align={"center"} justify={"flex-start"}>
                  <ThemeIcon
                    variant="transparent"
                    size="xl"
                    mr="sm"
                    fw={900}
                    color="orange"
                  >
                    <IconTopologyRing />
                  </ThemeIcon>
                  <Flex direction={"column"}>
                    <Text size="xl" fw="bold">
                      Lobbies
                    </Text>
                    <Text size="sm">Join or create a lobby</Text>
                  </Flex>
                </Flex>
                <Button
                  onClick={demo}
                  color="orange"
                  variant="white"
                  leftSection={<IconPlus />}
                  style={{ boxShadow: theme.shadows.sm }}
                >
                  Create lobby
                </Button>
              </Flex>
              <Stack gap="sm">
                {(data ?? []).map((lobby) => (
                  <Paper withBorder p="sm" px="lg" key={lobby.id}>
                    <Flex justify="space-between" align="center">
                      <Text size="xl" fw="bold">
                        {lobby.name}
                      </Text>

                      <Flex>
                        {lobby.currentPlayers}
                        <IconUser />
                      </Flex>
                      <Button variant="subtle" color="purple">
                        Join
                      </Button>
                    </Flex>
                  </Paper>
                ))}
              </Stack>

              <Stack></Stack>
            </Stack>
          </Container>
        </Flex>
      </AppShell.Main>
    </AppShell>
  );
};

export default Lobby;
