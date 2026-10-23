import { createManager } from '../core/crud.js'
import { ArticleModel, ArticlePublishModel } from './article.model.js'

export default createManager('article', { schema: ArticleModel, publishSchema: ArticlePublishModel })
