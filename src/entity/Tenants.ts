import {
    Column,
    // Column,
    CreateDateColumn,
    Entity,
    // ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    // UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tenants' })
export class Tenant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100 })
    name: string;

    @Column('varchar', { length: 255 })
    address: string;

    @UpdateDateColumn()
    updateAt: number;

    @CreateDateColumn()
    createdAt: number;
}
