import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import terraImage from '../../images/terra.png';
import canhaoImage from '../../images/canhao.png';

const CANNON_HEIGHT = 80;
const EARTH_DIAMETER = 600;
const EARTH_RADIUS_KM = 6371; // Raio da Terra em km
const EARTH_RADIUS_PX = EARTH_DIAMETER / 2;
const SCALE_KM_TO_PX = EARTH_RADIUS_PX / EARTH_RADIUS_KM; // km para pixels
const CANNON_DISTANCE_KM = 2000; // Distância da boca do canhão à superfície em km
const GRAVITY_M_S2 = 9.8; // Gravidade em m/s²
const GRAVITY_KM_S2 = GRAVITY_M_S2 / 1000; // Gravidade em km/s²
const ANIMATION_SPEED = 800; // Multiplicador de velocidade da animação
const VELOCITY_DISPLAY_DELAY = 200; // Delay em milissegundos para mostrar a velocidade (200ms)
const FIRE_DELAY = 500; // Delay em milissegundos antes de disparar (1 segundo)
const FONT_SIZE = 18; // Tamanho da fonte do texto de velocidade em pixels
const ARROWS_H = -99.5; // Posição horizontal das setas (em pixels a partir do centro)
const ARROW_TOP_V_POSITION = 1; // Ajuste vertical da seta de cima (em pixels)
const ARROW_BOTTOM_V_POSITION = -9; // Ajuste vertical da seta de baixo (em pixels)

// Velocidades de disparo por tecla (em km/s)
const VELOCITY_BY_KEY: { [key: string]: number } = {
  "1": 1,   
  "2": 2,   
  "3": 3 ,  
  "4": 4 , 
  "5": 5,  
  "6": 6,  
  "7": 6.9,  
  "8": 7.2,  
  "0": 10,  
};

interface BulletState {
  id: number;
  x: number;
  y: number;
  vx: number; // Velocidade X em pixels/s
  vy: number; // Velocidade Y em pixels/s
  time: number;
  isActive: boolean;
  startTime: number;
  initialVelocity: number; // Velocidade inicial desta bala em km/s
  initialX: number; // Posição X inicial (boca do canhão)
}

export interface NewtonCannonProps {

}

const NewtonCannon = (props: NewtonCannonProps) => {
  const [bullets, setBullets] = useState<BulletState[]>([]);
  const [cannonWidth, setCannonWidth] = useState<number>(0);
  const [selectedVelocity, setSelectedVelocity] = useState<number | null>(null);
  const [showDistanceIndicator, setShowDistanceIndicator] = useState<boolean>(true);
  const cannonWidthRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const bulletIdCounter = useRef<number>(0);
  const cannonRef = useRef<HTMLImageElement | null>(null);
  const isAnimatingRef = useRef<boolean>(false);
  const fireTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Posição inicial da boca do canhão (centro da Terra + raio + distância)
  const cannonMouthDistancePx = CANNON_DISTANCE_KM * SCALE_KM_TO_PX;
  const initialY = -(EARTH_RADIUS_PX + cannonMouthDistancePx);

  // Obter largura do canhão após renderizar
  useLayoutEffect(() => {
    if (cannonRef.current) {
      const width = cannonRef.current.offsetWidth;
      setCannonWidth(width);
      cannonWidthRef.current = width;
    }
  }, []);

  const handleFire = useCallback((velocity: number) => {
    // Usar a ref para garantir que temos o valor mais atualizado
    const currentCannonWidth = cannonRef.current?.offsetWidth || cannonWidthRef.current || cannonWidth;
    const bulletInitialX = currentCannonWidth / 2;
    
    const initialVelocityPxS = velocity * SCALE_KM_TO_PX;
    const newBullet: BulletState = {
      id: bulletIdCounter.current++,
      x: bulletInitialX,
      y: initialY,
      vx: initialVelocityPxS,
      vy: 0,
      time: 0,
      isActive: true,
      startTime: performance.now(),
      initialVelocity: velocity,
      initialX: bulletInitialX
    };
    
    setBullets(prev => [...prev, newBullet]);
  }, [cannonWidth, initialY]);

  // Listener para teclas numéricas selecionar velocidade e disparar após FIRE_DELAY
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key;
      if (key in VELOCITY_BY_KEY) {
        const velocity = VELOCITY_BY_KEY[key];
        
        // Cancelar disparo anterior se houver
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
        }
        
        // 1. Desaparecer com o texto anterior imediatamente quando uma nova tecla for pressionada
        setSelectedVelocity(null);
        
        // 2. Mostrar nova velocidade selecionada após VELOCITY_DISPLAY_DELAY
        setTimeout(() => {
          setSelectedVelocity(velocity);
        }, VELOCITY_DISPLAY_DELAY);
        
        // 3. Disparar após FIRE_DELAY (1 segundo)
        fireTimeoutRef.current = setTimeout(() => {
          handleFire(velocity);
          fireTimeoutRef.current = null;
          // Não limpar selectedVelocity aqui - deixar visível mesmo após disparo
        }, FIRE_DELAY);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (fireTimeoutRef.current) {
        clearTimeout(fireTimeoutRef.current);
      }
    };
  }, [handleFire]);

  // Listener para tecla "Esc" esconder/mostrar indicação de distância
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDistanceIndicator(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    const animate = (currentTime: number) => {
      setBullets(prevBullets => {
        const activeBullets = prevBullets.filter(b => b.isActive);
        if (activeBullets.length === 0) {
          isAnimatingRef.current = false;
          return prevBullets;
        }

        isAnimatingRef.current = true;
        const updatedBullets = prevBullets.map(bullet => {
          if (!bullet.isActive) return bullet;

          const currentElapsed = ((currentTime - bullet.startTime) / 1000) * ANIMATION_SPEED; // segundos
          const deltaTime = currentElapsed - bullet.time; // Tempo desde a última atualização
          
          if (deltaTime <= 0) return bullet; // Evitar cálculos desnecessários
          
          // Calcular nova posição com física usando integração numérica
          // Usar a posição atual da bala para calcular a gravidade
          const currentX = bullet.x;
          const currentY = bullet.y;
          const distanceFromCenter = Math.sqrt(currentX * currentX + currentY * currentY);
          
          let newX: number;
          let newY: number;
          let newVx: number;
          let newVy: number;
          
          if (distanceFromCenter > 0 && distanceFromCenter > EARTH_RADIUS_PX) {
            // Calcular aceleração gravitacional (lei do inverso do quadrado)
            // g = GM/r², mas vamos usar g₀ * (r₀/r)² para simplificar
            // Onde g₀ é a gravidade na superfície e r₀ é o raio da Terra
            const earthRadiusKm = EARTH_RADIUS_KM;
            const currentDistanceKm = distanceFromCenter / SCALE_KM_TO_PX;
            const gravityAtSurface = GRAVITY_KM_S2; // Gravidade na superfície em km/s²
            const gravityAtDistance = gravityAtSurface * Math.pow(earthRadiusKm / currentDistanceKm, 2);
            const gravityPxS2 = gravityAtDistance * SCALE_KM_TO_PX;
            
            // Direção do centro para a bala (normalizada)
            const dirX = currentX / distanceFromCenter;
            const dirY = currentY / distanceFromCenter;
            
            // Aceleração gravitacional apontando para o centro (oposta à direção)
            const accelX = -gravityPxS2 * dirX;
            const accelY = -gravityPxS2 * dirY;
            
            // Usar velocidade atual armazenada
            const vx = bullet.vx;
            const vy = bullet.vy;
            
            // Integração numérica (método de Verlet/leapfrog para melhor precisão)
            // Nova velocidade
            newVx = vx + accelX * deltaTime;
            newVy = vy + accelY * deltaTime;
            
            // Nova posição usando velocidade média (método de Euler-Cromer)
            newX = currentX + newVx * deltaTime;
            newY = currentY + newVy * deltaTime;
          } else {
            // Se muito próximo do centro ou dentro da Terra, manter posição
            newX = currentX;
            newY = currentY;
            newVx = bullet.vx;
            newVy = bullet.vy;
          }

          // Verificar se a bala colidiu com a Terra
          const newDistanceFromCenter = Math.sqrt(newX * newX + newY * newY);
          if (newDistanceFromCenter <= EARTH_RADIUS_PX) {
            // Bala colidiu com a Terra - posicionar na superfície
            const angle = Math.atan2(newY, newX);
            const surfaceX = Math.cos(angle) * EARTH_RADIUS_PX;
            const surfaceY = Math.sin(angle) * EARTH_RADIUS_PX;
            
            return {
              ...bullet,
              x: surfaceX,
              y: surfaceY,
              vx: 0,
              vy: 0,
              time: currentElapsed,
              isActive: false
            };
          }

          // Continuar calculando a posição mesmo se sair da tela
          // A bala só será renderizada se estiver dentro da área visível
          return {
            ...bullet,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            time: currentElapsed
          };
        });

        const hasActiveBullets = updatedBullets.some(b => b.isActive);
        if (hasActiveBullets && isAnimatingRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }

        return updatedBullets;
      });
    };

    // Iniciar animação se houver balas ativas
    const activeBullets = bullets.filter(b => b.isActive);
    if (activeBullets.length > 0 && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        isAnimatingRef.current = false;
      }
    };
  }, [bullets, cannonWidth, initialY]);

  return (
    <div style={{
      backgroundColor: 'black',
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={terraImage} 
          alt="Terra" 
          style={{
            width: `${EARTH_DIAMETER}px`,
            height: `${EARTH_DIAMETER}px`
          }}
        />
        <img 
          ref={cannonRef}
          src={canhaoImage} 
          alt="Canhão" 
          style={{ 
            position: 'absolute',
            height: `${CANNON_HEIGHT}px`,
            top: `calc(50% + ${initialY}px)`,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'auto'
          }}
        />
        {selectedVelocity !== null && (
          <div
            style={{
              position: 'absolute',
              top: `calc(50% + ${initialY}px - ${CANNON_HEIGHT / 2 + 5}px)`,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: `${FONT_SIZE}px`,
              fontWeight: 'bold',
              color: 'white',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.8), 0 0 16px rgba(255, 255, 255, 0.5)',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            {selectedVelocity.toString().replace('.', ',')} km/s
          </div>
        )}
        {showDistanceIndicator && (
          <>
            {/* Linha horizontal cortando a superfície - centro no topo da Terra */}
            <div
              style={{
                position: 'absolute',
                top: `calc(50% + ${-EARTH_RADIUS_PX}px)`,
                left: '50%',
                width: '200px',
                height: '1px',
                backgroundColor: 'white',
                transform: 'translate(-50%, -50%)'
              }}
            />
            {/* Linha vertical da superfície até a altura do canhão - no extremo esquerdo da linha horizontal */}
            <div
              style={{
                position: 'absolute',
                top: `calc(50% + ${(initialY + (-EARTH_RADIUS_PX + 10)) / 2}px)`,
                left: `calc(50% - 100px)`,
                width: '1px',
                height: `${Math.abs(initialY + EARTH_RADIUS_PX) - 10}px`,
                backgroundColor: 'white',
                transform: 'translateY(-50%)'
              }}
            />
            {/* Seta para cima no topo da linha vertical */}
            <div
              style={{
                position: 'absolute',
                top: `calc(50% + ${initialY + ARROW_TOP_V_POSITION}px)`,
                left: '50%',
                transform: `translateX(calc(${ARROWS_H}px - 50%))`,
                color: 'white',
                fontSize: '10px',
                lineHeight: '1',
                pointerEvents: 'none',
                userSelect: 'none',
                textAlign: 'center',
                width: '10px'
              }}
            >
              ▲
            </div>
            {/* Seta para baixo na base da linha vertical */}
            <div
              style={{
                position: 'absolute',
                top: `calc(50% + ${-EARTH_RADIUS_PX + ARROW_BOTTOM_V_POSITION}px)`,
                left: '50%',
                transform: `translateX(calc(${ARROWS_H}px - 50%))`,
                color: 'white',
                fontSize: '10px',
                lineHeight: '1',
                pointerEvents: 'none',
                userSelect: 'none',
                textAlign: 'center',
                width: '10px'
              }}
            >
              ▼
            </div>
            {/* Texto "2.000 km" */}
            <div
              style={{
                position: 'absolute',
                top: `calc(50% + ${(initialY + (-EARTH_RADIUS_PX + 10)) / 2}px)`,
                left: `calc(50% - 100px - 10px)`,
                transform: 'translateX(-100%) translateY(-50%)',
                fontSize: `${FONT_SIZE - 2}px`,
                color: 'white',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                lineHeight: '1',
                paddingRight: '10px'
              }}
            >
              {CANNON_DISTANCE_KM.toLocaleString('pt-BR')} km
            </div>
          </>
        )}
        {bullets.map(bullet => {
          // Verificar se a bala está dentro da área visível (com margem)
          const visibleArea = EARTH_DIAMETER * 2; // Área visível 2x o diâmetro da Terra
          const isVisible = Math.abs(bullet.x) < visibleArea && 
                           Math.abs(bullet.y) < visibleArea;
          
          // Só renderizar se estiver visível ou se colidiu (para mostrar onde caiu)
          if (!isVisible && bullet.isActive) {
            return null;
          }
          
          return (
            <div
              key={bullet.id}
              style={{
                position: 'absolute',
                left: `calc(50% + ${bullet.x}px)`,
                top: `calc(50% + ${bullet.y}px)`,
                width: '8px',
                height: '8px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 4px white'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default NewtonCannon;
