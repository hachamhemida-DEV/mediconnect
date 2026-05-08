/**
 * User store — Phase 3: Prisma-backed.
 *
 * The signatures match what the in-memory version exposed in Phase 1, so
 * every caller (login/register API, middleware, etc.) keeps working without
 * changes. The key transition: DB writes are now async and durable.
 */

import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import type { User, Role } from './types';

export interface CreateUserInput {
  role:         Role;
  email:        string;
  phone?:       string;
  fullName:     string;
  businessName?: string;
  wilaya?:      string;
  password:     string;
}

function mapUser(row: {
  id: string; role: string; email: string; phone: string | null;
  fullName: string; wilaya: string | null; createdAt: Date; verified: boolean;
}, businessName?: string | null, plan?: string | null): User {
  return {
    id:           row.id,
    role:         row.role as Role,
    email:        row.email,
    phone:        row.phone ?? undefined,
    fullName:     row.fullName,
    businessName: businessName ?? undefined,
    wilaya:       row.wilaya ?? undefined,
    plan:         (plan ?? (row.role === 'supplier' ? 'basic' : null)) as User['plan'],
    createdAt:    row.createdAt.toISOString(),
    verified:     row.verified,
  };
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('EMAIL_TAKEN');

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      role:         input.role,
      phone:        input.phone,
      fullName:     input.fullName.trim(),
      wilaya:       input.wilaya,
      passwordHash,
      // buyers are auto-verified; suppliers / delivery companies need admin approval
      verified:     input.role === 'buyer',
    },
  });

  // Create the role-specific row
  if (input.role === 'supplier') {
    await prisma.supplier.create({
      data: {
        userId:       user.id,
        businessName: input.businessName?.trim() ?? user.fullName,
        wilayaCode:   input.wilaya ? Number(input.wilaya) : 16,
        plan:         'basic',
        verifyStatus: 'pending',
      },
    });
    return mapUser(user, input.businessName, 'basic');
  }

  if (input.role === 'delivery') {
    await prisma.deliveryCompany.create({
      data: {
        userId:         user.id,
        businessName:   input.businessName?.trim() ?? user.fullName,
        wilayasCovered: '[]',
        verifyStatus:   'pending',
      },
    });
    return mapUser(user, input.businessName);
  }

  return mapUser(user);
}

export async function findUserByEmail(email: string): Promise<{
  id: string; email: string; passwordHash: string; role: string; fullName: string;
} | null> {
  const normalized = email.trim().toLowerCase();
  const row = await prisma.user.findUnique({ where: { email: normalized } });
  return row
    ? { id: row.id, email: row.email, passwordHash: row.passwordHash, role: row.role, fullName: row.fullName }
    : null;
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const row = await prisma.user.findUnique({
    where:   { email: email.trim().toLowerCase() },
    include: { supplier: true },
  });
  if (!row) return null;
  const ok = await bcrypt.compare(password, row.passwordHash);
  if (!ok) return null;
  return mapUser(row, row.supplier?.businessName, row.supplier?.plan);
}

export async function getUserById(id: string): Promise<User | null> {
  const row = await prisma.user.findUnique({
    where:   { id },
    include: { supplier: true },
  });
  return row ? mapUser(row, row.supplier?.businessName, row.supplier?.plan) : null;
}
