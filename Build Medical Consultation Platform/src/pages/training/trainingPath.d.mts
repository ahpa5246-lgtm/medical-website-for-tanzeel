export type TrainingStage = {
  id: string
  title: string
  shortTitle: string
  type: string
  minutes: number
  xp: number
  icon: string
  brief: string
}

export type TrainingWorld = {
  id: string
  number: string
  title: string
  eyebrow: string
  description: string
  tone: "teal" | "blue" | "gold"
  stages: TrainingStage[]
}

export type StageAvailability = "complete" | "active" | "locked"

export declare const TRAINING_WORLDS: TrainingWorld[]
export declare const ALL_STAGES: TrainingStage[]
export function getStageAvailability(
  stageId: string,
  completedIds: string[],
): StageAvailability
export function getTrainingProgress(completedIds: string[]): {
  completed: number
  total: number
  percent: number
  xp: number
}
export function findTrainingStage(stageId: string): TrainingStage | undefined
