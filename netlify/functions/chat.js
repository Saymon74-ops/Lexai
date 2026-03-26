const Anthropic = require('@anthropic-ai/sdk')

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    const { messages } = JSON.parse(event.body)
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'Você é a LexIA, assistente especializada em Direito brasileiro. Responda de forma clara, cite artigos de lei quando relevante, e adapte a linguagem para estudantes de concursos jurídicos.',
      messages: messages
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: response.content[0].text })
    }
  } catch (error) {
    console.error('Erro:', error.message)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    }
  }
};