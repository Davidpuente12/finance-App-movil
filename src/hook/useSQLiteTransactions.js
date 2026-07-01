import { useEffect, useRef, useState } from "react";
import * as SQLite from "expo-sqlite";

export function useSQLiteTransactions() {
  const [loading, setLoading] = useState(true);
  const [lista, setLista] = useState([]);
  const dbRef = useRef(null);

  const normalizeFecha = (fecha) => {
    if (typeof fecha !== "string") return "";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) {
      const onlyDate = fecha.trim().split("T")[0];
      return /^\d{4}-\d{2}-\d{2}$/.test(onlyDate) ? onlyDate : fecha;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Abrir base de datos, crear tabla y cargar transacciones al iniciar
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const db = SQLite.openDatabaseSync("finanzas.db");
        dbRef.current = db;

        db.execSync(`
          CREATE TABLE IF NOT EXISTS transacciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL,
            monto REAL NOT NULL,
            categoria TEXT,
            descripcion TEXT,
            fecha TEXT NOT NULL
          );
        `);

        const rows = db.getAllSync("SELECT * FROM transacciones;");
        const normalizedRows = rows.map((item) => ({
          ...item,
          fecha: normalizeFecha(item.fecha),
        }));
        if (isMounted) setLista(normalizedRows);
      } catch (error) {
        console.error("Error inicializando la base de datos:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Insertar o actualizar
  const saveTransaction = async (payload, editingId) => {
    const db = dbRef.current;
    if (!db) {
      console.warn("La base de datos todavía no está lista.");
      return;
    }

    try {
      if (editingId) {
        db.runSync(
          "UPDATE transacciones SET tipo=?, monto=?, categoria=?, descripcion=?, fecha=? WHERE id=?;",
          [
            payload.tipo,
            payload.monto,
            payload.categoria,
            payload.descripcion,
            payload.fecha,
            editingId,
          ],
        );

        setLista((current) =>
          current.map((item) =>
            item.id === editingId ? { ...payload, id: editingId } : item,
          ),
        );
      } else {
        const normalizedPayload = {
          ...payload,
          fecha: normalizeFecha(payload.fecha),
        };

        const result = db.runSync(
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
          { ...normalizedPayload, id: result.lastInsertRowId },
        ]);
      }
    } catch (error) {
      console.error("Error guardando transacción:", error);
    }
  };

  // Eliminar
  const deleteTransaction = async (id) => {
    const db = dbRef.current;
    if (!db) {
      console.warn("La base de datos todavía no está lista.");
      return;
    }

    try {
      db.runSync("DELETE FROM transacciones WHERE id=?;", [id]);
      setLista((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error eliminando transacción:", error);
    }
  };

  return { lista, saveTransaction, deleteTransaction, loading };
}
