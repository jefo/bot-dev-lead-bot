import { createPort } from '@maxdev1/sotajs/lib/di.v2';
import { QualificationProfile } from '../../domain/entities/qualification-profile.entity';
import { PathSelectedOutput, UserWelcomedOutput } from './onboarding.dtos';

// --- Порты репозитория (driven ports) ---

export const findQualificationProfileByTelegramIdPort = createPort<
  (telegramId: number) => Promise<InstanceType<typeof QualificationProfile> | null>
>();

export const saveQualificationProfilePort = createPort<
  (profile: InstanceType<typeof QualificationProfile>) => Promise<void>
>();


// --- Семантические порты вывода (driving ports) ---

export const userWelcomedOutPort = createPort<(output: UserWelcomedOutput) => Promise<void>>();

export const businessOwnerPathSelectedOutPort = createPort<(output: PathSelectedOutput) => Promise<void>>();

export const specialistPathSelectedOutPort = createPort<(output: PathSelectedOutput) => Promise<void>>();

export const explorerPathSelectedOutPort = createPort<(output: PathSelectedOutput) => Promise<void>>();