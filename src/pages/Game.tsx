import { Button, Card, Flex } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate, useParams } from "react-router-dom";

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

const updateFood = (
  foodData: Food[],
  ref: React.MutableRefObject<Record<string, Circle>>
) => {
  foodData.forEach((f) => {
    ref.current[f.index] = {
      x: f.circle.x,
      y: f.circle.y,
      radius: f.circle.radius,
    };
  });
};

const updatePlayers = (
  playerData: GameState["players"],
  playerNameRef: React.MutableRefObject<string>,
  playerRef: React.MutableRefObject<Player | null>,
  otherPlayersRef: React.MutableRefObject<Record<string, Player>>
) => {
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
};

interface WebSocketMessage {
  type: "spawn" | "gameState" | "update" | "playerLeft";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const [start, setStart] = useState(false);

  const otherPlayersRef = useRef<Record<string, Player>>({});
  const foodRef = useRef<Record<string, Circle>>({});
  const playerNameRef = useRef(`player${Math.floor(Math.random() * 1000)}`);

  // Camera and zoom settings
  const ZOOM = 2; // 200% zoom
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const VIEWPORT_WIDTH = CANVAS_WIDTH / ZOOM;
  const VIEWPORT_HEIGHT = CANVAS_HEIGHT / ZOOM;

  const handleMessage = useCallback((msg: MessageEvent) => {
    const message: WebSocketMessage = JSON.parse(msg.data);

    setStart(true);

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
        updatePlayers(
          message.data.players,
          playerNameRef,
          playerRef,
          otherPlayersRef
        );
        updateFood(message.data.food, foodRef);
        break;
      case "playerLeft":
        delete otherPlayersRef.current[message.data.playerName];
        break;
    }
  }, []);

  const connectToGame = useCallback(async () => {
    if (!auth.user) return;

    if (wsRef.current) {
      wsRef.current.close();
      otherPlayersRef.current = {};
      foodRef.current = {};
    }

    playerNameRef.current = auth.user.profile.preferred_username || "";

    const ws = new WebSocket(
      `wss://rso-2.janvasiljevic.com/server/${serverId}/connect/${gameId}?token=${auth.user.id_token}`
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
  }, [auth.user, serverId, gameId, handleMessage]);

  useEffect(() => {
    connectToGame();
  }, [connectToGame]);

  useEffect(() => {
    if (!start) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

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
      if (!ctx || !playerRef.current) return;

      const cameraX = playerRef.current.x - VIEWPORT_WIDTH / 2;
      const cameraY = playerRef.current.y - VIEWPORT_HEIGHT / 2;

      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.scale(ZOOM, ZOOM);
      ctx.translate(-cameraX, -cameraY);

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

      // Draw a grid for reference (optional)
      const gridSize = 50;
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 0.5;

      const startX = Math.floor(cameraX / gridSize) * gridSize;
      const startY = Math.floor(cameraY / gridSize) * gridSize;
      const endX = startX + VIEWPORT_WIDTH + gridSize;
      const endY = startY + VIEWPORT_HEIGHT + gridSize;

      for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }

      // Draw food
      Object.values(foodRef.current).forEach((f) => {
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw other players
      Object.entries(otherPlayersRef.current).forEach(([name, p]) => {
        if (!p.alive) return;

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fill();

        // Scale the text size down since we're zoomed
        ctx.fillStyle = "black";
        ctx.font = `${10 / ZOOM}px Arial`;
        const halfWidth = ctx.measureText(name).width / 2;
        const height = (5 + p.r) / ZOOM;
        ctx.fillText(name, p.x - halfWidth, p.y - height);
      });

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

      // Restore the canvas context
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(drawGame);
    };

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
  }, [VIEWPORT_HEIGHT, VIEWPORT_WIDTH, start]);

  return (
    <Flex w="100%" h="100vh" direction="column">
      <Flex w="100%" p="sm" justify="start" align="center">
        <Button onClick={() => navigate("/lobby")}>Back to Lobby</Button>
      </Flex>

      <Flex w="100%" h="100%" justify="center" align="center">
        <Card
          w="800px"
          h="600px"
          p="xs"
          style={{ position: "relative" }}
          withBorder
          radius="xl"
          shadow="lg"
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
        </Card>
      </Flex>
    </Flex>
  );
};

export default Game;
