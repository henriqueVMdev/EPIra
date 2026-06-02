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
          <button class="btn btn-ghost" type="button" @click="limpar">↺ {{ editingId ? 'Cancelar' : 'Limpar' }}</button>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="submitting"
            @click="cadastrar"
          >
            <span v-if="submitting" class="spinner"></span>
            <span v-else>✓</span>
            {{ submitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Cadastrar EPI' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Alertas de Validade -->
    <div v-if="alertas.length > 0" class="alertas-card">
      <div class="alertas-header">
        <div class="alertas-icon">⚠️</div>
        <div class="alertas-header-text">
          <h2>Alertas de Validade (CA)</h2>
          <p>{{ alertas.length }} EPI{{ alertas.length !== 1 ? 's' : '' }} requer{{ alertas.length === 1 ? '' : 'em' }} atenção imediata</p>
        </div>
      </div>
      <div class="alertas-lista">
        <div
          v-for="epi in alertas"
          :key="epi.id"
          class="alerta-item"
          :class="epi._status === 'vencido' ? 'alerta-vencido' : 'alerta-alerta'"
        >
          <div class="alerta-left">
            <span class="alerta-badge" :class="epi._status === 'vencido' ? 'badge-vencido' : 'badge-alerta'">
              {{ epi._status === 'vencido' ? 'VENCIDO' : 'VENCE EM BREVE' }}
            </span>
            <span class="alerta-nome">{{ epi.nome }}</span>
            <span v-if="epi.ca" class="alerta-ca">CA {{ epi.ca }}</span>
          </div>
          <div class="alerta-right">
            <span class="alerta-data">{{ new Date(epi.validade + 'T00:00:00').toLocaleDateString('pt-BR') }}</span>
            <span class="alerta-dias" :class="epi._status === 'vencido' ? 'dias-vencido' : 'dias-alerta'">
              {{ epi._dias < 0 ? Math.abs(epi._dias) + (Math.abs(epi._dias) === 1 ? ' dia atrás' : ' dias atrás') : epi._dias + (epi._dias === 1 ? ' dia restante' : ' dias restantes') }}
            </span>
            <button class="btn-alerta-edit" @click="editRecord(epi)">Atualizar CA</button>
          </div>
        </div>
      </div>
      <div class="alertas-legenda">
        <span class="legenda-item">
          <span class="legenda-cor cor-vencido"></span> Vencido — CA já passou da data de validade
        </span>
        <span class="legenda-item">
          <span class="legenda-cor cor-alerta"></span> Vence em breve — CA vence nos próximos 30 dias
        </span>
      </div>
    </div>

    <!-- Tabela de EPIs cadastrados -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-header-icon">📦</div>
        <div class="table-header-text">
          <h2>EPIs Cadastrados</h2>
          <p>Estoque atual de equipamentos registrados no sistema</p>
        </div>
        <span class="epi-count">{{ epis.length }} item{{ epis.length !== 1 ? 's' : '' }}</span>
      </div>

      <div v-if="loadingEpis" class="table-loading">
        <span class="spinner"></span> Carregando...
      </div>

      <div v-else-if="epis.length === 0" class="table-empty">
        Nenhum EPI cadastrado ainda.
      </div>

      <template v-else>
        <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>CA</th>
              <th>Validade</th>
              <th class="col-qty">Estoque</th>
              <th>Observações</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="epi in epis" :key="epi.id" :class="epi.quantidade === 0 ? 'row-zero' : epi.quantidade <= 5 ? 'row-low' : ''">
              <td class="td-nome">{{ epi.nome }}</td>
              <td><span class="badge-categoria">{{ epi.categoria }}</span></td>
              <td class="td-mono">{{ epi.ca || '—' }}</td>
              <td class="td-mono">{{ epi.validade ? new Date(epi.validade + 'T00:00:00').toLocaleDateString('pt-BR') : '—' }}</td>
              <td class="col-qty">
                <span class="badge-qty" :class="epi.quantidade === 0 ? 'qty-zero' : epi.quantidade <= 5 ? 'qty-low' : 'qty-ok'">
                  {{ epi.quantidade }}
                </span>
              </td>
              <td class="td-obs">{{ epi.obs || '—' }}</td>
              <td class="td-actions">
                <button class="btn-edit" @click="editRecord(epi)"><i class="fas fa-pencil-alt"></i> Editar</button>
                <button class="btn-delete" @click="confirmDelete(epi)"><i class="fas fa-trash-alt"></i> Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <div class="table-legenda">
          <span class="legenda-item">
            <span class="legenda-cor cor-ok"></span> Estoque normal (&gt; 5)
          </span>
          <span class="legenda-item">
            <span class="legenda-cor cor-low"></span> Estoque baixo (1–5)
          </span>
          <span class="legenda-item">
            <span class="legenda-cor cor-zero"></span> Sem estoque (0)
          </span>
        </div>
      </template>
    </div>

    <!-- Erro global de API -->
    <div v-if="apiError" class="api-error">
      ⚠ {{ apiError }}
    </div>

    <!-- Modal de Edição -->
    <Transition name="fade">
      <div v-if="showEditModal" class="success-overlay" @click="closeEditModal">
        <div class="edit-modal" @click.stop>
          <div class="edit-modal-header">
            <div class="card-header-icon" style="font-size:16px">✏️</div>
            <div class="edit-modal-title">
              <h3>Editar EPI</h3>
              <p>Altere os dados e salve as alterações</p>
            </div>
            <button class="modal-close-btn" @click="closeEditModal">✕</button>
          </div>

          <div class="edit-modal-body">
            <div class="field" :class="{ invalid: errors.nome }">
              <label>Nome do EPI <span class="required">*</span></label>
              <input type="text" v-model="form.nome" @input="errors.nome = ''" />
              <span class="field-error">{{ errors.nome }}</span>
            </div>

            <div class="field-grid field-grid-2" style="margin-top:14px">
              <div class="field" :class="{ invalid: errors.categoria }">
                <label>Categoria <span class="required">*</span></label>
                <div class="select-wrap">
                  <select v-model="form.categoria" @change="errors.categoria = ''">
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
                <label>Número do CA</label>
                <input type="text" v-model="form.ca" placeholder="Ex: 12345" />
              </div>
            </div>

            <div class="field-grid field-grid-2" style="margin-top:14px">
              <div class="field">
                <label>Validade do CA</label>
                <input type="date" v-model="form.validade" />
              </div>
              <div class="field" :class="{ invalid: errors.quantidade }">
                <label>Quantidade em Estoque <span class="required">*</span></label>
                <div class="qty-wrap">
                  <button type="button" class="qty-btn" @click="decQty">−</button>
                  <input type="number" v-model.number="form.quantidade" min="0" max="9999" @input="errors.quantidade = ''" />
                  <button type="button" class="qty-btn" @click="incQty">+</button>
                </div>
                <span class="field-error">{{ errors.quantidade }}</span>
              </div>
            </div>

            <div class="field" style="margin-top:14px">
              <label>Observações</label>
              <textarea v-model="form.obs" placeholder="Informações adicionais..." style="min-height:60px" />
            </div>

            <div v-if="apiError" class="api-error" style="margin-top:12px">⚠ {{ apiError }}</div>
          </div>

          <div class="edit-modal-footer">
            <button class="btn btn-ghost" @click="closeEditModal">Cancelar</button>
            <button class="btn btn-primary" @click="cadastrar" :disabled="submitting">
              <span v-if="submitting" class="spinner"></span>
              <span v-else>✓</span>
              {{ submitting ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

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

    <!-- Modal de confirmação de exclusão -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="success-overlay" @click="cancelDelete">
        <div class="delete-modal" @click.stop>
          <div class="delete-modal-icon"><i class="fas fa-trash-alt"></i></div>
          <h3>Excluir EPI</h3>
          <p>Tem certeza que deseja excluir <strong>{{ deletingItem?.nome }}</strong>? Esta ação não pode ser desfeita.</p>
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

  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const { supabase } = useSupabase()

const submitting      = ref(false)
const showSuccess     = ref(false)
const showEditModal   = ref(false)
const showDeleteModal = ref(false)
const deletingItem    = ref(null)
const deleting        = ref(false)
const apiError      = ref('')
const epis          = ref([])
const loadingEpis   = ref(false)
const editingId     = ref(null)

async function fetchEpis() {
  loadingEpis.value = true
  const { data, error } = await supabase
    .from('epis')
    .select('id, nome, categoria, ca, validade, quantidade, obs')
    .order('nome', { ascending: true })
  if (error) {
    apiError.value = 'Erro ao carregar EPIs: ' + error.message
  } else {
    epis.value = data ?? []
  }
  loadingEpis.value = false
}

onMounted(fetchEpis)

const alertas = computed(() => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return epis.value
    .filter(e => e.validade)
    .map(e => {
      const val  = new Date(e.validade + 'T00:00:00')
      const diff = Math.ceil((val - hoje) / (1000 * 60 * 60 * 24))
      return { ...e, _dias: diff, _status: diff < 0 ? 'vencido' : 'alerta' }
    })
    .filter(e => e._dias <= 30)
    .sort((a, b) => a._dias - b._dias)
})

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
    const payload = {
      nome:       form.nome.trim(),
      categoria:  form.categoria,
      ca:         form.ca.trim() || null,
      validade:   form.validade  || null,
      quantidade: Number(form.quantidade) || 0,
      obs:        form.obs.trim() || null,
    }

    let error
    if (editingId.value) {
      ;({ error } = await supabase.from('epis').update(payload).eq('id', editingId.value))
    } else {
      ;({ error } = await supabase.from('epis').insert([payload]))
    }

    if (error) throw error
    showSuccess.value = true
  } catch (e) {
    apiError.value = 'Erro ao salvar EPI: ' + e.message
  } finally {
    submitting.value = false
  }
}

function editRecord(epi) {
  Object.assign(form, {
    nome:       epi.nome,
    categoria:  epi.categoria,
    ca:         epi.ca || '',
    validade:   epi.validade || '',
    quantidade: epi.quantidade,
    obs:        epi.obs || '',
  })
  Object.keys(errors).forEach(k => (errors[k] = ''))
  editingId.value     = epi.id
  apiError.value      = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  limpar()
}

function limpar() {
  Object.assign(form, initialForm())
  Object.keys(errors).forEach(k => (errors[k] = ''))
  apiError.value  = ''
  editingId.value = null
}

function closeSuccess() {
  showSuccess.value   = false
  showEditModal.value = false
  editingId.value     = null
  limpar()
  fetchEpis()
}

function confirmDelete(epi) {
  deletingItem.value    = epi
  showDeleteModal.value = true
}

async function executeDelete() {
  if (!deletingItem.value) return
  deleting.value = true
  try {
    const { error } = await supabase.from('epis').delete().eq('id', deletingItem.value.id)
    if (error) throw error
    showDeleteModal.value = false
    deletingItem.value    = null
    await fetchEpis()
  } catch (e) {
    apiError.value = 'Erro ao excluir: ' + e.message
  } finally {
    deleting.value = false
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  deletingItem.value    = null
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

/* ── Alertas de Validade ─────────────────────────────────────────────────── */
.alertas-card {
  background: var(--card-bg);
  border: 1.5px solid rgba(239, 68, 68, 0.35);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(239, 68, 68, 0.1);
  margin-bottom: 28px;
  animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
}

.alertas-header {
  background: rgba(239, 68, 68, 0.08);
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.alertas-icon {
  width: 38px;
  height: 38px;
  background: rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex-shrink: 0;
}

.alertas-header-text h2 {
  font-size: 15px;
  font-weight: 700;
  color: #fca5a5;
  margin: 0;
}

.alertas-header-text p {
  font-size: 11px;
  color: rgba(252, 165, 165, 0.6);
  margin-top: 2px;
}

.alertas-lista {
  display: flex;
  flex-direction: column;
}

.alerta-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  border-bottom: 1px solid rgba(30, 41, 59, 0.6);
  flex-wrap: wrap;
  transition: background 0.15s;
}

.alerta-item:last-child { border-bottom: none; }

.alerta-vencido { border-left: 3px solid #ef4444; }
.alerta-vencido:hover { background: rgba(239, 68, 68, 0.05); }

.alerta-alerta { border-left: 3px solid #f59e0b; }
.alerta-alerta:hover { background: rgba(245, 158, 11, 0.05); }

.alerta-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

.alerta-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-vencido { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.35); }
.badge-alerta  { background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.35); }

.alerta-nome {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}

.alerta-ca {
  font-size: 11px;
  color: var(--ink-soft);
  font-family: 'Courier New', monospace;
}

.alerta-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.alerta-data {
  font-size: 13px;
  font-family: 'Courier New', monospace;
  color: var(--ink-mid);
}

.alerta-dias {
  font-size: 12px;
  font-weight: 600;
}

.dias-vencido { color: #f87171; }
.dias-alerta  { color: #fbbf24; }

.btn-alerta-edit {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.1);
  color: var(--blue-mid);
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-alerta-edit:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: var(--blue-mid);
}

.alertas-legenda {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 24px;
  background: rgba(15, 23, 42, 0.4);
  border-top: 1px solid rgba(239, 68, 68, 0.15);
  flex-wrap: wrap;
}

.alertas-legenda .legenda-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--ink-soft);
}

.alertas-legenda .legenda-cor {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.cor-vencido { background: rgba(239, 68, 68, 0.4);  border: 1px solid #ef4444; }
.cor-alerta  { background: rgba(245, 158, 11, 0.4); border: 1px solid #f59e0b; }

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

/* ── Modal de Edição ─────────────────────────────────────────────────────── */
.edit-modal {
  background: #161B27;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  width: 90%;
  max-width: 520px;
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

.edit-modal-title h3 {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.edit-modal-title p {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  margin-top: 2px;
}

.modal-close-btn {
  width: 28px;
  height: 28px;
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

.modal-close-btn:hover {
  background: rgba(239,68,68,0.1);
  border-color: var(--red);
  color: var(--red);
}

.edit-modal-body { padding: 20px; }

.edit-modal-footer {
  background: var(--surface-2);
  border-top: 1px solid var(--border);
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

/* ── Tabela de EPIs ──────────────────────────────────────────────────────── */
.table-card {
  background: var(--card-bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 32px rgba(0,0,0,0.3);
  margin-bottom: 28px;
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

.epi-count {
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

.table-wrap {
  overflow-x: auto;
}

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

.col-qty { text-align: center; }
.td-nome { font-weight: 600; color: var(--ink); }
.td-mono { font-family: 'Courier New', monospace; font-size: 12px; color: var(--ink-mid); }
.td-obs  { color: var(--ink-soft); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.badge-categoria {
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

.badge-qty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.qty-ok   { background: rgba(34,197,94,0.12);  color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
.qty-low  { background: rgba(234,179,8,0.12);  color: #fbbf24; border: 1px solid rgba(234,179,8,0.25); }
.qty-zero { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

tbody tr.row-low  { background: rgba(234,179,8,0.05);  border-left: 3px solid #fbbf24; }
tbody tr.row-zero { background: rgba(239,68,68,0.07);  border-left: 3px solid #f87171; }
tbody tr.row-low:hover  { background: rgba(234,179,8,0.1); }
tbody tr.row-zero:hover { background: rgba(239,68,68,0.12); }

.table-legenda {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 16px;
  background: rgba(15,23,42,0.4);
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.legenda-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--ink-soft);
}

.legenda-cor {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.cor-ok   { background: rgba(34,197,94,0.4);  border: 1px solid #4ade80; }
.cor-low  { background: rgba(234,179,8,0.4);  border: 1px solid #fbbf24; }
.cor-zero { background: rgba(239,68,68,0.4);  border: 1px solid #f87171; }

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

.delete-modal {
  background: #161B27;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 36px 40px;
  text-align: center;
  max-width: 380px;
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
