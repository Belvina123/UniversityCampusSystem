import { useEffect, useState, type FormEvent } from "react";
import type { DebtDto } from "@smart-campus/shared-types";
import { useAuth } from "../lib/auth";

export function FinancialPage() {
  const { api, user } = useAuth();
  const [debts, setDebts] = useState<DebtDto[]>([]);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DebtDto | null>(null);
  const allowed = !!user && ["STUDENT", "FINANCE", "ADMIN"].includes(user.role);
  const manager = !!user && ["FINANCE", "ADMIN"].includes(user.role);
  async function reload() {
    const res = await api.financialDebts({ offset, limit: 20 });
    setDebts(res.data);
  }
  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }

    let active = true;
    setSelected(null);
    setLoading(true);
    setError("");

    api
      .financialDebts({ offset, limit: 20 })
      .then((res) => {
        if (active) setDebts(res.data);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [api, allowed, offset]);
  async function submit(
    event: FormEvent<HTMLFormElement>,
    kind: "debt" | "payment" | "analysis",
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (kind === "debt")
        await api.createDebt({
          ...fields,
          amount: Number(fields.amount),
          dueDate: new Date(String(fields.dueDate)).toISOString(),
        });
      if (kind === "payment" && selected)
        await api.createPayment({
          ...fields,
          debtId: selected.id,
          amountPaid: selected.amount,
        });
      if (kind === "analysis" && selected)
        await api.createAnalysisRequest({ ...fields, debtId: selected.id });
      form.reset();
      setSelected(null);
      setMessage("Operação concluída.");
      await reload();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível concluir a operação.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!allowed) return <p>O seu perfil não tem acesso à gestão financeira.</p>;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Gestão financeira</h1>
      <p>
        {manager
          ? "Consultar dívidas e registar operações da tesouraria."
          : "Consultar as suas dívidas e submeter contestações."}
      </p>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {loading ? <p role="status">A carregar dívidas...</p> : null}
      {message && <p role="status">{message}</p>}
      {manager && (
        <form
          className="grid gap-3 rounded border bg-white p-4"
          onSubmit={(e) => void submit(e, "debt")}
        >
          <h2 className="font-bold">Nova dívida</h2>
          <label>
            Identificador do utilizador estudante{" "}
            <input className="border p-2" name="studentId" required />
          </label>
          <label>
            Descrição{" "}
            <input className="border p-2" name="title" required minLength={3} />
          </label>
          <label>
            Valor (MZN){" "}
            <input
              className="border p-2"
              name="amount"
              type="number"
              min="0.01"
              max="1000000"
              step="0.01"
              required
            />
          </label>
          <label>
            Origem{" "}
            <input
              className="border p-2"
              name="origin"
              defaultValue="TUITION"
              required
            />
          </label>
          <label>
            Vencimento{" "}
            <input
              className="border p-2"
              name="dueDate"
              type="datetime-local"
              required
            />
          </label>
          <button
            disabled={busy}
            className="rounded bg-campus-deep p-2 text-white"
          >
            Registar dívida
          </button>
        </form>
      )}
      {!loading && !error ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full bg-white text-left">
              <caption className="text-left font-bold">
                Dívidas — página {offset / 20 + 1}
              </caption>
              <thead>
                <tr>
                  {[
                    "Descrição",
                    "Valor (MZN)",
                    "Vencimento",
                    "Estado",
                    "Acção",
                  ].map((label) => (
                    <th className="p-3" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {debts.map((debt) => (
                  <tr key={debt.id} className="border-t">
                    <td className="p-3">{debt.title}</td>
                    <td>{debt.amount.toFixed(2)}</td>
                    <td>
                      {new Date(debt.dueDate).toLocaleDateString("pt-MZ")}
                    </td>
                    <td>{debt.status}</td>
                    <td>
                      {["PENDENTE", "VENCIDA"].includes(debt.status) && (
                        <button
                          disabled={busy}
                          className="underline"
                          onClick={() => setSelected(debt)}
                        >
                          {manager ? "Registar pagamento" : "Contestar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!debts.length && <p>Não existem dívidas nesta página.</p>}
          <div className="flex gap-4">
            <button
              disabled={busy || offset === 0}
              onClick={() => setOffset((n) => n - 20)}
            >
              Anterior
            </button>
            <button
              disabled={busy || debts.length < 20}
              onClick={() => setOffset((n) => n + 20)}
            >
              Seguinte
            </button>
          </div>
        </>
      ) : null}
      {selected && (
        <form
          className="grid gap-3 rounded border bg-white p-4"
          onSubmit={(e) => void submit(e, manager ? "payment" : "analysis")}
        >
          <h2 className="font-bold">
            {selected.title} — {selected.amount.toFixed(2)} MZN
          </h2>
          {manager ? (
            <>
              <label>
                Método{" "}
                <select name="paymentMethod">
                  <option value="BANK_TRANSFER">Transferência bancária</option>
                  <option value="CASH_DEPOSIT">Depósito</option>
                  <option value="MOBILE_MONEY">Carteira móvel</option>
                  <option value="POS">POS</option>
                </select>
              </label>
              <label>
                Referência{" "}
                <input
                  name="referenceCode"
                  required
                  minLength={4}
                  maxLength={80}
                  className="border p-2"
                />
              </label>
            </>
          ) : (
            <label>
              Justificação{" "}
              <textarea
                name="reason"
                required
                minLength={10}
                className="border p-2"
              />
            </label>
          )}
          <button
            disabled={busy}
            className="rounded bg-campus-deep p-2 text-white"
          >
            {manager ? "Confirmar pagamento integral" : "Submeter contestação"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setSelected(null)}
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
}
