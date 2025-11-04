import { TeamMember } from '../entities/team-member.entity';

export interface ITeamRepository {
  findAll(): Promise<TeamMember[]>;
  findById(id: string): Promise<TeamMember | null>;
  findByName(name: string): Promise<TeamMember | null>;
  create(member: TeamMember): Promise<TeamMember>;
  update(id: string, updates: Partial<TeamMember>): Promise<TeamMember>;
  delete(id: string): Promise<void>;
}

