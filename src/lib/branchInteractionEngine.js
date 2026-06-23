import { computeBranchRelations } from './relations.ts'

export {
  HALF_COMBINATIONS,
  SELF_PENALTIES,
  SIX_CLASHES,
  SIX_COMBINATIONS,
  SIX_HARMS,
  THREE_COMBINATIONS,
  THREE_PENALTIES,
} from './relations.ts'

export function getBranchInteractions(branches) {
  if (!Array.isArray(branches) || branches.length === 0) {
    throw new Error('Missing required input')
  }
  return computeBranchRelations(branches)
}
