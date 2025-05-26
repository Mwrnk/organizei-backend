# Exemplos de Teste - Sistema de Quiz

## Pré-requisitos

1. Usuário autenticado (token JWT)
2. Card criado com pelo menos um PDF anexado
3. Variável `OPENAI_API_KEY` configurada

## Teste 1: Iniciar Quiz

### Request
```bash
POST /quiz/start/64f8a1b2c3d4e5f6a7b8c9d0
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Resposta Esperada
```json
{
  "status": "success",
  "data": {
    "sessionId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "question": {
      "question": "Com base no documento, qual é a principal função do sistema cardiovascular?",
      "options": [
        "Produzir hormônios",
        "Transportar nutrientes e oxigênio pelo corpo",
        "Filtrar toxinas do sangue",
        "Regular a temperatura corporal"
      ]
    },
    "cardTitle": "Sistema Cardiovascular"
  }
}
```

## Teste 2: Responder Pergunta (Correta)

### Request
```bash
POST /quiz/answer/64f8a1b2c3d4e5f6a7b8c9d1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "answer": 1,
  "timeSpent": 25
}
```

### Resposta Esperada
```json
{
  "status": "success",
  "data": {
    "isCorrect": true,
    "correctAnswer": 1,
    "correctOption": "Transportar nutrientes e oxigênio pelo corpo",
    "pointsEarned": 10,
    "totalOrgPoints": 26
  }
}
```

## Teste 3: Responder Pergunta (Incorreta)

### Request
```bash
POST /quiz/answer/64f8a1b2c3d4e5f6a7b8c9d2
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "answer": 0,
  "timeSpent": 15
}
```

### Resposta Esperada
```json
{
  "status": "success",
  "data": {
    "isCorrect": false,
    "correctAnswer": 2,
    "correctOption": "Transportar nutrientes e oxigênio pelo corpo",
    "pointsEarned": 0
  }
}
```

## Teste 4: Obter Estatísticas

### Request
```bash
GET /quiz/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

### Resposta Esperada
```json
{
  "status": "success",
  "data": {
    "totalQuizzes": 5,
    "correctAnswers": 3,
    "accuracy": 60,
    "totalPointsEarned": 30,
    "currentOrgPoints": 28
  }
}
```

## Teste 5: Obter Histórico

### Request
```bash
GET /quiz/history?page=1&limit=5
Authorization: Bearer YOUR_JWT_TOKEN
```

### Resposta Esperada
```json
{
  "status": "success",
  "data": {
    "quizzes": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "cardTitle": "Sistema Cardiovascular",
        "question": "Com base no documento, qual é a principal função do sistema cardiovascular?",
        "userAnswer": "Transportar nutrientes e oxigênio pelo corpo",
        "correctAnswer": "Transportar nutrientes e oxigênio pelo corpo",
        "isCorrect": true,
        "pointsEarned": 10,
        "timeSpent": 25,
        "completedAt": "2024-01-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "totalDocs": 5,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

## Casos de Erro

### Erro 1: Card sem PDF
```bash
POST /quiz/start/64f8a1b2c3d4e5f6a7b8c9d0
```

**Resposta**:
```json
{
  "status": "fail",
  "message": "Este card não possui PDFs para gerar perguntas"
}
```

### Erro 2: Sessão já ativa
```bash
POST /quiz/start/64f8a1b2c3d4e5f6a7b8c9d0
```

**Resposta**:
```json
{
  "status": "fail",
  "message": "Você já possui uma sessão de quiz ativa para este card"
}
```

### Erro 3: Resposta inválida
```bash
POST /quiz/answer/64f8a1b2c3d4e5f6a7b8c9d1
{
  "answer": 5
}
```

**Resposta**:
```json
{
  "status": "fail",
  "message": "Resposta inválida. Deve ser um número entre 0 e 3"
}
```

### Erro 4: Sessão já finalizada
```bash
POST /quiz/answer/64f8a1b2c3d4e5f6a7b8c9d1
{
  "answer": 2
}
```

**Resposta**:
```json
{
  "status": "fail",
  "message": "Esta sessão já foi finalizada"
}
```

## Testando com cURL

### Iniciar Quiz
```bash
curl -X POST http://localhost:3000/quiz/start/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Responder Pergunta
```bash
curl -X POST http://localhost:3000/quiz/answer/64f8a1b2c3d4e5f6a7b8c9d1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answer": 1, "timeSpent": 30}'
```

### Obter Estatísticas
```bash
curl -X GET http://localhost:3000/quiz/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Obter Histórico
```bash
curl -X GET "http://localhost:3000/quiz/history?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testando com Postman

1. **Configurar Ambiente**:
   - Variável `baseUrl`: `http://localhost:3000`
   - Variável `token`: Seu JWT token

2. **Collection de Testes**:
   - Criar requests para cada endpoint
   - Usar `{{baseUrl}}` e `{{token}}` nas configurações
   - Configurar testes automáticos para validar respostas

3. **Fluxo de Teste Completo**:
   1. Login para obter token
   2. Criar card com PDF
   3. Iniciar quiz
   4. Responder pergunta
   5. Verificar estatísticas
   6. Consultar histórico

## Monitoramento

### Logs Importantes
- Extração de texto do PDF
- Geração de pergunta via IA
- Atualização de OrgPoints
- Erros de validação

### Métricas
- Taxa de acerto dos usuários
- Tempo médio de resposta
- Número de quizzes por dia
- Cards mais utilizados para quiz 