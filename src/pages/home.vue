<template>
  <div class="pagina">

    <!-- CABEÇALHO -->
    <header class="cabecalho">
      <div class="logotipo">EPIra</div>
      <nav class="links-navegacao">
        <a href="#" class="link-nav">Recursos</a>
        <a href="#" class="link-nav">Suporte</a>
      </nav>
      <router-link to="/login" class="botao-login">Login</router-link>
    </header>

    <!-- HERÓI -->
    <section class="secao-heroi">
      <h1 class="titulo-heroi">Controle de EPIs</h1>
      <h1 class="titulo-heroi destaque-azul">Inteligente e Seguro</h1>
      <p class="descricao-heroi">
        Simplifique a gestão de segurança, reduza custos operacionais e
        garanta a conformidade da sua equipe com um clique. A solução
        definitiva para a NR-6.
      </p>
      <button class="botao-video">
        <span class="icone-play">▶</span> Ver Vídeo
      </button>
      <div class="imagem-heroi">
        <span class="texto-placeholder">Colocar imagem aqui</span>
      </div>
    </section>

    <!-- SENAI -->
    <section class="secao-senai">
      <p class="texto-senai">aprovado pelo Senai, pronto para transformar sua empresa</p>
      <img src="/home_assets/senai_asset.jpg" alt="SENAI" class="logo-senai" />
    </section>

    <!-- VANTAGENS -->
    <section class="secao-vantagens">
      <span class="etiqueta-secao">POR QUE ESCOLHER O EPIra?</span>
      <h2 class="titulo-secao">Gerenciamento completo para sua segurança</h2>
      <p class="descricao-secao">
        Nossa plataforma centraliza todas as necessidades de EPIs da sua empresa, garantindo
        que nada passe despercebido.
      </p>

      <div class="grade-cartoes">
        <div class="cartao-vantagem">
          <div class="icone-cartao icone-azul">
            <img src="/home_assets/reducao_asset.png" alt="Redução de Custos" />
          </div>
          <h3 class="titulo-cartao">Redução de Custos</h3>
          <p class="descricao-cartao">
            Evite desperdícios e compras desnecessárias com um controle preciso de estoque e
            a previsão de demanda inteligente.
          </p>
        </div>

        <div class="cartao-vantagem">
          <div class="icone-cartao icone-azul">
            <img src="/home_assets/Shield.png" alt="Conformidade NR-6" />
          </div>
          <h3 class="titulo-cartao">Conformidade NR-6</h3>
          <p class="descricao-cartao">
            Mantenha-se em dia com as normas regulamentadoras. Emita fichas de EPI
            digitais com validade jurídica.
          </p>
        </div>

        <div class="cartao-vantagem">
          <div class="icone-cartao icone-azul">
            <img src="/home_assets/Box_asset.png" alt="Estoque em Tempo Real" />
          </div>
          <h3 class="titulo-cartao">Estoque em Tempo Real</h3>
          <p class="descricao-cartao">
            Monitore entradas e saídas instantaneamente. Receba alertas quando
            o estoque mínimo for atingido.
          </p>
        </div>
      </div>
    </section>

    <!-- RECURSO 1 - RASTREAMENTO -->
    <section class="secao-recurso recurso-direita">
      <div class="visual-recurso"></div>
      <div class="texto-recurso">
        <div class="icone-recurso">
          <img src="/home_assets/rastreamento_asset.png" alt="" />
        </div>
        <h2 class="titulo-recurso">Rastreamento Automático</h2>
        <p class="descricao-recurso">
          Tenha controle total sobre onde está cada equipamento. Nosso sistema
          atualiza o estoque em tempo real conforme as entregas são realizadas,
          eliminando planilhas manuais e erros de contagem.
        </p>
        <ul class="lista-recurso">
          <li><img src="/home_assets/check_asset.png" alt="✓" class="marcador-verde" /> Controle por centro de custo</li>
          <li><img src="/home_assets/check_asset.png" alt="✓" class="marcador-verde" /> Histórico completo de movimentação</li>
          <li><img src="/home_assets/check_asset.png" alt="✓" class="marcador-verde" /> Relatórios exportáveis em PDF/Excel</li>
        </ul>
      </div>
    </section>

    <!-- RECURSO 2 - CADASTRO -->
    <section class="secao-recurso recurso-esquerda">
      <div class="texto-recurso">
        <div class="icone-recurso">
          <img src="/home_assets/cadastro_asset.png" alt="" />
        </div>
        <h2 class="titulo-recurso">cadastro automático</h2>
        <p class="descricao-recurso">
          Esqueça o papel. Com o EPIra, a entrega de EPI é registrada digitalmente
          via assinatura eletrônica, garantindo autenticidade e agilidade no
          processo de entrega.
        </p>
        <ul class="lista-recurso">
          <li><img src="/home_assets/check_asset.png" alt="✓" class="marcador-verde" /> Ficha de EPI digital automática</li>
          <li><img src="/home_assets/check_asset.png" alt="✓" class="marcador-verde" /> Ficha completa gerada automaticamente</li>
          <li><img src="/home_assets/check_asset.png" alt="✓" class="marcador-verde" /> Validade jurídica garantida</li>
        </ul>
      </div>
      <div class="visual-recurso"></div>
    </section>

    <!-- RECURSO 3 - ALERTAS -->
    <section class="secao-recurso recurso-direita">
      <div class="visual-recurso"></div>
      <div class="texto-recurso">
        <div class="icone-recurso">
          <img src="/home_assets/alerta_asset.png" alt="" />
        </div>
        <h2 class="titulo-recurso">Alertas de Validade</h2>
        <p class="descricao-recurso">
          Não seja pego de surpresa. O sistema monitora constantemente os prazos
          de validade dos equipamentos (CA) e notifica os gestores antes que os
          problemas aconteçam.
        </p>
        <ul class="lista-recurso">
          <li><img src="/home_assets/check_asset.png" alt="✓" class="marcador-verde" /> Avisos configuráveis por e-mail e SMS</li>
          <li><img src="/home_assets/check_asset.png" alt="✓" class="marcador-verde" /> Controle de validade do CA e do fabricante</li>
          <li><img src="/home_assets/check_asset.png" alt="✓" class="marcador-verde" /> Dashboard de pendências críticas</li>
        </ul>
      </div>
    </section>

    <!-- CHAMADA FINAL -->
    <section class="secao-chamada">
      <h2 class="titulo-chamada">Pronto para elevar a segurança da sua empresa?</h2>
      <p class="descricao-chamada">
        Junte-se a centenas de empresas que já modernizaram a gestão de EPIs com o EPIra.
      </p>
      <div class="botoes-chamada">
        <button class="botao-primario">Solicitar Demonstração</button>
        <button class="botao-secundario">Falar com Especialista</button>
      </div>
    </section>

    <!-- RODAPÉ -->
    <footer class="rodape">
      <div class="marca-rodape">
        <div class="logo-rodape">EPIra</div>
        <p class="descricao-rodape">
          Transformando a segurança do trabalho através de tecnologia e inovação.
        </p>
      </div>

      <div class="colunas-rodape">
        <div class="coluna-rodape">
          <h4 class="titulo-coluna">Produto</h4>
          <a href="#">Funcionalidades</a>
          <a href="#">Integrações</a>
          <a href="#">Preços</a>
          <a href="#">Atualizações</a>
        </div>

        <div class="coluna-rodape">
          <h4 class="titulo-coluna">Empresa</h4>
          <a href="#">Sobre Nós</a>
          <a href="#">Carreiras</a>
          <a href="#">Blog</a>
          <a href="#">Contato</a>
        </div>

        <div class="coluna-rodape">
          <h4 class="titulo-coluna">Legal</h4>
          <a href="#">Privacidade</a>
          <a href="#">Termos de Uso</a>
          <a href="#">Segurança</a>
        </div>
      </div>

      <div class="creditos-rodape">
        © 2026 EPIra Management System. Todos os direitos reservados.
      </div>
    </footer>

  </div>
</template>

<script>
export default {
  name: "home",
};
</script>

<style scoped>
/* ====== BASE ====== */
.pagina {
  background: #060A14;
  color: #E5E7EB;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

/* ====== CABEÇALHO ====== */
.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 60px;
  background: rgba(6, 10, 20, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logotipo {
  font-size: 22px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: -0.5px;
}

.links-navegacao {
  display: flex;
  gap: 32px;
}

.link-nav {
  color: #9CA3AF;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.link-nav:hover {
  color: #FFFFFF;
}

.botao-login {
  background: #2563EB;
  color: #FFFFFF;
  border: none;
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: background 0.2s;
}

.botao-login:hover {
  background: #1D4ED8;
}

/* ====== HERÓI ====== */
.secao-heroi {
  text-align: center;
  padding: 80px 24px 40px;
  background: radial-gradient(ellipse at top, #0A1530 0%, #060A14 70%);
}

.titulo-heroi {
  font-size: 56px;
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
  color: #FFFFFF;
  letter-spacing: -1.5px;
}

.destaque-azul {
  background: linear-gradient(90deg, #60A5FA 0%, #22D3EE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 4px;
}

.descricao-heroi {
  max-width: 620px;
  margin: 24px auto 32px;
  color: #9CA3AF;
  font-size: 16px;
  line-height: 1.6;
}

.botao-video {
  background: transparent;
  border: 1px solid #2563EB;
  color: #FFFFFF;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.botao-video:hover {
  background: rgba(37, 99, 235, 0.15);
}

.icone-play {
  color: #60A5FA;
  font-size: 12px;
}

.imagem-heroi {
  max-width: 880px;
  margin: 50px auto 0;
  height: 380px;
  background: #C9CACC;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4B5563;
  font-size: 15px;
}

/* ====== SENAI ====== */
.secao-senai {
  text-align: center;
  padding: 60px 24px;
  background: #060A14;
}

.texto-senai {
  color: #9CA3AF;
  font-size: 13px;
  margin-bottom: 16px;
}

.logo-senai {
  height: 60px;
  width: auto;
  object-fit: contain;
}

/* ====== VANTAGENS ====== */
.secao-vantagens {
  background: #0A0F1C;
  padding: 80px 60px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.etiqueta-secao {
  display: inline-block;
  background: rgba(37, 99, 235, 0.15);
  color: #60A5FA;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  padding: 6px 14px;
  border-radius: 999px;
  margin-bottom: 18px;
}

.titulo-secao {
  font-size: 36px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 0 16px;
  letter-spacing: -0.8px;
}

.descricao-secao {
  color: #9CA3AF;
  max-width: 640px;
  margin: 0 auto 50px;
  font-size: 15px;
  line-height: 1.6;
}

.grade-cartoes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.cartao-vantagem {
  background: linear-gradient(180deg, #111827 0%, #0B1220 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 32px 24px;
  border-radius: 14px;
  text-align: left;
  transition: transform 0.2s, border-color 0.2s;
}

.cartao-vantagem:hover {
  transform: translateY(-3px);
  border-color: rgba(96, 165, 250, 0.3);
}

.icone-cartao {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 18px;
}

.icone-cartao img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.icone-azul {
  background: rgba(37, 99, 235, 0.2);
  color: #60A5FA;
}

.icone-verde {
  background: rgba(34, 197, 94, 0.2);
  color: #4ADE80;
}

.icone-roxo {
  background: rgba(168, 85, 247, 0.2);
  color: #C084FC;
}

.titulo-cartao {
  font-size: 18px;
  color: #FFFFFF;
  margin: 0 0 10px;
  font-weight: 600;
}

.descricao-cartao {
  color: #9CA3AF;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

/* ====== RECURSOS ====== */
.secao-recurso {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  padding: 80px 80px;
  max-width: 1200px;
  margin: 0 auto;
}

.recurso-esquerda {
  /* texto à esquerda, imagem à direita */
}

.recurso-direita {
  /* imagem à esquerda, texto à direita */
}

.visual-recurso {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  height: 320px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.imagem-recurso {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icone-recurso {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.icone-recurso img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(62%) sepia(57%) saturate(2398%) hue-rotate(199deg) brightness(101%) contrast(96%);
}

.mock-painel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mock-cabecalho {
  background: #0B1220;
  padding: 12px 14px;
  border-radius: 8px;
  color: #9CA3AF;
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.mock-linha {
  background: #1F2937;
  height: 12px;
  border-radius: 4px;
  width: 100%;
}

.mock-linha.curta {
  width: 60%;
}

.mock-grande {
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
}

.mock-alertas {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alerta {
  padding: 14px 16px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.alerta strong {
  font-size: 14px;
  font-weight: 600;
}

.alerta span {
  opacity: 0.8;
  font-size: 12px;
}

.alerta-vermelho {
  background: rgba(239, 68, 68, 0.15);
  border-left: 3px solid #EF4444;
  color: #FCA5A5;
}

.alerta-amarelo {
  background: rgba(234, 179, 8, 0.15);
  border-left: 3px solid #EAB308;
  color: #FDE68A;
}

.alerta-verde {
  background: rgba(34, 197, 94, 0.15);
  border-left: 3px solid #22C55E;
  color: #86EFAC;
}

.texto-recurso {
  padding: 0 12px;
}

.titulo-recurso {
  font-size: 30px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 0 16px;
  letter-spacing: -0.6px;
}

.descricao-recurso {
  color: #9CA3AF;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 22px;
}

.lista-recurso {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lista-recurso li {
  color: #D1D5DB;
  font-size: 14px;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.marcador-verde {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  object-fit: contain;
}

/* ====== CHAMADA FINAL ====== */
.secao-chamada {
  background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%);
  text-align: center;
  padding: 70px 24px;
}

.titulo-chamada {
  font-size: 32px;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0 0 14px;
  letter-spacing: -0.6px;
}

.descricao-chamada {
  color: #BFDBFE;
  font-size: 15px;
  margin-bottom: 30px;
}

.botoes-chamada {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
}

.botao-primario {
  background: #FFFFFF;
  color: #1E3A8A;
  border: none;
  padding: 12px 26px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.botao-primario:hover {
  background: #E5E7EB;
}

.botao-secundario {
  background: transparent;
  color: #FFFFFF;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 12px 26px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.botao-secundario:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* ====== RODAPÉ ====== */
.rodape {
  background: #060A14;
  padding: 60px 80px 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: grid;
  grid-template-columns: 1.2fr 2fr;
  gap: 60px;
}

.marca-rodape {
  max-width: 280px;
}

.logo-rodape {
  font-size: 20px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 12px;
}

.descricao-rodape {
  color: #6B7280;
  font-size: 13px;
  line-height: 1.6;
}

.colunas-rodape {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.coluna-rodape {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.titulo-coluna {
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 6px;
}

.coluna-rodape a {
  color: #6B7280;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}

.coluna-rodape a:hover {
  color: #FFFFFF;
}

.creditos-rodape {
  grid-column: 1 / -1;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 24px;
  margin-top: 30px;
  text-align: center;
  color: #4B5563;
  font-size: 12px;
}

/* ====== RESPONSIVO ====== */
@media (max-width: 900px) {
  .cabecalho { padding: 16px 24px; }
  .titulo-heroi { font-size: 36px; }
  .secao-recurso {
    grid-template-columns: 1fr;
    padding: 60px 24px;
    gap: 30px;
  }
  .grade-cartoes { grid-template-columns: 1fr; }
  .secao-vantagens { padding: 60px 24px; }
  .rodape {
    grid-template-columns: 1fr;
    padding: 50px 24px;
  }
  .colunas-rodape { grid-template-columns: repeat(2, 1fr); }
}
</style>
