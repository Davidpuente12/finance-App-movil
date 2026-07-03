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
      return /^(\d{4}-\d{2}-\d{2})$/.test(onlyDate) ? onlyDate : fecha;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        let db = null;
        if (typeof SQLite.openDatabase === "function") {
          db = SQLite.openDatabase("finanzas.db");
        } else if (typeof SQLite.openDatabaseAsync === "function") {
          db = await SQLite.openDatabaseAsync("finanzas.db");
        } else if (typeof SQLite.openDatabaseSync === "function") {
          globalThis.console.warn(
            "expo-sqlite: usando openDatabaseSync como fallback",
          );
          db = SQLite.openDatabaseSync("finanzas.db");
        } else {
          throw new Error(
            "expo-sqlite: ninguna función de apertura disponible",
          );
        }

        dbRef.current = db;

        if (typeof db.transaction === "function") {
          await new Promise((resolve, reject) => {
            try {
              db.transaction(
                (tx) => {
                  if (!tx || typeof tx.executeSql !== "function") {
                    throw new Error(
                      "expo-sqlite: tx.executeSql no es una función",
                    );
                  }

                  tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS transacciones (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      tipo TEXT NOT NULL,
                      monto REAL NOT NULL,
                      categoria TEXT,
                      descripcion TEXT,
                      fecha TEXT NOT NULL
                    );`,
                  );

                  tx.executeSql(
                    "SELECT * FROM transacciones;",
                    [],
                    (_, result) => {
                      const rows = [];
                      for (let i = 0; i < result.rows.length; i++) {
                        rows.push(result.rows.item(i));
                      }

                      const normalizedRows = rows.map((item) => ({
                        ...item,
                        fecha: normalizeFecha(item.fecha),
                      }));

                      if (isMounted) setLista(normalizedRows);
                      resolve();
                    },
                    (_, error) => {
                      globalThis.console.warn(
                        "Error leyendo transacciones:",
                        error,
                      );
                      reject(error);
                      return false;
                    },
                  );
                },
                (txError) => {
                  globalThis.console.error(
                    "Error dentro de db.transaction:",
                    txError,
                  );
                  reject(txError);
                },
              );
            } catch (err) {
              reject(err);
            }
          });
        } else if (typeof db.execAsync === "function") {
          try {
            // Crear tabla usando execAsync (no retorna filas)
            await db.execAsync(
              `CREATE TABLE IF NOT EXISTS transacciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo TEXT NOT NULL,
                monto REAL NOT NULL,
                categoria TEXT,
                descripcion TEXT,
                fecha TEXT NOT NULL
              );`,
            );

            // Leer filas preferiendo API conveniente si existe
            let rows = [];
            if (typeof db.getAllAsync === "function") {
              rows = await db.getAllAsync("SELECT * FROM transacciones;");
            } else if (typeof db.getEachAsync === "function") {
              for await (const r of db.getEachAsync(
                "SELECT * FROM transacciones;",
              )) {
                rows.push(r);
              }
            } else {
              // Fallback a execAsync: algunas implementaciones retornan null
              const res = await db.execAsync("SELECT * FROM transacciones;");
              globalThis.console.log("db.execAsync select result:", res);
              if (Array.isArray(res) && res.length && res[0].values) {
                rows = res[0].values;
              } else if (res && res.rows) {
                for (let i = 0; i < res.rows.length; i++)
                  rows.push(res.rows.item(i));
              } else if (res == null) {
                globalThis.console.log(
                  "db.execAsync devolvió null; no hay filas",
                );
                rows = [];
              }
            }

            const normalizedRows = rows.map((item) => ({
              ...item,
              fecha: normalizeFecha(item.fecha),
            }));
            if (isMounted) setLista(normalizedRows);
          } catch (err) {
            globalThis.console.error(
              "Error usando db.execAsync/getAllAsync:",
              err,
            );
          }
        } else if (typeof db.exec === "function") {
          try {
            const res = await new Promise((resolve, reject) =>
              db.exec(
                "SELECT * FROM transacciones;",
                [],
                (r) => resolve(r),
                (e) => reject(e),
              ),
            );
            globalThis.console.log("db.exec result:", res);
          } catch (err) {
            globalThis.console.error("Error usando db.exec:", err);
          }
        } else {
          globalThis.console.error(
            "expo-sqlite: no se encontró API compatible en el objeto db",
            Object.keys(db),
          );
        }
      } catch (error) {
        globalThis.console.error(
          "Error inicializando la base de datos:",
          error,
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveTransaction = async (payload, editingId) => {
    const db = dbRef.current;
    if (!db) {
      globalThis.console.warn("La base de datos todavía no está lista.");
      return;
    }

    const normalizedPayload = {
      ...payload,
      fecha: normalizeFecha(payload.fecha),
    };

    try {
      if (typeof db.runAsync === "function") {
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

          const insertId = result?.lastInsertRowId ?? result?.insertId ?? null;
          setLista((current) => [
            ...current,
            { ...normalizedPayload, id: insertId },
          ]);
        }
        return;
      }

      if (typeof db.transaction === "function") {
        db.transaction(
          (tx) => {
            if (editingId) {
              tx.executeSql(
                "UPDATE transacciones SET tipo=?, monto=?, categoria=?, descripcion=?, fecha=? WHERE id=?;",
                [
                  normalizedPayload.tipo,
                  normalizedPayload.monto,
                  normalizedPayload.categoria,
                  normalizedPayload.descripcion,
                  normalizedPayload.fecha,
                  editingId,
                ],
                () => {
                  setLista((current) =>
                    current.map((item) =>
                      item.id === editingId
                        ? { ...normalizedPayload, id: editingId }
                        : item,
                    ),
                  );
                },
                (_, error) => {
                  globalThis.console.error(
                    "Error actualizando transacción:",
                    error,
                  );
                  return false;
                },
              );
            } else {
              tx.executeSql(
                "INSERT INTO transacciones (tipo, monto, categoria, descripcion, fecha) VALUES (?, ?, ?, ?, ?);",
                [
                  normalizedPayload.tipo,
                  normalizedPayload.monto,
                  normalizedPayload.categoria,
                  normalizedPayload.descripcion,
                  normalizedPayload.fecha,
                ],
                (_, result) => {
                  const insertId = result.insertId ?? null;
                  setLista((current) => [
                    ...current,
                    { ...normalizedPayload, id: insertId },
                  ]);
                },
                (_, error) => {
                  globalThis.console.error(
                    "Error insertando transacción:",
                    error,
                  );
                  return false;
                },
              );
            }
          },
          (txError) => {
            globalThis.console.error("Error en transaction (save):", txError);
          },
        );
        return;
      }

      throw new Error(
        "expo-sqlite: no se encontró una API compatible para guardar datos",
      );
    } catch (error) {
      globalThis.console.error("Error guardando transacción:", error);
    }
  };

  const deleteTransaction = async (id) => {
    const db = dbRef.current;
    if (!db) {
      globalThis.console.warn("La base de datos todavía no está lista.");
      return;
    }

    try {
      if (typeof db.runAsync === "function") {
        await db.runAsync("DELETE FROM transacciones WHERE id=?;", [id]);
        setLista((current) => current.filter((item) => item.id !== id));
        return;
      }

      if (typeof db.transaction === "function") {
        db.transaction(
          (tx) => {
            tx.executeSql(
              "DELETE FROM transacciones WHERE id=?;",
              [id],
              () => {
                setLista((current) => current.filter((item) => item.id !== id));
              },
              (_, error) => {
                globalThis.console.error(
                  "Error eliminando transacción:",
                  error,
                );
                return false;
              },
            );
          },
          (txError) => {
            globalThis.console.error("Error en transaction (delete):", txError);
          },
        );
        return;
      }

      throw new Error(
        "expo-sqlite: no se encontró una API compatible para eliminar datos",
      );
    } catch (error) {
      globalThis.console.error("Error eliminando transacción:", error);
    }
  };

  return { lista, saveTransaction, deleteTransaction, loading };
}
