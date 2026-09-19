import Badge from "@/components/ui/Badge"

export default function DoctorKindBadge({
  kind,
}: {
  kind: "fictional_demo" | "real_provider"
}) {
  return kind === "fictional_demo" ? (
    <Badge variant="warning">ملف تعريفي تجريبي</Badge>
  ) : (
    <Badge variant="primary">مزود صحي موثق</Badge>
  )
}
