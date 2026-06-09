import type { AccountType, Region, StorePlan, WorkMode } from "@prisma/client";

export type SkillOption = {
  id: string;
  name: string;
  slug: string;
};

export type EditableProfile = {
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  accountType: AccountType;
  storePlan: StorePlan;
  title: string;
  bio: string;
  region: Region;
  workMode: WorkMode;
  avatarUrl: string;
  whatsapp: string;
  showWhatsapp: boolean;
  portfolioUrls: string[];
  skillIds: string[];
  isAvailable: boolean;
};

export type ProfileEditorData = {
  profile: EditableProfile;
  skills: SkillOption[];
};

export type AccountSettingsData = {
  phone: string;
  email: string;
  accountType: AccountType;
};
