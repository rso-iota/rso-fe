import { Box, Button, Flex } from "@mantine/core";
import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router-dom";

// Types
interface Circle {
  x: number;
  y: number;
  radius: number;
}

interface Player {
  x: number;
  y: number;
  r: number;
  alive: boolean;
}

interface Food {
  circle: Circle;
  index: number;
}

interface GameState {
  players: Array<{
    playerName: string;
    circle: Circle;
    alive: boolean;
  }>;
  food: Food[];
}

interface WebSocketMessage {
  type: "spawn" | "gameState" | "update" | "playerLeft";
  data: any;
}

const Game = () => {
  const { serverId, gameId } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const animationFrameRef = useRef<number>();
  const playerRef = useRef<Player | null>(null);
  const otherPlayersRef = useRef<Record<string, Player>>({});
  const foodRef = useRef<Record<string, Circle>>({});
  const playerNameRef = useRef(`player${Math.floor(Math.random() * 1000)}`);

  const parseJwt = (token: string) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  const getToken = useCallback(() => {
    if (auth.user?.id_token) {
      playerNameRef.current = parseJwt(auth.user.id_token).preferred_username;
      return auth.user.id_token;
    }
    return "";
  }, [auth.user]);

  const updatePlayers = useCallback((playerData: GameState["players"]) => {
    playerData.forEach((p) => {
      if (p.playerName === playerNameRef.current) {
        playerRef.current = {
          x: p.circle.x,
          y: p.circle.y,
          r: p.circle.radius,
          alive: p.alive,
        };
      } else {
        otherPlayersRef.current[p.playerName] = {
          x: p.circle.x,
          y: p.circle.y,
          r: p.circle.radius,
          alive: p.alive,
        };
      }
    });
  }, []);

  const updateFood = useCallback((foodData: Food[]) => {
    foodData.forEach((f) => {
      foodRef.current[f.index] = {
        x: f.circle.x,
        y: f.circle.y,
        radius: f.circle.radius,
      };
    });
  }, []);

  const handleMessage = useCallback(
    (msg: MessageEvent) => {
      const message: WebSocketMessage = JSON.parse(msg.data);

      switch (message.type) {
        case "spawn":
          otherPlayersRef.current[message.data.playerName] = {
            x: message.data.circle.x,
            y: message.data.circle.y,
            r: message.data.circle.radius,
            alive: message.data.alive,
          };
          break;
        case "gameState":
        case "update":
          updatePlayers(message.data.players);
          updateFood(message.data.food);
          break;
        case "playerLeft":
          delete otherPlayersRef.current[message.data.playerName];
          break;
      }
    },
    [updatePlayers, updateFood]
  );

  const connectToGame = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close();
      otherPlayersRef.current = {};
      foodRef.current = {};
    }

    // const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(
      `wss://rso-2.janvasiljevic.com/server/${serverId}/connect/${gameId}?token=${getToken()}`
    );

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          data: { playerName: playerNameRef.current },
        })
      );
    };

    ws.onmessage = handleMessage;
    wsRef.current = ws;
  }, [gameId, getToken, handleMessage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial canvas size
    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Enable crisp edges
    ctx.imageSmoothingEnabled = false;

    const keyPressed: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keyPressed[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keyPressed[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const drawGame = () => {
      // Clear with background
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw debug grid
      ctx.strokeStyle = "#ddd";
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
      }
      ctx.stroke();

      let dx = 0;
      let dy = 0;
      if (keyPressed["w"]) dy -= 1;
      if (keyPressed["s"]) dy += 1;
      if (keyPressed["a"]) dx -= 1;
      if (keyPressed["d"]) dx += 1;

      if (
        (dx !== 0 || dy !== 0) &&
        wsRef.current?.readyState === WebSocket.OPEN
      ) {
        wsRef.current.send(
          JSON.stringify({
            type: "move",
            data: { x: dx, y: dy },
          })
        );
      }

      // Draw player
      if (playerRef.current?.alive) {
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(
          playerRef.current.x,
          playerRef.current.y,
          playerRef.current.r,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }

      // Draw other players
      Object.entries(otherPlayersRef.current).forEach(([name, p]) => {
        if (!p.alive) return;

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        const halfWidth = ctx.measureText(name).width / 2;
        const height = 10 + p.r;
        ctx.fillText(name, p.x - halfWidth, p.y - height);
      });

      // Draw food
      Object.values(foodRef.current).forEach((f) => {
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, 2 * Math.PI);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(drawGame);
    };

    connectToGame();
    drawGame();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectToGame]);

  return (
    <Flex w="100%" h="100vh" direction="column">
      <Flex w="100%" p="sm" justify="start" align="center">
        <Button onClick={() => navigate("/lobby")}>Back to Lobby</Button>
      </Flex>

      <Flex w="100%" h="100%" justify="center" align="center">
        <Box
          w="800px"
          h="600px"
          bg="dimmed"
          p="xs"
          style={{ position: "relative" }}
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "#f0f0f0",
            }}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Game;
