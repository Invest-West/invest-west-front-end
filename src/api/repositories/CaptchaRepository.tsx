import Api, { ApiRoutes } from '../Api';

export default class CaptchaRepository {
    /**
     * Validate captcha token
     *
     * @param captchaToken
     */
    public async validateCaptchaToken(captchaToken: string) {
      return await new Api().request('post', ApiRoutes.validateCaptcha, {
        requestBody: { captchaToken },
        queryParameters: {},
      });
    }
  }

export {};
