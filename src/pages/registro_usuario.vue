<template>
  <div class="page-shell">
    <header class="app-header">
      <div class="brand">
        <span class="brand-name">EPIra</span>
        <span class="brand-divider">| Gestão SENAI</span>
      </div>
    </header>

    <main class="content">
      <h1>Criar <span>Conta</span></h1>

      <p class="intro">
        Cadastre-se para gerenciar EPIs, validade de CA e estoque.
      </p>

      <section class="login-card" aria-label="Cadastro de usuário">
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
            placeholder="Mínimo 6 caracteres"
            class="input"
            autocomplete="new-password"
          />
        </div>

        <div class="field">
          <label for="senha2">Confirmar senha</label>
          <input
            id="senha2"
            v-model="form.senha2"
            type="password"
            placeholder="Repita a senha"
            class="input"
            autocomplete="new-password"
            @keyup.enter="registrar"
          />
        </div>

        <p v-if="mensagem" class="field-status" :class="{ error: temErro }">
          {{ mensagem }}
        </p>

        <button class="btn-primary" type="button" @click="registrar" :disabled="carregando">
          {{ carregando ? 'Criando...' : 'Criar conta' }}
        </button>

        <p class="alt-link">
          Já tem conta?
          <button class="link-button" type="button" @click="$router.push('/login')">Entrar</button>
        </p>
      </section>
    </main>

    <footer class="app-footer">
      <p>© 2024 EPIra Management System. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const form = reactive({
  email: '',
  senha: '',
  senha2: '',
})

const mensagem = ref('')
const temErro = ref(false)
const carregando = ref(false)

async function registrar() {
  if (!form.email || !form.senha) {
    temErro.value = true
    mensagem.value = 'Informe e-mail e senha.'
    return
  }
  if (form.senha.length < 6) {
    temErro.value = true
    mensagem.value = 'A senha deve ter no mínimo 6 caracteres.'
    return
  }
  if (form.senha !== form.senha2) {
    temErro.value = true
    mensagem.value = 'As senhas não coincidem.'
    return
  }

  carregando.value = true
  temErro.value = false
  mensagem.value = ''

  const { data, error } = await supabase.auth.signUp({
    email: form.email,
    password: form.senha,
  })

  carregando.value = false

  if (error) {
    temErro.value = true
    mensagem.value = 'Falha no cadastro: ' + error.message
    return
  }

  temErro.value = false

  // Se a confirmação de e-mail estiver ativa, não há sessão imediata.
  if (data.session) {
    mensagem.value = 'Conta criada! Redirecionando...'
    router.push('/cadastro')
  } else {
    mensagem.value = 'Conta criada! Verifique seu e-mail para confirmar o acesso.'
  }
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
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.brand-name {
  color: #60a5fa;
  font-weight: 700;
}

.brand-divider {
  color: #9ca3af;
  font-size: 14px;
}

.content {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 56px 16px 40px;
}

h1 {
  margin-bottom: 8px;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  text-align: center;
}

h1 span {
  color: #60a5fa;
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

.alt-link {
  margin: 16px 0 0;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
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

.app-footer {
  margin-top: auto;
  padding: 24px 16px;
  border-top: 1px solid #1f2937;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}
</style>
