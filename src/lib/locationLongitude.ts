export const TAIWAN_CITY_LONGITUDES: Record<string, number> = {
  '高雄': 120.312,
  '台南': 120.213,
  '台中': 120.673,
  '台北': 121.565,
  '新北': 121.464,
  '桃園': 121.301,
  '新竹': 120.968,
  '嘉義': 120.449,
  '屏東': 120.488,
  '花蓮': 121.601,
  '台東': 121.144,
  '宜蘭': 121.753,
}

export const DEFAULT_BIRTH_LONGITUDE = 120.0

export const DEFAULT_TIMEZONE = 'Asia/Taipei'

export const TIMEZONE_OFFSETS: Record<string, number> = {
  'Asia/Taipei': 8,
  'Asia/Shanghai': 8,
  'Asia/Hong_Kong': 8,
  'Asia/Macau': 8,
  'Asia/Tokyo': 9,
  'Asia/Seoul': 9,
  'Asia/Singapore': 8,
  'UTC': 0,
}

export function getTimezoneOffsetHours(timezone?: string): number {
  if (!timezone) return TIMEZONE_OFFSETS[DEFAULT_TIMEZONE]
  return TIMEZONE_OFFSETS[timezone] ?? TIMEZONE_OFFSETS[DEFAULT_TIMEZONE]
}

export function getLongitudeByCity(city?: string): number | null {
  if (!city) return null
  return TAIWAN_CITY_LONGITUDES[city] ?? null
}

export const TAIWAN_CITY_OPTIONS = Object.keys(TAIWAN_CITY_LONGITUDES)
