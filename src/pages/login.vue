<template>
  <div class="page-shell">
    <header class="app-header">
      <div class="brand">
        <div class="brand-logo">
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 29 Q5 7 22 7 Q39 7 39 29 Z" fill="white" opacity="0.95"/>
            <rect x="2" y="29" width="40" height="6" rx="3" fill="white" opacity="0.95"/>
            <path d="M10 29 Q10 14 22 13 Q34 14 34 29 Z" fill="rgba(10,22,80,0.18)"/>
            <line x1="22" y1="7" x2="22" y2="29" stroke="rgba(10,22,80,0.15)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="brand-name">EPIra</span>
        <span class="brand-divider">| Gestão SENAI</span>
      </div>
      <router-link to="/" class="link-voltar">← Voltar ao Início</router-link>
    </header>

    <main class="content">
      <h1>Acessar <span>Sistema</span></h1>

      <p class="intro">
        Entre com suas credenciais para gerenciar EPIs, validade de CA e estoque.
      </p>

      <section class="login-card" aria-label="Login do sistema">
        <div class="field">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="usuario@senai.br"
            class="input"
            autocomplete="email"
          />
        </div>

        <div class="field">
          <label for="senha">Senha</label>
          <input
            id="senha"
            v-model="form.senha"
            type="password"
            placeholder="Digite sua senha"
            class="input"
            autocomplete="current-password"
            @keyup.enter="entrar"
          />
        </div>

        <div class="login-options">
          <label class="checkbox-option">
            <input v-model="form.lembrar" type="checkbox" />
            <span>Lembrar acesso</span>
          </label>

          <button class="link-button" type="button">Esqueci minha senha</button>
        </div>

        <p v-if="mensagem" class="field-status" :class="{ error: temErro }">
          {{ mensagem }}
        </p>

        <button class="btn-primary" type="button" @click="entrar">
          Entrar
        </button>

        <div class="divisor">
          <span>ou</span>
        </div>

        <button class="btn-secondary" type="button" @click="criarConta">
          Criar uma conta
        </button>
      </section>

      <aside class="system-tip">
        <strong>Acesso seguro:</strong><br />
        Use seu login institucional para acompanhar certificados, validade e
        movimentações de estoque.
      </aside>
    </main>

    <footer class="app-footer">
      <p>© 2026 EPIra Management System. Todos os direitos reservados.</p>
      <nav aria-label="Links de rodapé">
        <a href="#">Suporte</a>
        <a href="#">Documentação</a>
        <a href="#">Privacidade</a>
      </nav>
    </footer>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const emit = defineEmits(['login'])

function criarConta() {
  router.push('/cadastro_user')
}

const form = reactive({
  email: '',
  senha: '',
  lembrar: true,
})

const mensagem = ref('')
const temErro = ref(false)

function entrar() {
  if (!form.email || !form.senha) {
    temErro.value = true
    mensagem.value = 'Informe e-mail e senha para continuar.'
    return
  }

  temErro.value = false
  mensagem.value = 'Login realizado.'
  emit('login', { email: form.email, lembrar: form.lembrar })
}
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0b1220;
  color: #ffffff;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 32px;
  border-bottom: 1px solid #1f2937;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #3b5bdb, #1971c2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-shadow: 0 3px 10px rgba(59, 91, 219, 0.4);
  flex-shrink: 0;
}

.brand-logo svg {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #60a5fa;
}

.brand-divider {
  color: #9ca3af;
  font-size: 14px;
}

.link-voltar {
  color: #93c5fd;
  text-decoration: none;
  font-size: 14px;
}

.link-voltar:hover {
  color: #bfdbfe;
}

.content {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 24px 16px 40px;
}

h1 {
  margin: 0 0 8px;
  color: #ffffff;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  text-align: center;
}

h1 span {
  color: #60a5fa;
  font-weight: 700;
}

.intro {
  max-width: 520px;
  margin-bottom: 32px;
  color: #9ca3af;
  text-align: center;
}

.login-card {
  width: 100%;
  max-width: 432px;
  padding: 24px;
  border-radius: 12px;
  background: #111827;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.24);
}

.field {
  margin-bottom: 16px;
}

label {
  color: #d1d5db;
  font-size: 14px;
}

.input {
  width: 100%;
  min-height: 43px;
  margin-top: 6px;
  padding: 10px;
  border: 1px solid #1f2937;
  border-radius: 8px;
  background: #0b1220;
  color: #ffffff;
  font: inherit;
}

.input::placeholder {
  color: #6b7280;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d1d5db;
  cursor: pointer;
}

.checkbox-option input {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
}

.link-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #93c5fd;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.link-button:hover {
  color: #bfdbfe;
}

.field-status {
  margin: 0 0 14px;
  color: #93c5fd;
  font-size: 13px;
}

.field-status.error {
  color: #fca5a5;
}

button {
  border: 0;
  color: #ffffff;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  width: 100%;
  min-height: 43px;
  padding: 10px 18px;
  border-radius: 8px;
  background: #2563eb;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.divisor {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0;
  color: #6b7280;
  font-size: 13px;
}

.divisor::before,
.divisor::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #1f2937;
}

.btn-secondary {
  width: 100%;
  min-height: 43px;
  padding: 10px 18px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid #374151;
  color: #ffffff;
}

.btn-secondary:hover {
  background: #1f2937;
  border-color: #60a5fa;
}

.system-tip {
  width: 100%;
  max-width: 432px;
  margin-top: 24px;
  padding: 16px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  background: #0f1b2e;
  color: #93c5fd;
  font-size: 14px;
}

.system-tip strong {
  font-weight: 700;
}

.app-footer {
  margin-top: auto;
  padding: 24px 16px;
  border-top: 1px solid #1f2937;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}

.app-footer p {
  margin: 0;
}

.app-footer nav {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 8px;
}

.app-footer a {
  color: inherit;
  text-decoration: none;
}

.app-footer a:hover {
  color: #93c5fd;
}

@media (max-width: 640px) {
  .app-header {
    padding: 14px 18px;
  }

  .brand {
    align-items: flex-start;
    flex-direction: column;
    gap: 0;
  }

  .content {
    padding-top: 18px;
  }

  .login-card {
    padding: 18px;
  }

  .login-options {
    align-items: flex-start;
    flex-direction: column;
  }

  .app-footer nav {
    flex-wrap: wrap;
    gap: 12px 18px;
  }
}
</style>
