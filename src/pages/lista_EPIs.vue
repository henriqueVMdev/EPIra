<template>
  <div class="page-shell">
    <header class="app-header">
      <div class="brand">
        <span class="brand-name">EPIra</span>
        <span class="brand-divider">| Gestão SENAI</span>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="$router.push('/cadastro')">+ Novo EPI</button>
        <button class="btn-secondary" @click="sair">Sair</button>
      </div>
    </header>

    <main class="content">
      <h1>EPIs <span>Cadastrados</span></h1>

      <p v-if="mensagem" class="status" :class="{ error: erro }">{{ mensagem }}</p>

      <p v-if="carregando" class="status">Carregando...</p>

      <p v-else-if="!epis.length" class="status">Nenhum EPI cadastrado ainda.</p>

      <table v-else class="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>CA</th>
            <th>Validade</th>
            <th>Qtd.</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="epi in epis" :key="epi.id">
            <template v-if="editandoId === epi.id">
              <td><input v-model="formEdit.nome" class="input" /></td>
              <td>
                <select v-model="formEdit.categoria" class="input">
                  <option value="">—</option>
                  <option>Capacete</option>
                  <option>Luva</option>
                  <option>Óculos</option>
                  <option>Botina</option>
                </select>
              </td>
              <td><input v-model="formEdit.ca" class="input" /></td>
              <td><input v-model="formEdit.validade" type="date" class="input" /></td>
              <td><input v-model.number="formEdit.quantidade" type="number" min="0" class="input input-num" /></td>
              <td class="acoes">
                <button class="btn-mini btn-save" @click="salvarEdicao(epi.id)">Salvar</button>
                <button class="btn-mini" @click="cancelarEdicao">Cancelar</button>
              </td>
            </template>
            <template v-else>
              <td>{{ epi.nome }}</td>
              <td>{{ epi.categoria || '—' }}</td>
              <td>{{ epi.ca || '—' }}</td>
              <td>{{ formatarData(epi.validade) }}</td>
              <td>{{ epi.quantidade }}</td>
              <td class="acoes">
                <button class="btn-mini" @click="iniciarEdicao(epi)">Editar</button>
                <button class="btn-mini btn-del" @click="excluir(epi)">Excluir</button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const epis = ref([])
const carregando = ref(true)
const mensagem = ref('')
const erro = ref(false)

const editandoId = ref(null)
const formEdit = reactive({ nome: '', categoria: '', ca: '', validade: '', quantidade: 0 })

function aviso(texto, isErro = false) {
  mensagem.value = texto
  erro.value = isErro
}

function formatarData(d) {
  if (!d) return '—'
  const [ano, mes, dia] = d.split('-')
  return `${dia}/${mes}/${ano}`
}

// READ
async function carregar() {
  carregando.value = true
  const { data, error } = await supabase
    .from('epis')
    .select('*')
    .order('created_at', { ascending: false })
  carregando.value = false

  if (error) {
    aviso('Erro ao carregar: ' + error.message, true)
    return
  }
  epis.value = data
}

// UPDATE
function iniciarEdicao(epi) {
  editandoId.value = epi.id
  formEdit.nome = epi.nome
  formEdit.categoria = epi.categoria || ''
  formEdit.ca = epi.ca || ''
  formEdit.validade = epi.validade || ''
  formEdit.quantidade = epi.quantidade
}

function cancelarEdicao() {
  editandoId.value = null
}

async function salvarEdicao(id) {
  const { error } = await supabase
    .from('epis')
    .update({
      nome: formEdit.nome,
      categoria: formEdit.categoria || null,
      ca: formEdit.ca || null,
      validade: formEdit.validade || null,
      quantidade: Number(formEdit.quantidade) || 0,
    })
    .eq('id', id)

  if (error) {
    aviso('Erro ao salvar: ' + error.message, true)
    return
  }
  editandoId.value = null
  aviso('EPI atualizado com sucesso!')
  carregar()
}

// DELETE
async function excluir(epi) {
  if (!confirm(`Excluir o EPI "${epi.nome}"?`)) return

  const { error } = await supabase.from('epis').delete().eq('id', epi.id)
  if (error) {
    aviso('Erro ao excluir: ' + error.message, true)
    return
  }
  aviso('EPI excluído.')
  carregar()
}

async function sair() {
  await supabase.auth.signOut()
  router.push('/login')
}

onMounted(carregar)
</script>

<style scoped>
.page-shell {
  min-height: 100vh;
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

.header-actions {
  display: flex;
  gap: 10px;
}

.content {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 16px;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
}

h1 span {
  color: #60a5fa;
}

.status {
  margin: 12px 0;
  color: #93c5fd;
  font-size: 14px;
}

.status.error {
  color: #fca5a5;
}

.tabela {
  width: 100%;
  border-collapse: collapse;
  background: #111827;
  border-radius: 12px;
  overflow: hidden;
}

th,
td {
  padding: 12px 14px;
  text-align: left;
  font-size: 14px;
  border-bottom: 1px solid #1f2937;
}

th {
  background: #0f1b2e;
  color: #93c5fd;
  font-weight: 600;
}

.acoes {
  display: flex;
  gap: 8px;
}

.input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #1f2937;
  border-radius: 6px;
  background: #0b1220;
  color: #ffffff;
  font: inherit;
}

.input-num {
  width: 70px;
}

button {
  border: 0;
  color: #ffffff;
  font: inherit;
  cursor: pointer;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #374151;
  padding: 8px 14px;
  border-radius: 8px;
}

.btn-secondary:hover {
  background: #1f2937;
}

.btn-mini {
  padding: 6px 10px;
  border-radius: 6px;
  background: #2563eb;
  font-size: 13px;
}

.btn-mini:hover {
  background: #1d4ed8;
}

.btn-del {
  background: #b91c1c;
}

.btn-del:hover {
  background: #991b1b;
}

.btn-save {
  background: #15803d;
}

.btn-save:hover {
  background: #166534;
}
</style>
