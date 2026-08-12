import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { normalizeFecha } from "../utils/normalizeFecha";

export function useSQLiteTransactions() {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [lista, setLista] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarTransacciones = async () => {
      try {
        const rows = await db.getAllAsync("SELECT * FROM transacciones;");
        const normalizedRows = rows.map((item) => ({
          ...item,
          fecha: normalizeFecha(item.fecha),
        }));
        if (isMounted) setLista(normalizedRows);
      } catch (error) {
        globalThis.console.error("Error cargando transacciones:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    cargarTransacciones();

    return () => {
      isMounted = false;
    };
  }, [db]);

  const saveTransaction = async (payload, editingId) => {
    const normalizedPayload = {
      ...payload,
      fecha: normalizeFecha(payload.fecha),
    };

    try {
      if (editingId) {
        await db.runAsync(
          "UPDATE transacciones SET tipo=?, monto=?, categoria=?, descripcion=?, fecha=? WHERE id=?;",
          [
            normalizedPayload.tipo,
            normalizedPayload.monto,
            normalizedPayload.categoria,
            normalizedPayload.descripcion,
            normalizedPayload.fecha,
            editingId,
          ],
        );
        setLista((current) =>
          current.map((item) =>
            item.id === editingId
              ? { ...normalizedPayload, id: editingId }
              : item,
          ),
        );
      } else {
        const result = await db.runAsync(
          "INSERT INTO transacciones (tipo, monto, categoria, descripcion, fecha) VALUES (?, ?, ?, ?, ?);",
          [
            normalizedPayload.tipo,
            normalizedPayload.monto,
            normalizedPayload.categoria,
            normalizedPayload.descripcion,
            normalizedPayload.fecha,
          ],
        );
        setLista((current) => [
          ...current,
          { ...normalizedPayload, id: result.lastInsertRowId ?? null },
        ]);
      }
      return true;
    } catch (error) {
      globalThis.console.error("Error guardando transacción:", error);
      return false;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await db.runAsync("DELETE FROM transacciones WHERE id=?;", [id]);
      setLista((current) => current.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      globalThis.console.error("Error eliminando transacción:", error);
      return false;
    }
  };

  return { lista, saveTransaction, deleteTransaction, loading };
}
