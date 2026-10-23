import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

export const db = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
})
export const table = () => process.env.TABLE_NAME

export const getRaw = async (kind, id) =>
  (await db.send(new GetCommand({ TableName: table(), Key: { pk: kind, sk: id } }))).Item

export async function queryKind(kind) {
  const items = []
  let ExclusiveStartKey
  do {
    const page = await db.send(
      new QueryCommand({
        TableName: table(),
        KeyConditionExpression: 'pk = :k',
        ExpressionAttributeValues: { ':k': kind },
        ExclusiveStartKey,
      }),
    )
    items.push(...page.Items)
    ExclusiveStartKey = page.LastEvaluatedKey
  } while (ExclusiveStartKey)
  return items
}

// Readers only ever see published items, and only their live copy. Editors see the working copy.
export const visible = (item, admin) => admin || item.status === 'published'
export const view = (item, admin) => ({
  id: item.sk,
  kind: item.pk,
  status: item.status,
  dirty: item.dirty,
  createdAt: item.createdAt,
  publishedAt: item.publishedAt,
  ...(admin ? item.data : item.live),
})
