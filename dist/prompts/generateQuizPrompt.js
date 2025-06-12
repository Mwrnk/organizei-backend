"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuizPrompt = exports.context = exports.temperature = exports.model = void 0;
exports.model = "gpt-4o-mini";
exports.temperature = 0.7;
exports.context = "Você é um gerador de perguntas de quiz educativo. Sua função é criar perguntas de múltipla escolha baseadas no conteúdo fornecido, com 4 opções sendo apenas uma correta.";
const generateQuizPrompt = (amount, pdfContent, cardTitle) => {
    return `
Com base no conteúdo do PDF fornecido sobre "${cardTitle}", gere ${amount} perguntas de múltipla escolha educativa.

### Conteúdo do PDF:
${pdfContent}

### Instruções:

1. Crie uma pergunta clara e objetiva baseada no conteúdo fornecido
2. A pergunta deve testar a compreensão do material, não apenas memorização
3. Gere exatamente 4 opções de resposta (A, B, C, D)
4. Apenas UMA opção deve estar correta
5. As opções incorretas devem ser plausíveis mas claramente erradas para quem entende o conteúdo
6. Evite perguntas muito óbvias ou muito complexas
7. Foque em conceitos importantes do material

### Formato da resposta (JSON):
{
    "question": "Qual é o conceito principal abordado no texto?",
    "options": [
        "Primeira opção (pode ser correta ou incorreta)",
        "Segunda opção (pode ser correta ou incorreta)", 
        "Terceira opção (pode ser correta ou incorreta)",
        "Quarta opção (pode ser correta ou incorreta)"
    ],
    "correctAnswer": 2
}

Onde "correctAnswer" é o índice (0-3) da resposta correta no array "options".

Apenas envie o JSON, sem nenhuma explicação ou comentário adicional.
    `;
};
exports.generateQuizPrompt = generateQuizPrompt;
