<template>
  <div class="epi-page">
    <div class="page-header">
      <h1>Meus <span>EPIs</span></h1>
      <p class="subtitle">Equipamentos sob sua responsabilidade e situação de validade.</p>
    </div>

    <!-- Banner de alerta de validade -->
    <div v-if="!loading && alertas.length" class="alert-banner" :class="temVencido ? 'banner-danger' : 'banner-warn'">
      <div class="alert-icon">
        <i :class="temVencido ? 'fas fa-circle-exclamation' : 'fas fa-triangle-exclamation'"></i>
      </div>
      <div class="alert-text">
        <strong>
          {{ temVencido
            ? 'Você tem EPI(s) com validade vencida!'
            : 'Atenção: EPI(s) próximos do vencimento.' }}
        </strong>
        <ul>
          <li v-for="e in alertas" :key="e.epi_id">
            <span class="al-nome">{{ e.nome }}</span>
            <span v-if="e.ca" class="al-ca">CA {{ e.ca }}</span>
            —
            <span :class="e.status === 'vencido' ? 'al-venc' : 'al-aven'">
              {{ textoPrazo(e) }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <div class="table-header-icon"><i class="fas fa-helmet-safety"></i></div>
        <div class="table-header-text">
          <h2>Equipamentos em Posse</h2>
          <p>{{ epis.length }} ite{{ epis.length === 1 ? 'm' : 'ns' }}</p>
        </div>
        <button v-if="isAdm" class="btn btn-primary" @click="abrirRetirada">
          <i class="fas fa-hand-holding-medical"></i> Registrar Retirada
        </button>
        <button class="btn btn-ghost" @click="carregar" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <i v-else class="fas fa-sync-alt"></i> Atualizar
        </button>
      </div>

      <div v-if="loading" class="table-state"><span class="spinner"></span> Carregando...</div>
      <div v-else-if="epis.length === 0" class="table-state">
        <i class="fas fa-inbox"></i>
        <p>Nenhum EPI sob sua responsabilidade no momento.</p>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EPI</th>
              <th>Categoria</th>
              <th class="text-center">Qtd</th>
              <th>Validade</th>
              <th class="text-center">Situação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in epis" :key="e.epi_id">
              <td><strong>{{ e.nome }}</strong><span v-if="e.ca" class="ca-tag">CA {{ e.ca }}</span></td>
              <td class="td-cat">{{ e.categoria || '—' }}</td>
              <td class="text-center">{{ e.saldo }}</td>
              <td class="td-val">
                {{ e.validade ? formatarData(e.validade) : '—' }}
              </td>
              <td class="text-center">
                <span class="badge" :class="badgeClass(e.status)">{{ textoPrazo(e) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="apiError" class="api-error"><i class="fas fa-exclamation-triangle"></i> {{ apiError }}</div>

    <!-- Modal de retirada própria (apenas ADM) -->
    <Transition name="fade">
      <div v-if="showRetirada" class="modal-overlay" @click="fecharRetirada">
        <div class="retirada-modal" @click.stop>
          <div class="retirada-header">
            <div class="retirada-header-icon"><i class="fas fa-hand-holding-medical"></i></div>
            <div class="retirada-title">
              <h3>Registrar Retirada</h3>
              <p>Retirada de EPI para você mesmo ({{ profile?.nome || profile?.email }})</p>
            </div>
            <button class="modal-close-btn" @click="fecharRetirada">✕</button>
          </div>

          <div class="retirada-body">
            <div class="field" :class="{ invalid: retErrors.epi_id }">
              <label>EPI <span class="required">*</span></label>
              <div class="select-wrap">
                <select v-model="retForm.epi_id" :disabled="loadingEpisDisp" @change="retErrors.epi_id = ''">
                  <option value="">
                    {{ loadingEpisDisp ? 'Carregando...' : 'Selecionar EPI...' }}
                  </option>
                  <option v-for="e in episDisponiveis" :key="e.id" :value="e.id" :disabled="!e.quantidade">
                    {{ e.nome }}{{ e.ca ? ' — CA ' + e.ca : '' }} ({{ e.quantidade ?? 0 }} em estoque)
                  </option>
                </select>
              </div>
              <span class="field-error">{{ retErrors.epi_id }}</span>
            </div>

            <div class="field" style="margin-top:14px" :class="{ invalid: retErrors.quantidade }">
              <label>Quantidade <span class="required">*</span></label>
              <div class="qty-wrap">
                <button type="button" class="qty-btn" @click="retForm.quantidade > 1 && retForm.quantidade--">−</button>
                <input type="number" v-model.number="retForm.quantidade" min="1" max="999" @input="retErrors.quantidade = ''" />
                <button type="button" class="qty-btn" @click="retForm.quantidade < 999 && retForm.quantidade++">+</button>
              </div>
              <span class="field-error">{{ retErrors.quantidade }}</span>
            </div>

            <div class="field" style="margin-top:14px">
              <label>Observações</label>
              <textarea v-model="retForm.observacoes" placeholder="Detalhes adicionais (opcional)..."></textarea>
            </div>

            <div
              class="signature-block"
              :class="{ checked: retForm.assinatura }"
              @click="retForm.assinatura = !retForm.assinatura; retErrors.assinatura = ''"
            >
              <div class="sig-checkbox"><span class="sig-checkmark">✓</span></div>
              <div class="sig-text">
                <div class="sig-title">{{ retForm.assinatura ? '✓ Assinatura Digital Confirmada' : 'Assinatura Digital Confirmada' }}</div>
                <div class="sig-desc">Confirmo que retirei o(s) EPI(s) acima em perfeito estado e me comprometo a utilizá-lo(s) sempre que necessário.</div>
              </div>
              <div class="sig-icon">✍️</div>
            </div>
            <span v-if="retErrors.assinatura" class="field-error" style="display:block;margin-top:6px">{{ retErrors.assinatura }}</span>

            <div v-if="retError" class="api-error" style="margin-top:12px">
              <i class="fas fa-exclamation-triangle"></i> {{ retError }}
            </div>
          </div>

          <div class="retirada-footer">
            <button class="btn btn-ghost" @click="fecharRetirada">Cancelar</button>
            <button class="btn btn-primary" @click="registrarRetirada" :disabled="retSubmitting">
              <span v-if="retSubmitting" class="spinner"></span>
              <i v-else class="fas fa-check"></i>
              {{ retSubmitting ? 'Registrando...' : 'Confirmar Retirada' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { fetchEpisEmPosse, isAlerta, isVencido } from '@/composables/useEpiPossession'

const { supabase, profile, isAdm, currentProfile } = useSupabase()

const epis     = ref([])
const loading  = ref(false)
const apiError = ref('')

const alertas    = computed(() => epis.value.filter(isAlerta))
const temVencido = computed(() => epis.value.some(isVencido))

async function carregar() {
  loading.value = true
  apiError.value = ''
  try {
    await currentProfile()
    epis.value = await fetchEpisEmPosse(profile.value?.id)
  } catch (e) {
    apiError.value = 'Erro ao carregar seus EPIs: ' + e.message
  } finally {
    loading.value = false
  }
}

onMounted(carregar)

const formatarData = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')

function textoPrazo(e) {
  if (e.status === 'sem_validade') return 'Sem validade'
  if (e.status === 'vencido') {
    const d = Math.abs(e.dias)
    return d === 0 ? 'Vence hoje' : `Vencido há ${d} dia${d === 1 ? '' : 's'}`
  }
  if (e.status === 'a_vencer') {
    return e.dias === 0 ? 'Vence hoje' : `Vence em ${e.dias} dia${e.dias === 1 ? '' : 's'}`
  }
  return `Vence em ${e.dias} dias`
}

const badgeClass = (s) => ({
  vencido: 'badge-bad',
  a_vencer: 'badge-warn',
  ok: 'badge-ok',
  sem_validade: 'badge-neutral',
}[s] || 'badge-neutral')

// ─── Retirada própria (apenas ADM) ─────────────────────────────────────────
// O admin registra uma movimentação de "entrega" para si mesmo; o trigger
// trg_mov_estoque no banco desconta o estoque e valida quantidade insuficiente.

const showRetirada   = ref(false)
const retSubmitting  = ref(false)
const retError       = ref('')
const episDisponiveis = ref([])
const loadingEpisDisp = ref(false)

const retForm   = reactive({ epi_id: '', quantidade: 1, observacoes: '', assinatura: false })
const retErrors = reactive({ epi_id: '', quantidade: '', assinatura: '' })

async function abrirRetirada() {
  Object.assign(retForm, { epi_id: '', quantidade: 1, observacoes: '', assinatura: false })
  Object.keys(retErrors).forEach(k => (retErrors[k] = ''))
  retError.value = ''
  showRetirada.value = true

  loadingEpisDisp.value = true
  try {
    const { data, error } = await supabase
      .from('epis')
      .select('id, nome, ca, quantidade')
      .order('nome')
    if (error) throw error
    episDisponiveis.value = data ?? []
  } catch (e) {
    retError.value = 'Erro ao carregar EPIs: ' + e.message
  } finally {
    loadingEpisDisp.value = false
  }
}

function fecharRetirada() {
  showRetirada.value = false
}

async function registrarRetirada() {
  retError.value = ''
  let ok = true
  if (!retForm.epi_id)                          { retErrors.epi_id = 'Selecione um EPI.'; ok = false }
  if (!retForm.quantidade || retForm.quantidade < 1) { retErrors.quantidade = 'Informe a quantidade.'; ok = false }
  if (!retForm.assinatura)                      { retErrors.assinatura = 'É necessário confirmar a assinatura digital.'; ok = false }
  if (!ok) return

  retSubmitting.value = true
  try {
    await currentProfile()
    const { error } = await supabase.from('movimentacoes').insert([{
      funcionario:           profile.value?.nome || profile.value?.email,
      profile_id:            profile.value?.id,
      tipo:                  'entrega',
      epi_id:                retForm.epi_id,
      quantidade:            retForm.quantidade,
      data:                  new Date().toISOString().split('T')[0],
      observacoes:           retForm.observacoes.trim()
        ? 'Retirada própria (administrador) — ' + retForm.observacoes.trim()
        : 'Retirada própria (administrador)',
      assinatura_confirmada: true,
    }])
    if (error) throw error
    showRetirada.value = false
    await carregar()
  } catch (e) {
    retError.value = 'Erro ao registrar retirada: ' + e.message
  } finally {
    retSubmitting.value = false
  }
}
</script>

<style scoped>
.epi-page {
  --blue: #1E3A8A; --blue-mid: #3B82F6; --ink: #F8FAFC; --ink-mid: #CBD5E1;
  --ink-soft: #94A3B8; --surface: #0A0A0A; --surface-2: #111827; --card-bg: #161B27;
  --border: #1E293B; --green: #22C55E; --yellow: #F59E0B; --red: #EF4444;
  font-family: 'DM Sans', 'Segoe UI', sans-serif; color: var(--ink);
  padding: 32px 24px 60px; min-height: 100vh; background: var(--surface);
}
.page-header { margin-bottom: 28px; }
h1 { font-size: clamp(22px,3vw,32px); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 8px; }
h1 span { color: var(--blue-mid); }
.subtitle { font-size: 14px; color: var(--ink-soft); font-weight: 300; }

/* ── Banner de alerta ── */
.alert-banner {
  display: flex; gap: 14px; align-items: flex-start;
  border-radius: 12px; padding: 16px 18px; margin-bottom: 24px;
  animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
}
.banner-danger { background: rgba(239,68,68,0.1);  border: 1.5px solid rgba(239,68,68,0.4); }
.banner-warn   { background: rgba(245,158,11,0.1); border: 1.5px solid rgba(245,158,11,0.4); }
.alert-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
.banner-danger .alert-icon { color: #F87171; }
.banner-warn   .alert-icon { color: #FCD34D; }
.alert-text { flex: 1; font-size: 13px; }
.alert-text strong { display: block; margin-bottom: 8px; font-size: 14px; color: var(--ink); }
.alert-text ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.alert-text li { color: var(--ink-mid); font-size: 12.5px; }
.al-nome { font-weight: 600; color: var(--ink); }
.al-ca { margin-left: 5px; font-size: 10px; color: #93C5FD; background: rgba(30,58,138,0.3); padding: 1px 6px; border-radius: 3px; font-weight: 600; }
.al-venc { color: #F87171; font-weight: 700; }
.al-aven { color: #FCD34D; font-weight: 700; }

/* ── Tabela ── */
.table-card {
  background: var(--card-bg); border: 1.5px solid var(--border); border-radius: 12px;
  overflow: hidden; box-shadow: 0 4px 32px rgba(0,0,0,0.3); margin-bottom: 20px;
  animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
}
.table-header { background: #0F172A; padding: 16px 22px; display: flex; align-items: center; gap: 14px; }
.table-header-icon {
  width: 36px; height: 36px; background: var(--blue); border-radius: 8px;
  display: grid; place-items: center; font-size: 14px; color: #fff; flex-shrink: 0;
}
.table-header-text { flex: 1; }
.table-header-text h2 { font-size: 14px; font-weight: 700; color: #fff; margin: 0; }
.table-header-text p { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 2px; }

.table-state {
  padding: 44px 24px; text-align: center; color: var(--ink-soft); font-size: 13px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
}
.table-state i { font-size: 28px; opacity: 0.3; }

.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead tr { background: #0F172A; border-bottom: 2px solid var(--border); }
th {
  padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-soft); white-space: nowrap;
}
td { padding: 13px 16px; border-bottom: 1px solid var(--border); color: var(--ink-mid); vertical-align: middle; }
tbody tr:hover { background: rgba(30,58,138,0.08); }
tbody tr:last-child td { border-bottom: none; }
td strong { color: var(--ink); font-weight: 600; }
.text-center { text-align: center; }
.td-cat { color: var(--ink-soft); }
.td-val { white-space: nowrap; font-family: 'Courier New', monospace; font-size: 12px; }
.ca-tag {
  display: inline-block; margin-left: 6px; font-size: 10px; color: #93C5FD;
  background: rgba(30,58,138,0.3); padding: 1px 6px; border-radius: 3px; font-weight: 600;
}
.badge {
  display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 20px; white-space: nowrap;
}
.badge-ok      { background: rgba(34,197,94,0.15);  color: #4ADE80; border: 1px solid rgba(34,197,94,0.3); }
.badge-warn    { background: rgba(245,158,11,0.15); color: #FCD34D; border: 1px solid rgba(245,158,11,0.3); }
.badge-bad     { background: rgba(239,68,68,0.15);  color: #FCA5A5; border: 1px solid rgba(239,68,68,0.3); }
.badge-neutral { background: rgba(148,163,184,0.12); color: var(--ink-soft); border: 1px solid var(--border); }

.btn {
  height: 38px; padding: 0 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
  cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 7px;
  font-family: inherit; transition: all 0.2s; text-decoration: none;
}
.btn-ghost { background: transparent; color: var(--ink-soft); border: 1.5px solid var(--border); }
.btn-ghost:hover { border-color: var(--ink-soft); color: var(--ink); }

.spinner {
  width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0;
}
.api-error {
  margin-top: 14px; padding: 12px 16px; background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; font-size: 13px;
  color: #FCA5A5; display: flex; align-items: center; gap: 8px;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes popIn { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }

/* ── Botão primário (Registrar Retirada / Confirmar) ────────────────────── */
.btn-primary {
  background: var(--blue);
  color: white;
  box-shadow: 0 4px 12px rgba(30,58,138,0.4);
}
.btn-primary:hover:not(:disabled) { background: #1e40af; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Modal de Retirada ──────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100;
  display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.retirada-modal {
  background: #161B27; border: 1.5px solid var(--border); border-radius: 16px;
  width: 90%; max-width: 520px; max-height: 90vh; overflow-y: auto;
  animation: popIn 0.35s cubic-bezier(0.16,1,0.3,1);
}
.retirada-header {
  background: #0F172A; padding: 16px 20px; display: flex; align-items: center;
  gap: 12px; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 1;
}
.retirada-header-icon {
  width: 36px; height: 36px; background: var(--blue); border-radius: 8px;
  display: grid; place-items: center; font-size: 14px; color: #fff; flex-shrink: 0;
}
.retirada-title { flex: 1; }
.retirada-title h3 { font-size: 15px; font-weight: 700; color: #fff; margin: 0; }
.retirada-title p  { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }

.modal-close-btn {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; color: var(--ink-soft); font-size: 13px; cursor: pointer;
  display: grid; place-items: center; transition: all 0.15s; flex-shrink: 0;
}
.modal-close-btn:hover { background: rgba(239,68,68,0.1); border-color: var(--red); color: var(--red); }

.retirada-body { padding: 20px; }
.retirada-footer {
  background: var(--surface-2); border-top: 1px solid var(--border);
  padding: 14px 20px; display: flex; justify-content: flex-end; gap: 10px;
  position: sticky; bottom: 0;
}

/* ── Campos do modal ────────────────────────────────────────────────────── */
.field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.field label { font-size: 12px; font-weight: 500; color: var(--ink-mid); }
.required { color: var(--blue-mid); margin-left: 2px; }

.select-wrap { position: relative; }
.select-wrap::after {
  content: '▾'; position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  color: var(--ink-soft); font-size: 12px; pointer-events: none;
}
.retirada-body select,
.retirada-body input[type="number"] {
  width: 100%; height: 42px; padding: 0 13px; border: 1.5px solid var(--border);
  border-radius: 8px; font-family: inherit; font-size: 14px; color: var(--ink);
  background: var(--surface-2); outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none; -moz-appearance: none; appearance: none; box-sizing: border-box;
}
.retirada-body select { cursor: pointer; padding-right: 32px; }
.retirada-body select option { background: #1e293b; color: var(--ink); }
.retirada-body select:focus,
.retirada-body input:focus,
.retirada-body textarea:focus {
  border-color: var(--blue-mid); box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}
.retirada-body select:disabled { opacity: 0.5; cursor: not-allowed; }

.qty-wrap {
  display: flex; align-items: center; border: 1.5px solid var(--border);
  border-radius: 8px; overflow: hidden; background: var(--surface-2);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.qty-wrap:focus-within { border-color: var(--blue-mid); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
.qty-btn {
  width: 38px; height: 40px; display: grid; place-items: center; background: none;
  border: none; font-size: 18px; color: var(--ink-soft); cursor: pointer;
  transition: background 0.15s, color 0.15s; flex-shrink: 0;
}
.qty-btn:hover { background: rgba(30,58,138,0.13); color: var(--blue-mid); }
.qty-wrap input {
  flex: 1; height: 40px; border: none !important; border-radius: 0; background: transparent;
  text-align: center; font-weight: 500; padding: 0; box-shadow: none !important;
}
.qty-wrap input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
.qty-wrap input[type="number"]::-webkit-outer-spin-button,
.qty-wrap input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; appearance: none; }

.retirada-body textarea {
  width: 100%; min-height: 64px; padding: 11px 13px; border: 1.5px solid var(--border);
  border-radius: 8px; font-family: inherit; font-size: 14px; color: var(--ink);
  background: var(--surface-2); outline: none; resize: vertical; line-height: 1.5;
  transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
}

.field-error { font-size: 11px; color: var(--red); display: none; }
.invalid select, .invalid input { border-color: var(--red) !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important; }
.invalid .field-error { display: block; }

/* ── Assinatura ─────────────────────────────────────────────────────────── */
.signature-block {
  margin-top: 16px; background: var(--surface-2); border: 1.5px solid rgba(30,58,138,0.35);
  border-radius: 10px; padding: 16px; display: flex; align-items: flex-start; gap: 14px;
  cursor: pointer; transition: background 0.2s, border-color 0.2s; user-select: none;
}
.signature-block:hover { background: rgba(30,58,138,0.13); border-color: var(--blue-mid); }
.signature-block.checked { background: rgba(20,83,45,0.35); border-color: var(--green); }
.sig-checkbox {
  width: 22px; height: 22px; border: 2px solid var(--border); border-radius: 6px;
  display: grid; place-items: center; flex-shrink: 0; margin-top: 2px;
  transition: background 0.2s, border-color 0.2s; background: var(--surface-2);
}
.signature-block.checked .sig-checkbox { background: var(--green); border-color: var(--green); }
.sig-checkmark {
  color: white; font-size: 13px; font-weight: 700; opacity: 0; transform: scale(0.5);
  transition: opacity 0.2s, transform 0.2s;
}
.signature-block.checked .sig-checkmark { opacity: 1; transform: scale(1); }
.sig-text { flex: 1; }
.sig-title { font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 4px; }
.signature-block.checked .sig-title { color: var(--green); }
.sig-desc { font-size: 12px; color: var(--ink-soft); line-height: 1.5; }
.sig-icon { font-size: 24px; flex-shrink: 0; opacity: 0.7; }
</style>
