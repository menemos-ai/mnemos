---
date: 2026-05-11
topic: agent-to-agent-docs
---

# Agent-to-Agent Documentation Page

## Problem Frame

Mengintegrasikan Mnemos SDK ke dalam AI agent membutuhkan developer untuk membaca beberapa halaman docs, menulis kode boilerplate, dan mencari nilai env vars yang tersebar di berbagai halaman. Ketika developer menggunakan AI coding assistant (seperti Claude Code, Cursor) atau ketika agent otonom ingin self-integrate, proses ini tidak bisa diotomasi karena tidak ada satu halaman pun yang berisi semua informasi yang cukup untuk AI bekerja tanpa konteks tambahan.

Solusinya adalah satu halaman khusus — `/agent-to-agent` — yang dirancang untuk dikonsumsi AI: berisi blok instruksi kondensasi bergaya system prompt di atas, diikuti referensi lengkap semua operasi SDK, semua env vars dengan nilai aktual, semua types, dan troubleshooting — sehingga AI agent manapun bisa baca halaman ini sekali dan langsung menghasilkan integrasi yang benar.

---

## Actors

- A1. **Human developer**: pemilik project agent yang ingin menambahkan Mnemos; tidak perlu menulis kode sendiri — cukup memberikan URL halaman ini ke AI.
- A2. **AI Coding Assistant** (Claude Code, Cursor, GitHub Copilot, dll.): membaca halaman, menghasilkan dan menulis kode integrasi ke project developer.
- A3. **Autonomous AI Runtime Agent**: agent yang berjalan mandiri dan fetching URL ini untuk memahami cara mengintegrasikan Mnemos ke dalam dirinya sendiri saat runtime.
- A4. **Mnemos SDK** (`@mnemos/sdk`): target integrasi yang dioperasikan oleh A2 atau A3 berdasarkan instruksi dari halaman ini.

---

## Key Flows

- F1. **Coding Assistant Integration**
  - **Trigger:** Developer mengatakan ke AI coding assistant-nya "integrasikan Mnemos ke agent saya, ini docsnya: https://mnemos-docs.vercel.app/agent-to-agent"
  - **Actors:** A1 (trigger), A2 (eksekutor)
  - **Steps:**
    1. A2 fetch atau baca halaman `/agent-to-agent`
    2. A2 baca blok `AGENT START HERE` untuk mendapat konteks ringkas
    3. A2 baca Decision Tree untuk tahu operasi mana yang relevan dengan konteks project A1
    4. A2 baca section detail yang relevan (Install, Configure, operasi yang dibutuhkan)
    5. A2 menulis kode integrasi lengkap ke project A1 berdasarkan halaman ini saja
  - **Outcome:** Kode integrasi Mnemos ada di project A1 tanpa A1 menulis satu baris pun
  - **Covered by:** R1, R2, R3, R4, R5, R6

- F2. **Autonomous Agent Self-Integration**
  - **Trigger:** A3 mendapat instruksi "tambahkan Mnemos memory persistence, referensi: https://mnemos-docs.vercel.app/agent-to-agent"
  - **Actors:** A3 (eksekutor)
  - **Steps:**
    1. A3 fetch halaman `/agent-to-agent` via HTTP
    2. A3 baca seluruh halaman secara linear dari atas ke bawah
    3. A3 ekstrak installation commands, env var values, dan kode inisialisasi
    4. A3 jalankan install, set env vars, dan sisipkan kode ke dalam runtime dirinya
  - **Outcome:** A3 berjalan dengan Mnemos memory persistence aktif, auto-snapshot terjadwal, dan token terdaftar di marketplace
  - **Covered by:** R1, R2, R3, R4, R5, R7

---

## Requirements

**Blok AGENT START HERE**

- R1. Halaman harus membuka dengan section `## AGENT START HERE` yang berisi, dalam satu blok teks yang bisa di-copy, semua informasi minimum untuk memulai integrasi: package names, semua env var keys beserta nilai default-nya, contract addresses aktual, dan contoh `MnemosClient` initialization yang lengkap dan runnable.
- R2. Blok AGENT START HERE tidak boleh mengandung link eksternal atau referensi ke halaman lain — ia harus standalone sehingga agent yang hanya membaca bagian atas halaman sudah bisa memulai.
- R3. Blok AGENT START HERE harus menyertakan meta-instruksi eksplisit yang memberitahu AI cara menggunakan halaman ini: kapan harus baca blok ini saja, kapan harus lanjut ke section detail, dan kapan harus ikuti link referensi.

**Decision Tree**

- R4. Di bawah AGENT START HERE harus ada Decision Tree berbentuk daftar kondisional pendek: "If you want to [X] → go to [Section Y]" — covering semua operasi utama (snapshot, auto-snapshot, list, buy, rent, fork, royalty, load memory, verify access).
- R5. Decision Tree tidak boleh lebih dari 12 baris — padat, bukan exhaustive.

**Sections Operasi**

- R6. Setiap operasi SDK harus punya section sendiri dengan sub-struktur seragam: **Purpose** (satu kalimat), **When to use** (satu kalimat), **Complete code** (runnable tanpa modifikasi kecuali env vars), **Parameters** (tabel key-type-description), **Return value** (type dan fields), **Error handling** (contoh try/catch konkret).
- R7. Tidak boleh ada `...` atau placeholder dalam code examples — setiap example harus copy-paste ready; env vars ditulis sebagai `process.env.NAMA_VAR` atau dengan nilai default hardcoded untuk nilai yang fix (seperti contract addresses dan chain ID).
- R8. Operasi yang harus dicakup: Install & Configure, `snapshot()`, `autoSnapshot()`, `list()`, `buy()`, `rent()`, `fork()`, `payRoyalty()`, `getListing()`, `scanListings()`, `loadMemory()`, `getMemoryInfo()`, `hasAccess()`.
- R9. Section Marketplace Operations harus menjelaskan dengan jelas bahwa `list()`, `buy()`, `rent()`, `fork()`, `payRoyalty()` harus dipanggil setelah `snapshot()` menghasilkan `tokenId` — dependency ini harus eksplisit, bukan implisit dari urutan section.

**Reference Sections**

- R10. Harus ada section **All Environment Variables** yang memuat tabel dengan kolom: `Variable`, `Value / Example`, `Required`, `Description`. Nilai fix (RPC URL, storage node URL, contract addresses, chain ID) harus tercantum langsung — bukan "fill in your value".
- R11. Harus ada section **Type Reference** yang mendefinisikan semua public types yang dipakai di code examples: `MnemosClientConfig`, `MemoryBundle`, `SnapshotResult`, `ListingTerms`, `Listing`. Cukup field names + TypeScript type — tidak perlu ulang prose yang sudah ada di section lain.
- R12. Semua harga dalam code examples harus menggunakan satuan wei (bigint) dengan komentar yang menjelaskan nilai manusianya (misal: `// 1 A0GI`).

**Troubleshooting**

- R13. Harus ada section Troubleshooting yang memuat minimal 5 error paling umum berdasarkan apa yang bisa salah di setiap tahap (missing env var, insufficient balance, approval missing, storage upload fail, wrong chain), beserta penyebab dan solusi eksplisit.

**Aksesibilitas Halaman**

- R14. Halaman harus bisa diakses di route `/agent-to-agent` pada docs site (Docusaurus).
- R15. Halaman harus memiliki frontmatter `slug: /agent-to-agent` agar URL-nya bersih (tanpa `/docs/` prefix).
- R16. Halaman tidak harus masuk sidebar navigasi utama — boleh ada sebagai "hidden page" yang hanya bisa diakses lewat URL langsung. Tidak dihide secara aktif, tapi tidak dipromosikan di sidebar.
- R17. Halaman harus menggunakan title `<title>` yang informatif (misal: "Mnemos Agent Integration — Agent-to-Agent Docs") agar saat AI fetch URL, title yang muncul di HTML head sudah kontekstual.

---

## Acceptance Examples

- AE1. **Covers R1, R2, R7.** Given seseorang copy-paste hanya blok AGENT START HERE ke dalam prompt AI tanpa memberikan konteks lain, when AI diminta "integrate Mnemos", the AI bisa menghasilkan kode inisialisasi `MnemosClient` yang benar dan runnable tanpa perlu bertanya tentang contract addresses atau RPC URL.

- AE2. **Covers R4, R5.** Given agent membaca halaman dari atas, when agent ingin menambahkan auto-snapshot saja (tanpa marketplace), the Decision Tree langsung menunjuk ke Section "Auto-Snapshot" tanpa agent perlu scan seluruh halaman.

- AE3. **Covers R6, R7, R8.** Given agent berada di section `fork()`, when agent copy-paste code example ke project mereka dan mengganti env vars, the code dapat dijalankan langsung tanpa modifikasi tambahan dan menghasilkan child token.

- AE4. **Covers R9.** Given agent membaca section marketplace operations, when agent ingin langsung call `list()` tanpa terlebih dahulu call `snapshot()`, the section secara eksplisit menjelaskan bahwa `tokenId` dari `snapshot()` adalah prerequisite — agent tidak perlu menebak urutan ini.

- AE5. **Covers R10.** Given agent perlu mengisi env vars, when agent membaca section All Environment Variables, the agent menemukan nilai aktual untuk `OG_RPC_URL`, `OG_STORAGE_NODE`, `OG_CHAIN_ID`, `REGISTRY_ADDRESS`, dan `MARKETPLACE_ADDRESS` langsung di tabel — tidak ada yang perlu dicari di halaman lain.

---

## Success Criteria

- Seorang developer bisa memberikan URL halaman ini ke Claude Code (atau AI coding assistant lain) dengan instruksi "integrate Mnemos", dan AI menghasilkan integrasi yang benar dan runnable tanpa follow-up question satu pun.
- Autonomous agent yang fetch URL ini dan membaca halaman secara linear bisa mengekstrak semua yang dibutuhkan untuk install, configure, snapshot, dan list — tanpa perlu follow external links.
- Kode yang dihasilkan AI berdasarkan halaman ini dapat dijalankan di 0G Mainnet tanpa perubahan selain pengisian `AGENT_PRIVATE_KEY`.

---

## Scope Boundaries

- Halaman ini tidak menggantikan halaman SDK detail yang sudah ada — ia adalah entry point khusus AI, bukan pengganti dokumentasi lengkap.
- Halaman ini tidak mencakup deployment kontrak baru — kontrak sudah deployed dan address-nya hardcoded.
- Halaman ini tidak mencakup `WalletAuthGuard` atau autentikasi server-side — itu domain NestJS API, bukan SDK langsung.
- Halaman ini tidak disertai file `llms.txt` di root docs site — itu bisa menjadi pekerjaan terpisah.
- Halaman ini tidak perlu mendukung bahasa selain TypeScript/JavaScript — SDK hanya tersedia untuk TypeScript.
- Halaman ini tidak menyertakan penjelasan konseptual panjang (apa itu 0G, kenapa memory penting) — fokus murni operasional.

---

## Key Decisions

- **Format: Approach A (AGENT START HERE + detail sections)** — karena melayani kedua skenario (coding assistant dan autonomous agent) tanpa memaksa format mesin yang menambah maintenance burden.
- **Full Protocol coverage di satu halaman** — user memilih ini secara eksplisit; halaman akan panjang tapi self-contained untuk semua operasi.
- **Mostly self-contained + links untuk edge cases** — core integration 100% di halaman ini; advanced configuration options boleh link ke SDK detail pages.
- **Semua contract addresses dan nilai fix dicantumkan inline** — tidak ada "check the docs for the address" karena itu membutuhkan agent untuk browse halaman lain.

---

## Dependencies / Assumptions

- Kontrak `MemoryRegistry` dan `MemoryMarketplace` sudah deployed di 0G Mainnet dengan addresses yang tidak akan berubah: `0x848F7000223dd2eBa5ac30b37d52EdA8D058E72E` dan `0xFeb5Ac77Cd7746e2b35825dA800458D660D10209`.
- `@mnemos/sdk` sudah dipublish ke npm dan public types-nya stabil — halaman ini akan outdated kalau API berubah tanpa diupdate.
- Docs site di-deploy ke `https://mnemos-docs.vercel.app` — URL yang disebut di requirement R14/R15 mengacu ke domain ini.
- Docusaurus mendukung `slug` frontmatter untuk mengontrol URL route — diasumsikan sudah dikonfigurasi di `docusaurus.config` yang ada.

---

## Next Steps

→ `/ce-plan` untuk structured implementation planning
