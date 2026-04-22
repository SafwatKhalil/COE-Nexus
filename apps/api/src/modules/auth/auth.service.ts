import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: {
    tenantName: string
    email: string
    password: string
    name?: string
  }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existingUser) throw new ConflictException('Email already registered')

    const tenant = await this.prisma.tenant.create({ data: { name: dto.tenantName } })

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: dto.email,
        name: dto.name,
        role: 'admin',
        passwordHash,
        authProvider: 'local',
      },
    })

    const token = this.signToken(user.id, user.tenantId, user.email, user.role)
    return { token, user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId } }
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Invalid credentials')

    const token = this.signToken(user.id, user.tenantId, user.email, user.role)
    return { token, user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId } }
  }

  private signToken(userId: string, tenantId: string, email: string, role: string): string {
    return this.jwtService.sign({ sub: userId, tenantId, email, role })
  }
}
