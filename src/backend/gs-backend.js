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
