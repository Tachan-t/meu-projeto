/**
 * @file Lógica de envio do formulário para o Google Apps Script.
 * @author Parceiro de Programacao
 */

// *******************************************************************
// IMPORTANTE: COLOQUE O URL DO APLICATIVO DA WEB DO SEU APPS SCRIPT AQUI!
// Você obteve este URL no Passo 3 da configuração do Apps Script.
// Exemplo: 'https://script.google.com/macros/s/AKfycBx.../exec'
// *******************************************************************
const appScriptURL = 'https://script.google.com/macros/s/AKfycbxG9_8_zZQYxCKYlDUIrom3s2XZMqd5kKAZ5UrWMBtkbOBRIP02f6TXkFSroruLWFKv6A/exec'; 

document.getElementById('myForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário (recarregar a página)

    const form = event.target;
    const formData = new FormData(form);
    const feedbackMessage = document.getElementById('feedbackMessage');

    // Limpa e esconde mensagens anteriores
    feedbackMessage.textContent = '';
    feedbackMessage.className = '';
    feedbackMessage.style.display = 'none';

    try {
        const response = await fetch(appScriptURL, {
            method: 'POST',
            body: formData // Envia os dados do formulário
        });

        if (response.ok) {
            const data = await response.text(); // Lê a resposta de texto do Apps Script
            feedbackMessage.textContent = "Dados enviados com sucesso! " + data;
            feedbackMessage.className = 'success';
            form.reset(); // Limpa o formulário após o envio
        } else {
            // Se a resposta não for OK (ex: erro 500 no Apps Script)
            const errorText = await response.text(); // Tenta ler o texto do erro
            throw new Error(`Erro ao enviar dados. Status: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        // Captura erros de rede ou outros erros no fetch
        feedbackMessage.textContent = "Erro ao enviar os dados: " + error.message;
        feedbackMessage.className = 'error';
        console.error('Erro:', error);
    } finally {
        // Sempre exibe a mensagem (sucesso ou erro)
        feedbackMessage.style.display = 'block';
    }
});