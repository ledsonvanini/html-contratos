const formularioContratos = document.querySelector("#form_contratos");
const numSespInput = document.querySelector("#num_sesp");
const numGmsInput = document.querySelector("#num_gms");
const eProtocoloInput = document.querySelector("#e_protocolo");
// const btnVoltarMenu = document.querySelector('#btn_back_menu');
const btnLimparFormContrato = document.querySelector("#btn_limpar_contratos");
const btnCancelarFormContrato = document.querySelector(
  "#btn_cancelar_edicao_contratos"
);
const btnEnviarFormContrato = document.querySelector(
  "#btn_enviar_dados_contratos"
);

document.addEventListener("DOMContentLoaded", () => {
  numGmsInput.focus();
  atualizarNumSesp(); // Pega o número mais recente
  carregarDropdowns(); // Carrega os selects
  configurarListenersDeVigencia(); // ⬅ adicionamos isso aqui
});

function openForm(typeForm) {
  google.script.run.openFormByType(typeForm);
  google.script.host.close(); // Fecha o menu atual
}

function montarObjetoDoFormulario() {
  const dados = {};
  const formElements = document.querySelectorAll("form [name]");

  formElements.forEach((element) => {
    const nome = element.name;
    let valor = element.value;

    // Aplica upperCase apenas nos campos normais
    if (typeof valor === "string") {
      valor = forceTextUpperCase(valor);
    }

    dados[nome] = valor;
  });

  // Obter vigência diretamente do <select> e não aplicar upperCase aqui!
  const tipoVigenciaSelecionado = document.querySelector(
    'input[name="toggleSelect"]:checked'
  )?.value;

  const quantidadeRaw =
    tipoVigenciaSelecionado === "mes"
      ? document.getElementById("opt_vigencia_mes").value
      : document.getElementById("opt_vigencia_ano").value;

  if (quantidadeRaw) {
    const textoLimpo = quantidadeRaw.trim().toLowerCase();

    // Regex para capturar número e unidade válidos
    const match = textoLimpo.match(/^(\d+)\s*(m[eê]s(?:es)?|ano(?:s)?)$/i);

    if (match) {
      const numero = match[1];
      const unidade = match[2].toLowerCase();

      dados["vigenciaTexto"] = `${numero} ${unidade}`;
    } else {
      // Fallback, caso venha texto malformado
      const numero = textoLimpo.match(/\d+/)?.[0];
      const tipo = textoLimpo.includes("ano") ? "anos" : "meses";

      if (numero) {
        dados["vigenciaTexto"] = `${numero} ${tipo}`;
      }
    }
  }

  return dados;
}

function atualizarDataFim() {
  const dataInicio = document.querySelector(
    'input[name="vigencia_inicio"]'
  )?.value;
  const tipo = document.querySelector(
    'input[name="toggleSelect"]:checked'
  )?.value;
  const quantidade =
    tipo === "mes"
      ? document.getElementById("opt_vigencia_mes")?.value
      : document.getElementById("opt_vigencia_ano")?.value;

  if (!dataInicio || !quantidade) return;

  // 🔍 Extração segura: número + unidade limpa
  const quantidadeMatch = quantidade.match(/\d+/);
  const numero = quantidadeMatch ? quantidadeMatch[0] : null;

  if (!numero) return;

  const unidade =
    tipo === "mes"
      ? numero === "1"
        ? "mês"
        : "meses"
      : numero === "1"
      ? "ano"
      : "anos";

  const textoVigencia = `${numero} ${unidade}`;

  google.script.run
    .withSuccessHandler((dataFim) => {
      const inputFim = document.querySelector('input[name="vigencia_fim"]');
      if (inputFim) inputFim.value = dataFim;
    })
    .withFailureHandler((err) => {
      console.warn("Erro ao calcular FIM_VIGENCIA:", err.message);
    })
    .fimVigencia(dataInicio, textoVigencia);
}

function configurarListenersDeVigencia() {
  const campos = [
    'input[name="vigencia_inicio"]',
    'input[name="toggleSelect"]',
    "#opt_vigencia_mes",
    "#opt_vigencia_ano",
  ];

  campos.forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) {
      el.addEventListener("change", atualizarDataFim);
    }
  });
}

function salvarContrato() {
  const formData = new FormData(formularioContratos);
  const dados = {
    ...montarObjetoDoFormulario(), // coleta automática
    opt_modal_licitacao: forceTextUpperCase(
      document.getElementById("opt_modal_licitacao")?.value
    ),
    opt_palavra_chave: forceTextUpperCase(
      document.getElementById("opt_palavra_chave")?.value
    ),
    opt_unidade: forceTextUpperCase(
      document.getElementById("opt_unidade")?.value
    ),
    opt_subunidade: forceTextUpperCase(
      document.getElementById("opt_subunidade")?.value
    ),
    opt_subunidade: forceTextUpperCase(
      document.getElementById("opt_subunidade")?.value
    ),
    opt_subunidade: forceTextUpperCase(
      document.getElementById("opt_subunidade")?.value
    ),
    opt_subunidade: forceTextUpperCase(
      document.getElementById("opt_subunidade")?.value
    ),

    opt_vigencia_mes: forceTextUpperCase(
      document.getElementById("opt_vigencia_mes")?.value
    ),
    opt_vigencia_ano: forceTextUpperCase(
      document.getElementById("opt_vigencia_ano")?.value
    ),

    vigencia_inicio: forceTextUpperCase(
      document.getElementById("vigencia_inicio")?.value
    ),
    vigencia_fim: forceTextUpperCase(
      document.getElementById("vigencia_fim")?.value
    ),
    data_envio: forceTextUpperCase(
      document.getElementById("data_envio")?.value
    ),
    opt_responsavel: forceTextUpperCase(
      document.getElementById("opt_responsavel")?.value
    ),
    opt_pncp: forceTextUpperCase(document.getElementById("opt_pncp")?.value),
  };

  for (const [key, value] of formData.entries()) {
    if (key === "num_sesp") {
      dados[key] = formatarNumSesp(value); // ← aqui a formatação;
    } else if (key === "num_gms") {
      dados[key] = `${value}/${document.querySelector("#ano_num_gms").value}`;
    } else if (key === "num_licitacao") {
      dados[key] = `${value}/${
        document.querySelector("#ano_num_licitacao").value
      }`;
    } else if (key === "e_protocolo") {
      dados[key] = mascararTexto(value, "00.000.000-0");
    } else {
      dados[key] = forceTextUpperCase(value);
    }
  }
  // numGmsInput.focus()
  console.log("Dados capturados:", dados);

  google.script.run
    .withSuccessHandler(onSalvarContratoSucesso)
    .withFailureHandler((error) => {
      console.error("Erro ao salvar:", error);
    })
    .salvarDadosNaPlanilha(dados);
}

// Atualizar Nº SESP
function formatarNumSesp(valor) {
  const anoEscolhido =
    document.querySelector("#ano_num_sesp").value || new Date().getFullYear();

  if (!valor) valor = "1";
  // Garante que é string e aplica o padding de 4 dígitos
  const parteNumerica = String(valor).padStart(4, "0");

  return `${parteNumerica}/${anoEscolhido}`;
}
// Formtar Nº [MÁSCARA]
function mascararTexto(valor, padrao) {
  const numeros = valor.replace(/\D/g, ""); // Remove tudo que não é número
  let resultado = "";
  let i = 0;

  for (const char of padrao) {
    if (char === "0") {
      if (i < numeros.length) {
        resultado += numeros[i++];
      } else {
        break;
      }
    } else {
      resultado += char;
    }
  }

  return resultado;
}

// Função reutilizável para atualizar o campo num_sesp
function atualizarNumSesp() {
  numGmsInput.focus();
  google.script.run
    .withSuccessHandler((valor) => {
      if (numSespInput) {
        numSespInput.value = valor;
        numSespInput.readOnly = true;
      }
    })
    .obterUltimoNumSesp(); // função Apps Script que retorna o último número
}
// Função de carregamento dos dropdowns
function carregarDropdowns() {
  google.script.run.withSuccessHandler(preencherDropdowns).listarOpcoes(); // backend retorna objeto com listas
}

function preencherDropdowns(data) {
  if (!data || typeof data !== "object") {
    console.warn("Dados inválidos recebidos:", data);
    return;
  }

  for (const [campoId, lista] of Object.entries(data)) {
    const select = document.getElementById(campoId);
    if (!select) continue;

    select.innerHTML = ""; // limpa opções anteriores
    select.appendChild(new Option("Selecione...", ""));

    lista.forEach((item) => {
      const opt = new Option(item, item);
      select.appendChild(opt);
    });
  }
}

// Atualização após envio do formulário
function onSalvarContratoSucesso(response) {
  formularioContratos.reset(); // limpa os campos visuais
  atualizarNumSesp(); // recarrega num_sesp
  carregarDropdowns(); // recarrega opções
}

function toggleSelects() {
  const btnRadioMes = document.querySelector(
    'input[name="toggleSelect"][value="mes"]'
  ).checked;
  const selectMes = document.getElementById("opt_vigencia_mes");
  const selectAno = document.getElementById("opt_vigencia_ano");

  if (btnRadioMes) {
    selectMes.classList.remove("hidden");
    selectAno.classList.add("hidden");
  } else {
    selectMes.classList.add("hidden");
    selectAno.classList.remove("hidden");
  }
}

/*  UTILITIES  */
function forceTextUpperCase(valor) {
  return valor?.toString().toUpperCase() ?? "";
}
// Evento que ocorre após reset manual (ex: botão "Limpar")
formularioContratos.addEventListener("reset", () => {
  setTimeout(atualizarNumSesp, 50); // Espera o reset acontecer
});

/* EVENTOS DE CLICK, CHANGE, SUBMIT ETC */

eProtocoloInput.addEventListener("input", (e) => {
  const valorOriginal = e.target.value;
  const valorMascarado = mascararTexto(valorOriginal, "00.000.000-0");
  e.target.value = valorMascarado;
});

// Voltar ao Menu Principal
// btnVoltarMenu.addEventListener('click', (e) => {
//   e.preventDefault()
//   google.script.run.renderMenuHomepage(); // reabre o menu
//   google.script.host.close(); // fecha este formulário
// })
// Limpa totalmente o Formulário 'Contratos'
btnLimparFormContrato.addEventListener("click", (e) => {
  e.preventDefault();
  formularioContratos.reset();
  numGmsInput.focus();

  setTimeout(atualizarNumSesp, 50); // Espera o reset acontecer;
});
// Limpa totalmente o Formulário 'Contratos'
btnCancelarFormContrato.addEventListener("click", (e) => {
  e.preventDefault();
  google.script.host.close();
  console.log("Fechando...");
});
// Limpa totalmente o Formulário 'Contratos'
btnEnviarFormContrato.addEventListener("click", (e) => {
  e.preventDefault();
  salvarContrato();
});
