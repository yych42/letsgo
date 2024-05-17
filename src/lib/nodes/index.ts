import type { NodeTypesExt } from '../types'

import * as scribble from './dev-tools'
import * as statistics from './statistics'

export const nodeTypes: NodeTypesExt = {
    ...scribble,
    ...statistics
}
