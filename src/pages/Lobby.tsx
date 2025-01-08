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
  Center,
  Container,
  Flex,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  rem,
  RingProgress,
  SimpleGrid,
  Skeleton,
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
  IconBurger,
  IconGraph,
  IconHash,
  IconLogout,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconServer,
  IconSkull,
  IconSword,
  IconTopologyRing,
  IconTrash,
  IconUser,
  IconVideo,
} from "@tabler/icons-react";
import Autoplay from "embla-carousel-autoplay";
import { useAuth } from "react-oidc-context";

import { Carousel } from "@mantine/carousel";
import { useForm, zodResolver } from "@mantine/form";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { AXIOS_INSTANCE } from "@/api/mutator/custom-instance";
import { graphql } from "@/graphql";
import { execute } from "@/graphql/execute";
import { QueryQuery } from "@/graphql/graphql";
import { useQuery } from "@tanstack/react-query";

const schema = z.object({
  name: z.string().min(2).max(20),
  maxPlayers: z.number().min(2).max(9),
});

const playerStatsQuery = graphql(`
  query Query($ids: [ID]) {
    players(ids: $ids) {
      deaths
      foodEaten
      kills
    }
    stats {
      botDeaths
      botKills
      botFoodEaten
      playerDeaths
      playerKills
      playerFoodEaten
    }
  }
`);

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
  const { data: usersData, refetch: refetchUsers } = useGetOnlineUsers();

  const playerIds = (usersData || []).map((user) => user.id);

  const { data: statistics, refetch: refetchStats } = useQuery({
    queryKey: playerIds,
    queryFn: () => execute(playerStatsQuery, { ids: playerIds }),
  });

  const playersWithStats = (usersData || []).map((user, i) => {
    const stats = statistics?.players?.[i] ?? {
      deaths: 0,
      foodEaten: 0,
      kills: 0,
    };
    return {
      ...user,
      deaths: stats?.deaths,
      foodEaten: stats?.foodEaten,
      kills: stats?.kills,
    };
  });

  // refecth lobby data every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      refetchUsers();
      refetchStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetch, refetchUsers, refetchStats]);

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
          {(playersWithStats || []).map((user) => (
            <Paper p="sm" px="lg" withBorder key={user.username}>
              <Stack>
                <Flex justify="left" align="center" gap="sm">
                  <Avatar color="blue" size="sm">
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>

                  <Text size="sm" fw="bold">
                    {user.username}
                  </Text>
                </Flex>
                <Flex w="100%" justify="end">
                  <Badge
                    leftSection={<IconSword />}
                    variant="subtle"
                    color="green"
                  >
                    {user.kills}
                  </Badge>
                  <Badge
                    leftSection={<IconBurger />}
                    variant="subtle"
                    color="blue"
                  >
                    {user.foodEaten}
                  </Badge>
                  <Badge
                    leftSection={<IconSkull />}
                    variant="subtle"
                    color="red"
                  >
                    {user.deaths}
                  </Badge>
                </Flex>
              </Stack>
            </Paper>
          ))}
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main>
        <Flex w="100%" direction="column">
          <Container w="100%">
            <Stack>
              <StatsCarousel stats={statistics?.stats} />

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
                    <Stack gap="md">
                      <Flex justify="space-between" align="center">
                        <Text
                          size="xl"
                          fw="bold"
                          opacity={lobby.archived ? 0.5 : 1}
                        >
                          {lobby.archived
                            ? `Archived:  ${lobby.name}`
                            : lobby.name}
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
                          <Group>
                            <VideoStreamModal gameId={lobby.gameId} />
                          </Group>
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
                              <Text>{data.size.toFixed(0)}</Text>
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

type Props = {
  stats: QueryQuery["stats"];
};

const StatsCarousel = ({ stats }: Props) => {
  const autoplay = useRef(Autoplay({ delay: 6000 }));
  const [slide, setSlide] = useState(0);

  if (!stats) {
    return (
      <SimpleGrid cols={3}>
        <Skeleton height={100} />
        <Skeleton height={100} />
        <Skeleton height={100} />
      </SimpleGrid>
    );
  }

  return (
    <Stack>
      <Flex direction="row" align={"center"} justify={"flex-start"}>
        <ThemeIcon
          variant="transparent"
          size="xl"
          mr="sm"
          fw={900}
          color="purple"
        >
          <IconGraph />
        </ThemeIcon>
        <Flex direction={"column"}>
          <Text size="xl" fw="bold">
            Global statistics
          </Text>
          <Text size="sm">{slide === 0 ? "Bot uprising" : "Player stats"}</Text>
        </Flex>
      </Flex>
      <Carousel
        onSlideChange={setSlide}
        plugins={[autoplay.current]}
        onMouseEnter={autoplay.current.stop}
        onMouseLeave={autoplay.current.reset}
        loop
      >
        <Carousel.Slide>
          <StatsRing
            data={[
              {
                label: "Kills",
                icon: <IconSword />,
                stats: stats.botKills.toString(),
                color: "green",
              },
              {
                label: "Food eaten",
                icon: <IconBurger />,
                stats: stats.botFoodEaten.toString(),
                color: "blue",
              },
              {
                label: "Deaths",
                icon: <IconSkull />,
                stats: stats.botDeaths.toString(),
                color: "red",
              },
            ]}
          />
        </Carousel.Slide>
        <Carousel.Slide>
          <StatsRing
            data={[
              {
                label: "Kills",
                icon: <IconSword />,
                stats: stats.playerKills.toString(),
                color: "green",
              },
              {
                label: "Food eaten",
                icon: <IconBurger />,
                stats: stats.playerFoodEaten.toString(),
                color: "blue",
              },
              {
                label: "Deaths",
                icon: <IconSkull />,
                stats: stats.playerDeaths.toString(),
                color: "red",
              },
            ]}
          />
        </Carousel.Slide>
      </Carousel>
    </Stack>
  );
};

type StastProps = {
  data: {
    label: string;
    icon: React.ReactNode;
    stats: string;
    color: string;
  }[];
};

export function StatsRing({ data }: StastProps) {
  const stats = data.map((stat) => {
    return (
      <Paper withBorder radius="md" p="xs" key={stat.label}>
        <Group>
          <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: 100, color: stat.color }]}
            label={
              <Center>
                <ThemeIcon
                  variant="transparent"
                  size="xl"
                  color={stat.color}
                  style={{ margin: "0 auto" }}
                >
                  {stat.icon}
                </ThemeIcon>
              </Center>
            }
          />

          <div>
            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
              {stat.label}
            </Text>
            <Text fw={700} size="xl">
              {stat.stats}
            </Text>
          </div>
        </Group>
      </Paper>
    );
  });

  return <SimpleGrid cols={{ base: 1, sm: 3 }}>{stats}</SimpleGrid>;
}

const VideoStreamModal = ({ gameId }: { gameId: string }) => {
  const [opened, setOpened] = useState(false);
  const [videoSrc, setVideoSrc] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchVideoFile = async () => {
    setLoading(true);
    try {
      const response = await AXIOS_INSTANCE.get(
        `/api/v1/replays/${gameId}/video?fps=10&speed=10`,
        {
          responseType: "blob",
        }
      );

      const blob = response.data;
      const videoUrl = URL.createObjectURL(blob);

      setVideoSrc(videoUrl);
    } catch (error) {
      console.error("Error fetching video file:", error);
      setVideoSrc("");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpened(true);
    fetchVideoFile();
  };

  const handleClose = () => {
    setOpened(false);
    setVideoSrc(""); // Clean up video source
  };

  return (
    <div>
      <Button
        onClick={handleOpen}
        leftSection={<IconVideo />}
        color="indigo"
        variant="subtle"
      >
        {" "}
        Replay
      </Button>

      <Modal
        opened={opened}
        onClose={handleClose}
        title={`Replay of game ${gameId}`}
        size="lg"
      >
        {loading ? (
          <Center>
            <Loader size="lg" />
          </Center>
        ) : videoSrc ? (
          <video controls autoPlay style={{ width: "100%" }}>
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>Failed to load video file.</p>
        )}
      </Modal>
    </div>
  );
};

export default Lobby;
