export function Kitchen() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>

      <mesh position={[0, 7.5, -6]} receiveShadow>
        <boxGeometry args={[30, 15, 1]} />
        <meshStandardMaterial color="#e0e5ec" roughness={0.9} />
      </mesh>

      <mesh position={[-10, 7.5, 0]} receiveShadow>
        <boxGeometry args={[1, 15, 30]} />
        <meshStandardMaterial color="#e0e5ec" roughness={0.9} />
      </mesh>

      <mesh position={[-5, 6, -5.4]}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial color="#eef2ff" />
      </mesh>

      <mesh position={[-4, 1.5, -4]} castShadow receiveShadow>
        <boxGeometry args={[12, 3, 3]} />
        <meshStandardMaterial color="#4a69bd" roughness={0.6} />
      </mesh>

      <mesh position={[-4, 3.1, -4]} castShadow receiveShadow>
        <boxGeometry args={[12.2, 0.2, 3.2]} />
        <meshStandardMaterial color="#111111" roughness={0.2} />
      </mesh>

      <mesh position={[-2, 3.4, -3.5]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
        <meshStandardMaterial color="#ff4757" />
      </mesh>

      <mesh position={[-7, 3.5, -4]} castShadow>
        <cylinderGeometry args={[0.4, 0.3, 0.6, 16]} />
        <meshStandardMaterial color="#cd6133" />
      </mesh>

      <mesh position={[-7, 4.2, -4]} castShadow>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="#2ed573" />
      </mesh>
    </>
  );
}
