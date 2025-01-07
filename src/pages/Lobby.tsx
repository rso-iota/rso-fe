import {
  useCreateLobby,
  useDeleteLobby,
  useGetLobbyList,
} from "@/api/lobby/lobby/lobby";
import { useGetOnlineUsers } from "@/api/users/users/users";
import { queryClient } from "@/queryClient";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Button,
  Container,
  Flex,
  Group,
  Modal,
  NumberInput,
  Paper,
  rem,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import {
  IconHash,
  IconLogout,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconServer,
  IconTopologyRing,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { useAuth } from "react-oidc-context";

import { useForm, zodResolver } from "@mantine/form";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(20),
  maxPlayers: z.number().min(2).max(9),
});

type LobbyForm = z.infer<typeof schema>;

const Lobby = () => {
  const auth = useAuth();

  const form = useForm({
    initialValues: {
      name: "",
      maxPlayers: 5,
      description: "",
    },
    validate: zodResolver(schema),
  });
  const theme = useMantineTheme();

  const { data, queryKey, refetch, isFetching } = useGetLobbyList();
  const { mutateAsync: createLobbyApi } = useCreateLobby();
  const { data: usersData } = useGetOnlineUsers();

  // refecth lobby data every 10 seconds

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetch]);

  const { mutateAsync: deleteLobbyApi } = useDeleteLobby();

  const [opened, { toggle }] = useDisclosure();

  const navigate = useNavigate();

  const [modalOpened, { close: closeModal, open: openModal }] = useDisclosure();

  const deleteLobby = async (id: string) => {
    modals.openConfirmModal({
      title: "Delete lobby",
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => {
        deleteLobbyApi({
          id: id,
        })
          .then(() => {
            showNotification({
              title: "Lobby deleted",
              message: "Lobby deleted successfully",
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
      },
    });
  };

  const demo = async () => {
    form.setValues({
      name: "New lobby",
      maxPlayers: 5,
    });

    openModal();
  };

  const onFormSubmit = async (values: LobbyForm) => {
    createLobbyApi({
      data: values,
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
      })
      .finally(() => {
        closeModal();
      });
  };

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
      <Modal opened={modalOpened} onClose={closeModal} title="Create lobby">
        <Stack gap="md">
          <form onSubmit={form.onSubmit(onFormSubmit)}>
            <Stack>
              <TextInput
                label="Name"
                description="Lobby name. Between 2 and 20 characters"
                {...form.getInputProps("name")}
              />
              <NumberInput
                min={2}
                max={9}
                label="Max players"
                description="Maximum number of players in the lobby. Between 2 and 9 players"
                {...form.getInputProps("maxPlayers")}
              />

              <Button color="orange" variant="light" type="submit">
                Create lobby
              </Button>
            </Stack>
          </form>
        </Stack>
      </Modal>

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
        <Flex gap="sm" direction="column">
          {(usersData || []).map((user) => (
            <Paper p="sm" px="lg" withBorder key={user.username}>
              <Flex justify="space-between" align="center">
                <Avatar color="blue" size="sm">
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>

                <Flex direction="column">
                  <Text size="sm" fw="bold">
                    {user.username}
                  </Text>

                  <Badge variant="light" size="xs">
                    Id za Mateja:) {user.id}
                  </Badge>
                </Flex>
              </Flex>
            </Paper>
          ))}
        </Flex>
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
                <Group>
                  <ActionIcon
                    onClick={() => refetch()}
                    variant="light"
                    size="lg"
                    disabled={isFetching}
                  >
                    <IconRefresh style={{ width: rem(16), height: rem(16) }} />
                  </ActionIcon>
                  <Button
                    onClick={demo}
                    color="orange"
                    variant="white"
                    leftSection={<IconPlus />}
                    style={{ boxShadow: theme.shadows.sm }}
                  >
                    Create lobby
                  </Button>
                </Group>
              </Flex>
              <Stack gap="sm">
                {(data ?? []).map((lobby) => (
                  <Paper withBorder p="sm" px="lg" key={lobby.id}>
                    <Stack gap="sm">
                      <Flex justify="space-between" align="center">
                        <Text
                          size="xl"
                          fw="bold"
                          opacity={lobby.archived ? 0.5 : 1}
                        >
                          {lobby.name}
                        </Text>
                        {!lobby.archived ? (
                          <Group>
                            <Button
                              color="blue"
                              size="compact-md"
                              variant="subtle"
                              leftSection={
                                <IconPlayerPlay
                                  style={{ width: rem(16), height: rem(16) }}
                                />
                              }
                              onClick={() => {
                                navigate(
                                  `/game/${lobby.serverId}/${lobby.gameId}`
                                );
                              }}
                            >
                              Join
                            </Button>
                            {auth.user?.profile.sub === lobby.owner && (
                              <Button
                                size="compact-md"
                                variant="subtle"
                                color="red"
                                onClick={() => {
                                  deleteLobby(lobby.id);
                                }}
                                leftSection={
                                  <IconTrash
                                    style={{ width: rem(16), height: rem(16) }}
                                  />
                                }
                              >
                                Delete
                              </Button>
                            )}
                          </Group>
                        ) : (
                          <Text c="dimmed">Archived</Text>
                        )}
                      </Flex>
                      <Flex gap="sm">
                        <Badge
                          leftSection={
                            <IconUser
                              style={{ width: rem(12), height: rem(12) }}
                            />
                          }
                          variant="light"
                          radius="sm"
                        >
                          Players: {lobby.currentPlayers}/{lobby.maxPlayers}
                        </Badge>
                        <Badge
                          leftSection={
                            <IconServer
                              style={{ width: rem(12), height: rem(12) }}
                            />
                          }
                          variant="light"
                          color="gray"
                          radius="sm"
                        >
                          Server: {lobby.serverId}
                        </Badge>
                        <Badge
                          leftSection={
                            <IconHash
                              style={{ width: rem(12), height: rem(12) }}
                            />
                          }
                          variant="light"
                          color="gray"
                          radius="sm"
                        >
                          Game id: {lobby.gameId}
                        </Badge>
                      </Flex>

                      <Flex gap={"xs"}>
                        {lobby.currentPlayers > 0 ? (
                          (lobby.liveData || []).map((data) => (
                            <Flex key={data.username + lobby.id + lobby.gameId}>
                              <Avatar
                                color="blue"
                                size="sm"
                                style={{ marginRight: theme.spacing.xs }}
                              >
                                {data.username.charAt(0).toUpperCase()}
                              </Avatar>
                              <Text>{data.size}</Text>
                            </Flex>
                          ))
                        ) : (
                          <Text size="sm" color="gray">
                            No players in the lobby at the moment
                          </Text>
                        )}
                      </Flex>
                    </Stack>
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
