import type { NodeTypesExt } from '../types'

import * as devTools from './dev-tools'
import * as commons from './commons'

export const nodeTypes: NodeTypesExt = {
    ...devTools,
    ...commons
}
