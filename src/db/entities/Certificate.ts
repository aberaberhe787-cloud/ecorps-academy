import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'certificates' })
@Unique(['userId', 'trackId'])
@Index(['userId', 'issuedAt'])
export class Certificate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'track_id', type: 'varchar', length: 100 })
  trackId!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @CreateDateColumn({ name: 'issued_at', type: 'timestamptz' })
  issuedAt!: Date;

  @Column({ name: 'certificate_url', type: 'text', nullable: true })
  certificateUrl!: string | null;

  @ManyToOne(() => User, (user) => user.certificates, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
