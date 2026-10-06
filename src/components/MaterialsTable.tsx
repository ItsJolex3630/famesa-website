import { MATERIALS } from "@/lib/site-data";

export default function MaterialsTable() {
  return (
    <section
      id="materiales"
      className="border-b border-famesa-silver bg-famesa-surface"
    >
      <div className="mx-auto max-w-shell px-5 py-16 md:px-8 md:py-20">
        {/* Encabezado */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="tech-label text-famesa-blue">
              Catálogo de ingeniería · fichas de material
            </span>
            <h2 className="mt-1 font-heading text-[34px] font-bold uppercase leading-none tracking-tight text-famesa-ink sm:text-[42px]">
              Materiales, normas y tolerancias
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-famesa-muted">
              Seleccionamos material de acuerdo con la norma solicitada y la
              condición de servicio. Cada orden de trabajo se cierra con el
              estándar DIN / ISO y la clase de tolerancia acordada con ingeniería
              del cliente.
            </p>
          </div>
          <span className="tech-stamp w-fit border border-famesa-silver bg-white px-3 py-1.5 text-famesa-ink">
            Ref. Catálogo: MAT-FAMESA-2024-R1
          </span>
        </div>

        {/* Tabla técnica */}
        <div className="overflow-x-auto border border-famesa-silver bg-white">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <caption className="sr-only">
              Tabla de materiales, normas, tolerancias y aplicaciones típicas
            </caption>
            <thead>
              <tr className="bg-famesa-navy text-white">
                <th scope="col" className="border-r border-white/20 p-4 font-heading text-[13px] font-semibold uppercase tracking-wider">
                  Material / Aleación
                </th>
                <th scope="col" className="border-r border-white/20 p-4 font-heading text-[13px] font-semibold uppercase tracking-wider">
                  Norma / Clasificación
                </th>
                <th scope="col" className="border-r border-white/20 p-4 font-heading text-[13px] font-semibold uppercase tracking-wider">
                  Dureza / Propiedades
                </th>
                <th scope="col" className="border-r border-white/20 p-4 font-heading text-[13px] font-semibold uppercase tracking-wider">
                  Tolerancia
                </th>
                <th scope="col" className="p-4 font-heading text-[13px] font-semibold uppercase tracking-wider">
                  Aplicaciones típicas en planta
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-famesa-silver">
              {MATERIALS.map((row) => (
                <tr
                  key={row.material}
                  className="align-top transition-colors hover:bg-famesa-surface"
                >
                  <th
                    scope="row"
                    className="border-r border-famesa-silver bg-white p-4 font-heading text-[16px] font-bold uppercase leading-tight text-famesa-ink"
                  >
                    {row.material}
                  </th>
                  <td className="border-r border-famesa-silver p-4 text-[13px] leading-relaxed text-famesa-muted">
                    {row.standard}
                  </td>
                  <td className="border-r border-famesa-silver p-4 text-[13px] leading-relaxed text-famesa-muted">
                    {row.properties}
                  </td>
                  <td className="border-r border-famesa-silver p-4 text-[13px] font-medium text-famesa-blue">
                    {row.tolerance}
                  </td>
                  <td className="p-4 text-[13px] leading-relaxed text-famesa-ink">
                    {row.applications}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Nota técnica de pie de tabla */}
        <p className="tech-stamp mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-famesa-muted">
          <span>• Materiales especiales bajo encargo</span>
          <span>• Certificados EN 10204 3.1 / 3.2 disponibles</span>
          <span>• Tratamiento térmico coordinate con planta de servicios</span>
        </p>
      </div>
    </section>
  );
}
