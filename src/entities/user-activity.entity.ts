import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseAuditColumns } from "./base-audit-columns.entity";
import { User } from "./user.entity";

@Entity("user_activities")
export class UserActivity extends BaseAuditColumns {
  @Column({ type: "uuid" })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 50 })
  action: string; // e.g., 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE'

  @Column({ type: "varchar", length: 100, nullable: true })
  module: string; // e.g., 'Products', 'Categories'

  @Column({ type: "varchar", length: 50, nullable: true })
  ip_address: string;

  @Column({ type: "text", nullable: true })
  user_agent: string;

  @Column({ type: "timestamptz", nullable: true })
  login_time: Date;

  @Column({ type: "timestamptz", nullable: true })
  logout_time: Date;

  @Column({ type: "jsonb", nullable: true })
  details: any; // For future use (e.g., storing changed fields)
}
