import { Button, Container, Flex, Stack, Text } from "@mantine/core";
import { Physics } from "@react-three/cannon";
import {
  Center,
  Float,
  OrbitControls,
  Text3D,
  useMatcapTexture,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import * as THREE from "three";

function Hero() {
  const [matcapTexture] = useMatcapTexture("7877EE_D87FC5_75D9C7_1C78C0");
  const ref = useRef(null!);

  const { width: h } = useThree((state) => state.viewport);

  return (
    <>
      <Center top scale={[0.9, 1, 1]}>
        <Physics gravity={[0, 0, 0]}>
          <Float speed={2} floatIntensity={0.5}>
            <Text3D
              position={[0, 0, -15]}
              scale={[-1, 1, 1]}
              ref={ref}
              size={h / 8}
              // maxWidth={[-w / 5, -h * 2, 3]}
              font={"/gt.json"}
              curveSegments={24}
              bevelSegments={1}
              bevelEnabled
              bevelSize={0.08}
              bevelThickness={0.03}
              height={1}
              lineHeight={0.9}
              letterSpacing={0.3}
            >
              {`Agar.io`}
              <meshMatcapMaterial color="white" matcap={matcapTexture} />
            </Text3D>
            <Text3D
              position={[-1, -1, -15]}
              scale={[-1, 1, 1]}
              ref={ref}
              size={h / 30}
              // maxWidth={[-w / 5, -h * 2, 3]}
              font={"/gt.json"}
              curveSegments={24}
              bevelSegments={1}
              bevelEnabled
              bevelSize={0.03}
              bevelThickness={0.01}
              height={0.1}
              lineHeight={0.9}
              letterSpacing={0.08}
            >
              {`Now overengineered  in k8s`}
              <meshMatcapMaterial color="white" matcap={matcapTexture} />
            </Text3D>
          </Float>
        </Physics>
      </Center>
    </>
  );
}

type SphereProps = {
  position: [number, number, number];
};

const Sphere = ({ position }: SphereProps) => {
  const [matcapTexture] = useMatcapTexture("8955D0_744CC4_EA4AEF_954DA4");
  return (
    <Float speed={3.3} floatIntensity={4}>
      <mesh position={position} geometry={new THREE.SphereGeometry(1, 24, 24)}>
        <meshMatcapMaterial color="white" matcap={matcapTexture} />
      </mesh>
    </Float>
  );
};

const Landing = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  const auth = useAuth();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (controlsRef.current) {
        const { clientX: x, clientY: y } = event;
        const width = window.innerWidth;
        const height = window.innerHeight;

        const targetX = (x / width - 0.5) * 5;
        const targetY = (y / height - 0.5) * 5;

        controlsRef.current.target.set(targetX, -targetY, 0);
        controlsRef.current.update();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Flex
      w="100%"
      h={"100vh"}
      direction={"column"}
      align={"cente"}
      justify={"center"}
    >
      <Container w={"100%"} p={0}>
        <div
          style={{
            width: "100%",
            height: "600px",
          }}
        >
          <Canvas camera={{ position: [0, 0, -10], fov: 60 }} flat linear>
            <Suspense fallback={"Loading"}>
              <Hero />
            </Suspense>
            <ambientLight intensity={0.6} color={"#dee2ff"} />
          </Canvas>
        </div>
      </Container>

      <Flex w="100%" align="end" justify="flex-end">
        <Container size="xs" style={{ zIndex: 1 }} mb="md">
          <Stack gap="lg">
            <Text size="lg">
              Join the worlds most highly available and scalable game played on
              way to many distributed services. Don't worry, if something goes
              wrong, you will receive a prometheus alert.
            </Text>

            <Button
              size="xl"
              variant="gradient"
              onClick={() => {
                auth.signinRedirect({
                  redirect_uri: `${window.location.origin}${window.location.pathname}lobby`,
                });
              }}
              fw={900}
              gradient={{ from: "orange", to: "red", deg: 330 }}
            >
              Start now
            </Button>
          </Stack>
        </Container>
      </Flex>

      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />

          <Physics gravity={[0, 0, 0]}>
            {Array.from({ length: 100 }).map((_, i) => (
              <Sphere
                key={i}
                position={[
                  Math.random() * 120 - 60,
                  Math.random() * 120 - 60,
                  Math.random() * 50 - 50,
                ]}
              />
            ))}
          </Physics>

          {/* <AsciiRenderer fgColor="blue" bgColor="transparent" /> */}

          <ambientLight intensity={0.1} color={"#dee2ff"} />
        </Canvas>
      </div>
    </Flex>
  );
};

export default Landing;
