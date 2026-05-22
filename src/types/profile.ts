import type { Region, WorkMode } from "@prisma/client";

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
  title: string;
  bio: string;
  region: Region;
  workMode: WorkMode;
  avatarUrl: string;
  whatsapp: string;
  portfolioUrls: string[];
  skillIds: string[];
};

export type ProfileEditorData = {
  profile: EditableProfile;
  skills: SkillOption[];
};

export type AccountSettingsData = {
  phone: string;
  email: string;
};
