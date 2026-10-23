import { createManager } from '../core/crud.js'
import { TreeModel, TreePublishModel } from './tree.model.js'

export default createManager('tree', { schema: TreeModel, publishSchema: TreePublishModel })
