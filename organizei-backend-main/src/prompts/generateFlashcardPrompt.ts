
export const model = "gpt-4o-mini";

export const temperature = 0.5;

export const context = "Você é um gerador de flashcards com base nos princípios de repetição espaçada, active recall e teoria da codificação dual.";

export const generateFlashcardPrompt = (
    amount: number, 
    subject: string, 
    existingFronts: string[],
    availableTags: string[]
): string => {
    return `
Receba um tema e gere flashcards de forma clara, diversa e focada em revisão de conteúdo.

### Instruções:

1. Crie ${amount} flashcards sobre o tema: "${subject}".
2. Não repita os seguintes conteúdos já existentes:
- ${existingFronts.map(front => `• ${front}`).join('\n')}
3. Evite perguntas muito introdutórias como "O que é..." se já foram usadas.
4. Varie os tipos de perguntas:
- Exemplos práticos
- Comparações
- Aplicações reais
- Dúvidas comuns
- Explicações alternativas
5. Cada flashcard deve conter:
- "front": uma pergunta curta e direta
- "back": a resposta detalhada e clara
- "tags": um array de nomes de tags (strings) relacionados ao assunto.
escolha **prioritariamente entre estas** tags já existentes no sistema:
${availableTags.map(tag => `- ${tag}`).join('\n')}
Caso necessário ou não exista nenhuma tag na lista acima, **você pode criar novas tags**, mas evite repetir ideias já representadas pelas existentes. As tags devem ser genéricas, reutilizáveis e descritivas.

### Formato da resposta (JSON):
[
    {
        "front": "Qual a diferença entre array e lista ligada?",
        "back": "Arrays têm acesso direto por índice, enquanto listas ligadas permitem inserções e remoções mais eficientes.",
        "tags": ["estrutura de dados", "array", "lista ligada"]
    },
...
]
Apenas envie a lista JSON, sem nenhuma explicação ou comentário adicional.
    `
};
