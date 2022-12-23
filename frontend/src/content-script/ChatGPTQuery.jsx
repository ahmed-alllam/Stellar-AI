import { useEffect, useState } from 'preact/hooks'
import PropTypes from 'prop-types'
import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import Browser from 'webextension-polyfill'
// import ChatGPTFeedback from './ChatGPTFeedback'
import './highlight.scss'
import CrossIC from '../../public/res/cross.svg';







function addStylesheet(doc, link, classN) {
  const path = chrome.runtime.getURL(link),
    styleLink = document.createElement("link");

  styleLink.setAttribute("rel", "stylesheet");
  styleLink.setAttribute("type", "text/css");
  styleLink.setAttribute("href", path);

  if (classN)
    styleLink.className = classN;

  doc.head.appendChild(styleLink);
}

const ce = ({
  props, tag, children, name,
}, elementsObj) => {
  const elm = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'style') {
      Object.entries(v).forEach(([k2, v2]) => {
        elm.style[k2] = v2;
      });
    } else {
      elm[k] = v;
    }
  });
  if (children) {
    children.forEach((x) => {
      if (x) {
        const child = ce(x, elementsObj);
        elm.appendChild(child);
      }
    });
  }
  if (name && elementsObj) {
    // eslint-disable-next-line no-param-reassign
    elementsObj[name] = elm;
  }
  return elm;
};

function createContainer() {
  return ce({
    tag: 'div',
    props: { className: 'summarize-gpt-container' },
    children: [{
      tag: 'div',
      props: { className: 'summarize__main-body' },
      children: [{
        tag: 'div',
        props: { className: 'summarize__main-body__top-bar' },
        children: [{
          tag: 'div',
          props: { className: 'summarize__main-body__top-bar__rhs' },
          children: [{
            tag: 'div',
            props: { className: 'summarize__main-body__top-bar__rhs__element' },
            children: [{
              tag: 'div',
              props: {
                onclick: () => {
                  const element = document.querySelector('.summarize-gpt-container');
                  element.parentNode.removeChild(element);
                },
                className: 'summarize__main-body__top-bar__rhs__element__closeButton',
              },
              children: [{ tag: 'img', props: { src: CrossIC }, },],
            }]
          }]
        }]
      }, {
        tag: 'div',
        props: { className: 'summarize__content-container' },
        children: [{
          tag: 'div',
          props: { className: 'summarize__content-outer-container' },
          children: [{
            tag: 'div',
            props: { className: 'summarize__content-inner-container' },
            children: []
          }]
        }],
      }]
    }]
  },)
}






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
    let answer2 = answer.trim();

    if (!props.article) {
      return (
        <div id="answer" className="markdown-body gpt-inner"
          dir="auto">
          <div className="gpt-header">
            <p>IntelliSearch</p>
          </div>

          <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
            {answer2}
          </ReactMarkdown>

          <div className="gpt-footer" style="margin-top: 20px;">
            <p>Developed by Ahmed Allam</p>
          </div>
        </div>
      )
    } else {
      // if (!document.head.querySelector(".summarize-styles")) addStylesheet(document, "styles.css", "summarize-styles");
      const container = createContainer();
      document.body.appendChild(container);

      const innerContainer = container.querySelector(".summarize__content-inner-container");
      innerContainer.innerHTML = '<p><span class="brandName">IntelliSummary</span><pre></pre></p><p class="summarize__footer__text">Developed by Ahmed Allam</p>';
      innerContainer.querySelector("pre").textContent = answer2;
    }
  }


  if (error && !props.article) {
    return (
      <p className="gpt-inner">
        Failed to load response. Please try again later.
      </p>
    )
  }

  if (!props.article)
    return <p className="gpt-loading gpt-inner">Waiting for response...</p>
}

ChatGPTQuery.propTypes = {
  question: PropTypes.string.isRequired,
}

export default memo(ChatGPTQuery)
