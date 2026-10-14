# EPIra

Sistema web para controlar retirada, devolução e estoque de EPIs (equipamentos de proteção individual) numa instituição de ensino técnico. Foi o Projeto Integrador do SENAI em 2026/01, feito por uma equipe de cinco pessoas, com o Henrique ([@henriqueVMdev](https://github.com/henriqueVMdev)) na liderança do projeto.

## O problema

A demanda veio do SENAI Valinhos: o controle de EPIs era feito em papel e sem muita organização. Isso dá perda de equipamento, falta de estoque na hora errada, compra desnecessária e risco de segurança quando ninguém acompanha a validade do que está nas mãos dos funcionários.

O EPIra troca o papel por um sistema onde cada retirada fica registrada e ligada a uma pessoa, o estoque e as validades aparecem num lugar só e o administrador consegue tirar relatório sem montar planilha.

## O que o sistema faz

O papel de cada usuário fica em `profiles.role`, que pode ser `adm` ou `funcionario`. Quem não é adm cai na área de funcionário. O administrador troca o papel de alguém na tela de Funcionários.

### Funcionário

- Solicitar EPI: escolhe o equipamento e a quantidade, escreve a justificativa e dá o aceite digital (um aceite no sistema com o termo de responsabilidade, sem certificado digital). O pedido fica pendente até um administrador decidir.
- Minhas solicitações: lista os pedidos com o status (pendente, aprovado ou recusado) e o motivo, quando houve recusa.
- Meus EPIs: o que a pessoa tem em posse hoje, calculado a partir do histórico de movimentações (entregas menos devoluções), com a situação da validade de cada item. EPI vencido ou a 30 dias ou menos de vencer gera um aviso no topo da tela e um contador no menu.

### Administrador

- Aprovações: fila de solicitações com filtro por status. Aprovar e recusar chamam funções do banco, e a recusa aceita um motivo opcional.
- Funcionários: lista as contas e edita nome, CPF (com máscara e validação dos dígitos verificadores), departamento, cargo, papel e se a conta está ativa. A exclusão também passa por uma função do banco.
- Gestão de EPIs: cadastro, edição e exclusão de EPIs com nome, categoria, número do CA, validade, quantidade e observações. Mostra os que vencem em até 30 dias ou já venceram.
- Entregas / Devoluções: registra a movimentação de um EPI para uma pessoa ativa, com confirmação de assinatura. Na devolução é preciso informar a condição do item (bom estado, danificado ou para descarte). Os registros podem ser editados e excluídos.
- Relatórios: quatro indicadores no topo, dois gráficos (saúde do inventário e os seis EPIs com menos estoque) e duas listas com filtros, uma de movimentações e outra de estoque. As duas exportam em PDF.
- Meus EPIs: igual ao do funcionário, com um botão extra para o administrador registrar uma retirada para si mesmo.

## Tecnologias

- Vue 3 (Composition API, `<script setup>`)
- Vue Router 4, com rotas carregadas sob demanda e guarda de navegação por login e por papel
- Vite 8
- Supabase (Auth e Postgres, via `@supabase/supabase-js` 2)
- Chart.js 4 para os gráficos
- jsPDF e jspdf-autotable para os PDFs
- Font Awesome, carregado por CDN
- Vercel para o deploy (o `vercel.json` manda toda rota para o `index.html`)

## Rodando localmente

```bash
git clone https://github.com/henriqueVMdev/EPIra.git
cd EPIra
npm install
```

Crie um arquivo `.env` na raiz com as credenciais do seu projeto Supabase:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

Depois:

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção em dist/
npm run preview  # serve o build localmente
```

Se as duas variáveis faltarem, o console do navegador avisa.

## Banco de dados

O SQL do banco não está neste repositório. O que segue é o que o código lê e escreve, para quem precisar montar um projeto Supabase do zero.

| Tabela | Colunas usadas pelo front |
| --- | --- |
| `profiles` | `id`, `nome`, `email`, `cpf`, `cargo`, `departamento`, `role`, `ativo` |
| `epis` | `id`, `nome`, `categoria`, `ca`, `validade`, `quantidade`, `obs`, `created_at` |
| `movimentacoes` | `id`, `funcionario`, `profile_id`, `tipo` (`entrega` ou `devolucao`), `epi_id`, `quantidade`, `data`, `observacoes`, `assinatura_confirmada` |
| `solicitacoes_epi` | `id`, `solicitante_id`, `epi_id`, `quantidade`, `justificativa`, `status` (`pendente`, `aprovado`, `recusado`), `motivo_recusa`, `criado_em`, `decidido_em` |

Funções chamadas por RPC: `aprovar_solicitacao(p_id)`, `recusar_solicitacao(p_id, p_motivo)` e `excluir_funcionario(p_id)`.

No cadastro, o front só chama `signUp` e manda nome e CPF como metadata do usuário. Ele não insere nada em `profiles`.

## Estrutura

```
src/
  composables/
    useSupabase.js        cliente Supabase, sessão e perfil
    useEpiPossession.js   saldo em posse e status de validade
  layouts/applayout.vue   menu lateral e aviso global de validade
  pages/                  uma tela por rota
  router/index.js         rotas e guarda de navegação
```

## Decisões técnicas

A sessão do Supabase dava tela em branco em alguns navegadores: o `getSession()` travava esperando o lock interno do `supabase-js` e o guard de rota ficava esperando para sempre. A saída foi desligar o lock no cliente, usar só o `onAuthStateChange` como fonte da sessão, adiar a busca do perfil com `setTimeout` (para não reentrar no lock) e liberar a navegação depois de 4 segundos se a inicialização não responder.

O saldo de EPIs em posse não é uma coluna: é recalculado somando as entregas e subtraindo as devoluções de cada pessoa. Assim o histórico continua sendo a única fonte da verdade.

## Limitações

- Não há testes automatizados no repositório.
- Os alertas de validade aparecem só dentro do sistema, não saem por e-mail nem SMS.
- Os relatórios saem apenas em PDF.
- O esquema do banco, as funções e as políticas de acesso vivem no projeto Supabase e não estão versionados aqui.

## Projeto irmão

O [OmniSeg](https://github.com/henriqueVMdev/OmniSeg) é a versão individual do Henrique para o mesmo tema, com quatro papéis de acesso e outro modelo de dados.
