onmessage = ({ data }) => {
  setTimeout(() => {
    self.postMessage({ status: 'done' }) // self === window
  }, 2000)
}
