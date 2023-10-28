export class Service {
  #url;
  constructor(url) {
    this.#url = url
  }
  async uploadFile({ fileName, fileBuffer }) {
    const formData = new FormData()
    formData.append(fileName, fileBuffer)
    const response = await fetch(this.#url, { method: 'POST', body: formData })
    console.assert(response.ok, 'Response in not OK', response)
    return
  }
}