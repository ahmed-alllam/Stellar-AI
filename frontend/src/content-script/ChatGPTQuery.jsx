import { useEffect, useState } from 'preact/hooks'
import PropTypes from 'prop-types'
import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import Browser from 'webextension-polyfill'
// import ChatGPTFeedback from './ChatGPTFeedback'
import './highlight.scss'

function ChatGPTQuery(props) {
  const [answer, setAnswer] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [, setDone] = useState(false)

  useEffect(() => {
    const port = Browser.runtime.connect()
    const listener = (msg) => {
      if (msg.data) {
        setAnswer(msg.data)
      } else if (msg.error) {
        setError(msg.error)
      } else if (msg.event === 'DONE') {
        setDone(true)
      }
    }
    port.onMessage.addListener(listener)
    if (props.question) {
      port.postMessage({ question: props.question })
    } else if (props.article) {
      port.postMessage({ article: props.article })
    }
    return () => {
      port.onMessage.removeListener(listener)
      port.disconnect()
    }
  }, [props.question, props.article, retry])

  // retry error on focus
  useEffect(() => {
    const onFocus = () => {
      if (error && (error == 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
        setError('')
        setRetry((r) => r + 1)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [error]);


  if (answer) {
    return (
      <div id="answer" className={"markdown-body gpt-inner " + (props.article ? "summary" : "")}
        dir="auto">
        <div className="gpt-header">
          <p>ChatGPT</p>
        </div>

        {
          (() => {
            if (props.article) {
              return <button id="close"
                onClick={() => {
                  document.getElementById("answer").style.display = "none";
                }}>X</button>
            }
          })()
        }

        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
          {answer}
        </ReactMarkdown>

      </div>
    )
  }


  if (error) {
    return (
      <p className="gpt-inner">
        Failed to load response. Please try again later.
      </p>
    )
  }

  return <p className="gpt-loading gpt-inner">Waiting for response...</p>
}

ChatGPTQuery.propTypes = {
  question: PropTypes.string.isRequired,
}

export default memo(ChatGPTQuery)
