import { Solar } from 'lunar-javascript'

const solar = Solar.fromYmdHms(1987, 4, 20, 23, 0, 0)
const lunar = solar.getLunar()
const eightChar = lunar.getEightChar()

console.log('Solar:', typeof solar.toFullString === 'function' ? solar.toFullString() : '')
console.log('Lunar:', typeof lunar.toFullString === 'function' ? lunar.toFullString() : '')
console.log('EightChar methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(eightChar)))
console.log('EightChar own properties:', Object.getOwnPropertyNames(eightChar))
console.log('Year:', eightChar.getYear?.())
console.log('Month:', eightChar.getMonth?.())
console.log('Day:', eightChar.getDay?.())
console.log('Time:', eightChar.getTime?.())
