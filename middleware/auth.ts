import crypto from 'crypto'

const isAuthenticatedConsumer = function(token: string): boolean {
    try {
        decryptApiKey(token, process.env.consumer_key)
        return true
    }
    catch(err) { 
        return false
    }
}

const isAuthenticatedPublisher = function(token: string): boolean {
    try {
        decryptApiKey(token, process.env.publisher_key)
        return true
    }
    catch{ return false }
}

function decryptApiKey(text: string, passphrase: string) {
    const key = generateKeyFromPassphrase(passphrase)
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
}

function generateKeyFromPassphrase(passphrase: string) {
    return crypto.scryptSync(passphrase, '10', 32)
}

export {
    isAuthenticatedPublisher, isAuthenticatedConsumer
}