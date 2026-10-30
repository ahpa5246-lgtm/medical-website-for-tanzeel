import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, Clock, BookOpen, ChevronLeft } from "lucide-react"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import { MOCK_ARTICLES, ARTICLE_CATEGORIES } from "@/data/mockData"
import WaveDivider from "@/components/decorative/WaveDivider"
import FingerprintRidges from "@/components/decorative/FingerprintRidges"
import DemoLabel from "@/components/DemoLabel"
import PatternField from "@/components/decor/PatternField"
import HandUnderline from "@/components/decor/HandUnderline"
import SketchAccents from "@/components/decor/SketchAccents"

export default function ArticleList() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")

  const filtered = MOCK_ARTICLES.filter((a) => {
    const matchSearch =
      !search ||
      a.title.includes(search) ||
      a.excerpt.includes(search) ||
      a.authorName.includes(search)
    const matchCategory = !category || a.categoryId === category
    return matchSearch && matchCategory
  })

  return (
    <div dir="rtl" className="editorial-articles min-h-screen">
      <PatternField variant="grain" className="articles-paper-pattern" />
      {/* Page hero strip */}
      <div className="relative isolate overflow-hidden border-b border-slate-100 bg-gradient-to-l from-primary-50/50 to-white py-10 pb-16">
        <FingerprintRidges className="-right-10 -top-12 z-0 h-[26rem] w-[26rem] opacity-70" />
        <SketchAccents motif="cards" className="articles-hero-sketch" />
        <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6">
          <p className="section-kicker mb-2">مقالات عرض خيالية غير مراجعة</p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            <HandUnderline color="#e9b75c">
              نماذج شكلية للمحتوى فقط
            </HandUnderline>
          </h1>
          <p className="text-slate-500 text-sm max-w-2xl leading-7">
            المقالات والمؤلفون والمراجعات أمثلة خيالية، ولم يراجعها مختصون. لا
            تعتمد عليها كمعلومات طبية.
          </p>
        </div>
        <WaveDivider color="#ffffff" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            aria-pressed={!category}
            onClick={() => setCategory("")}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              !category
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700"
            }`}
          >
            الكل
          </button>
          {ARTICLE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              aria-pressed={category === cat.id}
              onClick={() => setCategory(cat.id === category ? "" : cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === cat.id
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700"
              }`}
            >
              {cat.nameAr}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute inset-y-0 start-0 ms-3 my-auto w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            aria-label="ابحث في المقالات"
            placeholder="ابحث في المقالات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>

        <p role="status" className="mb-4 text-sm text-slate-600">
          {filtered.length} مقالات تطابق البحث
        </p>
        {/* Articles grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">
              لا توجد مقالات تطابق بحثك
            </p>
            <button
              onClick={() => {
                setSearch("")
                setCategory("")
              }}
              className="text-sm text-primary-600 underline mt-2"
            >
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                className="group"
              >
                <Card
                  hover
                  padding="none"
                  className="overflow-hidden h-full flex flex-col"
                >
                  {/* Cover */}
                  <div className="relative h-44 bg-primary-100 overflow-hidden">
                    <img
                      src={article.coverUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 start-3">
                      <Badge
                        variant="default"
                        className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs"
                      >
                        {article.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <DemoLabel>مقال ومؤلف ومراجعة خيالية</DemoLabel>
                    <h2 className="font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors text-sm mb-2">
                      {article.title}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-3 border-t border-slate-50">
                      <span className="font-medium text-slate-600">
                        {article.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTimeMinutes} دقائق
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Write for us CTA */}
        <div className="mt-12 rounded-3xl bg-primary-700 text-white p-6 sm:p-8 shadow-[0_16px_50px_rgba(11,74,95,.22)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black mb-1">
                طبيب أو اختصاصي؟ شارك معرفتك
              </h3>
              <p className="text-primary-100 text-sm leading-7">
                محرر المقالات قيد التطوير. عند إطلاق النشر الحقيقي، ستخضع
                المقالات لمراجعة طبية قبل إتاحتها للجمهور.
              </p>
            </div>
            <Link to="/articles/new" className="shrink-0">
              <button className="flex items-center gap-1.5 bg-white text-primary-700 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors shadow-md">
                المحرر قيد التطوير <ChevronLeft className="w-4 h-4 rtl-flip" />
              </button>
            </Link>
          </div>
        </div>
      </div>
      {/* close inner max-w div */}
    </div>
  )
}
