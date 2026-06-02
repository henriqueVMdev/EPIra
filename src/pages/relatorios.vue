<template>
  <div class="relatorios-page">

    <!-- Header -->
    <div class="page-header">
      <h1>Emissão de <span>Relatórios</span></h1>
      <p class="subtitle">Visualize indicadores, filtre registros e exporte relatórios em PDF.</p>
    </div>

    <!-- Cards de resumo -->
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-icon blue"><i class="fas fa-hand-holding"></i></div>
        <div class="summary-text">
          <span class="summary-value">{{ totalEntregas }}</span>
          <span class="summary-label">Entregas Realizadas</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon green"><i class="fas fa-check-circle"></i></div>
        <div class="summary-text">
          <span class="summary-value">{{ totalAssinados }}</span>
          <span class="summary-label">Assinaturas Confirmadas</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon yellow"><i class="fas fa-clock"></i></div>
        <div class="summary-text">
          <span class="summary-value">{{ totalPendentes }}</span>
          <span class="summary-label">Pendentes de Assinatura</span>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon red"><i class="fas fa-exclamation-triangle"></i></div>
        <div class="summary-text">
          <span class="summary-value">{{ totalEstoqueCritico }}</span>
          <span class="summary-label">EPIs em Estoque Crítico</span>
        </div>
      </div>
    </div>

    <!-- Gráficos -->
    <div class="charts-grid">
      <div class="card chart-card">
        <div class="card-header-simple">
          <div class="card-header-icon"><i class="fas fa-circle-notch"></i></div>
          <h3>Saúde do Inventário</h3>
        </div>
        <div class="chart-box">
          <canvas ref="pieCanvas"></canvas>
          <div v-if="loadingEstoque" class="chart-placeholder">
            <span class="spinner-lg"></span>
            <p>Sincronizando inventário...</p>
          </div>
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header-simple">
          <div class="card-header-icon"><i class="fas fa-bars"></i></div>
          <h3>EPIs em Nível Crítico</h3>
        </div>
        <div class="chart-box">
          <canvas ref="barCanvas"></canvas>
          <div v-if="loadingEstoque" class="chart-placeholder">
            <span class="spinner-lg"></span>
            <p>Analisando estoque...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela de Estoque -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-icon"><i class="fas fa-boxes"></i></div>
        <div class="card-header-text">
          <h2>Estoque de EPIs</h2>
          <p>{{ estoquesFiltrado.length }} de {{ estoqueProcessado.length }} item{{ estoqueProcessado.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <div class="filters-bar">
        <div class="field search-field">
          <input type="text" v-model="filtroNome" placeholder="Buscar por nome do EPI..." />
        </div>
        <div class="field">
          <div class="select-wrap">
            <select v-model="filtroCategoria">
              <option value="">Todas as categorias</option>
              <option value="Capacete">Capacete</option>
              <option value="Luva">Luva</option>
              <option value="Óculos">Óculos</option>
              <option value="Botina">Botina</option>
              <option value="Protetor Auricular">Protetor Auricular</option>
              <option value="Máscara">Máscara</option>
              <option value="Cinto de Segurança">Cinto de Segurança</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
        </div>
        <div class="field">
          <div class="select-wrap">
            <select v-model="filtroStatus">
              <option value="">Todos os níveis</option>
              <option value="ok">✓ Estoque OK (≥10)</option>
              <option value="baixo">⚠ Estoque Baixo (&lt;10)</option>
              <option value="esgotado">✕ Esgotado</option>
            </select>
          </div>
        </div>
        <div class="field">
          <div class="select-wrap">
            <select v-model="filtroValidade">
              <option value="">Toda validade CA</option>
              <option value="ok">CA Válido</option>
              <option value="alerta">Vence em 30 dias</option>
              <option value="vencida">CA Vencido</option>
              <option value="sem">Sem CA</option>
            </select>
          </div>
        </div>
        <div class="field">
          <input type="date" v-model="filtroDataInicio" />
        </div>
        <div class="field">
          <input type="date" v-model="filtroDataFim" />
        </div>
        <button class="btn btn-ghost btn-sm" @click="limparFiltrosEstoque">↺ Limpar</button>
        <button class="btn btn-secondary btn-sm" @click="carregarEstoque" :disabled="loadingEstoque">
          <span v-if="loadingEstoque" class="spinner"></span>
          <i v-else class="fas fa-sync-alt"></i>
          Atualizar
        </button>
        <button class="btn btn-primary btn-sm" @click="exportarPDFEstoque" :disabled="estoquesFiltrado.length === 0">
          <i class="fas fa-file-pdf"></i>
          Gerar PDF
        </button>
      </div>

      <div v-if="loadingEstoque" class="table-loading-row">
        <span class="spinner"></span> Carregando estoque...
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EPI</th>
              <th>Categoria</th>
              <th class="text-center">CA</th>
              <th class="text-center">Validade CA</th>
              <th class="text-center">Qtd</th>
              <th class="text-center">Nível</th>
              <th class="text-center">Cadastrado em</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="estoquesFiltrado.length === 0">
              <td colspan="7" class="text-center empty-row">
                <i class="fas fa-inbox"></i>
                <p>Nenhum EPI encontrado para os filtros aplicados.</p>
              </td>
            </tr>
            <tr v-else v-for="item in estoquesFiltrado" :key="item.id"
                :class="{ 'row-critico': item.quantidade <= 0, 'row-baixo': item.quantidade > 0 && item.quantidade < 10 }">
              <td><strong>{{ item.nome }}</strong></td>
              <td><span class="categoria-tag">{{ item.categoria || '—' }}</span></td>
              <td class="text-center">
                <span v-if="item.ca" class="ca-tag">CA {{ item.ca }}</span>
                <span v-else class="text-soft">—</span>
              </td>
              <td class="text-center">
                <span v-if="item.validade" :class="['badge-validade', validadeEstoqueClass(item.validade)]">
                  {{ validadeEstoqueLabel(item.validade) }}
                </span>
                <span v-else class="text-soft">—</span>
              </td>
              <td class="text-center td-qty-estoque">{{ item.quantidade }}</td>
              <td class="text-center">
                <span :class="['badge', statusEstoque(item.quantidade).cls]">
                  {{ statusEstoque(item.quantidade).label }}
                </span>
              </td>
              <td class="text-center td-date">{{ item.created_at ? formatarData(item.created_at) : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Registros de Entrega -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-icon"><i class="fas fa-list"></i></div>
        <div class="card-header-text">
          <h2>Histórico de Movimentações</h2>
          <p>{{ entregas.length }} registro{{ entregas.length !== 1 ? 's' : '' }} encontrado{{ entregas.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <div class="filters-bar">
        <div class="field">
          <div class="select-wrap">
            <select v-model="filtros.funcionario" @change="buscarEntregas">
              <option value="">Todos os funcionários</option>
              <option v-for="f in funcionarios" :key="f.id" :value="f.nome">{{ f.nome }}</option>
            </select>
          </div>
        </div>
        <div class="field">
          <div class="select-wrap">
            <select v-model="filtros.tipo" @change="buscarEntregas">
              <option value="">Entrega e devolução</option>
              <option value="entrega">↓ Entrega</option>
              <option value="devolucao">↑ Devolução</option>
            </select>
          </div>
        </div>
        <div class="field">
          <div class="select-wrap">
            <select v-model="filtros.assinatura" @change="buscarEntregas">
              <option value="">Todas as assinaturas</option>
              <option value="true">✓ Confirmada</option>
              <option value="false">⏳ Pendente</option>
            </select>
          </div>
        </div>
        <div class="field">
          <input type="date" v-model="filtros.data_inicio" @change="buscarEntregas" />
        </div>
        <div class="field">
          <input type="date" v-model="filtros.data_fim" @change="buscarEntregas" />
        </div>
        <button class="btn btn-ghost btn-sm" @click="limparFiltros">↺ Limpar</button>
        <button class="btn btn-secondary btn-sm" @click="buscarEntregas" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <i v-else class="fas fa-sync-alt"></i>
          Atualizar
        </button>
        <button class="btn btn-primary btn-sm" @click="exportarPDF" :disabled="entregas.length === 0">
          <i class="fas fa-file-pdf"></i>
          Gerar PDF
        </button>
      </div>

      <div v-if="loading" class="table-loading-row">
        <span class="spinner"></span> Carregando registros...
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Funcionário</th>
              <th>EPI</th>
              <th class="text-center">Validade CA</th>
              <th class="text-center">Tipo</th>
              <th class="text-center">Qtd</th>
              <th class="text-center">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="entregas.length === 0">
              <td colspan="7" class="text-center empty-row">
                <i class="fas fa-inbox"></i>
                <p>Nenhum registro encontrado para este filtro.</p>
              </td>
            </tr>
            <tr v-else v-for="e in entregas" :key="e.id">
              <td class="td-date">{{ formatarData(e.data) }}</td>
              <td><strong>{{ e.funcionario || 'Não informado' }}</strong></td>
              <td>{{ e.epis?.nome || 'EPI não vinculado' }}<span v-if="e.epis?.ca" class="ca-tag">CA {{ e.epis.ca }}</span></td>
              <td class="text-center">
                <span v-if="e.epis?.validade" :class="['badge-validade', validadeEstoqueClass(e.epis.validade)]">
                  {{ validadeEstoqueLabel(e.epis.validade) }}
                </span>
                <span v-else class="text-soft">—</span>
              </td>
              <td class="text-center">
                <span :class="['badge-tipo', e.tipo === 'entrega' ? 'tipo-entrega' : 'tipo-devolucao']">
                  {{ e.tipo === 'entrega' ? '↓ Entrega' : '↑ Devolução' }}
                </span>
              </td>
              <td class="text-center">{{ e.quantidade }}</td>
              <td class="text-center">
                <span :class="e.assinatura_confirmada ? 'badge badge-ok' : 'badge badge-warn'">
                  {{ e.assinatura_confirmada ? '✓ Assinado' : '⏳ Pendente' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Erro global -->
    <div v-if="apiError" class="api-error">
      <i class="fas fa-exclamation-triangle"></i> {{ apiError }}
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const { supabase } = useSupabase()

// ─── Estado ────────────────────────────────────────────────────────────────
const entregas           = ref([])
const funcionarios       = ref([])
const estoqueProcessado  = ref([])
const loading            = ref(false)
const loadingEstoque     = ref(false)
const apiError           = ref('')

const pieCanvas = ref(null)
const barCanvas = ref(null)
let   pieChart  = null
let   barChart  = null

const filtros = ref({
  funcionario:  '',
  tipo:         '',
  data_inicio:  '',
  data_fim:     '',
  assinatura:   '',
})

const filtroCategoria   = ref('')
const filtroNome        = ref('')
const filtroStatus      = ref('')
const filtroValidade    = ref('')
const filtroDataInicio  = ref('')
const filtroDataFim     = ref('')

// ─── Computed ──────────────────────────────────────────────────────────────
const totalEntregas      = computed(() => entregas.value.length)
const totalAssinados     = computed(() => entregas.value.filter(e => e.assinatura_confirmada).length)
const totalPendentes     = computed(() => entregas.value.filter(e => !e.assinatura_confirmada).length)
const totalEstoqueCritico = computed(() => estoqueProcessado.value.filter(i => i.quantidade <= 5).length)
const estoquesFiltrado = computed(() =>
  estoqueProcessado.value.filter(item => {
    if (filtroNome.value && !item.nome.toLowerCase().includes(filtroNome.value.toLowerCase())) return false
    if (filtroCategoria.value && item.categoria !== filtroCategoria.value) return false
    if (filtroStatus.value === 'ok'       && !(item.quantidade >= 10))                           return false
    if (filtroStatus.value === 'baixo'    && !(item.quantidade > 0 && item.quantidade < 10))     return false
    if (filtroStatus.value === 'esgotado' && !(item.quantidade <= 0))                            return false
    if (filtroValidade.value === 'sem' && item.validade)                                         return false
    if (filtroValidade.value && filtroValidade.value !== 'sem' && !item.validade)                return false
    if (item.validade && filtroValidade.value && filtroValidade.value !== 'sem') {
      const diff = (new Date(item.validade + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24)
      if (filtroValidade.value === 'ok'      && !(diff > 30))                return false
      if (filtroValidade.value === 'alerta'  && !(diff >= 0 && diff <= 30)) return false
      if (filtroValidade.value === 'vencida' && !(diff < 0))                 return false
    }
    if (filtroDataInicio.value && item.created_at) {
      if (new Date(item.created_at) < new Date(filtroDataInicio.value + 'T00:00:00')) return false
    }
    if (filtroDataFim.value && item.created_at) {
      if (new Date(item.created_at) > new Date(filtroDataFim.value + 'T23:59:59')) return false
    }
    return true
  })
)

// ─── Fetch ─────────────────────────────────────────────────────────────────
async function carregarFuncionarios() {
  const { data } = await supabase
    .from('profiles')
    .select('id, nome')
    .eq('ativo', true)
    .not('nome', 'is', null)
    .neq('nome', '')
    .order('nome')
  funcionarios.value = data || []
}

async function carregarEstoque() {
  loadingEstoque.value = true
  try {
    const { data } = await supabase
      .from('epis')
      .select('id, nome, categoria, ca, validade, quantidade, created_at')
      .order('nome')
    estoqueProcessado.value = (data || []).map(item => ({
      ...item,
      epi_id:   item.id,
      nome_epi: item.nome,
    }))
    await nextTick()
    renderCharts()
  } catch (e) {
    console.error('Erro estoque:', e)
  } finally {
    loadingEstoque.value = false
  }
}

async function buscarEntregas() {
  loading.value  = true
  apiError.value = ''
  try {
    let query = supabase
      .from('movimentacoes')
      .select('*, epis(nome, ca, validade)')
      .order('data', { ascending: false })

    if (filtros.value.funcionario)       query = query.eq('funcionario', filtros.value.funcionario)
    if (filtros.value.tipo)              query = query.eq('tipo', filtros.value.tipo)
    if (filtros.value.data_inicio)       query = query.gte('data', filtros.value.data_inicio)
    if (filtros.value.data_fim)          query = query.lte('data', filtros.value.data_fim)
    if (filtros.value.assinatura !== '') query = query.eq('assinatura_confirmada', filtros.value.assinatura === 'true')

    const { data, error } = await query
    if (error) throw error
    entregas.value = data || []
  } catch (e) {
    apiError.value = 'Erro ao buscar registros: ' + e.message
  } finally {
    loading.value = false
  }
}

const buscarTudo = () => { carregarEstoque(); buscarEntregas() }

function limparFiltros() {
  filtros.value = { funcionario: '', tipo: '', data_inicio: '', data_fim: '', assinatura: '' }
  buscarEntregas()
}

function limparFiltrosEstoque() {
  filtroNome.value       = ''
  filtroCategoria.value  = ''
  filtroStatus.value     = ''
  filtroValidade.value   = ''
  filtroDataInicio.value = ''
  filtroDataFim.value    = ''
}

// ─── Gráficos ──────────────────────────────────────────────────────────────
async function renderCharts() {
  let Chart
  try {
    const m = await import('chart.js/auto')
    Chart = m.default
  } catch {
    return
  }
  const data = estoqueProcessado.value

  const ok      = data.filter(i => i.quantidade >= 10).length
  const baixo   = data.filter(i => i.quantidade > 0 && i.quantidade < 10).length
  const esgotado = data.filter(i => i.quantidade <= 0).length

  // Pizza
  if (pieChart) pieChart.destroy()
  if (pieCanvas.value) {
    pieChart = new Chart(pieCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['Estoque OK', 'Estoque Baixo', 'Esgotado'],
        datasets: [{
          data: [ok, baixo, esgotado],
          backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
          borderColor: '#161B27',
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#CBD5E1', font: { size: 12 } } },
        },
        cutout: '65%',
      },
    })
  }

  // Barras
  const criticos = [...data].sort((a, b) => a.quantidade - b.quantidade).slice(0, 6)
  if (barChart) barChart.destroy()
  if (barCanvas.value) {
    barChart = new Chart(barCanvas.value, {
      type: 'bar',
      data: {
        labels: criticos.map(i => i.nome_epi),
        datasets: [{
          label: 'Qtd em Estoque',
          data: criticos.map(i => i.quantidade),
          backgroundColor: criticos.map(i =>
            i.quantidade <= 0 ? '#EF4444' : i.quantidade < 10 ? '#F59E0B' : '#3B82F6'
          ),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { ticks: { color: '#94A3B8', font: { size: 11 } }, grid: { color: '#1E293B' } },
          y: { ticks: { color: '#94A3B8' }, grid: { color: '#1E293B' }, beginAtZero: true },
        },
      },
    })
  }
}

// ─── PDF ───────────────────────────────────────────────────────────────────
async function exportarPDF() {
  let jsPDF, autoTable
  try {
    jsPDF     = (await import('jspdf')).default
    autoTable = (await import('jspdf-autotable')).default
  } catch {
    alert('jsPDF não instalado. Execute: npm install jspdf jspdf-autotable')
    return
  }

  const doc = new jsPDF()

  // Cabeçalho
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Relatório de Entregas de EPI', 14, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28)
  doc.text(`Total de registros: ${entregas.value.length}`, 14, 35)

  // Tabela
  autoTable(doc, {
    startY: 48,
    head: [['Data', 'Funcionário', 'EPI / CA', 'Validade CA', 'Tipo', 'Qtd', 'Assinatura']],
    body: entregas.value.map(e => [
      formatarData(e.data),
      e.funcionario || 'N/A',
      `${e.epis?.nome || 'N/A'}${e.epis?.ca ? ' (CA: ' + e.epis.ca + ')' : ''}`,
      e.epis?.validade ? validadeEstoqueLabel(e.epis.validade) : '—',
      e.tipo === 'entrega' ? 'Entrega' : 'Devolução',
      e.quantidade,
      e.assinatura_confirmada ? 'SIM' : 'NÃO',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'center' } },
    margin: { left: 14, right: 14 },
  })

  const periodo = filtros.value.data_inicio && filtros.value.data_fim
    ? `${filtros.value.data_inicio}_${filtros.value.data_fim}`
    : 'geral'

  doc.save(`relatorio-epi-${periodo}.pdf`)
}

// ─── PDF Estoque ──────────────────────────────────────────────────────────
async function exportarPDFEstoque() {
  let jsPDF, autoTable
  try {
    jsPDF     = (await import('jspdf')).default
    autoTable = (await import('jspdf-autotable')).default
  } catch {
    alert('jsPDF não instalado. Execute: npm install jspdf jspdf-autotable')
    return
  }

  const doc = new jsPDF()

  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Relatório de Estoque de EPIs', 14, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28)
  doc.text(`Total de itens: ${estoquesFiltrado.value.length}`, 14, 35)

  autoTable(doc, {
    startY: 48,
    head: [['EPI', 'Categoria', 'CA', 'Validade CA', 'Qtd', 'Nível', 'Cadastrado em']],
    body: estoquesFiltrado.value.map(item => [
      item.nome,
      item.categoria || '—',
      item.ca ? `CA ${item.ca}` : '—',
      item.validade ? validadeEstoqueLabel(item.validade) : '—',
      item.quantidade,
      statusEstoque(item.quantidade).label,
      item.created_at ? formatarData(item.created_at) : '—',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 4: { halign: 'center' }, 5: { halign: 'center' }, 6: { halign: 'center' } },
    margin: { left: 14, right: 14 },
  })

  doc.save(`estoque-epis-${new Date().toISOString().split('T')[0]}.pdf`)
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatarData = (d) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'

function statusEstoque(qtd) {
  if (qtd <= 0) return { label: 'Esgotado', cls: 'badge-esgotado' }
  if (qtd < 10) return { label: 'Baixo',    cls: 'badge-baixo' }
  return               { label: 'OK',       cls: 'badge-estok-ok' }
}

function validadeEstoqueClass(date) {
  if (!date) return ''
  const diff = (new Date(date + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0)   return 'val-vencida'
  if (diff <= 30) return 'val-alerta'
  return 'val-ok'
}

function validadeEstoqueLabel(date) {
  return date ? new Date(date + 'T00:00:00').toLocaleDateString('pt-BR') : '—'
}

// ─── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  carregarFuncionarios()
  buscarTudo()
})
</script>

<style scoped>
/* ── Variáveis ──────────────────────────────────────────────────────────── */
.relatorios-page {
  --blue:       #1E3A8A;
  --blue-mid:   #3B82F6;
  --blue-light: rgba(30,58,138,0.35);
  --ink:        #F8FAFC;
  --ink-mid:    #CBD5E1;
  --ink-soft:   #94A3B8;
  --surface:    #0A0A0A;
  --surface-2:  #111827;
  --card-bg:    #161B27;
  --border:     #1E293B;
  --green:      #22C55E;
  --yellow:     #F59E0B;
  --red:        #EF4444;

  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  color: var(--ink);
  padding: 32px 24px 60px;
  min-height: 100vh;
  background: var(--surface);
}

/* ── Header ─────────────────────────────────────────────────────────────── */
.page-header { margin-bottom: 28px; }

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

/* ── Summary cards ──────────────────────────────────────────────────────── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

@media (max-width: 900px) { .summary-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .summary-grid { grid-template-columns: 1fr; } }

.summary-card {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
}

.summary-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex-shrink: 0;
}

.summary-icon.blue   { background: rgba(30,58,138,0.35);  color: var(--blue-mid); }
.summary-icon.green  { background: rgba(34,197,94,0.2);   color: var(--green); }
.summary-icon.yellow { background: rgba(245,158,11,0.2);  color: var(--yellow); }
.summary-icon.red    { background: rgba(239,68,68,0.2);   color: var(--red); }

.summary-text { display: flex; flex-direction: column; gap: 2px; }
.summary-value { font-size: 26px; font-weight: 800; line-height: 1; color: var(--ink); }
.summary-label { font-size: 11px; color: var(--ink-soft); }

/* ── Charts ─────────────────────────────────────────────────────────────── */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 700px) { .charts-grid { grid-template-columns: 1fr; } }

.chart-card {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both;
}

.card-header-simple {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: #0F172A;
}

.card-header-simple h3 {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}

.card-header-simple .card-header-icon {
  width: 32px;
  height: 32px;
  background: var(--blue);
  border-radius: 7px;
  display: grid;
  place-items: center;
  font-size: 13px;
  color: white;
  flex-shrink: 0;
}

.chart-box {
  padding: 20px;
  height: 240px;
  position: relative;
}

.chart-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--card-bg);
}

.chart-placeholder p { font-size: 13px; color: var(--ink-soft); }

/* ── Card genérico ───────────────────────────────────────────────────────── */
.card {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  animation: slideUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s both;
}

.card-header {
  background: #0F172A;
  padding: 16px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-header-icon {
  width: 36px;
  height: 36px;
  background: var(--blue);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.card-header-text h2 {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}

.card-header-text p {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  margin-top: 2px;
}

.card-body { padding: 22px; }

/* ── Filtros ─────────────────────────────────────────────────────────────── */
.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 18px;
}

@media (max-width: 800px) { .filter-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .filter-grid { grid-template-columns: 1fr; } }

.field { display: flex; flex-direction: column; gap: 5px; }

label { font-size: 12px; font-weight: 500; color: var(--ink-mid); }

select,
input[type="date"] {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink);
  background: var(--surface-2);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

select { cursor: pointer; padding-right: 30px; }
select option { background: #1e293b; }

select:focus, input[type="date"]:focus {
  border-color: var(--blue-mid);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}

.select-wrap { position: relative; }
.select-wrap::after {
  content: '▾';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-soft);
  font-size: 12px;
  pointer-events: none;
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* ── Botões ──────────────────────────────────────────────────────────────── */
.btn {
  height: 40px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: inline-flex;
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

.btn-secondary {
  background: var(--surface-2);
  color: var(--ink-mid);
  border: 1.5px solid var(--border);
}
.btn-secondary:hover:not(:disabled) { border-color: var(--blue-mid); color: var(--ink); }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

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
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Tabela ──────────────────────────────────────────────────────────────── */
.table-wrap { overflow-x: auto; }

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

thead tr {
  background: #0F172A;
  border-bottom: 2px solid var(--border);
}

th {
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
  white-space: nowrap;
}

td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--ink-mid);
  vertical-align: middle;
}

tbody tr { transition: background 0.15s; }
tbody tr:hover { background: rgba(30,58,138,0.08); }
tbody tr:last-child td { border-bottom: none; }

td strong { color: var(--ink); font-weight: 600; }

.td-date { color: var(--ink-soft); font-size: 12px; white-space: nowrap; }

.ca-tag {
  display: inline-block;
  margin-left: 6px;
  font-size: 10px;
  color: #93C5FD;
  background: rgba(30,58,138,0.3);
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.text-center { text-align: center; }

.loading-row,
.empty-row {
  color: var(--ink-soft);
  padding: 36px 16px !important;
}

.empty-row {
  display: table-cell;
  text-align: center;
}

.empty-row i { font-size: 28px; opacity: 0.3; display: block; margin-bottom: 8px; }
.empty-row p { margin: 0; font-size: 13px; }

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
}

.badge-ok   { background: rgba(34,197,94,0.15);  color: #4ADE80; border: 1px solid rgba(34,197,94,0.3); }
.badge-warn { background: rgba(245,158,11,0.15); color: #FCD34D; border: 1px solid rgba(245,158,11,0.3); }

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

/* ── Spinners ────────────────────────────────────────────────────────────── */
.spinner {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.spinner-lg {
  width: 28px;
  height: 28px;
  border: 3px solid var(--border);
  border-top-color: var(--blue-mid);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: block;
}

/* ── Animations ──────────────────────────────────────────────────────────── */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Barra de filtros (estoque e movimentações) ──────────────────────────── */
.filters-bar {
  display: flex;
  gap: 10px;
  padding: 14px 22px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
  background: rgba(15,23,42,0.3);
  align-items: center;
}

.filters-bar .field        { flex: 1; min-width: 150px; }
.filters-bar .search-field { flex: 2; min-width: 200px; }

.filters-bar input[type="text"],
.filters-bar input[type="date"] {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink);
  background: var(--surface-2);
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.filters-bar input:focus {
  border-color: var(--blue-mid);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}

.filters-bar select { height: 38px; font-size: 13px; }

.btn-sm { height: 36px; padding: 0 14px; font-size: 12px; white-space: nowrap; flex-shrink: 0; }

/* ── Resumo de movimentações ─────────────────────────────────────────────── */
.mov-summary {
  display: flex;
  gap: 12px;
  padding: 16px 22px;
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}

.mov-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid;
}

.mov-chip.blue   { background: rgba(59,130,246,0.08);  border-color: rgba(59,130,246,0.2);  color: #60a5fa; }
.mov-chip.purple { background: rgba(168,85,247,0.08);  border-color: rgba(168,85,247,0.2);  color: #c084fc; }
.mov-chip.red    { background: rgba(239,68,68,0.08);   border-color: rgba(239,68,68,0.2);   color: #f87171; }

.mov-chip-value { font-size: 22px; font-weight: 800; }
.mov-chip-label { font-size: 11px; opacity: 0.8; }

/* ── Badge tipo movimentação ─────────────────────────────────────────────── */
.badge-tipo {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.tipo-entrega   { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }
.tipo-devolucao { background: rgba(168,85,247,0.12); color: #c084fc; border: 1px solid rgba(168,85,247,0.25); }

.td-obs { color: var(--ink-soft); max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── Destaque de linhas críticas ─────────────────────────────────────────── */
.row-critico { background: rgba(239,68,68,0.04) !important; }
.row-baixo   { background: rgba(245,158,11,0.04) !important; }

/* ── Tabela de Estoque ───────────────────────────────────────────────────── */
.table-loading-row {
  padding: 32px 24px;
  text-align: center;
  color: var(--ink-soft);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.categoria-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-mid);
  background: rgba(30,41,59,0.8);
  border: 1px solid var(--border);
  padding: 2px 8px;
  border-radius: 4px;
}

.td-qty-estoque { font-weight: 700; color: var(--ink); font-size: 14px; }

.text-soft { color: var(--ink-soft); font-size: 12px; }

.badge-validade {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Courier New', monospace;
}

.val-ok      { background: rgba(34,197,94,0.12);  color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
.val-alerta  { background: rgba(245,158,11,0.12); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
.val-vencida { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

.badge-esgotado { background: rgba(239,68,68,0.15);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
.badge-baixo    { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
.badge-estok-ok { background: rgba(34,197,94,0.15);  color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
</style>