import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import terraImage from '../../images/terra.png';
import planetaRochosoImage from '../../images/planeta-rochoso.png';
import canhaoImage from '../../images/canhao.png';
import balaImage from '../../images/bala.png';
import './NewtonCannon.css';

const CANNON_HEIGHT = 80;
const EARTH_DIAMETER = 600;
const EARTH_RADIUS_KM = 6371; // Raio da Terra em km
const EARTH_RADIUS_PX = EARTH_DIAMETER / 2;
const SCALE_KM_TO_PX = EARTH_RADIUS_PX / EARTH_RADIUS_KM; // km para pixels
const CANNON_DISTANCE_KM = 2000; // Distância da boca do canhão à superfície em km
const GRAVITY_M_S2 = 9.8; // Gravidade em m/s²
const GRAVITY_KM_S2 = GRAVITY_M_S2 / 1000; // Gravidade em km/s²
const ANIMATION_SPEED = 100; // Multiplicador de velocidade da animação
const VELOCITY_DISPLAY_DELAY = 500; // Delay em milissegundos para mostrar a velocidade (0,5 segundo)
const FIRE_DELAY = 500; // Delay em milissegundos antes de disparar (1 segundo)
const FONT_SIZE = 18; // Tamanho da fonte do texto de velocidade em pixels
const ARROWS_H = -99.5; // Posição horizontal das setas (em pixels a partir do centro)
const ARROW_TOP_V_POSITION = 1; // Ajuste vertical da seta de cima (em pixels)
const ARROW_BOTTOM_V_POSITION = -9; // Ajuste vertical da seta de baixo (em pixels)
const ROCK_PLANET_DIMENSION = 101; // Tamanho do planeta rochoso em percentagem (100% = mesmo tamanho da Terra)
const SIZE_CHANGE_SPEED = 1; // Velocidade da mudança de tamanho do planeta em segundos (apenas para tecla "-")

// Velocidades de disparo por tecla (em km/s)
// Ajustadas para que a tecla '7' complete uma órbita em 15 segundos
// As outras velocidades são proporcionais
const VELOCITY_BY_KEY: { [key: string]: number } = {
  "1": 1,   
  "2": 2,   
  "3": 3 ,  
  "4": 4 , 
  "5": 5,  
  "6": 6,  
  "7": 6.9,    
  "9": 9.76,  
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
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [showCannon, setShowCannon] = useState<boolean>(true);
  const [useRockPlanet, setUseRockPlanet] = useState<boolean>(false);
  const [planetSize, setPlanetSize] = useState<number>(100); // Tamanho do planeta em percentagem (100% = tamanho original)
  const [targetPlanetSize, setTargetPlanetSize] = useState<number>(100); // Tamanho alvo do planeta para animação (apenas para tecla "-")
  const cannonWidthRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const bulletIdCounter = useRef<number>(0);
  const cannonRef = useRef<HTMLImageElement | null>(null);
  const isAnimatingRef = useRef<boolean>(false);
  const fireTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const planetSizeRef = useRef<number>(100);

  // Posição inicial da boca do canhão (centro da Terra + raio + distância)
  // Usar sempre o raio original da Terra para manter o canhão, texto e balas fixos
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
    
    // Converter velocidade de km/s para px/s
    // velocity está em km/s, SCALE_KM_TO_PX é px/km, então velocity * SCALE_KM_TO_PX = px/s
    const initialVelocityPxS = velocity * SCALE_KM_TO_PX;
    
    // Debug: descomente para verificar a velocidade
    // console.log(`Disparo: ${velocity} km/s = ${initialVelocityPxS} px/s`);
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
      
      // Tecla "0" desliga o mostrador de velocidade
      if (key === '0') {
        setSelectedVelocity(null);
        // Cancelar disparo anterior se houver
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
          fireTimeoutRef.current = null;
        }
        return;
      }
      
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

  // Listener para tecla "Esc" esconder/mostrar indicação de distância, "Espaço" para instruções, "x" para limpar e "y" para trocar planeta
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDistanceIndicator(prev => !prev);
      }
      if (event.key === ' ') {
        event.preventDefault(); // Prevenir scroll da página
        setShowInstructions(prev => !prev);
      }
      if (event.key === 'x' || event.key === 'X') {
        // Toggle: apagar/mostrar canhão, texto de velocidade e balas na superfície
        if (showCannon) {
          // Apagar canhão, texto de velocidade e balas na superfície
          setShowCannon(false);
          setSelectedVelocity(null);
          // Remover balas que estão na superfície (não ativas)
          setBullets(prev => prev.filter(bullet => bullet.isActive));
        } else {
          // Mostrar canhão novamente
          setShowCannon(true);
        }
      }
      if (event.key === 'y' || event.key === 'Y') {
        // Trocar entre Terra e planeta rochoso
        setUseRockPlanet(prev => {
          const newValue = !prev;
          // Resetar tamanho ao trocar de planeta
          if (newValue) {
            // Mudando para planeta rochoso: usar ROCK_PLANET_DIMENSION
            setPlanetSize(ROCK_PLANET_DIMENSION);
          } else {
            // Mudando para Terra: usar 100%
            setPlanetSize(100);
          }
          return newValue;
        });
      }
      if (event.key === '-' || event.key === '_') {
        // Diminuir planeta em 50% do tamanho atual (com animação suave)
        setTargetPlanetSize(prev => {
          const newSize = prev * 0.5;
          return Math.max(newSize, 0.1); // Limite mínimo de 0.1% para evitar zero
        });
      }
      if (event.key === '+' || event.key === '=') {
        // Voltar suavemente para 100% do tamanho original (com animação)
        setTargetPlanetSize(100);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showCannon]);

  // Atualizar ref quando planetSize mudar
  useEffect(() => {
    planetSizeRef.current = planetSize;
  }, [planetSize]);

  // Animação linear do tamanho do planeta (apenas para tecla "-")
  useEffect(() => {
    const startTime = performance.now();
    const startSize = planetSizeRef.current;
    const sizeDifference = targetPlanetSize - startSize;
    const duration = SIZE_CHANGE_SPEED * 1000; // Converter segundos para milissegundos

    // Se já está no tamanho alvo, não precisa animar
    if (Math.abs(sizeDifference) < 0.01) {
      return;
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // Clamp entre 0 e 1

      // Interpolação linear
      const newSize = startSize + (sizeDifference * progress);
      setPlanetSize(newSize);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [targetPlanetSize]); // Apenas quando o tamanho alvo mudar

  useEffect(() => {
    let lastFrameTime: number | null = null;
    
    const animate = (currentTime: number) => {
      // Sincronizar com refresh rate da tela (normalmente 60Hz = ~16.67ms por frame)
      // Usar timestamp do requestAnimationFrame para melhor sincronização
      if (lastFrameTime === null) {
        lastFrameTime = currentTime;
      }
      
      setBullets(prevBullets => {
        const activeBullets = prevBullets.filter(b => b.isActive);
        if (activeBullets.length === 0) {
          isAnimatingRef.current = false;
          lastFrameTime = null;
          return prevBullets;
        }

        isAnimatingRef.current = true;
        const updatedBullets = prevBullets.map(bullet => {
          if (!bullet.isActive) return bullet;

          const currentElapsed = ((currentTime - bullet.startTime) / 1000) * ANIMATION_SPEED; // segundos
          const deltaTime = currentElapsed - bullet.time; // Tempo desde a última atualização
          
          if (deltaTime <= 0) return bullet; // Evitar cálculos desnecessários
          
          // SEMPRE usar sub-steps para garantir movimento suave e linear
          // Isso elimina "soluços" causados por variações no deltaTime
          // Usar passos pequenos e consistentes garante precisão mesmo com deltaTime variável
          const IDEAL_STEP_TIME = 0.008; // ~8ms por passo (mais preciso que 16ms)
          const numSteps = Math.max(1, Math.ceil(deltaTime / IDEAL_STEP_TIME));
          const stepTime = deltaTime / numSteps;
          
          // Calcular nova posição com física usando integração numérica em sub-steps
          let currentX = bullet.x;
          let currentY = bullet.y;
          let currentVx = bullet.vx;
          let currentVy = bullet.vy;
          
          // Aplicar física em sub-steps para movimento suave e preciso
          for (let step = 0; step < numSteps; step++) {
            const distanceFromCenter = Math.sqrt(currentX * currentX + currentY * currentY);
            
            if (distanceFromCenter > 0 && distanceFromCenter > EARTH_RADIUS_PX) {
              // Calcular aceleração gravitacional (lei do inverso do quadrado)
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
              
              // Integração numérica (método de Euler-Cromer com sub-steps)
              // Atualizar velocidade primeiro
              currentVx = currentVx + accelX * stepTime;
              currentVy = currentVy + accelY * stepTime;
              
              // Atualizar posição usando velocidade atualizada
              currentX = currentX + currentVx * stepTime;
              currentY = currentY + currentVy * stepTime;
            } else {
              // Se muito próximo do centro ou dentro da Terra, parar
              break;
            }
          }
          
          const newX = currentX;
          const newY = currentY;
          const newVx = currentVx;
          const newVy = currentVy;

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
          lastFrameTime = currentTime;
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          lastFrameTime = null;
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

  // Função para formatar velocidade (substituir ponto por vírgula)
  const formatVelocity = (velocity: number): string => {
    return velocity.toString().replace('.', ',');
  };

  return (
    <div className="container">
      {/* Tabela de instruções na extrema esquerda */}
      {showInstructions && (
        <div className="instructions-container" style={{ fontSize: `${FONT_SIZE - 2}px` }}>
          <div className="instructions-title">Instruções:</div>
          <table className="instructions-table" style={{ fontSize: `${FONT_SIZE - 2}px` }}>
            <tbody>
              <tr>
                <td>Espaço</td>
                <td>liga/desliga instruções</td>
              </tr>
              <tr>
                <td>Esc</td>
                <td>liga/desliga indicação altura</td>
              </tr>
              {Object.entries(VELOCITY_BY_KEY).sort(([a], [b]) => {
                // Ordenar: números primeiro (1-9), depois 0
                if (a === '0') return 1;
                if (b === '0') return -1;
                return a.localeCompare(b);
              }).map(([key, velocity]) => {
                let description = `dispara a ${formatVelocity(velocity)} km/s`;
                if (velocity === 6.9) {
                  description += ' (mínima velocidade orbital)';
                } else if (velocity === 9.76) {
                  description += ' (velocidade de escape)';
                }
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{description}</td>
                  </tr>
                );
              })}
              <tr>
                <td>0</td>
                <td>desliga mostrador de velocidade</td>
              </tr>
              <tr>
                <td>x</td>
                <td>liga/desliga canhão, texto e balas na superfície</td>
              </tr>
              <tr>
                <td>y</td>
                <td>troca entre Terra e planeta rochoso</td>
              </tr>
              <tr>
                <td>-</td>
                <td>diminui tamanho do planeta (50%)</td>
              </tr>
              <tr>
                <td>+</td>
                <td>volta tamanho do planeta para 100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="earth-wrapper">
        <img 
          src={useRockPlanet ? planetaRochosoImage : terraImage} 
          alt={useRockPlanet ? "Planeta Rochoso" : "Terra"} 
          className="terra-image"
          style={{
            width: `${EARTH_DIAMETER * (planetSize / 100)}px`,
            height: `${EARTH_DIAMETER * (planetSize / 100)}px`
          }}
        />
        {showCannon && (
          <>
            <img 
              ref={cannonRef}
              src={canhaoImage} 
              alt="Canhão" 
              className="cannon-image"
              style={{ 
                height: `${CANNON_HEIGHT}px`,
                top: `calc(50% + ${initialY}px)`
              }}
            />
            {selectedVelocity !== null && (
              <div
                className="velocity-display"
                style={{
                  top: `calc(50% + ${initialY}px - ${CANNON_HEIGHT / 2 + 5}px)`,
                  fontSize: `${FONT_SIZE}px`
                }}
              >
                {selectedVelocity.toString().replace('.', ',')} km/s
              </div>
            )}
          </>
        )}
        {showDistanceIndicator && (
          <>
            {/* Linha horizontal cortando a superfície - centro no topo da Terra */}
            <div
              className="distance-indicator-horizontal-line"
              style={{
                top: `calc(50% + ${-EARTH_RADIUS_PX}px)`
              }}
            />
            {/* Linha vertical da superfície até a altura do canhão - no extremo esquerdo da linha horizontal */}
            <div
              className="distance-indicator-vertical-line"
              style={{
                top: `calc(50% + ${(initialY + (-EARTH_RADIUS_PX + 10)) / 2}px)`,
                left: `calc(50% - 100px)`,
                height: `${Math.abs(initialY + EARTH_RADIUS_PX) - 10}px`
              }}
            />
            {/* Seta para cima no topo da linha vertical */}
            <div
              className="distance-indicator-arrow"
              style={{
                top: `calc(50% + ${initialY + ARROW_TOP_V_POSITION}px)`,
                transform: `translateX(calc(${ARROWS_H}px - 50%))`
              }}
            >
              ▲
            </div>
            {/* Seta para baixo na base da linha vertical */}
            <div
              className="distance-indicator-arrow"
              style={{
                top: `calc(50% + ${-EARTH_RADIUS_PX + ARROW_BOTTOM_V_POSITION}px)`,
                transform: `translateX(calc(${ARROWS_H}px - 50%))`
              }}
            >
              ▼
            </div>
            {/* Texto "2.000 km" */}
            <div
              className="distance-indicator-text"
              style={{
                top: `calc(50% + ${(initialY + (-EARTH_RADIUS_PX + 10)) / 2}px)`,
                left: `calc(50% - 100px - 10px)`,
                transform: 'translateX(-100%) translateY(-50%)',
                fontSize: `${FONT_SIZE - 2}px`
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
          
          // Usar posições com precisão decimal para movimento suave
          // O navegador moderno suporta sub-pixel rendering, então não precisamos arredondar
          // Isso elimina "soluços" causados por arredondamento
          return (
            <img
              key={bullet.id}
              src={balaImage}
              alt="Bala"
              className="bullet"
              style={{
                transform: `translate(calc(-50% + ${bullet.x}px), calc(-50% + ${bullet.y}px))`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default NewtonCannon;
