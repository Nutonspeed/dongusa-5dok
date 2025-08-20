"use client"


type UnderConstructionProps = {
  featureName?: string
  message?: string
  // If provided and true, shows a smaller inline banner instead of a full page
  inline?: boolean
  // Optional action button (e.g., go back, contact, retry)
  actionText?: string
  onAction?: () => void
  // Optional additional info (e.g., ETA, ticket/link)
  details?: string
}

/**
 * UnderConstruction
 * Use this component to guard pages/sections/features that are not ready.
 * It prevents hard crashes and communicates status clearly to users/admins.
 *
 * Usage:
 *  - Full page fallback:
 *      <UnderConstruction featureName="AI Recommendations" />
 *
 *  - Inline banner:
 *      <UnderConstruction inline featureName="Bulk Export" />
 */
export default function UnderConstruction({
  featureName = "ฟีเจอร์นี้",
  message,
  inline = false,
  actionText,
  onAction,
  details,
}: UnderConstructionProps) {
  const Title = () => (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">⚠️</span>
      <h2 className="text-lg font-semibold text-gray-900">{featureName} ยังไม่พร้อมใช้งาน</h2>
    </div>
  )

  const Body = () => (
    <>
      <p className="text-sm text-gray-600 mt-2">
        {message ??
          "ระบบกำลังเตรียมความพร้อม/ทดสอบอยู่ชั่วคราว เพื่อป้องกันไม่ให้ระบบล่ม ฟีเจอร์นี้ถูกปิดไว้ก่อน"}
      </p>
      {details ? (
        <div className="mt-2 rounded-md bg-gray-50 p-2 text-xs text-gray-500">{details}</div>
      ) : null}
      {actionText ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {actionText}
          </button>
        </div>
      ) : null}
      <p className="mt-4 text-xs text-gray-500">
        ต้องการความช่วยเหลือ? ติดต่อผู้ดูแลระบบหรือรีเฟรชหน้านี้ภายหลัง
      </p>
    </>
  )

  if (inline) {
    return (
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
        <Title />
        <Body />
      </div>
    )
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4">
      <div className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Title />
        <Body />
      </div>
    </main>
  )
}
