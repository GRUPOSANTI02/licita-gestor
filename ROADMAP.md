# 🚀 LicitaGestor - Roadmap de Evolução e Ideias

Este documento descreve uma análise técnica do estado atual do projeto e propõe funcionalidades inovadoras para transformar o **LicitaGestor** em uma ferramenta de inteligência competitiva de mercado.

## 📊 Estado Atual (Diagnóstico)
- **Interface**: Visual moderno, limpo e profissional (Roxo/Ambar/Azul).
- **Tecnologia**: Next.js 14, TailwindCSS, TypeScript. Performance excelente.
- **Dados**: Atualmente reside em `LocalStorage` (navegador). Risco de perda de dados se limpar cache.
- **Funcionalidades**: Gestão de Licitações (Kanban/Lista), Edição, Atas de Registro, Calendário e Dashboard Básico.

---

## 💡 Ideias de Melhoria (Brainstorming)

### 1. Inteligência Competitiva (O "Pulo do Gato") 🐱
Transforme o sistema de um "anotador" para um "estrategista".
- **Banco de Concorrentes**: Ao marcar uma licitação como "Perdida", cadastre QUEM ganhou e POR QUANTO.
- **Raio-X do Adversário**: O sistema gera relatórios: "A empresa *Construtora X* costuma dar 15% de desconto em licitações de Pavimentação em Dourados".
- **Sugestão de Lance**: Baseado no histórico, o sistema sugere: "Para ganhar esta licitação, seu lance ideal deve ser abaixo de R$ 150.000".

### 2. Dashboard Geográfico (Mapa de Calor) 🗺️
- Visualizar um **Mapa do Brasil (ou MS)** pintado com cores onde você ganha mais.
- Identificar cidades "oportunidade" onde há muitas licitações mas pouca participação.

### 3. "LicitaBot" com IA (Leitura de Edital) 🤖
- Upload do PDF do Edital.
- A IA extrai automaticamente:
  - **Data e Hora**
  - **Objeto**
  - **Exigências de Habilitação** (Atestados, Balanço)
  - **Valor Estimado**
- Isso economiza horas de digitação manual.

### 4. Integrações e Automação ⚡
- **Google Calendar/Outlook**: Sincronizar datas de sessões automaticamente com a agenda do celular.
- **WhatsApp Alerts**: Mandar mensagem 1h antes da sessão: "Ei, a licitação de Aquidauana começa em 1h. Prepare o café!".
- **Portal da Transparência/PNCP**: Buscar automaticamente novas licitações baseadas em palavras-chave ("Pavimentação", "Medicamentos") e adicionar como "Rascunho" para análise.

### 5. Gestão Financeira Avançada 💰
- **Funil de Vendas**: Taxa de Conversão (Quantas participei vs Quantas ganhei).
- **Controle de Empenhos**: Após ganhar, controlar quanto o órgão já pediu (Empenhou/Pagou) e quanto falta do saldo da Ata.

---

## 🛠️ Plano Técnico Sugerido (Próximos Passos)

### Prioridade Alta (Segurança e Dados)
1. **Migração para Supabase (Backend na Nuvem)**:
   - Garantir que os dados fiquem salvos na nuvem e acessíveis de qualquer computador/celular.
   - Autenticação real (Login/Senha).

2. **Upload de Arquivos**:
   - Criar "Bucket" para salvar os PDFs dos Editais e Atas assinadas.

### Prioridade Média (Visual e Usabilidade)
3. **Modo Escuro (Dark Mode)**:
   - Implementar troca de tema para conforto visual noturno.

4. **Exportação de Relatórios**:
   - Botão "Exportar Excel" na lista de Atas e Licitações para enviar pro contador/diretoria.

---

### Exemplo de Tela Nova: "Análise de Concorrente"
> *Imagine clicar num concorrente e ver um gráfico mostrando que ele sempre perde quando a licitação é presencial, mas ganha quando é eletrônica.*

---
**Criado por Antigravity (Google DeepMind)**
