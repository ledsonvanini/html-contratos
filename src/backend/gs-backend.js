/**
 * FUNÇÕES DE BACKEND
 * Cria o menu customizado na planilha Contratos
 */
const IDPlanilhaDadosContratos = '1-JzdJkc4Gmc9xVHaMYVQR_OSfEhEODYT99CrmTtM1cQ'
const AbaDadosContratos = 'DadosContratoGeral'

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Ações Personalizadas')
    .addItem('Dados de Contratos', 'renderHtmlHomepage')
    .addToUi();
}

function renderHtmlHomepage() {
  const indexTpl = HtmlService.createTemplateFromFile('index');
  const window = indexTpl
      .evaluate()
      .setWidth(1220)
      .setHeight(720)
      .setFaviconUrl('https://web.celepar.pr.gov.br/drupal/images/logo_parana_400x173.png')
      .setTitle('Inserir Dados - Contratos');

      SpreadsheetApp.getUi().showModalDialog(window, 'Formulário Contratos')

}

function inserirDadosNaPlanilha(dados) {
  try {
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var folha = planilha.getActiveSheet();
    
    // Obtém o número de linhas e colunas com dados
    var ultimaLinha = folha.getLastRow();
    var numColunas = folha.getLastColumn();
    
    // Verifica se há pelo menos uma linha de cabeçalho
    if (ultimaLinha < 1) {
      return {
        sucesso: false,
        mensagem: "A planilha está vazia ou não tem cabeçalho."
      };
    }
    
    // Formata a data corretamente, ajustando o fuso horário
    var dataEntrada = new Date(dados.dataEntrada + "T12:00:00");
    var dataFormatada = Utilities.formatDate(dataEntrada, "GMT-3", "dd/MM/yyyy");
    
    // Prepara a linha de dados (com protocolo já formatado)
    var novaLinha = [
      dataFormatada,
      dados.protocolo, // O protocolo já vem formatado do formulário
      dados.fatura,
      dados.contrato,
      dados.obra,
      dados.medicao,
      "R$ " + formatarNumero(dados.valor),
      dados.empenho,
      dados.tipo,
      dados.acaoOrcamentaria,
      dados.fonte,
      dados.elementoDespesa
    ];
    
    // Verifica se há apenas uma linha de cabeçalho (primeira inserção)
    if (ultimaLinha === 1) {
      folha.getRange(2, 1, 1, novaLinha.length).setValues([novaLinha]);
      return {
        sucesso: true,
        mensagem: "Fatura inserida com sucesso!"
      };
    }
    
    // Obtém todas as datas da coluna A (excluindo o cabeçalho)
    var datasExistentes = folha.getRange(2, 1, ultimaLinha - 1, 1).getValues();
    
    // Encontrar a posição correta para inserir baseado na data
    var linhaInsercao = 2; // Começa após o cabeçalho
    var inserido = false;
    
    for (var i = 0; i < datasExistentes.length; i++) {
      // Converte a string de data para objeto Date
      var dataAtual = converterParaData(datasExistentes[i][0]);
      
      // Compara com a data da nova entrada
      if (dataEntrada >= dataAtual) {
        linhaInsercao = i + 2; // +2 porque i começa em 0 e queremos pular o cabeçalho
        inserido = true;
        break;
      }
    }
    
    // Se não encontrou uma posição (nova data é a mais antiga), insere no final
    if (!inserido) {
      linhaInsercao = ultimaLinha + 1;
    }
    
    // Insere uma linha vazia na posição
    folha.insertRowBefore(linhaInsercao);
    
    // Insere os dados na linha
    folha.getRange(linhaInsercao, 1, 1, novaLinha.length).setValues([novaLinha]);
    
    return {
      sucesso: true,
      mensagem: "Fatura inserida com sucesso!"
    };
  } catch (erro) {
    return {
      sucesso: false,
      mensagem: "Erro ao inserir dados: " + erro.toString()
    };
  }
}

function listarOpcoes() {
  const planilha = SpreadsheetApp.openById(IDPlanilhaDadosContratos);
  const aba = planilha.getSheetByName(AbaDadosContratos);

  return {
    opt_palavra_chave: getColunaValores(aba, 1),      // Coluna A
    opt_modal_licitacao: getColunaValores(aba, 2),    // Coluna B
    opt_unidade: getColunaValores(aba, 3),            // Coluna C
    opt_subunidade: getColunaValores(aba, 4),         // Coluna D
    opt_pncp: getColunaValores(aba, 5),                // Coluna E
    opt_responsavel: getColunaValores(aba, 6)                // Coluna F
  };
}

function getColunaValores(sheet, colunaIndex) {
  return sheet.getRange(2, colunaIndex, sheet.getLastRow() - 1)
    .getValues()
    .flat()
    .filter(String); // Remove vazios
}



function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}
