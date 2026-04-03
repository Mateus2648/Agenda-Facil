# Agenda Fácil 📅

**Agenda Fácil** é um sistema SaaS (Software as a Service) multi-tenant completo para gestão de estabelecimentos com foco em agendamento online. Desenvolvido com uma abordagem *mobile-first*, o sistema permite que barbearias, salões de beleza e clínicas gerenciem seus horários, profissionais e clientes de forma eficiente.

## 🚀 Funcionalidades

### 🛡️ Painel Master (Administrador)
*   **Gestão de Estabelecimentos:** Criação, edição e exclusão de parceiros.
*   **Licenciamento:** Controle de datas de expiração e bloqueio automático de contas inadimplentes.
*   **Financeiro:** Visão geral de faturamento e métricas de crescimento.
*   **Logs de Atividade:** Rastreamento completo de ações críticas no sistema.
*   **Segurança:** Recuperação de senha e controle de acesso restrito.

### 💼 Portal do Parceiro (Estabelecimento)
*   **Dashboard:** Visão rápida de agendamentos do dia e faturamento mensal.
*   **Gestão de Agendamentos:** Calendário interativo para marcar, confirmar ou cancelar horários.
*   **Serviços e Profissionais:** Cadastro flexível de serviços com preços e durações personalizadas.
*   **Clientes:** Base de dados centralizada com histórico de visitas.
*   **Configurações de Marca:** Personalização de cores, logo e banner para a página pública.

### 📱 Página Pública (Cliente)
*   **Agendamento Online:** Interface intuitiva para o cliente escolher serviço, profissional e horário.
*   **Mobile-First:** Experiência otimizada para smartphones (semelhante a um app nativo).
*   **Link Personalizado:** Cada estabelecimento possui seu próprio slug (ex: `agenda-facil.com/minha-barbearia`).

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend/Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Auth)
*   **Ícones:** [Lucide React](https://lucide.dev/)
*   **Notificações:** [Sonner](https://sonner.emilkowal.ski/)
*   **Datas:** [date-fns](https://date-fns.org/)

## ⚙️ Configuração Local

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/agenda-facil.git
    cd agenda-facil
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto com as seguintes chaves do seu projeto Supabase:
    ```env
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

## 📦 Deploy (Vercel)

O projeto já está configurado para deploy na Vercel com suporte a rotas SPA.

1.  Conecte seu repositório ao painel da Vercel.
2.  Configure as **Environment Variables** (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
3.  O build será automático.

## 📄 Licença

Este projeto é privado e destinado ao uso comercial sob licença específica.

---
Desenvolvido por Mateus Aparecido Ferreira.
