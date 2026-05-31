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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import { fetchEpisEmPosse, isAlerta, isVencido } from '@/composables/useEpiPossession'

const { profile, currentProfile } = useSupabase()

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
    epis.value = await fetchEpisEmPosse(profile.value?.nome)
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
</style>
