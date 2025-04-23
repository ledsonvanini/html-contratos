
    const formularioContratos = document.querySelector('#form_contratos');
    const btnLimparFormContrato = document.querySelector('#btn_limpar_contratos');
    const btnCancelarFormContrato = document.querySelector('#btn_cancelar_edicao_contratos');
    const btnEnviarFormContrato = document.querySelector('#btn_enviar_dados_contratos');

  document.addEventListener('DOMContentLoaded', () => {

  google.script.run
    .withSuccessHandler(preencherDropdowns)
    .listarOpcoes(); // Apps Script deve retornar um objeto com listas nomeadas
});

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
  console.log('Enviando...')
})
