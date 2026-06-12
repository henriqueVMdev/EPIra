<template>
  <div class="funcionario-page">

    <!-- Header -->
    <div class="page-header">
      <h1>Gestão de <span>Funcionários</span></h1>
      <p class="subtitle">Gerencie o departamento, a função e as permissões dos usuários. Novos funcionários entram pelo cadastro de conta.</p>
    </div>

    <!-- Tabela de funcionários -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-header-icon">👥</div>
        <div class="table-header-text">
          <h2>Funcionários</h2>
          <p>Todos os usuários cadastrados no sistema</p>
        </div>
        <span class="func-count">{{ funcionarios.length }} registro{{ funcionarios.length !== 1 ? 's' : '' }}</span>
      </div>

      <div v-if="loadingFuncionarios" class="table-loading">
        <span class="spinner"></span> Carregando...
      </div>

      <div v-else-if="funcionarios.length === 0" class="table-empty">
        Nenhum funcionário cadastrado ainda. Novos usuários aparecem aqui após criarem a conta.
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>E-mail</th>
              <th>Departamento</th>
              <th>Função</th>
              <th class="col-center">Permissão</th>
              <th class="col-center">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in funcionarios" :key="f.id">
              <td class="td-nome">{{ f.nome || '—' }}</td>
              <td class="td-mono">{{ f.cpf ? f.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '—' }}</td>
              <td class="td-email">{{ f.email }}</td>
              <td>
                <span v-if="f.departamento" class="badge-depto">{{ f.departamento }}</span>
                <span v-else style="opacity:.5">—</span>
              </td>
              <td class="td-cargo">{{ f.cargo || '—' }}</td>
              <td class="col-center">
                <span
                  class="badge-depto"
                  :style="f.role === 'adm' ? 'background:rgba(34,197,94,0.12);color:#4ade80;border-color:rgba(34,197,94,0.25)' : ''"
                >
                  {{ f.role === 'adm' ? 'Administrador' : 'Funcionário' }}
                </span>
              </td>
              <td class="col-center">
                <span class="badge-status" :class="f.ativo ? 'status-ativo' : 'status-inativo'">
                  {{ f.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="td-actions">
                <button class="btn-edit" @click="editRecord(f)"><i class="fas fa-pencil-alt"></i> Editar</button>
                <button
                  v-if="f.id !== profile?.id"
                  class="btn-delete"
                  @click="confirmDelete(f)"
                ><i class="fas fa-trash-alt"></i> Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Erro global -->
    <div v-if="apiError && !showEditModal && !showDeleteModal" class="api-error">
      <i class="fas fa-exclamation-triangle"></i> {{ apiError }}
    </div>

    <!-- Modal de confirmação de exclusão -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="success-overlay" @click="cancelDelete">
        <div class="delete-modal" @click.stop>
          <div class="delete-modal-icon"><i class="fas fa-trash-alt"></i></div>
          <h3>Excluir Funcionário</h3>
          <p>
            Tem certeza que deseja excluir o cadastro de
            <strong>{{ deletingItem?.nome || deletingItem?.email }}</strong>?
            A conta de acesso será removida e as solicitações pendentes serão
            apagadas. O histórico de entregas é mantido. Esta ação não pode ser desfeita.
          </p>
          <div v-if="apiError" class="api-error" style="margin-bottom:16px;text-align:left">
            <i class="fas fa-exclamation-triangle"></i> {{ apiError }}
          </div>
          <div class="delete-modal-actions">
            <button class="btn btn-ghost" @click="cancelDelete">Cancelar</button>
            <button class="btn btn-danger" @click="executeDelete" :disabled="deleting">
              <span v-if="deleting" class="spinner"></span>
              <i v-else class="fas fa-trash-alt"></i>
              {{ deleting ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de Edição -->
    <Transition name="fade">
      <div v-if="showEditModal" class="success-overlay" @click="closeEditModal">
        <div class="edit-modal" @click.stop>
          <div class="edit-modal-header">
            <div class="card-header-icon" style="font-size:16px">✏️</div>
            <div class="edit-modal-title">
              <h3>Editar Funcionário</h3>
              <p>Defina departamento, função e permissões</p>
            </div>
            <button class="modal-close-btn" @click="closeEditModal">✕</button>
          </div>

          <div class="edit-modal-body">
            <div class="field" :class="{ invalid: errors.nome }">
              <label>Nome Completo <span class="required">*</span></label>
              <input type="text" v-model="form.nome" @input="errors.nome = ''" />
              <span class="field-error">{{ errors.nome }}</span>
            </div>

            <div class="field-grid field-grid-2" style="margin-top:14px">
              <div class="field">
                <label>E-mail (login)</label>
                <input type="text" :value="form.email" disabled />
              </div>
              <div class="field" :class="{ invalid: errors.cpf }">
                <label>CPF</label>
                <input type="text" v-model="form.cpf" maxlength="14" @input="onCpfInput" />
                <span class="field-error">{{ errors.cpf }}</span>
              </div>
            </div>

            <div class="field-grid field-grid-2" style="margin-top:14px">
              <div class="field">
                <label>Departamento</label>
                <div class="select-wrap">
                  <select v-model="form.departamento">
                    <option value="">Selecionar departamento...</option>
                    <option>Produção</option>
                    <option>Manutenção</option>
                    <option>Logística</option>
                    <option>Almoxarifado</option>
                    <option>Segurança do Trabalho</option>
                    <option>Recursos Humanos</option>
                    <option>Administrativo</option>
                    <option>Financeiro</option>
                    <option>Tecnologia da Informação</option>
                    <option>Qualidade</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label>Função</label>
                <input type="text" v-model="form.cargo" placeholder="Ex: Operador de Máquinas" />
              </div>
            </div>

            <div class="field-grid field-grid-2" style="margin-top:14px">
              <div class="field">
                <label>Permissão</label>
                <div class="select-wrap">
                  <select v-model="form.role">
                    <option value="funcionario">Funcionário</option>
                    <option value="adm">Administrador</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label>Status</label>
                <div class="select-wrap">
                  <select v-model="form.ativo">
                    <option :value="true">Ativo</option>
                    <option :value="false">Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            <div v-if="apiError" class="api-error" style="margin-top:12px">
              <i class="fas fa-exclamation-triangle"></i> {{ apiError }}
            </div>
          </div>

          <div class="edit-modal-footer">
            <button class="btn btn-ghost" @click="closeEditModal">Cancelar</button>
            <button class="btn btn-primary" @click="submitForm" :disabled="submitting">
              <span v-if="submitting" class="spinner"></span>
              <i v-else class="fas fa-save"></i>
              {{ submitting ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const { supabase, profile } = useSupabase()

// ─── Estado ────────────────────────────────────────────────────────────────

const submitting          = ref(false)
const showEditModal       = ref(false)
const showDeleteModal     = ref(false)
const deletingItem        = ref(null)
const deleting            = ref(false)
const apiError            = ref('')
const funcionarios        = ref([])
const loadingFuncionarios = ref(false)
const editingId           = ref(null)

// Pessoas = usuários do sistema (profiles). Os dados pessoais (nome, cpf, e-mail)
// vêm do cadastro de conta; o admin gerencia departamento, função e permissão.
async function fetchFuncionarios() {
  loadingFuncionarios.value = true
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, email, cpf, departamento, cargo, role, ativo')
    .order('nome', { ascending: true })
  if (error) {
    apiError.value = 'Erro ao carregar funcionários: ' + error.message
  } else {
    funcionarios.value = data ?? []
  }
  loadingFuncionarios.value = false
}

onMounted(fetchFuncionarios)

const initialForm = () => ({
  nome:         '',
  cpf:          '',
  email:        '',
  departamento: '',
  cargo:        '',
  role:         'funcionario',
  ativo:        true,
})

const form   = reactive(initialForm())
const errors = reactive({ nome: '', cpf: '' })

// ─── Máscara e validação CPF ───────────────────────────────────────────────

function onCpfInput(e) {
  errors.cpf = ''
  let v = e.target.value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 9)      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2')
  form.cpf = v
}

function cpfValido(cpf) {
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false
  let s = 0
  for (let i = 0; i < 9; i++) s += +c[i] * (10 - i)
  let r = (s * 10) % 11; if (r === 10 || r === 11) r = 0
  if (r !== +c[9]) return false
  s = 0
  for (let i = 0; i < 10; i++) s += +c[i] * (11 - i)
  r = (s * 10) % 11; if (r === 10 || r === 11) r = 0
  return r === +c[10]
}

// ─── Validação ─────────────────────────────────────────────────────────────

function validate() {
  let ok = true
  if (!form.nome.trim()) {
    errors.nome = 'Informe o nome completo.'; ok = false
  }
  if (form.cpf.trim() && !cpfValido(form.cpf)) {
    errors.cpf = 'CPF inválido.'; ok = false
  }
  return ok
}

// ─── Submit (apenas edição) ──────────────────────────────────────────────────

async function submitForm() {
  apiError.value = ''
  if (!editingId.value) return
  if (!validate()) return

  submitting.value = true
  try {
    const payload = {
      nome:         form.nome.trim(),
      cpf:          form.cpf.replace(/\D/g, '') || null,
      departamento: form.departamento || null,
      cargo:        form.cargo.trim() || null,
      role:         form.role,
      ativo:        form.ativo,
    }

    const { error } = await supabase.from('profiles').update(payload).eq('id', editingId.value)
    if (error) throw error

    showEditModal.value = false
    resetForm()
    await fetchFuncionarios()
  } catch (e) {
    if (e.code === '23505') {
      errors.cpf = 'CPF já cadastrado.'
    } else {
      apiError.value = 'Erro ao salvar: ' + e.message
    }
  } finally {
    submitting.value = false
  }
}

function editRecord(f) {
  const cpfFormatado = f.cpf
    ? f.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : ''
  Object.assign(form, {
    nome:         f.nome || '',
    cpf:          cpfFormatado,
    email:        f.email || '',
    departamento: f.departamento || '',
    cargo:        f.cargo || '',
    role:         f.role || 'funcionario',
    ativo:        f.ativo,
  })
  errors.nome = ''
  errors.cpf  = ''
  editingId.value     = f.id
  apiError.value      = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  resetForm()
}

function resetForm() {
  Object.assign(form, initialForm())
  errors.nome = ''
  errors.cpf  = ''
  apiError.value  = ''
  editingId.value = null
}

// ─── Exclusão ──────────────────────────────────────────────────────────────

function confirmDelete(f) {
  deletingItem.value    = f
  apiError.value        = ''
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  deletingItem.value    = null
  apiError.value        = ''
}

// A exclusão é feita pela função excluir_funcionario no banco (SECURITY
// DEFINER): valida que quem chama é adm, desvincula o histórico de
// movimentações, apaga as solicitações e remove o perfil + conta de acesso.
async function executeDelete() {
  if (!deletingItem.value) return
  deleting.value = true
  apiError.value = ''
  try {
    const { error } = await supabase.rpc('excluir_funcionario', { p_id: deletingItem.value.id })
    if (error) throw error
    showDeleteModal.value = false
    deletingItem.value    = null
    await fetchFuncionarios()
  } catch (e) {
    apiError.value = 'Erro ao excluir: ' + e.message
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
/* ── Variáveis ──────────────────────────────────────────────────────────── */
.funcionario-page {
  --blue:       #1E3A8A;
  --blue-mid:   #3B82F6;
  --blue-light: rgba(30,58,138,0.35);
  --ink:        #F8FAFC;
  --ink-mid:    #CBD5E1;
  --ink-soft:   #94A3B8;
  --surface:    #0A0A0A;
  --surface-2:  #111827;
  --surface-3:  rgba(30,58,138,0.13);
  --card-bg:    #161B27;
  --border:     #1E293B;
  --green:      #22C55E;
  --green-bg:   rgba(20,83,45,0.35);
  --red:        #EF4444;

  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  color: var(--ink);
  padding: 32px 24px 60px;
  min-height: 100vh;
  background: var(--surface);
  position: relative;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.page-header {
  margin-bottom: 28px;
  margin-left: 0;
  margin-right: auto;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--blue);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 5px 11px;
  border-radius: 2px;
  margin-bottom: 14px;
}

h1 {
  font-size: clamp(22px, 3vw, 32px);
  font-weight: 800;
  color: var(--ink);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
}

h1 span { color: var(--blue-mid); }

.subtitle {
  font-size: 14px;
  color: var(--ink-soft);
  font-weight: 300;
  line-height: 1.5;
}

/* ── Card ───────────────────────────────────────────────────────────────── */
.card {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 32px rgba(0,0,0,0.3);
  position: relative;
  z-index: 1;
  width: 100%;
  animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both;
}

.card-header {
  background: #0F172A;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-header-icon {
  width: 38px;
  height: 38px;
  background: var(--blue);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.card-header-text { flex: 1; }

.card-header-text h2 {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  margin: 0;
}

.card-header-text p {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  margin-top: 2px;
}

.doc-number {
  font-size: 12px;
  font-weight: 600;
  color: #93C5FD;
  letter-spacing: 0.08em;
  background: rgba(30,58,138,0.4);
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.card-body { padding: 24px; }

/* ── Section ─────────────────────────────────────────────────────────────── */
.section { margin-bottom: 24px; }

.section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-soft);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label::before {
  content: '';
  display: block;
  width: 3px;
  height: 13px;
  background: var(--blue-mid);
  border-radius: 2px;
}

/* ── Fields ─────────────────────────────────────────────────────────────── */
.field-grid { display: grid; gap: 16px; }
.field-grid-2 { grid-template-columns: 1fr 1fr; }

@media (max-width: 560px) {
  .field-grid-2 { grid-template-columns: 1fr; }
}

.field { display: flex; flex-direction: column; gap: 5px; }

label {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-mid);
}

.required { color: var(--blue-mid); margin-left: 2px; }

input[type="text"] {
  width: 100%;
  height: 42px;
  padding: 0 13px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
  background: var(--surface-2);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

input[type="text"]::placeholder { color: var(--ink-soft); font-size: 13px; }

input[type="text"]:focus {
  border-color: var(--blue-mid);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}

input[type="text"]:disabled { opacity: 0.6; cursor: not-allowed; }

/* Input com ícone */
.input-icon-wrap { position: relative; }

.input-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-soft);
  font-size: 13px;
  pointer-events: none;
}

input.with-icon { padding-left: 36px; }

/* Select */
.select-wrap { position: relative; }

.select-wrap::after {
  content: '▾';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-soft);
  font-size: 12px;
  pointer-events: none;
}

select {
  width: 100%;
  height: 42px;
  padding: 0 32px 0 13px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
  background: var(--surface-2);
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  box-sizing: border-box;
}

select option { background: #1e293b; color: var(--ink); }

select:focus {
  border-color: var(--blue-mid);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}

/* Validation */
.field-error { font-size: 11px; color: var(--red); display: none; }

.invalid input,
.invalid select {
  border-color: var(--red) !important;
  box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important;
}

.invalid .field-error { display: block; }

/* ── Footer ─────────────────────────────────────────────────────────────── */
.card-footer {
  background: var(--surface-2);
  border-top: 1px solid var(--border);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.footer-info {
  font-size: 11px;
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  gap: 5px;
}

.footer-info::before { content: '🔒'; font-size: 12px; }

.btn-group { display: flex; gap: 10px; }

.btn {
  height: 42px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
}

.btn-ghost {
  background: transparent;
  color: var(--ink-soft);
  border: 1.5px solid var(--border);
}

.btn-ghost:hover { border-color: var(--ink-soft); color: var(--ink); }

.btn-primary {
  background: var(--blue);
  color: white;
  box-shadow: 0 4px 12px rgba(30,58,138,0.4);
}

.btn-primary:hover:not(:disabled) {
  background: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(30,58,138,0.5);
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Spinner ─────────────────────────────────────────────────────────────── */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* ── API Error ───────────────────────────────────────────────────────────── */
.api-error {
  margin-top: 14px;
  padding: 12px 16px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 8px;
  font-size: 13px;
  color: #FCA5A5;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Modal Sucesso ───────────────────────────────────────────────────────── */
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.success-card {
  background: #161B27;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 36px 40px;
  text-align: center;
  max-width: 380px;
  width: 90%;
  animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1);
}

.success-icon {
  width: 56px;
  height: 56px;
  background: var(--green-bg);
  border: 2px solid var(--green);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 22px;
  color: var(--green);
  margin: 0 auto 18px;
}

.success-card h3 {
  font-size: 20px;
  font-weight: 800;
  color: var(--ink);
  margin: 0 0 8px;
}

.success-card p {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.6;
  margin-bottom: 20px;
}

.success-info {
  background: #0F172A;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.success-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.success-info-label { color: var(--ink-soft); }
.success-info-value { color: #93C5FD; font-weight: 600; }

/* ── Modal de Edição ─────────────────────────────────────────────────────── */
.edit-modal {
  background: #161B27;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  width: 90%;
  max-width: 540px;
  animation: popIn 0.35s cubic-bezier(0.16,1,0.3,1);
  overflow: hidden;
}

.edit-modal-header {
  background: #0F172A;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border);
}

.edit-modal-title { flex: 1; }
.edit-modal-title h3 { font-size: 15px; font-weight: 700; color: #fff; margin: 0; }
.edit-modal-title p  { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }

.modal-close-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--ink-soft);
  font-size: 13px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.15s;
  flex-shrink: 0;
}
.modal-close-btn:hover { background: rgba(239,68,68,0.1); border-color: var(--red); color: var(--red); }

.edit-modal-body { padding: 20px; }

.edit-modal-footer {
  background: var(--surface-2);
  border-top: 1px solid var(--border);
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ── Transitions & Animations ───────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Tabela de Funcionários ──────────────────────────────────────────────── */
.table-card {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 32px rgba(0,0,0,0.3);
  margin-top: 28px;
  animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s both;
}

.table-header {
  background: #0F172A;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.table-header-icon {
  width: 38px;
  height: 38px;
  background: var(--blue);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex-shrink: 0;
}

.table-header-text { flex: 1; }

.table-header-text h2 {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  margin: 0;
}

.table-header-text p {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  margin-top: 2px;
}

.func-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--blue-mid);
  background: rgba(59,130,246,0.12);
  border: 1px solid rgba(59,130,246,0.25);
  border-radius: 20px;
  padding: 3px 10px;
}

.table-loading,
.table-empty {
  padding: 40px 24px;
  text-align: center;
  color: var(--ink-soft);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.table-wrap { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

thead th {
  background: rgba(15,23,42,0.6);
  color: var(--ink-soft);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 11px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

tbody tr {
  border-bottom: 1px solid rgba(30,41,59,0.6);
  transition: background 0.15s;
}

tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: rgba(30,58,138,0.07); }

td {
  padding: 12px 16px;
  color: var(--ink);
  vertical-align: middle;
}

.col-center { text-align: center; }
.td-nome    { font-weight: 600; }
.td-mono    { font-family: 'Courier New', monospace; font-size: 12px; color: var(--ink-mid); }
.td-cargo   { color: var(--ink-mid); }
.td-email   { color: var(--ink-soft); font-size: 12px; }

.badge-depto {
  display: inline-block;
  padding: 2px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(59,130,246,0.12);
  color: var(--blue-mid);
  border: 1px solid rgba(59,130,246,0.2);
  white-space: nowrap;
}

.badge-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-ativo   { background: rgba(34,197,94,0.12);  color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
.status-inativo { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--ink-soft);
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-edit:hover {
  border-color: var(--blue-mid);
  color: var(--blue-mid);
  background: rgba(59,130,246,0.08);
}

.td-actions { display: flex; gap: 6px; align-items: center; }

.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--ink-soft);
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-delete:hover {
  border-color: var(--red);
  color: var(--red);
  background: rgba(239,68,68,0.08);
}

/* ── Modal de exclusão ───────────────────────────────────────────────────── */
.delete-modal {
  background: #161B27;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 36px 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: popIn 0.35s cubic-bezier(0.16,1,0.3,1);
}

.delete-modal-icon {
  width: 56px;
  height: 56px;
  background: rgba(239,68,68,0.15);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 22px;
  color: var(--red);
  margin: 0 auto 18px;
}

.delete-modal h3 {
  font-size: 18px;
  font-weight: 800;
  color: var(--ink);
  margin: 0 0 10px;
}

.delete-modal p {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.6;
  margin-bottom: 24px;
}

.delete-modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-danger {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  background: var(--red);
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: inherit;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(239,68,68,0.35);
}
.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
