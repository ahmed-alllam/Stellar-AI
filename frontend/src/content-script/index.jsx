// import 'github-markdown-css'
import { render } from 'preact'
import { getUserConfig } from '../config'
import ChatGPTCard from './ChatGPTCard'
import { config } from './search-engine-configs.mjs'
import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils.mjs'


function getContentOfArticle() {
  // get all the plain text from the webpage
  let article = document.body.innerText;
  // remove the text from the script and style tags
  article = article.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  article = article.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // remove the text from the html tags
  article = article.replace(/<[^>]+>/g, '');
  // remove the text from the html entities
  article = article.replace(/&[^;]+;/g, '');
  // remove the text from the html comments
  article = article.replace(/<!--[\s\S]*?-->/g, '');

  // take only the first 1000 characters
  article = article.substring(0, 1000);

  return article;
}

async function mount(question, siteConfig) {
  const container = document.createElement('div')
  container.className = 'chat-gpt-container'

  const siderbarContainer = getPossibleElementByQuerySelector(siteConfig.sidebarContainerQuery)
  if (siderbarContainer) {
    siderbarContainer.prepend(container)
  } else {
    container.classList.add('sidebar-free')
    const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
    if (appendContainer) {
      appendContainer.appendChild(container)
    }
  }

  const userConfig = await getUserConfig()
  render(
    <ChatGPTCard question={question} triggerMode={userConfig.triggerMode || 'always'} />,
    container,
  )
}

async function mount2(article, siteConfig) {
  const container = document.createElement('div')
  container.className = 'chat-gpt-container'

  // const siderbarContainer = getPossibleElementByQuerySelector(siteConfig.sidebarContainerQuery)
  // if (siderbarContainer) {
  //   siderbarContainer.prepend(container)
  // } else {
  //   container.classList.add('sidebar-free')
  //   const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
  //   if (appendContainer) {
  //     appendContainer.appendChild(container)
  //   }
  // }

  // add the container to the body as a popup
  document.body.appendChild(container);

  const userConfig = await getUserConfig()
  render(
    <ChatGPTCard article={article} triggerMode={userConfig.triggerMode || 'always'} />,
    container,
  )
}

const siteRegex = new RegExp(Object.keys(config).join('|'));
let siteName = location.hostname.match(siteRegex);
let siteConfig = null;
if (siteName) {
  siteName = siteName[0]
  siteConfig = config[siteName]
}

function run() {
  if (siteConfig && siteConfig.inputQuery) {
    const searchInput = getPossibleElementByQuerySelector(siteConfig.inputQuery)
    if (searchInput && searchInput.value) {
      mount(searchInput.value, siteConfig)
    }
  } else {
    let content = getContentOfArticle();

    if (content) {
      mount2(content, siteConfig)
    }
  }
}

console.debug('Running on', siteName)
run()

if (siteConfig && siteConfig.watchRouteChange) {
  siteConfig.watchRouteChange(run)
}
