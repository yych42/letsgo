import type { NodeTypesExt } from '../types'

import * as scribble from './scribble'
import * as statistics from './statistics'

export const nodeTypes: NodeTypesExt = {
    ...scribble,
    ...statistics
}
