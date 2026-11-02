import { walletBalance } from "@/lib/calc";
import { formatRupiah } from "@/lib/format";
import { WALLET_TYPE_LABEL, type AppData } from "@/lib/types";
import { Card, EmptyState, btnQuiet } from "./ui";

export function WalletPanel({
  data,
  onManage,
}: {
  data: AppData;
  onManage: () => void;
}) {
  return (
    <Card
      title="Dompet"
      question="Berapa uang di tiap tempat penyimpanan?"
      action={
        data.wallets.length > 0 ? (
          <button type="button" onClick={onManage} className={`${btnQuiet} h-9 px-3`}>
            Kelola
          </button>
        ) : undefined
      }
    >
      {data.wallets.length === 0 ? (
        <EmptyState
          title="Belum ada dompet"
          hint="Tambahkan dompet beserta saldo awalnya. Saldo dihitung dari transaksi."
          action={
            <button type="button" onClick={onManage} className={btnQuiet}>
              Tambah dompet
            </button>
          }
        />
      ) : (
        <ul className="divide-y divide-line">
          {data.wallets.map((w) => (
            <li key={w.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{w.name}</p>
                <p className="text-xs text-muted">{WALLET_TYPE_LABEL[w.type]}</p>
              </div>
              <p className="num text-sm font-bold">
                {formatRupiah(walletBalance(w, data.transactions))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
