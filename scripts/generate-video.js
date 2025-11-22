const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '../video-frames');
const VIDEO_OUTPUT = path.join(__dirname, '../output.mp4');
const FPS = 60; // Frames por segundo
const DURATION_SECONDS = 30; // Duração do vídeo em segundos
const TOTAL_FRAMES = FPS * DURATION_SECONDS;
const APP_URL = 'http://localhost:3000'; // URL da aplicação React

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
    
    // Definir viewport (ajuste conforme necessário)
    await page.setViewport({
      width: 1920,
      height: 1080,
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
    
    const frameInterval = 1000 / FPS; // Intervalo entre frames em ms
    let firstShotFrame = 0; // Frame em que a primeira bala será disparada
    let secondShotFrame = firstShotFrame + (5 * FPS); // Frame em que a segunda bala será disparada (5 segundos depois)
    
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
    
    // Capturar frames
    for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
      // Disparar primeira bala no frame correto
      if (frame === firstShotFrame) {
        console.log(`🔫 Frame ${frame}: Disparando primeira bala (tecla 7)...`);
        await page.keyboard.press('7');
      }
      
      // Disparar segunda bala no frame correto
      if (frame === secondShotFrame) {
        console.log(`🔫 Frame ${frame}: Disparando segunda bala (tecla 6)...`);
        await page.keyboard.press('6');
      }
      
      // Aguardar até o momento correto para este frame
      const targetTime = startTime + (frame * frameInterval);
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
    console.log('🎬 Gerando vídeo com FFmpeg...');

    // Gerar vídeo usando FFmpeg
    const ffmpegCommand = `ffmpeg -y -r ${FPS} -i "${OUTPUT_DIR}/frame-%06d.png" -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow "${VIDEO_OUTPUT}"`;
    
    try {
      execSync(ffmpegCommand, { stdio: 'inherit' });
      console.log(`✅ Vídeo gerado com sucesso: ${VIDEO_OUTPUT}`);
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

