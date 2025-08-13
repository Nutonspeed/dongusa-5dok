'use client';

export default function AdminError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div style={{ padding: 16 }}>
      <h2>เกิดข้อผิดพลาดในหน้าแอดมิน</h2>
      <p>{error?.message || "Unknown error"}</p>
      <small>{error?.digest}</small>
    </div>
  );
}

