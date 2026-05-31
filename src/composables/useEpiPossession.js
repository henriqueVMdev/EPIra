import { useSupabase } from "./useSupabase";

// Janela (em dias) para considerar um EPI "a vencer".
export const DIAS_ALERTA = 30;

// Status de validade a partir da data (string 'YYYY-MM-DD').
// Retorna: 'vencido' | 'a_vencer' | 'ok' | 'sem_validade'
export function statusValidade(validade) {
  if (!validade) return "sem_validade";
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dt = new Date(validade + "T00:00:00");
  const dias = Math.round((dt - hoje) / (1000 * 60 * 60 * 24));
  if (dias < 0) return "vencido";
  if (dias <= DIAS_ALERTA) return "a_vencer";
  return "ok";
}

// EPI em estado de alerta (vencido ou próximo do vencimento).
export const isAlerta = (e) => e.status === "vencido" || e.status === "a_vencer";

// EPI com validade já vencida.
export const isVencido = (e) => e.status === "vencido";

// Dias restantes até a validade (negativo = vencido há N dias).
export function diasParaVencer(validade) {
  if (!validade) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dt = new Date(validade + "T00:00:00");
  return Math.round((dt - hoje) / (1000 * 60 * 60 * 24));
}

// Calcula os EPIs em posse de um funcionário (pelo nome) a partir das
// movimentações: soma entregas e subtrai devoluções por EPI. Retorna apenas
// os itens com saldo > 0, já com dados de validade e status.
export async function fetchEpisEmPosse(nomeFuncionario) {
  const { supabase } = useSupabase();
  if (!nomeFuncionario) return [];

  const { data, error } = await supabase
    .from("movimentacoes")
    .select("tipo, quantidade, epi_id, epis(nome, ca, categoria, validade)")
    .eq("funcionario", nomeFuncionario);

  if (error) throw error;

  const mapa = new Map();
  for (const m of data ?? []) {
    if (!m.epi_id || !m.epis) continue;
    const atual = mapa.get(m.epi_id) ?? {
      epi_id: m.epi_id,
      nome: m.epis.nome,
      ca: m.epis.ca,
      categoria: m.epis.categoria,
      validade: m.epis.validade,
      saldo: 0,
    };
    const qtd = Number(m.quantidade) || 0;
    atual.saldo += m.tipo === "entrega" ? qtd : -qtd;
    mapa.set(m.epi_id, atual);
  }

  return [...mapa.values()]
    .filter((e) => e.saldo > 0)
    .map((e) => ({
      ...e,
      status: statusValidade(e.validade),
      dias: diasParaVencer(e.validade),
    }))
    .sort((a, b) => {
      // Sem validade vai por último; demais por dias restantes (vencidos primeiro).
      if (a.dias === null) return 1;
      if (b.dias === null) return -1;
      return a.dias - b.dias;
    });
}
