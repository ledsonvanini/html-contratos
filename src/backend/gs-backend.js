
/**
 * FUNÇÕES DE BACKEND
 * Cria o menu customizado na planilha Contratos
 */
const IDPlanilhaDadosContratos = '1-JzdJkc4Gmc9xVHaMYVQR_OSfEhEODYT99CrmTtM1cQ'
const AbaDadosContratos = 'DadosContratoGeral'


/** ====== EVENTOS DE PLANILHA ====== */

function onEdit(e) {
    autoAjustarLinha(e)  
}

function autoAjustarLinha(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const row = range.getRow();

  // Ativa quebra de linha apenas na célula editada
  range.setWrap(true);
  // Ajusta a altura da linha automaticamente
  sheet.autoResizeRows(row, 3);  
}



function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📋 Gerenciar Registros")
    .addItem('Dados de Contratos', 'openFormByType')
    .addToUi();
}

/** FORMULÁRIOS E HTML  */


function renderMenuHomepage() {
  const template = HtmlService.createTemplateFromFile('UI_index_menu');
  const window = template.evaluate()
    .setWidth(660)   // Menu 640 x 440 
    .setHeight(480)

  SpreadsheetApp.getUi().showModalDialog(window, "Escolha uma das opções para editar a planilha")

}

function openFormByType() {
  const template = HtmlService.createTemplateFromFile('Inserir-Dados'); // formType = criar.html ou editar.html
  const html = template.evaluate()
    .setWidth(1600)
    .setHeight(1300);
  // SpreadsheetApp.getUi().showModalDialog(html, `Formulário: ${formType}`);
  SpreadsheetApp.getUi().showModalDialog(html, `Formulário: Inserir Dados`);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** DADOS: GERAÇÃO E INSERÇÃO */

function getDadosCNPJ(cnpj) {
  try {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    const url = "https://minhareceita.org/" + cleanCnpj;

    const response = UrlFetchApp.fetch(url);
    const status = response.getResponseCode();

    if (status !== 200) return { razao_contratada: null };

    const data = JSON.parse(response.getContentText());
    return {
      razao_contratada: data.razao_social || null
    };
  } catch (e) {
    Logger.log("Erro de consulta: " + e);
    return { razao_contratada: null };
  }
}

// 76.564.624/0002-84    76564624000284 SERVOPA
// 76.416.890/0001-89    76416890000189 GOV PARANA

function obterUltimoNumSesp() {

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Contratos-2025');
  const dadosExistentes = sheet.getRange('A2:A').getValues().flat().filter(val => val);
  sheet.getRange('V2:V').setNumberFormat('R$ #,##0.00');

  if (dadosExistentes.length === 0) {
    return '1'; // Primeiro número
  }

  const ultimoValor = String(dadosExistentes[dadosExistentes.length - 1]);
  const [ultimoNum] = ultimoValor.includes('/') ? ultimoValor.split('/') : [ultimoValor];

  const proximo = String(parseInt(ultimoNum, 10) + 1);
  return proximo; // Ex: '2'
}

function salvarDadosNaPlanilha(dados) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Contratos-2025');
  const dadosExistentes = sheet.getRange('A2:A').getValues().flat().filter(val => val);
  let novoNumero = '1';

  if (dadosExistentes.length > 0) {
    const ultimoValor = String(dadosExistentes[dadosExistentes.length - 1]);
    const [ultimoNum] = ultimoValor.includes('/') ? ultimoValor.split('/') : [ultimoValor];
    novoNumero = String(parseInt(ultimoNum, 10) + 1);
  }

  const ano = dados.ano || new Date().getFullYear();
  const num_sesp_formatado = novoNumero.padStart(4, '0') + '/' + ano;

  dados.num_sesp = num_sesp_formatado;

  sheet.appendRow([
    dados.num_sesp || '',
    dados.e_protocolo || ' - ',
    dados.opt_palavra_chave || ' - ',
    dados.opt_unidade || ' - ',
    dados.opt_subunidade || ' - ',
    dados.opt_responsavel || ' - ',
    dados.num_gms || ' - ',
    dados.num_licitacao || ' - ',
    dados.opt_modal_licitacao || ' - ',
    dados.natureza_desp || ' - ',
    // dados.contratada || ' - ',
    dados.obj_contratacao || ' - ',
    dados.opt_vigencia_mes || ' - ',
    dados.opt_vigencia_ano || ' - ',
    dados.vigencia_inicio || ' - ',
    dados.vigencia_fim || ' - ',
    dados.data_envio || ' - ',
    dados.dotacao || ' - ',
    dados.opt_pncp || ' - ',
    dados.razao_contratada || ' - ',
    dados.cnpj_contratada || ' - ',
    dados.nota_reserva || ' - ',
    dados.valor || ' - ',
  ])

  SpreadsheetApp.getUi().alert("✅ Contrato salvo com sucesso!")
  return true;
}

// function buscarContratosNaPlanilha(filtros) {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Contratos-2025");
//   const dados = sheet.getDataRange().getValues(); // todas as linhas
//   const header = dados.shift();

//   // Assume cabeçalho na primeira linha
//   const contratos = [];

//   for (let i = 1; i < dados.length; i++) {
//     const linha = dados[i];
//     const contrato = {
//       num_sesp: linha[0],
//       e_protocolo: linha[1],
//       palavra_chave: linha[2],
//       unidade: linha[3],
//       subunidade: linha[4],
//       responsavel: linha[5],
//       num_gms: linha[6],
//       status: linha[19] || 'Ativo' // ou ajuste conforme posição
//     };

//     // filtro OR: se qualquer um bater, inclui
//     if (
//       (!filtros.num_sesp || contrato.num_sesp.includes(filtros.num_sesp)) &&
//       (!filtros.e_protocolo || contrato.e_protocolo.includes(filtros.e_protocolo)) &&
//       (!filtros.num_gms || contrato.num_gms.includes(filtros.num_gms)) &&
//       (!filtros.responsavel || contrato.responsavel.toLowerCase().includes(filtros.responsavel.toLowerCase()))
//     ) {
//       contratos.push(contrato);
//     }
//   }

//   return contratos;
// }

// function buscarContratosNaPlanilha(filtros) {
//   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Contratos');
//   const dados = sheet.getDataRange().getValues();
//   const header = dados.shift();

//   const idx = {
//     num_sesp: header.indexOf('num_sesp'),
//     e_protocolo: header.indexOf('e_protocolo'),
//     num_gms: header.indexOf('num_gms'),
//     responsavel: header.indexOf('opt_responsavel')
//   };

//   const normalizar = texto =>
//     String(texto || '')
//       .normalize('NFD')
//       .replace(/\p{Diacritic}/gu, '')
//       .toLowerCase()
//       .trim();

//   const resultados = dados.filter(linha => {
//     const condicoes = [];

//     if (filtros.num_sesp) {
//       const valor = normalizar(linha[idx.num_sesp]);
//       condicoes.push(valor.includes(normalizar(filtros.num_sesp)));
//     }
//     if (filtros.e_protocolo) {
//       const valor = normalizar(linha[idx.e_protocolo]);
//       condicoes.push(valor.includes(normalizar(filtros.e_protocolo)));
//     }
//     if (filtros.num_gms) {
//       const valor = normalizar(linha[idx.num_gms]);
//       condicoes.push(valor.includes(normalizar(filtros.num_gms)));
//     }
//     if (filtros.responsavel) {
//       const valor = normalizar(linha[idx.responsavel]);
//       condicoes.push(valor === normalizar(filtros.responsavel));
//     }

//     return condicoes.length > 0 && condicoes.every(Boolean);
//   });

//   return resultados;
// }

function buscarContratosNaPlanilha(filtros) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Contratos-2025");
  const dados = sheet.getDataRange().getValues(); 
  const header = dados.shift();

  const normalizar = (valor) => String(valor || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

  const contratos = [];

  for (let linha of dados) {
    const contrato = {
      num_sesp: linha[0],
      e_protocolo: linha[1],
      palavra_chave: linha[2],
      unidade: linha[3],
      subunidade: linha[4],
      responsavel: linha[5],
      num_gms: linha[6],
      status: linha[19] || 'Ativo'
    };

    const match =
      (filtros.num_sesp && normalizar(contrato.num_sesp).includes(normalizar(filtros.num_sesp))) ||
      (filtros.e_protocolo && normalizar(contrato.e_protocolo).includes(normalizar(filtros.e_protocolo))) ||
      (filtros.num_gms && normalizar(contrato.num_gms).includes(normalizar(filtros.num_gms))) ||
      (filtros.responsavel && normalizar(contrato.responsavel).includes(normalizar(filtros.responsavel)));

    if (match) {
      contratos.push(contrato);
    }
  }

  return contratos;
}



/** DADOS: FONTE EXTERNA */

function listarOpcoes() {
  const planilha = SpreadsheetApp.openById(IDPlanilhaDadosContratos);
  const aba = planilha.getSheetByName(AbaDadosContratos);

  return {
    opt_palavra_chave: getColunaValores(aba, 1),      // Coluna A
    opt_modal_licitacao: getColunaValores(aba, 2),    // Coluna B
    opt_unidade: getColunaValores(aba, 3),            // Coluna C
    opt_subunidade: getColunaValores(aba, 4),         // Coluna D
    opt_pncp: getColunaValores(aba, 5),               // Coluna E
    opt_responsavel: getColunaValores(aba, 6),        // Coluna F
    opt_responsavel_search: getColunaValores(aba, 6),        // Coluna F
    opt_vigencia_mes: getColunaValores(aba, 7),       // Coluna G
    opt_vigencia_ano: getColunaValores(aba, 8)        // Coluna H
  };
}

function getColunaValores(sheet, colunaIndex) {
  return sheet.getRange(2, colunaIndex, sheet.getLastRow() - 1)
    .getValues().flat().filter(String); // Remove vazios
}


/** AUXILIARES E CÁLCULOS (UTILITÁRIOS)*/

function showAlert(titulo, msg) {
  var ui = SpreadsheetApp.getUi();
  ui.alert(`🚨 ${titulo}`, `⚠️ ${msg}`, ui.ButtonSet.OK);
}


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

  return Utilities.formatDate(fim, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function parseDataFlex(data) {
  /**
 * Suporte flexível para string, Date, número (Excel serial), etc.
 */
  if (Object.prototype.toString.call(data) === '[object Date]' && !isNaN(data)) {
    return data;
  }

  if (typeof data === 'string') {
    // dd/mm/yyyy
    const br = data.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (br) return new Date(`${br[3]}-${br[2]}-${br[1]}`);

    // yyyy-mm-dd
    const iso = data.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) return new Date(`${iso[1]}-${iso[2]}-${iso[3]}`);
  }

  if (typeof data === 'number') {
    // Data no formato Excel (dias desde 30/12/1899)
    const excelBase = new Date(1899, 11, 30);
    excelBase.setDate(excelBase.getDate() + data);
    return excelBase;
  }

  return null;
}







