export function safeRelationDesc(desc: string): string {
  return String(desc ?? '')
    .replace(/不等於申子辰三合水局/g, '不等於三支俱全的三合局')
    .replace(/不等於亥卯未三合木局/g, '不等於三支俱全的三合局')
    .replace(/不等於寅午戌三合火局/g, '不等於三支俱全的三合局')
    .replace(/不等於巳酉丑三合金局/g, '不等於三支俱全的三合局')
}
