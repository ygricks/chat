import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 70, nullable: false })
  password!: string;
}
