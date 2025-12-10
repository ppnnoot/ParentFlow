export interface PositionNode {
  id: string; // unique
  name: string;
  nameThai?: string;
  nameChinese?: string;
  nameVietnamese?: string;
  section?: string;
  salaryType: 'Normal' | 'Commission';
  levelIndex: number;
  parentId: string | null;
}
