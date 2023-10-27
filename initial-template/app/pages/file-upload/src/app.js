import Clock from './deps/clock.js';
import { View } from "./view.js"

const view = new View()
const clock = new Clock()
const worker = new Worker('./src/worker/worker.js', { type: 'module' })
let took = ''

// Recebe a resposta da thread secundária
worker.onmessage = ({ data }) => {
    if (data.status !== 'done') return;
    clock.stop()
    view.updateElapsedTime(`Process took ${took.replace('ago', '')}`)
}

worker.onerror = (error) => console.error('Worker', error)

view.configureOnFileChange((file) => {
    // Envia um dado para a thread secundária
    worker.postMessage({ file })
    clock.start((time) => {
        took = time;
        view.updateElapsedTime(`Process started ${time}`)
    })
})
