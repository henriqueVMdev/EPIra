<template>
  <div class="epi-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Registro de Entrega de <span>EPI</span></h1>
      <p class="subtitle">Preencha os dados abaixo para registrar a entrega do equipamento de proteção individual.</p>
    </div>

    <!-- Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-icon">🦺</div>
        <div class="card-header-text">
          <h2>Ficha de Entrega de EPI</h2>
          <p>Todos os campos marcados com * são obrigatórios</p>
        </div>
        <div class="doc-number">Nº {{ docNumber }}</div>
      </div>

      <div class="card-body">
        <form @submit.prevent="submitForm" novalidate>

          <!-- Seção: Funcionário -->
          <div class="section">
            <div class="section-label">Dados do Funcionário</div>
            <div class="field-grid">
              <div class="field" :class="{ invalid: errors.funcionario_id }">
                <label for="funcionario">Funcionário <span class="required">*</span></label>
                <div class="select-wrap">
                  <select
                    id="funcionario"
                    v-model="form.funcionario_id"
                    :disabled="loadingFuncionarios"
                    @change="errors.funcionario_id = ''"
                  >
                    <option value="">
                      {{ loadingFuncionarios ? 'Carregando...' : 'Selecionar funcionário...' }}
                    </option>
                    <option
                      v-for="f in funcionarios"
                      :key="f.id"
                      :value="f.id"
                    >
                      {{ f.matricula ? f.matricula + ' — ' : '' }}{{ f.nome }}
                    </option>
                  </select>
                </div>
                <span class="field-error">{{ errors.funcionario_id }}</span>
              </div>
            </div>
          </div>

          <!-- Seção: EPI -->
          <div class="section">
            <div class="section-label">Equipamento de Proteção Individual</div>
            <div class="field-grid">

              <div class="field" :class="{ invalid: errors.epi_id }">
                <label for="epi">Tipo de EPI <span class="required">*</span></label>
                <div class="select-wrap">
                  <select
                    id="epi"
                    v-model="form.epi_id"
                    :disabled="loadingEpis"
                    @change="errors.epi_id = ''"
                  >
                    <option value="">
                      {{ loadingEpis ? 'Carregando...' : 'Selecionar EPI...' }}
                    </option>
                    <option
                      v-for="epi in epis"
                      :key="epi.id"
                      :value="epi.id"
                    >
                      {{ epi.nome }}{{ epi.ca ? ' — CA ' + epi.ca : '' }}
                    </option>
                  </select>
                </div>
                <span class="field-error">{{ errors.epi_id }}</span>
              </div>

              <div class="field-grid field-grid-2">
                <div class="field" :class="{ invalid: errors.quantidade }">
                  <label for="quantidade">Quantidade <span class="required">*</span></label>
                  <div class="qty-wrap">
                    <button type="button" class="qty-btn" @click="decQty">−</button>
                    <input
                      id="quantidade"
                      type="number"
                      v-model.number="form.quantidade"
                      min="1"
                      max="999"
                      @input="errors.quantidade = ''"
                    />
                    <button type="button" class="qty-btn" @click="incQty">+</button>
                  </div>
                  <span class="field-hint">Unidades entregues</span>
                  <span class="field-error">{{ errors.quantidade }}</span>
                </div>

                <div class="field" :class="{ invalid: errors.data_entrega }">
                  <label for="data">Data de Entrega <span class="required">*</span></label>
                  <input
                    id="data"
                    type="date"
                    v-model="form.data_entrega"
                    @change="errors.data_entrega = ''"
                  />
                  <span class="field-hint">Data em que foi realizada a entrega</span>
                  <span class="field-error">{{ errors.data_entrega }}</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Observações -->
          <div class="section">
            <div class="section-label">Observações</div>
            <div class="field">
              <label for="obs">Observações adicionais</label>
              <textarea
                id="obs"
                v-model="form.observacoes"
                placeholder="Informe detalhes adicionais sobre a entrega, condições do EPI, etc..."
              />
            </div>
          </div>

          <!-- Assinatura Digital -->
          <div class="section">
            <div class="section-label">Confirmação de Assinatura Digital</div>

            <div
              class="signature-block"
              :class="{ checked: form.assinatura_confirmada }"
              @click="form.assinatura_confirmada = !form.assinatura_confirmada; errors.assinatura_confirmada = ''"
            >
              <div class="sig-checkbox">
                <span class="sig-checkmark">✓</span>
              </div>
              <div class="sig-text">
                <div class="sig-title">
                  {{ form.assinatura_confirmada ? '✓ Assinatura Digital Confirmada' : 'Assinatura Digital Confirmada' }}
                </div>
                <div class="sig-desc">
                  Confirmo que recebi o(s) EPI(s) listado(s) acima em perfeito estado de conservação,
                  fui orientado quanto ao seu uso correto e me comprometo a utilizá-lo(s) sempre que necessário.
                </div>
              </div>
              <div class="sig-icon">✍️</div>
            </div>

            <span v-if="errors.assinatura_confirmada" class="field-error" style="display:block;margin-top:8px">
              {{ errors.assinatura_confirmada }}
            </span>
          </div>

        </form>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <span class="footer-info">Documento vinculado ao eSocial / CIPA</span>
        <div class="btn-group">
          <button class="btn btn-ghost" type="button" @click="resetForm">↺ Limpar</button>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="submitting"
            @click="submitForm"
          >
            <span v-if="submitting" class="spinner"></span>
            <span v-else>✓</span>
            {{ submitting ? 'Salvando...' : 'Registrar Entrega' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Erro global de API -->
    <div v-if="apiError" class="api-error">
      ⚠ {{ apiError }}
    </div>

    <!-- Modal de sucesso -->
    <Transition name="fade">
      <div v-if="showSuccess" class="success-overlay" @click="closeSuccess">
        <div class="success-card" @click.stop>
          <div class="success-icon">✅</div>
          <h3>Entrega Registrada!</h3>
          <p>O registro de entrega do EPI foi salvo com sucesso e vinculado ao prontuário do funcionário.</p>
          <div class="success-protocol">Protocolo: #EPI-{{ lastProtocol }}</div>
          <button class="btn btn-primary" style="width:100%;justify-content:center" @click="closeSuccess">
            Novo Registro
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const { supabase } = useSupabase()

const funcionarios      = ref([])
const epis              = ref([])
const loadingFuncionarios = ref(false)
const loadingEpis       = ref(false)
const submitting        = ref(false)
const showSuccess       = ref(false)
const apiError          = ref('')
const docCounter        = ref(1)
const lastProtocol      = ref('')

const docNumber = computed(() => String(docCounter.value).padStart(6, '0'))

const today = new Date().toISOString().split('T')[0]

const initialForm = () => ({
  funcionario_id:        '',
  epi_id:                '',
  quantidade:            1,
  data_entrega:          today,
  observacoes:           '',
  assinatura_confirmada: false,
})

const form   = reactive(initialForm())
const errors = reactive({
  funcionario_id:        '',
  epi_id:                '',
  quantidade:            '',
  data_entrega:          '',
  assinatura_confirmada: '',
})

// ─── Computed ──────────────────────────────────────────────────────────────
import { computed } from 'vue'

// ─── Lifecycle ─────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([fetchFuncionarios(), fetchEpis(), fetchDocCounter()])
})

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function fetchFuncionarios() {
  loadingFuncionarios.value = true
  try {
    const { data, error } = await supabase
      .from('funcionarios')        // ← ajuste para o nome da sua tabela
      .select('id, nome, matricula')
      .eq('ativo', true)           // ← remova se não tiver coluna ativo
      .order('nome')

    if (error) throw error
    funcionarios.value = data ?? []
  } catch (e) {
    apiError.value = 'Erro ao carregar funcionários: ' + e.message
  } finally {
    loadingFuncionarios.value = false
  }
}

async function fetchEpis() {
  loadingEpis.value = true
  try {
    const { data, error } = await supabase
      .from('epis')               // ← ajuste para o nome da sua tabela
      .select('id, nome, ca')
      .eq('ativo', true)          // ← remova se não tiver coluna ativo
      .order('nome')

    if (error) throw error
    epis.value = data ?? []
  } catch (e) {
    apiError.value = 'Erro ao carregar EPIs: ' + e.message
  } finally {
    loadingEpis.value = false
  }
}

async function fetchDocCounter() {
  // Conta os registros existentes para gerar o número do documento
  const { count } = await supabase
    .from('entregas_epi')          // ← ajuste para o nome da sua tabela
    .select('id', { count: 'exact', head: true })
  docCounter.value = (count ?? 0) + 1
}

// ─── Quantidade ────────────────────────────────────────────────────────────

function incQty() { if (form.quantidade < 999) form.quantidade++ }
function decQty() { if (form.quantidade > 1)   form.quantidade-- }

// ─── Validação ─────────────────────────────────────────────────────────────

function validate() {
  let ok = true

  if (!form.funcionario_id) {
    errors.funcionario_id = 'Selecione um funcionário.'
    ok = false
  }
  if (!form.epi_id) {
    errors.epi_id = 'Selecione um EPI.'
    ok = false
  }
  if (!form.quantidade || form.quantidade < 1) {
    errors.quantidade = 'Informe a quantidade.'
    ok = false
  }
  if (!form.data_entrega) {
    errors.data_entrega = 'Informe a data de entrega.'
    ok = false
  }
  if (!form.assinatura_confirmada) {
    errors.assinatura_confirmada = 'É necessário confirmar a assinatura digital para registrar a entrega.'
    ok = false
  }

  return ok
}

// ─── Submit ────────────────────────────────────────────────────────────────

async function submitForm() {
  apiError.value = ''
  if (!validate()) return

  submitting.value = true
  try {
    const { data, error } = await supabase
      .from('entregas_epi')        // ← ajuste para o nome da sua tabela
      .insert([{
        funcionario_id:        form.funcionario_id,
        epi_id:                form.epi_id,
        quantidade:            form.quantidade,
        data_entrega:          form.data_entrega,
        observacoes:           form.observacoes || null,
        assinatura_confirmada: form.assinatura_confirmada,
      }])
      .select()
      .single()

    if (error) throw error

    lastProtocol.value = String(docCounter.value).padStart(6, '0')
    showSuccess.value  = true
  } catch (e) {
    apiError.value = 'Erro ao salvar registro: ' + e.message
  } finally {
    submitting.value = false
  }
}

// ─── Reset / Fechar modal ──────────────────────────────────────────────────

function resetForm() {
  Object.assign(form, initialForm())
  Object.keys(errors).forEach(k => (errors[k] = ''))
  apiError.value = ''
}

function closeSuccess() {
  showSuccess.value = false
  docCounter.value++
  resetForm()
}
</script>

<style scoped>
/* ── Variáveis ──────────────────────────────────────────────────────────── */
.epi-page {
  --blue:        #1E3A8A;
  --blue-mid:    #3B82F6;
  --blue-light:  rgba(30,58,138,0.35);
  --ink:         #F8FAFC;
  --ink-mid:     #CBD5E1;
  --ink-soft:    #94A3B8;
  --surface:     #0A0A0A;
  --surface-2:   #111827;
  --surface-3:   rgba(30,58,138,0.13);
  --card-bg:     #161B27;
  --border:      #1E293B;
  --green:       #22C55E;
  --green-bg:    rgba(20,83,45,0.35);
  --red:         #EF4444;

  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  color: var(--ink);
  padding: 32px 32px 60px;
  min-height: 100vh;
  background: var(--surface);
  position: relative;
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.page-header,
.card,
.api-error {
  margin-left: 0;
  margin-right: 0;
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
  font-size: 18px;
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

/* ── Section ────────────────────────────────────────────────────────────── */
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

@media (max-width: 500px) {
  .field-grid-2 { grid-template-columns: 1fr; }
}

.field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }

label {
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-mid);
}

.required { color: var(--blue-mid); margin-left: 2px; }

select,
input[type="number"],
input[type="date"],
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
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  box-sizing: border-box;
}

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

select { cursor: pointer; padding-right: 32px; }
select option { background: #1e293b; color: var(--ink); }

select:focus,
input:focus {
  border-color: var(--blue-mid);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}

select:disabled { opacity: 0.5; cursor: not-allowed; }

input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; appearance: none; }

.field-hint { font-size: 11px; color: var(--ink-soft); }
.field-error { font-size: 11px; color: var(--red); display: none; }

.invalid select,
.invalid input { border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important; }
.invalid .field-error { display: block; }

/* ── Quantity ────────────────────────────────────────────────────────────── */
.qty-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-2);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.qty-wrap:focus-within {
  border-color: var(--blue-mid);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}

.qty-btn {
  width: 38px;
  height: 40px;
  display: grid;
  place-items: center;
  background: none;
  border: none;
  font-size: 18px;
  color: var(--ink-soft);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.qty-btn:hover { background: var(--surface-3); color: var(--blue-mid); }

.qty-wrap input {
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 0;
  background: transparent;
  text-align: center;
  font-weight: 500;
  padding: 0;
  box-shadow: none;
}

/* ── Textarea ────────────────────────────────────────────────────────────── */
textarea {
  width: 100%;
  min-height: 76px;
  padding: 11px 13px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  color: var(--ink);
  background: var(--surface-2);
  outline: none;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
  line-height: 1.5;
  box-sizing: border-box;
}

textarea:focus {
  border-color: var(--blue-mid);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}

/* ── Signature ──────────────────────────────────────────────────────────── */
.signature-block {
  background: var(--surface-2);
  border: 1.5px solid var(--blue-light);
  border-radius: 10px;
  padding: 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  user-select: none;
}

.signature-block:hover {
  background: var(--surface-3);
  border-color: var(--blue-mid);
}

.signature-block.checked {
  background: var(--green-bg);
  border-color: var(--green);
}

.sig-checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid var(--border);
  border-radius: 6px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: background 0.2s, border-color 0.2s;
  background: var(--surface-2);
}

.signature-block.checked .sig-checkbox {
  background: var(--green);
  border-color: var(--green);
}

.sig-checkmark {
  color: white;
  font-size: 13px;
  font-weight: 700;
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.2s, transform 0.2s;
}

.signature-block.checked .sig-checkmark {
  opacity: 1;
  transform: scale(1);
}

.sig-text { flex: 1; }

.sig-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 4px;
}

.signature-block.checked .sig-title { color: var(--green); }

.sig-desc { font-size: 12px; color: var(--ink-soft); line-height: 1.5; }

.sig-icon { font-size: 26px; flex-shrink: 0; opacity: 0.7; }

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

/* ── Spinner ────────────────────────────────────────────────────────────── */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* ── API Error ──────────────────────────────────────────────────────────── */
.api-error {
  margin-top: 14px;
  padding: 12px 16px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 8px;
  font-size: 13px;
  color: #FCA5A5;
  position: relative;
  z-index: 1;
  max-width: 720px;
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
  padding: 36px 44px;
  text-align: center;
  max-width: 360px;
  width: 90%;
  animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1);
}

.success-icon {
  width: 58px;
  height: 58px;
  background: var(--green-bg);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 26px;
  margin: 0 auto 18px;
}

.success-card h3 {
  font-size: 20px;
  font-weight: 800;
  color: var(--ink);
  margin: 0 0 10px;
}

.success-card p {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.6;
  margin-bottom: 20px;
}

.success-protocol {
  background: #0F172A;
  border: 1px solid var(--blue);
  border-radius: 8px;
  padding: 11px 14px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #93C5FD;
  font-weight: 700;
  letter-spacing: 0.05em;
}

/* ── Transitions ─────────────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Animations ──────────────────────────────────────────────────────────── */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

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
</style>