/**
 * FUNÇÕES DE BACKEND
 * Cria o menu customizado na planilha Contratos
 */

/** TESTES DEPURAÇÃO */
// console.log(HtmlService)


const IDPlanilhaDadosContratos = '1-JzdJkc4Gmc9xVHaMYVQR_OSfEhEODYT99CrmTtM1cQ'
const AbaDadosContratos = 'DadosContratoGeral'

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📋 Gerenciar Registros")
    .addItem('Dados de Contratos', 'renderMenuHomepage')
    .addToUi();
}

function renderMenuHomepage() {
  const template = HtmlService.createTemplateFromFile('UI_index_menu');
  const window = template.evaluate()
    .setWidth(640)
    .setHeight(440)

  SpreadsheetApp.getUi().showModalDialog(window, " Escolha uma das opções para editar a planilha")

}

function openFormByType(formType) {
  const template = HtmlService.createTemplateFromFile(formType); // formType = criar.html ou editar.html
  const html = template.evaluate()
    .setWidth(1580)
    .setHeight(900);
  SpreadsheetApp.getUi().showModalDialog(html, `Formulário: ${formType}`);
}

function salvarDadosNaPlanilha(dados) {

  try {
    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const aba = planilha.getSheetByName('Contratos-2025');

    if (!aba) {
      SpreadsheetApp.getUi().alert('⚠ Aba "Contratos-2025" não encontrada!');
      throw new Error('⚠ Aba "Contratos-2025" não encontrada!');
    }    

    // Obtém o número de linhas e colunas com dados
    const ultimaLinha = aba.getLastRow();
    const novaLinha = ultimaLinha + 1;
    // const numColunas = folha.getLastColumn();

    // Pega o cabeçalho (primeira linha) para garantir o mapeamento correto
    // const cabecalhos = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];   

    // Montar a linha para inserção
    // const linhaParaInserir = cabecalhos.map(cabecalho => dados[cabecalho] || ''); // Se não existir, coloca vazio
    const linhaParaInserir = [
        dados.num_sesp || '',
        dados.num_gms || '',
        dados.e_protocolo || '',
        dados.licitacao || '',
        dados.opt_modal_licitacao || '',
        dados.opt_palavra_chave || '',
        dados.opt_unidade || '',
        dados.opt_subunidade || '',    
        dados.contratada || ''    ,
        dados.valor || ''    ,
        dados.obj_contratacao || ''    ,
        dados.opt_vigencia_mes || ''    ,
        dados.opt_vigencia_ano || ''    ,
        dados.vigencia_inicio || ''    ,
        dados.vigencia_fim || ''    ,
        dados.data_envio || ''    ,
        dados.observacao || ''    ,
        dados.opt_responsavel || ''    ,
        dados.nota_reserva || ''    ,
        dados.opt_pncp || ''    ,
   
  ];

    // Inserir a linha
    // aba.getRange(novaLinha, 1, 1, linhaParaInserir.length).setValues([linhaParaInserir]);
    aba.getRange(novaLinha, 1, 1, linhaParaInserir.length).setValues([linhaParaInserir]);

    // Retorna uma mensagem de sucesso que será exibida em popup
    SpreadsheetApp.getUi().alert("✅ Contrato salvo com sucesso!")
    return '✅ Contrato salvo com sucesso!';

   
  } catch (erro) {
    return {
      sucesso: false,
      mensagem: "Erro ao inserir dados: " + erro.toString()
    };
  }
  
}
// console.log(salvarDadosNaPlanilha({
//   "num_sesp" : "1a3d21",
//   "num_gms" : "1a3d21",
//   "opt_modal_licitacao" : "LICITAÇAÕ 1a3d21",
//   "opt_palavra_chave" : "aca1a3d21",
//   "opt_unidade" : "PM",
//   "opt_subunidade" : "15bpm",
// }))

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
    opt_vigencia_mes: getColunaValores(aba, 7),       // Coluna F
    opt_vigencia_ano: getColunaValores(aba, 8)        // Coluna F
  };
}

function getColunaValores(sheet, colunaIndex) {
  return sheet.getRange(2, colunaIndex, sheet.getLastRow() - 1)
    .getValues()
    .flat()
    .filter(String); // Remove vazios
}



function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
