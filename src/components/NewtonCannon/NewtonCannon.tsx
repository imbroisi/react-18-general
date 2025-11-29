import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import terraImage from '../../images/terra.png';
import planetaRochosoImage from '../../images/planeta-rochoso.png';
import canhaoImage from '../../images/canhao.png';
import balaImage from '../../images/bala.png';
import humanImage from '../../images/human.png';
import './NewtonCannon.css';

// Importar movie-script (mesmo arquivo usado para geração de vídeo e browser)
// Será carregado dinamicamente via fetch

const CANNON_HEIGHT = 80;
const HUMAN_HEIGHT = 40; // Altura do humano em pixels
const CANNON_MOUTH_OFFSET_PX = 40; // Ajuste fino vertical da boca do canhão (pode ser ajustado para alinhar a órbita no Sol)

/**
 * PRESET ATUAL DE PARÂMETROS FÍSICOS E VISUAIS
 *
 * - Distância do canhão: 2.000 km acima da superfície da Terra (e posição equivalente em px usada também no Sol)
 * - Velocidade orbital "didática" da Terra (tecla 7): 6,9 km/s
 * - Velocidade orbital ajustada do Sol (tecla 7 no Sol): calculada para produzir órbita quase circular
 *   no raio inicial real da bala (considerando geometria atual do canhão e escalas em px)
 * - ANIMATION_SPEED_BROWSER: 1200 (velocidade da animação no browser; o vídeo usa outro parâmetro)
 *
 * Se quiser salvar um novo preset no futuro, basta:
 * - Ajustar as constantes abaixo
 * - Atualizar este comentário com os novos valores-alvo
 */

// Diâmetro físico da Terra em pixels (usado para física/escala)
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
// Parâmetro gravitacional do Sol em km^3/s^2 (μ = G * M_sun, convertido para km)
const MU_SUN_KM3_S2 = SUN_GRAVITY_KM_S2 * SUN_RADIUS_KM * SUN_RADIUS_KM;

// Órbita real da Terra ao redor do Sol (valores astronômicos aproximados)
const EARTH_PERIHELION_KM = 147.095e6;  // km no periélio
const EARTH_APHELION_KM = 152.100e6;    // km no afélio
const EARTH_ORBIT_SEMIMAJOR_AXIS_KM = (EARTH_PERIHELION_KM + EARTH_APHELION_KM) / 2;

// Velocidade angular usada para animar a órbita elíptica (rad/s)
const ELLIPTICAL_ORBIT_ANGULAR_SPEED = 0.5;
// Velocidades orbitais
const EARTH_RADIUS_M = EARTH_RADIUS_KM * 1000; // Raio da Terra em metros
const EARTH_ORBITAL_VELOCITY_KM_S = Math.sqrt((G * M_EARTH) / EARTH_RADIUS_M) / 1000; // Velocidade orbital física da Terra em km/s (~7,9 km/s)
const SUN_ORBITAL_VELOCITY_KM_S = Math.sqrt((G * M_SUN) / SUN_RADIUS_M) / 1000; // Velocidade orbital física do Sol em km/s (~437 km/s)

// Velocidades orbitais ajustadas
// Terra: valor "didático" de 6,9 km/s
const EARTH_ORBITAL_VELOCITY_ADJUSTED_KM_S = 6.9;
// Sol: raio de referência em km (1.000 km acima da superfície)
const SUN_ORBITAL_RADIUS_KM_FOR_KEY7 = SUN_RADIUS_KM + 1000;
// Como na física estamos trazendo a órbita 50px mais para dentro, o raio físico efetivo é um pouco menor:
// r_eff_km = r_ref_km - (50 px / escala_px_por_km_do_Sol)
const SUN_ORBITAL_RADIUS_KM_FOR_KEY7_EFFECTIVE =
  SUN_ORBITAL_RADIUS_KM_FOR_KEY7 - (50 / SUN_SCALE_KM_TO_PX);
// Velocidade orbital ajustada da tecla 7 (usar raio efetivo para órbita circular)
const SUN_ORBITAL_VELOCITY_ADJUSTED_KM_S = Math.sqrt(
  SUN_GRAVITY_KM_S2 * (SUN_RADIUS_KM * SUN_RADIUS_KM) / SUN_ORBITAL_RADIUS_KM_FOR_KEY7_EFFECTIVE
);
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
// Ângulo de lançamento (em graus) para a tecla 7 no Sol (gira o ponto de lançamento na órbita)
const SOL_LAUNCH_ANGLE_DEG = 150;
// Ângulo de rotação VISUAL das órbitas em torno do centro (em graus).
// Ajuste esta variável para girar o desenho da órbita sem mudar a física.
const ORBIT_ROTATION_DEG = 128;

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
  // Tecla 8: valor ajustado para que, no Sol, dê ~520 km/s (mais elíptica que a 7, mas sem escapar demais)
  "8": (520 * EARTH_ORBITAL_VELOCITY_ADJUSTED_KM_S) / SUN_ORBITAL_VELOCITY_ADJUSTED_KM_S,
  "9": 9.76,  // Velocidade de escape da Terra
};

// Velocidade de escape do Sol (sqrt(2) * velocidade orbital)
const SUN_ESCAPE_VELOCITY_KM_S = Math.sqrt(2) * SUN_ORBITAL_VELOCITY_KM_S;
// Velocidade da tecla 9 no Sol (valor ajustado para ~700 km/s)
const SUN_KEY9_VELOCITY_KM_S = 700;

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
    "8": EARTH_VELOCITY_BY_KEY["8"] * ratio,
    "7": SUN_ORBITAL_VELOCITY_ADJUSTED_KM_S,  // Velocidade orbital ajustada do Sol
    "9": SUN_KEY9_VELOCITY_KM_S,  // Velocidade ajustada da tecla 9 no Sol (~680 km/s)
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
  const [showDistanceIndicator, setShowDistanceIndicator] = useState<boolean>(false);
  const [showGravity, setShowGravity] = useState<boolean>(false); // Visibilidade do texto de gravidade
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [showCannon, setShowCannon] = useState<boolean>(false);
  const [useRockPlanet, setUseRockPlanet] = useState<boolean>(false);
  const [showSun, setShowSun] = useState<boolean>(false); // Sol desligado inicialmente
  const [showPlanet, setShowPlanet] = useState<boolean>(false); // Planeta desligado inicialmente
  const [planetSize, setPlanetSize] = useState<number>(100); // Tamanho do planeta em percentagem (100% = tamanho original)
  const [targetPlanetSize, setTargetPlanetSize] = useState<number>(100); // Tamanho alvo do planeta para animação (apenas para tecla "-")
  const [humanRotation, setHumanRotation] = useState<number>(0); // Rotação do humano em graus (0 = em pé, -90 = deitado)
  const [humanPosition, setHumanPosition] = useState<'top' | 'surface'>('top'); // Posição do humano: 'top' = linha tracejada, 'surface' = superfície atual
  const [humanY, setHumanY] = useState<number>(-EARTH_RADIUS_PX); // Posição Y atual do humano (topo = negativo)
  const [targetHumanY, setTargetHumanY] = useState<number>(-EARTH_RADIUS_PX); // Posição Y alvo do humano para animação (topo = negativo)
  const [showHuman, setShowHuman] = useState<boolean>(false); // Visibilidade do humano (desligado inicialmente)
  const [sunFrameIndex, setSunFrameIndex] = useState<number>(1); // Índice do frame atual do Sol
  const [showSatellite, setShowSatellite] = useState<boolean>(false); // Mostrar/esconder satélite de teste (tecla 't')
  const [satelliteAngle, setSatelliteAngle] = useState<number>(0); // Ângulo do satélite em radianos
  const [showEllipticalOrbit, setShowEllipticalOrbit] = useState<boolean>(false); // Mostrar/esconder órbita elíptica (tecla 'y')
  const [ellipticalOrbitAngle, setEllipticalOrbitAngle] = useState<number>(0); // Ângulo da órbita elíptica em radianos
  const [showEllipseVelocities, setShowEllipseVelocities] = useState<boolean>(false); // Mostrar/esconder velocidades na órbita elíptica (tecla 'u')
  const [showEllipseOutline, setShowEllipseOutline] = useState<boolean>(false); // Mostrar/esconder linha tracejada da elipse (controlada junto com 'u')
  const [isScriptRunning, setIsScriptRunning] = useState<boolean>(false); // Controla se o movie-script está executando
  const [elapsedTime, setElapsedTime] = useState<number>(0); // Tempo decorrido em segundos
  const [currentCommandIndex, setCurrentCommandIndex] = useState<number>(-1); // Índice do comando sendo executado (-1 = nenhum)
  const [executedCommands, setExecutedCommands] = useState<Set<number>>(new Set()); // Índices dos comandos já executados
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false); // Indica se o script foi carregado
  const movieScriptRef = useRef<Array<{ wait: number; cmd: string }>>([]); // Script carregado
  const scriptTimeoutsRef = useRef<Array<number | NodeJS.Timeout>>([]); // Refs para armazenar todos os timeouts/animation frames do script
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref para o intervalo do cronômetro
  const scriptStartTimeRef = useRef<number>(0); // Tempo de início do script
  const isScriptRunningRef = useRef<boolean>(false); // Ref para verificar se o script está rodando
  const scriptAnimationFrameRef = useRef<number | null>(null); // Ref para o animation frame do script
  const humanYRef = useRef<number>(0);
  const previousPlanetSizeRef = useRef<number>(planetSize);
  const sunFrameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cannonWidthRef = useRef<number>(0);
  const showSunRef = useRef<boolean>(showSun);
  const useRockPlanetRef = useRef<boolean>(useRockPlanet);
  const animationFrameRef = useRef<number | null>(null);
  const satelliteAnimationRef = useRef<number | null>(null);
  const ellipticalOrbitAnimationRef = useRef<number | null>(null);
  const bulletIdCounter = useRef<number>(0);
  const cannonRef = useRef<HTMLImageElement | null>(null);
  const isAnimatingRef = useRef<boolean>(false);
  const fireTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const planetSizeRef = useRef<number>(100);

  // Posição base da boca do canhão (centro + raio da Terra + distância em km)
  // Mantém a física igual para Terra. Para o Sol, apenas compensamos o fato de o Sol
  // ter sido desenhado 20% menor, para que a distância VISUAL até a superfície continue
  // parecendo 2.000 km, sem alterar a física.
  const cannonMouthDistancePx = CANNON_DISTANCE_KM * SCALE_KM_TO_PX;
  const baseInitialY = -(EARTH_RADIUS_PX + cannonMouthDistancePx);
  const initialY = showSun
    ? baseInitialY + (SUN_RADIUS_PX * 0.2) + CANNON_MOUTH_OFFSET_PX
    : baseInitialY;

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

  // Animação do satélite de teste (órbita circular puramente geométrica ao redor do Sol)
  useEffect(() => {
    if (!showSun || !showSatellite) {
      if (satelliteAnimationRef.current) {
        cancelAnimationFrame(satelliteAnimationRef.current);
        satelliteAnimationRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();
    const angularSpeed = 0.5; // radianos por segundo (ajuste se quiser mais rápido/lento)

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      setSatelliteAngle(prev => (prev + angularSpeed * dt) % (Math.PI * 2));
      satelliteAnimationRef.current = requestAnimationFrame(animate);
    };

    satelliteAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (satelliteAnimationRef.current) {
        cancelAnimationFrame(satelliteAnimationRef.current);
        satelliteAnimationRef.current = null;
      }
    };
  }, [showSun, showSatellite]);

  // Animação da órbita elíptica (órbita elíptica puramente geométrica ao redor do Sol)
  useEffect(() => {
    if (!showSun || !showEllipticalOrbit) {
      if (ellipticalOrbitAnimationRef.current) {
        cancelAnimationFrame(ellipticalOrbitAnimationRef.current);
        ellipticalOrbitAnimationRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      setEllipticalOrbitAngle(prev => (prev + ELLIPTICAL_ORBIT_ANGULAR_SPEED * dt) % (Math.PI * 2));
      ellipticalOrbitAnimationRef.current = requestAnimationFrame(animate);
    };

    ellipticalOrbitAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (ellipticalOrbitAnimationRef.current) {
        cancelAnimationFrame(ellipticalOrbitAnimationRef.current);
        ellipticalOrbitAnimationRef.current = null;
      }
    };
  }, [showSun, showEllipticalOrbit]);

  // Carregar movie-script ao montar o componente
  useEffect(() => {
    const loadMovieScript = async () => {
      try {
        // Adicionar timestamp para evitar cache
        const response = await fetch(`/movie-script.json?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const script = await response.json();
        movieScriptRef.current = script;
        setScriptLoaded(true);
        console.log('✅ movie-script carregado:', script);
      } catch (error) {
        console.error('❌ Erro ao carregar movie-script:', error);
        // Fallback: usar script hardcoded
        movieScriptRef.current = [
          { wait: 0, cmd: 'hide all' },
          { wait: 0.1, cmd: 'toggle cannon' },
          { wait: 0.5, cmd: 'fire orbital' },
          { wait: 15, cmd: 'switch planet' },
          { wait: 6, cmd: 'shrink planet' },
          { wait: 10, cmd: 'shrink planet' },
          { wait: 5, cmd: 'shrink planet' },
          { wait: 5, cmd: 'shrink planet' },
          { wait: 5, cmd: 'shrink planet' }, 
        ];
        setScriptLoaded(true);
        console.warn('⚠️  Usando script fallback');
      }
    };
    loadMovieScript();
  }, []);

  const handleFire = useCallback((velocity: number, key?: string) => {
    // Usar a ref para garantir que temos o valor mais atualizado
    const currentCannonWidth = cannonRef.current?.offsetWidth || cannonWidthRef.current || cannonWidth;
    const bulletInitialX = currentCannonWidth / 2;

    let x0 = bulletInitialX;
    let y0 = initialY;
    let vx0: number;
    let vy0: number;

    // Caso especial: Sol + tecla 7 → lançar em um ponto girado na órbita com velocidade tangencial,
    // usando o raio definido para a órbita circular (SUN_ORBITAL_RADIUS_KM_FOR_KEY7)
    if (showSun && key === '7') {
      const theta = (SOL_LAUNCH_ANGLE_DEG * Math.PI) / 180;

      // Raio físico em km (raio da órbita circular escolhido para a tecla 7 no Sol)
      const rKm = SUN_ORBITAL_RADIUS_KM_FOR_KEY7;
      // Converter para pixels e trazer a órbita 50px mais para dentro (mais próxima da superfície)
      const rPx = rKm * SUN_SCALE_KM_TO_PX - 50;

      // Posição inicial da bala em relação ao centro
      x0 = rPx * Math.cos(theta);
      y0 = rPx * Math.sin(theta);

      // Velocidade tangencial (perpendicular ao raio)
      const vPxPerS = velocity * SUN_SCALE_KM_TO_PX;
      vx0 = vPxPerS * (-Math.sin(theta));
      vy0 = vPxPerS * (Math.cos(theta));
    } else {
      // Comportamento padrão (Terra, outras teclas, Sol em outras velocidades)
      const currentScaleKmToPx = showSun ? SUN_SCALE_KM_TO_PX : SCALE_KM_TO_PX;
      const initialVelocityPxS = velocity * currentScaleKmToPx;
      x0 = bulletInitialX;
      y0 = initialY;
      vx0 = initialVelocityPxS;
      vy0 = 0;
    }

    const newBullet: BulletState = {
      id: bulletIdCounter.current++,
      x: x0,
      y: y0,
      vx: vx0,
      vy: vy0,
      time: 0,
      isActive: true,
      startTime: performance.now(),
      initialVelocity: velocity,
      initialX: x0
    };
    
    setBullets(prev => [...prev, newBullet]);
  }, [cannonWidth, showSun, initialY]);

  // Função para executar um comando do browser-script
  const executeCommand = useCallback((cmd: string) => {
    const normalizedCmd = cmd.toLowerCase().trim();
    console.log(`🔧 executeCommand chamado com: "${cmd}" -> normalizado: "${normalizedCmd}"`);
    
    switch (normalizedCmd) {
      // Controle geral
      case 'hide all':
        setShowCannon(false);
        setShowDistanceIndicator(false);
        setShowInstructions(false);
        setShowHuman(false);
        setShowGravity(false);
        setShowPlanet(false);
        setShowSun(false);
        setSelectedVelocity(null);
        setBullets([]);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        isAnimatingRef.current = false;
        break;
      case 'toggle cannon':
        setShowCannon(prev => !prev);
        if (showCannon) {
          setSelectedVelocity(null);
          setBullets(prev => prev.filter(bullet => bullet.isActive));
        }
        break;
      case 'switch planet':
        if (showSun) {
          setShowSun(false);
          setUseRockPlanet(false);
          setPlanetSize(100);
          setShowPlanet(true);
        } else if (useRockPlanet) {
          setShowSun(true);
          setUseRockPlanet(false);
          setPlanetSize(100);
          setShowPlanet(true);
        } else {
          setShowSun(false);
          setUseRockPlanet(true);
          setPlanetSize(ROCK_PLANET_DIMENSION);
          setShowPlanet(true);
        }
        setBullets([]);
        setSelectedVelocity(null);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
          fireTimeoutRef.current = null;
        }
        break;
      case 'earth':
        console.log('🌍 Executando comando: earth');
        setShowSun(false);
        setUseRockPlanet(false);
        setPlanetSize(100);
        setShowPlanet(true);
        setBullets([]);
        setSelectedVelocity(null);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
          fireTimeoutRef.current = null;
        }
        break;
      case 'rock':
        setShowSun(false);
        setUseRockPlanet(true);
        setPlanetSize(ROCK_PLANET_DIMENSION);
        setShowPlanet(true);
        setBullets([]);
        setSelectedVelocity(null);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
          fireTimeoutRef.current = null;
        }
        break;
      case 'sun':
        setShowSun(true);
        setUseRockPlanet(false);
        setPlanetSize(100);
        setShowPlanet(true);
        setBullets([]);
        setSelectedVelocity(null);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
          fireTimeoutRef.current = null;
        }
        break;
      case 'toggle distance':
        setShowDistanceIndicator(prev => !prev);
        break;
      case 'hide instructions':
        setShowInstructions(false);
        break;
      case 'show instructions':
        setShowInstructions(true);
        break;
      // Disparo
      case 'fire 1':
      case 'fire 2':
      case 'fire 3':
      case 'fire 4':
      case 'fire 5':
      case 'fire 6':
        const fireKey = normalizedCmd.split(' ')[1];
        const velocityByKey = getVelocityByKey(showSun);
        if (fireKey in velocityByKey) {
          const velocity = velocityByKey[fireKey];
          setSelectedVelocity(null);
          setTimeout(() => {
            setSelectedVelocity(velocity);
          }, VELOCITY_DISPLAY_DELAY);
          if (fireTimeoutRef.current) {
            clearTimeout(fireTimeoutRef.current);
          }
          fireTimeoutRef.current = setTimeout(() => {
            handleFire(velocity, fireKey);
            fireTimeoutRef.current = null;
          }, FIRE_DELAY);
        }
        break;
      case 'fire orbital':
        const orbitalKey = '7';
        const orbitalVelocity = getVelocityByKey(showSun)[orbitalKey];
        setSelectedVelocity(null);
        setTimeout(() => {
          setSelectedVelocity(orbitalVelocity);
        }, VELOCITY_DISPLAY_DELAY);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
        }
        fireTimeoutRef.current = setTimeout(() => {
          handleFire(orbitalVelocity, orbitalKey);
          fireTimeoutRef.current = null;
        }, FIRE_DELAY);
        break;
      case 'fire escape':
        const escapeKey = '9';
        const escapeVelocity = getVelocityByKey(showSun)[escapeKey];
        setSelectedVelocity(null);
        setTimeout(() => {
          setSelectedVelocity(escapeVelocity);
        }, VELOCITY_DISPLAY_DELAY);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
        }
        fireTimeoutRef.current = setTimeout(() => {
          handleFire(escapeVelocity, escapeKey);
          fireTimeoutRef.current = null;
        }, FIRE_DELAY);
        break;
      case 'cancel fire':
        setSelectedVelocity(null);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
          fireTimeoutRef.current = null;
        }
        break;
      // Tamanho do planeta
      case 'shrink planet':
        setTargetPlanetSize(prev => {
          const newSize = prev * 0.5;
          return Math.max(newSize, 1.5);
        });
        break;
      case 'grow planet':
        setTargetPlanetSize(100);
        break;
      // Humano
      case 'hide human':
        setShowHuman(false);
        break;
      case 'show human':
        setShowHuman(true);
        break;
      case 'kill human':
        setShowHuman(false);
        break;
      case 'move human down':
        if (humanPosition === 'top') {
          setHumanPosition('surface');
          const currentSurfaceY = -EARTH_RADIUS_PX * (planetSize / 100);
          setTargetHumanY(currentSurfaceY);
        } else {
          setHumanPosition('top');
          setTargetHumanY(-EARTH_RADIUS_PX);
        }
        break;
      default:
        console.warn(`⚠️  Comando desconhecido: "${cmd}"`);
    }
  }, [showSun, useRockPlanet, showCannon, humanPosition, planetSize, handleFire]);

  // Função para executar o movie-script (mesmo script usado para geração de vídeo)
  const executeBrowserScript = useCallback(() => {
    // Se já estiver rodando, não fazer nada
    if (isScriptRunning) {
      return;
    }

    const script = movieScriptRef.current;
    if (script.length === 0) {
      console.warn('⚠️  movie-script está vazio ou não foi carregado');
      return;
    }

    console.log('▶️  Iniciando execução do script:', script);
    setIsScriptRunning(true);
    isScriptRunningRef.current = true;
    setElapsedTime(0);
    setCurrentCommandIndex(-1);
    setExecutedCommands(new Set());
    const startTime = Date.now();
    scriptStartTimeRef.current = startTime;
    
    // Limpar timeouts anteriores se houver
    scriptTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    scriptTimeoutsRef.current = [];
    
    // Calcular tempos absolutos para cada tecla (em milissegundos)
    // O wait no script é relativo (tempo após o comando anterior)
    // Precisamos converter para tempo absoluto acumulando os waits
    let accumulatedTime = 0;
    const commandTimes: Array<{ index: number; timeMs: number; cmd: string }> = [];
    
    for (let i = 0; i < script.length; i++) {
      // Acumular o wait deste comando para obter o tempo absoluto
      accumulatedTime += script[i].wait * 1000; // Converter para milissegundos
      // O tempo de pressionar esta tecla é o tempo absoluto acumulado
      commandTimes.push({
        index: i,
        timeMs: accumulatedTime,
        cmd: script[i].cmd
      });
    }
    
    // Usar requestAnimationFrame para verificar continuamente o tempo decorrido
    const executedIndices = new Set<number>();
    
    const checkAndExecute = () => {
      if (!isScriptRunningRef.current) {
        scriptAnimationFrameRef.current = null;
        return;
      }
      
      const elapsedMs = Date.now() - startTime;
      
      // Verificar cada comando que ainda não foi executado
      for (const { index, timeMs, cmd } of commandTimes) {
        if (!executedIndices.has(index) && elapsedMs >= timeMs) {
          console.log(`▶️  Executando comando: "${cmd}" aos ${timeMs / 1000}s (tempo real: ${elapsedMs / 1000}s)`);
          
          // Marcar comando como sendo executado
          setCurrentCommandIndex(index);
          
          // Executar o comando
          executeCommand(cmd);
          
          // Marcar comando como executado
          executedIndices.add(index);
          setExecutedCommands(prev => {
            const newSet = new Set(prev);
            newSet.add(index);
            return newSet;
          });
          
          // Se for o último comando, finalizar após um pequeno delay
          if (index === script.length - 1) {
            console.log('✅ Script concluído');
            setTimeout(() => {
              setIsScriptRunning(false);
              isScriptRunningRef.current = false;
              setCurrentCommandIndex(-1);
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
              }
            }, 100);
            scriptAnimationFrameRef.current = null;
            return;
          }
          // O comando atual permanece destacado até que o próximo seja executado
        }
      }
      
      // Continuar verificando
      scriptAnimationFrameRef.current = requestAnimationFrame(checkAndExecute);
    };
    
    // Iniciar a verificação
    scriptAnimationFrameRef.current = requestAnimationFrame(checkAndExecute);
    
    // Marcar o primeiro comando como atual imediatamente
    if (script.length > 0) {
      setCurrentCommandIndex(0);
    }
  }, [isScriptRunning, executeCommand]);

  // Cronômetro que atualiza a cada segundo
  useEffect(() => {
    if (isScriptRunning) {
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - scriptStartTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isScriptRunning]);

  // Limpar timeouts ao desmontar
  useEffect(() => {
    return () => {
      scriptTimeoutsRef.current.forEach(item => {
        if (typeof item === 'number') {
          cancelAnimationFrame(item);
        } else {
          clearTimeout(item);
        }
      });
      scriptTimeoutsRef.current = [];
      if (scriptAnimationFrameRef.current !== null) {
        cancelAnimationFrame(scriptAnimationFrameRef.current);
        scriptAnimationFrameRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

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
          handleFire(velocity, key);
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

  // Listener para tecla "Espaço" esconder/mostrar indicação de distância, "Esc" para instruções,
  // "g" para ligar/desligar texto de gravidade, "x" para limpar, "t/y" para satélites, "Enter" para executar script
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        executeBrowserScript();
        return;
      }
      if (event.key === ' ') {
        event.preventDefault(); // Prevenir scroll da página
        setShowDistanceIndicator(prev => !prev);
      }
      if (event.key === 'Escape') {
        setShowInstructions(prev => !prev);
      }
      if (event.key === 'g' || event.key === 'G') {
        // Mostrar/esconder texto de gravidade
        setShowGravity(prev => !prev);
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
      if (event.key === 't' || event.key === 'T') {
        // Mostrar/esconder satélite de teste em órbita circular ao redor do Sol
        setShowSatellite(prev => !prev);
      }
      if (event.key === 'y' || event.key === 'Y') {
        // Mostrar/esconder órbita elíptica ao redor do Sol
        // Ao ligar a órbita elíptica:
        // - manter textos de velocidade da elipse desligados por padrão
        // - desligar o texto de gravidade para focar apenas na órbita
        // - desligar o canhão
        setShowEllipticalOrbit(prev => {
          const next = !prev;
          if (!prev && next) {
            setShowEllipseVelocities(false);
            setShowGravity(false);
            setShowCannon(false);
          }
          return next;
        });
      }
      if (event.key === 'u' || event.key === 'U') {
        // Mostrar/esconder velocidades e linha tracejada da órbita elíptica
        setShowEllipseVelocities(prev => {
          const next = !prev;
          setShowEllipseOutline(next);
          return next;
        });
      }
      // Comandos específicos para ir direto para cada planeta
      if (event.key === 'q' || event.key === 'Q') {
        // Ir direto para Terra
        setShowSun(false);
        setUseRockPlanet(false);
        setPlanetSize(100);
        setShowPlanet(true);
        setBullets([]);
        setSelectedVelocity(null);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
          fireTimeoutRef.current = null;
        }
      }
      if (event.key === 'w' || event.key === 'W') {
        // Ir direto para planeta rochoso
        setShowSun(false);
        setUseRockPlanet(true);
        setPlanetSize(ROCK_PLANET_DIMENSION);
        setShowPlanet(true);
        setBullets([]);
        setSelectedVelocity(null);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
          fireTimeoutRef.current = null;
        }
      }
      if (event.key === 'e' || event.key === 'E') {
        // Ir direto para Sol
        setShowSun(true);
        setUseRockPlanet(false);
        setPlanetSize(100);
        setShowPlanet(true);
        setBullets([]);
        setSelectedVelocity(null);
        if (fireTimeoutRef.current) {
          clearTimeout(fireTimeoutRef.current);
          fireTimeoutRef.current = null;
        }
      }
      if (event.key === 'r' || event.key === 'R') {
        // Trocar entre Terra, planeta rochoso e Sol
        if (showSun) {
          setShowSun(false);
          setUseRockPlanet(false);
          setPlanetSize(100);
          setShowPlanet(true);
        } else if (useRockPlanet) {
          setShowSun(true);
          setUseRockPlanet(false);
          setPlanetSize(100);
          setShowPlanet(true);
        } else {
          setShowSun(false);
          setUseRockPlanet(true);
          setPlanetSize(ROCK_PLANET_DIMENSION);
          setShowPlanet(true);
        }
        setBullets([]);
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
      if (event.key === 's' || event.key === 'S') {
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
      if (event.key === 'a' || event.key === 'A') {
        // Mostrar/ocultar humano
        setShowHuman(prev => !prev);
      }
      if (event.key === 'z' || event.key === 'Z') {
        // Toggle: desligar/ligar tudo, exceto planeta/Sol e círculo tracejado
        const allOff =
          !showCannon &&
          !showDistanceIndicator &&
          !showInstructions &&
          !showHuman &&
          !showGravity;

        if (allOff) {
          // Reativar elementos principais
          setShowCannon(true);
          setShowDistanceIndicator(true);
          setShowInstructions(true);
          setShowHuman(true);
          setShowGravity(true);
          // Não reativar planeta automaticamente - deixar como está
        } else {
          // Desligar tudo
          setShowCannon(false);
          setShowDistanceIndicator(false);
          setShowInstructions(false);
          setShowHuman(false);
          setShowGravity(false);
          setSelectedVelocity(null);
          // Remover todas as balas (incluindo as que estão orbitando)
          setBullets([]);
          // Cancelar animação de balas
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          isAnimatingRef.current = false;
          // Não desligar planeta/Sol - manter como está
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showCannon, humanPosition, planetSize, showDistanceIndicator, showInstructions, showHuman, showGravity, showSun, useRockPlanet, executeBrowserScript]);

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
            // Para o Sol, o raio visual foi reduzido em 20% (0.8x), então usamos 0.8 * SUN_RADIUS_PX
            const objectRadiusPx = isSun
              ? SUN_RADIUS_PX * 0.8 * (planetSize / 100)
              : EARTH_RADIUS_PX * (planetSize / 100);
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
          // Raio visual atual do objeto (Terra ou Sol)
          const currentObjectRadiusPx = showSun
            ? SUN_RADIUS_PX * 0.8 * (planetSize / 100)
            : EARTH_RADIUS_PX * (planetSize / 100);
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

  // Função para formatar velocidade em km/s com uma casa decimal
  const formatVelocity = (velocity: number): string => {
    return velocity.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  };

  // Função para formatar número com vírgula decimal e ponto como separador de milhar
  const formatNumber = (num: number, decimals: number = 0): string => {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Função para formatar data no formato "dia de mês"
  const formatDate = (day: number, month: number): string => {
    const monthNames = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return `${day} de ${monthNames[month - 1]}`;
  };

  // Formatar tempo para exibição (apenas segundos)
  const formatTime = (seconds: number): string => {
    return String(seconds);
  };

  // Calcular o tempo acumulado de cada comando
  // Calcular o tempo absoluto quando cada tecla será pressionada
  // O wait no script é relativo (tempo após o comando anterior)
  // Precisamos converter para tempo absoluto acumulando os waits
  const getCommandExecutionTime = (index: number): number => {
    let accumulatedTime = 0;
    // Acumular os waits até o índice atual para obter o tempo absoluto
    for (let i = 0; i <= index; i++) {
      accumulatedTime += movieScriptRef.current[i]?.wait || 0;
    }
    return Math.floor(accumulatedTime);
  };

  return (
    <div className="container">
      {/* Cronômetro e lista de comandos no canto superior direito */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1001,
          fontFamily: 'monospace',
          color: '#ffffff'
        }}
      >
        {/* Cronômetro */}
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '10px',
            textAlign: 'left'
          }}
        >
          {formatTime(elapsedTime)}
        </div>
        
        {/* Lista de comandos */}
        {scriptLoaded && movieScriptRef.current.length > 0 && (
        <div
          style={{
            fontSize: '12px',
            lineHeight: '1.6'
          }}
        >
          {movieScriptRef.current.map((action, index) => {
            const isCurrent = currentCommandIndex === index;
            const isExecuted = executedCommands.has(index);
            const executionTime = getCommandExecutionTime(index);
            
            let color = '#cccccc'; // Comandos ainda não executados
            let fontWeight: 'normal' | 'bold' = 'normal';
            
            if (isCurrent) {
              color = '#ffffff';
              fontWeight = 'bold';
            } else if (isExecuted) {
              color = '#aaaaaa'; // Comandos já executados
              fontWeight = 'normal';
            }
            
            return (
              <div
                key={index}
                style={{
                  color,
                  fontWeight,
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'baseline'
                }}
              >
                <span style={{ display: 'inline-block', width: '35px', textAlign: 'right', marginRight: '5px' }}>
                  {executionTime}s:
                </span>
                <span>{action.cmd}</span>
              </div>
            );
          })}
        </div>
        )}
      </div>
      
      {/* Tabela de instruções na extrema esquerda */}
      {showInstructions && (
        <div className="instructions-container" style={{ fontSize: `${FONT_SIZE - 2}px` }}>
          <div className="instructions-title">Instruções:</div>
          <table className="instructions-table" style={{ fontSize: `${FONT_SIZE - 2}px` }}>
            <tbody>
              {/* Disparo (linha numérica) */}
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
                <td>desliga mostrador de velocidade (cancela disparo)</td>
              </tr>
              {/* Espaço entre grupos */}
              <tr><td colSpan={2}>&nbsp;</td></tr>

              {/* Controles gerais (teclas fora das linhas principais) */}
              <tr>
                <td>Esc</td>
                <td>liga/desliga instruções</td>
              </tr>
              <tr>
                <td>Espaço</td>
                <td>liga/desliga indicação altura</td>
              </tr>
              <tr>
                <td>g</td>
                <td>liga/desliga texto de gravidade</td>
              </tr>
              {/* Espaço entre grupos */}
              <tr><td colSpan={2}>&nbsp;</td></tr>

              {/* Linha QWERTY (Q W E R T Y U I O P) */}
              <tr>
                <td>q</td>
                <td>muda diretamente para Terra</td>
              </tr>
              <tr>
                <td>w</td>
                <td>muda diretamente para planeta rochoso</td>
              </tr>
              <tr>
                <td>e</td>
                <td>muda diretamente para Sol</td>
              </tr>
              <tr>
                <td>r</td>
                <td>troca entre Terra, planeta rochoso e Sol</td>
              </tr>
              <tr>
                <td>t</td>
                <td>liga/desliga satélite em órbita circular ao redor do Sol</td>
              </tr>
              <tr>
                <td>y</td>
                <td>liga/desliga satélite em órbita elíptica ao redor do Sol</td>
              </tr>
              <tr>
                <td>u</td>
                <td>liga/desliga velocidades e linha tracejada na órbita elíptica</td>
              </tr>
              {/* Espaço entre grupos */}
              <tr><td colSpan={2}>&nbsp;</td></tr>

              {/* Linha ZXCV (Z X C V B N M) */}
              <tr>
                <td>z</td>
                <td>liga/desliga tudo (exceto planeta e círculo)</td>
              </tr>
              <tr>
                <td>x</td>
                <td>liga/desliga canhão, texto e balas na superfície</td>
              </tr>
              {/* Espaço entre grupos */}
              <tr><td colSpan={2}>&nbsp;</td></tr>

              {/* Tamanho do planeta */}
              <tr>
                <td>-</td>
                <td>diminui tamanho do planeta (50%)</td>
              </tr>
              <tr>
                <td>+</td>
                <td>volta tamanho do planeta para 100%</td>
              </tr>
              {/* Espaço entre grupos */}
              <tr><td colSpan={2}>&nbsp;</td></tr>

              {/* Humano */}
              <tr>
                <td>a</td>
                <td>liga/desliga humano</td>
              </tr>
              <tr>
                <td>s</td>
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
              // Circunferência de referência exatamente sobre a superfície:
              // - Para a Terra/rochoso: EARTH_DIAMETER (fixo, não acompanha mudança de tamanho)
              // - Para o Sol: diâmetro visual em 100% (com fator 0.8) - 50 (fixo)
              width: `${showSun 
                ? (EARTH_DIAMETER + 80) * 0.8 - 50 
                : EARTH_DIAMETER}px`,
              height: `${showSun 
                ? (EARTH_DIAMETER + 80) * 0.8 - 50 
                : EARTH_DIAMETER}px`,
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
      {showGravity && (
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
      )}
      {!showSun && showPlanet && (
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
            // Tamanho visual do Sol 20% menor (0.8x), sem alterar física
            width: `${(EARTH_DIAMETER + 80) * 0.8 * (planetSize / 100)}px`,
            height: `${(EARTH_DIAMETER + 80) * 0.8 * (planetSize / 100)}px`,
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 1
          }}
        />
      )}
      {/* Satélite de teste: órbita circular puramente geométrica ao redor do Sol */}
      {showSun && showSatellite && (
        (() => {
          // Raio visual do Sol em pixels (mesmo que usamos no render: (EARTH_DIAMETER + 80) * 0.8 * (planetSize / 100)) / 2
          const sunVisualDiameterPx = (EARTH_DIAMETER + 80) * 0.8 * (planetSize / 100);
          const sunVisualRadiusPx = sunVisualDiameterPx / 2;
          // Satélite a 180px da superfície do Sol
          const satelliteOrbitRadiusPx = sunVisualRadiusPx + 180;
          const satX = satelliteOrbitRadiusPx * Math.cos(satelliteAngle);
          const satY = satelliteOrbitRadiusPx * Math.sin(satelliteAngle);
          return (
            <div
              className="satellite-marker"
              style={{
                transform: `translate(calc(-50% + ${satX}px), calc(-50% + ${satY}px))`
              }}
            />
          );
        })()
      )}
      {/* Satélite em órbita elíptica ao redor do Sol */}
      {showSun && showEllipticalOrbit && (
        <>
          {/* Textos explicativos no canto superior esquerdo (ligados ao toggle da tecla 'u') */}
          <div className={`ellipse-info-text ${showEllipseVelocities ? 'visible' : ''}`}>
            <p>A representação da elipse está fora de proporção, para fins de melhor entendimento do fenômeno. A elipse real tem excentricidade bem menor.</p>
            <p>Idem para a proporção e a distância Terra - Sol.</p>
            <p>Idem para a velocidade da animação. Na vida real, uma volta inteira da Terra demora 1 ano.</p>
            <p>As velocidades e datas escritas são reais.</p>
          </div>
          {(() => {
            // Raio visual do Sol em pixels
            const sunVisualDiameterPx = (EARTH_DIAMETER + 80) * 0.8 * (planetSize / 100);
            const sunVisualRadiusPx = sunVisualDiameterPx / 2;
          
          // Calcular parâmetros da elipse
          // Periastro: 50% menor que a órbita circular (de 180px para 90px da superfície)
          const periastroPx = sunVisualRadiusPx + 90;
          
          // Apoastro: 50px da borda direita da tela
          const screenWidth = window.innerWidth;
          const screenHeight = window.innerHeight;
          const apoastroPx = screenWidth / 2 - 50;
          
          // Semi-eixo maior (a) e distância focal (c)
          const a = (periastroPx + apoastroPx) / 2;
          const c = (apoastroPx - periastroPx) / 2;
          
          // Semi-eixo menor (b) - limitado por 50px das bordas superior/inferior
          const maxB = screenHeight / 2 - 50;
          const b = Math.min(maxB, Math.sqrt(a * a - c * c));
          
          // O Sol está no foco esquerdo, então o centro da elipse está deslocado para a direita
          // O centro da elipse está em (c, 0) em relação ao Sol (que está em 0, 0)
          const ellipseCenterX = c;
          const ellipseCenterY = 0;
          
          // Calcular posição do satélite usando equação paramétrica da elipse
          // x = ellipseCenterX + a * cos(angle)
          // y = ellipseCenterY + b * sin(angle)
          const satX = ellipseCenterX + a * Math.cos(ellipticalOrbitAngle);
          const satY = ellipseCenterY + b * Math.sin(ellipticalOrbitAngle);
          
          // Cálculo das velocidades lineares reais (em km/s) da Terra em órbita ao redor do Sol
          // usando os valores astronômicos de periélio/afélio e a equação de vis-viva.
          const rPeriKm = EARTH_PERIHELION_KM;
          const rApoKm = EARTH_APHELION_KM;
          const aKm = EARTH_ORBIT_SEMIMAJOR_AXIS_KM;
          // Equação de vis-viva: v = sqrt( μ * (2/r - 1/a) ), com μ do Sol em km^3/s^2
          const vPeriKmS = Math.sqrt(
            MU_SUN_KM3_S2 * (2 / rPeriKm - 1 / aKm)
          );
          const vApoKmS = Math.sqrt(
            MU_SUN_KM3_S2 * (2 / rApoKm - 1 / aKm)
          );
          const vMeanKmS = (vPeriKmS + vApoKmS) / 2;

          // Posições dos rótulos: esquerda, direita e acima da elipse
          const leftX = ellipseCenterX - a - 100;   // 100px para a esquerda
          const rightX = ellipseCenterX + a - 100;  // 100px para a esquerda
          const topX = ellipseCenterX;
          const topY = -b - 25 + 100; // 25px acima da elipse + 100px para baixo

          // Destaque próximo aos extremos: janela curta em torno do periélio/afélio
          const HIGHLIGHT_WINDOW_SECONDS = 0.25;
          const halfWindowAngle = (ELLIPTICAL_ORBIT_ANGULAR_SPEED * HIGHLIGHT_WINDOW_SECONDS) / 2;

          const TWO_PI = Math.PI * 2;
          const normalizeAngle = (angle: number) => {
            let aNorm = angle % TWO_PI;
            if (aNorm < 0) aNorm += TWO_PI;
            return aNorm;
          };

          const angle = normalizeAngle(ellipticalOrbitAngle);

          const angleDistance = (a: number, center: number) => {
            const diff = Math.abs(a - center);
            return Math.min(diff, TWO_PI - diff);
          };

          // Periélio (extremo esquerdo) em torno de π rad
          const highlightLeft = angleDistance(angle, Math.PI) <= halfWindowAngle;
          // Afélio (extremo direito) em torno de 0 rad
          const highlightRight = angleDistance(angle, 0) <= halfWindowAngle;

          return (
            <>
              {showEllipseOutline && (
                <div
                  className="ellipse-orbit-outline"
                  style={{
                    width: `${2 * a}px`,
                    height: `${2 * b}px`,
                    transform: `translate(calc(-50% + ${ellipseCenterX}px), calc(-50% + ${ellipseCenterY}px))`
                  }}
                />
              )}
              <div
                className="satellite-marker"
                style={{
                  transform: `translate(calc(-50% + ${satX}px), calc(-50% + ${satY}px))`
                }}
              />
              {showEllipseVelocities && (
                <>
                  {/* Velocidade no periastro (lado esquerdo da elipse) */}
                  <div
                    className="ellipse-velocity-label"
                    style={{
                      transform: `translate(calc(-50% + ${leftX + 35}px), calc(-50% - 10px))`,
                      fontWeight: highlightLeft ? 'bold' : 'normal'
                    }}
                  >
                    <span className="ellipse-velocity-value">
                      {formatNumber(vPeriKmS, 1)} km/s
                    </span>
                    <br />
                    {formatDate(3, 1)}
                  </div>
                  {/* Velocidade no apoastro (lado direito da elipse) */}
                  <div
                    className="ellipse-velocity-label"
                    style={{
                      transform: `translate(calc(-50% + ${rightX + 35}px), calc(-50% - 10px))`,
                      fontWeight: highlightRight ? 'bold' : 'normal'
                    }}
                  >
                    <span className="ellipse-velocity-value">
                      {formatNumber(vApoKmS, 1)} km/s
                    </span>
                    <br />
                    {formatDate(4, 7)}
                  </div>
                  {/* Velocidade média acima da órbita */}
                  <div
                    className="ellipse-velocity-label"
                    style={{
                      transform: `translate(calc(-50% + ${topX + 35}px), calc(-50% + ${topY}px))`
                    }}
                  >
                    <span className="ellipse-velocity-value">
                      média: {formatNumber(vMeanKmS, 1)} km/s
                    </span>
                  </div>
                </>
              )}
            </>
          );
          })()}
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

          // Aplicar rotação VISUAL da órbita em torno do centro APENAS para a tecla 7 no Sol.
          // Identificamos a tecla 7 no Sol pelo valor de velocidade inicial em km/s
          // igual a SUN_ORBITAL_VELOCITY_ADJUSTED_KM_S.
          let renderX = bullet.x;
          let renderY = bullet.y;
          if (showSun && bullet.initialVelocity === SUN_ORBITAL_VELOCITY_ADJUSTED_KM_S) {
            const angleRad = (ORBIT_ROTATION_DEG * Math.PI) / 180;
            const cosA = Math.cos(angleRad);
            const sinA = Math.sin(angleRad);
            renderX = bullet.x * cosA - bullet.y * sinA;
            renderY = bullet.x * sinA + bullet.y * cosA;
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
                transform: `translate(calc(-50% + ${renderX}px), calc(-50% + ${renderY}px))`
              }}
            />
          );
        })}
    </div>
  );
}

export default NewtonCannon;
