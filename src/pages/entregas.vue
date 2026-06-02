<template>
  <div class="epi-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Registro de {{ isDevolucao ? 'Devolução' : 'Entrega' }} de <span>EPI</span></h1>
      <p class="subtitle">Preencha os dados abaixo para registrar a {{ isDevolucao ? 'devolução' : 'entrega' }} do equipamento de proteção individual.</p>
    </div>

    <!-- Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-header-icon">🦺</div>
        <div class="card-header-text">
          <h2>{{ isDevolucao ? 'Ficha de Devolução de EPI' : 'Ficha de Entrega de EPI' }}</h2>
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
              <div class="field" :class="{ invalid: errors.funcionario }">
                <label for="funcionario">Funcionário <span class="required">*</span></label>
                <div class="select-wrap">
                  <select
                    id="funcionario"
                    v-model="form.profile_id"
                    :disabled="loadingFuncionarios"
                    @change="errors.funcionario = ''"
                  >
                    <option value="">
                      {{ loadingFuncionarios ? 'Carregando...' : 'Selecionar funcionário...' }}
                    </option>
                    <option v-for="f in funcionarios" :key="f.id" :value="f.id">
                      {{ f.nome }}
                    </option>
                  </select>
                </div>
                <span class="field-error">{{ errors.funcionario }}</span>
              </div>
            </div>
          </div>

          <!-- Seção: EPI -->
          <div class="section">
            <div class="section-label">Equipamento de Proteção Individual</div>
            <div class="field-grid">

              <div class="field" :class="{ invalid: errors.tipo }">
                <label for="tipo">Tipo de Movimentação <span class="required">*</span></label>
                <div class="select-wrap">
                  <select id="tipo" v-model="form.tipo" @change="errors.tipo = ''">
                    <option value="">Selecionar tipo...</option>
                    <option value="entrega">Entrega</option>
                    <option value="devolucao">Devolução</option>
                  </select>
                </div>
                <span class="field-error">{{ errors.tipo }}</span>
              </div>

              <div v-if="isDevolucao" class="field" :class="{ invalid: errors.condicao }">
                <label for="condicao">Condição do EPI <span class="required">*</span></label>
                <div class="select-wrap">
                  <select id="condicao" v-model="form.condicao" @change="errors.condicao = ''">
                    <option value="">Selecionar condição...</option>
                    <option value="bom">Bom estado</option>
                    <option value="danificado">Danificado</option>
                    <option value="descarte">Para descarte</option>
                  </select>
                </div>
                <span class="field-error">{{ errors.condicao }}</span>
              </div>

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
                  <span class="field-hint">{{ isDevolucao ? 'Unidades devolvidas' : 'Unidades entregues' }}</span>
                  <span class="field-error">{{ errors.quantidade }}</span>
                </div>

                <div class="field" :class="{ invalid: errors.data }">
                  <label for="data">Data <span class="required">*</span></label>
                  <input
                    id="data"
                    type="date"
                    v-model="form.data"
                    @change="errors.data = ''"
                  />
                  <span class="field-hint">Data em que foi realizada a movimentação</span>
                  <span class="field-error">{{ errors.data }}</span>
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
                  {{ isDevolucao
                    ? 'Confirmo que devolvi o(s) EPI(s) listado(s) acima e declaro que as condições informadas são verdadeiras.'
                    : 'Confirmo que recebi o(s) EPI(s) listado(s) acima em perfeito estado de conservação, fui orientado quanto ao seu uso correto e me comprometo a utilizá-lo(s) sempre que necessário.' }}
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
          <button class="btn btn-ghost" type="button" @click="resetForm">↺ {{ editingId ? 'Cancelar' : 'Limpar' }}</button>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="submitting"
            @click="submitForm"
          >
            <span v-if="submitting" class="spinner"></span>
            <span v-else>✓</span>
            {{ submitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : isDevolucao ? 'Registrar Devolução' : 'Registrar Entrega' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela de movimentações -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-header-icon">📋</div>
        <div class="table-header-text">
          <h2>Histórico de Movimentações</h2>
          <p>Registros de entregas e devoluções de EPIs</p>
        </div>
        <span class="mov-count">{{ movimentacoes.length }} registro{{ movimentacoes.length !== 1 ? 's' : '' }}</span>
      </div>

      <div v-if="loadingMovimentacoes" class="table-loading">
        <span class="spinner"></span> Carregando...
      </div>

      <div v-else-if="movimentacoes.length === 0" class="table-empty">
        Nenhuma movimentação registrada ainda.
      </div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Funcionário</th>
              <th class="col-center">Tipo</th>
              <th>EPI</th>
              <th>Validade (CA)</th>
              <th class="col-center">Qtd.</th>
              <th>Data</th>
              <th class="col-center">Assinatura</th>
              <th>Observações</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in movimentacoes" :key="m.id">
              <td class="td-nome">{{ m.funcionario }}</td>
              <td class="col-center">
                <span class="badge-tipo" :class="m.tipo === 'entrega' ? 'tipo-entrega' : 'tipo-devolucao'">
                  {{ m.tipo === 'entrega' ? '↓ Entrega' : '↑ Devolução' }}
                </span>
              </td>
              <td class="td-epi">
                {{ m.epis?.nome ?? '—' }}
                <span v-if="m.epis?.ca" class="td-ca">CA {{ m.epis.ca }}</span>
              </td>
              <td>
                <span v-if="m.epis?.validade" :class="validadeClass(m.epis.validade)" class="badge-validade">
                  {{ formatDate(m.epis.validade) }}
                </span>
                <span v-else class="badge-validade validade-sem">—</span>
              </td>
              <td class="col-center td-qty">{{ m.quantidade }}</td>
              <td class="td-mono">{{ m.data ? new Date(m.data + 'T00:00:00').toLocaleDateString('pt-BR') : '—' }}</td>
              <td class="col-center">
                <span class="badge-ass" :class="m.assinatura_confirmada ? 'ass-ok' : 'ass-no'">
                  {{ m.assinatura_confirmada ? '✓' : '✗' }}
                </span>
              </td>
              <td class="td-obs">{{ m.observacoes || '—' }}</td>
              <td class="td-actions">
                <button class="btn-edit" @click="editRecord(m)"><i class="fas fa-pencil-alt"></i> Editar</button>
                <button class="btn-delete" @click="confirmDelete(m)"><i class="fas fa-trash-alt"></i> Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
              <h3>Editar Movimentação</h3>
              <p>Altere os dados e salve as alterações</p>
            </div>
            <button class="modal-close-btn" @click="closeEditModal">✕</button>
          </div>

          <div class="edit-modal-body">
            <div class="field-grid field-grid-2">
              <div class="field" :class="{ invalid: errors.funcionario }">
                <label>Funcionário <span class="required">*</span></label>
                <div class="select-wrap">
                  <select v-model="form.profile_id" @change="errors.funcionario = ''">
                    <option value="">Selecionar funcionário...</option>
                    <option v-for="f in funcionarios" :key="f.id" :value="f.id">
                      {{ f.nome }}
                    </option>
                  </select>
                </div>
                <span class="field-error">{{ errors.funcionario }}</span>
              </div>

              <div class="field" :class="{ invalid: errors.tipo }">
                <label>Tipo de Movimentação <span class="required">*</span></label>
                <div class="select-wrap">
                  <select v-model="form.tipo" @change="errors.tipo = ''">
                    <option value="">Selecionar tipo...</option>
                    <option value="entrega">Entrega</option>
                    <option value="devolucao">Devolução</option>
                  </select>
                </div>
                <span class="field-error">{{ errors.tipo }}</span>
              </div>
            </div>

            <div v-if="form.tipo === 'devolucao'" class="field" style="margin-top:14px" :class="{ invalid: errors.condicao }">
              <label>Condição do EPI</label>
              <div class="select-wrap">
                <select v-model="form.condicao" @change="errors.condicao = ''">
                  <option value="">Selecionar condição...</option>
                  <option value="bom">Bom estado</option>
                  <option value="danificado">Danificado</option>
                  <option value="descarte">Para descarte</option>
                </select>
              </div>
              <span class="field-error">{{ errors.condicao }}</span>
            </div>

            <div class="field" style="margin-top:14px" :class="{ invalid: errors.epi_id }">
              <label>Tipo de EPI <span class="required">*</span></label>
              <div class="select-wrap">
                <select v-model="form.epi_id" @change="errors.epi_id = ''">
                  <option value="">Selecionar EPI...</option>
                  <option v-for="epi in epis" :key="epi.id" :value="epi.id">
                    {{ epi.nome }}{{ epi.ca ? ' — CA ' + epi.ca : '' }}
                  </option>
                </select>
              </div>
              <span class="field-error">{{ errors.epi_id }}</span>
            </div>

            <div class="field-grid field-grid-2" style="margin-top:14px">
              <div class="field" :class="{ invalid: errors.quantidade }">
                <label>Quantidade <span class="required">*</span></label>
                <div class="qty-wrap">
                  <button type="button" class="qty-btn" @click="decQty">−</button>
                  <input type="number" v-model.number="form.quantidade" min="1" max="999" @input="errors.quantidade = ''" />
                  <button type="button" class="qty-btn" @click="incQty">+</button>
                </div>
                <span class="field-error">{{ errors.quantidade }}</span>
              </div>
              <div class="field" :class="{ invalid: errors.data }">
                <label>Data <span class="required">*</span></label>
                <input type="date" v-model="form.data" @change="errors.data = ''" />
                <span class="field-error">{{ errors.data }}</span>
              </div>
            </div>

            <div class="field" style="margin-top:14px">
              <label>Observações</label>
              <textarea v-model="form.observacoes" placeholder="Observações adicionais..." style="min-height:60px" />
            </div>

            <div
              class="signature-block"
              style="margin-top:14px"
              :class="{ checked: form.assinatura_confirmada }"
              @click="form.assinatura_confirmada = !form.assinatura_confirmada; errors.assinatura_confirmada = ''"
            >
              <div class="sig-checkbox"><span class="sig-checkmark">✓</span></div>
              <div class="sig-text">
                <div class="sig-title">{{ form.assinatura_confirmada ? '✓ Assinatura Digital Confirmada' : 'Assinatura Digital Confirmada' }}</div>
              </div>
              <div class="sig-icon">✍️</div>
            </div>
            <span v-if="errors.assinatura_confirmada" class="field-error" style="display:block;margin-top:6px">{{ errors.assinatura_confirmada }}</span>

            <div v-if="apiError" class="api-error" style="margin-top:12px">⚠ {{ apiError }}</div>
          </div>

          <div class="edit-modal-footer">
            <button class="btn btn-ghost" @click="closeEditModal">Cancelar</button>
            <button class="btn btn-primary" @click="submitForm" :disabled="submitting">
              <span v-if="submitting" class="spinner"></span>
              <span v-else>✓</span>
              {{ submitting ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de confirmação de exclusão -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="success-overlay" @click="cancelDelete">
        <div class="delete-modal" @click.stop>
          <div class="delete-modal-icon"><i class="fas fa-trash-alt"></i></div>
          <h3>Excluir Movimentação</h3>
          <p>
            Tem certeza que deseja excluir o registro de
            <strong>{{ deletingItem?.tipo === 'devolucao' ? 'devolução' : 'entrega' }}</strong>
            de <strong>{{ deletingItem?.epis?.nome || 'EPI' }}</strong>
            para <strong>{{ deletingItem?.funcionario }}</strong>?
            Esta ação não pode ser desfeita.
          </p>
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

    <!-- Modal de sucesso -->
    <Transition name="fade">
      <div v-if="showSuccess" class="success-overlay" @click="closeSuccess">
        <div class="success-card" @click.stop>
          <div class="success-icon">✅</div>
          <h3>{{ lastTipo === 'devolucao' ? 'Devolução Registrada!' : 'Entrega Registrada!' }}</h3>
          <p>{{ lastTipo === 'devolucao' ? 'O registro de devolução do EPI foi salvo com sucesso e o estoque foi atualizado.' : 'O registro de entrega do EPI foi salvo com sucesso e vinculado ao prontuário do funcionário.' }}</p>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const { supabase } = useSupabase()

const funcionarios          = ref([])
const loadingFuncionarios   = ref(false)
const epis                  = ref([])
const loadingEpis           = ref(false)
const submitting            = ref(false)
const showSuccess           = ref(false)
const showEditModal         = ref(false)
const showDeleteModal       = ref(false)
const deletingItem          = ref(null)
const deleting              = ref(false)
const apiError              = ref('')
const docCounter            = ref(1)
const lastProtocol          = ref('')
const lastTipo              = ref('entrega')
const movimentacoes         = ref([])
const loadingMovimentacoes  = ref(false)
const editingId             = ref(null)

const docNumber = computed(() => String(docCounter.value).padStart(6, '0'))

const today = new Date().toISOString().split('T')[0]

const initialForm = () => ({
  funcionario:           '',
  profile_id:            '',
  tipo:                  '',
  epi_id:                '',
  quantidade:            1,
  data:                  today,
  observacoes:           '',
  assinatura_confirmada: false,
  condicao:              '',
})

const form   = reactive(initialForm())
const errors = reactive({
  funcionario:           '',
  tipo:                  '',
  epi_id:                '',
  quantidade:            '',
  data:                  '',
  assinatura_confirmada: '',
  condicao:              '',
})

// ─── Computed ──────────────────────────────────────────────────────────────
const isEntrega   = computed(() => form.tipo !== 'devolucao')
const isDevolucao = computed(() => form.tipo === 'devolucao')

// ─── Lifecycle ─────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([fetchFuncionarios(), fetchEpis(), fetchDocCounter(), fetchMovimentacoes()])
})

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function fetchFuncionarios() {
  loadingFuncionarios.value = true
  try {
    // Lista os usuários que realmente logam (profiles). A entrega é vinculada
    // ao profile_id, para que o EPI apareça em "Meus EPIs" do funcionário.
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome')
      .not('nome', 'is', null)
      .neq('nome', '')
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
      .from('epis')
      .select('id, nome, ca')
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
  const { count } = await supabase
    .from('movimentacoes')
    .select('id', { count: 'exact', head: true })
  docCounter.value = (count ?? 0) + 1
}

async function fetchMovimentacoes() {
  loadingMovimentacoes.value = true
  const { data, error } = await supabase
    .from('movimentacoes')
    .select('id, funcionario, profile_id, tipo, quantidade, data, assinatura_confirmada, observacoes, epis(nome, ca, validade)')
    .order('data', { ascending: false })
  if (error) {
    apiError.value = 'Erro ao carregar movimentações: ' + error.message
  } else {
    movimentacoes.value = data ?? []
  }
  loadingMovimentacoes.value = false
}

// ─── Quantidade ────────────────────────────────────────────────────────────

function incQty() { if (form.quantidade < 999) form.quantidade++ }
function decQty() { if (form.quantidade > 1)   form.quantidade-- }

// ─── Validação ─────────────────────────────────────────────────────────────

function validate() {
  let ok = true

  if (!form.profile_id) {
    errors.funcionario = 'Selecione um funcionário.'
    ok = false
  }
  if (!form.tipo) {
    errors.tipo = 'Selecione o tipo de movimentação.'
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
  if (!form.data) {
    errors.data = 'Informe a data.'
    ok = false
  }
  if (!form.assinatura_confirmada) {
    errors.assinatura_confirmada = 'É necessário confirmar a assinatura digital.'
    ok = false
  }
  if (form.tipo === 'devolucao' && !form.condicao) {
    errors.condicao = 'Informe a condição do EPI devolvido.'
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
    const condLabels = { bom: 'Bom estado', danificado: 'Danificado', descarte: 'Para descarte' }
    let obsTexto = form.observacoes || null
    if (form.tipo === 'devolucao' && form.condicao) {
      const label = condLabels[form.condicao]
      obsTexto = `${label}${form.observacoes ? ' — ' + form.observacoes : ''}`
    }

    // Nome do funcionário (profile) selecionado — guardado para exibição na
    // tabela; o vínculo real é o profile_id.
    const profileSel = funcionarios.value.find(f => f.id === form.profile_id)

    const payload = {
      funcionario:           profileSel?.nome ?? form.funcionario.trim(),
      profile_id:            form.profile_id,
      tipo:                  form.tipo,
      epi_id:                form.epi_id,
      quantidade:            form.quantidade,
      data:                  form.data,
      observacoes:           obsTexto,
      assinatura_confirmada: form.assinatura_confirmada,
    }

    let error
    if (editingId.value) {
      ;({ error } = await supabase.from('movimentacoes').update(payload).eq('id', editingId.value))
    } else {
      ;({ error } = await supabase.from('movimentacoes').insert([payload]).select().single())
    }

    if (error) throw error

    // O estoque é ajustado automaticamente pelo trigger trg_mov_estoque no banco
    // (saída em 'entrega', entrada em 'devolucao', com validação de estoque
    // insuficiente). Não atualizar aqui para não descontar em duplicidade.

    lastTipo.value     = form.tipo
    lastProtocol.value = String(docCounter.value).padStart(6, '0')
    showSuccess.value  = true
  } catch (e) {
    apiError.value = 'Erro ao salvar registro: ' + e.message
  } finally {
    submitting.value = false
  }
}

function editRecord(m) {
  Object.assign(form, {
    funcionario:           m.funcionario,
    profile_id:            m.profile_id ?? '',
    tipo:                  m.tipo,
    epi_id:                m.epi_id,
    quantidade:            m.quantidade,
    data:                  m.data,
    observacoes:           m.observacoes || '',
    assinatura_confirmada: m.assinatura_confirmada,
  })
  Object.keys(errors).forEach(k => (errors[k] = ''))
  editingId.value     = m.id
  apiError.value      = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  resetForm()
}

// ─── Validade ──────────────────────────────────────────────────────────────

function formatDate(date) {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

function validadeClass(date) {
  const hoje    = new Date()
  const validade = new Date(date + 'T00:00:00')
  const diff    = (validade - hoje) / (1000 * 60 * 60 * 24)
  if (diff < 0)   return 'validade-vencida'
  if (diff <= 30) return 'validade-alerta'
  return 'validade-ok'
}

// ─── Reset / Fechar modal ──────────────────────────────────────────────────

function resetForm() {
  Object.assign(form, initialForm())
  Object.keys(errors).forEach(k => (errors[k] = ''))
  apiError.value  = ''
  editingId.value = null
}

function closeSuccess() {
  showSuccess.value   = false
  showEditModal.value = false
  if (!editingId.value) docCounter.value++
  editingId.value     = null
  resetForm()
  fetchMovimentacoes()
}

function confirmDelete(m) {
  deletingItem.value    = m
  showDeleteModal.value = true
}

async function executeDelete() {
  if (!deletingItem.value) return
  deleting.value = true
  try {
    const { error } = await supabase.from('movimentacoes').delete().eq('id', deletingItem.value.id)
    if (error) throw error
    showDeleteModal.value = false
    deletingItem.value    = null
    await fetchMovimentacoes()
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

/* ── Modal de Edição ─────────────────────────────────────────────────────── */
.edit-modal {
  background: #161B27;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  animation: popIn 0.35s cubic-bezier(0.16,1,0.3,1);
}

.edit-modal-header {
  background: #0F172A;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1;
}

.edit-modal-title { flex: 1; }
.edit-modal-title h3 { font-size: 15px; font-weight: 700; color: #fff; margin: 0; }
.edit-modal-title p  { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }

.modal-close-btn {
  width: 28px; height: 28px;
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
.modal-close-btn:hover { background: rgba(239,68,68,0.1); border-color: var(--red); color: var(--red); }

.edit-modal-body { padding: 20px; }

.edit-modal-footer {
  background: var(--surface-2);
  border-top: 1px solid var(--border);
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  position: sticky;
  bottom: 0;
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

/* ── Tabela de Movimentações ─────────────────────────────────────────────── */
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

.mov-count {
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
.td-qty     { font-weight: 700; color: var(--ink-mid); }
.td-obs     { color: var(--ink-soft); max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.td-epi     { color: var(--ink); }
.td-ca      { display: block; font-size: 11px; color: var(--ink-soft); font-family: 'Courier New', monospace; }

.badge-tipo {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.tipo-entrega  { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }
.tipo-devolucao { background: rgba(168,85,247,0.12); color: #c084fc; border: 1px solid rgba(168,85,247,0.25); }

.badge-ass {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}

.ass-ok { background: rgba(34,197,94,0.12);  color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
.ass-no { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

.badge-validade {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  font-family: 'Courier New', monospace;
}

.validade-ok      { background: rgba(34,197,94,0.12);  color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }
.validade-alerta  { background: rgba(234,179,8,0.12);  color: #fbbf24; border: 1px solid rgba(234,179,8,0.3); }
.validade-vencida { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
.validade-sem     { color: var(--ink-soft); }

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
  max-width: 400px;
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