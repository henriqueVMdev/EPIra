<template>
  <div class="page">

    <nav class="navbar">
      <div class="navbar-logo">EPIra</div>
      <div class="navbar-links">
        <a href="#">Recursos</a>
        <a href="#">Suporte</a>
      </div>
      <button class="btn-login">Login</button>
    </nav>

    <section class="hero">
      <h1>Controle de EPIs</h1>
      <h1 class="hero-highlight">Inteligente e Seguro</h1>
      <p class="hero-desc">
        Simplifique a gestão de segurança, reduza custos operacionais e
        garanta a conformidade da sua equipe com um clique. A solução
        definitiva para a NR-6.
      </p>
      <button class="btn-video">Ver Vídeo</button>
      <div class="hero-image">
        <span>Colocar imagem aqui</span>
      </div>
    </section>

    <section class="senai">
      <p>aprovado pelo Senai, pronto para transformar sua empresa</p>
      <img src="" alt="SENAI" class="senai-logo" />
    </section>

    <section class="why">
      <span class="why-tag">POR QUE ESCOLHER O SAFECONTROL?</span>
      <h2>Gerenciamento completo para sua segurança</h2>
      <p class="why-desc">
        Nossa plataforma centraliza todas as necessidades de EPIs da sua empresa, garantindo
        que nada passe despercebido.
      </p>
      <div class="why-cards">
        <div class="card">
          <div class="card-icon"></div>
          <h3>Redução de Custos</h3>
          <p>Evite desperdícios e compras desnecessárias com um controle preciso de estoque e a previsão de demanda inteligente.</p>
        </div>
        <div class="card">
          <div class="card-icon"></div>
          <h3>Conformidade NR-6</h3>
          <p>Mantenha-se em dia com as normas regulamentadoras. Emita fichas de EPI digitais com validade jurídica.</p>
        </div>
        <div class="card">
          <div class="card-icon"></div>
          <h3>Estoque em Tempo Real</h3>
          <p>Monitore entradas e saídas instantaneamente. Receba alertas quando o estoque mínimo for atingido.</p>
        </div>
      </div>
    </section>

    <section class="feature feature-right">
      <div class="feature-image">
        <div class="mock-panel">Painel de Estoque</div>
      </div>
      <div class="feature-text">
        <h2>Rastreamento Automático</h2>
        <p>
          Tenha controle total sobre onde está cada equipamento. Nosso sistema atualiza
          o estoque em tempo real conforme as entregas são realizadas, eliminando planilhas
          manuais e erros de contagem.
        </p>
        <ul>
          <li>Controle por centro de custo</li>
          <li>Histórico completo de movimentação</li>
          <li>Relatórios exportáveis em PDF/Excel</li>
        </ul>
      </div>
    </section>

    <section class="feature feature-left">
      <div class="feature-text">
        <h2>cadastro automático</h2>
        <p>
          Esqueça o papel. Com o SafeControl, a entrega de EPI é registrada digitalmente
          via assinatura eletrônica, garantindo autenticidade e agilidade no processo de entrega.
        </p>
        <ul>
          <li>Ficha de EPI digital automática</li>
          <li>Ficha completa gerada automaticamente</li>
          <li>Validade jurídica garantida</li>
        </ul>
      </div>
      <div class="feature-image">
        <div class="mock-panel">Imagem aqui</div>
      </div>
    </section>

    <section class="feature feature-right">
      <div class="feature-image">
        <div class="mock-alerts">
          <div class="alert alert-red">Atenção: Validade Próxima — 2 dias</div>
          <div class="alert alert-yellow">Estoque Crítico — 1h</div>
          <div class="alert alert-green">Entrega Concluída</div>
        </div>
      </div>
      <div class="feature-text">
        <h2>Alertas de Validade</h2>
        <p>
          Não seja pego de surpresa. O sistema monitora constantemente os prazos de validade
          dos equipamentos (CA) e notifica os gestores antes que os problemas aconteçam.
        </p>
        <ul>
          <li>Avisos configuráveis por e-mail e SMS</li>
          <li>Controle de validade do CA e do fabricante</li>
          <li>Dashboard de pendências críticas</li>
        </ul>
      </div>
    </section>

    <section class="cta">
      <h2>Pronto para elevar a segurança da sua empresa?</h2>
      <p>Junte-se a centenas de empresas que já modernizaram a gestão de EPIs com o SafeControl.</p>
      <div class="cta-buttons">
        <button class="btn-primary">Solicitar Demonstração</button>
        <button class="btn-secondary">Falar com Especialista</button>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-brand">
        <div class="footer-logo">SafeControl</div>
        <p>Transformando a segurança do trabalho através de tecnologia e inovação.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Produto</h4>
          <a href="#">Funcionalidades</a>
          <a href="#">Integrações</a>
          <a href="#">Preços</a>
          <a href="#">Atualizações</a>
        </div>
        <div class="footer-col">
          <h4>Empresa</h4>
          <a href="#">Sobre Nós</a>
          <a href="#">Carreiras</a>
          <a href="#">Blog</a>
          <a href="#">Contato</a>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <a href="#">Privacidade</a>
          <a href="#">Termos de Uso</a>
          <a href="#">Segurança</a>
        </div>
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
</style>
