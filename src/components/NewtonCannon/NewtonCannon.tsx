import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import terraImage from '../../images/terra.png';
import planetaRochosoImage from '../../images/planeta-rochoso.png';
import canhaoImage from '../../images/canhao.png';
import balaImage from '../../images/bala.png';
import humanImage from '../../images/human.png';
import './NewtonCannon.css';

const CANNON_HEIGHT = 80;
const HUMAN_HEIGHT = 40; // Altura do humano em pixels
const EARTH_DIAMETER = 600;
const EARTH_RADIUS_KM = 6371; // Raio da Terra em km
const EARTH_RADIUS_PX = EARTH_DIAMETER / 2;
const SCALE_KM_TO_PX = EARTH_RADIUS_PX / EARTH_RADIUS_KM; // km para pixels
const CANNON_DISTANCE_KM = 2000; // Distância da boca do canhão à superfície em km
const GRAVITY_M_S2 = 9.8; // Gravidade em m/s²
const GRAVITY_KM_S2 = GRAVITY_M_S2 / 1000; // Gravidade em km/s²
// Constantes para cálculo do raio de Schwarzschild (buraco negro)
const G = 6.67430e-11; // Constante gravitacional em m³/(kg·s²)
const C = 299792458; // Velocidade da luz em m/s
const M_EARTH = 5.972e24; // Massa da Terra em kg
// Constantes para o Sol
const M_SUN = 1.989e30; // Massa do Sol em kg
// Constantes para buraco negro (usando massa do Sol)
const SCHWARZSCHILD_RADIUS_M = (2 * G * M_SUN) / (C * C); // Raio de Schwarzschild em metros (massa do Sol)
const SCHWARZSCHILD_DIAMETER_M = SCHWARZSCHILD_RADIUS_M * 2; // Diâmetro do horizonte de eventos em metros
const BLACK_HOLE_GRAVITY_M_S2 = (G * M_SUN) / (SCHWARZSCHILD_RADIUS_M * SCHWARZSCHILD_RADIUS_M); // Gravidade na superfície do horizonte de eventos em m/s²
const BLACK_HOLE_GRAVITY_G = BLACK_HOLE_GRAVITY_M_S2 / GRAVITY_M_S2; // Gravidade em G (múltiplos da gravidade terrestre)
// Constantes para estrela de nêutrons (raio típico para massa do Sol)
const NEUTRON_STAR_RADIUS_M = 12000; // Raio de estrela de nêutrons em metros (~12 km, valor típico)
const NEUTRON_STAR_DIAMETER_M = NEUTRON_STAR_RADIUS_M * 2; // Diâmetro em metros
const NEUTRON_STAR_GRAVITY_M_S2 = (G * M_SUN) / (NEUTRON_STAR_RADIUS_M * NEUTRON_STAR_RADIUS_M); // Gravidade na superfície em m/s²
const NEUTRON_STAR_GRAVITY_G = NEUTRON_STAR_GRAVITY_M_S2 / GRAVITY_M_S2; // Gravidade em G
const SUN_RADIUS_KM = 696340; // Raio do Sol em km
const SUN_DIAMETER_PX = EARTH_DIAMETER + 80; // Diâmetro do Sol em pixels (visual)
const SUN_RADIUS_PX = SUN_DIAMETER_PX / 2; // Raio do Sol em pixels
const SUN_RADIUS_M = SUN_RADIUS_KM * 1000; // Raio do Sol em metros
const SUN_SCALE_KM_TO_PX = SUN_RADIUS_PX / SUN_RADIUS_KM; // Escala km para pixels do Sol
const SUN_GRAVITY_M_S2 = (G * M_SUN) / (SUN_RADIUS_M * SUN_RADIUS_M); // Gravidade na superfície do Sol em m/s²
const SUN_GRAVITY_KM_S2 = SUN_GRAVITY_M_S2 / 1000; // Gravidade na superfície do Sol em km/s²
const SUN_GRAVITY_G = SUN_GRAVITY_M_S2 / GRAVITY_M_S2; // Gravidade do Sol em G (múltiplos da gravidade terrestre)
// Velocidades orbitais
const EARTH_RADIUS_M = EARTH_RADIUS_KM * 1000; // Raio da Terra em metros
const EARTH_ORBITAL_VELOCITY_KM_S = Math.sqrt((G * M_EARTH) / EARTH_RADIUS_M) / 1000; // Velocidade orbital da Terra em km/s (~7.9 km/s)
const SUN_ORBITAL_VELOCITY_KM_S = Math.sqrt((G * M_SUN) / SUN_RADIUS_M) / 1000; // Velocidade orbital do Sol em km/s (~437 km/s)
// Velocidades orbitais ajustadas para reduzir acentuação da parábola (92% da velocidade orbital)
const EARTH_ORBITAL_VELOCITY_ADJUSTED_KM_S = EARTH_ORBITAL_VELOCITY_KM_S * 0.92;
const SUN_ORBITAL_VELOCITY_ADJUSTED_KM_S = SUN_ORBITAL_VELOCITY_KM_S * 0.92;
const ANIMATION_SPEED_BROWSER = 1200; // Multiplicador de velocidade da animação no browser (padrão)

// Ler ANIMATION_SPEED da query string se disponível, senão usar padrão do browser
const getAnimationSpeed = (): number => {
  if (typeof window === 'undefined') {
    return ANIMATION_SPEED_BROWSER; // Valor padrão se window não estiver disponível (SSR)
  }
  const urlParams = new URLSearchParams(window.location.search);
  const speedParam = urlParams.get('animationSpeed');
  if (speedParam) {
    const speed = parseFloat(speedParam);
    if (!isNaN(speed) && speed > 0) {
      return speed;
    }
  }
  return ANIMATION_SPEED_BROWSER; // Valor padrão do browser
};

const ANIMATION_SPEED = getAnimationSpeed(); // Multiplicador de velocidade da animação (pode ser sobrescrito via query string)
const VELOCITY_DISPLAY_DELAY = 500; // Delay em milissegundos para mostrar a velocidade (0,5 segundo)
const FIRE_DELAY = 500; // Delay em milissegundos antes de disparar (1 segundo)
const FONT_SIZE = 18; // Tamanho da fonte do texto de velocidade em pixels
const ARROWS_H = -99.5; // Posição horizontal das setas (em pixels a partir do centro)
const ARROW_TOP_V_POSITION = 1; // Ajuste vertical da seta de cima (em pixels)
const ARROW_BOTTOM_V_POSITION = -9; // Ajuste vertical da seta de baixo (em pixels)
const ROCK_PLANET_DIMENSION = 101; // Tamanho do planeta rochoso em percentagem (100% = mesmo tamanho da Terra)
const SIZE_CHANGE_SPEED = 1; // Velocidade da mudança de tamanho do planeta em segundos (apenas para tecla "-")

// Velocidades de disparo por tecla para a Terra (em km/s)
// Ajustadas para que a tecla '7' seja a velocidade orbital (ajustada para reduzir acentuação)
const EARTH_VELOCITY_BY_KEY: { [key: string]: number } = {
  "1": 1,   
  "2": 2,   
  "3": 3 ,  
  "4": 4 , 
  "5": 5,  
  "6": 6,  
  "7": EARTH_ORBITAL_VELOCITY_ADJUSTED_KM_S,    // Velocidade orbital ajustada da Terra
  "9": 9.76,  // Velocidade de escape da Terra
};

// Velocidade de escape do Sol (sqrt(2) * velocidade orbital)
const SUN_ESCAPE_VELOCITY_KM_S = Math.sqrt(2) * SUN_ORBITAL_VELOCITY_KM_S;

// Função que retorna as velocidades baseadas no objeto visível
const getVelocityByKey = (isSun: boolean): { [key: string]: number } => {
  if (!isSun) {
    return EARTH_VELOCITY_BY_KEY;
  }
  
  // Para o Sol, calcular proporcionalmente baseado na velocidade orbital ajustada
  const ratio = SUN_ORBITAL_VELOCITY_ADJUSTED_KM_S / EARTH_ORBITAL_VELOCITY_ADJUSTED_KM_S;
  
  return {
    "1": EARTH_VELOCITY_BY_KEY["1"] * ratio,
    "2": EARTH_VELOCITY_BY_KEY["2"] * ratio,
    "3": EARTH_VELOCITY_BY_KEY["3"] * ratio,
    "4": EARTH_VELOCITY_BY_KEY["4"] * ratio,
    "5": EARTH_VELOCITY_BY_KEY["5"] * ratio,
    "6": EARTH_VELOCITY_BY_KEY["6"] * ratio,
    "7": SUN_ORBITAL_VELOCITY_ADJUSTED_KM_S,  // Velocidade orbital ajustada do Sol
    "9": SUN_ESCAPE_VELOCITY_KM_S,  // Velocidade de escape do Sol
  };
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
  const [showSun, setShowSun] = useState<boolean>(true); // Sol aparece automaticamente
  const [planetSize, setPlanetSize] = useState<number>(100); // Tamanho do planeta em percentagem (100% = tamanho original)
  const [targetPlanetSize, setTargetPlanetSize] = useState<number>(100); // Tamanho alvo do planeta para animação (apenas para tecla "-")
  const [humanRotation, setHumanRotation] = useState<number>(0); // Rotação do humano em graus (0 = em pé, -90 = deitado)
  const [humanPosition, setHumanPosition] = useState<'top' | 'surface'>('top'); // Posição do humano: 'top' = linha tracejada, 'surface' = superfície atual
  const [humanY, setHumanY] = useState<number>(-EARTH_RADIUS_PX); // Posição Y atual do humano (topo = negativo)
  const [targetHumanY, setTargetHumanY] = useState<number>(-EARTH_RADIUS_PX); // Posição Y alvo do humano para animação (topo = negativo)
  const [showHuman, setShowHuman] = useState<boolean>(true); // Visibilidade do humano
  const [sunFrameIndex, setSunFrameIndex] = useState<number>(1); // Índice do frame atual do Sol
  const humanYRef = useRef<number>(0);
  const previousPlanetSizeRef = useRef<number>(planetSize);
  const sunFrameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cannonWidthRef = useRef<number>(0);
  const showSunRef = useRef<boolean>(showSun);
  const useRockPlanetRef = useRef<boolean>(useRockPlanet);
  const animationFrameRef = useRef<number | null>(null);
  const bulletIdCounter = useRef<number>(0);
  const cannonRef = useRef<HTMLImageElement | null>(null);
  const isAnimatingRef = useRef<boolean>(false);
  const fireTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const planetSizeRef = useRef<number>(100);

  // Posição inicial da boca do canhão (centro do objeto + raio + distância)
  // Usar sempre o raio da Terra para manter o canhão na mesma posição visual
  // A física das balas usará a escala correta baseada no objeto visível
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

  // Atualizar refs quando os estados mudarem
  useEffect(() => {
    showSunRef.current = showSun;
  }, [showSun]);

  useEffect(() => {
    useRockPlanetRef.current = useRockPlanet;
  }, [useRockPlanet]);

  // Desligar humano e indicador de altura quando o Sol estiver visível
  useEffect(() => {
    if (showSun) {
      setShowHuman(false);
      setShowDistanceIndicator(false);
    }
  }, [showSun]);

  // Animação dos frames do Sol
  useEffect(() => {
    if (!showSun) {
      // Limpar intervalo se o Sol não estiver visível
      if (sunFrameIntervalRef.current) {
        clearInterval(sunFrameIntervalRef.current);
        sunFrameIntervalRef.current = null;
      }
      return;
    }

    // Número total de frames: 11303 frames (vídeo original tem ~3 minutos a 60fps)
    const TOTAL_SUN_FRAMES = 11303; // Frames disponíveis do vídeo do Sol
    // Reduzir FPS para rotação mais lenta e visível (30 FPS = metade da velocidade original)
    const FPS = 30; // Frames por segundo (metade de 60 para rotação mais lenta)
    const FRAME_INTERVAL = 1000 / FPS; // Intervalo em milissegundos (~33.33ms)

    // Iniciar animação
    sunFrameIntervalRef.current = setInterval(() => {
      setSunFrameIndex(prev => {
        const next = prev + 1;
        // Fazer loop quando chegar ao último frame
        return next > TOTAL_SUN_FRAMES ? 1 : next;
      });
    }, FRAME_INTERVAL);

    // Limpar intervalo ao desmontar
    return () => {
      if (sunFrameIntervalRef.current) {
        clearInterval(sunFrameIntervalRef.current);
        sunFrameIntervalRef.current = null;
      }
    };
  }, [showSun]);

  const handleFire = useCallback((velocity: number) => {
    // Usar a ref para garantir que temos o valor mais atualizado
    const currentCannonWidth = cannonRef.current?.offsetWidth || cannonWidthRef.current || cannonWidth;
    const bulletInitialX = currentCannonWidth / 2;
    
    // Converter velocidade de km/s para px/s
    // Usar a escala correta baseada no objeto visível (Sol ou Terra)
    const currentScaleKmToPx = showSun ? SUN_SCALE_KM_TO_PX : SCALE_KM_TO_PX;
    const initialVelocityPxS = velocity * currentScaleKmToPx;
    
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
  }, [cannonWidth, showSun, initialY]);

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
      
      const velocityByKey = getVelocityByKey(showSunRef.current);
      if (key in velocityByKey) {
        const velocity = velocityByKey[key];
        
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
        // Trocar entre Terra, planeta rochoso e Sol
        // Ciclo: Sol -> Terra -> Planeta Rochoso -> Sol
        // Usar refs para garantir que lemos o estado mais atualizado
        const currentShowSun = showSunRef.current;
        const currentUseRockPlanet = useRockPlanetRef.current;
        
        if (currentShowSun) {
          // Se está mostrando Sol, mudar para Terra
          setShowSun(false);
          setUseRockPlanet(false);
          setPlanetSize(100);
        } else if (currentUseRockPlanet) {
          // Se está mostrando planeta rochoso, mudar para Sol
          setShowSun(true);
          setUseRockPlanet(false);
          setPlanetSize(100);
        } else {
          // Se está mostrando Terra, mudar para planeta rochoso
          setShowSun(false);
          setUseRockPlanet(true);
          setPlanetSize(ROCK_PLANET_DIMENSION);
        }

        // Sempre limpar todas as balas ao trocar entre Terra / planeta rochoso / Sol
        setBullets([]);

        // Desligar o indicador de velocidade e cancelar disparo agendado, se houver
        setSelectedVelocity(null);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
          fireTimeoutRef.current = null;
        }
      }
      if (event.key === '-' || event.key === '_') {
        // Diminuir planeta em 50% do tamanho atual (com animação suave)
        setTargetPlanetSize(prev => {
          const newSize = prev * 0.5;
          // Permite diminuir até 1.5% para garantir visualização do buraco negro
          // O buraco negro aparece quando planetSize < 3.1%
          return Math.max(newSize, 1.5);
        });
      }
      if (event.key === '+' || event.key === '=') {
        // Voltar suavemente para 100% do tamanho original (com animação)
        setTargetPlanetSize(100);
      }
      if (event.key === 'h' || event.key === 'H') {
        // Rotacionar humano 90° para a esquerda (ou voltar para 0°)
        setHumanRotation(prev => prev === 0 ? -90 : 0);
      }
      if (event.key === 'ArrowDown') {
        // Mover humano para a superfície do planeta
        if (humanPosition === 'top') {
          setHumanPosition('surface');
          // Calcular posição Y da superfície atual do planeta (topo = negativo)
          const currentSurfaceY = -EARTH_RADIUS_PX * (planetSize / 100);
          setTargetHumanY(currentSurfaceY);
        } else {
          // Voltar para a linha tracejada (superfície a 100%)
          setHumanPosition('top');
          setTargetHumanY(-EARTH_RADIUS_PX);
        }
      }
      if (event.key === 'j' || event.key === 'J') {
        // Mostrar/ocultar humano
        setShowHuman(prev => !prev);
      }
      if (event.key === 'z' || event.key === 'Z') {
        // Desligar tudo, exceto planeta/Sol, indicador de gravidade e círculo tracejado
        setShowCannon(false);
        setShowDistanceIndicator(false);
        setShowInstructions(false);
        setShowHuman(false);
        setSelectedVelocity(null);
        // Remover todas as balas (incluindo as que estão orbitando)
        setBullets([]);
        // Cancelar animação de balas
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        isAnimatingRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showCannon, humanPosition, planetSize]);

  // Inicializar posição Y do humano na linha tracejada (superfície a 100%)
  useEffect(() => {
    setHumanY(-EARTH_RADIUS_PX);
    setTargetHumanY(-EARTH_RADIUS_PX);
    humanYRef.current = -EARTH_RADIUS_PX;
  }, []);

  // Atualizar refs quando valores mudarem
  useEffect(() => {
    planetSizeRef.current = planetSize;
  }, [planetSize]);

  useEffect(() => {
    humanYRef.current = humanY;
  }, [humanY]);

  // Atualizar posição Y do humano quando o planeta mudar de tamanho (apenas se estiver na superfície E o planeta estiver crescendo)
  useEffect(() => {
    if (humanPosition === 'surface') {
      const isPlanetGrowing = planetSize > previousPlanetSizeRef.current;
      if (isPlanetGrowing) {
        // Se o planeta está crescendo, o humano sobe automaticamente
        const currentSurfaceY = -EARTH_RADIUS_PX * (planetSize / 100);
        setTargetHumanY(currentSurfaceY);
      }
      // Se o planeta está diminuindo, o humano NÃO desce automaticamente (só via teclado)
    }
    // Se estiver em 'top', não acompanha - fica na linha tracejada (100%)
    previousPlanetSizeRef.current = planetSize;
  }, [planetSize, humanPosition]);

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

  // Animação linear do movimento do humano com velocidade constante
  useEffect(() => {
    const startTime = performance.now();
    const startY = humanYRef.current;
    const yDifference = targetHumanY - startY;
    
    // Calcular velocidade em pixels por segundo baseada na velocidade do planeta
    // O planeta muda de 100% para 50% em SIZE_CHANGE_SPEED segundos
    // Distância: EARTH_RADIUS_PX * 0.5, então velocidade = distância / tempo
    // Multiplicar por 1.5 para que o humano seja mais rápido que o planeta
    const humanSpeedPxPerSecond = ((EARTH_RADIUS_PX * 0.5) / SIZE_CHANGE_SPEED) * 1.5;
    const duration = (Math.abs(yDifference) / humanSpeedPxPerSecond) * 1000; // Converter para milissegundos

    // Se já está na posição alvo, não precisa animar
    if (Math.abs(yDifference) < 0.01) {
      return;
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // Clamp entre 0 e 1

      // Interpolação linear
      const newY = startY + (yDifference * progress);
      setHumanY(newY);
      humanYRef.current = newY;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [targetHumanY]); // Apenas quando a posição Y alvo mudar

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
          let hasCollided = false;
          
          // Aplicar física em sub-steps para movimento suave e preciso
          for (let step = 0; step < numSteps; step++) {
            const distanceFromCenter = Math.sqrt(currentX * currentX + currentY * currentY);
            
            // Determinar raio e gravidade baseado no objeto visível
            const isSun = showSun;
            const objectRadiusPx = isSun ? SUN_RADIUS_PX * (planetSize / 100) : EARTH_RADIUS_PX * (planetSize / 100);
            // Para o Sol, a bala para 32px mais dentro, então a física só aplica fora desse raio
            const physicsRadiusPx = isSun ? objectRadiusPx - 32 : objectRadiusPx;
            const objectRadiusKm = isSun ? SUN_RADIUS_KM : EARTH_RADIUS_KM;
            const scaleKmToPx = isSun ? SUN_SCALE_KM_TO_PX : SCALE_KM_TO_PX;
            
            if (distanceFromCenter > 0 && distanceFromCenter > physicsRadiusPx) {
              // Calcular aceleração gravitacional (lei do inverso do quadrado)
              const currentDistanceKm = distanceFromCenter / scaleKmToPx;
              const gravityAtSurface = isSun ? SUN_GRAVITY_KM_S2 : GRAVITY_KM_S2; // Gravidade na superfície em km/s²
              const gravityAtDistance = gravityAtSurface * Math.pow(objectRadiusKm / currentDistanceKm, 2);
              const gravityPxS2 = gravityAtDistance * scaleKmToPx;
              
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
              
              // Verificar colisão após atualizar posição
              const newDistanceFromCenter = Math.sqrt(currentX * currentX + currentY * currentY);
              if (newDistanceFromCenter <= physicsRadiusPx) {
                // Bala colidiu - ajustar posição final
                const angle = Math.atan2(currentY, currentX);
                currentX = Math.cos(angle) * physicsRadiusPx;
                currentY = Math.sin(angle) * physicsRadiusPx;
                currentVx = 0;
                currentVy = 0;
                hasCollided = true;
                break;
              }
            } else {
              // Se muito próximo do centro ou dentro do objeto, parar
              hasCollided = true;
              break;
            }
          }
          
          const newX = currentX;
          const newY = currentY;
          const newVx = currentVx;
          const newVy = currentVy;

          // Verificar se a bala colidiu com o objeto (Terra ou Sol)
          const newDistanceFromCenter = Math.sqrt(newX * newX + newY * newY);
          const currentObjectRadiusPx = showSun ? SUN_RADIUS_PX * (planetSize / 100) : EARTH_RADIUS_PX * (planetSize / 100);
          // Para o Sol, a bala para 32px mais dentro
          const collisionRadiusPx = showSun ? currentObjectRadiusPx - 32 : currentObjectRadiusPx;
          if (hasCollided || newDistanceFromCenter <= collisionRadiusPx) {
            // Bala colidiu com o objeto - posicionar na superfície (ou 32px dentro para o Sol)
            const angle = Math.atan2(newY, newX);
            const surfaceX = Math.cos(angle) * collisionRadiusPx;
            const surfaceY = Math.sin(angle) * collisionRadiusPx;
            
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
  }, [bullets, cannonWidth, initialY, showSun, planetSize]);

  // Função para formatar velocidade (substituir ponto por vírgula)
  const formatVelocity = (velocity: number): string => {
    return Math.round(velocity).toString();
  };

  // Função para formatar número com vírgula decimal e ponto como separador de milhar
  const formatNumber = (num: number, decimals: number = 0): string => {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
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
              {Object.entries(getVelocityByKey(showSun)).sort(([a], [b]) => {
                // Ordenar: números primeiro (1-9), depois 0
                if (a === '0') return 1;
                if (b === '0') return -1;
                return a.localeCompare(b);
              }).map(([key, velocity]) => {
                let description = `dispara a ${formatVelocity(velocity)} km/s`;
                if (key === '7') {
                  description += ' (velocidade orbital)';
                } else if (key === '9') {
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
                <td>z</td>
                <td>desliga tudo (exceto planeta, gravidade e círculo)</td>
              </tr>
              <tr>
                <td>y</td>
                <td>troca entre Terra, planeta rochoso e Sol</td>
              </tr>
              <tr>
                <td>-</td>
                <td>diminui tamanho do planeta (50%)</td>
              </tr>
              <tr>
                <td>+</td>
                <td>volta tamanho do planeta para 100%</td>
              </tr>
              <tr>
                <td>j</td>
                <td>liga/desliga humano</td>
              </tr>
              <tr>
                <td>h</td>
                <td>rota o humano (em pé/deitado)</td>
              </tr>
              <tr>
                <td>↓</td>
                <td>move humano para superfície/linha tracejada</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {planetSize < 99.99 && (
        <>
          <div
            className="planet-reference-circle"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${EARTH_DIAMETER}px`,
              height: `${EARTH_DIAMETER}px`,
              zIndex: 5
            }}
          />
          <div
            className="planet-size-indicator"
            style={{
              position: 'absolute',
              left: `calc(50% + ${(showSun ? SUN_RADIUS_PX : EARTH_RADIUS_PX) + 50}px)`,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: `${FONT_SIZE - 2}px`
            }}
          >
            {planetSize < 3.1 ? (
              <>
                {formatNumber(SCHWARZSCHILD_DIAMETER_M / 1000, 1)} km - buraco negro
              </>
            ) : planetSize < 6.2 ? (
              <>
                {formatNumber(Math.round(NEUTRON_STAR_DIAMETER_M / 1000), 0)} km - estrela de nêutrons
              </>
            ) : (
              <>tamanho: {formatNumber(Math.round(planetSize), 0)}%</>
            )}
          </div>
        </>
      )}
      {/* Indicador de gravidade na superfície atual do planeta/Sol */}
      <div
        className="planet-gravity-indicator"
        style={{
          position: 'absolute',
          left: `calc(50% - ${(showSun ? SUN_RADIUS_PX * (planetSize / 100) : EARTH_RADIUS_PX * (planetSize / 100)) + 30}px)`,
          top: '50%',
          transform: 'translate(-100%, -50%)',
          fontSize: `${FONT_SIZE - 2}px`,
          textAlign: 'center',
          zIndex: 10
        }}
      >
      {planetSize < 3.1 ? (
        <>
          <div>{formatNumber(Math.round((BLACK_HOLE_GRAVITY_G / 1e12) * 10) / 10, 1)} trilhões de G</div>
        </>
      ) : planetSize < 6.2 ? (
        <div>{formatNumber(Math.round(NEUTRON_STAR_GRAVITY_G / 1e9), 0)} bilhões de G</div>
      ) : showSun ? (
        <div>{formatNumber(Math.max(1, Math.round(SUN_GRAVITY_G * Math.pow(100 / planetSize, 2))))} G</div>
      ) : (
        <div>{formatNumber(Math.ceil(Math.pow(100 / planetSize, 2)))} G</div>
      )}
      </div>
      {!showSun && (
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
        </div>
      )}
      {/* Canhão e texto de velocidade - aparece tanto para planeta quanto para Sol */}
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
              {Math.round(selectedVelocity)} km/s
            </div>
          )}
        </>
      )}
      {/* Sol */}
      {showSun && (
        <img
          src={`/video-element-frames/frame-${String(sunFrameIndex).padStart(6, '0')}.png`}
          alt="Sol animado"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${(EARTH_DIAMETER + 80) * (planetSize / 100)}px`,
            height: `${(EARTH_DIAMETER + 80) * (planetSize / 100)}px`,
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 1
          }}
        />
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
      {/* Humano */}
      {showHuman && (
        <img 
          src={humanImage} 
          alt="Humano" 
          style={{
            position: 'absolute',
            left: '50%',
            top: `calc(50% + ${humanY}px)`,
            transform: humanRotation === 0 
              ? `translate(-50%, -100%) rotate(${humanRotation}deg)`
              : `translate(calc(-50% + ${HUMAN_HEIGHT / 2}px), -100%) rotate(${humanRotation}deg)`, // Quando deitado, ajusta horizontalmente para compensar
            transformOrigin: humanRotation === 0 ? '50% 100%' : '0% 100%', // Em pé: pés embaixo (centro horizontal, parte inferior). Deitado: canto inferior esquerdo (que fica embaixo após rotação)
            width: 'auto',
            height: `${HUMAN_HEIGHT}px`,
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        />
      )}
      {bullets.map(bullet => {
          // Verificar se a bala está dentro da área visível (com margem)
          const visibleArea = EARTH_DIAMETER * 2; // Área visível 2x o diâmetro da Terra
          const isVisible = Math.abs(bullet.x) < visibleArea && 
                           Math.abs(bullet.y) < visibleArea;
          
          // Se colidiu com o Sol, não renderizar (desaparece)
          if (!bullet.isActive && showSun) {
            return null;
          }
          
          // Só renderizar se estiver visível ou se colidiu (para mostrar onde caiu na Terra)
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
  );
}

export default NewtonCannon;
