const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const INPUT_DIR = path.join(__dirname, '../splited-frames'); // Diretório com os frames existentes
const FPS = 30; // Frames por segundo (ajustar conforme necessário, ou deixar null para calcular automaticamente)
const LOOP_DURATION_SECONDS = 5; // Duração de um loop em segundos (usado apenas se FPS for null)
const RESOLUTION = '1920x1080'; // Resolução do vídeo (1080p)

// Formato do vídeo de saída. Valores válidos: 'mp4', 'mov', 'avi', 'mkv', 'webm'
const VIDEO_FORMAT = 'mp4';

const VIDEO_OUTPUT = path.join(__dirname, `../output-sun.${VIDEO_FORMAT}`);

async function generateVideo() {
  console.log('☀️ Iniciando geração de vídeo do Sol usando frames existentes...');
  
  // Verificar se o diretório de entrada existe
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Diretório não encontrado: ${INPUT_DIR}`);
    console.log('   Certifique-se de que os frames estão no diretório splited-frames');
    return;
  }
  
  // Listar e contar frames disponíveis
  const files = fs.readdirSync(INPUT_DIR);
  const frameFiles = files.filter(file => file.toLowerCase().endsWith('.png')).sort();
  
  if (frameFiles.length === 0) {
    console.error(`❌ Nenhum frame PNG encontrado em: ${INPUT_DIR}`);
    return;
  }
  
  const TOTAL_FRAMES = frameFiles.length;
  console.log(`📹 Encontrados ${TOTAL_FRAMES} frames no diretório splited-frames`);
  
  // Calcular FPS baseado no número de frames e duração desejada, ou usar o FPS especificado
  const calculatedFPS = TOTAL_FRAMES / LOOP_DURATION_SECONDS;
  const actualFPS = FPS !== null && FPS !== undefined ? FPS : calculatedFPS;
  
  console.log(`📊 Configuração:`);
  console.log(`   Frames: ${TOTAL_FRAMES}`);
  console.log(`   FPS: ${actualFPS.toFixed(2)}`);
  console.log(`   Duração: ${(TOTAL_FRAMES / actualFPS).toFixed(2)}s`);
  
  console.log('🎬 Gerando vídeo com FFmpeg...');

  // Gerar vídeo usando FFmpeg com timebase e metadados explícitos
  const movFlags = (VIDEO_FORMAT === 'mp4' || VIDEO_FORMAT === 'mov') ? '-movflags +faststart' : '';
  const tmcdFlag = VIDEO_FORMAT === 'mov' ? '-write_tmcd 0' : '';
  // Timebase padrão do MP4 é 90000, não FPS * 1000
  const timebase = VIDEO_FORMAT === 'mp4' ? 90000 : (actualFPS * 1000);
  
  // Verificar o padrão de nome dos frames
  const firstFrame = frameFiles[0];
  const framePattern = firstFrame.match(/frame-(\d+)\.png/);
  let inputPattern;
  
  if (framePattern) {
    // Padrão: frame-000001.png, frame-000002.png, etc.
    inputPattern = path.join(INPUT_DIR, 'frame-%06d.png');
  } else {
    // Tentar padrão genérico
    inputPattern = path.join(INPUT_DIR, frameFiles[0].replace(/\d+/, '%06d'));
  }
  
  const ffmpegCommand = `ffmpeg -y -r ${actualFPS} -i "${inputPattern}" -r ${actualFPS} -frames:v ${TOTAL_FRAMES} -s ${RESOLUTION} -f ${VIDEO_FORMAT} -vsync cfr -fflags +genpts -video_track_timescale ${timebase} -avoid_negative_ts make_zero ${movFlags} ${tmcdFlag} -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow "${VIDEO_OUTPUT}"`.trim().replace(/\s+/g, ' ');
  
  try {
    execSync(ffmpegCommand, { stdio: 'inherit' });
    console.log(`✅ Vídeo gerado com sucesso: ${VIDEO_OUTPUT}`);
    console.log(`📹 Duração: ${(TOTAL_FRAMES / actualFPS).toFixed(2)}s`);
    
    // Remuxar o vídeo para corrigir metadados de duração
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
      console.log(`📹 Duração do vídeo: ${duration.toFixed(2)}s`);
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
}

// Executar
generateVideo().catch(console.error);

