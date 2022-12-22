import PropTypes from 'prop-types'
import ChatGPTQuery from './ChatGPTQuery'

function ChatGPTCard(props) {
    if(props.question && props.question.trim().length !== 0) {
      return <ChatGPTQuery question={props.question} />
    } else if(props.article && props.article.trim().length !== 0) {
      return <ChatGPTQuery article={props.article} />
    }
}

ChatGPTCard.propTypes = {
  question: PropTypes.string,
  article: PropTypes.string,
  triggerMode: PropTypes.string,
}

export default ChatGPTCard
