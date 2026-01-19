'use client';

import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEY, MAX_ANONYMOUS_REGENERATIONS } from './constants';

export interface LocalCourse {
  id: string;
  name: string;
  term?: string;
  examDate?: string;
  createdAt: string;
}

export interface LocalStudyPack {
  id: string;
  courseId: string;
  title: string;
  status: 'draft' | 'preview' | 'generated';
  createdAt: string;
}

export interface LocalMaterial {
  id: string;
  packId: string;
  type: 'paste' | 'pdf';
  filename?: string;
  text: string;
  createdAt: string;
}

export interface LocalCard {
  id: string;
  packId: string;
  front: string;
  back: string;
  why?: string;
  citations: Array<{
    source: string;
    page?: number;
    snippet: string;
  }>;
  status: 'active' | 'flagged' | 'regenerated';
  createdAt: string;
}

export interface LocalGuide {
  id: string;
  packId: string;
  content: string;
  citations: Array<{
    source: string;
    page?: number;
    snippet: string;
  }>;
  createdAt: string;
}

export interface LocalData {
  courses: LocalCourse[];
  packs: LocalStudyPack[];
  materials: LocalMaterial[];
  cards: LocalCard[];
  guides: LocalGuide[];
  regenerationsUsed: number;
  lastUpdated: string;
}


function getDefaultData(): LocalData {
  return {
    courses: [],
    packs: [],
    materials: [],
    cards: [],
    guides: [],
    regenerationsUsed: 0,
    lastUpdated: new Date().toISOString(),
  };
}

export function getLocalData(): LocalData {
  if (typeof window === 'undefined') return getDefaultData();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultData();
    return JSON.parse(stored);
  } catch {
    return getDefaultData();
  }
}

export function saveLocalData(data: LocalData): void {
  if (typeof window === 'undefined') return;

  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearLocalData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Course operations
export function createLocalCourse(name: string, term?: string, examDate?: string): LocalCourse {
  const data = getLocalData();
  const course: LocalCourse = {
    id: uuidv4(),
    name,
    term,
    examDate,
    createdAt: new Date().toISOString(),
  };
  data.courses.push(course);
  saveLocalData(data);
  return course;
}

export function getLocalCourses(): LocalCourse[] {
  return getLocalData().courses;
}

export function getLocalCourse(id: string): LocalCourse | undefined {
  return getLocalData().courses.find((c) => c.id === id);
}

export function updateLocalCourse(id: string, updates: Partial<LocalCourse>): LocalCourse | null {
  const data = getLocalData();
  const index = data.courses.findIndex((c) => c.id === id);
  if (index === -1) return null;
  data.courses[index] = { ...data.courses[index], ...updates };
  saveLocalData(data);
  return data.courses[index];
}

export function deleteLocalCourse(id: string): void {
  const data = getLocalData();
  data.courses = data.courses.filter((c) => c.id !== id);
  data.packs = data.packs.filter((p) => p.courseId !== id);
  saveLocalData(data);
}

// Pack operations
export function createLocalPack(courseId: string, title: string): LocalStudyPack {
  const data = getLocalData();
  const pack: LocalStudyPack = {
    id: uuidv4(),
    courseId,
    title,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  data.packs.push(pack);
  saveLocalData(data);
  return pack;
}

export function getLocalPacks(courseId?: string): LocalStudyPack[] {
  const data = getLocalData();
  if (courseId) {
    return data.packs.filter((p) => p.courseId === courseId);
  }
  return data.packs;
}

export function getLocalPack(id: string): LocalStudyPack | undefined {
  return getLocalData().packs.find((p) => p.id === id);
}

export function updateLocalPack(id: string, updates: Partial<LocalStudyPack>): LocalStudyPack | null {
  const data = getLocalData();
  const index = data.packs.findIndex((p) => p.id === id);
  if (index === -1) return null;
  data.packs[index] = { ...data.packs[index], ...updates };
  saveLocalData(data);
  return data.packs[index];
}

// Material operations
export function addLocalMaterial(packId: string, text: string, filename?: string, type: 'paste' | 'pdf' = 'paste'): LocalMaterial {
  const data = getLocalData();
  const material: LocalMaterial = {
    id: uuidv4(),
    packId,
    type,
    filename,
    text,
    createdAt: new Date().toISOString(),
  };
  data.materials.push(material);
  saveLocalData(data);
  return material;
}

export function getLocalMaterials(packId: string): LocalMaterial[] {
  return getLocalData().materials.filter((m) => m.packId === packId);
}

export function deleteLocalMaterial(id: string): void {
  const data = getLocalData();
  data.materials = data.materials.filter((m) => m.id !== id);
  saveLocalData(data);
}

// Card operations
export function setLocalCards(packId: string, cards: Omit<LocalCard, 'id' | 'packId' | 'createdAt'>[]): LocalCard[] {
  const data = getLocalData();
  // Remove existing cards for this pack
  data.cards = data.cards.filter((c) => c.packId !== packId);
  // Add new cards
  const newCards: LocalCard[] = cards.map((card) => ({
    ...card,
    id: uuidv4(),
    packId,
    createdAt: new Date().toISOString(),
  }));
  data.cards.push(...newCards);
  saveLocalData(data);
  return newCards;
}

export function getLocalCards(packId: string): LocalCard[] {
  return getLocalData().cards.filter((c) => c.packId === packId);
}

export function updateLocalCard(id: string, updates: Partial<LocalCard>): LocalCard | null {
  const data = getLocalData();
  const index = data.cards.findIndex((c) => c.id === id);
  if (index === -1) return null;
  data.cards[index] = { ...data.cards[index], ...updates };
  saveLocalData(data);
  return data.cards[index];
}

// Guide operations
export function setLocalGuide(packId: string, content: string, citations: LocalGuide['citations']): LocalGuide {
  const data = getLocalData();
  // Remove existing guide for this pack
  data.guides = data.guides.filter((g) => g.packId !== packId);
  const guide: LocalGuide = {
    id: uuidv4(),
    packId,
    content,
    citations,
    createdAt: new Date().toISOString(),
  };
  data.guides.push(guide);
  saveLocalData(data);
  return guide;
}

export function getLocalGuide(packId: string): LocalGuide | undefined {
  return getLocalData().guides.find((g) => g.packId === packId);
}

// Regeneration tracking
export function canRegenerate(): boolean {
  const data = getLocalData();
  return data.regenerationsUsed < MAX_ANONYMOUS_REGENERATIONS;
}

export function incrementRegeneration(): number {
  const data = getLocalData();
  data.regenerationsUsed++;
  saveLocalData(data);
  return MAX_ANONYMOUS_REGENERATIONS - data.regenerationsUsed;
}

export function getRegenerationsRemaining(): number {
  const data = getLocalData();
  return Math.max(0, MAX_ANONYMOUS_REGENERATIONS - data.regenerationsUsed);
}

// Export all data for migration
export function exportForMigration(): LocalData {
  return getLocalData();
}

// Check if there's meaningful data to save
export function hasDataToSave(): boolean {
  const data = getLocalData();
  return data.courses.length > 0 || data.packs.length > 0 || data.cards.length > 0;
}
