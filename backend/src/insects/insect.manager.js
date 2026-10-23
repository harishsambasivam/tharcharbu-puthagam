import { createManager } from '../core/crud.js'
import { InsectModel, InsectPublishModel } from './insect.model.js'

export default createManager('insect', { schema: InsectModel, publishSchema: InsectPublishModel })
