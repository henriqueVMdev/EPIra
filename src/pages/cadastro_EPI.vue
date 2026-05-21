<template>
  <div class="epi-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Cadastrar Novo <span>EPI</span></h1>
      <p class="subtitle">Insira os dados técnicos do equipamento para controle automático de estoque e validade.</p>
    </div>

    <!-- Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-icon">🦺</div>
        <div class="card-header-text">
          <h2>Ficha de Cadastro de EPI</h2>
          <p>Todos os campos marcados com * são obrigatórios</p>
        </div>
      </div>

      <div class="card-body">
        <form @submit.prevent="cadastrar" novalidate>

          <!-- Seção: Identificação -->
          <div class="section">
            <div class="section-label">Identificação do EPI</div>
            <div class="field-grid">

              <div class="field" :class="{ invalid: errors.nome }">
                <label for="nome">Nome do EPI <span class="required">*</span></label>
                <input
                  id="nome"
                  type="text"
                  v-model="form.nome"
                  placeholder="Ex: Capacete de Segurança MSA V-Gard"
                  @input="errors.nome = ''"
                />
                <span class="field-error">{{ errors.nome }}</span>
              </div>

              <div class="field-grid field-grid-2">
                <div class="field" :class="{ invalid: errors.categoria }">
                  <label for="categoria">Categoria <span class="required">*</span></label>
                  <div class="select-wrap">
                    <select id="categoria" v-model="form.categoria" @change="errors.categoria = ''">
                      <option value="">Selecione uma categoria</option>
                      <option>Capacete</option>
                      <option>Luva</option>
                      <option>Óculos</option>
                      <option>Botina</option>
                      <option>Protetor Auricular</option>
                      <option>Máscara</option>
                      <option>Cinto de Segurança</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <span class="field-error">{{ errors.categoria }}</span>
                </div>

                <div class="field">
                  <label for="ca">Número do CA</label>
                  <input
                    id="ca"
                    type="text"
                    v-model="form.ca"
                    placeholder="Ex: 12345"
                  />
                  <span class="field-hint">Certificado de Aprovação do MTE</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Seção: Validade e Estoque -->
          <div class="section">
            <div class="section-label">Validade e Estoque</div>
            <div class="field-grid field-grid-2">

              <div class="field">
                <label for="validade">Data de Validade (CA)</label>
                <input
                  id="validade"
                  type="date"
                  v-model="form.validade"
                />
                <span class="field-hint">Vencimento do Certificado de Aprovação</span>
              </div>

              <div class="field" :class="{ invalid: errors.quantidade }">
                <label for="quantidade">Quantidade em Estoque <span class="required">*</span></label>
                <div class="qty-wrap">
                  <button type="button" class="qty-btn" @click="decQty">−</button>
                  <input
                    id="quantidade"
                    type="number"
                    v-model.number="form.quantidade"
                    min="0"
                    max="9999"
                    @input="errors.quantidade = ''"
                  />
                  <button type="button" class="qty-btn" @click="incQty">+</button>
                </div>
                <span class="field-hint">Unidades disponíveis</span>
                <span class="field-error">{{ errors.quantidade }}</span>
              </div>

            </div>
          </div>

          <!-- Seção: Observações -->
          <div class="section">
            <div class="section-label">Observações Técnicas</div>
            <div class="field">
              <label for="obs">Informações adicionais</label>
              <textarea
                id="obs"
                v-model="form.obs"
                placeholder="Informações adicionais sobre o modelo ou restrições de uso..."
              />
            </div>
          </div>

        </form>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <span class="footer-info">Ao cadastrar o CA, o sistema vinculará as informações de conformidade.</span>
        <div class="btn-group">
          <button class="btn btn-ghost" type="button" @click="limpar">↺ Limpar</button>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="submitting"
            @click="cadastrar"
          >
            <span v-if="submitting" class="spinner"></span>
            <span v-else>✓</span>
            {{ submitting ? 'Salvando...' : 'Cadastrar EPI' }}
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
          <h3>EPI Cadastrado!</h3>
          <p>O equipamento de proteção individual foi registrado com sucesso no sistema.</p>
          <button class="btn btn-primary" style="width:100%;justify-content:center" @click="closeSuccess">
            Novo Cadastro
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const { supabase } = useSupabase()

const submitting  = ref(false)
const showSuccess = ref(false)
const apiError    = ref('')

const initialForm = () => ({
  nome:       '',
  categoria:  '',
  ca:         '',
  validade:   '',
  quantidade: 0,
  obs:        '',
})

const form   = reactive(initialForm())
const errors = reactive({ nome: '', categoria: '', quantidade: '' })

function incQty() { if (form.quantidade < 9999) form.quantidade++ }
function decQty() { if (form.quantidade > 0)    form.quantidade-- }

function validate() {
  let ok = true
  if (!form.nome.trim()) {
    errors.nome = 'Informe o nome do EPI.'
    ok = false
  }
  if (!form.categoria) {
    errors.categoria = 'Selecione uma categoria.'
    ok = false
  }
  if (form.quantidade < 0) {
    errors.quantidade = 'Quantidade não pode ser negativa.'
    ok = false
  }
  return ok
}

async function cadastrar() {
  apiError.value = ''
  if (!validate()) return

  submitting.value = true
  try {
    const { error } = await supabase
      .from('epis')
      .insert([{
        nome:      form.nome.trim(),
        categoria: form.categoria,
        ca:        form.ca.trim() || null,
        validade:  form.validade  || null,
        quantidade: form.quantidade,
        observacoes: form.obs.trim() || null,
        ativo:     true,
      }])

    if (error) throw error
    showSuccess.value = true
  } catch (e) {
    apiError.value = 'Erro ao cadastrar EPI: ' + e.message
  } finally {
    submitting.value = false
  }
}

function limpar() {
  Object.assign(form, initialForm())
  Object.keys(errors).forEach(k => (errors[k] = ''))
  apiError.value = ''
}

function closeSuccess() {
  showSuccess.value = false
  limpar()
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
  margin-bottom: 28px;
  margin-left: 0;
  margin-right: 0;
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

.footer-info::before { content: '💡'; font-size: 12px; }

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

/* ── Transitions ─────────────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Animations ──────────────────────────────────────────────────────────── */
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
