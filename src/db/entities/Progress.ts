import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Lesson } from './Lesson';

@Entity({ name: 'progress' })
@Unique(['userId', 'lessonId'])
@Index(['userId', 'completed'])
@Index(['lessonId'])
export class Progress {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @Column({ name: 'lesson_id', type: 'varchar', length: 100 })
  lessonId!: string;

  @Column({ type: 'boolean', default: false })
  completed!: boolean;

  @Column({ name: 'quiz_score', type: 'integer', nullable: true })
  quizScore!: number | null;

  @Column({ name: 'practice_score', type: 'integer', nullable: true })
  practiceScore!: number | null;

  @Column({ name: 'time_spent_seconds', type: 'integer', default: 0 })
  timeSpentSeconds!: number;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'last_accessed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastAccessedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Lesson, (lesson) => lesson.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson;
}
