"use strict";
/**
 * Script do vídeo - Sequência de ações (comandos) e tempos de espera
 *
 * Formato: Array de objetos com:
 *   - wait: tempo de espera em segundos antes de executar a ação
 *   - cmd: comando legível (veja lista de comandos válidos abaixo)
 *
 * Este arquivo pode ser editado independentemente do código principal
 * para ajustar a sequência de ações do vídeo gerado.
 *
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIDEO_SCRIPT = void 0;
const VIDEO_SCRIPT = [
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
exports.VIDEO_SCRIPT = VIDEO_SCRIPT;
// Exportar tanto como default quanto como named export para compatibilidade
exports.default = VIDEO_SCRIPT;
/**
 * Significado dos comandos disponíveis:
 *
 * === Comandos de Controle Geral ===
 *
 * 'hide all' - Desliga tudo, exceto planeta/Sol, indicador de gravidade e círculo tracejado
 *              (remove canhão, instruções, humano, balas e indicador de distância)
 *
 * 'toggle cannon' - Toggle: apagar/mostrar canhão, texto de velocidade e balas na superfície
 *                    (se canhão estiver visível, esconde; se estiver escondido, mostra)
 *
 * 'switch planet' - Troca entre Terra, planeta rochoso e Sol
 *                   (ciclo: Sol -> Terra -> Planeta Rochoso -> Sol)
 *                   (também limpa todas as balas e desliga indicador de velocidade)
 *
 * 'earth' - Muda diretamente para Terra
 *           (limpa todas as balas e desliga indicador de velocidade)
 *
 * 'rock' - Muda diretamente para planeta rochoso
 *          (limpa todas as balas e desliga indicador de velocidade)
 *
 * 'sun' - Muda diretamente para Sol
 *         (limpa todas as balas e desliga indicador de velocidade)
 *
 * 'toggle distance' - Toggle: liga/desliga indicação de altura (linha tracejada e setas)
 *
 * 'hide instructions' / 'show instructions' - Liga/desliga painel de instruções
 *
 * === Comandos de Disparo ===
 *
 * 'fire 1' a 'fire 6' - Dispara bala nas velocidades 1, 2, 3, 4, 5, 6 km/s (proporcional para Sol)
 *
 * 'fire orbital' - Dispara bala na velocidade orbital (ajustada)
 *                  (para Terra: ~7.3 km/s, para Sol: ~402 km/s)
 *
 * 'fire escape' - Dispara bala na velocidade de escape
 *                 (para Terra: ~9.76 km/s, para Sol: ~618 km/s)
 *
 * 'cancel fire' - Desliga mostrador de velocidade (cancela disparo agendado)
 *
 * === Comandos de Tamanho do Planeta ===
 *
 * 'shrink planet' - Diminui o tamanho do planeta em 50% do tamanho atual
 *                   (com animação suave, permite diminuir até 1.5% para visualizar buraco negro)
 *                   (buraco negro aparece quando tamanho < 3.1%)
 *
 * 'grow planet' - Volta o tamanho do planeta para 100% (com animação suave)
 *
 * === Comandos do Humano ===
 *
 * 'hide human' / 'show human' - Liga/desliga humano
 *
 * 'kill human' - Mata o humano (remove da tela)
 *
 * 'move human down' - Move humano entre linha tracejada e superfície atual do planeta
 *
 */
