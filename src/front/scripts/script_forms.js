
  document.addEventListener('DOMContentLoaded', () => {
    google.script.run
      .withSuccessHandler(preencherDropdowns)
      .listarOpcoes(); // AppsScript (backend) deve retornar um objeto com listas nomeadas
});

    const btnVoltarMenu = document.querySelector('#btn_back_menu');
    const formularioContratos = document.querySelector('#form_contratos');
    const btnLimparFormContrato = document.querySelector('#btn_limpar_contratos');
    const btnCancelarFormContrato = document.querySelector('#btn_cancelar_edicao_contratos');
    const btnEnviarFormContrato = document.querySelector('#btn_enviar_dados_contratos');

  function openForm(typeForm) { 
    google.script.run.openFormByType(typeForm);
    google.script.host.close(); // Fecha o menu atual
  }

  // Utilities
  function forceTextUpperCase (valor) {
    return valor?.toString().toUpperCase() ?? '';
   
  }
  function currencyNumberFormat(valor) {
    if (!valor) return '';
        const numero = parseFloat(valor.toString().replace(',', '.'));
    if (isNaN(numero)) return valor;
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function salvarContrato() {  

    const formData = new FormData(formularioContratos);
    const dados = {
      opt_modal_licitacao : forceTextUpperCase(document.getElementById('opt_modal_licitacao')?.value),
      opt_palavra_chave : forceTextUpperCase(document.getElementById('opt_palavra_chave')?.value),
      opt_unidade : forceTextUpperCase(document.getElementById('opt_unidade')?.value),
      opt_subunidade : forceTextUpperCase(document.getElementById('opt_subunidade')?.value),
      opt_subunidade : forceTextUpperCase(document.getElementById('opt_subunidade')?.value),
      opt_subunidade : forceTextUpperCase(document.getElementById('opt_subunidade')?.value),
      opt_subunidade : forceTextUpperCase(document.getElementById('opt_subunidade')?.value),
      valor : currencyNumberFormat(document.getElementById('valor')?.value),

      opt_vigencia_mes : forceTextUpperCase(document.getElementById('opt_vigencia_mes')?.value),    
      opt_vigencia_ano : forceTextUpperCase(document.getElementById('opt_vigencia_ano')?.value),    
      vigencia_inicio : forceTextUpperCase(document.getElementById('vigencia_inicio')?.value),    
      vigencia_fim : forceTextUpperCase(document.getElementById('vigencia_fim')?.value),    
      data_envio : forceTextUpperCase(document.getElementById('data_envio')?.value),      
      opt_responsavel : forceTextUpperCase(document.getElementById('opt_responsavel')?.value),      
      opt_pncp : forceTextUpperCase(document.getElementById('opt_pncp')?.value),   

    };

  for (const [key, value] of formData.entries()) {
    
    dados[key] = forceTextUpperCase(value);

  }
    

 
 console.log('Dados capturados:', dados);

   google.script.run
    .withSuccessHandler(onSalvarContratoSucesso)
    .withFailureHandler(onSalvarContratoErro)
    .salvarDadosNaPlanilha(dados); // chama a função backend
}

// 👉 Função nomeada para sucesso
function onSalvarContratoSucesso(response) {
  // alert(response || "Dados salvos com sucesso!");
  formularioContratos.reset();
}

// 👉 Função nomeada para erro
function onSalvarContratoErro(error) {
  console.error("Erro ao salvar: " + error.message);

}


function preencherDropdowns(data) {
  if (!data || typeof data !== 'object') {
    console.warn("Dados inválidos recebidos:", data);
    return;
  }

  for (const [campoId, lista] of Object.entries(data)) {
    const select = document.getElementById(campoId);
    if (!select) continue;

    select.innerHTML = ''; // limpa opções anteriores
    select.appendChild(new Option("Selecione...", ""));

    lista.forEach(item => {
      const opt = new Option(item, item);
      select.appendChild(opt);
    });
  }
}

  function toggleSelects() {
  const btnRadioMes = document.querySelector('input[name="toggleSelect"][value="mes"]').checked;
  const selectMes = document.getElementById('opt_vigencia_mes');
  const selectAno = document.getElementById('opt_vigencia_ano');

  if (btnRadioMes) {
    selectMes.classList.remove('hidden');
    selectAno.classList.add('hidden');
  } else {
    selectMes.classList.add('hidden');
    selectAno.classList.remove('hidden');
  }
}

// Voltar ao Menu Principal
btnVoltarMenu.addEventListener('click', (e) => {
  e.preventDefault()
  google.script.run.renderMenuHomepage(); // reabre o menu
  google.script.host.close(); // fecha este formulário
})
// Limpa totalmente o Formulário 'Contratos'
btnLimparFormContrato.addEventListener('click', (e) => {
  e.preventDefault()
  formularioContratos.reset();
})
// Limpa totalmente o Formulário 'Contratos'
btnCancelarFormContrato.addEventListener('click', (e) => {
  e.preventDefault()
  google.script.host.close();
  console.log('Fechando...')
})
// Limpa totalmente o Formulário 'Contratos'
btnEnviarFormContrato.addEventListener('click', (e) => {
  e.preventDefault()
  salvarContrato()
  // google.script.run.inserirDadosNaPlanilha()
  console.log('Enviando...')
})


