<template>
  <div class="funcionario-page">

    <!-- Header -->
    <div class="page-header">
      <h1>Cadastro de <span>Funcionários</span></h1>
      <p class="subtitle">Preencha os dados abaixo para registrar um novo funcionário no sistema.</p>
    </div>

    <!-- Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-icon">👷</div>
        <div class="card-header-text">
          <h2>Ficha de Cadastro de Funcionários</h2>
          <p>Todos os campos marcados com * são obrigatórios</p>
        </div>
        <div class="doc-number">Nº {{ docNumber }}</div>
      </div>

      <div class="card-body">
        <form @submit.prevent="submitForm" novalidate>

          <!-- Dados Pessoais -->
          <div class="section">
            <div class="section-label">Dados Pessoais</div>
            <div class="field-grid">

              <div class="field" :class="{ invalid: errors.nome }">
                <label for="nome">Nome Completo <span class="required">*</span></label>
                <input
                  id="nome"
                  type="text"
                  v-model="form.nome"
                  placeholder="Ex: João da Silva Santos"
                  @input="errors.nome = ''"
                />
                <span class="field-error">{{ errors.nome }}</span>
              </div>

              <div class="field-grid field-grid-2">
                <div class="field" :class="{ invalid: errors.matricula }">
                  <label for="matricula">Nº Matrícula <span class="required">*</span></label>
                  <input
                    id="matricula"
                    type="text"
                    v-model="form.matricula"
                    placeholder="Ex: 001234"
                    @input="errors.matricula = ''"
                  />
                  <span class="field-error">{{ errors.matricula }}</span>
                </div>

                <div class="field" :class="{ invalid: errors.cpf }">
                  <label for="cpf">CPF <span class="required">*</span></label>
                  <input
                    id="cpf"
                    type="text"
                    v-model="form.cpf"
                    placeholder="000.000.000-00"
                    maxlength="14"
                    @input="onCpfInput"
                  />
                  <span class="field-error">{{ errors.cpf }}</span>
                </div>
              </div>

              <div class="field" :class="{ invalid: errors.email }">
                <label for="email">E-mail <span class="required">*</span></label>
                <div class="input-icon-wrap">
                  <i class="fas fa-envelope input-icon"></i>
                  <input
                    id="email"
                    type="text"
                    v-model="form.email"
                    placeholder="Ex: joao.silva@empresa.com.br"
                    @input="errors.email = ''"
                    class="with-icon"
                  />
                </div>
                <span class="field-error">{{ errors.email }}</span>
              </div>

            </div>
          </div>

          <!-- Dados Profissionais -->
          <div class="section">
            <div class="section-label">Dados Profissionais</div>
            <div class="field-grid">

              <div class="field-grid field-grid-2">
                <div class="field" :class="{ invalid: errors.departamento }">
                  <label for="departamento">Departamento <span class="required">*</span></label>
                  <div class="select-wrap">
                    <select
                      id="departamento"
                      v-model="form.departamento"
                      @change="errors.departamento = ''"
                    >
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
                  <span class="field-error">{{ errors.departamento }}</span>
                </div>

                <div class="field" :class="{ invalid: errors.cargo }">
                  <label for="cargo">Cargo <span class="required">*</span></label>
                  <input
                    id="cargo"
                    type="text"
                    v-model="form.cargo"
                    placeholder="Ex: Operador de Máquinas"
                    @input="errors.cargo = ''"
                  />
                  <span class="field-error">{{ errors.cargo }}</span>
                </div>
              </div>

            </div>
          </div>

        </form>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <span class="footer-info">Dados armazenados com segurança</span>
        <div class="btn-group">
          <button class="btn btn-ghost" type="button" @click="resetForm">↺ {{ editingId ? 'Cancelar' : 'Limpar' }}</button>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="submitting"
            @click="submitForm"
          >
            <span v-if="submitting" class="spinner"></span>
            <i v-else class="fas fa-save"></i>
            {{ submitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar Funcionário' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela de funcionários cadastrados -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-header-icon">👥</div>
        <div class="table-header-text">
          <h2>Funcionários Cadastrados</h2>
          <p>Lista de todos os colaboradores registrados no sistema</p>
        </div>
        <span class="func-count">{{ funcionarios.length }} registro{{ funcionarios.length !== 1 ? 's' : '' }}</span>
      </div>

      <div v-if="loadingFuncionarios" class="table-loading">
        <span class="spinner"></span> Carregando...
      </div>

      <div v-else-if="funcionarios.length === 0" class="table-empty">
        Nenhum funcionário cadastrado ainda.
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Matrícula</th>
              <th>CPF</th>
              <th>Departamento</th>
              <th>Cargo</th>
              <th>E-mail</th>
              <th class="col-center">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in funcionarios" :key="f.id">
              <td class="td-nome">{{ f.nome }}</td>
              <td class="td-mono">#{{ f.matricula }}</td>
              <td class="td-mono">{{ f.cpf ? f.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '—' }}</td>
              <td><span class="badge-depto">{{ f.departamento }}</span></td>
              <td class="td-cargo">{{ f.cargo }}</td>
              <td class="td-email">{{ f.email }}</td>
              <td class="col-center">
                <span class="badge-status" :class="f.ativo ? 'status-ativo' : 'status-inativo'">
                  {{ f.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td><button class="btn-edit" @click="editRecord(f)"><i class="fas fa-pencil-alt"></i> Editar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Erro global -->
    <div v-if="apiError" class="api-error">
      <i class="fas fa-exclamation-triangle"></i> {{ apiError }}
    </div>

    <!-- Modal sucesso -->
    <Transition name="fade">
      <div v-if="showSuccess" class="success-overlay" @click="closeSuccess">
        <div class="success-card" @click.stop>
          <div class="success-icon">
            <i class="fas fa-check"></i>
          </div>
          <h3>Funcionário Cadastrado!</h3>
          <p>O registro foi salvo com sucesso no sistema.</p>
          <div class="success-info">
            <div class="success-info-row">
              <span class="success-info-label">Nome</span>
              <span class="success-info-value">{{ lastSaved.nome }}</span>
            </div>
            <div class="success-info-row">
              <span class="success-info-label">Matrícula</span>
              <span class="success-info-value">#{{ lastSaved.matricula }}</span>
            </div>
            <div class="success-info-row">
              <span class="success-info-label">Cargo</span>
              <span class="success-info-value">{{ lastSaved.cargo }}</span>
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%;justify-content:center" @click="closeSuccess">
            <i class="fas fa-plus"></i> Novo Cadastro
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const { supabase } = useSupabase()

// ─── Estado ────────────────────────────────────────────────────────────────

const submitting          = ref(false)
const showSuccess         = ref(false)
const apiError            = ref('')
const docCounter          = ref(1)
const lastSaved           = ref({})
const funcionarios        = ref([])
const loadingFuncionarios = ref(false)
const editingId           = ref(null)

async function fetchFuncionarios() {
  loadingFuncionarios.value = true
  const { data, error } = await supabase
    .from('funcionarios')
    .select('id, nome, matricula, cpf, email, departamento, cargo, ativo')
    .order('nome', { ascending: true })
  if (error) {
    apiError.value = 'Erro ao carregar funcionários: ' + error.message
  } else {
    funcionarios.value = data ?? []
  }
  loadingFuncionarios.value = false
}

onMounted(fetchFuncionarios)

const docNumber = computed(() => String(docCounter.value).padStart(6, '0'))

const initialForm = () => ({
  nome:         '',
  matricula:    '',
  cpf:          '',
  email:        '',
  departamento: '',
  cargo:        '',
})

const form   = reactive(initialForm())
const errors = reactive({
  nome:         '',
  matricula:    '',
  cpf:          '',
  email:        '',
  departamento: '',
  cargo:        '',
})

// ─── Máscara CPF ───────────────────────────────────────────────────────────

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
  if (!form.matricula.trim()) {
    errors.matricula = 'Informe o número de matrícula.'; ok = false
  }
  if (!form.cpf.trim()) {
    errors.cpf = 'Informe o CPF.'; ok = false
  } else if (!cpfValido(form.cpf)) {
    errors.cpf = 'CPF inválido.'; ok = false
  }
  if (!form.email.trim()) {
    errors.email = 'Informe o e-mail.'; ok = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'E-mail inválido.'; ok = false
  }
  if (!form.departamento) {
    errors.departamento = 'Selecione o departamento.'; ok = false
  }
  if (!form.cargo.trim()) {
    errors.cargo = 'Informe o cargo.'; ok = false
  }

  return ok
}

// ─── Submit ────────────────────────────────────────────────────────────────

async function submitForm() {
  apiError.value = ''
  if (!validate()) return

  submitting.value = true
  try {
    const payload = {
      nome:         form.nome.trim(),
      matricula:    form.matricula.trim(),
      cpf:          form.cpf.replace(/\D/g, ''),
      email:        form.email.trim().toLowerCase(),
      departamento: form.departamento,
      cargo:        form.cargo.trim(),
      ativo:        true,
    }

    let error
    if (editingId.value) {
      ;({ error } = await supabase.from('funcionarios').update(payload).eq('id', editingId.value))
    } else {
      ;({ error } = await supabase.from('funcionarios').insert([payload]))
    }

    if (error) throw error

    lastSaved.value   = { ...form }
    showSuccess.value = true
  } catch (e) {
    if (e.code === '23505') {
      if (e.message.includes('cpf'))           errors.cpf       = 'CPF já cadastrado.'
      else if (e.message.includes('matricula')) errors.matricula = 'Matrícula já cadastrada.'
      else apiError.value = 'Registro duplicado: verifique CPF ou matrícula.'
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
    nome:         f.nome,
    matricula:    f.matricula,
    cpf:          cpfFormatado,
    email:        f.email,
    departamento: f.departamento,
    cargo:        f.cargo,
  })
  editingId.value = f.id
  apiError.value  = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ─── Reset ─────────────────────────────────────────────────────────────────

function resetForm() {
  Object.assign(form, initialForm())
  Object.keys(errors).forEach(k => (errors[k] = ''))
  apiError.value  = ''
  editingId.value = null
}

function closeSuccess() {
  showSuccess.value = false
  if (!editingId.value) docCounter.value++
  editingId.value   = null
  resetForm()
  fetchFuncionarios()
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
</style>