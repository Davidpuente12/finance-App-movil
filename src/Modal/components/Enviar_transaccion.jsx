import { useEffect, useState } from "react";
import { categorias_gastos, categorias_ingresos } from "../../utils/categorias";
import { formatearMonto } from "../../utils/formatearMonto";

function EnviarTransaccion({
  DatosDelFormulario,
  transaccionAeditar,
  tipoDeTransaccion,
  formRef,
}) {
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");
  const [dateValue, setDateValue] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (transaccionAeditar) {
      setCategoria(transaccionAeditar.categoria);
      setMonto(transaccionAeditar.monto.toString());
      setDateValue(transaccionAeditar.fecha);
      setDescripcion(transaccionAeditar.descripcion || "");
    } else {
      setCategoria("");
      setMonto("");
      setDescripcion("");
    }
  }, [transaccionAeditar]);

  function datosDeEnvio() {
    let parcedMonto = parseFloat(monto);

    DatosDelFormulario({
      monto: parcedMonto,
      categoria,
      fecha: dateValue,
      descripcion,
    });
  }

  const montoFormat = monto ? formatearMonto(Number(monto)) : "";
  function handleMontoChange(event) {
    const raw = event.target.value.replace(/\D/g, "");
    setMonto(raw);
  }

  return (
    <>
      {tipoDeTransaccion === "ingreso" ? (
        <div className="seccion-modal-formulario">
          <ul className="categories-list">
            {categorias_ingresos.map((item, index) => (
              <li
                className="categories-items"
                key={index}
                style={{ background: item.color }}
                onClick={() => setCategoria(item.name)}
              >
                <span>{item.icon}</span>
              </li>
            ))}
          </ul>

          <form
            ref={formRef}
            className="formulario"
            onSubmit={(event) => {
              event.preventDefault();
              datosDeEnvio();
            }}
          >
            <div>
              <input
                type="text"
                placeholder="Categoria"
                value={categoria}
                required
                onChange={(event) => setCategoria(event.target.value)}
                className={categoria && "input-active"}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Monto"
                required
                value={montoFormat}
                onChange={handleMontoChange}
                className={montoFormat && "input-active"}
              />
              <input
                type="date"
                value={dateValue}
                onChange={(event) => setDateValue(event.target.value)}
              />
              <input
                type="text"
                placeholder="Descripcion"
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                className={descripcion && "input-active"}
              />
            </div>
            <button type="submit">
              {transaccionAeditar ? "Guardar cambios" : "Enviar"}
            </button>
          </form>
        </div>
      ) : (
        // gastos
        <div className="seccion-modal-formulario">
          <ul className="categories-list">
            {categorias_gastos.map((item, index) => (
              <li
                className="categories-items"
                key={index}
                style={{ background: item.color }}
                onClick={() => setCategoria(item.name)}
              >
                <span>{item.icon}</span>
              </li>
            ))}
          </ul>

          <form
            ref={formRef}
            className="formulario"
            onSubmit={(event) => {
              event.preventDefault();
              datosDeEnvio();
            }}
          >
            <div>
              <input
                type="text"
                placeholder="Categoria"
                value={categoria}
                required
                onChange={(event) => setCategoria(event.target.value)}
                className={categoria && "input-active"}
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Monto"
                required
                value={montoFormat}
                onChange={handleMontoChange}
                className={montoFormat && "input-active"}
              />
              <input
                type="date"
                value={dateValue}
                onChange={(event) => setDateValue(event.target.value)}
              />
              <input
                type="text"
                placeholder="Descripcion"
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                className={descripcion && "input-active"}
              />
            </div>
            <button type="submit">
              {transaccionAeditar ? "Guardar cambios" : "Enviar"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export { EnviarTransaccion };
