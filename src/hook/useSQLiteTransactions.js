import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { normalizeFecha } from "../utils/normalizeFecha";

export function useSQLiteTransactions() {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [lista, setLista] = useState([]);
  const [cuentas, setCuentas] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarTransacciones = async () => {
      try {
        const [rows, accountRows] = await Promise.all([
          db.getAllAsync("SELECT * FROM transacciones;"),
          db.getAllAsync(
            "SELECT * FROM cuentas ORDER BY CASE WHEN nombre = 'Efectivo' THEN 0 ELSE 1 END, nombre COLLATE NOCASE;",
          ),
        ]);
        const normalizedRows = rows.map((item) => ({
          ...item,
          fecha: normalizeFecha(item.fecha),
        }));
        if (isMounted) {
          setLista(normalizedRows);
          setCuentas(accountRows);
        }
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
      cuenta_id: Number(payload.cuenta_id),
    };

    try {
      if (editingId) {
        await db.runAsync(
          "UPDATE transacciones SET tipo=?, monto=?, categoria=?, descripcion=?, fecha=?, cuenta_id=? WHERE id=?;",
          [
            normalizedPayload.tipo,
            normalizedPayload.monto,
            normalizedPayload.categoria,
            normalizedPayload.descripcion,
            normalizedPayload.fecha,
            normalizedPayload.cuenta_id,
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
          "INSERT INTO transacciones (tipo, monto, categoria, descripcion, fecha, cuenta_id) VALUES (?, ?, ?, ?, ?, ?);",
          [
            normalizedPayload.tipo,
            normalizedPayload.monto,
            normalizedPayload.categoria,
            normalizedPayload.descripcion,
            normalizedPayload.fecha,
            normalizedPayload.cuenta_id,
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

  const deleteTransaction = async (transaction) => {
    const item =
      typeof transaction === "object"
        ? transaction
        : lista.find((current) => current.id === transaction);
    if (!item) return false;

    const transactionIds = [item.id];

    if (item.categoria === "Transferencia") {
      const isOrigin = item.tipo === "gasto";
      const currentAccount = cuentas.find(
        (cuenta) => cuenta.id === item.cuenta_id,
      );
      const pairedDescription = currentAccount
        ? isOrigin
          ? `Transferencia desde ${currentAccount.nombre}`
          : `Transferencia a ${currentAccount.nombre}`
        : null;

      const pairedTransaction = lista
        .filter(
          (current) =>
            current.id !== item.id &&
            current.categoria === "Transferencia" &&
            current.tipo === (isOrigin ? "ingreso" : "gasto") &&
            Number(current.monto) === Number(item.monto) &&
            normalizeFecha(current.fecha) === normalizeFecha(item.fecha) &&
            current.descripcion === pairedDescription,
        )
        .sort(
          (first, second) =>
            Math.abs(Number(first.id) - Number(item.id)) -
            Math.abs(Number(second.id) - Number(item.id)),
        )[0];

      if (pairedTransaction) transactionIds.push(pairedTransaction.id);
    }

    try {
      await db.withTransactionAsync(async () => {
        for (const id of transactionIds) {
          await db.runAsync("DELETE FROM transacciones WHERE id=?;", [id]);
        }
      });
      setLista((current) =>
        current.filter((current) => !transactionIds.includes(current.id)),
      );
      return true;
    } catch (error) {
      globalThis.console.error("Error eliminando transacción:", error);
      return false;
    }
  };

  const saveTransfer = async ({ monto, fecha, origen, destino }) => {
    const normalizedDate = normalizeFecha(fecha);
    const originTransaction = {
      tipo: "gasto",
      monto,
      categoria: "Transferencia",
      descripcion: `Transferencia a ${destino.nombre}`,
      fecha: normalizedDate,
      cuenta_id: origen.id,
    };
    const destinationTransaction = {
      tipo: "ingreso",
      monto,
      categoria: "Transferencia",
      descripcion: `Transferencia desde ${origen.nombre}`,
      fecha: normalizedDate,
      cuenta_id: destino.id,
    };

    try {
      let originId;
      let destinationId;
      await db.withTransactionAsync(async () => {
        const destinationResult = await db.runAsync(
          "INSERT INTO transacciones (tipo, monto, categoria, descripcion, fecha, cuenta_id) VALUES (?, ?, ?, ?, ?, ?);",
          Object.values(destinationTransaction),
        );
        const originResult = await db.runAsync(
          "INSERT INTO transacciones (tipo, monto, categoria, descripcion, fecha, cuenta_id) VALUES (?, ?, ?, ?, ?, ?);",
          Object.values(originTransaction),
        );
        destinationId = destinationResult.lastInsertRowId ?? null;
        originId = originResult.lastInsertRowId ?? null;
      });
      setLista((current) => [
        ...current,
        { ...originTransaction, id: originId },
        { ...destinationTransaction, id: destinationId },
      ]);
      return true;
    } catch (error) {
      globalThis.console.error("Error guardando transferencia:", error);
      return false;
    }
  };

  const createAccount = async (nombre, color) => {
    const normalizedName = nombre.trim();
    if (!normalizedName || cuentas.length >= 10) return null;

    try {
      const result = await db.runAsync(
        "INSERT INTO cuentas (nombre, color) VALUES (?, ?);",
        [normalizedName, color],
      );
      const account = {
        id: result.lastInsertRowId,
        nombre: normalizedName,
        color,
      };
      setCuentas((current) => [...current, account]);
      return account;
    } catch (error) {
      globalThis.console.error("Error creando cuenta:", error);
      return null;
    }
  };

  const renameAccount = async (id, nombre, color) => {
    const normalizedName = nombre.trim();
    if (!normalizedName) return false;

    try {
      await db.runAsync("UPDATE cuentas SET nombre=?, color=? WHERE id=?;", [
        normalizedName,
        color,
        id,
      ]);
      setCuentas((current) =>
        current.map((cuenta) =>
          cuenta.id === id
            ? { ...cuenta, nombre: normalizedName, color }
            : cuenta,
        ),
      );
      return true;
    } catch (error) {
      globalThis.console.error("Error renombrando cuenta:", error);
      return false;
    }
  };

  const deleteAccount = async (accountId, targetAccountId) => {
    if (accountId === targetAccountId) return false;

    try {
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "UPDATE transacciones SET cuenta_id=? WHERE cuenta_id=?;",
          [targetAccountId, accountId],
        );
        await db.runAsync("DELETE FROM cuentas WHERE id=?;", [accountId]);
      });
      setLista((current) =>
        current.map((item) =>
          item.cuenta_id === accountId
            ? { ...item, cuenta_id: targetAccountId }
            : item,
        ),
      );
      setCuentas((current) =>
        current.filter((cuenta) => cuenta.id !== accountId),
      );
      return true;
    } catch (error) {
      globalThis.console.error("Error eliminando cuenta:", error);
      return false;
    }
  };

  return {
    lista,
    cuentas,
    saveTransaction,
    saveTransfer,
    deleteTransaction,
    createAccount,
    renameAccount,
    deleteAccount,
    loading,
  };
}
