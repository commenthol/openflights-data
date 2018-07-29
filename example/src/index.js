import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

import 'leaflet/dist/leaflet.css'
import './index.css'

import { Icon } from 'leaflet'
Icon.Default.imagePath = '/leaflet/'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
