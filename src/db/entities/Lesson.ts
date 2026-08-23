import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Progress } from './Progress';

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

@Entity({ name: 'lessons' })
@Index(['path', 'difficulty'])
@Index(['moduleId'])
export class Lesson {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id!: string;

  @Column({ name: 'module_id', type: 'varchar', length: 100 })
  moduleId!: string;

  @Column({ name: 'module_title', type: 'varchar', length: 200 })
  moduleTitle!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'enum', enum: Difficulty })
  difficulty!: Difficulty;

  @Column({ name: 'estimated_minutes', type: 'integer' })
  estimatedMinutes!: number;

  @Column({ type: 'varchar', length: 100, default: 'curriculum' })
  path!: string;

  @OneToMany(() => Progress, (progress) => progress.lesson)
  progress!: Progress[];
}
