function onEdit(e) {
  autoAjustarLinha(e);
}

function autoAjustarLinha(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const row = range.getRow();

  // Ativa quebra de linha apenas na célula editada
  range.setWrap(true);
  // Ajusta a altura da linha automaticamente
  sheet.autoResizeRows(row, 1);
}

/**
 * FUNÇÕES DE BACKEND
 * Cria o menu customizado na planilha Contratos
 */
const IDPlanilhaDadosContratos = "1-JzdJkc4Gmc9xVHaMYVQR_OSfEhEODYT99CrmTtM1cQ";
const AbaDadosContratos = "DadosContratoGeral";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📋 Gerenciar Registros")
    .addItem("Dados de Contratos", "openFormByType")
    .addToUi();
}

function renderMenuHomepage() {
  const template = HtmlService.createTemplateFromFile("UI_index_menu");
  const window = template
    .evaluate()
    .setWidth(660) // Menu 640 x 440
    .setHeight(480);

  SpreadsheetApp.getUi().showModalDialog(
    window,
    "Escolha uma das opções para editar a planilha"
  );
}

function openFormByType() {
  const template = HtmlService.createTemplateFromFile("Inserir-Dados"); // formType = criar.html ou editar.html
  const html = template.evaluate().setWidth(1600).setHeight(1100);
  // SpreadsheetApp.getUi().showModalDialog(html, `Formulário: ${formType}`);
  SpreadsheetApp.getUi().showModalDialog(html, `Formulário: Inserir Dados`);
}

function obterUltimoNumSesp() {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Contratos-2025");
  const dadosExistentes = sheet
    .getRange("A2:A")
    .getValues()
    .flat()
    .filter((val) => val);
  sheet.getRange("J2:J").setNumberFormat("R$ #,##0.00");

  if (dadosExistentes.length === 0) {
    return "1"; // Primeiro número
  }

  const ultimoValor = String(dadosExistentes[dadosExistentes.length - 1]);
  const [ultimoNum] = ultimoValor.includes("/")
    ? ultimoValor.split("/")
    : [ultimoValor];

  const proximo = String(parseInt(ultimoNum, 10) + 1);
  return proximo; // Ex: '2'
}

function salvarDadosNaPlanilha(dados) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Contratos-2025");
  const dadosExistentes = sheet
    .getRange("A2:A")
    .getValues()
    .flat()
    .filter((val) => val);
  let novoNumero = "1";
  // const anoAtual = new Date().getFullYear()
  // let anoNumGMS = document.querySelector('#ano_num_gms');
  // let anoNumLicitacao = document.querySelector('#ano_num_licitao');

  if (dadosExistentes.length > 0) {
    const ultimoValor = String(dadosExistentes[dadosExistentes.length - 1]);
    const [ultimoNum] = ultimoValor.includes("/")
      ? ultimoValor.split("/")
      : [ultimoValor];
    novoNumero = String(parseInt(ultimoNum, 10) + 1);
  }

  const ano = dados.ano || new Date().getFullYear();
  const num_sesp_formatado = novoNumero.padStart(4, "0") + "/" + ano;

  dados.num_sesp = num_sesp_formatado;
  // dados.num_gms = `${dados.num_gms}/${anoNumGMS || anoAtual}`;
  // dados.num_licitacao = `${dados.num_licitacao}/${anoNumLicitacao ||anoAtual}`;

  sheet.appendRow([
    dados.num_sesp || "",
    dados.num_gms || "",
    dados.e_protocolo || "",
    dados.num_licitacao || "",
    dados.opt_modal_licitacao || "",
    dados.opt_palavra_chave || "",
    dados.opt_unidade || "",
    dados.opt_subunidade || "",
    dados.contratada || "",
    dados.valor || "",
    dados.obj_contratacao || "",
    dados.opt_vigencia_mes || " - ",
    dados.opt_vigencia_ano || " - ",
    dados.vigencia_inicio || "",
    dados.vigencia_fim || "",
    dados.data_envio || "",
    dados.observacao || "",
    dados.opt_responsavel || "",
    dados.nota_reserva || " - ",
    dados.opt_pncp || "",
  ]);

  SpreadsheetApp.getUi().alert("✅ Contrato salvo com sucesso!");
  return true;
}

// fimVigencia

function fimVigencia(dataInicio, textoVigencia) {
  let inicio;

  if (dataInicio instanceof Date && !isNaN(dataInicio)) {
    inicio = dataInicio;
  } else if (typeof dataInicio === "number") {
    inicio = new Date(Math.round((dataInicio - 25569) * 86400 * 1000));
  } else if (typeof dataInicio === "string") {
    const partes = dataInicio.trim().split(/[\/\-]/);

    if (partes.length === 3) {
      const first = parseInt(partes[0], 10);
      const second = parseInt(partes[1], 10);
      const third = parseInt(partes[2], 10);

      // Detectar formato: se primeiro > 31 é ano (yyyy-MM-dd)
      if (first > 31) {
        // yyyy-MM-dd
        inicio = new Date(first, second - 1, third);
      } else {
        // dd/MM/yyyy
        inicio = new Date(third, second - 1, first);
      }
    }
  }

  if (!(inicio instanceof Date) || isNaN(inicio)) {
    throw new Error("Data inválida");
  }

  // Validação do texto de vigência
  if (!textoVigencia || typeof textoVigencia !== "string") {
    throw new Error("Texto de vigência inválido");
  }

  const texto = textoVigencia.toLowerCase().trim();
  const match = texto.match(/^(\d+)\s*(m[eê]s(?:es)?|ano(?:s)?)$/i);

  if (!match) {
    throw new Error(`Texto de vigência inválido: "${textoVigencia}"`);
  }

  const quantidade = parseInt(match[1], 10);
  const tipo = match[2];

  let fim = new Date(inicio);

  if (tipo.startsWith("m")) {
    fim.setMonth(fim.getMonth() + quantidade);

    if (fim.getDate() < inicio.getDate()) {
      fim.setDate(0);
    } else {
      fim.setDate(fim.getDate() - 1);
    }
  } else if (tipo.startsWith("a")) {
    fim.setFullYear(fim.getFullYear() + quantidade);
    // aqui não subtrai dia para ano
  }

  return Utilities.formatDate(fim, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

/**
 * Suporte flexível para string, Date, número (Excel serial), etc.
 */
function parseDataFlex(data) {
  if (
    Object.prototype.toString.call(data) === "[object Date]" &&
    !isNaN(data)
  ) {
    return data;
  }

  if (typeof data === "string") {
    // dd/mm/yyyy
    const br = data.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (br) return new Date(`${br[3]}-${br[2]}-${br[1]}`);

    // yyyy-mm-dd
    const iso = data.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) return new Date(`${iso[1]}-${iso[2]}-${iso[3]}`);
  }

  if (typeof data === "number") {
    // Data no formato Excel (dias desde 30/12/1899)
    const excelBase = new Date(1899, 11, 30);
    excelBase.setDate(excelBase.getDate() + data);
    return excelBase;
  }

  return null;
}

function listarOpcoes() {
  const planilha = SpreadsheetApp.openById(IDPlanilhaDadosContratos);
  const aba = planilha.getSheetByName(AbaDadosContratos);

  return {
    opt_palavra_chave: getColunaValores(aba, 1), // Coluna A
    opt_modal_licitacao: getColunaValores(aba, 2), // Coluna B
    opt_unidade: getColunaValores(aba, 3), // Coluna C
    opt_subunidade: getColunaValores(aba, 4), // Coluna D
    opt_pncp: getColunaValores(aba, 5), // Coluna E
    opt_responsavel: getColunaValores(aba, 6), // Coluna F
    opt_vigencia_mes: getColunaValores(aba, 7), // Coluna G
    opt_vigencia_ano: getColunaValores(aba, 8), // Coluna H
  };
}

function getColunaValores(sheet, colunaIndex) {
  return sheet
    .getRange(2, colunaIndex, sheet.getLastRow() - 1)
    .getValues()
    .flat()
    .filter(String); // Remove vazios
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
