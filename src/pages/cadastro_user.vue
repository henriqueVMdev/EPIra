<template>
  <div class="pagina-cadastro">
    <header class="cabecalho-cadastro">
      <div class="marca">
        <span class="marca-nome">EPIra</span>
        <span class="marca-divisor">| Gestão SENAI</span>
      </div>
      <router-link to="/login" class="link-voltar">← Voltar ao Login</router-link>
    </header>

    <main class="conteudo-cadastro">
      <h1 class="titulo-cadastro">
        Criar <span>Conta</span>
      </h1>

      <p class="introducao-cadastro">
        Preencha seus dados para acessar o sistema de gestão de EPIs.
      </p>

      <section class="cartao-cadastro" aria-label="Cadastro de novo usuário">
        <div class="campo">
          <label for="nome">Nome completo</label>
          <input
            id="nome"
            v-model="form.nome"
            type="text"
            placeholder="Ex: João da Silva"
            class="entrada"
            autocomplete="name"
          />
        </div>

        <div class="campo">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="usuario@senai.br"
            class="entrada"
            autocomplete="email"
          />
        </div>

        <div class="grade-dupla">
          <div class="campo">
            <label for="cpf">CPF</label>
            <input
              id="cpf"
              v-model="form.cpf"
              type="text"
              placeholder="000.000.000-00"
              class="entrada"
            />
          </div>

          <div class="campo">
            <label for="cargo">Cargo</label>
            <input
              id="cargo"
              v-model="form.cargo"
              type="text"
              placeholder="Ex: Técnico de Segurança"
              class="entrada"
            />
          </div>
        </div>

        <div class="campo">
          <label for="senha">Senha</label>
          <input
            id="senha"
            v-model="form.senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            class="entrada"
            autocomplete="new-password"
          />
        </div>

        <div class="campo">
          <label for="confirmar">Confirmar senha</label>
          <input
            id="confirmar"
            v-model="form.confirmar"
            type="password"
            placeholder="Repita a senha"
            class="entrada"
            autocomplete="new-password"
            @keyup.enter="criar"
          />
        </div>

        <p v-if="mensagem" class="status-campo" :class="{ erro: temErro }">
          {{ mensagem }}
        </p>

        <button class="botao-primario" type="button" @click="criar" :disabled="carregando">
          {{ carregando ? 'Criando...' : 'Criar Conta' }}
        </button>

        <p class="texto-login">
          Já tem uma conta?
          <router-link to="/login" class="link-login">Fazer login</router-link>
        </p>
      </section>
    </main>

    <footer class="rodape-cadastro">
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
  nome: '',
  email: '',
  cpf: '',
  cargo: '',
  senha: '',
  confirmar: '',
})

const mensagem = ref('')
const temErro = ref(false)
const carregando = ref(false)

async function criar() {
  if (!form.nome || !form.email || !form.senha || !form.confirmar) {
    temErro.value = true
    mensagem.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  if (form.senha.length < 8) {
    temErro.value = true
    mensagem.value = 'A senha deve ter ao menos 8 caracteres.'
    return
  }

  if (form.senha !== form.confirmar) {
    temErro.value = true
    mensagem.value = 'As senhas não conferem.'
    return
  }

  const cpfNumerico = parseInt(form.cpf.replace(/\D/g, ''), 10)
  if (form.cpf && Number.isNaN(cpfNumerico)) {
    temErro.value = true
    mensagem.value = 'CPF inválido.'
    return
  }

  carregando.value = true
  temErro.value = false
  mensagem.value = 'Criando conta...'

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: form.email,
    password: form.senha,
  })

  if (authError) {
    temErro.value = true
    mensagem.value = authError.message || 'Erro ao criar usuário.'
    carregando.value = false
    return
  }

  const { error: perfilError } = await supabase.from('profiles').insert({
    email: form.email,
    nome: form.nome,
    cpf: cpfNumerico || null,
    cargo: form.cargo || null,
  })

  if (perfilError) {
    temErro.value = true
    mensagem.value = perfilError.message || 'Erro ao salvar perfil.'
    carregando.value = false
    return
  }

  mensagem.value = 'Conta criada com sucesso! Redirecionando...'
  carregando.value = false

  setTimeout(() => {
    router.push('/login')
  }, 1200)
}
</script>

<style scoped>
.pagina-cadastro {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0b1220;
  color: #ffffff;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.cabecalho-cadastro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 32px;
  border-bottom: 1px solid #1f2937;
}

.marca {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.marca-nome {
  color: #60a5fa;
  font-weight: 700;
}

.marca-divisor {
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

.conteudo-cadastro {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 48px 16px 40px;
}

.titulo-cadastro {
  margin: 0 0 8px;
  color: #ffffff;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  text-align: center;
}

.titulo-cadastro span {
  color: #60a5fa;
}

.introducao-cadastro {
  max-width: 520px;
  margin: 0 0 28px;
  color: #9ca3af;
  text-align: center;
}

.cartao-cadastro {
  width: 100%;
  max-width: 480px;
  padding: 28px;
  border-radius: 12px;
  background: #111827;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.24);
}

.campo {
  margin-bottom: 14px;
}

.grade-dupla {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

label {
  color: #d1d5db;
  font-size: 14px;
}

.entrada {
  width: 100%;
  min-height: 43px;
  margin-top: 6px;
  padding: 10px;
  border: 1px solid #1f2937;
  border-radius: 8px;
  background: #0b1220;
  color: #ffffff;
  font: inherit;
  box-sizing: border-box;
}

.entrada::placeholder {
  color: #6b7280;
}

.entrada:focus {
  outline: none;
  border-color: #3b82f6;
}

.opcao-termos {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 8px 0 18px;
  color: #d1d5db;
  font-size: 13px;
  cursor: pointer;
  line-height: 1.5;
}

.opcao-termos input {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: #2563eb;
}

.opcao-termos a {
  color: #93c5fd;
  text-decoration: none;
}

.opcao-termos a:hover {
  color: #bfdbfe;
}

.status-campo {
  margin: 0 0 14px;
  color: #93c5fd;
  font-size: 13px;
}

.status-campo.erro {
  color: #fca5a5;
}

button {
  border: 0;
  color: #ffffff;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.botao-primario {
  width: 100%;
  min-height: 43px;
  padding: 10px 18px;
  border-radius: 8px;
  background: #2563eb;
}

.botao-primario:hover {
  background: #1d4ed8;
}

.texto-login {
  margin: 18px 0 0;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.link-login {
  color: #93c5fd;
  text-decoration: none;
  font-weight: 500;
}

.link-login:hover {
  color: #bfdbfe;
}

.rodape-cadastro {
  margin-top: auto;
  padding: 24px 16px;
  border-top: 1px solid #1f2937;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}

.rodape-cadastro p {
  margin: 0;
}

@media (max-width: 640px) {
  .cabecalho-cadastro {
    padding: 14px 18px;
  }

  .grade-dupla {
    grid-template-columns: 1fr;
  }

  .cartao-cadastro {
    padding: 20px;
  }
}
</style>
