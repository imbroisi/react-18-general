#!/usr/bin/env node

/**
 * Script: build_all.js
 *
 * Passos:
 * 1) Verifica se existem arquivos no diretório src/video-element-src
 * 2) Se tiver mais do que um, interrompe o processo com aviso. Só pode haver um.
 * 3) Se já tiver um, pula para o passo 8.
 * 4) Verifica se foi especificado um nome de arquivo como parâmetro.
 * 5) Se não houver, interrompe o processo e mostra aviso.
 * 6) Baixa o arquivo da internet:
 *    https://imbroisi-tools.s3.us-east-1.amazonaws.com/media/<nome-do-arquivo>
 *    e coloca em src/video-element-src
 * 7) Verifica se o arquivo foi de fato colocado no diretório.
 * 8) Emite aviso que o arquivo mp4 está pronto para ser usado, informando o nome.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

// Diretório onde o mp4 deve ficar
const VIDEO_DIR = path.join(__dirname, "src", "video-element-src");
// Diretório onde os frames PNG são gerados pelo split-video-to-frames.js
const FRAMES_DIR = path.join(__dirname, "public", "video-element-frames");

/**
 * Lista arquivos do diretório de vídeo. Se o diretório não existir, retorna [].
 */
function listVideoFiles() {
  if (!fs.existsSync(VIDEO_DIR)) {
    return [];
  }

  const all = fs.readdirSync(VIDEO_DIR).filter((f) => {
    const fullPath = path.join(VIDEO_DIR, f);
    const stat = fs.statSync(fullPath);
    return stat.isFile();
  });

  return all;
}

/**
 * Faz download de um arquivo HTTPS para o caminho indicado.
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(destPath);

    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          fileStream.close(() => {
            fs.unlink(destPath, () => {
              reject(
                new Error(
                  `Falha ao baixar arquivo. Status HTTP: ${res.statusCode}`
                )
              );
            });
          });
          return;
        }

        res.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close(() => resolve());
        });
      })
      .on("error", (err) => {
        fileStream.close(() => {
          fs.unlink(destPath, () => reject(err));
        });
      });
  });
}

/**
 * Faz o parse dos argumentos de linha de comando.
 *
 * Formato esperado:
 *   node build_all.js [--file|-f <nome-do-arquivo.mp4>] [--url|-u <URL>] [--double-frames|-d] [--help|-h]
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    fileName: null,
    doubleFrames: false,
    help: false,
    url: null,
    unknownArg: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--double-frames" || arg === "-d") {
      result.doubleFrames = true;
    } else if (arg === "--file" || arg === "-f") {
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        result.fileName = next;
        i++; // consumir o valor
      } else {
        console.error(
          'Erro: o parâmetro --file/-f requer um valor (ex.: --file "meu-video.mp4").'
        );
        result.help = true;
        break;
      }
    } else if (arg === "--url" || arg === "-u") {
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        result.url = next;
        i++; // consumir o valor
      } else {
        console.error('Erro: o parâmetro --url/-u requer um valor (ex.: --url "https://.../video.mp4").');
        result.help = true;
        break;
      }
    } else {
      // Qualquer outro parâmetro desconhecido ativa o modo help
      result.unknownArg = arg;
      result.help = true;
      break;
    }
  }

  return result;
}

/**
 * Executa o script de split de vídeo em frames.
 */
function runSplit(fileName) {
  const splitScript = path.join(
    __dirname,
    "scripts",
    "split-video-to-frames.js"
  );

  if (!fs.existsSync(splitScript)) {
    console.error(
      `Aviso: script split-video-to-frames.js não encontrado em ${splitScript}.`
    );
    process.exit(1);
  }

  console.log(
    `O arquivo de vídeo (${fileName}) está pronto. Iniciando separação em frames com split-video-to-frames.js...`
  );

  try {
    // Rodar o script de split sem argumentos (modo local, usando mp4-source, conforme o script)
    execSync(`node "${splitScript}"`, { stdio: "inherit" });
  } catch (err) {
    console.error(`Erro ao executar split-video-to-frames.js: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Dobra a quantidade de frames gerados criando frames intermediários
 * entre os frames existentes, usando FFmpeg (minterpolate).
 *
 * Estratégia:
 *   1) Ler frames existentes em FRAMES_DIR (frame-%06d.png)
 *   2) Usar FFmpeg para gerar novos frames com FPS dobrado
 *   3) Substituir o conteúdo de FRAMES_DIR pelos frames interpolados
 */
function doubleFramesWithInterpolation() {
  if (!fs.existsSync(FRAMES_DIR)) {
    console.warn(
      `Aviso: diretório de frames não encontrado em ${FRAMES_DIR}. Pulando interpolação de frames.`
    );
    return;
  }

  const files = fs
    .readdirSync(FRAMES_DIR)
    .filter((f) => f.startsWith("frame-") && f.endsWith(".png"));

  if (files.length < 2) {
    console.warn(
      "Aviso: menos de 2 frames encontrados. Não é possível interpolar frames."
    );
    return;
  }

  const tmpDir = path.join(FRAMES_DIR, "..", "video-element-frames-tmp");

  // Garantir diretório temporário limpo
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log(
    "Iniciando interpolação de frames (dobrando quantidade de frames via FFmpeg/minterpolate)..."
  );

  // Assumimos que os frames foram gerados a 30 fps e queremos 60 fps
  const inputPattern = path.join(FRAMES_DIR, "frame-%06d.png");
  const outputPattern = path.join(tmpDir, "frame-%06d.png");

  const ffmpegCmd = `ffmpeg -y -framerate 30 -i "${inputPattern}" -vf "minterpolate=fps=60" "${outputPattern}"`;

  try {
    execSync(ffmpegCmd, { stdio: "inherit" });
  } catch (err) {
    console.error(
      `Erro ao interpolar frames com FFmpeg (minterpolate): ${err.message}`
    );
    // Não encerrar o processo por causa da interpolação – manter frames originais
    return;
  }

  // Substituir os frames originais pelos interpolados
  try {
    // Apagar conteúdo atual de FRAMES_DIR
    const existing = fs.readdirSync(FRAMES_DIR);
    for (const f of existing) {
      try {
        fs.unlinkSync(path.join(FRAMES_DIR, f));
      } catch {
        // ignorar erros individuais
      }
    }

    // Mover arquivos do tmpDir para FRAMES_DIR
    const newFiles = fs.readdirSync(tmpDir);
    for (const f of newFiles) {
      fs.renameSync(path.join(tmpDir, f), path.join(FRAMES_DIR, f));
    }

    // Remover diretório temporário
    fs.rmdirSync(tmpDir);

    console.log("Interpolação de frames concluída com sucesso.");
  } catch (err) {
    console.error(
      `Erro ao substituir frames pelo resultado interpolado: ${err.message}`
    );
  }
}

async function main() {
  console.log("Iniciando build_all.js...");

  const { fileName, doubleFrames, help, url, unknownArg } = parseArgs();

  if (help) {
    if (unknownArg) {
      console.log(`Parâmetro desconhecido: ${unknownArg}`);
      console.log("");
    }
    console.log("Uso do build_all.js:");
    console.log("");
    console.log("  node build_all.js");
    console.log(
      "    Usa o vídeo já existente em src/video-element-src (se houver exatamente um)."
    );
    console.log("");
    console.log(
      "  node build_all.js --file <nome-do-arquivo.mp4>"
    );
    console.log(
      "    Baixa o vídeo da web (substituindo qualquer arquivo existente em src/video-element-src),"
    );
    console.log("    gera os frames PNG e prepara o app para usar esse vídeo.");
    console.log("");
    console.log(
      "  node build_all.js --url <URL>"
    );
    console.log(
      "    Baixa o vídeo a partir da URL informada (ignora o nome fixo de S3),"
    );
    console.log("    gera os frames PNG e prepara o app para usar esse vídeo.");
    console.log("");
    console.log("Parâmetros opcionais:");
    console.log(
      "  --file, -f <nome>   Define o nome do arquivo local a ser salvo/baixado (S3)."
    );
    console.log(
      "  --double-frames, -d  Dobra a quantidade de frames gerados, criando frames intermediários"
    );
    console.log(
      "  --url, -u <URL>      Define explicitamente a URL do vídeo a ser baixado."
    );
    console.log(
      "                    (usa FFmpeg/minterpolate após a geração dos frames PNG)."
    );
    console.log("  --help, -h        Mostra esta ajuda.");
    console.log("");
    process.exit(0);
  }

  // Caso ESPECIFIQUE um nome de arquivo ou uma URL como parâmetro:
  // - Sempre baixar da web, independentemente do que já existe no diretório
  // - Antes de baixar, deletar qualquer arquivo existente no diretório
  if (fileName || url) {
    // Garante que o diretório exista
    if (!fs.existsSync(VIDEO_DIR)) {
      fs.mkdirSync(VIDEO_DIR, { recursive: true });
    }

    // Deletar todos os arquivos existentes no diretório
    const existing = listVideoFiles();
    if (existing.length > 0) {
      console.log(
        `Removendo ${existing.length} arquivo(s) existente(s) em src/video-element-src antes de baixar o novo vídeo...`
      );
      for (const f of existing) {
        const fullPath = path.join(VIDEO_DIR, f);
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error(`Erro ao remover arquivo ${f}: ${err.message}`);
        }
      }
    }

    // Determinar URL final e nome de arquivo local
    let finalUrl = url;
    let finalFileName = fileName;

    if (finalUrl) {
      // Se a URL foi informada explicitamente, podemos inferir o nome do arquivo, se necessário
      if (!finalFileName) {
        try {
          const urlObj = new URL(finalUrl);
          const base = path.basename(urlObj.pathname) || "video-from-url.mp4";
          finalFileName = base;
        } catch (e) {
          console.error(
            "Erro: URL inválida informada em --url/-u. Use um endereço completo, ex.: https://exemplo.com/video.mp4"
          );
          process.exit(1);
        }
      }
    } else {
      // Sem URL explícita: usar o padrão S3 baseado no nome de arquivo
      finalUrl = `https://imbroisi-tools.s3.us-east-1.amazonaws.com/media/${fileName}`;
      finalFileName = fileName;
    }

    const destPath = path.join(VIDEO_DIR, finalFileName);

    console.log(`Baixando arquivo de: ${finalUrl}`);
    console.log(`Salvando em: ${destPath}`);

    try {
      await downloadFile(finalUrl, destPath);
    } catch (err) {
      console.error(
        `Erro ao baixar o arquivo a partir da URL:\n  ${finalUrl}\nDetalhes: ${err.message}`
      );
      process.exit(1);
    }

    // Verificar se o arquivo foi colocado no diretório
    let exists = false;
    try {
      const stat = fs.statSync(destPath);
      exists = stat.isFile() && stat.size > 0;
    } catch (e) {
      exists = false;
    }

    if (!exists) {
      console.error(
        `Erro: o arquivo baixado a partir da URL\n  ${finalUrl}\n` +
          `não foi encontrado em disco ou está vazio.\n` +
          `Caminho esperado: ${destPath}`
      );
      process.exit(1);
    }

    // Executar o split para o arquivo recém-baixado
    runSplit(fileName);

    // Opcionalmente, interpolar frames (dobrar quantidade)
    if (doubleFrames) {
      doubleFramesWithInterpolation();
    }

    return;
  }

  // Se NÃO foi passado nome de arquivo como parâmetro,
  // aplicar a lógica original: usar o que já está no diretório.

  // Passo 1: verificar arquivos existentes
  const existingFiles = listVideoFiles();

  // Passo 2: mais de um arquivo -> erro
  if (existingFiles.length > 1) {
    console.error(
      `Erro: existem ${existingFiles.length} arquivos em src/video-element-src. Só pode haver um. Arquivos: ${existingFiles.join(
        ", "
      )}`
    );
    process.exit(1);
  }

  // Passo 3: se já tiver um, pular direto para o split
  if (existingFiles.length === 1) {
    const existing = existingFiles[0];
    console.log(
      `Arquivo de vídeo já encontrado em src/video-element-src: ${existing}`
    );
    runSplit(existing);

    // Opcionalmente, interpolar frames (dobrar quantidade)
    if (doubleFrames) {
      doubleFramesWithInterpolation();
    }

    return;
  }

  // Se chegou aqui, não há arquivo no diretório e também não foi passado parâmetro
  console.error(
    "Erro: não há arquivos em src/video-element-src e nenhum nome de arquivo foi especificado.\n" +
      "Uso: node build_all.js <nome-do-arquivo.mp4>"
  );
  process.exit(1);
}

main().catch((err) => {
  console.error("Erro inesperado:", err);
  process.exit(1);
});


