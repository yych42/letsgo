import { writable } from 'svelte/store'
import type { WebRStatus } from './types'

export const webRStatus = writable<WebRStatus>('uninitialized')

let instance: any = null
let initPromise: Promise<any> | null = null

export async function getWebR(): Promise<any> {
    if (instance) return instance
    if (initPromise) return initPromise
    initPromise = initWebR()
    return initPromise
}

export function getStatus() {
    return webRStatus
}

async function initWebR(): Promise<any> {
    try {
        webRStatus.set('initializing')

        const { WebR } = await import('webr')
        instance = new WebR()
        await instance.init()

        webRStatus.set('loading-packages')
        await instance.installPackages(['dplyr'], { quiet: true })
        await instance.evalRVoid('library(dplyr)')

        webRStatus.set('ready')
        return instance
    } catch (err) {
        webRStatus.set('error')
        instance = null
        initPromise = null
        throw err
    }
}
