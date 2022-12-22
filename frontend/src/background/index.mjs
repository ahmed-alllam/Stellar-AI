import Browser from 'webextension-polyfill'
import { setConversationProperty } from './chatgpt.mjs'
import { fetchSSE } from './fetch-sse.mjs'

async function generateAnswers(port, question) {
  let conversationId
  const deleteConversation = () => {
    if (conversationId) {
      setConversationProperty(conversationId, { is_visible: false })
    }
  }

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
    deleteConversation()
  })

  await fetchSSE('https://ai-extension.onrender.com/search?q=' + question, {
    method: 'GET',
    // signal: controller.signal,
    onMessage(message) {
      if (message === '[DONE]') {
        port.postMessage({ event: 'DONE' })
        deleteConversation()
        return
      }
      const data = message
      if (data) {
        port.postMessage({
          data: data,
        })
      }
    },
  })
}

async function summarizeArticle(port, article) {
  let conversationId
  const deleteConversation = () => {
    if (conversationId) {
      setConversationProperty(conversationId, { is_visible: false })
    }
  }

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
    deleteConversation()
  })

  await fetchSSE('https://ai-extension.onrender.com/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ "text": article }),
    // signal: controller.signal,
    onMessage(message) {
      if (message === '[DONE]') {
        port.postMessage({ event: 'DONE' })
        deleteConversation()
        return
      }
      // const text = data.message
      // conversationId = data.conversation_id
       if (message === '[DONE]') {
        port.postMessage({ event: 'DONE' })
        deleteConversation()
      } else if (message === '[ERROR]') {
        port.postMessage({ error: 'ERROR' })
        deleteConversation()
      } else {
        if (message) {
          port.postMessage({
            data: message,
            // messageId: data.message.id,
            // conversationId: data.conversation_id,
          })
        }
      }
    },
  })
}

Browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    if (msg.question !== undefined) {
      try {
        await generateAnswers(port, msg.question)
      } catch (err) {
        console.error(err)
        port.postMessage({ error: err.message })
      }
    } else if (msg.article !== undefined) {
      try {
        await summarizeArticle(port, msg.article)
      } catch (err) {
        console.error(err)
        port.postMessage({ error: err.message })
      }
    }
  })
})

Browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'FEEDBACK') {
    // const token = await getAccessToken()
    // await sendMessageFeedback(token, message.data)
  }
})
