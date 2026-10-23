import express from 'express'
import { attachAdmin } from './core/auth.js'
import { errorHandler } from './core/http.js'
import auth from './auth/auth.controller.js'
import catalog from './catalog/catalog.controller.js'
import master from './master/master.controller.js'
import uploads from './uploads/upload.controller.js'
import plants from './plants/plant.controller.js'
import trees from './trees/tree.controller.js'
import insects from './insects/insect.controller.js'
import birds from './birds/bird.controller.js'
import animals from './animals/animal.controller.js'

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use(attachAdmin)

app.use('/api/auth', auth)
app.use('/api/catalog', catalog)
app.use('/api/master', master)
app.use('/api/uploads', uploads)
app.use('/api/plants', plants)
app.use('/api/trees', trees)
app.use('/api/insects', insects)
app.use('/api/birds', birds)
app.use('/api/animals', animals)

app.use(errorHandler)

export default app
