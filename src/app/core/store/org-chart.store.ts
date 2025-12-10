import { signal, computed } from '@angular/core';
import { PositionNode } from '../models/position.model';

const INITIAL_DATA: PositionNode[] = [
    { id: '1', name: 'CEO', nameThai: 'ประธานเจ้าหน้าที่บริหาร', salaryType: 'Normal', levelIndex: 0, parentId: null, section: 'Management' },
    { id: '2', name: 'CTO', nameThai: 'ประธานเจ้าหน้าที่ฝ่ายเทคโนโลยี', salaryType: 'Normal', levelIndex: 1, parentId: '1', section: 'Engineering' },
    { id: '3', name: 'CFO', nameThai: 'ประธานเจ้าหน้าที่ฝ่ายการเงิน', salaryType: 'Normal', levelIndex: 1, parentId: '1', section: 'Management' },
    { id: '4', name: 'VP Engineering', nameThai: 'รองประธานฝ่ายวิศวกรรม', salaryType: 'Normal', levelIndex: 2, parentId: '2', section: 'Engineering' },
    { id: '5', name: 'Sales Manager', nameThai: 'ผู้จัดการฝ่ายขาย', salaryType: 'Commission', levelIndex: 2, parentId: '3', section: 'Sales' },
    { id: '6', name: 'Backend Lead', nameThai: 'หัวหน้าทีม Backend', salaryType: 'Normal', levelIndex: 3, parentId: '4', section: 'Engineering' },
    { id: '7', name: 'Frontend Lead', nameThai: 'หัวหน้าทีม Frontend', salaryType: 'Normal', levelIndex: 3, parentId: '4', section: 'Engineering' },
    { id: '8', name: 'Sales Executive', nameThai: 'เจ้าหน้าที่ฝ่ายขาย', salaryType: 'Commission', levelIndex: -1, parentId: null, section: 'Sales' },
    { id: '9', name: 'Marketing Specialist', nameThai: 'ผู้เชี่ยวชาญด้านการตลาด', salaryType: 'Normal', levelIndex: -1, parentId: null, section: 'Operations' }
];

// State
export const nodes = signal<PositionNode[]>(INITIAL_DATA);

// Computed
export const nodesByLevel = computed(() => {
    const currentNodes = nodes();
    const grouped: PositionNode[][] = [];
    
    currentNodes.forEach(node => {
        if (!grouped[node.levelIndex]) {
            grouped[node.levelIndex] = [];
        }
        grouped[node.levelIndex].push(node);
    });

    return grouped;
});

// Computed: Group children by ParentID
export const childrenByParent = computed(() => {
    const currentNodes = nodes();
    const map = new Map<string, PositionNode[]>();

    currentNodes.forEach(node => {
        if (node.parentId) {
            if (!map.has(node.parentId)) {
                map.set(node.parentId, []);
            }
            map.get(node.parentId)!.push(node);
        }
    });
    return map;
});

// Actions
export const addNode = (node: PositionNode): void => {
    nodes.update(currentNodes => [...currentNodes, node]);
};

export const moveNode = (id: string, newLevel: number, newParentId: string | null): void => {
    nodes.update(currentNodes => 
        currentNodes.map(node => 
        node.id === id 
            ? { ...node, levelIndex: newLevel, parentId: newParentId } 
            : node
        )
    );
};

export const getDescendants = (nodeId: string): string[] => {
    const descendants: string[] = [];
    const children = nodes().filter(node => node.parentId === nodeId);

    children.forEach(child => {
        descendants.push(child.id);
        descendants.push(...getDescendants(child.id));
    });

    return descendants;
};

export const removeNode = (nodeId: string): void => {
    const descendants = getDescendants(nodeId);
    const idsToRemove = [nodeId, ...descendants];
    
    nodes.update(currentNodes => currentNodes.filter(n => !idsToRemove.includes(n.id)));
};
