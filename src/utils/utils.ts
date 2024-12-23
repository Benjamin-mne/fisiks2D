export type id = `${string}-${string}-${string}-${string}`

export function generateId(): id {
    const segment = () => Math.random().toString(36).substring(2, 6); 
    return `${segment()}-${segment()}-${segment()}-${segment()}` as id;
}
