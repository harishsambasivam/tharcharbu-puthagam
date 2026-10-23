import { createManager } from '../core/crud.js'
import { BirdModel, BirdPublishModel } from './bird.model.js'

export default createManager('bird', { schema: BirdModel, publishSchema: BirdPublishModel })
