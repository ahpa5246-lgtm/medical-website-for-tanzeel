import { supabase } from "@/lib/supabase"
import type { TrainingTask } from "@/features/content/types"
export async function getTrainingProgress() {
  const { data, error } = await supabase
    .from("training_progress")
    .select("stage_id,xp")
    .order("completed_at")
  if (error) throw error
  return data ?? []
}
export async function getTrainingTask(stageId: string) {
  const { data, error } = await supabase
    .from("training_tasks")
    .select("*")
    .eq("stage_id", stageId)
    .eq("is_published", true)
    .maybeSingle()
  if (error) throw error
  return data as TrainingTask | null
}
export async function submitTraining(stageId: string, answers: number[]) {
  const { data, error } = await supabase.rpc("complete_training_stage", {
    p_stage_id: stageId,
    p_answers: answers,
  })
  if (error) throw error
  return data
}
export async function resetTraining() {
  const { error } = await supabase.rpc("reset_training_progress", {})
  if (error) throw error
}
