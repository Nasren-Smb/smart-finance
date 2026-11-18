export default function TransaksiPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      <div className="pb-2 border-b border-line">
        <h1 className="text-xl lg:text-2xl font-bold text-text-main">Transaksi</h1>
      </div>
      <div className="rounded-2xl bg-surface p-6 border border-line">
        <p className="text-text-secondary text-sm">
          Daftar riwayat transaksi akan ditampilkan di sini pada langkah berikutnya.
        </p>
      </div>
    </div>
  );
}
