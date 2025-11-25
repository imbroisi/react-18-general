const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '../video-frames');
const FPS = 60; // Frames por segundo
const DURATION_SECONDS = 50; // Duração do vídeo em segundos
const TOTAL_FRAMES = FPS * DURATION_SECONDS;
const APP_URL = 'http://localhost:3000'; // URL da aplicação React
const RESOLUTION = '1920x1080'; // Resolução do vídeo (1080p)

// Formato do vídeo de saída. Valores válidos: 'mp4', 'mov', 'avi', 'mkv', 'webm'
const VIDEO_FORMAT = 'mp4';

const VIDEO_OUTPUT = path.join(__dirname, `../output.${VIDEO_FORMAT}`);

// Script simplificado, passo a passo, para o vídeo
const VIDEO_SCRIPT = [
  {
    wait: 0, // imediatamente, sem espera
    key: 'z',
  },
  {
    wait: 0.1, // em segundos
    key: 'x',
  },
  {
    wait: 0.5,
    key: '7',
  },
  {
    wait: 15,
    key: 'y',
  },
  {
    wait: 6,
    key: '-',
  },
  {
    wait: 10,
    key: '-',
  },
  {
    wait: 5,
    key: '-',
  },
  {
    wait: 5,
    key: '-',
  },
  {
    wait: 5,
    key: '-', // estrela neutrons
  },
];

// Helper function para substituir page.waitForTimeout (removido nas versões recentes do Puppeteer)
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateVideo() {
  console.log('🚀 Iniciando geração de vídeo...');
  
  // Criar diretório para frames e limpar completamente
  if (fs.existsSync(OUTPUT_DIR)) {
    console.log('🧹 Limpando frames anteriores...');
    const files = fs.readdirSync(OUTPUT_DIR);
    files.forEach(file => {
      try {
        fs.unlinkSync(path.join(OUTPUT_DIR, file));
      } catch (e) {
        // Ignorar erros ao deletar
      }
    });
  } else {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🌐 Abrindo navegador...');
  // Para debug, altere headless para false para ver o navegador
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Parsear resolução (formato: "1920x1080")
    const [width, height] = RESOLUTION.split('x').map(Number);
    
    // Definir viewport conforme a resolução especificada
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 1
    });

    console.log(`📡 Carregando página: ${APP_URL}`);
    await page.goto(APP_URL, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Aguardar a aplicação React carregar completamente
    console.log('⏳ Aguardando aplicação React carregar...');
    await wait(3000);

    // Garantir que a página está focada
    console.log('🖱️ Focando na página...');
    await page.focus('body');
    await wait(500);

    // Aguardar que a animação esteja pronta
    console.log('⏳ Aguardando componente estar pronto...');
    await wait(2000);

    console.log(`📸 Capturando ${TOTAL_FRAMES} frames a ${FPS} FPS...`);
    
    // Preparar script: calcular tempos absolutos em milissegundos
    const scriptActions = [];
    let accumulatedTime = 0;
    for (const action of VIDEO_SCRIPT) {
      accumulatedTime += action.wait * 1000; // Converter segundos para ms
      scriptActions.push({
        time: accumulatedTime,
        key: action.key,
      });
    }
    
    console.log(`📋 Script configurado com ${scriptActions.length} ações:`);
    scriptActions.forEach((action, index) => {
      console.log(`   ${(action.time / 1000).toFixed(1)}s: Pressionar tecla '${action.key}'`);
    });
    
    const frameInterval = 1000 / FPS; // Intervalo entre frames em ms
    
    // Sincronizar com requestAnimationFrame do navegador
    // Aguardar um frame do navegador antes de começar para garantir sincronização
    await page.evaluate(() => {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });
    });
    
    const startTime = Date.now();
    let nextScriptActionIndex = 0; // Índice da próxima ação do script a ser executada
    
    // Capturar frames
    for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
      // Calcular tempo absoluto deste frame
      const frameTime = frame * frameInterval;
      
      // Verificar se é hora de executar alguma ação do script
      while (nextScriptActionIndex < scriptActions.length) {
        const action = scriptActions[nextScriptActionIndex];
        if (frameTime >= action.time) {
          console.log(`⌨️  Frame ${frame} (${(frameTime / 1000).toFixed(2)}s): Pressionando tecla '${action.key}'`);
          await page.keyboard.press(action.key);
          nextScriptActionIndex++;
        } else {
          break; // Ainda não é hora desta ação
        }
      }
      
      // Aguardar até o momento correto para este frame
      const targetTime = startTime + frameTime;
      const currentTime = Date.now();
      const waitTime = Math.max(0, targetTime - currentTime);
      
      if (waitTime > 0) {
        await wait(waitTime);
      }
      
      // Aguardar um frame do navegador para garantir que a animação atualizou
      await page.evaluate(() => {
        return new Promise(resolve => {
          requestAnimationFrame(resolve);
        });
      });
      
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: false
      });
      
      const framePath = path.join(OUTPUT_DIR, `frame-${String(frame).padStart(6, '0')}.png`);
      fs.writeFileSync(framePath, screenshot);
      
      // Progresso
      if ((frame + 1) % (FPS * 5) === 0) {
        console.log(`   Capturado ${frame + 1}/${TOTAL_FRAMES} frames (${Math.round((frame + 1) / TOTAL_FRAMES * 100)}%)`);
      }
    }

    console.log('✅ Frames capturados!');
    
    // Verificar quantos frames foram realmente capturados
    const capturedFrames = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png')).length;
    console.log(`📊 Frames capturados: ${capturedFrames} (esperado: ${TOTAL_FRAMES})`);
    
    if (capturedFrames !== TOTAL_FRAMES) {
      console.warn(`⚠️  Aviso: Número de frames capturados (${capturedFrames}) difere do esperado (${TOTAL_FRAMES})`);
    }
    
    console.log('🎬 Gerando vídeo com FFmpeg...');

    // Gerar vídeo usando FFmpeg com timebase e metadados explícitos
    const movFlags = (VIDEO_FORMAT === 'mp4' || VIDEO_FORMAT === 'mov') ? '-movflags +faststart' : '';
    const tmcdFlag = VIDEO_FORMAT === 'mov' ? '-write_tmcd 0' : '';
    // Timebase padrão do MP4 é 90000, não FPS * 1000
    const timebase = VIDEO_FORMAT === 'mp4' ? 90000 : (FPS * 1000);
    const ffmpegCommand = `ffmpeg -y -r ${FPS} -i "${OUTPUT_DIR}/frame-%06d.png" -r ${FPS} -frames:v ${TOTAL_FRAMES} -s ${RESOLUTION} -f ${VIDEO_FORMAT} -vsync cfr -fflags +genpts -video_track_timescale ${timebase} -avoid_negative_ts make_zero ${movFlags} ${tmcdFlag} -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow "${VIDEO_OUTPUT}"`.trim().replace(/\s+/g, ' ');
    
    try {
      execSync(ffmpegCommand, { stdio: 'inherit' });
      console.log(`✅ Vídeo gerado com sucesso: ${VIDEO_OUTPUT}`);
      
      // Remuxar o vídeo para corrigir metadados de duração (pode resolver problemas no Filmora)
      console.log('🔄 Remuxando vídeo para corrigir metadados...');
      const tempOutput = VIDEO_OUTPUT.replace(`.${VIDEO_FORMAT}`, `_temp.${VIDEO_FORMAT}`);
      const remuxCommand = `ffmpeg -y -i "${VIDEO_OUTPUT}" -c copy -movflags +faststart -map_metadata 0 "${tempOutput}"`;
      
      try {
        execSync(remuxCommand, { stdio: 'inherit' });
        // Substituir o arquivo original pelo remuxado
        fs.renameSync(tempOutput, VIDEO_OUTPUT);
        console.log('✅ Vídeo remuxado com sucesso!');
      } catch (remuxError) {
        console.warn('⚠️  Aviso: Falha ao remuxar vídeo, usando versão original');
        if (fs.existsSync(tempOutput)) {
          fs.unlinkSync(tempOutput);
        }
      }
      
      // Verificar duração do vídeo gerado
      console.log('🔍 Verificando duração do vídeo...');
      try {
        const probeCommand = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${VIDEO_OUTPUT}"`;
        const duration = parseFloat(execSync(probeCommand, { encoding: 'utf-8' }).trim());
        console.log(`📹 Duração do vídeo: ${duration.toFixed(2)}s (esperado: ${DURATION_SECONDS}s)`);
        if (Math.abs(duration - DURATION_SECONDS) > 1) {
          console.warn(`⚠️  Aviso: Duração do vídeo (${duration.toFixed(2)}s) difere significativamente do esperado (${DURATION_SECONDS}s)`);
        }
      } catch (probeError) {
        console.warn('⚠️  Não foi possível verificar a duração do vídeo');
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar vídeo com FFmpeg:', error.message);
      console.log('💡 Certifique-se de que o FFmpeg está instalado e no PATH');
      console.log('   macOS: brew install ffmpeg');
      console.log('   Linux: sudo apt-get install ffmpeg');
      console.log('   Windows: Baixe de https://ffmpeg.org/download.html');
    }

  } catch (error) {
    console.error('❌ Erro durante a captura:', error);
  } finally {
    await browser.close();
  }
}

// Executar
generateVideo().catch(console.error);

