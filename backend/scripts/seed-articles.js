import 'dotenv/config'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, table, queryKind } from '../src/core/db.js'

// Fills the "In depth" article with placeholder text on every item: npm run seed:articles
// Only blank articles are filled unless --overwrite. Published items get it on their live copy too.
// --dry-run prints what it would do without writing.
const apply = !process.argv.includes('--dry-run')
const overwrite = process.argv.includes('--overwrite')
const KINDS = ['plant', 'tree', 'insect', 'bird', 'animal']

const EN = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus, posuere velit aliquet. Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla.',
  'Vestibulum id ligula porta felis euismod semper. Maecenas faucibus mollis interdum. Aenean eu leo quam, pellentesque ornare sem lacinia quam venenatis vestibulum. Nullam quis risus eget urna mollis ornare vel eu leo. Curabitur blandit tempus porttitor.',
  'Etiam porta sem malesuada magna mollis euismod. Sed posuere consectetur est at lobortis. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.',
].join('\n\n')

const TA = [
  'இது ஒரு மாதிரி உரை. இந்தப் பகுதியில் இந்த உயிரினத்தைப் பற்றிய விரிவான விளக்கம் பின்னர் எழுதப்படும். அதன் வாழிடம், வளர்ச்சி, பயன்கள் ஆகியவை இங்கு இடம்பெறும்.',
  'மண், நீர், பருவம் ஆகியவற்றுடன் இதற்குள்ள தொடர்பு பற்றிய குறிப்புகள் இங்கு சேர்க்கப்படும். உழவர்களின் பட்டறிவும் மரபு அறிவும் இந்தப் பகுதியில் பதிவு செய்யப்படும்.',
  'இது தற்காலிக உரை மட்டுமே. உண்மையான உள்ளடக்கம் தயாரானதும் இந்த உரை மாற்றப்படும்.',
].join('\n\n')

let count = 0
for (const kind of KINDS) {
  for (const item of await queryKind(kind)) {
    const ref = `${kind}/${item.sk}`
    if (!overwrite && (item.data?.en?.article || item.data?.ta?.article)) {
      console.log(`skip ${ref} (has article)`)
      continue
    }
    const copies = ['data', ...(item.live ? ['live'] : [])]
    const set = copies.flatMap((c) => [`#${c}.#en.#article = :en`, `#${c}.#ta.#article = :ta`])
    if (apply)
      await db.send(
        new UpdateCommand({
          TableName: table(),
          Key: { pk: kind, sk: item.sk },
          UpdateExpression: `SET ${set.join(', ')}`,
          ExpressionAttributeNames: { ...Object.fromEntries(copies.map((c) => [`#${c}`, c])), '#en': 'en', '#ta': 'ta', '#article': 'article' },
          ExpressionAttributeValues: { ':en': EN, ':ta': TA },
        }),
      )
    count++
    console.log(`${apply ? 'wrote' : 'would write'} ${ref}${item.live ? ' (draft + live)' : ' (draft)'}`)
  }
}
console.log(`\n${count} item(s)${apply ? ' updated' : '; dry run, nothing written'}.`)
