export type BirthdayGuest = {
  name: string
  message: string
}

export type CriticalInfoItem = {
  label: string
  text: string
  aside?: string
}

export const birthday27 = {
  age: "27",
  hostName: "Sergio",
  edition: "bossbirthday / 27",
  title: "Boss Birthday — 27",
  description: "Una cena innecesariamente documentada.",
  event: {
    dateLabel: "Domingo, 30 de agosto",
    timeLabel: "21:00",
    placeLabel: "Lugar por confirmar",
    targetDateIso: "2026-08-30T21:00:00+02:00",
  },
  heroCopy: {
    eyebrow: "Nuevo nivel desbloqueado",
    headline: "Se ha desbloqueado un nuevo nivel.",
    body: "Nadie lo pidió. Ha ocurrido igualmente.",
    invitation: "Cena de cumpleaños de Sergio. Un acontecimiento de dudosa relevancia histórica.",
  },
  guests: {
    juan: {
      name: "Juan",
      message: "Contra todo pronóstico, has sido seleccionado.",
    },
    maria: {
      name: "María",
      message: "Tu asistencia es contractualmente obligatoria.",
    },
    pablo: {
      name: "Pablo",
      message: "Última oportunidad para comportarte como una persona normal.",
    },
  } satisfies Record<string, BirthdayGuest>,
  criticalInfo: [
    {
      label: "Dress code",
      text: "Ven vestido. No estamos preparados para gestionar alternativas.",
      aside: "El listón está bajo por motivos operativos.",
    },
    {
      label: "Regalos",
      text: "Mi presencia ya es vuestro regalo.",
      aside: "Aun así, Bizum existe.",
    },
    {
      label: "+1",
      text: "No traigas personajes nuevos sin autorización previa.",
      aside: "El departamento correspondiente soy yo mirando el móvil.",
    },
    {
      label: "Puntualidad",
      text: "Llegar tarde será entendido como una declaración política.",
    },
    {
      label: "Alcohol",
      text: "La organización no se hace responsable de discursos innecesarios.",
    },
    {
      label: "Hora de finalización",
      text: "Cuando alguien diga “una y nos vamos”, empieza oficialmente la fase dos.",
    },
  ] satisfies CriticalInfoItem[],
  excuseResponses: [
    "Excusa recibida. No aceptada.",
    "El comité está decepcionado con serenidad.",
    "Tu ausencia será archivada como traición menor.",
    "Última oportunidad para actuar con dignidad.",
    "La institución ruega que dejes de hacerte esto.",
  ],
  rsvpFeedback: {
    yes: "Respuesta compatible con el sentido común.",
    no: "Decisión registrada bajo protesta emocional.",
  },
  admin: {
    title: "Panel administrativo de una cena normal",
    empty: "Aún no hay solicitudes. La maquinaria institucional espera.",
  },
}

export type Birthday27GuestId = keyof typeof birthday27.guests

export function getBirthday27Guest(guestId?: string | string[]) {
  const normalizedGuestId = Array.isArray(guestId) ? guestId[0] : guestId

  if (!normalizedGuestId) {
    return undefined
  }

  const guest = birthday27.guests[normalizedGuestId as Birthday27GuestId]

  if (!guest) {
    return undefined
  }

  return {
    id: normalizedGuestId as Birthday27GuestId,
    ...guest,
  }
}
