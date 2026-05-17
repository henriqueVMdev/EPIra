<template>
  <div class="min-h-screen bg-[#0B1220] text-white flex flex-col">

    <!-- HEADER -->
    <header class="flex justify-between items-center px-8 py-4 border-b border-gray-800">
      <div class="flex items-center gap-2 text-lg font-semibold">
        <span class="text-blue-400">EPIra</span>
        <span class="text-gray-400 text-sm">| Gestão SENAI</span>
      </div>

      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
          JD
        </div>
      </div>
    </header>

    <!-- CONTEÚDO -->
    <main class="flex flex-col items-center py-10 px-4">

      <h1 class="text-3xl font-bold mb-2">
        Cadastrar Novo <span class="text-blue-400">EPI</span>
      </h1>

      <p class="text-gray-400 mb-8 text-center max-w-xl">
        Simplifique a gestão de segurança. Insira os dados técnicos do equipamento para controle automático de estoque e validade.
      </p>

      <!-- CARD FORM -->
      <div class="bg-[#111827] p-6 rounded-xl w-full max-w-2xl shadow-lg">

        <!-- Nome -->
        <div class="mb-4">
          <label class="text-sm text-gray-300">Nome do EPI</label>
          <input v-model="form.nome"
            type="text"
            placeholder="Ex: Capacete de Segurança MSA V-Gard"
            class="input" />
        </div>

        <!-- Categoria + CA -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="text-sm text-gray-300">Categoria</label>
            <select v-model="form.categoria" class="input">
              <option value="">Selecione uma categoria</option>
              <option>Capacete</option>
              <option>Luva</option>
              <option>Óculos</option>
              <option>Botina</option>
            </select>
          </div>

          <div>
            <label class="text-sm text-gray-300">Número do CA</label>
            <input v-model="form.ca"
              type="text"
              placeholder="Ex: 12345"
              class="input" />
          </div>
        </div>

        <!-- Data + Estoque -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="text-sm text-gray-300">Data de Validade (CA)</label>
            <input v-model="form.validade"
              type="date"
              class="input" />
          </div>

          <div>
            <label class="text-sm text-gray-300">Quantidade em Estoque</label>
            <input v-model="form.quantidade"
              type="number"
              min="0"
              class="input" />
          </div>
        </div>

        <!-- Observações -->
        <div class="mb-6">
          <label class="text-sm text-gray-300">Observações Técnicas</label>
          <textarea v-model="form.obs"
            placeholder="Informações adicionais sobre o modelo ou restrições de uso..."
            class="input h-24 resize-none"></textarea>
        </div>

        <!-- MENSAGEM -->
        <p v-if="mensagem" :class="erro ? 'text-red-400' : 'text-green-400'" class="text-sm mb-3">
          {{ mensagem }}
        </p>

        <!-- BOTÕES -->
        <div class="flex justify-end gap-3">
          <button class="btn-secondary" @click="limpar" :disabled="salvando">
            Cancelar
          </button>

          <button class="btn-primary" @click="cadastrar" :disabled="salvando">
            {{ salvando ? 'Salvando...' : 'Cadastrar EPI' }}
          </button>
        </div>

      </div>

      <!-- DICA -->
      <div class="mt-6 bg-[#0F1B2E] border border-blue-500/30 p-4 rounded-lg max-w-2xl w-full text-sm text-blue-300">
        <strong>Dica do Sistema:</strong><br>
        Ao cadastrar o número do CA, o sistema buscará automaticamente as informações de conformidade nas bases de dados oficiais.
      </div>

    </main>

    <!-- FOOTER -->
    <footer class="mt-auto border-t border-gray-800 text-center text-gray-500 text-sm py-6">
      © 2024 EPIra Management System. Todos os direitos reservados.<br>
      <div class="mt-2 flex justify-center gap-6">
        <a href="#">Suporte</a>
        <a href="#">Documentação</a>
        <a href="#">Privacidade</a>
      </div>
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
  categoria: '',
  ca: '',
  validade: '',
  quantidade: 0,
  obs: ''
})

const salvando = ref(false)
const mensagem = ref('')
const erro = ref(false)

function limpar() {
  form.nome = ''
  form.categoria = ''
  form.ca = ''
  form.validade = ''
  form.quantidade = 0
  form.obs = ''
  mensagem.value = ''
}

async function cadastrar() {
  if (!form.nome) {
    erro.value = true
    mensagem.value = 'Informe o nome do EPI.'
    return
  }

  salvando.value = true
  mensagem.value = ''

  const { error } = await supabase.from('epis').insert({
    nome: form.nome,
    categoria: form.categoria || null,
    ca: form.ca || null,
    validade: form.validade || null,
    quantidade: Number(form.quantidade) || 0,
    obs: form.obs || null
  })

  salvando.value = false

  if (error) {
    erro.value = true
    mensagem.value = 'Erro ao cadastrar: ' + error.message
    console.error(error)
    return
  }

  erro.value = false
  limpar()
  router.push('/epis')
}
</script>

<style scoped>
.input {
  width: 100%;
  margin-top: 6px;
  padding: 10px;
  border-radius: 8px;
  background: #0B1220;
  border: 1px solid #1F2937;
  color: white;
}

.input:focus {
  outline: none;
  border-color: #3B82F6;
}

.btn-primary {
  background: #2563EB;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 500;
}

.btn-primary:hover {
  background: #1D4ED8;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #374151;
  padding: 10px 18px;
  border-radius: 8px;
}

.btn-secondary:hover {
  background: #1F2937;
}
</style>
