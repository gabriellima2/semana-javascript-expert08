export class View {
  #fileUpload = document.getElementById('fileUpload')
  #btnUploadVideo = document.getElementById('btnUploadVideos')
  #fileSize = document.getElementById('fileSize')
  #fileInfo = document.getElementById('fileInfo')
  #txtfileName = document.getElementById('fileName')
  #fileUploadWrapper = document.getElementById('fileUploadWrapper')
  #elapsed = document.getElementById('elapsed')
  #canvas = document.getElementById('preview-144p')

  constructor() {
    this.configureBtnUploadClick()
  }

  configureOnFileChange(fn) {
    this.#fileUpload.addEventListener('change', this.onChange(fn))
  }

  configureBtnUploadClick() {
    this.#btnUploadVideo.addEventListener('click', () => {
      // trigger file input
      this.#fileUpload.click()
    })
  }

  updateElapsedTime(text) {
    this.#elapsed.innerText = text
  }

  parseBytesIntoMBAndGB(bytes) {
    const mb = bytes / (1024 * 1024)
    // if mb is greater than 1024, then convert to GB
    if (mb > 1024) {
        // rount to 2 decimal places
        return `${Math.round(mb / 1024)}GB`
    }
    return `${Math.round(mb)}MB`
  }

  onChange(fn) {
    return (e) => {
      const file = e.target.files[0]
      const { name, size } = file
      fn(file)
      this.#txtfileName.innerText = name
      this.#fileSize.innerText = this.parseBytesIntoMBAndGB(size)

      this.#fileInfo.classList.remove('hide')
      this.#fileUploadWrapper.classList.add('hide')
    }
  }
}

async function fakeFetch() {
  const filePath = '/videos/frag_bunny.mp4'
  const response = await fetch(filePath)
  // const fileSize = response.headers.get('content-length')
  const file = new File([await response.blob()], filePath, {
    type: 'video/mp4',
    lastModified: Date.now()
  })
  const event = new Event('change')
  // Define o valor de value em target, como sendo o arquivo criado
  Reflect.defineProperty(event, 'target', { value: { files: [file] } })
  document.getElementById('fileUpload').dispatchEvent(event)
}

fakeFetch()