const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

const perguntarAI = async (question, game, apiKey) => {

  const model = "gemini-2.5-flash"
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const pergunta = `
    ## Especialidade
    Você e um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

    ## Regras
    - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com
    'Essa pergunta não está relacionada com o jogo'
    - Considere a data atual ${new Date().toLocaleString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente. Porém pode pesquisar outras informações sobre o jogo desde que informe qual patch você encontrou essa infomação e se ela e valida no patch atual ou seja não foi alterada ou removida
    - Nunca responda itens que você não tenha certeza de que existe no patch atual

    ## Resposta
    -Economize na resposta, seja direto e responda em no máximo 500 caracteres
    - Traga a informação de qual do patch que usou para a resposta
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo
    - sempre que for trazer uma resposta que tem multiplos items personagens faça isso em lista e adicione se necessário somente uma descrição de algumas palavras não crie uma descrição para cada item.

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jugle
    resposta: A build atual é: \n\n**Itens:**\n\n coloque os itens aqui.\n\nexemplo de runas\n\n
    ---
    descrever brevemente em poucas palavras as vantagens dessa build

    pergunta do usuário: Melhor build para rubi
    responta: A build atual é: \n\n**Itens:**\n\n **Usando o emblema: *Emblema*\n\n\ listar os talentos recomendados
    ---
    descrever brevemente em poucas palavras as vantagens dessa build

    Aqui vai a pergunta do usuáiro: ${question}

  `

  const contents = [{
    role: "user",
    parts: [{
      text: pergunta
    }]
  }]

  const tools = [{
    google_search: {}
  }]

  // chamada API
  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })

  const data = await response.json()
  console.log(data)
  return markdownToHTML(data.candidates[0].content.parts[0].text)

}

const enviarFormulario = async (event) => {

  event.preventDefault()
  const apiKey = apiKeyInput.value
  const game = gameSelect.value
  const question = questionInput.value

  if (apiKey == '' || game == '' || question == '') {
    alert('Por favor, preencha todos os campos')
    return
  }

  askButton.disabled = true;
  askButton.textContent = 'Perguntando...'
  askButton.classList.add('loading')

  try {

    const text = await perguntarAI(question, game, apiKey)
    aiResponse.querySelector('.response-content').innerHTML = text
    aiResponse.classList.remove('hidden')

  } catch(error) {

    console.log("Erro: ", error)

  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar"
    askButton.classList.remove('loading')
  }

}

form.addEventListener("submit", enviarFormulario)