export type ActionItemData = {
  id: string;
  text: string;
  completed: boolean;
  hasDueDate?: boolean;
  dueDate?: string;
};

export type GoalData = {
  id: string;
  text: string;
  progress: number;
  completed?: boolean;
};

export type AgendaSideData = {
  text: string;
};

export type AgendaEntryData = {
  id: string;
  notesDate: string;
  notesText: string;
  icAgenda: AgendaSideData;
  managerAgenda: AgendaSideData;
};

export type DocumentSettings = {
  showDueDates: boolean;
  showCompletedTasks: boolean;
};

export type DocumentState = {
  icName: string;
  managerName: string;
  periodLabel: string;
  actionItems: ActionItemData[];
  professionalGoals: GoalData[];
  personalGoals: GoalData[];
  agendaEntries: AgendaEntryData[];
  settings: DocumentSettings;
};

export const PROGRESS_SEGMENTS = 10;

export function createId(): string {
  return crypto.randomUUID();
}

export function createEmptyAgendaSide(): AgendaSideData {
  return { text: "" };
}

export function formatNotesDate(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${month}-${day}-${year}`;
}

export function toIsoDate(display: string): string {
  const match = display.trim().match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = 2000 + Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }
  return `${String(year)}-${match[1]}-${match[2]}`;
}

export function fromIsoDate(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  return `${match[2]}-${match[3]}-${match[1].slice(-2)}`;
}

export function createInitialDocument(): DocumentState {
  return {
    icName: "IC",
    managerName: "Manager",
    periodLabel: "Q2 2026",
    actionItems: [
      { id: createId(), text: "Make this moar pretty", completed: false },
      {
        id: createId(),
        text: "Fill out Growth Framework (attached)",
        completed: false,
      },
    ],
    professionalGoals: [
      {
        id: createId(),
        text: "",
        progress: 1,
      },
      {
        id: createId(),
        text: "",
        progress: 1,
      },
    ],
    personalGoals: [
      {
        id: createId(),
        text: "",
        progress: 1,
      },
      {
        id: createId(),
        text: "",
        progress: 1,
      },
    ],
    agendaEntries: [
      {
        id: createId(),
        notesDate: "01-99-99",
        notesText: "",
        icAgenda: createEmptyAgendaSide(),
        managerAgenda: createEmptyAgendaSide(),
      },
    ],
    settings: {
      showDueDates: false,
      showCompletedTasks: true,
    },
  };
}
