/**
 * Parsing string input nominal menjadi bilangan bulat positif Rupiah.
 * Mengabaikan karakter titik pemisah, spasi, atau karakter non-angka lainnya.
 * Mengembalikan integer (number) atau null jika input tidak valid atau bernilai 0 / kosong.
 */
export function parseNominal(rawInput: string): number | null {
  if (!rawInput) return null;

  // Hapus titik, spasi, dan karakter non-digit
  const cleanDigits = rawInput.replace(/\D/g, "");
  if (!cleanDigits) return null;

  const parsed = Number(cleanDigits);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export interface ApiClientErrorResult {
  message: string;
  fields?: Record<string, string>;
  isSessionExpired?: boolean;
}

/**
 * Memetakan respons HTTP API atau error jaringan ke pesan tampilan ramah pengguna.
 */
export function mapApiResponseError(
  status: number,
  errorData?: { code?: string; message?: string; fields?: Record<string, string> },
  isRedirected?: boolean
): ApiClientErrorResult {
  if (isRedirected || status === 401) {
    return {
      message: "Sesi berakhir. Silakan masuk lagi.",
      isSessionExpired: true,
    };
  }

  if (status === 422 && errorData?.code === "INSUFFICIENT_BALANCE") {
    return {
      message: "Saldo tidak cukup. Catat pemasukan terlebih dulu.",
    };
  }

  if (status === 400 && errorData?.fields) {
    return {
      message: errorData.message || "Data yang dikirim tidak valid",
      fields: errorData.fields,
    };
  }

  return {
    message: "Terjadi kesalahan. Coba lagi.",
  };
}
