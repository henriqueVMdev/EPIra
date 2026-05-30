<template>
  <div class="aprov-page">
    <div class="page-header">
      <h1>Aprovação de <span>Solicitações</span></h1>
      <p class="subtitle">Analise os pedidos de liberação de EPI. Aprovar baixa o estoque automaticamente.</p>
    </div>

    <!-- Filtros de status -->
    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t.valor"
        class="tab"
        :class="{ active: filtroStatus === t.valor }"
        @click="filtroStatus = t.valor"
      >
        {{ t.label }}
        <span class="tab-count">{{ contagem(t.valor) }}</span>
      </button>
    </div>

    <div class="table-card">
      <div class="table-header">
        <div class="table-header-icon"><i class="fas fa-clipboard-check"></i></div>
        <div class="table-header-text">
          <h2>Pedidos</h2>
          <p>{{ filtradas.length }} registro{{ filtradas.length === 1 ? '' : 's' }}</p>
        </div>
        <button class="btn btn-ghost" @click="carregar" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <i v-else class="fas fa-sync-alt"></i> Atualizar
        </button>
      </div>

      <div v-if="loading" class="table-state"><span class="spinner"></span> Carregando...</div>
      <div v-else-if="filtradas.length === 0" class="table-state">
        <i class="fas fa-inbox"></i>
        <p>Nenhuma solicitação {{ filtroStatus === 'todos' ? '' : statusLabelPlano(filtroStatus) }} no momento.</p>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Funcionário</th>
              <th>EPI</th>
              <th class="text-center">Qtd</th>
              <th>Justificativa</th>
              <th class="text-center">Status</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filtradas" :key="s.id">
              <td class="td-date">{{ formatarData(s.criado_em) }}</td>
              <td>
                <strong>{{ s.solicitante?.nome || 'Funcionário' }}</strong>
                <span v-if="s.solicitante?.cargo" class="sub">{{ s.solicitante.cargo }}</span>
              </td>
              <td>{{ s.epis?.nome || 'EPI removido' }}<span v-if="s.epis?.ca" class="ca-tag">CA {{ s.epis.ca }}</span></td>
              <td class="text-center">{{ s.quantidade }}</td>
              <td class="td-just">{{ s.justificativa || '—' }}</td>
              <td class="text-center"><span class="badge" :class="badgeClass(s.status)">{{ statusLabel(s.status) }}</span></td>
              <td class="text-center">
                <div v-if="s.status === 'pendente'" class="acoes">
                  <button class="btn-acao aprovar" :disabled="processando === s.id" @click="aprovar(s)">
                    <span v-if="processando === s.id" class="spinner"></span>
                    <i v-else class="fas fa-check"></i> Aprovar
                  </button>
                  <button class="btn-acao recusar" :disabled="processando === s.id" @click="recusar(s)">
                    <i class="fas fa-times"></i> Recusar
                  </button>
                </div>
                <span v-else class="resolvido">{{ s.motivo_recusa || formatarData(s.decidido_em) }}</span>
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

const { supabase } = useSupabase()

const solicitacoes = ref([])
const loading      = ref(false)
const processando  = ref(null)
const apiError     = ref('')
const filtroStatus = ref('pendente')

const tabs = [
  { valor: 'pendente', label: 'Pendentes' },
  { valor: 'aprovado', label: 'Aprovadas' },
  { valor: 'recusado', label: 'Recusadas' },
  { valor: 'todos',    label: 'Todas' },
]

const filtradas = computed(() =>
  filtroStatus.value === 'todos'
    ? solicitacoes.value
    : solicitacoes.value.filter(s => s.status === filtroStatus.value)
)

const contagem = (status) =>
  status === 'todos'
    ? solicitacoes.value.length
    : solicitacoes.value.filter(s => s.status === status).length

async function carregar() {
  loading.value = true
  apiError.value = ''
  const { data, error } = await supabase
    .from('solicitacoes_epi')
    .select('id, quantidade, justificativa, status, motivo_recusa, criado_em, decidido_em, epis(nome, ca), solicitante:profiles!solicitacoes_epi_solicitante_id_fkey(nome, email, cargo)')
    .order('criado_em', { ascending: false })
  if (error) apiError.value = 'Erro ao carregar solicitações: ' + error.message
  else solicitacoes.value = data ?? []
  loading.value = false
}

onMounted(carregar)

async function aprovar(s) {
  apiError.value = ''
  processando.value = s.id
  const { error } = await supabase.rpc('aprovar_solicitacao', { p_id: s.id })
  processando.value = null
  if (error) { apiError.value = 'Não foi possível aprovar: ' + error.message; return }
  await carregar()
}

async function recusar(s) {
  apiError.value = ''
  const motivo = window.prompt('Motivo da recusa (opcional):', '')
  if (motivo === null) return // cancelou
  processando.value = s.id
  const { error } = await supabase.rpc('recusar_solicitacao', { p_id: s.id, p_motivo: motivo || null })
  processando.value = null
  if (error) { apiError.value = 'Não foi possível recusar: ' + error.message; return }
  await carregar()
}

const statusLabel = (s) => ({ pendente: '⏳ Pendente', aprovado: '✓ Aprovado', recusado: '✕ Recusado' }[s] || s)
const statusLabelPlano = (s) => ({ pendente: 'pendente', aprovado: 'aprovada', recusado: 'recusada' }[s] || '')
const badgeClass  = (s) => ({ pendente: 'badge-warn', aprovado: 'badge-ok', recusado: 'badge-bad' }[s] || '')
const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—')
</script>

<style scoped>
.aprov-page {
  --blue: #1E3A8A; --blue-mid: #3B82F6; --ink: #F8FAFC; --ink-mid: #CBD5E1;
  --ink-soft: #94A3B8; --surface: #0A0A0A; --surface-2: #111827; --card-bg: #161B27;
  --border: #1E293B; --green: #22C55E; --yellow: #F59E0B; --red: #EF4444;
  font-family: 'DM Sans', 'Segoe UI', sans-serif; color: var(--ink);
  padding: 32px 24px 60px; min-height: 100vh; background: var(--surface);
}
.page-header { margin-bottom: 22px; }
h1 { font-size: clamp(22px,3vw,32px); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 8px; }
h1 span { color: var(--blue-mid); }
.subtitle { font-size: 14px; color: var(--ink-soft); font-weight: 300; }

.tabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.tab {
  display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px;
  border-radius: 8px; border: 1.5px solid var(--border); background: var(--surface-2);
  color: var(--ink-soft); font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all 0.18s;
}
.tab:hover { color: var(--ink); border-color: var(--ink-soft); }
.tab.active { background: var(--blue); color: #fff; border-color: var(--blue); }
.tab-count {
  font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 20px;
  background: rgba(255,255,255,0.12);
}

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
td strong { color: var(--ink); font-weight: 600; display: block; }
td .sub { font-size: 11px; color: var(--ink-soft); }
.text-center { text-align: center; }
.td-date { color: var(--ink-soft); font-size: 12px; white-space: nowrap; }
.td-just { max-width: 240px; color: var(--ink-soft); font-size: 12px; }
.ca-tag {
  display: inline-block; margin-left: 6px; font-size: 10px; color: #93C5FD;
  background: rgba(30,58,138,0.3); padding: 1px 6px; border-radius: 3px; font-weight: 600;
}
.badge {
  display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 20px; white-space: nowrap;
}
.badge-ok   { background: rgba(34,197,94,0.15);  color: #4ADE80; border: 1px solid rgba(34,197,94,0.3); }
.badge-warn { background: rgba(245,158,11,0.15); color: #FCD34D; border: 1px solid rgba(245,158,11,0.3); }
.badge-bad  { background: rgba(239,68,68,0.15);  color: #FCA5A5; border: 1px solid rgba(239,68,68,0.3); }

.acoes { display: inline-flex; gap: 6px; }
.btn-acao {
  display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 6px;
  font-size: 11px; font-weight: 700; font-family: inherit; cursor: pointer; border: 1px solid transparent;
  transition: all 0.15s; white-space: nowrap;
}
.btn-acao:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-acao.aprovar { background: rgba(34,197,94,0.15); color: #4ADE80; border-color: rgba(34,197,94,0.3); }
.btn-acao.aprovar:hover:not(:disabled) { background: rgba(34,197,94,0.28); }
.btn-acao.recusar { background: rgba(239,68,68,0.12); color: #FCA5A5; border-color: rgba(239,68,68,0.3); }
.btn-acao.recusar:hover:not(:disabled) { background: rgba(239,68,68,0.25); }
.resolvido { font-size: 11px; color: var(--ink-soft); }

.btn {
  height: 38px; padding: 0 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
  cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 7px; font-family: inherit; transition: all 0.2s;
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
