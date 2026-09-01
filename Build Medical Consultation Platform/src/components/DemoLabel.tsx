export default function DemoLabel({ children = "بيانات خيالية للعرض" }) {
  return (
    <span className="inline-flex rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-black text-violet-800">
      {children}
    </span>
  )
}
