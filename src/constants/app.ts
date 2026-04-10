export const APP_NAME = 'PayPair';

export function makePageTitle(page?: string): string {
  return page ? `${APP_NAME} | ${page}` : APP_NAME;
}
