declare module '@nestjs/common' {
  export function Injectable(): ClassDecorator;
  export class BadRequestException extends Error {}
  export class UnauthorizedException extends Error {}
}