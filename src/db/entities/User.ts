import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Progress } from './Progress';
import { Certificate } from './Certificate';

@Entity({ name: 'users' })
@Index(['createdAt'])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 320 })
  email!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  name!: string | null;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash!: string | null;

  @Column({ type: 'integer', default: 0 })
  xp!: number;

  @Column({ name: 'streak_days', type: 'integer', default: 0 })
  streakDays!: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  achievements!: Record<string, unknown>[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Progress, (progress) => progress.user)
  progress!: Progress[];

  @OneToMany(() => Certificate, (certificate) => certificate.user)
  certificates!: Certificate[];
}
