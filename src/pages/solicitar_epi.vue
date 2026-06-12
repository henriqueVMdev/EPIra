<template>
  <div class="epi-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Solicitar Liberação de <span>EPI</span></h1>
      <p class="subtitle">Preencha o pedido abaixo. Um administrador irá analisar e aprovar a liberação.</p>
    </div>

    <!-- Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-icon"><i class="fas fa-hand-holding-medical"></i></div>
        <div class="card-header-text">
          <h2>Novo Pedido de EPI</h2>
          <p>Selecione o equipamento e justifique a necessidade</p>
        </div>
      </div>

      <div class="card-body">
        <form @submit.prevent="enviar" novalidate>
          <div class="section">
            <div class="section-label">Equipamento</div>
            <div class="field-grid field-grid-2">
              <div class="field" :class="{ invalid: errors.epi_id }">
                <label for="epi">EPI <span class="required">*</span></label>
                <div class="select-wrap">
                  <select id="epi" v-model="form.epi_id" :disabled="loadingEpis" @change="errors.epi_id = ''">
                    <option value="">{{ loadingEpis ? 'Carregando...' : 'Selecionar EPI...' }}</option>
                    <option v-for="e in epis" :key="e.id" :value="e.id">
                      {{ e.nome }}{{ e.ca ? ' (CA ' + e.ca + ')' : '' }} — Estoque: {{ e.quantidade }}
                    </option>
                  </select>
                </div>
                <span class="field-error">{{ errors.epi_id }}</span>
              </div>

              <div class="field" :class="{ invalid: errors.quantidade }">
                <label for="quantidade">Quantidade <span class="required">*</span></label>
                <input id="quantidade" type="number" min="1" v-model.number="form.quantidade" @input="errors.quantidade = ''" />
                <span class="field-error">{{ errors.quantidade }}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-label">Justificativa</div>
            <div class="field" :class="{ invalid: errors.justificativa }">
              <label for="just">Motivo da solicitação <span class="required">*</span></label>
              <textarea
                id="just"
                v-model="form.justificativa"
                placeholder="Ex: Substituição de equipamento danificado / início em nova função..."
                @input="errors.justificativa = ''"
              />
              <span class="field-error">{{ errors.justificativa }}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-label">Assinatura Digital</div>
            <button
              type="button"
              class="signature-box"
              :class="{ signed: form.assinatura, 'sig-invalid': errors.assinatura }"
              @click="toggleAssinatura"
            >
              <span class="sig-icon">
                <i class="fas" :class="form.assinatura ? 'fa-circle-check' : 'fa-pen-nib'"></i>
              </span>
              <span class="sig-info">
                <strong>{{ form.assinatura ? 'Assinado digitalmente' : 'Assinar digitalmente' }}</strong>
                <small v-if="form.assinatura">{{ profile?.nome || 'Funcionário' }} · {{ assinaturaData }}</small>
                <small v-else>Toque aqui para confirmar sua assinatura ao fazer o pedido</small>
              </span>
            </button>
            <p class="sig-terms">
              Ao assinar, declaro estar ciente e de acordo com a retirada do(s) EPI(s) solicitado(s),
              comprometendo-me a utilizá-lo(s) corretamente, a zelar pela sua conservação e a devolvê-lo(s)
              quando solicitado, nos termos da NR-6.
            </p>
            <span v-if="errors.assinatura" class="sig-error">{{ errors.assinatura }}</span>
          </div>
        </form>
      </div>

      <div class="card-footer">
        <span class="footer-info">Seu pedido ficará como "pendente" até a aprovação.</span>
        <div class="btn-group">
          <button class="btn btn-ghost" type="button" @click="limpar">↺ Limpar</button>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="enviando || !form.assinatura"
            :title="!form.assinatura ? 'Assine digitalmente para enviar o pedido' : ''"
            @click="enviar"
          >
            <span v-if="enviando" class="spinner"></span>
            <i v-else class="fas fa-paper-plane"></i>
            {{ enviando ? 'Enviando...' : 'Enviar Solicitação' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="apiError" class="api-error"><i class="fas fa-exclamation-triangle"></i> {{ apiError }}</div>

    <Transition name="fade">
      <div v-if="showSuccess" class="success-overlay" @click="closeSuccess">
        <div class="success-card" @click.stop>
          <div class="success-icon"><i class="fas fa-check"></i></div>
          <h3>Solicitação Enviada!</h3>
          <p>Seu pedido foi registrado e aguarda aprovação de um administrador.</p>
          <div class="btn-group" style="justify-content:center">
            <button class="btn btn-ghost" @click="irParaMinhas">Ver minhas solicitações</button>
            <button class="btn btn-primary" @click="closeSuccess">Novo Pedido</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'

const { supabase, session, profile, currentProfile } = useSupabase()
const router = useRouter()

const epis          = ref([])
const loadingEpis   = ref(false)
const enviando      = ref(false)
const showSuccess   = ref(false)
const apiError      = ref('')
const assinaturaData = ref('')

const initialForm = () => ({ epi_id: '', quantidade: 1, justificativa: '', assinatura: false })
const form   = reactive(initialForm())
const errors = reactive({ epi_id: '', quantidade: '', justificativa: '', assinatura: '' })

function toggleAssinatura() {
  form.assinatura = !form.assinatura
  errors.assinatura = ''
  assinaturaData.value = form.assinatura
    ? new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : ''
}

async function fetchEpis() {
  loadingEpis.value = true
  const { data, error } = await supabase
    .from('epis')
    .select('id, nome, ca, quantidade')
    .order('nome', { ascending: true })
  if (error) apiError.value = 'Erro ao carregar EPIs: ' + error.message
  else epis.value = data ?? []
  loadingEpis.value = false
}

onMounted(() => {
  fetchEpis()
  currentProfile()
})

function validate() {
  let ok = true
  if (!form.epi_id) { errors.epi_id = 'Selecione um EPI.'; ok = false }
  if (!form.quantidade || form.quantidade < 1) { errors.quantidade = 'Informe uma quantidade válida.'; ok = false }
  if (!form.justificativa.trim()) { errors.justificativa = 'Descreva o motivo da solicitação.'; ok = false }
  if (!form.assinatura) { errors.assinatura = 'Confirme a assinatura digital para enviar o pedido.'; ok = false }
  return ok
}

async function enviar() {
  apiError.value = ''
  if (!validate()) return

  enviando.value = true
  try {
    const { error } = await supabase.from('solicitacoes_epi').insert([{
      solicitante_id: session.value?.user?.id,
      epi_id:         form.epi_id,
      quantidade:     form.quantidade,
      justificativa:  form.justificativa.trim(),
    }])
    if (error) throw error
    showSuccess.value = true
  } catch (e) {
    apiError.value = 'Erro ao enviar solicitação: ' + e.message
  } finally {
    enviando.value = false
  }
}

function limpar() {
  Object.assign(form, initialForm())
  Object.keys(errors).forEach(k => (errors[k] = ''))
  assinaturaData.value = ''
  apiError.value = ''
}

function closeSuccess() {
  showSuccess.value = false
  limpar()
}

function irParaMinhas() {
  router.push('/applayout/minhas-solicitacoes')
}
</script>

<style scoped>
.epi-page {
  --blue: #1E3A8A; --blue-mid: #3B82F6; --ink: #F8FAFC; --ink-mid: #CBD5E1;
  --ink-soft: #94A3B8; --surface: #0A0A0A; --surface-2: #111827;
  --surface-3: rgba(30,58,138,0.13); --card-bg: #161B27; --border: #1E293B;
  --green: #22C55E; --green-bg: rgba(20,83,45,0.35); --red: #EF4444;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  color: var(--ink); padding: 32px 24px 60px; min-height: 100vh; background: var(--surface);
}
.page-header { margin-bottom: 28px; }
h1 { font-size: clamp(22px,3vw,32px); font-weight: 800; color: var(--ink); line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 8px; }
h1 span { color: var(--blue-mid); }
.subtitle { font-size: 14px; color: var(--ink-soft); font-weight: 300; }

.card, .api-error { margin-bottom: 28px; }
.card {
  background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 12px;
  overflow: hidden; box-shadow: 0 4px 32px rgba(0,0,0,0.3);
  animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both;
}
.card-header { background: #0F172A; padding: 18px 24px; display: flex; align-items: center; gap: 14px; }
.card-header-icon {
  width: 38px; height: 38px; background: var(--blue); border-radius: 8px;
  display: grid; place-items: center; font-size: 16px; color: #fff; flex-shrink: 0;
}
.card-header-text { flex: 1; }
.card-header-text h2 { font-size: 15px; font-weight: 700; color: #fff; margin: 0; }
.card-header-text p { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 2px; }
.card-body { padding: 24px; }

.section { margin-bottom: 24px; }
.section:last-child { margin-bottom: 0; }
.section-label {
  font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--ink-soft); padding-bottom: 10px; border-bottom: 1px solid var(--border);
  margin-bottom: 18px; display: flex; align-items: center; gap: 8px;
}
.section-label::before { content: ''; width: 3px; height: 13px; background: var(--blue-mid); border-radius: 2px; }

.field-grid { display: grid; gap: 16px; }
.field-grid-2 { grid-template-columns: 1fr 1fr; }
@media (max-width: 560px) { .field-grid-2 { grid-template-columns: 1fr; } }
.field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
label { font-size: 12px; font-weight: 500; color: var(--ink-mid); }
.required { color: var(--blue-mid); margin-left: 2px; }

select, input[type="number"], textarea {
  width: 100%; padding: 0 13px; border: 1.5px solid var(--border); border-radius: 8px;
  font-family: inherit; font-size: 14px; color: var(--ink); background: var(--surface-2);
  outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  -webkit-appearance: none; -moz-appearance: none; appearance: none;
}
select, input[type="number"] { height: 42px; }
textarea { min-height: 90px; padding: 11px 13px; resize: vertical; line-height: 1.5; }
.select-wrap { position: relative; }
.select-wrap::after {
  content: '▾'; position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  color: var(--ink-soft); font-size: 12px; pointer-events: none;
}
select { cursor: pointer; padding-right: 32px; }
select option { background: #1e293b; color: var(--ink); }
select:focus, input:focus, textarea:focus { border-color: var(--blue-mid); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }

/* ── Assinatura digital ── */
.signature-box {
  width: 100%; display: flex; align-items: center; gap: 14px; text-align: left;
  padding: 14px 16px; border: 1.5px dashed var(--border); border-radius: 10px;
  background: var(--surface-2); color: var(--ink); cursor: pointer; font-family: inherit;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.signature-box:hover { border-color: var(--blue-mid); }
.signature-box.signed {
  border-style: solid; border-color: var(--green);
  background: var(--green-bg); box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
}
.signature-box.sig-invalid { border-color: var(--red); box-shadow: 0 0 0 3px rgba(239,68,68,0.15); }
.sig-icon {
  width: 40px; height: 40px; flex-shrink: 0; border-radius: 10px; display: grid; place-items: center;
  font-size: 17px; background: rgba(59,130,246,0.15); color: var(--blue-mid); transition: all 0.2s;
}
.signature-box.signed .sig-icon { background: rgba(34,197,94,0.2); color: var(--green); }
.sig-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.sig-info strong { font-size: 14px; font-weight: 700; }
.sig-info small { font-size: 11.5px; color: var(--ink-soft); }
.signature-box.signed .sig-info small { color: var(--green); font-weight: 600; }
.sig-terms { margin: 12px 2px 0; font-size: 12px; line-height: 1.6; color: var(--ink-soft); }
.sig-error { display: block; margin-top: 8px; font-size: 11px; color: var(--red); font-weight: 600; }

.field-error { font-size: 11px; color: var(--red); display: none; }
.invalid select, .invalid input, .invalid textarea { border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important; }
.invalid .field-error { display: block; }

.card-footer {
  background: var(--surface-2); border-top: 1px solid var(--border); padding: 18px 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
}
.footer-info { font-size: 11px; color: var(--ink-soft); display: flex; align-items: center; gap: 5px; }
.footer-info::before { content: '📨'; }
.btn-group { display: flex; gap: 10px; }
.btn {
  height: 42px; padding: 0 20px; border-radius: 8px; font-size: 13px; font-weight: 700;
  cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center;
  gap: 7px; font-family: inherit;
}
.btn-ghost { background: transparent; color: var(--ink-soft); border: 1.5px solid var(--border); }
.btn-ghost:hover { border-color: var(--ink-soft); color: var(--ink); }
.btn-primary { background: var(--blue); color: #fff; box-shadow: 0 4px 12px rgba(30,58,138,0.4); }
.btn-primary:hover:not(:disabled) { background: #1e40af; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0;
}
.api-error {
  padding: 12px 16px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
  border-radius: 8px; font-size: 13px; color: #FCA5A5; display: flex; align-items: center; gap: 8px;
}

.success-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100;
  display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
}
.success-card {
  background: #161B27; border: 1.5px solid var(--border); border-radius: 16px;
  padding: 36px 40px; text-align: center; max-width: 420px; width: 90%;
  animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1);
}
.success-icon {
  width: 56px; height: 56px; background: var(--green-bg); border: 2px solid var(--green);
  border-radius: 50%; display: grid; place-items: center; font-size: 22px; color: var(--green); margin: 0 auto 18px;
}
.success-card h3 { font-size: 20px; font-weight: 800; margin: 0 0 8px; }
.success-card p { font-size: 13px; color: var(--ink-soft); line-height: 1.6; margin-bottom: 20px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes popIn { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
