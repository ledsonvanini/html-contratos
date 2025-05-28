const formularioContratos = document.querySelector("#form_contratos");
const numSespInput = document.querySelector("#num_sesp");
const eProtocoloInput = document.querySelector("#e_protocolo");
const natDespesaInput = document.querySelector("#natureza_desp");
// const btnVoltarMenu = document.querySelector('#btn_back_menu');
// const btnLimparFormContrato = document.querySelector('#btn_limpar_contratos');
const btnCancelarFormContrato = document.querySelector(
  "#btn_cancelar_edicao_contratos"
);
const btnEnviarFormContrato = document.querySelector(
  "#btn_enviar_dados_contratos"
);

/** DOM READY*/
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn_menu_find").dataset.listener = true;
  onChangeFormPesquisar();
  toggleSecao("insercao");
  numGMSFocus();
  atualizarNumSesp(); // Pega o número mais recente
  carregarDropdowns(); // Carrega os selects
  configurarListenersDeVigencia(); // ⬅ adicionamos isso aqui
});
/** ======== TOOGLE SESSION FUNCTIONS ======== */
function toggleSecao(ativa) {
  const secoes = ["pesquisa", "insercao"];

  secoes.forEach((secao) => {
    const content = document.getElementById(`secao-${secao}`);
    const icon = document.getElementById(`icon-${secao}`);
    const togglePesquisa = document.getElementById(`toggle-pesquisa`);
    const toggleInsercao = document.getElementById(`toggle-insercao`);
    const isAtiva = secao === ativa;

    if (isAtiva) {
      content.classList.remove("max-h-0");
      content.classList.add("max-h-screen");
      toggleInsercao.classList.add("bg-slate-200");
      togglePesquisa.classList.remove("bg-slate-200");
      icon.classList.add("rotate-90");
    } else {
      content.classList.remove("max-h-screen");
      toggleInsercao.classList.remove("bg-slate-200");
      togglePesquisa.classList.add("bg-slate-200");
      content.classList.add("max-h-0");
      icon.classList.remove("rotate-90");
    }
  });
}

/** ======== FRONTEND FORM FUNCTIONS ======== */

function openForm(typeForm) {
  google.script.run.openFormByType(typeForm);
  google.script.host.close(); // Fecha o menu atual
}

function numGMSFocus() {
  const numGmsInput = document.querySelector("#e_protocolo");
  numGmsInput.focus();
}

// Função de carregamento dos dropdowns
function carregarDropdowns() {
  google.script.run.withSuccessHandler(preencherDropdowns).listarOpcoes(); // backend retorna objeto com listas
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

// Função reutilizável para atualizar o campo num_sesp
function atualizarNumSesp() {
  numGMSFocus();
  google.script.run
    .withSuccessHandler((valor) => {
      if (numSespInput) {
        numSespInput.value = valor;
        numSespInput.readOnly = true;
      }
    })
    .obterUltimoNumSesp(); // função Apps Script que retorna o último número
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

// Função simples de máscara de CNPJ (00.000.000/0000-00)
function applyMask(i) {
  i.value = i.value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, "$1/$2")
    .replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

// Consulta API CNPJ ao perder foco
async function buscarCNPJ() {
  const inputCnpj = document.getElementById("cnpj_contratada");
  const inputRazao = document.getElementById("razao_contratada");

  if (!inputCnpj || !inputRazao) {
    inputRazao.value = ""; // limpa campo anterior

    return;
  }

  let raw = inputCnpj.value;
  let cnpj = raw.replace(/\D/g, "");

  if (cnpj.length !== 14) {
    console.warn("CNPJ inválido.");
    return;
  }

  // Deixe razão social como readonly enquanto busca
  inputRazao.setAttribute("readonly", true);
  inputRazao.value = "Consultando...";

  google.script.run
    .withSuccessHandler((dados) => {
      if (dados && dados.razao_contratada) {
        inputRazao.value = dados.razao_contratada;
        inputRazao.setAttribute("readonly", true); // impede edição
      } else {
        // alert('Razão social não encontrada\n. Usuário poderá preencher manualmente.');
        google.script.run.showAlert(
          "Razão Social não encontrada",
          "Preencha manualmente ou tente outro CNPJ!"
        );
        inputRazao.value = ""; // limpa campo anterior
        inputRazao.removeAttribute("readonly"); // permite digitação
        inputRazao.focus();
      }
    })
    .withFailureHandler((err) => {
      console.error("Erro na API:", err);
      inputRazao.value = "";
      inputRazao.removeAttribute("readonly");
    })
    .getDadosCNPJ(cnpj);
}

/** ======== DADOS: GERAÇÃO E INSERÇÃO ======== */

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

/** ======== BACKEND CALLS ======== */

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
    } else {
      dados[key] = forceTextUpperCase(value);
    }
  }

  console.log("Dados capturados:", dados);

  google.script.run
    .withSuccessHandler(onSalvarContratoSucesso)
    .withFailureHandler((error) => {
      console.error("Erro ao salvar:", error);
    })
    .salvarDadosNaPlanilha(dados);
}

// Atualização após envio do formulário
function onSalvarContratoSucesso(response) {
  formularioContratos.reset(); // limpa os campos visuais
  atualizarNumSesp(); // recarrega num_sesp
  carregarDropdowns(); // recarrega opções
}

/** ======== AUXILIARES E CÁLCULOS ======== */

/*  UTILITIES  */
function forceTextUpperCase(valor) {
  return valor?.toString().toUpperCase() ?? "";
}
// Evento que ocorre após reset manual (ex: botão "Limpar")
formularioContratos.addEventListener("reset", () => {
  setTimeout(atualizarNumSesp, 50); // Espera o reset acontecer
});

natDespesaInput.addEventListener("input", (e) => {
  const valorOriginal = e.target.value;
  const valorMascarado = mascararTexto(valorOriginal);
  e.target.value = valorMascarado;
});

function mascararOnInput(idInput, mascara) {
  const idElement = document.getElementById(idInput);
  idElement.addEventListener("input", (e) => {
    const input = e.target.value;
    const valorMascarado = mascararTexto(input, mascara);
    e.target.value = valorMascarado;
  });
}

function mascararOnInputComAno(idInput) {
  const idElement = document.getElementById(idInput);

  idElement.addEventListener("input", (e) => {
    let input = e.target.value;

    // Remove tudo que não é número
    const apenasNumeros = input.replace(/\D/g, "");

    let numeroParte = "";
    let anoParte = "";

    if (apenasNumeros.length > 4) {
      // Se tem mais de 4 dígitos, considera os últimos 4 como ano
      numeroParte = apenasNumeros
        .slice(0, apenasNumeros.length - 4)
        .slice(0, 6);
      anoParte = apenasNumeros.slice(-4);
    } else {
      // Senão, ainda está digitando os primeiros dígitos
      numeroParte = apenasNumeros.slice(0, 6);
    }

    // Monta o valor com ou sem o ano
    e.target.value = anoParte ? `${numeroParte}/${anoParte}` : numeroParte;
  });
}

mascararOnInputComAno("num_gms_search");
mascararOnInputComAno("num_sesp_search");

mascararOnInput("e_protocolo", "00.000.000-0");
mascararOnInput("e_protocolo_search", "00.000.000-0");
mascararOnInput("natureza_desp", "0000.00");

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
/** PESQUISAR E EDITAR FORM */

async function pesquisarContrato() {
  let btnFind = document.querySelector("#btn_menu_find");
  gerarBotaoPesquisar(btnFind);

  const resultadoDiv = document.getElementById("resultado_pesquisa");
  const num_sesp =
    document.getElementById("num_sesp_search")?.value?.trim() || "";
  const e_protocolo =
    document.getElementById("e_protocolo_search")?.value?.trim() || "";
  const palavra_chave =
    document.getElementById("opt_palavra_chave_search")?.value?.trim() || "";
  const num_gms =
    document.getElementById("num_gms_search")?.value?.trim() || "";
  const responsavel =
    document.getElementById("opt_responsavel_search")?.value?.trim() || "";

  if (!num_sesp && !e_protocolo && !num_gms && !palavra_chave && !responsavel) {
    google.script.run.showAlert(
      "Erro ao buscar contrato",
      "Preencha ao menos um campo para pesquisar"
    );
    gerarBotaoPesquisar(
      btnFind,
      (textContent = "Pesquisar"),
      (bg = "#ccc"),
      (active = true)
    );

    return;
  }
  document.getElementById("num_sesp_search").focus();
  gerarBotaoPesquisar(btnFind);
  try {
    await google.script.run
      .withSuccessHandler((dados) => {
        if (!Array.isArray(dados) || dados.length === 0) {
          resultadoDiv.innerHTML = `<p class="text-red-500 font-semibold">Nenhum contrato encontrado.</p>`;
          setTimeout(() => {
            resultadoDiv.innerHTML = "";
          }, 2000);
        } else {
          resultadoDiv.innerHTML = gerarTabelaContratos(dados); // sua função para gerar HTML da tabela
        }
        document.getElementById("form_pesquisa").reset();
        document.getElementById("num_sesp_search").focus();
      })
      .buscarContratosNaPlanilha({
        num_sesp,
        e_protocolo,
        palavra_chave,
        num_gms,
        responsavel,
      });
  } catch (error) {
    resultadoDiv.innerHTML = `<p class="text-red-500 font-semibold">Erro: ${error.message}</p>`;
  } finally {
    gerarBotaoPesquisar(btnFind);
  }
  // });
}
// Gerar Botão Pesquisar
function gerarBotaoPesquisar(
  btn,
  textContent = "Pesquisar",
  bg = "#4c63ad",
  active = false
) {
  btn.disabled = active;
  btn.style.backgroundColor = bg;
  btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewbox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
     ${textContent}`;
  //  return btnFind;
}
// Ao mudar Form Pesquisar
function onChangeFormPesquisar() {
  let btn = document.querySelector("#btn_menu_find");
  let formPesquisa = document.querySelector("#form_pesquisa");
  formPesquisa.addEventListener("change", (e) => {
    gerarBotaoPesquisar(
      btn,
      (textContent = "Pesquisar"),
      (bg = "#4c63ad"),
      (active = false)
    );
  });
}

// Gera a tabela com TailwindCSS + botões
function gerarTabelaContratos(lista) {
  let rows = lista
    .map(
      (c, i) => `
    <tr class="border border-gray-200 rounded-lg text-sm text-gray-700">
      <td class="p-2">${c.num_sesp}</td>
      <td class="p-2">${c.e_protocolo}</td>
      <td class="p-2">${c.palavra_chave}</td>
      <td class="p-2">${c.num_gms}</td>
      <td class="p-2">${c.responsavel}</td>
      <td class="p-2">${c.status}</td>
      <td class="p-2 flex gap-2">
        <button class="text-blue-600 hover:underline" onclick="editarContrato(${i})">Editar</button>
        <button class="text-red-600 hover:underline" onclick="apagarContrato(${i})">Apagar</button>
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <div class="mt-4">
      <table class="w-full border border-gray-200 rounded-xl text-left">
        <thead class="bg-gray-200">
          <tr>
            <th class="p-2">Nº SESP</th>
            <th class="p-2">e-Protocolo</th>
            <th class="p-2">palavra-chave</th>
            <th class="p-2">Nº GMS</th>
            <th class="p-2">Responsável</th>
            <th class="p-2">Status</th>
            <th class="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="mt-2 flex gap-4">
        <button onclick="limparTabela()" class="px-4 py-1 bg-yellow-500 text-white rounded">Limpar</button>
        <button onclick="eliminarTabela()" class="px-4 py-1 bg-red-700 text-white rounded">Eliminar Tabela</button>
      </div>
    </div>
  `;
}

// Ações simuladas (você pode ligar com sua lógica real depois)
function editarContrato(index) {
  alert(`Editar contrato #${index}`);
  // Aqui você pode preencher o formulário de inserção com os dados do contrato[index]
}

function apagarContrato(index) {
  alert(`Apagar contrato #${index}`);
  // Aqui você pode remover da planilha ou marcar como excluído
}

function limparTabela() {
  const resultadoDiv = document.getElementById("resultado_pesquisa");
  const linhas = resultadoDiv.querySelectorAll("tbody tr");
  linhas.forEach((tr) => tr.remove());
}

function eliminarTabela() {
  const resultadoDiv = document.getElementById("resultado_pesquisa");
  resultadoDiv.innerHTML = "";
}

/** ======== EVENTOS DO FORM ======== */
// Voltar ao Menu Principal
// btnVoltarMenu.addEventListener('click', (e) => {
//   e.preventDefault()
//   google.script.run.renderMenuHomepage(); // reabre o menu
//   google.script.host.close(); // fecha este formulário
// })

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

// Limpa totalmente o Formulário 'Contratos'
// btnLimparFormContrato.addEventListener('click', (e) => {
//   e.preventDefault()
//   formularioContratos.reset();
//   numGMSFocus()

//   setTimeout(atualizarNumSesp, 50); // Espera o reset acontecer;

// })
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
