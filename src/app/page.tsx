"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

type ScheduleEntry = {
  id: string;
  time: string;
  title: string;
  detail: string;
  type: "comida" | "agua";
};

type ScheduleForm = {
  time: string;
  title: string;
  detail: string;
  type: ScheduleEntry["type"];
};

type AlertItem = {
  id: string;
  status: string;
  message: string;
  tone: string;
  acknowledged: boolean;
};

type PetProfile = {
  name: string;
  weight: number;
  age: number;
  diet: string;
};

const defaultSchedule: ScheduleEntry[] = [
  {
    id: "schedule-1",
    time: "07:00",
    title: "Desayuno energético",
    detail: "70 g de croquetas + 200 ml de agua fresca",
    type: "comida",
  },
  {
    id: "schedule-2",
    time: "13:30",
    title: "Snack saludable",
    detail: "40 g de dieta húmeda con suplemento de omega-3",
    type: "comida",
  },
  {
    id: "schedule-3",
    time: "19:00",
    title: "Cena balanceada",
    detail: "80 g de croquetas light + 150 ml de agua",
    type: "comida",
  },
  {
    id: "schedule-4",
    time: "21:30",
    title: "Recarga nocturna",
    detail: "250 ml de agua filtrada y fresca",
    type: "agua",
  },
];

const defaultAlerts: AlertItem[] = [
  {
    id: "alert-1",
    status: "Nivel de agua bajo",
    message: "Quedan 15% en el depósito. Recomendado recargar hoy.",
    tone: "ring-rose-200 bg-rose-50 text-rose-600",
    acknowledged: false,
  },
  {
    id: "alert-2",
    status: "Próxima limpieza",
    message: "Faltan 3 días para la limpieza preventiva del dispensador.",
    tone: "ring-amber-200 bg-amber-50 text-amber-600",
    acknowledged: false,
  },
  {
    id: "alert-3",
    status: "Filtro de agua",
    message: "Último cambio hace 28 días. Programa un reemplazo pronto.",
    tone: "ring-sky-200 bg-sky-50 text-sky-600",
    acknowledged: true,
  },
];

const dayLabels = ["L", "M", "X", "J", "V", "S", "D"];
const weekLabels = ["Sem1", "Sem2", "Sem3", "Sem4", "Sem5", "Sem6", "Sem7"];

const dailyHistory = [320, 280, 290, 340, 305, 295, 310];
const weeklyHistory = [2150, 2080, 2200, 2300, 2180, 2240, 2210];

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function Home() {
  const [scheduleEntries, setScheduleEntries] = useState(defaultSchedule);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    time: "08:00",
    title: "",
    detail: "",
    type: "comida",
  });
  const [liveLevels, setLiveLevels] = useState({ comida: 78, agua: 72 });
  const [historyMode, setHistoryMode] = useState<"diario" | "semanal">(
    "diario",
  );
  const [alerts, setAlerts] = useState(defaultAlerts);
  const [petProfile, setPetProfile] = useState<PetProfile>({
    name: "Luna",
    weight: 6.5,
    age: 3,
    diet: "Balanceada premium",
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLiveLevels((prev) => ({
        comida: Math.min(
          100,
          Math.max(10, prev.comida + (Math.random() - 0.55) * 6),
        ),
        agua: Math.min(
          100,
          Math.max(10, prev.agua + (Math.random() - 0.45) * 5),
        ),
      }));
    }, 6000);

    return () => clearInterval(intervalId);
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Croquetas disponibles",
        value: `${Math.round(liveLevels.comida)}%`,
        accent: "from-rose-200 to-rose-100",
      },
      {
        label: "Agua disponible",
        value: `${Math.round(liveLevels.agua)}%`,
        accent: "from-sky-200 to-sky-100",
      },
      {
        label: "Porciones programadas",
        value: `${scheduleEntries.filter((entry) => entry.type === "comida").length} porciones`,
        accent: "from-lime-200 to-lime-100",
      },
      {
        label: "Recargas de agua",
        value: `${scheduleEntries.filter((entry) => entry.type === "agua").length} recargas`,
        accent: "from-indigo-200 to-indigo-100",
      },
    ],
    [liveLevels, scheduleEntries],
  );

  const historyData = historyMode === "diario" ? dailyHistory : weeklyHistory;
  const historyLabels = historyMode === "diario" ? dayLabels : weekLabels;
  const maxHistoryValue = Math.max(...historyData);

  const recommendedFood = useMemo(() => {
    const base = petProfile.weight * 35;
    const ageFactor = petProfile.age < 1 ? 1.25 : petProfile.age > 7 ? 0.9 : 1;
    const dietFactor =
      petProfile.diet === "Alta energía"
        ? 1.15
        : petProfile.diet === "Light"
          ? 0.88
          : 1;
    return Math.round(base * ageFactor * dietFactor);
  }, [petProfile]);

  const recommendedWater = useMemo(() => {
    const base = petProfile.weight * 60;
    return Math.max(450, Math.round(base));
  }, [petProfile]);

  const handleScheduleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!scheduleForm.title.trim() || !scheduleForm.detail.trim()) return;
    const newEntry: ScheduleEntry = {
      id: createId(),
      time: scheduleForm.time,
      title: scheduleForm.title.trim(),
      detail: scheduleForm.detail.trim(),
      type: scheduleForm.type,
    };
    setScheduleEntries((prev) =>
      [...prev, newEntry].sort((a, b) => a.time.localeCompare(b.time)),
    );
    setScheduleForm((prev) => ({ ...prev, title: "", detail: "" }));
  };

  const removeScheduleEntry = (id: string) => {
    setScheduleEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const toggleAlertAcknowledged = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, acknowledged: !alert.acknowledged }
          : alert,
      ),
    );
  };

  const updatePetProfile = <Key extends keyof PetProfile>(
    key: Key,
    value: PetProfile[Key],
  ) => {
    setPetProfile((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-white to-sky-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-lime-200/40 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 sm:px-10 lg:px-12">
        <header className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/70 px-4 py-1 text-sm font-medium text-rose-600 shadow-sm ring-1 ring-rose-200/80">
              Bienvenido a PetCare
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Alimentación inteligente para tu mascota, siempre a tiempo y con
              cariño.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Programa horarios precisos, monitorea comida y agua en tiempo
              real, recibe alertas automáticas y ajusta las porciones según el
              perfil único de tu mascota.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                className="w-full rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 sm:w-auto"
              >
                Crear horario personalizado
              </button>
              <button
                type="button"
                className="w-full rounded-full bg-white/80 px-6 py-3 text-sm font-semibold text-rose-600 shadow-md shadow-rose-100 ring-1 ring-rose-300 transition hover:bg-rose-50 sm:w-auto"
              >
                Ver panel de monitoreo
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 p-8 shadow-xl shadow-rose-100 ring-1 ring-white/60 backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Panel del día
              </h2>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600">
                Rutina activa
              </span>
            </div>
            <div className="space-y-6">
              {scheduleEntries.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-sm font-semibold text-rose-600 ring-1 ring-rose-300/70">
                    {item.time}
                  </div>
                  <div className="flex-1 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.detail}</p>
                    <span className="mt-2 inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-500 ring-1 ring-rose-200/80">
                      {item.type === "comida" ? "Comida" : "Agua"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-white/80 p-8 shadow-lg shadow-rose-100 ring-1 ring-white/80 backdrop-blur">
            <h3 className="text-xl font-semibold text-slate-900">
              Programar horarios
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Configura horarios exactos, define porciones y permite que PetCare
              ajuste automáticamente según la rutina y el apetito de tu mejor
              amigo.
            </p>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <form
                className="rounded-2xl bg-rose-50/80 p-6 ring-1 ring-rose-100"
                onSubmit={handleScheduleSubmit}
              >
                <h4 className="text-sm font-semibold uppercase tracking-wide text-rose-500">
                  Crear nuevo evento
                </h4>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                    Hora
                    <input
                      type="time"
                      value={scheduleForm.time}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          time: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                    Tipo
                    <select
                      value={scheduleForm.type}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          type: event.target.value as ScheduleEntry["type"],
                        }))
                      }
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                    >
                      <option value="comida">Comida</option>
                      <option value="agua">Agua</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 sm:col-span-2">
                    Nombre del evento
                    <input
                      type="text"
                      value={scheduleForm.title}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      placeholder="Ej. Almuerzo balanceado"
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium text-slate-600 sm:col-span-2">
                    Detalle / porción
                    <textarea
                      value={scheduleForm.detail}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          detail: event.target.value,
                        }))
                      }
                      placeholder="Ej. 60 g de croquetas hipoalergénicas + 180 ml de agua"
                      className="h-24 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                      required
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:bg-rose-600"
                >
                  Guardar horario
                </button>
              </form>

              <div className="rounded-2xl bg-white/90 p-6 ring-1 ring-rose-100">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-rose-500">
                  Horario del día
                </h4>
                <div className="mt-4 space-y-4">
                  {scheduleEntries.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-rose-600 ring-1 ring-rose-200">
                          {item.time}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {item.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.detail}
                          </p>
                          <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-500 ring-1 ring-rose-200">
                            {item.type === "comida" ? "Comida" : "Agua"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeScheduleEntry(item.id)}
                        className="self-start rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-100 sm:self-center"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                  {scheduleEntries.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Aún no has programado horarios. Agrega el primero para
                      comenzar.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/80 p-8 shadow-lg shadow-sky-100 ring-1 ring-white/80 backdrop-blur">
            <h3 className="text-xl font-semibold text-slate-900">
              Monitoreo en tiempo real
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Consulta la disponibilidad de comida y agua con actualizaciones
              cada minuto y revisa el historial de consumo diario.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl bg-gradient-to-br ${item.accent} p-5 text-slate-800 shadow-inner`}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-600/70">
                    {item.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-50/90 p-5 ring-1 ring-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-800">
                  Historial de consumo
                </p>
                <button
                  type="button"
                  onClick={() => setHistoryMode("diario")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${historyMode === "diario" ? "bg-sky-500 text-white shadow" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
                >
                  Diario
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryMode("semanal")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${historyMode === "semanal" ? "bg-sky-500 text-white shadow" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
                >
                  Semanal
                </button>
                <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {historyMode === "diario" ? "g por día" : "g por semana"}
                </span>
              </div>
              <div className="mt-5 flex items-end gap-3">
                {historyData.map((value, index) => (
                  <div
                    key={historyLabels[index]}
                    className="flex flex-1 flex-col"
                  >
                    <div
                      className="mx-auto w-6 rounded-full bg-gradient-to-t from-slate-200 to-sky-400"
                      style={{
                        height: `${Math.max(18, (value / maxHistoryValue) * 140)}px`,
                      }}
                    />
                    <span className="mt-2 text-[10px] font-medium uppercase text-slate-400">
                      {historyLabels[index]}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-white/80 p-8 shadow-lg shadow-amber-100 ring-1 ring-white/80 backdrop-blur">
            <h3 className="text-xl font-semibold text-slate-900">
              Alertas automáticas
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              Recibe recordatorios puntuales para recargas, limpiezas y
              anomalías detectadas por los sensores del dispensador.
            </p>
            <div className="mt-6 space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-2xl px-5 py-4 text-sm font-medium shadow-sm ring-1 ${alert.tone}`}
                >
                  <p className="text-base font-semibold">{alert.status}</p>
                  <p className="mt-1 text-xs font-normal">{alert.message}</p>
                  <button
                    type="button"
                    onClick={() => toggleAlertAcknowledged(alert.id)}
                    className={`mt-3 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${alert.acknowledged ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-300" : "bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100"}`}
                  >
                    {alert.acknowledged ? "Atendida" : "Marcar como atendida"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-3xl bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 p-[1px] shadow-lg shadow-rose-200">
              <div className="rounded-[26px] bg-white/90 p-8 text-slate-800 backdrop-blur">
                <h3 className="text-xl font-semibold">Perfil de mascota</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Ajusta automáticamente las porciones según la edad, peso y
                  plan de alimentación recomendado por tu veterinario.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Nombre
                    <input
                      type="text"
                      value={petProfile.name}
                      onChange={(event) =>
                        updatePetProfile("name", event.target.value)
                      }
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Peso (kg)
                    <input
                      type="number"
                      min="0.5"
                      step="0.1"
                      value={petProfile.weight}
                      onChange={(event) =>
                        updatePetProfile("weight", Number(event.target.value))
                      }
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Edad (años)
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={petProfile.age}
                      onChange={(event) =>
                        updatePetProfile("age", Number(event.target.value))
                      }
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Tipo de dieta
                    <select
                      value={petProfile.diet}
                      onChange={(event) =>
                        updatePetProfile("diet", event.target.value)
                      }
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                    >
                      <option value="Balanceada premium">
                        Balanceada premium
                      </option>
                      <option value="Alta energía">Alta energía</option>
                      <option value="Light">Light</option>
                      <option value="Hipoalergénica">Hipoalergénica</option>
                    </select>
                  </label>
                </div>
                <div className="mt-6 grid gap-4 rounded-2xl bg-rose-50/80 px-5 py-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-rose-600">
                      Recomendación diaria comida
                    </p>
                    <p className="mt-1 text-rose-500">
                      {recommendedFood} g repartidos en 3 porciones
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-rose-600">
                      Recomendación diaria agua
                    </p>
                    <p className="mt-1 text-rose-500">
                      {recommendedWater} ml distribuidos durante el día
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white/80 p-7 shadow-lg shadow-slate-100 ring-1 ring-white/80 backdrop-blur">
              <p className="text-base font-semibold text-slate-900">
                Controla tu dispensador desde el móvil.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Sincroniza PetCare con la app para recibir notificaciones y
                ajustar porciones en cualquier momento.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="w-full rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-slate-800 sm:w-auto"
                >
                  Descargar iOS
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-400 hover:text-slate-900 sm:w-auto"
                >
                  Descargar Android
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="rounded-3xl bg-white/80 px-8 py-10 text-center shadow-lg shadow-rose-100 ring-1 ring-white/80 backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">
            Cuida a quien más quieres con PetCare.
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Automatiza la alimentación, mantén el bienestar de tu mascota y
            disfruta la tranquilidad de estar siempre presente.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              className="w-full rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600 sm:w-auto"
            >
              Empezar ahora
            </button>
            <button
              type="button"
              className="w-full rounded-full border border-rose-200 px-6 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 sm:w-auto"
            >
              Solicitar demo
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
