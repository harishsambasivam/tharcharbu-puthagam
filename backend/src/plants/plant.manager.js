import { createManager } from '../core/crud.js'
import { PlantModel, PlantPublishModel } from './plant.model.js'

export default createManager('plant', { schema: PlantModel, publishSchema: PlantPublishModel })
