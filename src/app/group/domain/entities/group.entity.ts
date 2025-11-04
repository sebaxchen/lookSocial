export interface Group {
  id?: string;
  name: string;
  members: { id: string; name: string }[];
  tasks: { id: string; title: string; priority: string; status?: string; createdAt: Date }[];
  createdAt?: Date;
  color?: string;
}

