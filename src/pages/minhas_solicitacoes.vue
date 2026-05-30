<template>
  <div class="sol-page">
    <div class="page-header">
      <h1>Minhas <span>Solicitações</span></h1>
      <p class="subtitle">Acompanhe o status dos seus pedidos de liberação de EPI.</p>
    </div>

    <div class="table-card">
      <div class="table-header">
        <div class="table-header-icon"><i class="fas fa-list-check"></i></div>
        <div class="table-header-text">
          <h2>Histórico de Pedidos</h2>
          <p>{{ solicitacoes.length }} solicitaç{{ solicitacoes.length === 1 ? 'ão' : 'ões' }}</p>
        </div>
        <button class="btn btn-ghost" @click="carregar" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <i v-else class="fas fa-sync-alt"></i> Atualizar
        </button>
      </div>

      <div v-if="loading" class="table-state"><span class="spinner"></span> Carregando...</div>
      <div v-else-if="solicitacoes.length === 0" class="table-state">
        <i class="fas fa-inbox"></i>
        <p>Você ainda não fez nenhuma solicitação.</p>
        <RouterLink to="/applayout/solicitar" class="btn btn-primary">Fazer um pedido</RouterLink>
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>EPI</th>
              <th class="text-center">Qtd</th>
              <th>Justificativa</th>
              <th class="text-center">Status</th>
              <th>Resposta</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in solicitacoes" :key="s.id">
              <td class="td-date">{{ formatarData(s.criado_em) }}</td>
              <td><strong>{{ s.epis?.nome || 'EPI removido' }}</strong><span v-if="s.epis?.ca" class="ca-tag">CA {{ s.epis.ca }}</span></td>
              <td class="text-center">{{ s.quantidade }}</td>
              <td class="td-just">{{ s.justificativa || '—' }}</td>
              <td class="text-center"><span class="badge" :class="badgeClass(s.status)">{{ statusLabel(s.status) }}</span></td>
              <td class="td-resp">
                <template v-if="s.status === 'recusado'">{{ s.motivo_recusa || 'Sem motivo informado' }}</template>
                <template v-else-if="s.status === 'aprovado'">Liberado em {{ formatarData(s.decidido_em) }}</template>
                <template v-else>Aguardando análise</template>
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
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'

const { supabase } = useSupabase()

const solicitacoes = ref([])
const loading      = ref(false)
const apiError     = ref('')

async function carregar() {
  loading.value = true
  apiError.value = ''
  const { data, error } = await supabase
    .from('solicitacoes_epi')
    .select('id, quantidade, justificativa, status, motivo_recusa, criado_em, decidido_em, epis(nome, ca)')
    .order('criado_em', { ascending: false })
  if (error) apiError.value = 'Erro ao carregar solicitações: ' + error.message
  else solicitacoes.value = data ?? []
  loading.value = false
}

onMounted(carregar)

const statusLabel = (s) => ({ pendente: '⏳ Pendente', aprovado: '✓ Aprovado', recusado: '✕ Recusado' }[s] || s)
const badgeClass  = (s) => ({ pendente: 'badge-warn', aprovado: 'badge-ok', recusado: 'badge-bad' }[s] || '')
const formatarData = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—')
</script>

<style scoped>
.sol-page {
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
.td-date { color: var(--ink-soft); font-size: 12px; white-space: nowrap; }
.td-just, .td-resp { max-width: 240px; color: var(--ink-soft); font-size: 12px; }
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

.btn {
  height: 38px; padding: 0 16px; border-radius: 8px; font-size: 12px; font-weight: 700;
  cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 7px;
  font-family: inherit; transition: all 0.2s; text-decoration: none;
}
.btn-ghost { background: transparent; color: var(--ink-soft); border: 1.5px solid var(--border); }
.btn-ghost:hover { border-color: var(--ink-soft); color: var(--ink); }
.btn-primary { background: var(--blue); color: #fff; }
.btn-primary:hover { background: #1e40af; }

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
