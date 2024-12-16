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
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
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

import { z } from "zod";
import { useForm, zodResolver } from "@mantine/form";

const schema = z.object({
  name: z.string(),
  maxPlayers: z.number(),
  description: z.string(),
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

  const { data, queryKey } = useGetLobbyList();
  const { mutateAsync: createLobbyApi } = useCreateLobby();
  const { data: usersData } = useGetOnlineUsers();

  const [opened, { toggle }] = useDisclosure();

  const [modalOpened, { close: closeModal, open: openModal }] = useDisclosure();

  const demo = async () => {
    form.setValues({
      name: "",
      maxPlayers: 5,
      description: "",
    });

    openModal();
  };

  const onFormSubmit = async (values: LobbyForm) => {
    console.log(values);

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
              <TextInput label="Name" {...form.getInputProps("name")} />
              <TextInput
                label="Description"
                {...form.getInputProps("description")}
              />
              <TextInput
                label="Max players"
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

                <Text size="sm" fw="bold">
                  {user.username}
                </Text>
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
