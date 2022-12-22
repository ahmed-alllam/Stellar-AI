import { createParser } from 'eventsource-parser'
import { streamAsyncIterable } from './stream-async-iterable.mjs'

export async function fetchSSE(resource, options) {
  const { onMessage, ...fetchOptions } = options
  const resp = await fetch(resource, fetchOptions)
  if (!resp.ok) {
    const detail = (await resp.json().catch(() => ({}))).detail
    onMessage("[ERROR]");
  } else {
    const parser = createParser((event) => {
      if (event.type === 'event') {
        onMessage(event.data)
        return;
      }
    })
    let st = '';
    for await (const chunk of streamAsyncIterable(resp.body)) {
      const str = new TextDecoder().decode(chunk)
      st += str
      parser.feed(str)
    }

    onMessage(st);
  }
}
