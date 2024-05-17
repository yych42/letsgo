/**
 * Hashes an object into a SHA-256 string representation and maps it to a sequence of 3 emojis.
 *
 * This function converts the given object to a JSON string, then encodes it
 * into a Uint8Array and computes the SHA-256 hash using the Web Crypto API.
 * The resulting hash is mapped to a sequence of 3 emojis.
 *
 * @param obj - The object to be hashed.
 * @returns A promise that resolves to a string representation of the object hash as a sequence of 3 emojis.
 *
 * @example
 * ```typescript
 * const obj = { name: "John", age: 30, city: "New York" };
 * emojiHash(obj).then(hash => console.log(hash)); // Outputs a sequence of 3 emojis
 * ```
 */
async function emojiHash(obj: Record<string, any>): Promise<string> {
    // List of emojis to represent the hash
    const emojis = [
        '😀',
        '😃',
        '😄',
        '😁',
        '😆',
        '😅',
        '😂',
        '🤣',
        '😊',
        '😇',
        '🙂',
        '🙃',
        '😉',
        '😌',
        '😍',
        '🥰',
        '😘',
        '😗',
        '😙',
        '😚',
        '😋',
        '😛',
        '😝',
        '😜',
        '🤪',
        '🤨',
        '🧐',
        '🤓',
        '😎',
        '🤩',
        '🥳',
        '😏',
        '😒',
        '😞',
        '😔',
        '😟',
        '😕',
        '🙁',
        '😣',
        '😖',
        '😫',
        '😩',
        '🥺',
        '😢',
        '😭',
        '😤',
        '😠',
        '😡',
        '🤬',
        '🤯',
        '😳',
        '🥵',
        '🥶',
        '😱',
        '😨',
        '😰',
        '😥',
        '😓',
        '🤗',
        '🤔',
        '🤭',
        '🤫',
        '🤥',
        '😶',
        '😐',
        '😑',
        '😬',
        '🙄',
        '😯',
        '😦',
        '😧',
        '😮',
        '😲',
        '😴',
        '🤤',
        '😪',
        '😵',
        '🤐',
        '🥴',
        '🤢',
        '🤮',
        '🤧',
        '😷',
        '🤒',
        '🤕',
        '🤑',
        '🤠',
        '😈',
        '👿',
        '👹',
        '👺',
        '🤡',
        '💩',
        '👻',
        '💀',
        '☠️',
        '👽',
        '👾',
        '🤖',
        '🎃'
    ]

    // Convert the object to a JSON string
    const str = JSON.stringify(obj)

    // Encode the string as a Uint8Array
    const buffer = new TextEncoder().encode(str)

    // Compute the SHA-256 hash of the Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)

    // Convert the hash buffer to a byte array
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    // Select the first 3 bytes and map them to emojis
    const emojiHash = hashArray
        .slice(0, 3)
        .map((byte) => emojis[byte % emojis.length])
        .join('')

    return emojiHash
}

export { emojiHash }
