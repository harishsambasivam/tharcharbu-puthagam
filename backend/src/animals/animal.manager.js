import { createManager } from '../core/crud.js'
import { AnimalModel, AnimalPublishModel } from './animal.model.js'

export default createManager('animal', { schema: AnimalModel, publishSchema: AnimalPublishModel })
