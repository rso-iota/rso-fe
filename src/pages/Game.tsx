import { Box, Button, Flex, Text } from "@mantine/core";
import { useNavigate, useParams } from "react-router-dom";

const Game = () => {
  const { serverId, gameId } = useParams();

  const navigate = useNavigate();

  return (
    <Flex w="100%" h="100vh" direction={"column"}>
      <Flex w="100%" p="sm" justify="start" align="center">
        <Button onClick={() => navigate("/lobby")}>Back to Lobby</Button>
      </Flex>

      <Flex w="100%" h="100%" justify="center" align="center">
        <Box w="500px" h="500px" bg="dimmed" p="xs">
          <Text>Server ID: {serverId}</Text>
          <Text>Game ID: {gameId}</Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Game;
