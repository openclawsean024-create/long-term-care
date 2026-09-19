import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>長照安心管家</h1>
      <p>v3.0.2 scaffold · 居家照護 B2B2C SaaS MVP</p>
      <p>FR-001 ~ FR-007 詳見 <a href="../PRD/SPEC.md">PRD/SPEC.md</a></p>
      <button onClick={() => setCount(c => c + 1)}>點擊次數：{count}</button>
    </main>
  )
}
